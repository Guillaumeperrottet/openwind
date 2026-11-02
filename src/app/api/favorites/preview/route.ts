import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStationCatalog } from "@/lib/station-catalog";
import { MAX_LOCAL_FAVORITES } from "@/lib/favorites";

const ids = z.array(z.string().min(1).max(200)).max(MAX_LOCAL_FAVORITES);

/** Public catalogue fields only. Guest favorites themselves never enter a database. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = z.object({ spots: ids, stations: ids }).safeParse({
    spots: params.get("spots")?.split(",").filter(Boolean) ?? [],
    stations: params.get("stations")?.split(",").filter(Boolean) ?? [],
  });
  if (!parsed.success || parsed.data.spots.length + parsed.data.stations.length > MAX_LOCAL_FAVORITES)
    return NextResponse.json({ error: "Favoris invalides" }, { status: 400 });
  try {
    const [spots, catalogue] = await Promise.all([
      parsed.data.spots.length ? prisma.spot.findMany({
        where: { id: { in: parsed.data.spots } },
        select: { id: true, name: true, sportType: true, region: true },
      }) : [],
      parsed.data.stations.length ? getStationCatalog() : [],
    ]);
    const stations = catalogue.filter((s) => parsed.data.stations.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name }));
    return NextResponse.json({ spots, stations }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Catalogue indisponible" }, { status: 503 });
  }
}
