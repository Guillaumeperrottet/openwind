import type {
  ForecastHour,
  WindData,
  HistoryPoint,
  DayAnalysis,
  SportType,
} from "@/types";
import { getWindData } from "@/lib/utils";

const BASE = "https://api.open-meteo.com/v1/forecast";

/**
 * Convert a MeteoSwiss local timestamp (Europe/Zurich CET/CEST) to UTC ISO.
 * Input: "YYYY-MM-DDTHH:mm" in Swiss local time.
 * Output: "YYYY-MM-DDTHH:mm" in UTC.
 */
function swissLocalToUtc(localIso: string): string {
  // Treat the local timestamp as if it were UTC to get a reference Date
  const refUtc = new Date(localIso + ":00Z");
  // Format that UTC instant in Swiss timezone to determine the offset
  const swissFormatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(refUtc);
  // sv-SE → "2026-04-03 14:50", normalize to comparable ISO
  const swissIso = swissFormatted.replace(" ", "T");
  const offsetMs = Date.parse(swissIso + ":00Z") - refUtc.getTime();
  // Real UTC = local time minus the Swiss→UTC offset
  return new Date(refUtc.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * Fetch current wind at a lat/lng from Open-Meteo (no API key needed).
 */
export async function fetchCurrentWind(
  lat: number,
  lng: number,
): Promise<WindData> {
  const url = new URL(BASE);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set(
    "current",
    "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
  );
  url.searchParams.set("wind_speed_unit", "kmh");
  // default timeformat is ISO strings ("2026-04-01T14:45")

  const res = await fetch(url.toString(), { next: { revalidate: 600 } }); // cache 10 min
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const c = data.current;

  return {
    ...getWindData(c.wind_speed_10m, c.wind_direction_10m, c.wind_gusts_10m),
    updatedAt: (c.time as string | undefined) ?? undefined,
  };
}

/**
 * Fetch hourly wind forecast for a specific date at lat/lng.
 * Returns 24 hourly entries for the given date.
 */
export async function fetchForecastForDate(
  lat: number,
  lng: number,
  date: string, // "YYYY-MM-DD"
): Promise<ForecastHour[]> {
  return fetchForecastRange(lat, lng, date, date);
}

/**
 * Fetch hourly wind forecast for a date range (up to 16 days ahead via Open-Meteo).
 * Returns all hourly entries across the range.
 */
export async function fetchForecastRange(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<ForecastHour[]> {
  const url = new URL(BASE);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set(
    "hourly",
    "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
  );
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const { time, wind_speed_10m, wind_direction_10m, wind_gusts_10m } =
    data.hourly;

  return (time as string[]).map((t: string, i: number) => ({
    time: t,
    windSpeedKmh: wind_speed_10m[i],
    windDirection: wind_direction_10m[i],
    gustsKmh: wind_gusts_10m[i],
  }));
}

/** Wind thresholds per sport type */
const SPORT_THRESHOLDS = {
  KITE: { min: 15, max: 45, idealMin: 20, idealMax: 35, idealCenter: 27 },
  PARAGLIDE: { min: 10, max: 25, idealMin: 12, idealMax: 22, idealCenter: 16 },
} as const;

/**
 * Get the best window of rideable hours from a forecast array.
 * Sport-aware: kite 15–45 km/h, paraglide 10–25 km/h.
 */
export function analyzeForecast(
  forecast: ForecastHour[],
  sport: SportType = "KITE",
): {
  kitableHours: number;
  peakWindKmh: number;
  bestHour: ForecastHour | null;
} {
  const t = SPORT_THRESHOLDS[sport];
  const rideable = forecast.filter(
    (f) => f.windSpeedKmh >= t.min && f.windSpeedKmh <= t.max,
  );
  const best = forecast.reduce<ForecastHour | null>((acc, f) => {
    if (!acc) return f;
    const score = (s: number) =>
      s >= t.idealMin && s <= t.idealMax
        ? 10 - Math.abs(s - t.idealCenter)
        : -Math.abs(s - t.idealCenter);
    return score(f.windSpeedKmh) > score(acc.windSpeedKmh) ? f : acc;
  }, null);

  return {
    kitableHours: rideable.length,
    peakWindKmh: forecast.length
      ? Math.max(...forecast.map((f) => f.windSpeedKmh))
      : 0,
    bestHour: best,
  };
}

/**
 * Compute a 0–100 composite score for a day's forecast.
 * Factors: rideable hours, wind quality, gust factor (regularity).
 * Daytime hours (7–20) weighted higher.
 */
export function scoreDayForecast(
  forecast: ForecastHour[],
  sport: SportType = "KITE",
): DayAnalysis {
  const t = SPORT_THRESHOLDS[sport];
  const date = forecast[0]?.time?.split("T")[0] ?? "";

  // Focus on daytime hours (7h–20h)
  const daytime = forecast.filter((f) => {
    const h = new Date(f.time).getHours();
    return h >= 7 && h <= 20;
  });
  if (!daytime.length) {
    return {
      date,
      score: 0,
      kitableHours: 0,
      peakWindKmh: 0,
      avgWindKmh: 0,
      gustFactor: 1,
      bestHour: null,
      forecast,
    };
  }

  const rideable = daytime.filter(
    (f) => f.windSpeedKmh >= t.min && f.windSpeedKmh <= t.max,
  );
  const rideableHours = rideable.length;

  const avgWind =
    daytime.reduce((s, f) => s + f.windSpeedKmh, 0) / daytime.length;
  const avgGusts = daytime.reduce((s, f) => s + f.gustsKmh, 0) / daytime.length;
  const gustFactor = avgWind > 0 ? avgGusts / avgWind : 1;
  const peakWindKmh = Math.max(...daytime.map((f) => f.windSpeedKmh));

  // Score components (each 0–1):
  // 1. Rideable hours ratio (out of 14 daytime hours) — weight 40%
  const hoursScore = Math.min(rideableHours / 8, 1); // 8+ hours = perfect
  // 2. Wind quality — how close avg rideable wind is to ideal center — weight 35%
  const avgRideable = rideable.length
    ? rideable.reduce((s, f) => s + f.windSpeedKmh, 0) / rideable.length
    : 0;
  const idealDist = Math.abs(avgRideable - t.idealCenter);
  const windQuality = rideable.length
    ? Math.max(0, 1 - idealDist / (t.idealMax - t.idealMin))
    : 0;
  // 3. Regularity — low gust factor = steady wind — weight 25%
  const regularity = Math.max(0, 1 - (gustFactor - 1) / 1.5); // gust factor 1.0=perfect, 2.5+=0

  const score = Math.round(
    hoursScore * 40 + windQuality * 35 + regularity * 25,
  );

  const best = rideable.reduce<ForecastHour | null>((acc, f) => {
    if (!acc) return f;
    const sc = (s: number) =>
      s >= t.idealMin && s <= t.idealMax
        ? 10 - Math.abs(s - t.idealCenter)
        : -Math.abs(s - t.idealCenter);
    return sc(f.windSpeedKmh) > sc(acc.windSpeedKmh) ? f : acc;
  }, null);

  return {
    date,
    score: Math.min(100, Math.max(0, score)),
    kitableHours: rideableHours,
    peakWindKmh,
    avgWindKmh: Math.round(avgWind * 10) / 10,
    gustFactor: Math.round(gustFactor * 100) / 100,
    bestHour: best,
    forecast,
  };
}

/**
 * Split a multi-day forecast array into per-day DayAnalysis objects.
 */
export function analyzeMultiDay(
  forecast: ForecastHour[],
  sport: SportType = "KITE",
): DayAnalysis[] {
  // Group by date
  const byDay = new Map<string, ForecastHour[]>();
  for (const f of forecast) {
    const day = f.time.split("T")[0];
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(f);
  }
  return Array.from(byDay.entries()).map(([, hours]) =>
    scoreDayForecast(hours, sport),
  );
}

/**
 * Fetch 48h real station measurements (10-min) from MeteoSwiss OGD.
 * Combines `_now.csv` (today) + tail of `_recent.csv` (last ~100 KB ≈ 3-4 days).
 * Falls back to throwing so the caller can use Open-Meteo as backup.
 */
export async function fetchWindHistoryStation(
  stationId: string,
): Promise<HistoryPoint[]> {
  const id = stationId.toLowerCase();
  const base = `https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/${id}/ogd-smn_${id}_t_`;

  // Fetch today's file (small ~10 KB) + tail of recent file (~100 KB covers 3+ days)
  const [nowRes, recentRes] = await Promise.all([
    fetch(`${base}now.csv`, { next: { revalidate: 600 } }),
    fetch(`${base}recent.csv`, {
      headers: { Range: "bytes=-100000" },
      next: { revalidate: 600 },
    }),
  ]);

  const nowText = nowRes.ok ? await nowRes.text() : "";
  const recentText =
    recentRes.ok || recentRes.status === 206 ? await recentRes.text() : "";

  if (!nowText && !recentText) {
    throw new Error(`MeteoSwiss OGD data unavailable for station ${stationId}`);
  }

  const splitRows = (text: string): string[][] =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split(";"));

  const nowRows = splitRows(nowText);
  // _recent tail starts mid-file — first row may be a partial line, skip it.
  // The Range response also never includes the header row, so reuse indices from _now.
  const recentRows = splitRows(recentText).slice(1);

  // Resolve column indices from _now header
  const header = nowRows[0] ?? [];
  const idx = (name: string) => header.indexOf(name);

  const COL_WIND_KMH = idx("fu3010z0"); // 10-min mean speed km/h
  const COL_DIR = idx("dkl010z0"); // 10-min mean direction °
  const COL_GUST = idx("fu3010z1"); // 1s gust peak km/h
  const COL_TEMP = idx("tre200s0"); // air temperature 2m °C

  if (COL_WIND_KMH === -1 || COL_DIR === -1) {
    throw new Error("MeteoSwiss CSV column layout unexpected");
  }

  const parseRow = (row: string[]): HistoryPoint | null => {
    // row[1] = reference_timestamp "dd.MM.yyyy HH:mm" in Swiss local time
    const rawTime = row[1];
    if (!rawTime || row.length < 5) return null;
    const [datePart, timePart] = rawTime.split(" ");
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split(".");
    if (!day || !month || !year) return null;
    const isoLocal = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}`;
    // Convert Swiss local time (CET/CEST) to UTC
    const isoTime = swissLocalToUtc(isoLocal);

    const km = parseFloat(row[COL_WIND_KMH] ?? "");
    if (isNaN(km)) return null;

    return {
      time: isoTime,
      windSpeedKmh: km,
      windDirection: parseFloat(row[COL_DIR] ?? "") || 0,
      gustsKmh: parseFloat(row[COL_GUST] ?? "") || km,
      temperatureC: parseFloat(row[COL_TEMP] ?? "") || 0,
    };
  };

  // Data rows: _now (skip header at index 0), _recent tail (already sliced)
  const nowPoints = nowRows
    .slice(1)
    .filter((r) => r[0] && r[0] !== "station_abbr")
    .map(parseRow)
    .filter((p): p is HistoryPoint => p !== null);

  const recentPoints = recentRows
    .filter((r) => r[0] && r[0] !== "station_abbr" && r[0].length <= 10)
    .map(parseRow)
    .filter((p): p is HistoryPoint => p !== null);

  // Combine, dedup by time, sort, keep last 48h
  const seen = new Set<string>();
  const all = [...recentPoints, ...nowPoints]
    .filter((p) => {
      if (seen.has(p.time)) return false;
      seen.add(p.time);
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)
    .replace("T", "T"); // "YYYY-MM-DDTHH:mm"
  return all.filter((p) => p.time >= cutoff);
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
  url.searchParams.set("forecast_days", "0");
  url.searchParams.set("timezone", "UTC");

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
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
