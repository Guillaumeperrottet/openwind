import { NextResponse } from "next/server";
import { fetchWindHistoryStation, fetchWindHistory } from "@/lib/wind";
import { fetchMeteoSwissStations } from "@/lib/stations";
import { fetchPioupiouHistory } from "@/lib/pioupiou";

export const dynamic = "force-dynamic";

/**
 * GET /api/stations/:id/history
 *
 * Returns 48h wind history for a station.
 * Supports both MeteoSwiss (e.g. "BER") and Pioupiou (e.g. "piou-110") stations.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stationId = decodeURIComponent(id);

  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
  };

  // ── Pioupiou station ────────────────────────────────────────────────
  if (stationId.startsWith("piou-")) {
    const numericId = parseInt(stationId.slice(5), 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid Pioupiou ID" },
        { status: 400 },
      );
    }
    try {
      const history = await fetchPioupiouHistory(numericId);
      return NextResponse.json(history, { headers: cacheHeaders });
    } catch {
      return NextResponse.json(
        { error: "Pioupiou history temporarily unavailable" },
        { status: 503 },
      );
    }
  }

  // ── MeteoSwiss station ──────────────────────────────────────────────
  try {
    const history = await fetchWindHistoryStation(stationId);
    return NextResponse.json(history, { headers: cacheHeaders });
  } catch {
    // Fallback: find station coords and use Open-Meteo
    try {
      const stations = await fetchMeteoSwissStations();
      const station = stations.find((s) => s.id === stationId);
      if (!station) {
        return NextResponse.json(
          { error: "Station not found" },
          { status: 404 },
        );
      }
      const history = await fetchWindHistory(station.lat, station.lng);
      return NextResponse.json(history, { headers: cacheHeaders });
    } catch {
      return NextResponse.json(
        { error: "History data temporarily unavailable" },
        { status: 503 },
      );
    }
  }
}
