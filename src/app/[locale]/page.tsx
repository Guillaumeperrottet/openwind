import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { KiteMapLazy } from "@/components/map/KiteMapLazy";
import { HomeLanding } from "@/components/home/HomeLanding";
import { Link } from "@/i18n/navigation";
import { HOME_COPY } from "@/lib/home-copy";
import { resolveHomeView } from "@/lib/home-view";
import { HomeDiscovery } from "@/components/seo/HomeDiscovery";
import type { Spot } from "@/types";
import type { WindStation } from "@/lib/stations";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  DEFAULT_OG_IMAGE,
  HOME_SEO,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";

// ISR: cache HTML for 10 min, revalidate in background.
export const revalidate = 600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = HOME_SEO[toSiteLocale(locale)];

  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: localizedAlternates(locale),
    openGraph: {
      title: copy.title,
      description: copy.socialDescription,
      url: localizedUrl(locale),
      siteName: "Openwind",
      locale: copy.openGraphLocale,
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.socialDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function HomePage({
  params,
  searchParams,
}: Props & {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  let view = resolveHomeView(query.view);

  // The root URL is the user's durable launch point. An explicit map link
  // bypasses the preference so switching back to the map always remains easy.
  if (query.view !== "map" && query.view !== "home") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const preference = await prisma.userPreference
        .findUnique({
          where: { userId: user.id },
          select: { defaultView: true, onboardingCompleted: true },
        })
        .catch(() => null);
      view = resolveHomeView(query.view, preference);
      if (view === "dashboard") redirect(`/${locale}/mon-openwind`);
    }
  }

  if (view === "home") {
    const [articles, featuredSpots] = await Promise.all([
      prisma.article
        .findMany({
          where: { status: "PUBLISHED", kind: "EDITORIAL" },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            coverImage: true,
            coverAlt: true,
            category: true,
          },
          orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
          take: 3,
        })
        .catch(() => []),
      // Four text links, not the full map dataset. Names follow editorial edits.
      prisma.spot
        .findMany({
          where: {
            id: {
              in: [
                "cmnr31n570007ijf6q33aez75",
                "cmnq613tx00it04kw1d0vraq4",
                "cmnr46jjd0000i5f6q521m974",
                "swiss-kite-isleten",
              ],
            },
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
        .catch(() => []),
    ]);
    return (
      <HomeLanding
        locale={locale}
        articles={articles}
        featuredSpots={featuredSpots}
      />
    );
  }

  // Fetch spots + cached stations in parallel from DB (both instant)
  let spots: Spot[] = [];
  let initialStations: WindStation[] = [];

  try {
    const [rawSpots, stationsCache] = await Promise.all([
      prisma.spot.findMany({ include: { images: true } }),
      prisma.systemConfig.findUnique({ where: { key: "stations_cache" } }),
    ]);

    spots = rawSpots.map((s: (typeof rawSpots)[number]) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      images: s.images.map((img: (typeof s.images)[number]) => ({
        ...img,
        createdAt: img.createdAt.toISOString(),
      })),
    }));

    if (stationsCache) {
      initialStations = JSON.parse(stationsCache.value);
    }
  } catch (err) {
    console.error(
      "[HomePage] DB error:",
      err instanceof Error ? err.message : err,
    );
  }

  return (
    <>
      <div
        className="relative bg-white"
        style={{ height: "calc(100dvh - 56px)" }}
      >
        <KiteMapLazy spots={spots} initialStations={initialStations} />
        <Link
          href="/?view=home"
          className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-sky-600"
        >
          {HOME_COPY[toSiteLocale(locale)].home}
        </Link>
      </div>
      <HomeDiscovery locale={locale} spots={spots} />
    </>
  );
}
