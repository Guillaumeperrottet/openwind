import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin";
import type { ArticleRelationOptions } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import type { WindStation } from "@/lib/stations";

function forbidden() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
}

export async function GET() {
  if (!(await getAuthenticatedAdmin())) return forbidden();

  const [spots, articles, stationCache] = await Promise.all([
    prisma.spot.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        region: true,
        country: true,
        sportType: true,
      },
    }),
    prisma.article.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, title: true, kind: true, status: true },
    }),
    prisma.systemConfig.findUnique({
      where: { key: "stations_cache" },
      select: { value: true },
    }),
  ]);

  let cachedStations: WindStation[] = [];
  try {
    const parsed = stationCache ? JSON.parse(stationCache.value) : [];
    if (Array.isArray(parsed)) cachedStations = parsed as WindStation[];
  } catch {
    cachedStations = [];
  }

  const stations = cachedStations
    .filter(
      (station) =>
        typeof station.id === "string" && typeof station.name === "string",
    )
    .map((station) => ({
      id: station.id,
      name: station.name,
      source: station.source,
      altitudeM: station.altitudeM,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const response: ArticleRelationOptions = { spots, stations, articles };
  return NextResponse.json(response, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
