import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

/** Fetch with a single retry on transient errors (429, 5xx, network). */
async function fetchWithRetry(url: string): Promise<Response> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    } as RequestInit);
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 800));
      return fetch(url, {
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000),
      } as RequestInit);
    }
    return res;
  } catch {
    // Network error on first attempt — retry once
    await new Promise((r) => setTimeout(r, 800));
    return fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    } as RequestInit);
  }
}

/**
 * GET /api/wind/grid?lats=46.5,47.0&lngs=6.5,7.0
 *
 * Server-side proxy for batch wind requests to Open-Meteo.
 * Avoids CORS issues and benefits from Vercel edge caching.
 */
export async function GET(request: NextRequest) {
  const lats = request.nextUrl.searchParams.get("lats");
  const lngs = request.nextUrl.searchParams.get("lngs");

  if (!lats || !lngs) {
    return NextResponse.json(
      { error: "lats and lngs required" },
      { status: 400 },
    );
  }

  const url = `${OPEN_METEO}?latitude=${lats}&longitude=${lngs}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`;

  try {
    const res = await fetchWithRetry(url);

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Rate limited" },
        { status: 429, headers: { "Retry-After": "5" } },
      );
    }
    if (!res.ok) {
      console.error(
        `[/api/wind/grid] upstream ${res.status} ${res.statusText}`,
      );
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
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
