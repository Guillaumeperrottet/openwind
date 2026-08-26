import "server-only";

import { prisma } from "@/lib/prisma";
import type { WindStation } from "@/lib/stations";

export interface ArticleConnectionSource {
  id: string;
  linkedSpotIds: string[];
  linkedStationIds: string[];
  relatedArticleIds: string[];
}

function orderBySelection<T extends { id: string }>(items: T[], ids: string[]) {
  const positions = new Map(ids.map((id, index) => [id, index]));
  return items.sort(
    (a, b) =>
      (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

export async function resolveArticleConnections(
  article: ArticleConnectionSource,
) {
  const hasExplicitRelatedArticles = article.relatedArticleIds.length > 0;

  const [spots, stationCache, relatedArticles] = await Promise.all([
    article.linkedSpotIds.length > 0
      ? prisma.spot.findMany({
          where: { id: { in: article.linkedSpotIds } },
          select: {
            id: true,
            name: true,
            region: true,
            country: true,
            sportType: true,
            difficulty: true,
            bestWindDirections: true,
          },
        })
      : [],
    article.linkedStationIds.length > 0
      ? prisma.systemConfig.findUnique({
          where: { key: "stations_cache" },
          select: { value: true },
        })
      : null,
    prisma.article.findMany({
      where: hasExplicitRelatedArticles
        ? {
            id: { in: article.relatedArticleIds },
            status: "PUBLISHED",
          }
        : { status: "PUBLISHED", id: { not: article.id } },
      orderBy: hasExplicitRelatedArticles
        ? undefined
        : [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  let stations: WindStation[] = [];
  try {
    const parsed = stationCache ? JSON.parse(stationCache.value) : [];
    if (Array.isArray(parsed)) {
      const selectedIds = new Set(article.linkedStationIds);
      stations = (parsed as WindStation[]).filter((station) =>
        selectedIds.has(station.id),
      );
    }
  } catch {
    stations = [];
  }

  return {
    spots: orderBySelection(spots, article.linkedSpotIds),
    stations: orderBySelection(stations, article.linkedStationIds),
    relatedArticles: hasExplicitRelatedArticles
      ? orderBySelection(relatedArticles, article.relatedArticleIds)
      : relatedArticles,
  };
}

export type ResolvedArticleConnections = Awaited<
  ReturnType<typeof resolveArticleConnections>
>;
