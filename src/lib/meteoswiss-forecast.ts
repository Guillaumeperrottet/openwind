/**
 * MeteoSwiss E4 Local Forecast — ICON-CH2-EPS downscaled to ~6000 Swiss points.
 *
 * Data source : data.geo.admin.ch (MeteoSwiss Open Data)
 * License     : opendata.swiss — CC BY 4.0
 * Frequency   : updated every hour
 * Coverage    : ~6000 pre-defined points across Switzerland, 9 days hourly
 * Model       : same ICON-CH2-EPS used in the official MeteoSwiss app
 *
 * Parameters used:
 *   fu3010h0  — wind speed 10m (km/h)
 *   fu3010h1  — wind gusts 10m (km/h)
 *   dkl010h0  — wind direction 10m (°)
 *   tre200h0  — temperature 2m (°C)
 *   rre003i0  — precipitation 3h sum (mm)
 *
 * CSV format (long):  point_id;point_type_id;Date;{param_name}
 *   Date format: YYYYMMDDHHMM (UTC)
 *   ~1.3M rows per file (~33 MB) — parsed with a streaming line reader.
 */

import type { HourlyPoint } from "./forecast";

const MCH_FORECAST_BASE =
  "https://data.geo.admin.ch/ch.meteoschweiz.ogd-local-forecasting";

const MCH_META_URL = `${MCH_FORECAST_BASE}/ogd-local-forecasting_meta_point.csv`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface MchPoint {
  pointId: number;
  lat: number;
  lon: number;
  name: string;
  elevationM: number;
}

/** Raw parameter row keyed by Date string → value */
type ParamSeries = Map<string, number>;

// ─── Metadata cache ───────────────────────────────────────────────────────────

let _metaCache: MchPoint[] | null = null;
let _metaCacheTime = 0;
const META_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — points rarely change

/**
 * Fetch and parse the ~6000-point metadata CSV.
 * Cached in-process for 24 hours.
 */
async function getMchPoints(): Promise<MchPoint[]> {
  if (_metaCache && Date.now() - _metaCacheTime < META_CACHE_TTL) {
    return _metaCache;
  }
  const res = await fetch(MCH_META_URL, {
    // We cache in-process for 24h; bypass Next.js fetch cache (large file).
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`MCH meta fetch failed: ${res.status}`);

  const text = await res.text();
  // Strip UTF-8 BOM if present, normalize CRLF → LF
  const clean = (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text).replace(
    /\r\n/g,
    "\n",
  );
  const lines = clean.split("\n");
  // Header: point_id;point_type_id;station_abbr;postal_code;point_name;...;point_coordinates_wgs84_lat;point_coordinates_wgs84_lon
  const header = lines[0].split(";");
  const idxId = header.indexOf("point_id");
  const idxLat = header.indexOf("point_coordinates_wgs84_lat");
  const idxLon = header.indexOf("point_coordinates_wgs84_lon");
  const idxName = header.indexOf("point_name");
  const idxElev = header.indexOf("point_height_masl");

  if (idxId < 0 || idxLat < 0 || idxLon < 0) {
    throw new Error(
      `MCH meta header missing expected columns. Got: ${header.join(",")}`,
    );
  }

  const points: MchPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(";");
    if (row.length < 4) continue;
    const lat = parseFloat(row[idxLat]);
    const lon = parseFloat(row[idxLon]);
    if (isNaN(lat) || isNaN(lon)) continue;
    points.push({
      pointId: parseInt(row[idxId], 10),
      lat,
      lon,
      name: row[idxName] ?? "",
      elevationM: parseFloat(row[idxElev]) || 0,
    });
  }

  _metaCache = points;
  _metaCacheTime = Date.now();
  if (points.length === 0) {
    throw new Error(
      `MCH meta parsing returned 0 points (CSV size: ${text.length} bytes)`,
    );
  }
  return points;
}

// ─── Nearest-point lookup ─────────────────────────────────────────────────────

function haversineDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findNearestPointId(lat: number, lon: number): Promise<number> {
  const points = await getMchPoints();
  let bestId = points[0].pointId;
  let bestDist = Infinity;
  for (const p of points) {
    const d = haversineDeg(lat, lon, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      bestId = p.pointId;
    }
  }
  return bestId;
}

// ─── Forecast URL construction ────────────────────────────────────────────────

/**
 * Build the forecast CSV URL for a given parameter and UTC run time.
 *
 * MeteoSwiss publishes a new set of CSVs each hour.
 * URL pattern:
 *   {BASE}/{YYYYMMDD}-ch/vnut12.lssw.{YYYYMMDDHHOO}.{param}.csv
 *
 * We use the run that started 2h ago to ensure it's fully published.
 */
function getForecastUrl(param: string, now: Date = new Date()): string {
  // Use the run from 2 hours ago to ensure it's fully published
  const runDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const yyyy = runDate.getUTCFullYear();
  const mm = String(runDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(runDate.getUTCDate()).padStart(2, "0");
  const hh = String(runDate.getUTCHours()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;
  const runStr = `${yyyy}${mm}${dd}${hh}00`;
  return `${MCH_FORECAST_BASE}/${dateStr}-ch/vnut12.lssw.${runStr}.${param}.csv`;
}

// ─── CSV streaming parser ─────────────────────────────────────────────────────

/**
 * Stream-parse a MeteoSwiss E4 CSV and return only rows for a given point_id.
 *
 * The CSV is in long format: point_id;point_type_id;Date;{param}
 * We read it line by line without loading the full 33MB into memory.
 *
 * Returns a Map<dateStr, value> for the target point.
 */
async function streamParseForPoint(
  url: string,
  targetPointId: number,
): Promise<ParamSeries> {
  const res = await fetch(url, {
    // 30 MB CSV — bypass Next.js fetch cache (would exceed 2 MB limit).
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`MCH CSV fetch failed (${url}): ${res.status}`);

  const targetPrefix = `${targetPointId};`;
  const series: ParamSeries = new Map();

  // Stream-decode using TextDecoder + chunked reader
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream");

  const decoder = new TextDecoder();
  let remainder = "";
  let isHeader = true;
  let dateIdx = -1;
  let valIdx = -1;
  let foundTarget = false;
  let done = false; // early-exit flag (rows are grouped by point_id)

  try {
    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) {
        if (remainder) processLine(remainder);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = (remainder + chunk).split("\n");
      remainder = lines.pop() ?? ""; // last partial line

      for (const line of lines) {
        processLine(line);
        if (done) break; // early exit — passed our target point
      }
    }
  } finally {
    reader.cancel();
  }

  function processLine(rawLine: string) {
    // Strip trailing \r (CRLF line endings) and BOM
    let line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    if (line.charCodeAt(0) === 0xfeff) line = line.slice(1);
    if (!line) return;
    if (isHeader) {
      isHeader = false;
      const cols = line.split(";");
      dateIdx = cols.indexOf("Date");
      // Last column is the parameter value
      valIdx = cols.length - 1;
      return;
    }
    // Quick prefix check before splitting (performance optimization)
    if (!line.startsWith(targetPrefix)) {
      // Rows are grouped by point_id (sorted ascending). Once we've found
      // our target and hit a different prefix, we can stop reading.
      if (foundTarget) done = true;
      return;
    }
    foundTarget = true;

    const cols = line.split(";");
    if (cols.length <= Math.max(dateIdx, valIdx)) return;

    const dateStr = cols[dateIdx];
    const val = parseFloat(cols[valIdx]);
    if (!isNaN(val)) {
      series.set(dateStr, val);
    }
  }

  return series;
}

// ─── Date parsing ─────────────────────────────────────────────────────────────

/**
 * Convert MeteoSwiss date format YYYYMMDDHHMM to ISO local time string.
 * Input is UTC, but we return a local ISO string (as expected by HourlyPoint.time).
 */
function mchDateToIso(mchDate: string, timezone: string): string {
  // Parse as UTC: YYYYMMDDHHMM
  const year = parseInt(mchDate.slice(0, 4), 10);
  const month = parseInt(mchDate.slice(4, 6), 10) - 1;
  const day = parseInt(mchDate.slice(6, 8), 10);
  const hour = parseInt(mchDate.slice(8, 10), 10);

  const utcDate = new Date(Date.UTC(year, month, day, hour, 0, 0));

  // Format in the target timezone
  try {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = formatter.format(utcDate);
    // sv-SE format: "YYYY-MM-DD HH:MM" — convert to ISO T format
    return parts.replace(" ", "T");
  } catch {
    return utcDate.toISOString().slice(0, 16);
  }
}

// ─── Kite score (same logic as forecast.ts) ───────────────────────────────────

function calcKitableScore(kmh: number, gustsKmh: number): 0 | 1 | 2 | 3 {
  if (kmh < 18 || kmh > 55) return 0;
  const gustRatio = gustsKmh / Math.max(kmh, 1);
  const isIdealSpeed = kmh >= 25 && kmh <= 38;
  const isSteady = gustRatio < 1.45;
  if (kmh >= 22 && kmh <= 45 && isSteady && isIdealSpeed) return 3;
  if (kmh >= 22 && kmh <= 45 && isSteady) return 2;
  if (kmh >= 22 && kmh <= 45) return 1;
  return 0;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * The 3 wind parameters we fetch from MeteoSwiss E4.
 *
 * Note: temperature/precipitation use a DIFFERENT point grid in the E4
 * dataset (~1.2M postal-code-like points vs. ~5622 stations for wind),
 * so our nearest-station lookup wouldn't match. We only fetch wind data
 * from MeteoSwiss (its specialty: ICON-CH2-EPS downscaled model) and
 * the caller can merge temp/precip/cloud from another source (Open-Meteo).
 */
const PARAMS = [
  "fu3010h0", // wind speed 10m, km/h
  "fu3010h1", // wind gusts 10m, km/h
  "dkl010h0", // wind direction 10m, °
] as const;

/**
 * Fetch a MeteoSwiss E4 local forecast for the given coordinates.
 *
 * Finds the nearest of ~6000 MCH forecast points, then streams and parses
 * 5 parameter CSVs to build a full HourlyPoint[] array (9 days, hourly).
 *
 * Caching: 1 hour (MCH publishes a new run each hour).
 * On failure, throws — the caller should fall back to Open-Meteo.
 */
export async function fetchMchForecast(
  lat: number,
  lon: number,
  timezone = "Europe/Zurich",
): Promise<HourlyPoint[]> {
  // 1. Find nearest MCH forecast point
  const pointId = await findNearestPointId(lat, lon);

  // 2. Fetch the 3 wind-parameter CSVs in parallel
  const now = new Date();
  const [speedSeries, gustsSeries, dirSeries] = await Promise.all(
    PARAMS.map((p) => streamParseForPoint(getForecastUrl(p, now), pointId)),
  );

  // 3. Build HourlyPoint[] — use speedSeries keys as the time axis
  const points: HourlyPoint[] = [];

  // Sort date strings for chronological order
  const dates = Array.from(speedSeries.keys()).sort();

  for (const dateStr of dates) {
    const speedKmh = speedSeries.get(dateStr) ?? 0;
    const gustsKmh = gustsSeries.get(dateStr) ?? speedKmh;
    const direction = dirSeries.get(dateStr) ?? 0;
    const score = calcKitableScore(speedKmh, gustsKmh);

    points.push({
      time: mchDateToIso(dateStr, timezone),
      windSpeedKmh: speedKmh,
      windSpeedKnots: Math.round((speedKmh / 1.852) * 10) / 10,
      gustsKmh,
      gustsKnots: Math.round((gustsKmh / 1.852) * 10) / 10,
      windDirection: direction,
      // Temp/precip/cloud not in MCH wind point grid — caller may merge
      // from Open-Meteo. Defaults are zero/empty.
      temperatureC: 0,
      precipMmh: 0,
      cloudcover: 0,
      weathercode: 0,
      waveHeightM: null,
      wavePeriodS: null,
      waveDirection: null,
      isKitable: score >= 2,
      kitableScore: score,
    });
  }

  return points;
}
