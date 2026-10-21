import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getStationCatalog } from "@/lib/station-catalog";
import { FRESHNESS_BY_NETWORK, isNetworkFresh } from "@/lib/stationConstants";
import { fetchFullForecast } from "@/lib/forecast";
import { parseArticleSources } from "@/lib/articles";
import { resolveArticleConnections } from "@/lib/article-connections";
import type { LocalGuide, GuideLocale } from "@/lib/local-guides";
import type {
  GuideObservation,
  GuideStation,
} from "@/components/carnet/GuideLiveStations";

// Existing French guides remain editable in the article administration.
export const getGuideEditorial = cache(async (slug: string) => {
  try {
    return await prisma.article.findFirst({
      where: { slug, kind: "LOCAL_GUIDE", status: "PUBLISHED" },
    });
  } catch {
    return null; // The versioned guide remains readable during a DB outage.
  }
});

export async function loadLocalGuide(
  definition: LocalGuide,
  locale: GuideLocale,
) {
  const [editorialResult, catalogResult, forecastResult] =
    await Promise.allSettled([
      getGuideEditorial(definition.slug),
      getStationCatalog(),
      fetchFullForecast(definition.coordinates.lat, definition.coordinates.lng),
    ]);
  const editorial =
    editorialResult.status === "fulfilled" ? editorialResult.value : null;
  const catalog =
    catalogResult.status === "fulfilled" ? catalogResult.value : [];
  const stationIds = editorial?.linkedStationIds.length
    ? editorial.linkedStationIds
    : definition.stations.map((station) => station.id);
  const stations: GuideStation[] = stationIds.flatMap((id) => {
    const observation = catalog.find((candidate) => candidate.id === id);
    const station =
      observation ??
      definition.stations.find((candidate) => candidate.id === id);
    if (!station) return [];
    // Serve the last real observation immediately. SWR then fetches newer
    // measurements; rendering a guide must not wait for three provider APIs.
    const initialLive: GuideObservation | null =
      observation && Number.isFinite(Date.parse(observation.updatedAt))
        ? {
            source: "station",
            stationId: id,
            network: observation.source,
            windSpeedKmh: observation.windSpeedKmh,
            gustsKmh: observation.gustsKmh,
            windDirection: observation.windDirection,
            updatedAt: observation.updatedAt,
            staleAt: new Date(
              Date.parse(observation.updatedAt) +
                FRESHNESS_BY_NETWORK[observation.source],
            ).toISOString(),
            isFresh: isNetworkFresh(id, observation.updatedAt),
          }
        : null;
    return [
      {
        id,
        name: station.name,
        source: station.source,
        initialLive,
        context: definition.stations.find((candidate) => candidate.id === id)
          ?.context,
      },
    ];
  });
  const connections =
    locale === "fr" && editorial
      ? await resolveArticleConnections(editorial).catch(() => null)
      : null;
  const spots =
    connections?.spots ??
    (await prisma.spot
      .findMany({
        where: { id: { in: definition.spotIds } },
        select: { id: true, name: true },
      })
      .catch(() => []));
  const translation = definition.translations[locale]!;
  const editorialSources = parseArticleSources(editorial?.sources);
  return {
    definition,
    translation,
    locale,
    stations,
    spots,
    content:
      locale === "fr" && editorial ? editorial.content : translation.content,
    coverImage: editorial?.coverImage || definition.coverImage,
    coverAlt:
      locale === "fr" && editorial?.coverAlt
        ? editorial.coverAlt
        : translation.coverAlt,
    author: editorial?.authorName || "Openwind",
    sources:
      locale === "fr" && editorialSources.length
        ? editorialSources
        : definition.sources,
    publishedAt:
      editorial?.publishedAt?.toISOString() || definition.publishedAt,
    updatedAt:
      editorial && editorial.updatedAt > new Date(definition.updatedAt)
        ? editorial.updatedAt.toISOString()
        : definition.updatedAt,
    forecast:
      forecastResult.status === "fulfilled" ? forecastResult.value : null,
    relatedArticles:
      locale === "fr" ? (connections?.relatedArticles ?? []) : [],
  };
}

export type LocalGuideData = Awaited<ReturnType<typeof loadLocalGuide>>;
