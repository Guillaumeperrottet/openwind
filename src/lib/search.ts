import { LOCAL_GUIDES, isGuideLocale } from "./local-guides";
import { ACCESS_COPY } from "./access";
import { PLACE_COPY } from "./place";
import { toSiteLocale, type SiteLocale } from "./site";

export const SEARCH_KINDS = [
  "lake",
  "spot",
  "station",
  "webcam",
  "article",
  "water",
  "page",
  "discussion",
] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];
export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  terms: string;
}
export type SearchResult = Omit<SearchEntry, "terms">;
export interface SearchResponse {
  results: SearchResult[];
  partial: boolean;
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function webcamPath(
  lat: number,
  lng: number,
  name: string,
  locale: string,
) {
  return `/${toSiteLocale(locale)}/webcams?${new URLSearchParams({ lat: String(lat), lng: String(lng), name })}`;
}

export function guideSearchEntries(locale: SiteLocale): SearchEntry[] {
  const language = isGuideLocale(locale) ? locale : "fr";
  return LOCAL_GUIDES.flatMap((guide) => {
    const translation = guide.translations[language] ?? guide.translations.fr;
    const terms = [
      guide.slug,
      guide.region,
      ...(guide.aliases ?? []),
      ...Object.values(guide.translations).flatMap((copy) =>
        copy ? [copy.place, copy.title] : [],
      ),
    ].join(" ");
    return [
      {
        id: guide.slug,
        kind: "lake" as const,
        title: translation.place,
        subtitle:
          locale === "en" ? "Local guide · Français" : translation.description,
        href: `/${language}/vent-en-direct/${guide.slug}`,
        terms,
      },
      {
        id: `lake-${guide.slug}`,
        kind: "webcam" as const,
        title: translation.place,
        subtitle: SEARCH_COPY[locale].nearby,
        href: webcamPath(
          guide.coordinates.lat,
          guide.coordinates.lng,
          translation.place,
          locale,
        ),
        terms,
      },
    ];
  });
}

/** Exact names and word prefixes beat description matches. No unrelated fuzzy results. */
export function rankSearchEntries(
  entries: SearchEntry[],
  query: string,
  kind?: SearchKind,
  favoriteIds: string[] = [],
): SearchResult[] {
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  const favorites = new Set(favoriteIds);
  const requestedKind =
    kind ??
    (words.some((word) =>
      ["webcam", "webcams", "camera", "cameras", "kamera"].includes(word),
    )
      ? "webcam"
      : undefined);
  const kindTerms: Record<SearchKind, string> = {
    lake: "lac lacs lake lakes see seen lago laghi guide guides",
    spot: "spot spots kite kitesurf parapente paragliding gleitschirm parapendio",
    station:
      "balise balises station stations windstation messstation meteo meteoswiss pioupiou windball netatmo",
    webcam: "webcam webcams camera cameras kamera",
    article: "article articles carnet lesen leggere read",
    water: "eau temperature temperatures water wasser acqua alplakes",
    page: "fonction fonctionnalite fonctionnalites feature features funktion funzioni page pages",
    discussion: "forum discussion discussions sujet sujets topic topics fragen domande",
  };
  const scored = entries
    .filter((entry) => !requestedKind || entry.kind === requestedKind)
    .map((entry) => {
      const title = normalizeSearch(entry.title);
      const terms = normalizeSearch(
        `${entry.title} ${entry.subtitle} ${entry.terms}`,
      );
      const searchable = `${terms} ${kindTerms[entry.kind]}`;
      const score = words.length
        ? words.every((word) => searchable.includes(word))
          ? 10 +
            words.reduce(
              (sum, word) =>
                sum +
                (title === word
                  ? 20
                  : title.split(" ").some((part) => part.startsWith(word))
                    ? 8
                    : title.includes(word)
                      ? 4
                      : 0),
              0,
            ) +
            (entry.kind === "lake" ||
            (entry.kind === "webcam" && entry.id.startsWith("lake-"))
              ? 3
              : 0)
          : 0
        : favorites.has(`${entry.kind}:${entry.id}`)
          ? 100
          : requestedKind || entry.kind === "lake"
            ? 5
            : 0;
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.entry.title.localeCompare(b.entry.title) ||
        a.entry.id.localeCompare(b.entry.id),
    );
  return scored.map(({ entry }) => ({ id: entry.id, kind: entry.kind, title: entry.title, subtitle: entry.subtitle, href: entry.href }));
}

export function searchEntries(entries: SearchEntry[], query: string, kind?: SearchKind, favoriteIds: string[] = []): SearchResult[] {
  const requestedKind = kind || (normalizeSearch(query).split(" ").some(word => ["webcam", "webcams", "camera", "cameras", "kamera"].includes(word)) ? "webcam" : undefined);
  const counts = new Map<SearchKind, number>();
  return rankSearchEntries(entries, query, kind, favoriteIds)
    .filter((entry) => {
      const count = counts.get(entry.kind) ?? 0;
      counts.set(entry.kind, count + 1);
      return count < (requestedKind ? 10 : 3);
    })
    .slice(0, 18);
}

export const SEARCH_COPY = {
  fr: {
    label: "Rechercher dans Openwind",
    placeholder: "Lieu, météo, webcam, article…",
    short: "Rechercher dans Openwind…",
    clear: "Effacer la recherche",
    loading: "Recherche en cours…",
    empty: "Aucun résultat. Essayez un nom de lieu ou une autre orthographe.",
    error: "La recherche est momentanément indisponible. Réessayer",
    partial: "Certains résultats sont momentanément indisponibles.",
    suggestions: "Pour commencer",
    count: "résultats",
    nearby:
      "Rechercher les webcams autour de ce lieu · disponibilité selon les fournisseurs",
    favorites: "Favori",
    all: "Tout",
    kinds: {
      lake: "Guides des lacs",
      spot: "Spots",
      station: "Balises",
      webcam: "Webcams autour du lieu",
      article: "Articles",
      water: PLACE_COPY.fr.waterKind, page: PLACE_COPY.fr.page, discussion: PLACE_COPY.fr.discussion,
    },
  },
  de: {
    label: "Openwind durchsuchen",
    placeholder: "See, Spot, Windstation, Webcam, Artikel…",
    short: "Openwind durchsuchen…",
    clear: "Suche löschen",
    loading: "Suche läuft…",
    empty:
      "Keine Ergebnisse. Versuche einen Ortsnamen oder eine andere Schreibweise.",
    error: "Die Suche ist vorübergehend nicht verfügbar. Erneut versuchen",
    partial: "Einige Ergebnisse sind vorübergehend nicht verfügbar.",
    suggestions: "Hier starten",
    count: "Ergebnisse",
    nearby: "Webcams in der Umgebung suchen · Verfügbarkeit je nach Anbieter",
    favorites: "Favorit",
    all: "Alle",
    kinds: {
      lake: "Seen und Guides",
      spot: "Spots",
      station: "Windstationen",
      webcam: "Webcams in der Umgebung",
      article: "Artikel",
      water: PLACE_COPY.de.waterKind, page: PLACE_COPY.de.page, discussion: PLACE_COPY.de.discussion,
    },
  },
  it: {
    label: "Cerca in Openwind",
    placeholder: "Lago, spot, stazione, webcam, articolo…",
    short: "Cerca in Openwind…",
    clear: "Cancella la ricerca",
    loading: "Ricerca in corso…",
    empty: "Nessun risultato. Prova un nome di luogo o una grafia diversa.",
    error: "Ricerca temporaneamente non disponibile. Riprova",
    partial: "Alcuni risultati sono temporaneamente non disponibili.",
    suggestions: "Da dove iniziare",
    count: "risultati",
    nearby:
      "Cerca webcam intorno a questo luogo · disponibilità secondo i fornitori",
    favorites: "Preferito",
    all: "Tutti",
    kinds: {
      lake: "Laghi e guide",
      spot: "Spot",
      station: "Stazioni",
      webcam: "Webcam nei dintorni",
      article: "Articoli",
      water: PLACE_COPY.it.waterKind, page: PLACE_COPY.it.page, discussion: PLACE_COPY.it.discussion,
    },
  },
  en: {
    label: "Search Openwind",
    placeholder: "Lake, spot, wind station, webcam, article…",
    short: "Search Openwind…",
    clear: "Clear search",
    loading: "Searching…",
    empty: "No results. Try a place name or a different spelling.",
    error: "Search is temporarily unavailable. Try again",
    partial: "Some results are temporarily unavailable.",
    suggestions: "Start exploring",
    count: "results",
    nearby: "Find webcams near this place · availability depends on providers",
    favorites: "Favourite",
    all: "All",
    kinds: {
      lake: "Lakes and guides",
      spot: "Spots",
      station: "Wind stations",
      webcam: "Nearby webcams",
      article: "Articles",
      water: PLACE_COPY.en.waterKind, page: PLACE_COPY.en.page, discussion: PLACE_COPY.en.discussion,
    },
  },
} satisfies Record<SiteLocale, object>;


/** All public app destinations remain discoverable even during a database outage. */
export function appSearchEntries(locale: SiteLocale): SearchEntry[] {
  const c = ACCESS_COPY[locale], p = PLACE_COPY[locale];
  const pages: [string, string, string, string][] = [
    ["explorer", c.explorer, "lieux conditions decouvrir discover entdecken esplora", c.waterIntro],
    ["balises", c.stations, "vent mesure direct meteo wind stations capteurs", p.allWind],
    ["webcams", c.webcams, "camera cameras regarder images live", c.choose],
    ["temperatures", c.temperatures, "eau water wasser acqua temperature temperatures alplakes eawag", c.waterCoverage],
    ["plan", c.plan, "sortie creneau prevision forecast weekend demain kite parapente", ({fr:"Trouver un créneau pour votre prochaine sortie.",en:"Find a window for your next outing.",de:"Ein Zeitfenster für den nächsten Ausflug finden.",it:"Trova una finestra per la prossima uscita."})[locale]],
    ["mon-openwind", c.personal, "favoris favoris recherches enregistrees articles lire plus tard preferences compte favorites saved", ({fr:"Vos favoris, recherches et lectures enregistrées.",en:"Your favourites, saved searches and reading list.",de:"Favoriten, gespeicherte Suchen und Leseliste.",it:"Preferiti, ricerche salvate e letture."})[locale]],
    ["vent-en-direct", c.guides, "lac lacs lake lakes guide guides vent local", p.guide],
    ["carnet", c.carnet, "article articles conseils apprendre comprendre recits journal", ({fr:"Conseils et récits pour mieux connaître le terrain.",en:"Advice and stories to understand the terrain.",de:"Tipps und Geschichten über die Bedingungen vor Ort.",it:"Consigli e racconti per conoscere il territorio."})[locale]],
    ["forum", c.forum, "discussion discussions question aide help communaute community", p.discussion],
    ["spots/new", c.contribute, "ajouter creer contribuer contribution nouveau spot compte", c.contribute],
    ["about", c.about, "a propos contact open source sources donnees projet openwind", c.about],
  ];
  return pages.map(([path, title, terms, subtitle]) => ({ id: `page-${path}`, kind: "page", title, subtitle, terms, href: `/${(path === "carnet" || path === "vent-en-direct") && locale === "en" ? "fr" : locale}/${path}` }));
}
