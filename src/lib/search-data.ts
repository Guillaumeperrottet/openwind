import "server-only";
import { prisma } from "./prisma";
import { getStationCatalog } from "./station-catalog";
import {
  guideSearchEntries,
  SEARCH_COPY,
  webcamPath,
  type SearchEntry,
} from "./search";
import type { SiteLocale } from "./site";
import { LOCAL_GUIDES } from "./local-guides";
import { NETWORK_LABELS } from "./stationConstants";

function lakeTerms(id: string, kind: "spot" | "station") {
  return LOCAL_GUIDES.filter((guide) =>
    kind === "spot"
      ? guide.spotIds.includes(id)
      : guide.stations.some((station) => station.id === id),
  )
    .flatMap((guide) => [
      guide.slug,
      ...(guide.aliases ?? []),
      ...Object.values(guide.translations).flatMap((copy) =>
        copy ? [copy.place] : [],
      ),
    ])
    .join(" ");
}

async function loadPublicSearchData() {
  const [spots, stations, articles] = await Promise.all([
    prisma.spot.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        region: true,
        latitude: true,
        longitude: true,
        sportType: true,
      },
    }),
    getStationCatalog(),
    prisma.article.findMany({
      where: { status: "PUBLISHED", kind: "EDITORIAL" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        location: true,
      },
    }),
  ]);
  return { spots, stations, articles };
}
type PublicData = Awaited<ReturnType<typeof loadPublicSearchData>>;
// Bounded per-instance cache and request coalescing. Never cache a failed load.
// No user data, cookies, article bodies or provider credentials enter this index.
let cached: { data: PublicData; expires: number } | undefined;
let pending: Promise<PublicData> | undefined;
async function getPublicData() {
  if (cached && cached.expires > Date.now()) return cached.data;
  if (!pending)
    pending = loadPublicSearchData()
      .then((data) => {
        cached = { data, expires: Date.now() + 60_000 };
        return data;
      })
      .finally(() => {
        pending = undefined;
      });
  return pending;
}
export async function getSearchEntries(
  locale: SiteLocale,
): Promise<{ entries: SearchEntry[]; partial: boolean }> {
  const entries = guideSearchEntries(locale);
  try {
    const { spots, stations, articles } = await getPublicData();
    const copy = SEARCH_COPY[locale];
    for (const spot of spots) {
      const terms = [
        spot.country,
        spot.region,
        lakeTerms(spot.id, "spot"),
        spot.sportType === "PARAGLIDE"
          ? "parapente paragliding gleitschirm parapendio"
          : "kite kitesurf windsurf wingfoil",
      ]
        .filter(Boolean)
        .join(" ");
      entries.push({
        id: spot.id,
        kind: "spot",
        title: spot.name,
        subtitle: [spot.region, spot.country].filter(Boolean).join(" · "),
        href: `/${locale}/spots/${spot.id}`,
        terms,
      });
      entries.push({
        id: `spot-${spot.id}`,
        kind: "webcam",
        title: spot.name,
        subtitle: copy.nearby,
        href: webcamPath(spot.latitude, spot.longitude, spot.name, locale),
        terms,
      });
    }
    for (const station of stations)
      entries.push({
        id: station.id,
        kind: "station",
        title: station.name,
        subtitle: NETWORK_LABELS[station.source],
        href: `/${locale}/stations/${encodeURIComponent(station.id)}`,
        terms: `${station.id} ${station.description ?? ""} ${station.source} ${lakeTerms(station.id, "station")}`,
      });
    for (const article of articles)
      entries.push({
        id: article.id,
        kind: "article",
        title: article.title,
        subtitle: `${locale === "fr" ? "" : "Français · "}${article.excerpt}`,
        href: `/fr/carnet/${article.slug}`,
        terms: `${article.location ?? ""} ${article.slug}`,
      });
    return { entries, partial: false };
  } catch {
    // The published lake guides remain searchable during a database outage.
    return { entries, partial: true };
  }
}
