import { NextRequest, NextResponse } from "next/server";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

/**
 * GET /api/wind/grid?lats=46.5,47.0&lngs=6.5,7.0
 *
 * Server-side proxy for the wind field animation grid.
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

  const url = `${OPEN_METEO}?latitude=${lats}&longitude=${lngs}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Rate limited" },
        { status: 429, headers: { "Retry-After": "5" } },
      );
    }
    if (!res.ok) {
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
