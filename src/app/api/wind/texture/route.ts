import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";
const BATCH_SIZE = 50;
const BATCH_DELAY = 200;

// Cache the result in-memory for 10 minutes (per Vercel instance)
let cached: { data: WindPoint[]; bounds: Bounds; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;
const MAX_POINTS = 400;

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
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
};

/**
 * GET /api/wind/texture?bounds=west,south,east,north
 *
 * Fetches a dense wind grid from Open-Meteo and returns it as JSON.
 * The client generates the texture (avoids sending large PNGs).
 *
 * Grid resolution adapts to the bounds size:
 * - Global: ~5° step → ~2600 points
 * - Regional: ~1° step → ~600 points
 * - Local: ~0.5° step → ~400 points
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

  // Adaptive step based on area size
  let step: number;
  const maxDim = Math.max(latSpan, lngSpan);
  if (maxDim > 200) step = 10;
  else if (maxDim > 100) step = 7;
  else if (maxDim > 40) step = 3;
  else if (maxDim > 15) step = 1.5;
  else if (maxDim > 5) step = 0.5;
  else step = 0.25;

  // Pad the bounds slightly
  const pad = step;
  const b0 = Math.max(-85, south - pad);
  const b1 = Math.min(85, north + pad);
  const l0 = Math.max(-180, west - pad);
  const l1 = Math.min(180, east + pad);

  // Build grid — ensure we stay under MAX_POINTS
  let lats: number[] = [];
  let lons: number[] = [];
  const buildGrid = (s: number) => {
    lats = [];
    lons = [];
    for (let lat = b0; lat <= b1; lat += s) {
      for (let lon = l0; lon <= l1; lon += s) {
        lats.push(+lat.toFixed(2));
        lons.push(+lon.toFixed(2));
      }
    }
  };
  buildGrid(step);
  while (lats.length > MAX_POINTS) {
    step *= 1.4;
    buildGrid(step);
  }

  const n = lats.length;
  if (n === 0) {
    return NextResponse.json({ error: "empty grid" }, { status: 400 });
  }

  // Check in-memory cache (same bounds within tolerance)
  if (
    cached &&
    Date.now() - cached.ts < CACHE_TTL &&
    Math.abs(cached.bounds[0] - l0) < step &&
    Math.abs(cached.bounds[1] - b0) < step &&
    Math.abs(cached.bounds[2] - l1) < step &&
    Math.abs(cached.bounds[3] - b1) < step
  ) {
    return NextResponse.json(
      { points: cached.data, bounds: cached.bounds, step },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
        },
      },
    );
  }

  try {
    const points: WindPoint[] = [];

    // Fetch in parallel batches
    const batches: { startIdx: number; count: number }[] = [];
    for (let i = 0; i < n; i += BATCH_SIZE) {
      batches.push({ startIdx: i, count: Math.min(BATCH_SIZE, n - i) });
    }

    // Process batches in groups of 3 to stay within Open-Meteo free-tier
    const PARALLEL = 3;
    for (let g = 0; g < batches.length; g += PARALLEL) {
      const group = batches.slice(g, g + PARALLEL);
      const results = await Promise.allSettled(
        group.map(async ({ startIdx, count }) => {
          const bLats = lats.slice(startIdx, startIdx + count).join(",");
          const bLons = lons.slice(startIdx, startIdx + count).join(",");
          const url = `${OPEN_METEO}?latitude=${bLats}&longitude=${bLons}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`;

          const res = await fetch(url, {
            signal: AbortSignal.timeout(10000),
          });

          if (!res.ok) return [];

          const raw: unknown = await res.json();
          const data: OpenMeteoResult[] = Array.isArray(raw) ? raw : [raw];
          const pts: WindPoint[] = [];
          for (let j = 0; j < data.length; j++) {
            const r = data[j];
            if (
              r?.current?.wind_speed_10m != null &&
              r?.current?.wind_direction_10m != null
            ) {
              pts.push({
                lat: lats[startIdx + j],
                lon: lons[startIdx + j],
                speed: r.current.wind_speed_10m,
                direction: r.current.wind_direction_10m,
                gusts: r.current.wind_gusts_10m ?? r.current.wind_speed_10m,
              });
            }
          }
          return pts;
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") points.push(...r.value);
      }

      // Delay between groups
      if (g + PARALLEL < batches.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY));
      }
    }

    if (points.length < 2) {
      return NextResponse.json(
        { error: "Insufficient wind data" },
        { status: 502 },
      );
    }

    const actualBounds: Bounds = [l0, b0, l1, b1];
    cached = { data: points, bounds: actualBounds, ts: Date.now() };

    return NextResponse.json(
      { points, bounds: actualBounds, step },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
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
