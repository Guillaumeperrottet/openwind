/**
 * SEO Utilities: Schema builders, meta descriptions, structured data
 * Best practices: schema.org, JSON-LD format
 */

import type { Spot, WindReport } from "@/generated/prisma/client";
import { DEFAULT_OG_IMAGE, SITE_URL, localizedUrl } from "@/lib/site";

type Locale = "fr" | "en" | "de" | "it";

// ── Locale-aware string tables ─────────────────────────────────────────────────

const SPORT_LABELS: Record<Locale, { kite: string; para: string }> = {
  fr: { kite: "Kitesurf", para: "Parapente" },
  en: { kite: "Kitesurfing", para: "Paragliding" },
  de: { kite: "Kitesurfen", para: "Gleitschirmfliegen" },
  it: { kite: "Kitesurf", para: "Parapendio" },
};

const SPOT_COPY: Record<
  Locale,
  {
    title: (sport: string, place: string) => string;
    introduction: (sport: string, place: string) => string;
    fallbackDescription: string;
    spotDe: (sport: string) => string;
  }
> = {
  fr: {
    title: (sport, place) => `${sport} à ${place} : vent en direct`,
    introduction: (sport, place) => `${place} : spot de ${sport.toLowerCase()}.`,
    fallbackDescription:
      "Consultez le vent, les prévisions et les informations du spot pour préparer votre sortie.",
    spotDe: (s) => `Spot de ${s}`,
  },
  en: {
    title: (sport, place) => `${sport} at ${place}: live wind`,
    introduction: (sport, place) => `${place}: ${sport.toLowerCase()} spot.`,
    fallbackDescription:
      "Check wind conditions, forecasts and spot information to plan your next session.",
    spotDe: (s) => `${s} spot`,
  },
  de: {
    title: (sport, place) => `${sport} in ${place}: Live-Wind`,
    introduction: (sport, place) => `${place}: Spot für ${sport}.`,
    fallbackDescription:
      "Windbedingungen, Vorhersagen und Spot-Informationen für die Planung deiner nächsten Session.",
    spotDe: (s) => `${s}-Spot`,
  },
  it: {
    title: (sport, place) => `${sport} a ${place}: vento in diretta`,
    introduction: (sport, place) => `${place}: spot di ${sport.toLowerCase()}.`,
    fallbackDescription:
      "Consulta il vento, le previsioni e le informazioni sullo spot per preparare la tua prossima uscita.",
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

type SpotIdentity = Pick<Spot, "name" | "sportType" | "region" | "country">;
type SpotDescriptions = Partial<
  Pick<Spot, "description" | "descriptionEn" | "descriptionDe" | "descriptionIt">
>;

function normalizeText(text: string | null | undefined): string {
  return text?.replace(/\s+/g, " ").trim() ?? "";
}

function spotLocation(spot: SpotIdentity, compact = false): string {
  const parts = [spot.region, spot.country].map(normalizeText).filter(Boolean);
  const unique = parts.filter(
    (part, index) =>
      parts.findIndex((other) => other.toLowerCase() === part.toLowerCase()) === index,
  );
  return (compact ? unique.slice(0, 1) : unique).join(", ");
}

function spotPlace(spot: SpotIdentity, compact = false): string {
  const name = normalizeText(spot.name);
  const location = spotLocation(spot, compact);
  return location && location.toLowerCase() !== name.toLowerCase()
    ? `${name} (${location})`
    : name;
}

function localizedSpotDescription(spot: SpotDescriptions, locale: Locale): string {
  const translated =
    locale === "en"
      ? spot.descriptionEn
      : locale === "de"
        ? spot.descriptionDe
        : locale === "it"
          ? spot.descriptionIt
          : spot.description;
  return normalizeText(translated) || normalizeText(spot.description);
}

/** The layout appends the brand; keep the spot's full name and real location. */
export function buildSpotTitle(spot: SpotIdentity, locale?: string): string {
  const l = toLocale(locale);
  const sport =
    spot.sportType === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;
  return SPOT_COPY[l].title(sport, spotPlace(spot, true));
}

/** Use editable local content, with a concise fallback for incomplete spots. */
export function buildSpotDescription(
  spot: SpotIdentity & SpotDescriptions,
  locale?: string,
): string {
  const l = toLocale(locale);
  const sport =
    spot.sportType === "KITE" ? SPORT_LABELS[l].kite : SPORT_LABELS[l].para;
  const copy = SPOT_COPY[l];
  const detail = localizedSpotDescription(spot, l) || copy.fallbackDescription;
  const description = `${copy.introduction(sport, spotPlace(spot))} ${detail}`;

  // An editorial length budget, not a guarantee of Google's snippet length.
  // Prefer word boundaries rather than cutting ordinary words in half.
  if (description.length <= 160) return description;
  const excerpt = description.slice(0, 159);
  const boundary = excerpt.lastIndexOf(" ");
  return `${(boundary > 0 ? excerpt.slice(0, boundary) : excerpt).trimEnd()}…`;
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
  > &
    SpotDescriptions & {
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
    description:
      localizedSpotDescription(spot, l) || buildSpotDescription(spot, locale),
    image: spot.images[0]?.url || DEFAULT_OG_IMAGE,
    datePublished: spot.createdAt.toISOString(),
    dateModified: spot.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Openwind",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Openwind",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo_noback.png`,
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
  > &
    SpotDescriptions & {
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
    description:
      localizedSpotDescription(spot, l).slice(0, 500) || SPOT_COPY[l].spotDe(sport),
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
  const homeUrl = localizedUrl(l);

  const breadcrumbs = [
    { name: home, url: homeUrl },
    { name: map, url: homeUrl },
    {
      name: sportLabel,
      url: `${homeUrl}?sport=${sport.toLowerCase()}`,
    },
  ];

  if (region) {
    breadcrumbs.push({
      name: region,
      url: `${homeUrl}?region=${encodeURIComponent(region)}`,
    });
  }

  breadcrumbs.push({
    name: spotName,
    url: localizedUrl(l, `/spots/${spotId}`),
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
