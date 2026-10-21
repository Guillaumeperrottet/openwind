import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getStationCatalog } from "@/lib/station-catalog";
import {
  GUIDE_LOCALES,
  LOCAL_GUIDES,
  guideLanguages,
} from "@/lib/local-guides";
import { SITE_LOCALES, localizedUrl } from "@/lib/site";

// A DB outage must fail instead of silently dropping known URLs from the sitemap.
export const dynamic = "force-dynamic";

function multilingual(
  path: string,
  locales: readonly string[] = SITE_LOCALES,
  lastModified?: Date | string,
): MetadataRoute.Sitemap {
  const languages = {
    "x-default": localizedUrl("fr", path),
    ...Object.fromEntries(
      locales.map((locale) => [locale, localizedUrl(locale, path)]),
    ),
  };
  return locales.map((locale) => ({
    url: localizedUrl(locale, path),
    alternates: { languages },
    ...(lastModified ? { lastModified } : {}),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spots, stations, articles, categories, topics] = await Promise.all([
    prisma.spot.findMany({ select: { id: true, updatedAt: true } }),
    getStationCatalog(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, kind: true, updatedAt: true },
    }),
    prisma.forumCategory.findMany({ select: { slug: true } }),
    prisma.forumTopic.findMany({
      select: {
        id: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
  ]);
  return [
    ...["", "/about", "/plan", "/balises", "/forum"].flatMap((path) =>
      multilingual(path),
    ),
    ...multilingual("/vent-en-direct", GUIDE_LOCALES),
    { url: localizedUrl("fr", "/carnet") },
    ...LOCAL_GUIDES.flatMap((guide) => {
      const editorial = articles.find(
        (article) =>
          article.kind === "LOCAL_GUIDE" && article.slug === guide.slug,
      );
      const modified =
        editorial && editorial.updatedAt > new Date(guide.updatedAt)
          ? editorial.updatedAt
          : guide.updatedAt;
      return multilingual(
        `/vent-en-direct/${guide.slug}`,
        guideLanguages(guide),
        modified,
      );
    }),
    ...spots.flatMap((spot) =>
      multilingual(`/spots/${spot.id}`, SITE_LOCALES, spot.updatedAt),
    ),
    ...stations.flatMap((station) =>
      multilingual(`/stations/${encodeURIComponent(station.id)}`),
    ),
    ...articles
      .filter((article) => article.kind === "EDITORIAL")
      .map((article) => ({
        url: localizedUrl("fr", `/carnet/${article.slug}`),
        lastModified: article.updatedAt,
      })),
    ...categories.map((category) => ({
      url: localizedUrl("fr", `/forum/${category.slug}`),
    })),
    ...topics.map((topic) => ({
      url: localizedUrl("fr", `/forum/${topic.category.slug}/${topic.id}`),
      lastModified: topic.updatedAt,
    })),
  ];
}
