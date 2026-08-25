import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { KiteMapLazy } from "@/components/map/KiteMapLazy";
import type { Spot } from "@/types";
import type { WindStation } from "@/lib/stations";
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

export default async function HomePage() {
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
    <div className="bg-white" style={{ height: "calc(100dvh - 56px)" }}>
      <h1 className="sr-only">
        Openwind — Balises vent en direct, carte des spots de kitesurf et
        parapente
      </h1>
      <KiteMapLazy spots={spots} initialStations={initialStations} />
    </div>
  );
}
