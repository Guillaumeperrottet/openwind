import "server-only";

import { prisma } from "@/lib/prisma";

export interface StationConnectionSpot {
  id: string;
  name: string;
  region: string | null;
  country: string | null;
  sportType: "KITE" | "PARAGLIDE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  bestWindDirections: string[];
}

export interface StationConnectionArticle {
  id: string;
  kind: "EDITORIAL" | "LOCAL_GUIDE";
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
}

export interface StationConnections {
  spots: StationConnectionSpot[];
  articles: StationConnectionArticle[];
}

/**
 * Resolve the reverse side of the relationships already managed by Openwind:
 * spots select their nearest station, while articles explicitly select spots
 * and stations in the admin editor.
 */
export async function resolveStationConnections(
  stationId: string,
): Promise<StationConnections> {
  const spots = await prisma.spot.findMany({
    where: { nearestStationId: stationId },
    select: {
      id: true,
      name: true,
      region: true,
      country: true,
      sportType: true,
      difficulty: true,
      bestWindDirections: true,
    },
    orderBy: [{ region: "asc" }, { name: "asc" }],
    take: 6,
  });

  const spotIds = spots.map((spot) => spot.id);
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { linkedStationIds: { has: stationId } },
        ...(spotIds.length > 0
          ? [{ linkedSpotIds: { hasSome: spotIds } }]
          : []),
      ],
    },
    select: {
      id: true,
      kind: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      readTime: true,
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 4,
  });

  return { spots, articles };
}
