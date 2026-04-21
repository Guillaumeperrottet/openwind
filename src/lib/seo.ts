/**
 * SEO Utilities: Schema builders, meta descriptions, structured data
 * Best practices: schema.org, JSON-LD format
 */

import type { Spot, WindReport } from "@/generated/prisma/client";

/**
 * Build optimized meta description for a spot
 * Format: "{sport} à {lieu} - {angle unique} - Infos vent"
 * Target: ~155 characters (Google truncates at ~160 on desktop)
 */
export function buildSpotDescription(
  spot: Pick<Spot, "name" | "sportType" | "region" | "country" | "difficulty">,
): string {
  const sport = spot.sportType === "KITE" ? "Kitesurf" : "Parapente";
  const location = [spot.region, spot.country].filter(Boolean).join(", ");
  const difficultyLabel = getDifficultyLabel(spot.difficulty);

  // Tailored angle based on difficulty
  const angleMap: Record<string, string> = {
    BEGINNER: "pour débuter",
    INTERMEDIATE: "technique et accessible",
    ADVANCED: "pour confirmés",
    EXPERT: "spot expert",
  };
  const angle = angleMap[spot.difficulty] || "populaire";

  // Format: "Sport à Lieu - angle - Prévisions vent 7j"
  const description = location
    ? `${sport} à ${location} - spot ${angle} - Prévisions vent 7j, archives, avis`
    : `${sport} - spot ${angle} - Prévisions vent 7j et archives`;

  // Truncate to ~155 chars (Google SERP limit)
  return description.length > 155
    ? description.substring(0, 152) + "..."
    : description;
}

/**
 * Build Article schema (JSON-LD)
 * Used for better rich snippets and SEO signals
 */
export function buildArticleSchema(
  spot: Pick<
    Spot,
    | "id"
    | "name"
    | "description"
    | "sportType"
    | "region"
    | "country"
    | "difficulty"
    | "createdAt"
    | "updatedAt"
  > & {
    images: Array<{ url: string }>;
    reports: Array<WindReport>;
  },
) {
  const sport = spot.sportType === "KITE" ? "Kitesurf" : "Parapente";
  const location = [spot.region, spot.country].filter(Boolean).join(", ");
  const headline = location
    ? `${spot.name} — ${sport} à ${location}`
    : spot.name;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    name: spot.name,
    description: spot.description || buildSpotDescription(spot),
    image: spot.images[0]?.url || "https://openwind.ch/og-image.png",
    datePublished: spot.createdAt.toISOString(),
    dateModified: spot.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Openwind",
      url: "https://openwind.ch",
    },
    publisher: {
      "@type": "Organization",
      name: "Openwind",
      logo: {
        "@type": "ImageObject",
        url: "https://openwind.ch/logo.png",
      },
    },
  };

  // Add aggregate rating if reviews exist
  if (spot.reports.length > 0) {
    const avgRating = (
      spot.reports.reduce((sum, r) => sum + r.rating, 0) / spot.reports.length
    ).toFixed(1);

    return {
      ...article,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: spot.reports.length,
        bestRating: "5",
        worstRating: "1",
      },
    };
  }

  return article;
}

/**
 * Build Place schema (JSON-LD) with enhanced geo data
 * Used for local SEO and map display
 */
export function buildPlaceSchema(
  spot: Pick<
    Spot,
    | "name"
    | "description"
    | "latitude"
    | "longitude"
    | "country"
    | "region"
    | "difficulty"
    | "sportType"
    | "access"
  > & {
    images: Array<{ url: string }>;
  },
) {
  const sport = spot.sportType === "KITE" ? "Kitesurf" : "Parapente";

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: spot.name,
    description: spot.description
      ? spot.description.substring(0, 500)
      : `Spot de ${sport}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.latitude,
      longitude: spot.longitude,
    },
    image: spot.images[0]?.url,
    ...(spot.access && { areaServed: spot.access }),
    address: {
      "@type": "PostalAddress",
      ...(spot.region && { addressRegion: spot.region }),
      ...(spot.country && { addressCountry: spot.country }),
    },
  };
}

/**
 * Build BreadcrumbList schema (JSON-LD)
 * Format: Home > Spots > {Sport} > {Region} > {SpotName}
 */
export function buildBreadcrumbSchema(
  spotId: string,
  spotName: string,
  sport: "KITE" | "PARAGLIDE",
  region: string | null,
) {
  const sportLabel = sport === "KITE" ? "Kitesurf" : "Parapente";

  const breadcrumbs = [
    { name: "Accueil", url: "https://openwind.ch" },
    { name: "Carte", url: "https://openwind.ch" },
    {
      name: sportLabel,
      url: `https://openwind.ch?sport=${sport.toLowerCase()}`,
    },
  ];

  if (region) {
    breadcrumbs.push({
      name: region,
      url: `https://openwind.ch?region=${encodeURIComponent(region)}`,
    });
  }

  breadcrumbs.push({
    name: spotName,
    url: `https://openwind.ch/spots/${spotId}`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Helper: Get readable difficulty label
 */
function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    BEGINNER: "débutant",
    INTERMEDIATE: "intermédiaire",
    ADVANCED: "avancé",
    EXPERT: "expert",
  };
  return labels[difficulty] || "intermédiaire";
}

/**
 * Combine multiple schemas into a @graph structure
 * Used in <script type="application/ld+json">
 */
export function combineSchemas(
  ...schemas: Record<string, any>[]
): Record<string, any> {
  if (schemas.length === 1) return schemas[0];

  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}
