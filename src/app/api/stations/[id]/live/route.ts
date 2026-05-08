import { NextResponse } from "next/server";
import { getStationLive, getStationCoordsOrNull } from "@/lib/stationData";

/**
 * GET /api/stations/:id/live
 *
 * Returns the current wind as a WindLive object for a specific station.
 * Station coords are resolved from the stations_cache snapshot for the
 * Open-Meteo fallback (allowOpenMeteoFallback defaults to false here
 * because callers wanting fallback should use /api/spots/:id/live).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = decodeURIComponent(id);

  try {
    const coords = await getStationCoordsOrNull(stationId);
    const live = await getStationLive(stationId, {
      lat: coords?.lat,
      lng: coords?.lng,
      // Station detail page: show stale obs with isFresh=false rather than
      // silently switching to Open-Meteo (so the badge "données anciennes"
      // can be displayed). Pages that want the Open-Meteo fallback should
      // use /api/spots/:id/live instead.
      allowOpenMeteoFallback: false,
    });
    return NextResponse.json(live, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Wind data unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
