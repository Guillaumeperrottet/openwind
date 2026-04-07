import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";
/** Max locations per Open-Meteo request (keeps response time < 3s). */
const SUB_BATCH = 10;

// ── Simple sliding-window rate limiter (per Vercel instance) ────────────
// Tracks Open-Meteo sub-batch calls to stay within free-tier limits.
const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 80; // leave headroom below Open-Meteo's 600/min
const callTimestamps: number[] = [];

function canMakeCall(count: number): boolean {
  const now = Date.now();
  // Prune old entries
  while (callTimestamps.length > 0 && callTimestamps[0] < now - WINDOW_MS) {
    callTimestamps.shift();
  }
  return callTimestamps.length + count <= MAX_PER_WINDOW;
}

function recordCalls(count: number) {
  const now = Date.now();
  for (let i = 0; i < count; i++) callTimestamps.push(now);
}

/**
 * GET /api/wind/grid?lats=46.5,47.0&lngs=6.5,7.0
 *
 * Server-side proxy for batch wind requests to Open-Meteo.
 * Splits large requests into sub-batches fetched in parallel,
 * then merges results. Avoids CORS and benefits from Vercel caching.
 */
export async function GET(request: NextRequest) {
  const latsParam = request.nextUrl.searchParams.get("lats");
  const lngsParam = request.nextUrl.searchParams.get("lngs");

  if (!latsParam || !lngsParam) {
    return NextResponse.json(
      { error: "lats and lngs required" },
      { status: 400 },
    );
  }

  const allLats = latsParam.split(",");
  const allLngs = lngsParam.split(",");
  const n = Math.min(allLats.length, allLngs.length);

  if (n === 0) {
    return NextResponse.json({ error: "empty coordinates" }, { status: 400 });
  }

  // Rate-limit check: how many sub-batches would this request need?
  const subBatchCount = Math.ceil(n / SUB_BATCH);
  if (!canMakeCall(subBatchCount)) {
    return NextResponse.json(
      { error: "Rate limited — try again in a minute" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    // Split into sub-batches and fetch in parallel
    const results: unknown[] = new Array(n).fill(null);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < n; i += SUB_BATCH) {
      const end = Math.min(i + SUB_BATCH, n);
      const lats = allLats.slice(i, end).join(",");
      const lngs = allLngs.slice(i, end).join(",");
      const batchSize = end - i;
      const offset = i;

      const url = `${OPEN_METEO}?latitude=${lats}&longitude=${lngs}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`;

      promises.push(
        fetch(url, {
          next: { revalidate: 600 },
          signal: AbortSignal.timeout(6000),
        } as RequestInit)
          .then((res) => {
            if (!res.ok) return;
            return res.json();
          })
          .then((raw: unknown) => {
            if (!raw) return;
            const data = Array.isArray(raw) ? raw : [raw];
            for (let j = 0; j < Math.min(data.length, batchSize); j++) {
              results[offset + j] = data[j];
            }
          })
          .catch(() => {
            /* leave nulls for failed sub-batches */
          }),
      );
    }

    await Promise.all(promises);
    recordCalls(subBatchCount);

    // Check if we got at least some data
    const hasData = results.some((r) => r !== null);
    if (!hasData) {
      console.error("[/api/wind/grid] all sub-batches failed");
      return NextResponse.json(
        { error: "Wind grid data unavailable" },
        { status: 502 },
      );
    }

    // Return single object for 1 location, array for multiple (Open-Meteo compat)
    const response = n === 1 ? results[0] : results;
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("[/api/wind/grid]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Wind grid data unavailable" },
      { status: 502 },
    );
  }
}
