import { LOCAL_GUIDES, isGuideLocale } from "./local-guides";
import { toSiteLocale, type SiteLocale } from "./site";

export const SEARCH_KINDS = [
  "lake",
  "spot",
  "station",
  "webcam",
  "article",
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
export function searchEntries(
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
          : entry.kind === "lake"
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
  const counts = new Map<SearchKind, number>();
  return scored
    .filter(({ entry }) => {
      const count = counts.get(entry.kind) ?? 0;
      counts.set(entry.kind, count + 1);
      return count < (requestedKind ? 10 : 3);
    })
    .slice(0, 15)
    .map(({ entry }) => ({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      subtitle: entry.subtitle,
      href: entry.href,
    }));
}

export const SEARCH_COPY = {
  fr: {
    label: "Rechercher dans Openwind",
    placeholder: "Lac, spot, balise, webcam, article…",
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
      lake: "Lacs et guides",
      spot: "Spots",
      station: "Balises",
      webcam: "Webcams autour du lieu",
      article: "Articles",
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
    },
  },
} satisfies Record<SiteLocale, object>;
