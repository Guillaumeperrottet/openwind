import { SITE_URL, type SiteLocale } from "./site";

export const ACCESS_COPY = {
  fr: { explorer: "Explorer", map: "Carte", plan: "Planifier", personal: "Mon Openwind", guides: "Guides locaux", carnet: "Carnet", forum: "Forum", webcams: "Webcams", temperatures: "Températures de l’eau", gruyere: "Lac de la Gruyère", stations: "Balises", spot: "Spot", station: "Balise", article: "Article", category: "Rubrique", topic: "Discussion", about: "À propos", contribute: "Ajouter un spot", back: "Retour", breadcrumb: "Fil d’Ariane", choose: "Choisissez un lieu pour regarder les conditions sur place.", searchPlaces: "Rechercher un lac ou une région", search: "Rechercher", empty: "Aucun lieu ne correspond à votre recherche.", mapSearch: "Trouver un spot sur la carte", waterIntro: "Les estimations de température disponibles pour préparer vos sorties.", waterCoverage: "La Gruyère est le premier lac intégré. Chaque estimation indique sa profondeur et sa source.", waterModel: "Estimation du modèle Simstrat à 1 m de profondeur.", waterUnavailable: "Estimation momentanément indisponible", waterOpen: "Voir l’évolution et les prévisions", waterSource: "Consulter Alplakes", valid: "Estimation pour le", waterNote: "Une température modélisée peut différer de celle mesurée au bord du lac." },
  en: { explorer: "Explore", map: "Map", plan: "Plan", personal: "My Openwind", guides: "Local guides", carnet: "Journal", forum: "Forum", webcams: "Webcams", temperatures: "Water temperatures", gruyere: "Lake Gruyère", stations: "Stations", spot: "Spot", station: "Station", article: "Article", category: "Category", topic: "Discussion", about: "About", contribute: "Add a spot", back: "Back", breadcrumb: "Breadcrumb", choose: "Choose a place to see conditions on location.", searchPlaces: "Search for a lake or region", search: "Search", empty: "No places match your search.", mapSearch: "Find a spot on the map", waterIntro: "Available water temperature estimates to plan your outings.", waterCoverage: "Gruyère is the first integrated lake. Each estimate identifies its depth and source.", waterModel: "Simstrat model estimate at 1 m depth.", waterUnavailable: "Estimate temporarily unavailable", waterOpen: "See trends and forecasts", waterSource: "Visit Alplakes", valid: "Estimate for", waterNote: "Modelled temperatures may differ from temperatures measured at the shore." },
  de: { explorer: "Entdecken", map: "Karte", plan: "Planen", personal: "Mein Openwind", guides: "Lokale Guides", carnet: "Journal", forum: "Forum", webcams: "Webcams", temperatures: "Wassertemperaturen", gruyere: "Greyerzersee", stations: "Messstationen", spot: "Spot", station: "Messstation", article: "Artikel", category: "Kategorie", topic: "Diskussion", about: "Über Openwind", contribute: "Spot hinzufügen", back: "Zurück", breadcrumb: "Navigationspfad", choose: "Wählen Sie einen Ort, um die Bedingungen vor Ort anzusehen.", searchPlaces: "See oder Region suchen", search: "Suchen", empty: "Keine Orte entsprechen Ihrer Suche.", mapSearch: "Spot auf der Karte finden", waterIntro: "Verfügbare Schätzungen der Wassertemperatur für Ihre Ausflüge.", waterCoverage: "Der Greyerzersee ist der erste integrierte See. Jede Schätzung nennt Tiefe und Quelle.", waterModel: "Schätzung des Simstrat-Modells in 1 m Tiefe.", waterUnavailable: "Schätzung vorübergehend nicht verfügbar", waterOpen: "Verlauf und Prognosen ansehen", waterSource: "Alplakes öffnen", valid: "Schätzung für", waterNote: "Modellierte Temperaturen können von Messungen am Ufer abweichen." },
  it: { explorer: "Esplora", map: "Mappa", plan: "Pianifica", personal: "Il mio Openwind", guides: "Guide locali", carnet: "Giornale", forum: "Forum", webcams: "Webcam", temperatures: "Temperature dell’acqua", gruyere: "Lago della Gruyère", stations: "Stazioni", spot: "Spot", station: "Stazione", article: "Articolo", category: "Categoria", topic: "Discussione", about: "Informazioni", contribute: "Aggiungi uno spot", back: "Indietro", breadcrumb: "Percorso di navigazione", choose: "Scegli un luogo per vedere le condizioni sul posto.", searchPlaces: "Cerca un lago o una regione", search: "Cerca", empty: "Nessun luogo corrisponde alla ricerca.", mapSearch: "Trova uno spot sulla mappa", waterIntro: "Le stime disponibili della temperatura dell’acqua per preparare le uscite.", waterCoverage: "La Gruyère è il primo lago integrato. Ogni stima indica profondità e fonte.", waterModel: "Stima del modello Simstrat a 1 m di profondità.", waterUnavailable: "Stima temporaneamente indisponibile", waterOpen: "Vedi andamento e previsioni", waterSource: "Consulta Alplakes", valid: "Stima per il", waterNote: "La temperatura modellata può differire dalle misure a riva." },
} as const;

export type JourneyReturn = { href: string; title: string };
export type AccessCrumb = { label: string; href?: string };

export function withoutLocale(path: string) {
  return path.replace(/^\/(fr|en|de|it)(?=\/|$)/, "") || "/";
}

/** Only public, internal destinations can become a return link. */
export function safeReturnPath(value: unknown, locale: SiteLocale): string | null {
  if (typeof value !== "string" || value.length > 2500 || /[\\\u0000-\u001f]/.test(value)) return null;
  if (value.startsWith("//")) return null;
  if (!value.startsWith("/") && !value.startsWith(`${SITE_URL}/`) && !value.startsWith("https://openwind.ch/")) return null;
  try {
    const url = new URL(value, SITE_URL);
    if (![new URL(SITE_URL).origin, "https://openwind.ch"].includes(url.origin) || url.username || url.password || /%2f|%5c/i.test(url.pathname)) return null;
    const path = withoutLocale(url.pathname);
    if (!/^\/(?:$|explorer(?:\/|$)|recherche(?:\/|$)|temperatures(?:\/|$)|lacs(?:\/|$)|spots(?:\/|$)|stations(?:\/|$)|balises(?:\/|$)|webcams(?:\/|$)|vent-en-direct(?:\/|$)|carnet(?:\/|$)|forum(?:\/|$)|plan(?:\/|$)|mon-openwind(?:\/|$)|about(?:\/|$))/.test(path)) return null;
    for (const key of [...url.searchParams.keys()]) if (/token|password|secret|^code$|email|api.?key/i.test(key)) url.searchParams.delete(key);
    const hash = /^#[\w:-]{1,100}$/.test(url.hash) ? url.hash : "";
    const pathname = /^\/(fr|en|de|it)(?=\/|$)/.test(url.pathname) ? url.pathname : `/${locale}${path === "/" ? "" : path}`;
    return pathname + url.search + hash;
  } catch { return null; }
}

export function journeyKey(href: string) {
  const url = new URL(href, SITE_URL);
  url.hash = "";
  url.searchParams.delete("back");
  url.searchParams.sort();
  return url.pathname + url.search;
}

export function accessRoute(pathname: string, locale: SiteLocale): { frame: boolean; crumbs: AccessCrumb[]; parent?: JourneyReturn } {
  const path = withoutLocale(pathname), c = ACCESS_COPY[locale];
  const href = (p: string) => `/${locale}${p}`;
  const explorer = { label: c.explorer, href: href("/explorer") };
  const route = (label: string, parent: { label: string; href: string } = explorer): ReturnType<typeof accessRoute> => ({ frame: true, crumbs: [explorer, ...(parent.href !== explorer.href ? [parent] : []), { label }], parent: { href: parent.href, title: parent.label } });
  // Existing spot/station pages are the design reference and remain untouched.
  if (path === "/" || path === "/explorer" || path === "/balises" || path.startsWith("/admin") || path.startsWith("/stations/") || (path.startsWith("/spots/") && path !== "/spots/new")) return { frame: false, crumbs: [] };
  if (path === "/plan") return { frame: true, crumbs: [{ label: c.plan }] };
  if (path === "/mon-openwind") return { frame: true, crumbs: [{ label: c.personal }] };
  if (path === "/recherche") return route(({ fr: "Recherche", en: "Search", de: "Suche", it: "Ricerca" })[locale]);
  if (path === "/temperatures") return route(c.temperatures);
  if (path === "/lacs/gruyere") return route(c.gruyere, { label: c.temperatures, href: href("/temperatures") });
  if (path === "/webcams") return route(c.webcams);
  if (path === "/about") return route(c.about);
  if (path === "/spots/new") return route(c.contribute);
  if (path === "/vent-en-direct") return route(c.guides);
  if (path.startsWith("/vent-en-direct/")) return route(({ fr: "Guide", en: "Guide", de: "Guide", it: "Guida" })[locale], { label: c.guides, href: `/${locale === "en" ? "fr" : locale}/vent-en-direct` });
  if (path === "/carnet") return route(c.carnet);
  if (path.startsWith("/carnet/")) return route(c.article, { label: c.carnet, href: "/fr/carnet" });
  if (path === "/forum") return route(c.forum);
  if (path.startsWith("/forum/")) {
    const pieces = path.split("/").filter(Boolean);
    if (pieces.length > 2) {
      const parent = { label: c.category, href: href(`/forum/${pieces[1]}`) };
      return { frame: true, crumbs: [explorer, { label: c.forum, href: href("/forum") }, parent, { label: c.topic }], parent: { href: parent.href, title: parent.label } };
    }
    return route(c.category, { label: c.forum, href: href("/forum") });
  }
  return { frame: false, crumbs: [] };
}

export function returnTitle(href: string, locale: SiteLocale, place?: string) {
  const path = withoutLocale(new URL(href, SITE_URL).pathname), c = ACCESS_COPY[locale];
  if (path === "/") return c.map;
  if (path.startsWith("/spots/")) return place || c.spot;
  if (path.startsWith("/stations/")) return place || c.station;
  if (path.startsWith("/vent-en-direct/")) return place || c.guides;
  if (path === "/lacs/gruyere") return c.gruyere;
  return accessRoute(path, locale).crumbs.at(-1)?.label ?? c.explorer;
}
