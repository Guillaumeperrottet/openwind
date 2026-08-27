/**
 * Wind history — station measurements (DB + MeteoSwiss CSV + Pioupiou + Météo-France + Windball)
 * and 15-minute Open-Meteo history/forecast.
 */
import type { HistoryPoint } from "@/types";
import { prisma } from "@/lib/prisma";
import { fetchPioupiouHistory } from "@/lib/pioupiou";
import { fetchWindballHistory } from "@/lib/windball";
import { detectNetwork } from "@/lib/stationConstants";
import { getMeteoSwissHistory } from "@/lib/meteoswissWeather";

const BASE = "https://api.open-meteo.com/v1/forecast";

/**
 * Fetch 48h real station measurements (10-min).
 *
 * Strategy (fast → slow):
 *   1. Database (StationMeasurement) — populated by /api/cron/stations every 10 min, real-time
 *   2. MeteoSwiss OGD CSV (_now + _recent) — ~2h publication delay, fills older gaps
 *      OR Pioupiou Archive API for piou-* stations
 *
 * The two sources are merged and deduplicated by timestamp.
 */
export async function fetchWindHistoryStation(
  stationId: string,
): Promise<HistoryPoint[]> {
  const now = new Date();
  const cutoff = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2),
  );
  const network = detectNetwork(stationId);
  const isPioupiou = stationId.startsWith("piou-");
  const isWindball = stationId.startsWith("windball-");

  // For networks with a rich public API (Windball, Pioupiou), we bypass the
  // database entirely and trust ONLY what the balise returns. This ensures
  // that the chart's last bar and the popup/card header always read the
  // exact same measurement (same endpoint, same trame, same value).
  if (isPioupiou) {
    const piouId = parseInt(stationId.replace("piou-", ""), 10);
    const points = await fetchPioupiouHistory(piouId).catch(
      () => [] as HistoryPoint[],
    );
    const cutoffStr = cutoff.toISOString().slice(0, 16);
    return points
      .filter((p) => p.time >= cutoffStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }
  if (isWindball) {
    // The Windball API only returns the last ~60 measurements (~10h).
    // To extend the chart to a full 48h window, we complete the API trames
    // with older points stored in our DB by the cron job.
    //
    // Critical rule: never overlap the two sources on the same time window,
    // otherwise LoRa/cron timestamp drift produces "double bars" in the chart
    // (see commit history for the original bug). We keep the API as the
    // authoritative source for the recent window and use the DB ONLY for
    // points strictly older than the earliest API point.
    const cutoffStr = cutoff.toISOString().slice(0, 16);

    const apiPoints: HistoryPoint[] = (
      await fetchWindballHistory(stationId).catch(() => [])
    )
      .map((m) => ({
        time: new Date(m.updatedAt).toISOString().slice(0, 16),
        windSpeedKmh: m.windSpeed ?? 0,
        windDirection: m.windDir ?? 0,
        gustsKmh: m.windBurst ?? m.windSpeed ?? 0,
        temperatureC: m.temperature ?? 0,
      }))
      .filter((p) => p.time >= cutoffStr)
      .sort((a, b) => a.time.localeCompare(b.time));

    let dbOlderPoints: HistoryPoint[] = [];
    try {
      // Cap the DB window to whatever the API doesn't already cover.
      const apiOldest = apiPoints[0]?.time;
      const dbUpperBound = apiOldest ? new Date(apiOldest + ":00Z") : now;

      const rows = await prisma.stationMeasurement.findMany({
        where: {
          stationId,
          time: { gte: cutoff, lt: dbUpperBound },
        },
        orderBy: { time: "asc" },
      });
      dbOlderPoints = rows.map((r: (typeof rows)[number]) => ({
        time: r.time.toISOString().slice(0, 16),
        windSpeedKmh: r.windSpeedKmh,
        windDirection: r.windDirection,
        gustsKmh: r.gustsKmh ?? r.windSpeedKmh,
        temperatureC: r.temperatureC ?? 0,
      }));
    } catch {
      /* DB unavailable — return API points only */
    }

    return [...dbOlderPoints, ...apiPoints];
  }

  // Other networks (MeteoSwiss, Netatmo, Météo-France) don't expose a rich
  // public history API — we fall back to DB (populated by cron) + CSV
  // archive to fill the 48h window.

  // ── 1. Database (real-time, no delay) ──────────────────────────────────
  let dbPoints: HistoryPoint[] = [];
  try {
    const rows = await prisma.stationMeasurement.findMany({
      where: {
        stationId,
        time: { gte: cutoff },
      },
      orderBy: { time: "asc" },
    });
    dbPoints = rows.map((r: (typeof rows)[number]) => ({
      time: r.time.toISOString().slice(0, 16),
      windSpeedKmh: r.windSpeedKmh,
      windDirection: r.windDirection,
      gustsKmh: r.gustsKmh ?? r.windSpeedKmh,
      temperatureC: r.temperatureC ?? 0,
    }));
  } catch {
    /* DB unavailable — continue with archive sources */
  }

  // ── 2. Archive source (fills gaps before cron started) ────────────────
  let archivePoints: HistoryPoint[] = [];
  if (network === "meteoswiss") {
    try {
      const swissHistory = await getMeteoSwissHistory(stationId);
      archivePoints = swissHistory
        .filter(
          (point) =>
            point.windSpeedKmh !== null && point.windDirection !== null,
        )
        .map((point) => ({
          time: point.time.slice(0, 16),
          windSpeedKmh: point.windSpeedKmh!,
          windDirection: point.windDirection!,
          gustsKmh: point.gustsKmh ?? point.windSpeedKmh!,
          temperatureC: point.temperatureC ?? 0,
        }));
    } catch {
      /* MeteoSwiss archive unavailable — use DB only */
    }
  }

  // ── Merge & dedup ─────────────────────────────────────────────────────
  const seen = new Set<string>();
  const all = [...archivePoints, ...dbPoints]
    .filter((p) => {
      if (seen.has(p.time)) return false;
      seen.add(p.time);
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const cutoffStr = cutoff.toISOString().slice(0, 16);
  return all.filter((p) => p.time >= cutoffStr);
}

/**
 * Fetch 48-hour wind history at 15-minute resolution via Open-Meteo
 * `minutely_15` with `past_days=2`. Times are UTC ISO strings.
 * Cached for 10 minutes server-side.
 */
export async function fetchWindHistory(
  lat: number,
  lng: number,
): Promise<HistoryPoint[]> {
  const url = new URL(BASE);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set(
    "minutely_15",
    "wind_speed_10m,wind_gusts_10m,temperature_2m,wind_direction_10m",
  );
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("past_days", "2");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "UTC");

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Open-Meteo history error: ${res.status}`);

  const data = await res.json();
  const {
    time,
    wind_speed_10m,
    wind_gusts_10m,
    temperature_2m,
    wind_direction_10m,
  } = data.minutely_15 as {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    temperature_2m: number[];
    wind_direction_10m: number[];
  };

  return time.map((t, i) => ({
    time: t,
    windSpeedKmh: wind_speed_10m[i] ?? 0,
    windDirection: wind_direction_10m[i] ?? 0,
    gustsKmh: wind_gusts_10m[i] ?? 0,
    temperatureC: temperature_2m[i] ?? 0,
  }));
}

/**
 * Fetch near-future 15-minute wind forecast via Open-Meteo.
 * Returns HistoryPoint[] for the next ~24h at 15-min resolution.
 */
export async function fetchWindForecast15min(
  lat: number,
  lng: number,
): Promise<HistoryPoint[]> {
  const url = new URL(BASE);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set(
    "minutely_15",
    "wind_speed_10m,wind_gusts_10m,temperature_2m,wind_direction_10m",
  );
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("past_days", "0");
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "UTC");

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Open-Meteo forecast error: ${res.status}`);

  const data = await res.json();
  const {
    time,
    wind_speed_10m,
    wind_gusts_10m,
    temperature_2m,
    wind_direction_10m,
  } = data.minutely_15 as {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    temperature_2m: number[];
    wind_direction_10m: number[];
  };

  // Open-Meteo's minutely_15 series starts at 00:00 of the current day, so
  // many points are technically "past" relative to now. Callers append these
  // to a station's observation history; if any past-but-after-last-obs
  // point slips in, the popup's "last point ≤ now" picker treats an NWP
  // value as a real measurement (Vevey/VEV bug 8 mai 2026 — popup showed
  // 1 kts W from NWP while the station read 2 kts S). Strictly future only.
  const nowIso = new Date().toISOString().slice(0, 16);

  return time
    .map((t, i) => ({
      time: t,
      windSpeedKmh: wind_speed_10m[i] ?? 0,
      windDirection: wind_direction_10m[i] ?? 0,
      gustsKmh: wind_gusts_10m[i] ?? 0,
      temperatureC: temperature_2m[i] ?? 0,
    }))
    .filter((p) => p.time > nowIso);
}
