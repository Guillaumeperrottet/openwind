import { NextRequest, NextResponse } from "next/server";
import {
  buildWindSampleGrid,
  normalizeUtcModelTime,
  selectWindModel,
  type WindModelMetadata,
} from "@/lib/windField";
import { prisma } from "@/lib/prisma";

const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_GFS = "https://api.open-meteo.com/v1/gfs";
const CACHE_TTL = 10 * 60 * 1000;
const STALE_CACHE_TTL = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 12;
const MAX_POINTS = 225;

type Bounds = [number, number, number, number]; // [west, south, east, north]
type WindPoint = {
  lat: number;
  lon: number;
  speed: number;
  direction: number;
  gusts: number;
};

type OpenMeteoResult = {
  latitude?: number;
  longitude?: number;
  current?: {
    time?: string;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
};

type TextureResponse = {
  points: WindPoint[];
  bounds: Bounds;
  step: number;
  sampleSpacingKm: number;
  validAt: string | null;
  model: WindModelMetadata;
  dataSource: "forecast" | "stations";
};

type CacheEntry = { data: TextureResponse; ts: number };

type CachedStation = {
  lat?: number;
  lng?: number;
  windSpeedKmh?: number;
  windDirection?: number;
  gustsKmh?: number;
  updatedAt?: string;
};

// Keep the small cache through Next.js hot reloads and for the lifetime of a
// server instance. CDN caching remains the first line of defence in production.
const globalWindCache = globalThis as typeof globalThis & {
  __openwindWindFieldCacheV2?: Map<string, CacheEntry>;
};
const cache =
  globalWindCache.__openwindWindFieldCacheV2 ?? new Map<string, CacheEntry>();
globalWindCache.__openwindWindFieldCacheV2 = cache;

/**
 * GET /api/wind/texture?bounds=west,south,east,north
 *
 * Fetches a compact, model-specific wind grid from Open-Meteo and returns it
 * as JSON. A Swiss/local view uses ICON-CH1; larger views use global GFS.
 *
 * Grid resolution adapts to the bounds size and is capped to keep upstream
 * requests predictable. The client interpolates the returned vectors into a
 * smooth field; cached live stations take over if the model API is unavailable.
 */
export async function GET(request: NextRequest) {
  const boundsParam = request.nextUrl.searchParams.get("bounds");
  if (!boundsParam) {
    return NextResponse.json(
      { error: "bounds=west,south,east,north required" },
      { status: 400 },
    );
  }

  const parts = boundsParam.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return NextResponse.json(
      { error: "bounds must be 4 comma-separated numbers" },
      { status: 400 },
    );
  }

  const [west, south, east, north] = parts as unknown as Bounds;
  const latSpan = north - south;
  const lngSpan = east - west;

  if (
    west < -180 ||
    east > 180 ||
    south < -80 ||
    north > 80 ||
    latSpan <= 0 ||
    lngSpan <= 0
  ) {
    return NextResponse.json(
      { error: "bounds are outside the supported extent" },
      { status: 400 },
    );
  }

  const requestedBounds: Bounds = [west, south, east, north];
  const model = selectWindModel(requestedBounds);
  const reusable = findCachedField(requestedBounds, CACHE_TTL, model.id);
  if (reusable) return windResponse(reusable.data, "hit");

  const sampling = buildWindSampleGrid(
    requestedBounds,
    model.resolutionKm ?? 13,
    MAX_POINTS,
  );
  const { lats, lons } = sampling;

  const n = lats.length;
  if (n === 0) {
    return NextResponse.json({ error: "empty grid" }, { status: 400 });
  }

  const cacheKey = [
    model.id,
    ...requestedBounds.map((value) => value.toFixed(3)),
    sampling.stepDegrees.toFixed(3),
  ].join(":");
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return windResponse(cached.data);
  }

  try {
    const points: WindPoint[] = [];
    let validAt: string | null = null;
    const url = new URL(
      model.id === "gfs_global" ? OPEN_METEO_GFS : OPEN_METEO_FORECAST,
    );
    url.searchParams.set("latitude", lats.join(","));
    url.searchParams.set("longitude", lons.join(","));
    url.searchParams.set(
      "current",
      "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    );
    url.searchParams.set("models", model.id);
    url.searchParams.set("wind_speed_unit", "kmh");
    url.searchParams.set("timezone", "GMT");
    url.searchParams.set("cell_selection", "nearest");
    const upstream = await fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      const stale = findCachedField(
        requestedBounds,
        STALE_CACHE_TTL,
        model.id,
      );
      if (stale) return windResponse(stale.data, "stale");

      const stationField = await buildStationFallback(requestedBounds);
      if (stationField) {
        storeCachedField(cacheKey, stationField);
        return windResponse(stationField, "fallback");
      }

      return NextResponse.json(
        { error: "Wind data unavailable" },
        {
          status: upstream.status === 429 ? 429 : 502,
          headers: upstream.status === 429 ? { "Retry-After": "60" } : {},
        },
      );
    }

    const raw: unknown = await upstream.json();
    const results: OpenMeteoResult[] = Array.isArray(raw) ? raw : [raw];
    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      if (
        result?.current?.wind_speed_10m != null &&
        result?.current?.wind_direction_10m != null
      ) {
        points.push({
          lat: Number.isFinite(result.latitude) ? result.latitude! : lats[index],
          lon: Number.isFinite(result.longitude)
            ? result.longitude!
            : lons[index],
          speed: result.current.wind_speed_10m,
          direction: result.current.wind_direction_10m,
          gusts:
            result.current.wind_gusts_10m ?? result.current.wind_speed_10m,
        });
        validAt ??= normalizeUtcModelTime(result.current.time);
      }
    }

    if (points.length < 2) {
      const stationField = await buildStationFallback(requestedBounds);
      if (stationField) {
        storeCachedField(cacheKey, stationField);
        return windResponse(stationField, "fallback");
      }

      return NextResponse.json(
        { error: "Insufficient wind data" },
        { status: 502 },
      );
    }

    const data: TextureResponse = {
      points,
      bounds: requestedBounds,
      step: sampling.stepDegrees,
      sampleSpacingKm: sampling.spacingKm,
      validAt,
      model,
      dataSource: "forecast",
    };
    storeCachedField(cacheKey, data);

    return windResponse(data, "miss");
  } catch (err) {
    const stale = findCachedField(
      requestedBounds,
      STALE_CACHE_TTL,
      model.id,
    );
    if (stale) return windResponse(stale.data, "stale");

    const stationField = await buildStationFallback(requestedBounds);
    if (stationField) {
      storeCachedField(cacheKey, stationField);
      return windResponse(stationField, "fallback");
    }

    console.error(
      "[/api/wind/texture]",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Wind data unavailable" },
      { status: 502 },
    );
  }
}

async function buildStationFallback(
  bounds: Bounds,
): Promise<TextureResponse | null> {
  try {
    const cached = await prisma.systemConfig.findUnique({
      where: { key: "stations_cache" },
      select: { value: true },
    });
    if (!cached) return null;

    const stations = (JSON.parse(cached.value) as CachedStation[]).filter(
      (station) =>
        Number.isFinite(station.lat) &&
        Number.isFinite(station.lng) &&
        Number.isFinite(station.windSpeedKmh) &&
        Number.isFinite(station.windDirection),
    );
    if (stations.length < 2) return null;

    const [west, south, east, north] = bounds;
    const centerLat = (south + north) / 2;
    const centerLng = (west + east) / 2;
    const latPadding = Math.max(0.5, north - south);
    const lngPadding = Math.max(0.5, east - west);
    const nearby = stations.filter(
      (station) =>
        station.lng! >= west - lngPadding &&
        station.lng! <= east + lngPadding &&
        station.lat! >= south - latPadding &&
        station.lat! <= north + latPadding,
    );
    const candidates = nearby.length >= 4 ? nearby : stations;
    const selected = candidates
      .sort(
        (a, b) =>
          (a.lat! - centerLat) ** 2 + (a.lng! - centerLng) ** 2 -
          ((b.lat! - centerLat) ** 2 + (b.lng! - centerLng) ** 2),
      )
      .slice(0, MAX_POINTS);
    if (selected.length < 2) return null;

    const validAt = selected.reduce<string | null>((latest, station) => {
      const normalized = normalizeUtcModelTime(station.updatedAt);
      if (!normalized || (latest && normalized <= latest)) return latest;
      return normalized;
    }, null);

    return {
      points: selected.map((station) => ({
        lat: station.lat!,
        lon: station.lng!,
        speed: station.windSpeedKmh!,
        direction: station.windDirection!,
        gusts: station.gustsKmh ?? station.windSpeedKmh!,
      })),
      bounds,
      step: Math.max(north - south, east - west) / Math.sqrt(selected.length),
      sampleSpacingKm:
        (Math.max(north - south, east - west) * 111.32) /
        Math.sqrt(selected.length),
      validAt,
      model: {
        id: "live_stations",
        label: "Balises en direct",
        source: "Openwind",
        resolutionKm: null,
      },
      dataSource: "stations",
    };
  } catch {
    return null;
  }
}

function storeCachedField(key: string, data: TextureResponse) {
  cache.set(key, { data, ts: Date.now() });
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

function findCachedField(
  bounds: Bounds,
  maxAge: number,
  modelId: WindModelMetadata["id"],
): CacheEntry | null {
  const now = Date.now();
  let best: CacheEntry | null = null;
  let bestArea = Number.POSITIVE_INFINITY;

  for (const [key, entry] of cache) {
    const age = now - entry.ts;
    if (age > STALE_CACHE_TTL) {
      cache.delete(key);
      continue;
    }
    if (
      age > maxAge ||
      (entry.data.model.id !== modelId &&
        entry.data.dataSource !== "stations") ||
      !boundsContain(entry.data.bounds, bounds)
    )
      continue;

    const [west, south, east, north] = entry.data.bounds;
    const area = (east - west) * (north - south);
    if (area < bestArea) {
      best = entry;
      bestArea = area;
    }
  }

  return best;
}

function boundsContain(container: Bounds, target: Bounds): boolean {
  return (
    target[0] >= container[0] &&
    target[1] >= container[1] &&
    target[2] <= container[2] &&
    target[3] <= container[3]
  );
}

function windResponse(
  data: TextureResponse,
  cacheStatus: "hit" | "miss" | "stale" | "fallback" = "hit",
) {
  return NextResponse.json(
    { ...data, validAt: normalizeUtcModelTime(data.validAt) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
        "X-Wind-Cache": cacheStatus,
      },
    },
  );
}
