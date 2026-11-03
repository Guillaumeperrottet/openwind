"""Local, reproducible Zurich cross-station temperature experiment.

No application imports, credentials, DB writes or production activation.
Fetch once with --fetch; subsequent runs use the compact, attributed snapshot.
"""
from __future__ import annotations

import argparse
import bisect
import collections
import datetime as dt
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import statistics
import time
import urllib.error
import urllib.parse
import urllib.request

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
PROTOCOL = HERE / "protocol.json"
DEFAULT_DATA = ROOT / "docs/data/zurich-water-pilot-2026-11-03.json"
DEFAULT_RESULT = ROOT / "docs/data/zurich-water-pilot-results-2026-11-03.json"
UA = "Openwind/1.0 (https://www.openwind.ch; hello@openwind.ch)"


def timestamp(value):
    date = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if date.tzinfo is None:
        raise ValueError("Ambiguous timestamp without UTC offset")
    return int(date.timestamp())


def iso(value):
    return dt.datetime.fromtimestamp(value, dt.timezone.utc).isoformat().replace("+00:00", "Z")


def finite(value):
    return isinstance(value, (float, int)) and not isinstance(value, bool) and math.isfinite(value)


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n")


class Fetcher:
    """Serial requests, immutable compressed cache, manifest and bounded retries."""
    def __init__(self, cache):
        self.cache = cache
        cache.mkdir(parents=True, exist_ok=True)
        self.manifest = []

    def get(self, url):
        key = hashlib.sha256(url.encode()).hexdigest()
        path = self.cache / (key + ".json.gz")
        meta = self.cache / (key + ".meta.json")
        if path.exists() and meta.exists():
            body = gzip.decompress(path.read_bytes())
            record = json.loads(meta.read_text())
            if hashlib.sha256(body).hexdigest() != record["sha256"]:
                raise ValueError("Cache integrity failure: " + str(path))
        else:
            for attempt in range(3):
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
                    with urllib.request.urlopen(req, timeout=60) as response:
                        body = response.read()
                    break
                except urllib.error.HTTPError as error:
                    if error.code == 429:
                        raise RuntimeError("Rate limited; stop. Retry-After: " + str(error.headers.get("Retry-After"))) from error
                    if attempt == 2 or error.code not in (502, 503, 504):
                        raise
                    time.sleep(2 ** (attempt + 1))
            record = {"url": url, "retrieved_at": iso(time.time()), "sha256": hashlib.sha256(body).hexdigest()}
            # Validate JSON before persisting. A partial response never becomes a cache hit.
            json.loads(body)
            path.write_bytes(gzip.compress(body, mtime=0))
            write_json(meta, record)
            time.sleep(0.8)
        self.manifest.append(record)
        print("Read", url, flush=True)
        return json.loads(body)


def observations(rows, station, start, end, protocol):
    kept, counts, conflicts = {}, collections.Counter(), set()
    low, high = protocol["observation_range_c"]
    for row in rows:
        counts["downloaded"] += 1
        if row.get("station") != station:
            raise ValueError("Unexpected station in response")
        try:
            t = timestamp(row["timestamp"])
        except (ValueError, KeyError, TypeError):
            counts["invalid_timestamp"] += 1
            continue
        if not start <= t < end:
            counts["outside_window"] += 1
            continue
        water = row.get("values", {}).get("water_temperature", {})
        value = water.get("value")
        if water.get("status") != protocol["observation_status"]:
            counts["bad_status"] += 1
            continue
        if water.get("unit") != "°C":
            raise ValueError("Unexpected sensor unit")
        if not finite(value) or not low <= value <= high:
            counts["invalid_temperature"] += 1
            continue
        if t in kept:
            counts["duplicate"] += 1
            if kept[t] != value:
                conflicts.add(t)
            continue
        kept[t] = value
    for t in conflicts:
        del kept[t]
    counts["conflicting_timestamps_removed"] = len(conflicts)
    counts["accepted"] = len(kept)
    counts["expected_10min_slots"] = (end - start) // 600
    counts["missing_10min_slots"] = counts["expected_10min_slots"] - len(kept)
    return sorted(kept.items()), dict(counts)


def model_response(response, requested_depth, protocol):
    depth = response["depth"]
    distance = response["distance"]
    temp = response["variables"]["temperature"]
    if depth["unit"] != "m" or distance["unit"] != "m" or temp["unit"] != "degC":
        raise ValueError("Unexpected model units")
    actual_depth = depth["data"]
    if not finite(actual_depth) or abs(actual_depth - requested_depth) > 0.02:
        raise ValueError("API returned unexpected nearest vertical level")
    if not finite(distance["data"]) or not 0 <= distance["data"] <= protocol["max_grid_distance_m"]:
        raise ValueError("Model grid too far from station")
    if len(response["time"]) != len(temp["data"]):
        raise ValueError("Model time/value lengths differ")
    grid = {"latitude": response["lat"], "longitude": response["lng"], "distance_m": distance["data"], "depth_m": actual_depth}
    series = {}
    for t, v in zip(response["time"], temp["data"]):
        if finite(v) and 0 <= v <= 35:
            key = timestamp(t)
            if key in series and series[key] != v:
                raise ValueError("Conflicting model timestamp")
            series[key] = v
    return series, grid


def vertical_at_one_m(low, high, low_grid, high_grid, target=1):
    for key in ("latitude", "longitude"):
        if low_grid[key] != high_grid[key]:
            raise ValueError("Different horizontal cells for vertical levels")
    a, b = low_grid["depth_m"], high_grid["depth_m"]
    if not a <= target <= b or a == b:
        raise ValueError("Cannot interpolate or extrapolate vertical levels")
    fraction = (target - a) / (b - a)
    return sorted((t, low[t] + fraction * (high[t] - low[t])) for t in low.keys() & high.keys())


def fetch_snapshot(protocol, cache):
    from pyproj import Transformer
    fetcher = Fetcher(cache)
    start, end = timestamp(protocol["start"]), timestamp(protocol["end_exclusive"])
    snapshot = {
        "protocol": protocol,
        "protocol_sha256": hashlib.sha256(PROTOCOL.read_bytes()).hexdigest(),
        "attribution": {
            "observations": "Wasserschutzpolizei / Stadt Zürich, CC0; API Tecdottir by Stefan Oderbolz",
            "model": "Alplakes / Eawag, CC BY 4.0, MITgcm Zurich; Openwind vertical interpolation to 1 m",
            "licence": "https://creativecommons.org/licenses/by/4.0/",
            "city_source": "https://data.stadt-zuerich.ch/dataset/sid_wapo_wetterstationen"
        },
        "stations": {}
    }
    metadata = fetcher.get(f'https://alplakes-api.eawag.ch/simulations/metadata/{protocol["model"]}/{protocol["lake"]}')
    snapshot["model_metadata"] = metadata
    for station, location in protocol["stations"].items():
        transform = Transformer.from_crs(location["utm_epsg"], 4326, always_xy=True)
        lon, lat = transform.transform(location["easting"], location["northing"])
        rows, offset = [], 0
        while True:
            # Date-only API filters need not describe midnight UTC. Pad both edges,
            # then enforce the exact UTC experiment interval in observations().
            query = urllib.parse.urlencode({"startDate": iso(start - 86400)[:10], "endDate": iso(end + 86400)[:10], "sort": "timestamp_utc asc", "limit": 1000, "offset": offset})
            response = fetcher.get(f"https://tecdottir.metaodi.ch/measurements/{station}?{query}")
            if response.get("ok") is not True or not isinstance(response.get("result"), list):
                raise ValueError("Sensor API failed")
            page = response["result"]
            rows.extend(page)
            offset += len(page)
            if offset >= response["total_count"]:
                break
            if not page:
                raise ValueError("Incomplete pagination")
        obs, quality = observations(rows, station, start, end, protocol)
        levels, grids = [], []
        for depth in protocol["model_depths_m"]:
            combined, grid = {}, None
            for a in range(start, end, 7 * 86400):
                b = min(end, a + 7 * 86400)
                fmt = lambda value: dt.datetime.fromtimestamp(value, dt.timezone.utc).strftime("%Y%m%d%H%M")
                url = f'https://alplakes-api.eawag.ch/simulations/point/{protocol["model"]}/{protocol["lake"]}/{fmt(a)}/{fmt(b)}/{depth}/{lat:.7f}/{lon:.7f}?variables=temperature'
                raw = fetcher.get(url)
                series, new_grid = model_response(raw, depth, protocol)
                if grid is not None and grid != new_grid:
                    raise ValueError("Model grid changed between chunks")
                grid = new_grid
                for t, v in series.items():
                    if t in combined and combined[t] != v:
                        raise ValueError("Model changed at chunk boundary")
                    combined[t] = v
            levels.append(combined)
            grids.append(grid)
        model = [(t, v) for t, v in vertical_at_one_m(*levels, *grids, protocol["target_depth_m"]) if start <= t < end]
        snapshot["stations"][station] = {"location": {"latitude": lat, "longitude": lon, **location}, "model_grid": grids, "quality": quality, "observations": obs, "model": model}
    snapshot["requests"] = fetcher.manifest
    snapshot["download_completed_at"] = iso(time.time())
    return snapshot


def aligned_observation(series, t, tolerance):
    index = bisect.bisect_left(series, t, key=lambda point: point[0])
    candidates = series[max(0, index - 1):index + 1]
    if not candidates:
        return None
    nearest = min(candidates, key=lambda point: (abs(point[0] - t), point[0]))
    return nearest if abs(nearest[0] - t) <= tolerance else None


def build_pairs(snapshot, lag_minutes):
    """Each target excludes its own sensor from correction inputs at every time."""
    p = snapshot["protocol"]
    start, end = timestamp(p["start"]), timestamp(p["end_exclusive"])
    tolerance = p["observation_match_tolerance_seconds"]
    lag, maximum_age = lag_minutes * 60, p["max_residual_age_minutes"] * 60
    stations = snapshot["stations"]
    if len(stations) != 2:
        raise ValueError("This pilot requires exactly two different stations")
    rows, coverage = [], {}
    for target, data in stations.items():
        source = next(s for s in stations if s != target)
        other = stations[source]
        residuals = []
        for t, model in other["model"]:
            obs = aligned_observation(other["observations"], t, tolerance)
            if obs:
                # Both the sensor's timestamp and the model validity must precede cutoff.
                residuals.append((max(t, obs[0]), t, obs[0], obs[1] - model))
        residuals.sort()
        availability = [r[0] for r in residuals]
        counts = collections.Counter()
        times = [t for t, _ in data["model"]]
        steps = collections.Counter(b - a for a, b in zip(times, times[1:]) if b > a)
        if not steps:
            raise ValueError("Insufficient model timestamps")
        cadence = steps.most_common(1)[0][0]
        if cadence != 3 * 3600:
            raise ValueError("Unexpected native model cadence; review protocol before scoring")
        split = timestamp(p["holdout_start"])
        counts["development_expected_native_slots"] = (split - start) // cadence
        counts["holdout_expected_native_slots"] = (end - split) // cadence
        for t, model in data["model"]:
            if not start <= t < end:
                continue
            period = "development" if t < timestamp(p["holdout_start"]) else "holdout"
            counts[period + "_model_slots"] += 1
            obs = aligned_observation(data["observations"], t, tolerance)
            if obs is None:
                counts[period + "_missing_target"] += 1
                continue
            i = bisect.bisect_right(availability, t - lag) - 1
            if i < 0 or t - min(residuals[i][1:3]) > maximum_age:
                counts[period + "_missing_or_stale_source"] += 1
                continue
            _, source_time, source_obs_time, residual = residuals[i]
            counts[period + "_paired"] += 1
            rows.append({"station": target, "source_station": source, "time": t, "observation_time": obs[0], "observed": obs[1], "model": model, "source_model_time": source_time, "source_observation_time": source_obs_time, "source_residual": residual, "period": period})
        coverage[target] = dict(counts)
    return sorted(rows, key=lambda row: (row["time"], row["station"])), coverage


def metrics(rows, prediction):
    import numpy as np
    if not rows:
        raise ValueError("No paired observations to evaluate")
    error = np.array([prediction(r) - r["observed"] for r in rows])
    return {"n": len(rows), "mae_c": float(np.mean(abs(error))), "rmse_c": float(np.sqrt(np.mean(error ** 2))), "bias_c": float(np.mean(error)), "p90_abs_error_c": float(np.quantile(abs(error), .9))}


def select_alpha(rows, candidates):
    development = [r for r in rows if r["period"] == "development"]
    scores = {a: metrics(development, lambda r: r["model"] + a * r["source_residual"])["mae_c"] for a in sorted(candidates)}
    return min(scores, key=scores.get), scores


def daily_bootstrap(rows, alpha):
    """Paired day blocks, same sampled dates for both stations, conditional CI."""
    import numpy as np
    days = collections.defaultdict(list)
    for r in rows:
        days[iso(r["time"])[:10]].append(abs(r["model"] - r["observed"]) - abs(r["model"] + alpha * r["source_residual"] - r["observed"]))
    if len(days) < 2:
        raise ValueError("Need at least two day blocks")
    ordered = sorted(days)
    sums = np.array([sum(days[d]) for d in ordered])
    counts = np.array([len(days[d]) for d in ordered])
    rng = np.random.default_rng(20261103)
    indices = rng.integers(0, len(ordered), size=(10000, len(ordered)))
    gains = sums[indices].sum(axis=1) / counts[indices].sum(axis=1)
    return {"day_blocks": len(days), "replicates": 10000, "seed": 20261103, "mae_gain_c": float(sum(sums) / sum(counts)), "mae_gain_95_ci_c": np.quantile(gains, [.025, .975]).tolist(), "daily": [{"date_utc": d, "n": len(days[d]), "mae_gain_c": sum(days[d]) / len(days[d])} for d in ordered]}


def evaluate(rows, coverage, alpha):
    holdout = [r for r in rows if r["period"] == "holdout"]
    development = [r for r in rows if r["period"] == "development"]
    # Median residual is the constant offset that minimises development MAE.
    biases = {s: statistics.median(r["observed"] - r["model"] for r in development if r["station"] == s) for s in coverage}
    result = {"lag_minutes_assumed": None, "development_constant_bias_c": biases, "coverage": coverage, "stations": {}}
    for label, subset in [(s, [r for r in holdout if r["station"] == s]) for s in coverage] + [("pooled", holdout)]:
        raw = metrics(subset, lambda r: r["model"])
        corrected = metrics(subset, lambda r: r["model"] + alpha * r["source_residual"])
        static = metrics(subset, lambda r: r["model"] + biases[r["station"]])
        entry = {"raw": raw, "corrected": corrected, "constant_bias_baseline": static, "mae_reduction_percent": 100 * (raw["mae_c"] - corrected["mae_c"]) / raw["mae_c"], "uncertainty": daily_bootstrap(subset, alpha)}
        if label == "pooled":
            result["pooled"] = entry
        else:
            result["stations"][label] = entry
    ages = [r["time"] - r["source_observation_time"] for r in holdout]
    result["actual_source_age_minutes"] = {"min": min(ages) / 60, "max": max(ages) / 60}
    result["all_inputs_causal"] = all(r["source_observation_time"] <= r["time"] and r["source_model_time"] <= r["time"] and r["source_station"] != r["station"] for r in rows)
    return result


def analyse(snapshot):
    p = snapshot["protocol"]
    rows, coverage = build_pairs(snapshot, p["availability_lag_minutes_assumed"])
    alpha, scores = select_alpha(rows, p["alpha_candidates"])
    primary = evaluate(rows, coverage, alpha)
    primary["lag_minutes_assumed"] = p["availability_lag_minutes_assumed"]
    rule = p["success_rule"]
    conditions = {
        "pooled_mae_reduction": primary["pooled"]["mae_reduction_percent"] >= rule["minimum_pooled_mae_reduction_percent"],
        "pooled_gain_ci_positive": primary["pooled"]["uncertainty"]["mae_gain_95_ci_c"][0] > 0,
        "neither_station_worse": all(v["corrected"]["mae_c"] <= v["raw"]["mae_c"] for v in primary["stations"].values()),
        "enough_days": all(v["uncertainty"]["day_blocks"] >= rule["minimum_holdout_days"] for v in primary["stations"].values()),
        "coverage": all(c.get("holdout_paired", 0) / c["holdout_expected_native_slots"] >= rule["minimum_paired_coverage_of_possible_native_slots"] for c in coverage.values())
    }
    sensitivities = []
    for lag in p["sensitivity_lags_minutes"]:
        other_rows, other_coverage = build_pairs(snapshot, lag)
        sensitivity = evaluate(other_rows, other_coverage, alpha)
        sensitivity["lag_minutes_assumed"] = lag
        sensitivities.append(sensitivity)
    result = {"protocol_sha256": snapshot["protocol_sha256"], "snapshot_sha256": hashlib.sha256(json.dumps(snapshot, sort_keys=True, ensure_ascii=False).encode()).hexdigest(), "alpha": alpha, "development_alpha_mae_c": scores, "primary": primary, "sensitivity_frozen_alpha": sensitivities, "success_conditions": conditions, "pilot_passes_predeclared_rule": all(conditions.values()), "production_enabled": False}
    return result, rows


def plot(rows, result, output):
    os.environ.setdefault("MPLCONFIGDIR", "/tmp/openwind-zurich-matplotlib")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    stations = list(result["primary"]["stations"])
    fig, axes = plt.subplots(3, 1, figsize=(12, 10), layout="constrained")
    colours = {"observed": "#172b45", "model": "#c27924", "corrected": "#00847d"}
    for ax, station in zip(axes, stations):
        data = [r for r in rows if r["station"] == station and r["period"] == "holdout"]
        dates, observed, models, corrected = [], [], [], []
        for index, row in enumerate(data):
            # NaN breaks the curve across outages without masking grid/legend.
            if index and row["time"] - data[index - 1]["time"] > 4 * 3600:
                dates.append(dt.datetime.fromtimestamp(row["time"] - 1, dt.timezone.utc))
                observed.append(math.nan)
                models.append(math.nan)
                corrected.append(math.nan)
            dates.append(dt.datetime.fromtimestamp(row["time"], dt.timezone.utc))
            observed.append(row["observed"])
            models.append(row["model"])
            corrected.append(row["model"] + result["alpha"] * row["source_residual"])
        ax.plot(dates, observed, label="Sonde évaluée", color=colours["observed"], lw=2)
        ax.plot(dates, models, label="Alplakes MITgcm à 1 m", color=colours["model"], lw=1.6)
        ax.plot(dates, corrected, label="Correction avec l’autre sonde", color=colours["corrected"], lw=1.6)
        score = result["primary"]["stations"][station]
        ax.set_title(f'{station.capitalize()} — erreur moyenne absolue : {score["raw"]["mae_c"]:.2f} → {score["corrected"]["mae_c"]:.2f} °C', loc="left", fontweight="bold")
        ax.set_ylabel("Température (°C)")
        ax.grid(alpha=.18)
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m", tz=dt.timezone.utc))
        ax.legend(loc="best", frameon=False, ncol=3, fontsize=9)
    ax = axes[2]
    daily = result["primary"]["pooled"]["uncertainty"]["daily"]
    gains = [d["mae_gain_c"] for d in daily]
    ax.bar([d["date_utc"][5:] for d in daily], gains, color=[colours["corrected"] if g >= 0 else "#c94747" for g in gains])
    ax.axhline(0, color="#172b45", lw=1)
    ax.set_ylabel("Gain de MAE (°C)")
    ax.set_title("Gain quotidien sur les deux stations — au-dessus de zéro, la correction aide", loc="left", fontweight="bold")
    ax.tick_params(axis="x", labelrotation=35)
    ax.grid(axis="y", alpha=.18)
    fig.suptitle("Lac de Zurich · validation du 20 octobre au 2 novembre 2026 (UTC)", fontsize=16, fontweight="bold")
    fig.supxlabel("Comparaison rétrospective · Données : Ville de Zurich (CC0), Alplakes / Eawag (CC BY 4.0) · Calculs Openwind", fontsize=9)
    output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output, dpi=160)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch", action="store_true", help="Explicitly allow public API reads, otherwise fully offline")
    parser.add_argument("--cache", type=Path, default=Path("/tmp/openwind-zurich-pilot-cache"))
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--result", type=Path, default=DEFAULT_RESULT)
    parser.add_argument("--plot", type=Path)
    args = parser.parse_args()
    protocol = json.loads(PROTOCOL.read_text())
    if args.fetch:
        snapshot = fetch_snapshot(protocol, args.cache)
        write_json(args.data, snapshot)
    else:
        snapshot = json.loads(args.data.read_text())
    if snapshot["protocol"] != protocol or snapshot["protocol_sha256"] != hashlib.sha256(PROTOCOL.read_bytes()).hexdigest():
        raise ValueError("Protocol differs from downloaded snapshot; never silently retune a holdout")
    result, rows = analyse(snapshot)
    write_json(args.result, result)
    if args.plot:
        plot(rows, result, args.plot)
    print(json.dumps({"alpha": result["alpha"], "holdout": result["primary"]["pooled"], "passes": result["pilot_passes_predeclared_rule"]}, indent=2))


if __name__ == "__main__":
    main()
