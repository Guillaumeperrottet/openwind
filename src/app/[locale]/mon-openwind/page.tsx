import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { fetchForecastBatch, analyzeMultiDay } from "@/lib/wind";
import { articlePublicPath } from "@/lib/articles";
import { getStationsFromCache } from "@/lib/stationData";
import type { WindStation } from "@/lib/stations";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  normalizeDashboardLayout,
  type AccountPreferences,
} from "@/lib/user-preferences";
import type {
  DashboardFavoriteSpot,
  DashboardFavoriteStation,
  MonOpenwindData,
} from "@/components/dashboard/types";
import { DashboardLoginGate } from "@/components/dashboard/DashboardLoginGate";
import { MonOpenwindClient } from "@/components/dashboard/MonOpenwindClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon Openwind",
  description: "Votre tableau de bord personnel Openwind.",
  robots: { index: false, follow: false },
};

function dateInZurich(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export default async function MonOpenwindPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <DashboardLoginGate />;

  // Secure query: every personal record is filtered by the verified Supabase
  // user id. Only the fields used by the dashboard cross the server boundary.
  const [dbUser, preference, favorites, stationFavorites, stations] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      }),
      prisma.userPreference.findUnique({ where: { userId: user.id } }),
      prisma.favorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 16,
        include: {
          spot: {
            include: {
              images: { orderBy: { createdAt: "asc" }, take: 1 },
            },
          },
        },
      }),
      prisma.stationFavorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 16,
      }),
      getStationsFromCache(),
    ]);

  const favoriteIds = favorites.map((favorite) => favorite.spotId);
  const favoriteStationIds = stationFavorites.map(
    (favorite) => favorite.stationId,
  );
  const articleFavoriteFilters = [
    ...(favoriteIds.length
      ? [{ linkedSpotIds: { hasSome: favoriteIds } }]
      : []),
    ...(favoriteStationIds.length
      ? [{ linkedStationIds: { hasSome: favoriteStationIds } }]
      : []),
  ];
  const [articles, community, forecasts] = await Promise.all([
    articleFavoriteFilters.length
      ? prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            OR: articleFavoriteFilters,
          },
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
          take: 6,
        })
      : [],
    prisma.forumTopic.findMany({
      where: favoriteIds.length
        ? {
            OR: [
              { spotId: { in: favoriteIds } },
              { authorId: user.id },
              { posts: { some: { authorId: user.id } } },
            ],
          }
        : {
            OR: [
              { authorId: user.id },
              { posts: { some: { authorId: user.id } } },
            ],
          },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true, slug: true } },
        spot: { select: { id: true, name: true } },
        _count: { select: { posts: true } },
      },
    }),
    fetchForecastBatch(
      favorites.map((favorite) => ({
        lat: favorite.spot.latitude,
        lng: favorite.spot.longitude,
      })),
      dateInZurich(),
      dateInZurich(3),
    ),
  ]);

  const favoriteSpots: DashboardFavoriteSpot[] = favorites.map(
    (favorite, index) => {
      const spot = favorite.spot;
      const rawForecast = forecasts[index];
      const days = rawForecast
        ? analyzeMultiDay(
            rawForecast,
            spot.sportType,
            spot.bestWindDirections,
          )
        : [];

      return {
        id: spot.id,
        name: spot.name,
        region: spot.region,
        country: spot.country,
        sportType: spot.sportType,
        imageUrl: spot.images[0]?.url ?? null,
        minWindKmh: spot.minWindKmh,
        maxWindKmh: spot.maxWindKmh,
        bestWindDirections: spot.bestWindDirections,
        forecastDays: days.map((day) => ({
          date: day.date,
          score: day.score,
          suitableHours: day.kitableHours,
          averageWindKmh: day.avgWindKmh,
          peakWindKmh: day.peakWindKmh,
          bestHour: day.bestHour
            ? {
                time: day.bestHour.time,
                windSpeedKmh: day.bestHour.windSpeedKmh,
                gustsKmh: day.bestHour.gustsKmh,
                windDirection: day.bestHour.windDirection,
              }
            : null,
        })),
      };
    },
  );

  const stationsById = new Map(stations.map((station) => [station.id, station]));
  const favoriteStations: DashboardFavoriteStation[] = stationFavorites.map(
    (favorite) => {
      const station = stationsById.get(favorite.stationId);
      return {
        id: favorite.stationId,
        name: station?.name ?? favorite.stationName,
        source: (station?.source ?? favorite.source) as WindStation["source"],
        latitude: station?.lat ?? favorite.latitude,
        longitude: station?.lng ?? favorite.longitude,
        altitudeM: station?.altitudeM ?? favorite.altitudeM,
        windSpeedKmh: station?.windSpeedKmh ?? null,
        gustsKmh: station?.gustsKmh ?? null,
        windDirection: station?.windDirection ?? null,
        updatedAt: station?.updatedAt ?? null,
        isAvailable: Boolean(station),
      };
    },
  );

  const accountPreferences: AccountPreferences = {
    sportFilter:
      preference?.sportFilter === "KITE" ||
      preference?.sportFilter === "PARAGLIDE"
        ? preference.sportFilter
        : "ALL",
    useKnots: preference?.useKnots ?? true,
    defaultView: preference?.defaultView === "DASHBOARD" ? "DASHBOARD" : "MAP",
    onboardingCompleted: preference?.onboardingCompleted ?? true,
    dashboardLayout: preference
      ? normalizeDashboardLayout(preference.dashboardLayout)
      : [...DEFAULT_DASHBOARD_LAYOUT],
    mapView:
      preference?.mapCenterLng != null &&
      preference.mapCenterLat != null &&
      preference.mapZoom != null
        ? {
            center: [preference.mapCenterLng, preference.mapCenterLat],
            zoom: preference.mapZoom,
          }
        : null,
  };

  const data: MonOpenwindData = {
    userName:
      dbUser?.name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      null,
    preferences: accountPreferences,
    favoriteSpots,
    favoriteStations,
    articles: articles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      location: article.location,
      coverImage: article.coverImage,
      readTime: article.readTime,
      path: articlePublicPath(article),
      linkedSpotIds: article.linkedSpotIds,
      linkedStationIds: article.linkedStationIds,
    })),
    community: community.map((topic) => ({
      id: topic.id,
      title: topic.title,
      categoryName: topic.category.name,
      categorySlug: topic.category.slug,
      authorName: topic.author.name ?? "Openwind",
      avatarUrl: topic.author.avatarUrl,
      spotId: topic.spot?.id ?? null,
      spotName: topic.spot?.name ?? null,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
      postCount: topic._count.posts,
    })),
  };

  return <MonOpenwindClient initialData={data} />;
}
