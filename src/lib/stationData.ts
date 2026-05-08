/**
 * stationData — Single server-side entry point for all wind data.
 *
 * This module centralises the three recurring operations:
 *   - getStationLive   → current measurement for a specific station
 *   - getStationHistory → 48h observations + NWP forecast, strictly separated
 *   - getSpotLive       → current wind for a spot (station if fresh, Open-Meteo otherwise)
 *
 * ALL freshness thresholds live here. No other file should define FRESHNESS_MS,
 * FRESHNESS_BY_NETWORK, or duplicate isStationFresh logic.
 *
 * server-only: this module must never be imported from client components.
 */
import "server-only";

import type {
  NetworkId,
  WindLive,
  WindHistoryBundle,
  HistoryPoint,
} from "@/types";
import { prisma } from "@/lib/prisma";
import { fetchCurrentWind } from "@/lib/windFetch";
import {
  fetchWindHistoryStation,
  fetchWindForecast15min,
} from "@/lib/windHistory";
import type { WindStation } from "@/lib/stations";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Maximum age of a station measurement before it is considered stale.
 * Beyond this threshold:
 *   - spot pages fall back to Open-Meteo (when allowOpenMeteoFallback=true)
 *   - station pages show the obs with isFresh=false + "données anciennes" badge
 */
export const FRESHNESS_BY_NETWORK: Record<NetworkId, number> = {
  meteoswiss: 60 * 60 * 1000, // 1 h (10-min cycles but outages are common)
  pioupiou: 20 * 60 * 1000, // 20 min (push ~4 min)
  netatmo: 30 * 60 * 1000, // 30 min
  meteofrance: 4 * 60 * 60 * 1000, // 4 h (SYNOP every 3 h)
  windball: 30 * 60 * 1000, // 30 min
  "fr-energy": 30 * 60 * 1000, // 30 min
};

export const NETWORK_LABELS: Record<NetworkId | "openmeteo", string> = {
  meteoswiss: "MeteoSwiss",
  pioupiou: "Pioupiou",
  netatmo: "Netatmo",
  meteofrance: "Météo-France",
  windball: "Windball",
  "fr-energy": "FribourgÉnergie",
  openmeteo: "Open-Meteo",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive network identifier from station ID prefix. */
export function detectNetwork(stationId: string): NetworkId {
  if (stationId.startsWith("piou-")) return "pioupiou";
  if (stationId.startsWith("ntm-")) return "netatmo";
  if (stationId.startsWith("mf-")) return "meteofrance";
  if (stationId.startsWith("windball-")) return "windball";
  if (stationId.startsWith("fr-energy-")) return "fr-energy";
  return "meteoswiss";
}

/**
 * Look up station lat/lng from the 10-min snapshot stored in SystemConfig.
 * Returns null if the cache is missing or the station is not in it.
 */
async function getStationCoordsFromSnapshot(
  stationId: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const cached = await prisma.systemConfig.findUnique({
      where: { key: "stations_cache" },
    });
    if (!cached) return null;
    const stations = JSON.parse(cached.value) as WindStation[];
    const station = stations.find((s) => s.id === stationId);
    if (!station) return null;
    return { lat: station.lat, lng: station.lng };
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the current wind measurement for a station.
 *
 * Strategy:
 *   1. Read the latest StationMeasurement from DB.
 *   2. If within FRESHNESS_BY_NETWORK[network] → return as source="station", isFresh=true.
 *   3. If stale but allowOpenMeteoFallback=false (page station context) → return stale
 *      obs with isFresh=false so the UI can show "données anciennes".
 *   4. If stale + allowOpenMeteoFallback=true + coords available → Open-Meteo.
 *   5. No measurement + no coords → throws.
 *
 * @param stationId  Station identifier (e.g. "VEV", "piou-110", "windball-wb-05").
 * @param opts.lat   Latitude for Open-Meteo fallback.
 * @param opts.lng   Longitude for Open-Meteo fallback.
 * @param opts.allowOpenMeteoFallback  Default true. Set false on station detail pages.
 */
export async function getStationLive(
  stationId: string,
  opts?: { lat?: number; lng?: number; allowOpenMeteoFallback?: boolean },
): Promise<WindLive> {
  const network = detectNetwork(stationId);
  const freshnessMs = FRESHNESS_BY_NETWORK[network];
  const allowFallback = opts?.allowOpenMeteoFallback ?? true;

  // ── 1. Latest DB measurement ─────────────────────────────────────────────
  let measurement: {
    windSpeedKmh: number;
    windDirection: number;
    gustsKmh: number | null;
    temperatureC: number | null;
    time: Date;
  } | null = null;

  try {
    measurement = await prisma.stationMeasurement.findFirst({
      where: { stationId },
      orderBy: { time: "desc" },
      select: {
        windSpeedKmh: true,
        windDirection: true,
        gustsKmh: true,
        temperatureC: true,
        time: true,
      },
    });
  } catch {
    // DB unavailable — continue to fallback
  }

  if (measurement) {
    const age = Date.now() - measurement.time.getTime();
    const isFresh = age < freshnessMs;
    const staleAt = new Date(
      measurement.time.getTime() + freshnessMs,
    ).toISOString();

    // Return station data if fresh, OR if fallback is disabled (show stale obs)
    if (isFresh || !allowFallback || opts?.lat == null || opts?.lng == null) {
      return {
        windSpeedKmh: measurement.windSpeedKmh,
        windDirection: measurement.windDirection,
        gustsKmh: measurement.gustsKmh ?? measurement.windSpeedKmh,
        temperatureC: measurement.temperatureC ?? undefined,
        updatedAt: measurement.time.toISOString(),
        source: "station",
        network,
        stationId,
        staleAt,
        isFresh,
      };
    }
  }

  // ── 2. Open-Meteo fallback ───────────────────────────────────────────────
  const lat = opts?.lat;
  const lng = opts?.lng;
  if (allowFallback && lat != null && lng != null) {
    const omWind = await fetchCurrentWind(lat, lng);
    return {
      windSpeedKmh: omWind.windSpeedKmh,
      windDirection: omWind.windDirection,
      gustsKmh: omWind.gustsKmh,
      updatedAt: omWind.updatedAt ?? new Date().toISOString(),
      source: "openmeteo",
      // Open-Meteo is always considered fresh (NWP nowcast)
      staleAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      isFresh: true,
    };
  }

  throw new Error(
    `No wind data available for station "${stationId}" and no fallback coordinates provided.`,
  );
}

/**
 * Get 48h wind history for a station with observations and NWP strictly separated.
 *
 * @param stationId  Station identifier.
 * @param opts.lat   Latitude for Open-Meteo 15-min NWP forecast.
 * @param opts.lng   Longitude for Open-Meteo 15-min NWP forecast.
 *                   If not provided, coords are looked up from the stations snapshot.
 */
export async function getStationHistory(
  stationId: string,
  opts?: { lat?: number; lng?: number },
): Promise<WindHistoryBundle> {
  const network = detectNetwork(stationId);

  // ── Observations (DB + CSV/API depending on network) ──────────────────────
  const observations: HistoryPoint[] = await fetchWindHistoryStation(
    stationId,
  ).catch(() => []);

  // ── NWP forecast (strictly future points only) ────────────────────────────
  // Resolve coords: prefer caller-provided, then snapshot lookup.
  const coords =
    opts?.lat != null && opts?.lng != null
      ? { lat: opts.lat, lng: opts.lng }
      : await getStationCoordsFromSnapshot(stationId);

  let forecast: HistoryPoint[] = [];
  if (coords) {
    forecast = await fetchWindForecast15min(coords.lat, coords.lng).catch(
      () => [],
    );
    // fetchWindForecast15min already filters to time > now (see windHistory.ts)
    // but we also want to trim to after the last observation to avoid redundancy.
    if (observations.length > 0) {
      const lastObsTime = observations[observations.length - 1].time;
      forecast = forecast.filter((p) => p.time > lastObsTime);
    }
  }

  const stationLabel = `${stationId} · ${NETWORK_LABELS[network]}`;

  return {
    observations,
    forecast,
    meta: {
      stationId,
      network,
      label: stationLabel,
    },
  };
}

/**
 * Get the current wind for a spot.
 *
 * Strategy:
 *   1. If the spot has a nearestStationId → getStationLive with Open-Meteo fallback.
 *   2. No station or error → Open-Meteo at spot coordinates.
 *
 * @param spotId  Prisma Spot.id (cuid).
 */
export async function getSpotLive(spotId: string): Promise<WindLive> {
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    select: { latitude: true, longitude: true, nearestStationId: true },
  });

  if (!spot) throw new Error(`Spot not found: "${spotId}"`);

  if (spot.nearestStationId) {
    try {
      return await getStationLive(spot.nearestStationId, {
        lat: spot.latitude,
        lng: spot.longitude,
        allowOpenMeteoFallback: true,
      });
    } catch {
      // Station lookup failed — fall through to Open-Meteo
    }
  }

  // No assigned station or station unavailable → Open-Meteo grid
  const omWind = await fetchCurrentWind(spot.latitude, spot.longitude);
  return {
    windSpeedKmh: omWind.windSpeedKmh,
    windDirection: omWind.windDirection,
    gustsKmh: omWind.gustsKmh,
    updatedAt: omWind.updatedAt ?? new Date().toISOString(),
    source: "openmeteo",
    staleAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    isFresh: true,
  };
}
