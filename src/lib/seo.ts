/**
 * SEO Utilities: Schema builders, meta descriptions, structured data
 * Best practices: schema.org, JSON-LD format
 */

import type { Spot, WindReport } from "@/generated/prisma/client";

type Locale = "fr" | "en" | "de" | "it";

// ── Locale-aware string tables ─────────────────────────────────────────────────

const SPORT_LABELS: Record<Locale, { kite: string; para: string }> = {
  fr: { kite: "Kitesurf", para: "Parapente" },
  en: { kite: "Kitesurfing", para: "Paragliding" },
  de: { kite: "Kitesurfen", para: "Gleitschirmfliegen" },
  it: { kite: "Kitesurf", para: "Parapendio" },
};

const DIFFICULTY_LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    BEGINNER: "pour débuter",
    INTERMEDIATE: "technique et accessible",
    ADVANCED: "pour confirmés",
    EXPERT: "spot expert",
    default: "populaire",
  },
  en: {
    BEGINNER: "for beginners",
    INTERMEDIATE: "technical and accessible",
    ADVANCED: "for advanced riders",
    EXPERT: "expert spot",
    default: "popular",
  },
  de: {
    BEGINNER: "für Einsteiger",
    INTERMEDIATE: "technisch und zugänglich",
    ADVANCED: "für Fortgeschrittene",
    EXPERT: "Expertenspot",
    default: "beliebt",
  },
  it: {
    BEGINNER: "per principianti",
    INTERMEDIATE: "tecnico e accessibile",
    ADVANCED: "per esperti",
    EXPERT: "spot esperto",
    default: "popolare",
  },
};

const DESC_TEMPLATES: Record<
  Locale,
  {
    withLocation: (sport: string, loc: string, angle: string) => string;
    withoutLocation: (sport: string, angle: string) => string;
    spotDe: (sport: string) => string;
  }
> = {
  fr: {
    withLocation: (s, l, a) =>
      `${s} à ${l} - spot ${a} - Prévisions vent 7j, archives, avis`,
    withoutLocation: (s, a) =>
      `${s} - spot ${a} - Prévisions vent 7j et archives`,
    spotDe: (s) => `Spot de ${s}`,
  },
  en: {
    withLocation: (s, l, a) =>
      `${s} in ${l} - ${a} spot - 7-day wind forecasts, archives, reviews`,
    withoutLocation: (s, a) =>
      `${s} - ${a} spot - 7-day wind forecasts and archives`,
    spotDe: (s) => `${s} spot`,
  },
  de: {
    withLocation: (s, l, a) =>
      `${s} in ${l} - ${a} Spot - 7-Tage Windvorhersagen, Archive, Bewertungen`,
    withoutLocation: (s, a) =>
      `${s} - ${a} Spot - 7-Tage Windvorhersagen und Archive`,
    spotDe: (s) => `${s}-Spot`,
  },
  it: {
    withLocation: (s, l, a) =>
      `${s} a ${l} - spot ${a} - Previsioni vento 7 giorni, archivi, recensioni`,
    withoutLocation: (s, a) =>
      `${s} - spot ${a} - Previsioni vento 7 giorni e archivi`,
    spotDe: (s) => `Spot di ${s}`,
  },
};

const BREADCRUMB_LABELS: Record<Locale, { home: string; map: string }> = {
  fr: { home: "Accueil", map: "Carte" },
  en: { home: "Home", map: "Map" },
  de: { home: "Startseite", map: "Karte" },
  it: { home: "Home", map: "Mappa" },
};

/** Resolve locale string to typed Locale, defaulting to "fr". */
function toLocale(locale?: string): Locale {
  if (locale === "en" || locale === "de" || locale === "it") return locale;
  return "fr";
}

/**
 * Build optimized meta description for a spot
 * Format: "{sport} à {lieu} - {angle unique} - Infos vent"
 * Target: ~155 characters (Google truncates at ~160 on desktop)
 */
export function buildSpotDescription(
  spot: Pick<Spot, "name" | "sportType" | "region" | "country" | "difficulty">,
  locale?: string,
): string {
  const l = toLocale(locale);
  const sport =
    spot.sportType === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;
  const location = [spot.region, spot.country].filter(Boolean).join(", ");
  const angle =
    DIFFICULTY_LABELS[l][spot.difficulty] ?? DIFFICULTY_LABELS[l].default;
  const tpl = DESC_TEMPLATES[l];

  const description = location
    ? tpl.withLocation(sport, location, angle)
    : tpl.withoutLocation(sport, angle);

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
  locale?: string,
) {
  const l = toLocale(locale);
  const sport =
    spot.sportType === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;
  const location = [spot.region, spot.country].filter(Boolean).join(", ");
  const inPrep = l === "en" ? "in" : l === "de" ? "in" : l === "it" ? "a" : "à";
  const headline = location
    ? `${spot.name} — ${sport} ${inPrep} ${location}`
    : spot.name;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    name: spot.name,
    description: spot.description || buildSpotDescription(spot, locale),
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
  locale?: string,
) {
  const l = toLocale(locale);
  const sport =
    spot.sportType === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: spot.name,
    description: spot.description
      ? spot.description.substring(0, 500)
      : DESC_TEMPLATES[l].spotDe(sport),
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
 * Format: Home > Map > {Sport} > {Region} > {SpotName}
 */
export function buildBreadcrumbSchema(
  spotId: string,
  spotName: string,
  sport: "KITE" | "PARAGLIDE",
  region: string | null,
  locale?: string,
) {
  const l = toLocale(locale);
  const sportLabel =
    sport === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;
  const { home, map } = BREADCRUMB_LABELS[l];

  const breadcrumbs = [
    { name: home, url: "https://openwind.ch" },
    { name: map, url: "https://openwind.ch" },
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
 * Combine multiple schemas into a @graph structure
 * Used in <script type="application/ld+json">
 */
type JsonLike =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonLike }
  | JsonLike[];

export function combineSchemas(
  ...schemas: Record<string, JsonLike>[]
): Record<string, JsonLike> {
  if (schemas.length === 1) return schemas[0];

  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}
