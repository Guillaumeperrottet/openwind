import { NextResponse } from "next/server";
import { fetchMchForecast } from "@/lib/meteoswiss-forecast";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await params; // id not needed — lat/lng provided as query params
  const url = new URL(req.url);
  const latStr = url.searchParams.get("lat");
  const lngStr = url.searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng must be numbers" },
      { status: 400 },
    );
  }

  try {
    const hourly = await fetchMchForecast(lat, lng);

    return NextResponse.json(
      {
        hourly,
        timezone: "Europe/Zurich",
        fetchedAt: new Date().toISOString(),
        hasWaves: false,
        source: "meteoswiss-e4",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: "MeteoSwiss forecast unavailable", detail: msg },
      { status: 503 },
    );
  }
}
