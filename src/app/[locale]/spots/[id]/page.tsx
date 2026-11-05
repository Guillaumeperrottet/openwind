import { cache, Suspense } from "react";
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
  localizedAlternates,
  localizedUrl,
} from "@/lib/site";
import { SpotEditorial } from "@/components/spot/SpotEditorial";
import { editorialDisplayCopy } from "@/lib/neuchatel-seo-import";
import {
  getSpotEditorial,
  spotEditorialTitle,
  spotEditorialModified,
} from "@/lib/spot-editorials";
import { SpotPageClient } from "./SpotPageClient";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { WaterTemperature, WaterTemperatureLoading } from "@/components/spot/WaterTemperature";
import { MORLON_SPOT_ID } from "@/lib/lake-temperature";
import { lakePageEnabled } from "@/lib/lake-page-enabled";

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
    const storedSpot = await getSpot(id);
    if (!storedSpot) return { title: "Spot introuvable" };
    const spot = editorialDisplayCopy(storedSpot);

    // Derive metadata from the same editable fields as the visible spot page.
    const editorial = getSpotEditorial(id, locale);
    const title = editorial
      ? spotEditorialTitle(spot.name, editorial.locale)
      : buildSpotTitle(spot, locale);
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
  const showWaterTemperature = id === MORLON_SPOT_ID && lakePageEnabled();

  // A DB failure must remain a server error, rather than removing a real URL.
  const storedSpot = await getSpot(id);
  if (!storedSpot) notFound();
  const spot = editorialDisplayCopy(storedSpot);

  // ── Current wind via unified server entry point ─────────────────────────
  // getSpotLive: station fraîche (seuils par réseau) → vraie obs station.
  // Sinon → Open-Meteo.
  const editorial = getSpotEditorial(id, locale);
  const article = {
    ...buildArticleSchema(spot, locale),
    dateModified: spotEditorialModified(
      id,
      locale,
      spot.updatedAt,
    ).toISOString(),
    ...(editorial
      ? { citation: editorial.sources.map((source) => source.url) }
      : {}),
  };
  const [liveResult, forecastResult, adminResult] =
    await Promise.allSettled([
      getSpotLive(spot.id),
      fetchFullForecast(spot.latitude, spot.longitude),
      getAuthenticatedAdmin(),
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
              article,
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
        waterTemperature={showWaterTemperature ? <Suspense key="water-temperature" fallback={<WaterTemperatureLoading locale={locale} />}><WaterTemperature key="water-temperature-data" locale={locale} /></Suspense> : undefined}
        canEdit={adminResult.status === "fulfilled" && Boolean(adminResult.value)}
        initialForecast={
          forecastResult.status === "fulfilled" ? forecastResult.value : null
        }
      >
        <SpotEditorial id={id} locale={locale} />
      </SpotPageClient>
    </>
  );
}
