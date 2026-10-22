import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSpotLive } from "@/lib/stationData";
import { fetchFullForecast } from "@/lib/forecast";
import {
  buildSpotTitle,
  buildSpotDescription,
  buildArticleSchema,
  buildPlaceSchema,
  buildBreadcrumbSchema,
  combineSchemas,
} from "@/lib/seo";
import {
  SITE_URL,
  toSiteLocale,
  localizedAlternates,
  localizedUrl,
} from "@/lib/site";
import { qualificationsFor } from "@/lib/planner-review-store";
import { localDate } from "@/lib/planner";
import { SpotPageClient } from "./SpotPageClient";

// Deduplicated Prisma query: shared across generateMetadata() and SpotPage()
// within the same request, so the DB is hit only once.
const getSpot = cache(async (id: string) => {
  return prisma.spot.findUnique({
    where: { id },
    include: {
      images: true,
      reports: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
});

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params;
  try {
    const spot = await getSpot(id);
    if (!spot) return { title: "Spot introuvable" };

    // Derive metadata from the same editable fields as the visible spot page.
    const title = buildSpotTitle(spot, locale);
    const description = buildSpotDescription(spot, locale);
    const socialImage = `${SITE_URL}/api/og?id=${id}`;

    return {
      title,
      description,
      alternates: localizedAlternates(locale, `/spots/${id}`),
      openGraph: {
        title: `${title} — Openwind`,
        description,
        url: localizedUrl(locale, `/spots/${id}`),
        type: "article",
        // Dynamic og:image generated via /api/og endpoint
        images: [
          {
            url: socialImage,
            width: 1200,
            height: 630,
            alt: spot.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — Openwind`,
        description,
        images: [socialImage],
      },
    };
  } catch {
    return { title: "Spot" };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id, locale } = await params;

  // A DB failure must remain a server error, rather than removing a real URL.
  const spot = await getSpot(id);
  if (!spot) notFound();

  // ── Current wind via unified server entry point ─────────────────────────
  // getSpotLive: station fraîche (seuils par réseau) → vraie obs station.
  // Sinon → Open-Meteo.
  const today = localDate(new Date());
  const [liveResult, forecastResult, qualificationResult] =
    await Promise.allSettled([
      getSpotLive(spot.id),
      fetchFullForecast(spot.latitude, spot.longitude),
      qualificationsFor([spot], today, today, today, toSiteLocale(locale)),
    ]);
  const live = liveResult.status === "fulfilled" ? liveResult.value : null;

  // No fallback to Open-Meteo grid: getSpotLive already handles that internally.

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            combineSchemas(
              buildArticleSchema(spot, locale),
              buildPlaceSchema(spot, locale),
              buildBreadcrumbSchema(spot.id, spot.name, locale),
            ),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <SpotPageClient
        key={spot.id}
        spot={JSON.parse(JSON.stringify(spot))}
        live={live}
        qualification={
          qualificationResult.status === "fulfilled"
            ? qualificationResult.value.get(spot.id)
            : undefined
        }
        initialForecast={
          forecastResult.status === "fulfilled" ? forecastResult.value : null
        }
      />
    </>
  );
}
