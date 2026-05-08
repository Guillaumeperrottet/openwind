import { NextResponse } from "next/server";
import { getSpotLive, getStationLive } from "@/lib/stationData";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/spots/:id/live
 *
 * Returns the current wind as a WindLive object for a spot.
 *
 * Optional query param `?stationId=` overrides the spot's nearestStationId
 * (used when the user selects a different nearby station on the spot page).
 * In that case the spot coordinates are still used as Open-Meteo fallback.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const overrideStationId = url.searchParams.get("stationId");

  try {
    if (overrideStationId) {
      // Fetch spot coords for the Open-Meteo fallback
      const spot = await prisma.spot.findUnique({
        where: { id },
        select: { latitude: true, longitude: true },
      });
      if (!spot) {
        return NextResponse.json({ error: "Spot not found" }, { status: 404 });
      }
      const live = await getStationLive(overrideStationId, {
        lat: spot.latitude,
        lng: spot.longitude,
        allowOpenMeteoFallback: true,
      });
      return NextResponse.json(live, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const live = await getSpotLive(id);
    return NextResponse.json(live, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Wind data unavailable";
    // Spot not found
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    // No station data + no coords
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
