export const SITE_URL = "https://www.openwind.ch";

export const SITE_LOCALES = ["fr", "en", "de", "it"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

export const DEFAULT_LOCALE: SiteLocale = "fr";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const HOME_SEO: Record<
  SiteLocale,
  {
    title: string;
    description: string;
    socialDescription: string;
    openGraphLocale: string;
  }
> = {
  fr: {
    title: "Openwind — Balises vent en direct, spots kitesurf et parapente",
    description:
      "Balises vent en direct, carte interactive des spots de kitesurf et parapente. Prévisions 7 jours, archives historiques et planificateur de voyages.",
    socialDescription:
      "Vent en direct, prévisions 7 jours et archives pour le kitesurf et le parapente.",
    openGraphLocale: "fr_CH",
  },
  en: {
    title: "Openwind — Live wind stations, kitesurf and paragliding spots",
    description:
      "Live wind stations and an interactive map of kitesurfing and paragliding spots, with 7-day forecasts, historical archives and a trip planner.",
    socialDescription:
      "Live wind, 7-day forecasts and archives for kitesurfing and paragliding.",
    openGraphLocale: "en_US",
  },
  de: {
    title: "Openwind — Live-Wind, Kitesurf- und Gleitschirm-Spots",
    description:
      "Live-Windstationen und interaktive Karte für Kitesurf- und Gleitschirm-Spots mit 7-Tage-Prognosen, Archiven und Reiseplaner.",
    socialDescription:
      "Live-Wind, 7-Tage-Prognosen und Archive für Kitesurfen und Gleitschirmfliegen.",
    openGraphLocale: "de_CH",
  },
  it: {
    title: "Openwind — Vento in diretta, spot kitesurf e parapendio",
    description:
      "Stazioni vento in diretta e mappa interattiva degli spot di kitesurf e parapendio, con previsioni a 7 giorni, archivi e pianificatore.",
    socialDescription:
      "Vento in diretta, previsioni a 7 giorni e archivi per kitesurf e parapendio.",
    openGraphLocale: "it_CH",
  },
};

export function toSiteLocale(locale: string): SiteLocale {
  return SITE_LOCALES.includes(locale as SiteLocale)
    ? (locale as SiteLocale)
    : DEFAULT_LOCALE;
}

export function localizedUrl(locale: string, path = ""): string {
  return `${SITE_URL}/${toSiteLocale(locale)}${path}`;
}

export function languageAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localizedUrl(DEFAULT_LOCALE, path),
  };

  for (const locale of SITE_LOCALES) {
    languages[locale] = localizedUrl(locale, path);
  }

  return languages;
}

export function localizedAlternates(locale: string, path = "") {
  return {
    canonical: localizedUrl(locale, path),
    languages: languageAlternates(path),
  };
}
