import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWindData } from "@/lib/utils";
import { getSpotLive, NETWORK_LABELS } from "@/lib/stationData";
import {
  buildSpotDescription,
  buildArticleSchema,
  buildPlaceSchema,
  buildBreadcrumbSchema,
  combineSchemas,
} from "@/lib/seo";
import type { WindData } from "@/types";
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

    // Build optimized, keyword-focused description
    const description = buildSpotDescription(spot);

    const base = `https://openwind.ch`;
    return {
      title: spot.name,
      description,
      alternates: {
        canonical: `${base}/${locale}/spots/${id}`,
        languages: {
          "x-default": `${base}/fr/spots/${id}`,
          fr: `${base}/fr/spots/${id}`,
          en: `${base}/en/spots/${id}`,
          de: `${base}/de/spots/${id}`,
          it: `${base}/it/spots/${id}`,
        },
      },
      openGraph: {
        title: `${spot.name} — Openwind`,
        description,
        url: `${base}/${locale}/spots/${id}`,
        type: "article",
        // Dynamic og:image generated via /api/og endpoint
        images: [
          {
            url: `https://openwind.ch/api/og?id=${id}`,
            width: 1200,
            height: 630,
            alt: spot.name,
          },
        ],
      },
    };
  } catch {
    return { title: "Spot" };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params;

  let spot;
  try {
    spot = await getSpot(id);
  } catch {
    notFound();
  }

  if (!spot) notFound();

  // ── Current wind via unified server entry point ─────────────────────────
  // getSpotLive: station fraîche (seuils par réseau) → DB obs. Sinon → Open-Meteo.
  // Remplace le bloc Prisma direct + table FRESHNESS_MS (9 lignes → 1 appel).
  let wind: WindData | null = null;
  let windSource: { name: string; network: string } | null = null;
  try {
    const live = await getSpotLive(spot.id);
    wind = getWindData(
      live.windSpeedKmh,
      live.windDirection,
      live.gustsKmh,
      live.updatedAt,
    );
    if (live.source === "station" && live.stationId) {
      windSource = {
        name: live.stationId,
        network: NETWORK_LABELS[live.network ?? "meteoswiss"],
      };
    }
  } catch {
    /* wind stays null — page shows "données indisponibles" */
  }

  // No fallback to Open-Meteo grid: getSpotLive already handles that internally.

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            combineSchemas(
              buildArticleSchema(spot),
              buildPlaceSchema(spot),
              buildBreadcrumbSchema(
                spot.id,
                spot.name,
                spot.sportType,
                spot.region,
              ),
            ),
          ),
        }}
      />
      <SpotPageClient
        spot={JSON.parse(JSON.stringify(spot))}
        wind={wind}
        windSource={windSource}
      />
    </>
  );
}
