import type { Metadata } from "next";
import { ACCESS_COPY } from "./access";
import { ALPLAKES_GRUYERE } from "./lake-temperature";
import { LAKE_PAGE_COPY } from "./lake-page-copy";
import { DEFAULT_OG_IMAGE, HOME_SEO, localizedAlternates, localizedUrl, type SiteLocale } from "./site";
import { breadcrumbSchema, ORGANIZATION_ID, WEBSITE_ID } from "./public-seo";

export const LAKE_SEO = {
  fr: { heading: "Température de l’eau du lac de la Gruyère", title: "Température de l’eau du lac de la Gruyère et prévisions", description: "Consultez la température estimée du lac de la Gruyère à 1 m, son évolution et les prévisions Alplakes / Eawag. Modèle Simstrat, sans sonde locale." },
  en: { heading: "Lake Gruyère water temperature", title: "Lake Gruyère water temperature and forecast", description: "See the estimated water temperature of Lake Gruyère at 1 m depth, trends and Alplakes / Eawag forecasts. Simstrat model, without a local sensor." },
  de: { heading: "Wassertemperatur des Greyerzersees", title: "Wassertemperatur Greyerzersee und Prognose", description: "Geschätzte Wassertemperatur des Greyerzersees in 1 m Tiefe, Verlauf und Alplakes-/Eawag-Prognosen. Simstrat-Modell, ohne lokale Sonde." },
  it: { heading: "Temperatura dell’acqua del lago della Gruyère", title: "Temperatura dell’acqua del lago della Gruyère e previsioni", description: "Temperatura stimata del lago della Gruyère a 1 m, andamento e previsioni Alplakes / Eawag. Modello Simstrat, senza sonda locale." },
} as const;

export const TEMPERATURE_SEO = {
  fr: { title: "Températures de l’eau des lacs suisses", description: "Découvrez les lacs couverts par Openwind : première estimation pour la Gruyère à 1 m, issue du modèle Alplakes / Eawag. Sources et prévisions." },
  en: { title: "Swiss lake water temperatures", description: "Explore Openwind’s lake coverage: the first estimate covers Lake Gruyère at 1 m depth, using the Alplakes / Eawag model. Sources and forecasts." },
  de: { title: "Wassertemperaturen der Schweizer Seen", description: "Entdecken Sie Openwinds Abdeckung: die erste Schätzung für den Greyerzersee in 1 m Tiefe aus dem Alplakes-/Eawag-Modell. Quellen und Prognosen." },
  it: { title: "Temperature dell’acqua dei laghi svizzeri", description: "Scopri i laghi coperti da Openwind: prima stima per la Gruyère a 1 m dal modello Alplakes / Eawag. Fonti e previsioni." },
} as const;

export function lakeMetadata(locale: SiteLocale, enabled: boolean): Metadata {
  const c = LAKE_SEO[locale], url = localizedUrl(locale, "/lacs/gruyere");
  return { title: c.title, description: c.description, alternates: localizedAlternates(locale, "/lacs/gruyere"), robots: { index: enabled, follow: true },
    openGraph: { title: c.title, description: c.description, url, siteName: "Openwind", type: "website", locale: HOME_SEO[locale].openGraphLocale, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title: c.title, description: c.description, images: [DEFAULT_OG_IMAGE] },
  };
}

export function lakeSchema(locale: SiteLocale) {
  const c = ACCESS_COPY[locale], copy = LAKE_SEO[locale], url = localizedUrl(locale, "/lacs/gruyere");
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: copy.title, description: copy.description, inLanguage: locale, isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORGANIZATION_ID },
      mainEntity: { "@id": `${url}#dataset` }, about: { "@type": "Place", name: c.gruyere }, citation: [ALPLAKES_GRUYERE.page],
      // This licence belongs to the upstream data, not to the entire Openwind page.
      isBasedOn: { "@type": "CreativeWork", name: "Alplakes / Eawag – Simstrat", url: ALPLAKES_GRUYERE.page, license: ALPLAKES_GRUYERE.licence },
    },
    { "@type": "Dataset", "@id": `${url}#dataset`, url, name: copy.title,
      description: `${copy.description} ${LAKE_PAGE_COPY[locale].explanation} ${LAKE_PAGE_COPY[locale].sourceNote}`,
      inLanguage: locale, license: ALPLAKES_GRUYERE.licence,
      creator: { "@type": "Organization", name: "Eawag", url: "https://www.eawag.ch/" },
      publisher: { "@id": ORGANIZATION_ID },
      isBasedOn: { "@type": "Dataset", name: "Alplakes / Eawag – Simstrat, Gruyère", url: ALPLAKES_GRUYERE.page },
      spatialCoverage: { "@type": "Place", name: c.gruyere },
      measurementTechnique: "Simstrat (1D)",
      variableMeasured: { "@type": "PropertyValue", name: LAKE_PAGE_COPY[locale].reading, unitText: "°C", description: LAKE_PAGE_COPY[locale].depth },
      mainEntityOfPage: { "@id": `${url}#webpage` },
    },
    breadcrumbSchema([{ name: c.explorer, url: localizedUrl(locale, "/explorer") }, { name: c.temperatures, url: localizedUrl(locale, "/temperatures") }, { name: c.gruyere, url }]),
  ] };
}

export function temperatureCollectionSchema(locale: SiteLocale, enabled: boolean) {
  const c = ACCESS_COPY[locale], url = localizedUrl(locale, "/temperatures");
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: c.temperatures, description: c.waterIntro, inLanguage: locale, isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORGANIZATION_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: 1, itemListElement: [{ "@type": "ListItem", position: 1, item: { "@type": "WebPage", name: LAKE_PAGE_COPY[locale].title, url: enabled ? localizedUrl(locale, "/lacs/gruyere") : ALPLAKES_GRUYERE.page } }] },
    },
    breadcrumbSchema([{ name: c.explorer, url: localizedUrl(locale, "/explorer") }, { name: c.temperatures, url }]),
  ] };
}
