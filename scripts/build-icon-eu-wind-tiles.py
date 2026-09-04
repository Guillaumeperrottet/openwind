#!/usr/bin/env python3
"""Build compact Openwind wind tiles from the official DWD ICON-EU feed."""

from __future__ import annotations

import argparse
import bz2
import hashlib
import json
import math
import os
import re
import shutil
import struct
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

try:
    import numpy as np
    from eccodes import (
        codes_get,
        codes_get_array,
        codes_get_values,
        codes_grib_new_from_file,
        codes_release,
    )
except ImportError as error:
    print(
        "Missing Python dependencies. Run: "
        "python3 -m pip install -r scripts/requirements-wind.txt",
        file=sys.stderr,
    )
    raise SystemExit(2) from error


DWD_BASE_URL = "https://opendata.dwd.de/weather/nwp/icon-eu/grib"
VARIABLES = {
    "u": ("u_10m", "U_10M"),
    "v": ("v_10m", "V_10M"),
    "gust": ("vmax_10m", "VMAX_10M"),
}
MODEL_ID = "dwd_icon_eu"
MAGIC = b"OWW1"
VERSION = 1
FLAG_GUSTS = 1
MISSING_VALUE = -32768
DEFAULT_SCALE_MPS = 0.01
RUN_HOURS = tuple(range(0, 24, 3))
FILE_PATTERN = re.compile(
    r"icon-eu_europe_regular-lat-lon_single-level_"
    r"(?P<run>\d{10})_(?P<lead>\d{3})_(?P<variable>[A-Z0-9_]+)\.grib2\.bz2"
)


@dataclass(frozen=True)
class ForecastAsset:
    run_id: str
    lead_hours: int
    variable: str
    url: str

    @property
    def reference_at(self) -> datetime:
        return datetime.strptime(self.run_id, "%Y%m%d%H").replace(
            tzinfo=timezone.utc
        )

    @property
    def valid_at(self) -> datetime:
        return self.reference_at + timedelta(hours=self.lead_hours)


@dataclass(frozen=True)
class GridMetadata:
    columns: int
    rows: int
    west: float
    south: float
    east: float
    north: float
    longitude_step: float
    latitude_step: float
    reference_at: datetime
    valid_at: datetime


def isoformat(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )


def fetch_bytes(url: str, attempts: int = 3) -> bytes:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = Request(url, headers={"User-Agent": "Openwind wind tile builder/1"})
            with urlopen(request, timeout=30) as response:
                return response.read()
        except (HTTPError, URLError, TimeoutError) as error:
            last_error = error
            if attempt + 1 < attempts:
                time.sleep(0.5 * (2**attempt))
    raise RuntimeError(f"Could not download {url}: {last_error}")


def list_assets(run_hour: int, variable_key: str) -> list[ForecastAsset]:
    folder, expected_variable = VARIABLES[variable_key]
    base_url = f"{DWD_BASE_URL}/{run_hour:02d}/{folder}"
    listing = fetch_bytes(f"{base_url}/").decode("utf-8", "replace")
    assets: list[ForecastAsset] = []
    for match in FILE_PATTERN.finditer(listing):
        if match.group("variable") != expected_variable:
            continue
        filename = match.group(0)
        assets.append(
            ForecastAsset(
                run_id=match.group("run"),
                lead_hours=int(match.group("lead")),
                variable=variable_key,
                url=f"{base_url}/{filename}",
            )
        )
    return assets


def select_assets(
    requested_run: str | None,
    requested_lead: int | None,
    now: datetime,
) -> dict[str, ForecastAsset]:
    run_hours = (
        [int(requested_run[-2:])] if requested_run is not None else list(RUN_HOURS)
    )
    by_variable: dict[str, list[ForecastAsset]] = {key: [] for key in VARIABLES}
    jobs = [(run_hour, key) for run_hour in run_hours for key in VARIABLES]
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(list_assets, run_hour, key): (run_hour, key)
            for run_hour, key in jobs
        }
        for future in as_completed(futures):
            _, key = futures[future]
            by_variable[key].extend(future.result())

    available = {
        (asset.run_id, asset.lead_hours) for asset in by_variable["u"]
    }
    for key in ("v", "gust"):
        available &= {
            (asset.run_id, asset.lead_hours) for asset in by_variable[key]
        }
    if requested_run is not None:
        available = {item for item in available if item[0] == requested_run}
    if requested_lead is not None:
        available = {item for item in available if item[1] == requested_lead}

    def candidate_score(item: tuple[str, int]) -> tuple[float, float]:
        run_id, lead_hours = item
        reference = datetime.strptime(run_id, "%Y%m%d%H").replace(
            tzinfo=timezone.utc
        )
        valid = reference + timedelta(hours=lead_hours)
        return (abs((valid - now).total_seconds()), -reference.timestamp())

    if available:
        run_id, lead_hours = min(available, key=candidate_score)
        return {
            key: next(
                asset
                for asset in assets
                if asset.run_id == run_id and asset.lead_hours == lead_hours
            )
            for key, assets in by_variable.items()
        }

    selection = requested_run or "latest"
    if requested_lead is not None:
        selection += f" +{requested_lead}h"
    raise RuntimeError(f"No complete ICON-EU U/V/gust set found for {selection}")


def download_asset(asset: ForecastAsset, cache_directory: Path) -> Path:
    cache_directory.mkdir(parents=True, exist_ok=True)
    compressed_name = asset.url.rsplit("/", 1)[-1]
    compressed_path = cache_directory / compressed_name
    grib_path = cache_directory / compressed_name.removesuffix(".bz2")
    if not compressed_path.exists():
        payload = fetch_bytes(asset.url)
        temporary_path = compressed_path.with_suffix(compressed_path.suffix + ".tmp")
        temporary_path.write_bytes(payload)
        os.replace(temporary_path, compressed_path)
    if not grib_path.exists():
        payload = bz2.decompress(compressed_path.read_bytes())
        temporary_path = grib_path.with_suffix(grib_path.suffix + ".tmp")
        temporary_path.write_bytes(payload)
        os.replace(temporary_path, grib_path)
    return grib_path


def grib_datetime(handle: int, prefix: str) -> datetime:
    date_value = int(codes_get(handle, f"{prefix}Date"))
    time_value = int(codes_get(handle, f"{prefix}Time"))
    return datetime.strptime(
        f"{date_value:08d}{time_value:04d}", "%Y%m%d%H%M"
    ).replace(tzinfo=timezone.utc)


def read_grib(path: Path, include_coordinates: bool) -> tuple[np.ndarray, GridMetadata]:
    with path.open("rb") as stream:
        handle = codes_grib_new_from_file(stream)
        if handle is None:
            raise RuntimeError(f"No GRIB message found in {path}")
        try:
            grid_type = str(codes_get(handle, "gridType"))
            if grid_type != "regular_ll":
                raise RuntimeError(f"Unsupported ICON-EU grid: {grid_type}")
            columns = int(codes_get(handle, "Ni"))
            rows = int(codes_get(handle, "Nj"))
            values = np.asarray(codes_get_values(handle), dtype=np.float32).reshape(
                rows, columns
            )
            if include_coordinates:
                latitudes = np.asarray(codes_get_array(handle, "latitudes")).reshape(
                    rows, columns
                )
                longitudes = np.asarray(codes_get_array(handle, "longitudes")).reshape(
                    rows, columns
                )
                longitudes = np.where(longitudes > 180, longitudes - 360, longitudes)
                if longitudes[0, 0] > longitudes[0, -1]:
                    values = values[:, ::-1]
                    longitudes = longitudes[:, ::-1]
                    latitudes = latitudes[:, ::-1]
                if latitudes[0, 0] < latitudes[-1, 0]:
                    values = values[::-1, :]
                    longitudes = longitudes[::-1, :]
                    latitudes = latitudes[::-1, :]
                west = float(longitudes[0, 0])
                east = float(longitudes[0, -1])
                north = float(latitudes[0, 0])
                south = float(latitudes[-1, 0])
            else:
                first_latitude = float(
                    codes_get(handle, "latitudeOfFirstGridPointInDegrees")
                )
                last_latitude = float(
                    codes_get(handle, "latitudeOfLastGridPointInDegrees")
                )
                first_longitude = float(
                    codes_get(handle, "longitudeOfFirstGridPointInDegrees")
                )
                last_longitude = float(
                    codes_get(handle, "longitudeOfLastGridPointInDegrees")
                )
                first_longitude = (
                    first_longitude - 360 if first_longitude > 180 else first_longitude
                )
                last_longitude = (
                    last_longitude - 360 if last_longitude > 180 else last_longitude
                )
                west, east = sorted((first_longitude, last_longitude))
                south, north = sorted((first_latitude, last_latitude))
                if int(codes_get(handle, "iScansNegatively")):
                    values = values[:, ::-1]
                if int(codes_get(handle, "jScansPositively")):
                    values = values[::-1, :]

            longitude_step = (east - west) / (columns - 1)
            latitude_step = (north - south) / (rows - 1)
            metadata = GridMetadata(
                columns=columns,
                rows=rows,
                west=west,
                south=south,
                east=east,
                north=north,
                longitude_step=longitude_step,
                latitude_step=latitude_step,
                reference_at=grib_datetime(handle, "data"),
                valid_at=grib_datetime(handle, "validity"),
            )
            return values, metadata
        finally:
            codes_release(handle)


def validate_matching_grids(grids: dict[str, GridMetadata]) -> GridMetadata:
    reference = grids["u"]
    for variable, grid in grids.items():
        if grid != reference:
            raise RuntimeError(f"{variable} does not match the U10 ICON-EU grid")
    return reference


def quantize(values: np.ndarray, scale_mps: float) -> np.ndarray:
    missing = ~np.isfinite(values)
    scaled = np.rint(np.nan_to_num(values, nan=0.0) / scale_mps)
    scaled = np.clip(scaled, -32767, 32767).astype("<i2")
    scaled[missing] = MISSING_VALUE
    return scaled


def write_tiles(
    output_directory: Path,
    arrays: dict[str, np.ndarray],
    grid: GridMetadata,
    tile_size: int,
    scale_mps: float,
) -> tuple[int, int, int, int]:
    tile_columns = math.ceil(grid.columns / tile_size)
    tile_rows = math.ceil(grid.rows / tile_size)
    tile_count = 0
    byte_count = 0
    speed = np.hypot(arrays["u"], arrays["v"])
    arrays["gust"] = np.maximum(arrays["gust"], speed)

    for tile_y in range(tile_rows):
        row_start = tile_y * tile_size
        row_end = min(grid.rows, row_start + tile_size)
        for tile_x in range(tile_columns):
            column_start = tile_x * tile_size
            column_end = min(grid.columns, column_start + tile_size)
            height = row_end - row_start
            width = column_end - column_start
            interleaved = np.empty((height, width, 3), dtype="<i2")
            for channel, variable in enumerate(("u", "v", "gust")):
                interleaved[:, :, channel] = quantize(
                    arrays[variable][row_start:row_end, column_start:column_end],
                    scale_mps,
                )

            west = grid.west + column_start * grid.longitude_step
            north = grid.north - row_start * grid.latitude_step
            header = struct.pack(
                "<4sBBHHHfffff",
                MAGIC,
                VERSION,
                FLAG_GUSTS,
                width,
                height,
                0,
                west,
                north,
                grid.longitude_step,
                grid.latitude_step,
                scale_mps,
            )
            tile_directory = output_directory / str(tile_x)
            tile_directory.mkdir(parents=True, exist_ok=True)
            tile_path = tile_directory / f"{tile_y}.oww"
            with tile_path.open("wb") as stream:
                stream.write(header)
                stream.write(interleaved.tobytes(order="C"))
            tile_count += 1
            byte_count += tile_path.stat().st_size

    return tile_columns, tile_rows, tile_count, byte_count


def validate_tiles(
    output_directory: Path,
    arrays: dict[str, np.ndarray],
    grid: GridMetadata,
    tile_size: int,
    scale_mps: float,
) -> float:
    """Read every emitted cell back before the atomic manifest switch."""
    maximum_error = 0.0
    tile_columns = math.ceil(grid.columns / tile_size)
    tile_rows = math.ceil(grid.rows / tile_size)
    header_size = struct.calcsize("<4sBBHHHfffff")

    for tile_y in range(tile_rows):
        row_start = tile_y * tile_size
        row_end = min(grid.rows, row_start + tile_size)
        for tile_x in range(tile_columns):
            column_start = tile_x * tile_size
            column_end = min(grid.columns, column_start + tile_size)
            tile_path = output_directory / str(tile_x) / f"{tile_y}.oww"
            payload = tile_path.read_bytes()
            header = struct.unpack("<4sBBHHHfffff", payload[:header_size])
            magic, version, flags, width, height, _, west, north, dx, dy, scale = (
                header
            )
            expected_width = column_end - column_start
            expected_height = row_end - row_start
            expected_west = grid.west + column_start * grid.longitude_step
            expected_north = grid.north - row_start * grid.latitude_step
            if (
                magic != MAGIC
                or version != VERSION
                or flags != FLAG_GUSTS
                or width != expected_width
                or height != expected_height
                or not math.isclose(west, expected_west, abs_tol=1e-5)
                or not math.isclose(north, expected_north, abs_tol=1e-5)
                or not math.isclose(dx, grid.longitude_step, abs_tol=1e-7)
                or not math.isclose(dy, grid.latitude_step, abs_tol=1e-7)
                or not math.isclose(scale, scale_mps, abs_tol=1e-7)
            ):
                raise RuntimeError(f"Invalid generated tile header: {tile_path}")
            expected_bytes = header_size + width * height * 3 * 2
            if len(payload) != expected_bytes:
                raise RuntimeError(f"Invalid generated tile length: {tile_path}")

            decoded = (
                np.frombuffer(payload, dtype="<i2", offset=header_size)
                .reshape(height, width, 3)
                .astype(np.float32)
                * scale
            )
            for channel, variable in enumerate(("u", "v", "gust")):
                expected = arrays[variable][
                    row_start:row_end, column_start:column_end
                ]
                finite = np.isfinite(expected)
                if finite.any():
                    error = float(
                        np.max(np.abs(decoded[:, :, channel][finite] - expected[finite]))
                    )
                    maximum_error = max(maximum_error, error)

    if maximum_error > scale_mps / 2 + 1e-5:
        raise RuntimeError(
            f"Wind tile quantization error {maximum_error:.6f} m/s exceeds tolerance"
        )
    return maximum_error


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", help="ICON-EU run as YYYYMMDDHH (default: latest)")
    parser.add_argument("--lead-hours", type=int, help="Forecast lead time")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("public/wind-data"),
        help="Static output root",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path(".cache/wind-icon-eu"),
        help="GRIB download cache",
    )
    parser.add_argument("--tile-size", type=int, default=128)
    parser.add_argument("--scale-mps", type=float, default=DEFAULT_SCALE_MPS)
    parser.add_argument(
        "--public-base-url",
        default="/wind-data",
        help="Browser-visible base URL written to the manifest",
    )
    parser.add_argument("--force", action="store_true", help="Replace this run")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.run and not re.fullmatch(r"\d{10}", args.run):
        raise RuntimeError("--run must use YYYYMMDDHH")
    if args.lead_hours is not None and not 0 <= args.lead_hours <= 120:
        raise RuntimeError("--lead-hours must be between 0 and 120")
    if not 32 <= args.tile_size <= 512:
        raise RuntimeError("--tile-size must be between 32 and 512")
    if not 0 < args.scale_mps <= 0.1:
        raise RuntimeError("--scale-mps must be between 0 and 0.1")

    now = datetime.now(timezone.utc)
    assets = select_assets(args.run, args.lead_hours, now)
    selected = assets["u"]
    print(
        f"ICON-EU run {selected.run_id}, +{selected.lead_hours:03d}h "
        f"({isoformat(selected.valid_at)})"
    )
    paths = {
        key: download_asset(asset, args.cache_dir) for key, asset in assets.items()
    }

    arrays: dict[str, np.ndarray] = {}
    grids: dict[str, GridMetadata] = {}
    for index, (key, path) in enumerate(paths.items()):
        arrays[key], grids[key] = read_grib(path, include_coordinates=index == 0)
    grid = validate_matching_grids(grids)

    dataset_path = Path("runs") / selected.run_id / f"{selected.lead_hours:03d}"
    model_directory = args.output_dir / MODEL_ID
    final_directory = model_directory / dataset_path
    if final_directory.exists():
        if not args.force:
            raise RuntimeError(
                f"{final_directory} already exists; use --force to replace it"
            )
        shutil.rmtree(final_directory)
    final_directory.parent.mkdir(parents=True, exist_ok=True)
    temporary_directory = Path(
        tempfile.mkdtemp(prefix=".wind-build-", dir=final_directory.parent)
    )

    try:
        tile_columns, tile_rows, tile_count, byte_count = write_tiles(
            temporary_directory,
            arrays,
            grid,
            args.tile_size,
            args.scale_mps,
        )
        maximum_error = validate_tiles(
            temporary_directory,
            arrays,
            grid,
            args.tile_size,
            args.scale_mps,
        )
        os.replace(temporary_directory, final_directory)
    finally:
        if temporary_directory.exists():
            shutil.rmtree(temporary_directory)

    public_base = args.public_base_url.rstrip("/")
    tile_template = (
        f"{public_base}/{MODEL_ID}/{dataset_path.as_posix()}/{{x}}/{{y}}.oww"
    )
    generated_at = datetime.now(timezone.utc)
    manifest = {
        "schemaVersion": VERSION,
        "encoding": "oww1",
        "datasetId": f"{MODEL_ID}:{selected.run_id}:{selected.lead_hours:03d}",
        "runId": selected.run_id,
        "model": {
            "id": MODEL_ID,
            "label": "ICON-EU",
            "source": "DWD",
            "resolutionKm": 6.5,
        },
        "referenceAt": isoformat(grid.reference_at),
        "validAt": isoformat(grid.valid_at),
        "updatedAt": isoformat(generated_at),
        "stale": abs((generated_at - grid.valid_at).total_seconds()) > 6 * 3600,
        "gustsAvailable": True,
        "attribution": {
            "name": "Deutscher Wetterdienst (DWD)",
            "url": "https://www.dwd.de/DE/leistungen/opendata/opendata.html",
        },
        "grid": {
            "bounds": [grid.west, grid.south, grid.east, grid.north],
            "west": grid.west,
            "north": grid.north,
            "columns": grid.columns,
            "rows": grid.rows,
            "longitudeStep": grid.longitude_step,
            "latitudeStep": grid.latitude_step,
            "tileSize": args.tile_size,
            "tileColumns": tile_columns,
            "tileRows": tile_rows,
        },
        "tileUrlTemplate": tile_template,
        "source": {
            key: {"url": asset.url, "sha256": file_sha256(paths[key])}
            for key, asset in assets.items()
        },
    }
    model_directory.mkdir(parents=True, exist_ok=True)
    manifest_path = model_directory / "latest.json"
    temporary_manifest = model_directory / ".latest.json.tmp"
    temporary_manifest.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary_manifest, manifest_path)

    print(
        f"Wrote {tile_count} tiles ({byte_count / 1024 / 1024:.2f} MiB) "
        f"to {final_directory}"
    )
    print(f"Maximum round-trip error: {maximum_error:.6f} m/s")
    print(f"Published manifest {manifest_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, OSError, ValueError) as error:
        print(f"Wind tile build failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error
