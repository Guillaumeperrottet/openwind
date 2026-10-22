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
    title: "Carte du vent en Suisse : balises et prévisions — Openwind",
    description:
      "Consultez la carte du vent en Suisse : balises, rafales et prévisions à 7 jours. Explorez les spots de kitesurf, de parapente et les guides des lacs.",
    socialDescription:
      "Vent en direct, prévisions 7 jours et archives pour le kitesurf et le parapente.",
    openGraphLocale: "fr_CH",
  },
  en: {
    title: "Switzerland wind map: live stations and forecasts — Openwind",
    description:
      "Explore the Switzerland wind map: live stations, gusts and 7-day forecasts. Find kitesurfing and paragliding spots, webcams and local lake guides.",
    socialDescription:
      "Live wind, 7-day forecasts and archives for kitesurfing and paragliding.",
    openGraphLocale: "en_US",
  },
  de: {
    title: "Windkarte Schweiz: Messstationen und Prognosen — Openwind",
    description:
      "Windkarte der Schweiz mit Messstationen, Böen und 7-Tage-Prognosen. Entdecke Kitesurf- und Gleitschirm-Spots, Webcams und lokale See-Guides.",
    socialDescription:
      "Live-Wind, 7-Tage-Prognosen und Archive für Kitesurfen und Gleitschirmfliegen.",
    openGraphLocale: "de_CH",
  },
  it: {
    title: "Mappa del vento in Svizzera: stazioni e previsioni — Openwind",
    description:
      "Consulta la mappa del vento in Svizzera: stazioni, raffiche e previsioni a 7 giorni. Esplora spot di kitesurf e parapendio, webcam e guide dei laghi.",
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
