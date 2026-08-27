import "server-only";

import { cache } from "react";

const CURRENT_MEASUREMENTS_URL =
  "https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell/VQHA80.csv";
const HISTORY_BASE_URL = "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn";

export interface MeteoSwissWeatherPoint {
  time: string;
  temperatureC: number | null;
  precipitation10MinMm: number | null;
  sunshine10MinMinutes: number | null;
  globalRadiationWm2: number | null;
  humidityPct: number | null;
  dewPointC: number | null;
  windDirection: number | null;
  windSpeedKmh: number | null;
  gustsKmh: number | null;
  pressureStationHpa: number | null;
  pressureSeaLevelHpa: number | null;
  pressureQnhHpa: number | null;
  snowDepthCm: number | null;
}

export interface MeteoSwissStationWeather {
  stationId: string;
  current: MeteoSwissWeatherPoint | null;
  history: MeteoSwissWeatherPoint[];
  measurementIntervalMinutes: 10;
  sourceUrl: string;
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value === "-") return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function nonNegative(value: string | undefined): number | null {
  const parsed = parseNumber(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
}

function splitRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(";"));
}

function swissLocalToUtc(rawTime: string): string | null {
  const [datePart, timePart] = rawTime.split(" ");
  if (!datePart || !timePart) return null;
  const [day, month, year] = datePart.split(".");
  if (!day || !month || !year) return null;

  const localIso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timePart}`;
  const referenceUtc = new Date(`${localIso}:00Z`);
  if (Number.isNaN(referenceUtc.getTime())) return null;

  const swissFormatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(referenceUtc);
  const swissIso = swissFormatted.replace(" ", "T");
  const offsetMs = Date.parse(`${swissIso}:00Z`) - referenceUtc.getTime();

  return new Date(referenceUtc.getTime() - offsetMs).toISOString();
}

function compactUtcToIso(rawTime: string): string | null {
  if (!/^\d{12}$/.test(rawTime)) return null;
  const iso = `${rawTime.slice(0, 4)}-${rawTime.slice(4, 6)}-${rawTime.slice(6, 8)}T${rawTime.slice(8, 10)}:${rawTime.slice(10, 12)}:00Z`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parsePoint(
  row: string[],
  header: string[],
  time: string,
): MeteoSwissWeatherPoint {
  const value = (column: string) => row[header.indexOf(column)];

  return {
    time,
    temperatureC: parseNumber(value("tre200s0")),
    precipitation10MinMm: nonNegative(value("rre150z0")),
    sunshine10MinMinutes: nonNegative(value("sre000z0")),
    globalRadiationWm2: nonNegative(value("gre000z0")),
    humidityPct: nonNegative(value("ure200s0")),
    dewPointC: parseNumber(value("tde200s0")),
    windDirection: nonNegative(value("dkl010z0")),
    windSpeedKmh: nonNegative(value("fu3010z0")),
    gustsKmh: nonNegative(value("fu3010z1")),
    pressureStationHpa: nonNegative(value("prestas0")),
    pressureSeaLevelHpa: nonNegative(value("pp0qffs0")),
    pressureQnhHpa: nonNegative(value("pp0qnhs0")),
    snowDepthCm: nonNegative(value("htoauts0")),
  };
}

export function parseMeteoSwissCurrentCsv(
  text: string,
  stationId: string,
): MeteoSwissWeatherPoint | null {
  const rows = splitRows(text);
  const header = rows[0] ?? [];
  const stationIndex = header.indexOf("Station/Location");
  const timeIndex = header.indexOf("Date");
  if (stationIndex === -1 || timeIndex === -1) return null;

  const row = rows.find(
    (candidate) => candidate[stationIndex]?.toUpperCase() === stationId,
  );
  if (!row) return null;
  const time = compactUtcToIso(row[timeIndex] ?? "");
  return time ? parsePoint(row, header, time) : null;
}

export function parseMeteoSwissHistoryCsv(
  nowText: string,
  recentText: string,
  stationId: string,
  cutoffMs = Date.now() - 48 * 60 * 60 * 1000,
): MeteoSwissWeatherPoint[] {
  const nowRows = splitRows(nowText);
  const header = nowRows[0] ?? [];
  const stationIndex = header.indexOf("station_abbr");
  const timeIndex = header.indexOf("reference_timestamp");
  if (stationIndex === -1 || timeIndex === -1) return [];

  // A ranged request can start in the middle of a CSV row. Dropping its first
  // line also removes the duplicate header when the server returns the full file.
  const recentRows = splitRows(recentText).slice(1);
  const candidates = [...recentRows, ...nowRows.slice(1)];
  const byTime = new Map<string, MeteoSwissWeatherPoint>();

  for (const row of candidates) {
    if (row[stationIndex]?.toUpperCase() !== stationId) continue;
    const time = swissLocalToUtc(row[timeIndex] ?? "");
    if (!time || Date.parse(time) < cutoffMs) continue;
    byTime.set(time, parsePoint(row, header, time));
  }

  return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time));
}

async function fetchCurrent(stationId: string) {
  const response = await fetch(CURRENT_MEASUREMENTS_URL, {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    throw new Error(`MeteoSwiss current data failed: ${response.status}`);
  }
  return parseMeteoSwissCurrentCsv(await response.text(), stationId);
}

export const getMeteoSwissHistory = cache(async (stationId: string) => {
  const id = stationId.toLowerCase();
  const base = `${HISTORY_BASE_URL}/${id}/ogd-smn_${id}_t_`;
  const [nowResponse, recentResponse] = await Promise.all([
    fetch(`${base}now.csv`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8_000),
    }),
    fetch(`${base}recent.csv`, {
      headers: { Range: "bytes=-140000" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8_000),
    }),
  ]);

  const nowText = nowResponse.ok ? await nowResponse.text() : "";
  const recentText =
    recentResponse.ok || recentResponse.status === 206
      ? await recentResponse.text()
      : "";
  if (!nowText && !recentText) {
    throw new Error(`MeteoSwiss history unavailable for ${stationId}`);
  }

  return parseMeteoSwissHistoryCsv(
    nowText,
    recentText,
    stationId.toUpperCase(),
  );
});

export const getMeteoSwissStationWeather = cache(
  async (stationId: string): Promise<MeteoSwissStationWeather | null> => {
    const normalizedId = stationId.toUpperCase();
    const [currentResult, historyResult] = await Promise.allSettled([
      fetchCurrent(normalizedId),
      getMeteoSwissHistory(normalizedId),
    ]);

    const history =
      historyResult.status === "fulfilled" ? historyResult.value : [];
    const latestHistory = history.at(-1) ?? null;
    const currentFromFeed =
      currentResult.status === "fulfilled" ? currentResult.value : null;
    const current = currentFromFeed
      ? {
          ...latestHistory,
          ...currentFromFeed,
          snowDepthCm:
            currentFromFeed.snowDepthCm ?? latestHistory?.snowDepthCm ?? null,
        }
      : latestHistory;

    if (!current && history.length === 0) return null;

    const mergedHistory = [...history];
    if (current) {
      const currentIndex = mergedHistory.findIndex(
        (point) => point.time === current.time,
      );
      if (currentIndex >= 0) {
        mergedHistory[currentIndex] = current;
      } else if (!latestHistory || current.time > latestHistory.time) {
        mergedHistory.push(current);
      }
    }

    return {
      stationId: normalizedId,
      current,
      history: mergedHistory,
      measurementIntervalMinutes: 10,
      sourceUrl:
        "https://opendatadocs.meteoswiss.ch/fr/a-data-groundbased/a1-automatic-weather-stations",
    };
  },
);
