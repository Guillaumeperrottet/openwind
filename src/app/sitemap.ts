import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_LOCALES, SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;
const LOCALES = SITE_LOCALES;

/** Build a sitemap entry with hreflang alternates for all locales. */
function multilingual(
  path: string,
  opts?: Partial<MetadataRoute.Sitemap[number]>,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {
    "x-default": `${BASE_URL}/fr${path}`,
  };
  for (const l of LOCALES) languages[l] = `${BASE_URL}/${l}${path}`;

  return LOCALES.map((l) => ({
    url: `${BASE_URL}/${l}${path}`,
    alternates: { languages },
    ...opts,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — 4 locales each
  const staticPages: MetadataRoute.Sitemap = [
    ...multilingual("", { changeFrequency: "daily", priority: 1 }),
    ...multilingual("/about", { changeFrequency: "monthly", priority: 0.9 }),
    ...multilingual("/plan", { changeFrequency: "weekly", priority: 0.85 }),
    ...multilingual("/balises", {
      changeFrequency: "daily",
      priority: 0.9,
    }),
    ...multilingual("/forum", { changeFrequency: "daily", priority: 0.8 }),
    {
      url: `${BASE_URL}/fr/carnet`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fr/vent-en-direct/lac-de-la-gruyere`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic spot pages — 4 locales each
  let spotPages: MetadataRoute.Sitemap = [];
  try {
    const spots = await prisma.spot.findMany({
      select: { id: true, updatedAt: true },
    });
    spotPages = spots.flatMap((spot: (typeof spots)[number]) =>
      multilingual(`/spots/${spot.id}`, {
        lastModified: spot.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );
  } catch {
    // DB unavailable — return static pages only
  }

  // Forum category pages — FR only (single-language forum)
  let forumPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.forumCategory.findMany({
      select: { slug: true },
    });
    forumPages = categories.map((cat: (typeof categories)[number]) => ({
      url: `${BASE_URL}/fr/forum/${cat.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable
  }

  // Carnet articles — FR only
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED", kind: "EDITORIAL" },
      select: { slug: true, updatedAt: true },
    });
    articlePages = articles.map((article: (typeof articles)[number]) => ({
      url: `${BASE_URL}/fr/carnet/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable
  }

  // Forum topic pages — FR only
  let topicPages: MetadataRoute.Sitemap = [];
  try {
    const topics = await prisma.forumTopic.findMany({
      select: {
        id: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    });
    topicPages = topics.map((t: (typeof topics)[number]) => ({
      url: `${BASE_URL}/fr/forum/${t.category.slug}/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable
  }

  // Station pages — 4 locales each
  let stationPages: MetadataRoute.Sitemap = [];
  try {
    const stationIds = await prisma.stationMeasurement.findMany({
      select: { stationId: true },
      distinct: ["stationId"],
    });
    stationPages = stationIds.flatMap((s: (typeof stationIds)[number]) =>
      multilingual(`/stations/${encodeURIComponent(s.stationId)}`, {
        changeFrequency: "daily",
        priority: 0.75,
      }),
    );
  } catch {
    // DB unavailable
  }

  return [
    ...staticPages,
    ...spotPages,
    ...stationPages,
    ...articlePages,
    ...forumPages,
    ...topicPages,
  ];
}
