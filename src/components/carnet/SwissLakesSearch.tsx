"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  ArrowDown,
  BookOpen,
  ExternalLink,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SwissLakesRegulationMap = dynamic(
  () =>
    import("./SwissLakesRegulationMap").then(
      (module) => module.SwissLakesRegulationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] animate-pulse bg-slate-100 sm:h-[460px]" />
    ),
  },
);

type LakeStatus = "restricted" | "forbidden" | "unverified";

interface LakeSearchEntry {
  id: string;
  name: string;
  aliases?: string[];
  region: string;
  status: LakeStatus;
  detail: string;
  target: string;
  sourceUrl?: string;
  center: [number, number];
  zoom: number;
}

const OFFICIAL_SOURCES = {
  vaud:
    "https://www.vd.ch/actualites/decisions-du-conseil-detat/seance-du-conseil-detat/decision/id/e8e3c0ec-d593-3766-84e0-c75c876d0365",
  fribourg:
    "https://bdlf.fr.ch/api/fr/versions/8441/pdf_file_with_annexes",
  zurich:
    "https://www.zh.ch/de/sicherheit-justiz/sicher-unterwegs/sicherheit-auf-gewaessern.html",
} as const;

const LAKES: LakeSearchEntry[] = [
  {
    id: "leman",
    name: "Lac Léman",
    aliases: ["lac de Genève", "Genfersee", "Lake Geneva"],
    region: "Vaud · Genève",
    status: "restricted",
    detail: "Autorisé avec restrictions selon la rive",
    target: "lac-leman-autorise-avec-restrictions",
    center: [6.5, 46.45],
    zoom: 8.2,
  },
  {
    id: "neuchatel",
    name: "Lac de Neuchâtel",
    aliases: ["Neuenburgersee"],
    region: "NE · VD · FR · BE",
    status: "restricted",
    detail: "Autorisé avec zones protégées et règles locales",
    target: "lac-de-neuchatel-autorise-avec-restrictions",
    center: [6.86, 46.92],
    zoom: 8.5,
  },
  {
    id: "joux",
    name: "Lac de Joux",
    region: "Vaud",
    status: "restricted",
    detail: "Autorisé dans les limites fixées par le canton",
    target: "lac-de-joux-autorise-avec-restrictions",
    center: [6.27, 46.64],
    zoom: 10.2,
  },
  {
    id: "vernex",
    name: "Lac du Vernex",
    aliases: ["lac de Rossinière", "Rossinière"],
    region: "Vaud",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-du-vernex-rossiniere-interdit",
    sourceUrl: OFFICIAL_SOURCES.vaud,
    center: [7.0713, 46.4638],
    zoom: 13,
  },
  {
    id: "brenet",
    name: "Lac Brenet",
    region: "Vaud",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-brenet-lac-de-bret-et-lac-de-l-hongrin-interdits",
    sourceUrl: OFFICIAL_SOURCES.vaud,
    center: [6.3241, 46.6724],
    zoom: 11.8,
  },
  {
    id: "bret",
    name: "Lac de Bret",
    region: "Vaud",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-brenet-lac-de-bret-et-lac-de-l-hongrin-interdits",
    sourceUrl: OFFICIAL_SOURCES.vaud,
    center: [6.7732, 46.5132],
    zoom: 12,
  },
  {
    id: "hongrin",
    name: "Lac de l’Hongrin",
    aliases: ["Hongrin"],
    region: "Vaud",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-brenet-lac-de-bret-et-lac-de-l-hongrin-interdits",
    sourceUrl: OFFICIAL_SOURCES.vaud,
    center: [7.0504, 46.4222],
    zoom: 10.8,
  },
  {
    id: "gruyere",
    name: "Lac de la Gruyère",
    aliases: ["Gruyère"],
    region: "Fribourg",
    status: "restricted",
    detail: "Autorisé hors de deux zones d’exclusion",
    target: "lac-de-la-gruyere-autorise-avec-restrictions",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [7.1, 46.66],
    zoom: 10,
  },
  {
    id: "morat",
    name: "Lac de Morat",
    aliases: ["Murtensee", "Murten"],
    region: "Fribourg · Vaud",
    status: "restricted",
    detail: "Autorisé côté fribourgeois, interdit côté vaudois",
    target: "lac-de-morat-autorise-avec-restrictions",
    center: [7.08, 46.93],
    zoom: 10,
  },
  {
    id: "schiffenen",
    name: "Lac de Schiffenen",
    aliases: ["Schiffenensee"],
    region: "Fribourg",
    status: "restricted",
    detail: "Autorisé sur une partie seulement",
    target: "lac-de-schiffenen-autorise-sur-une-partie-seulement",
    center: [7.16, 46.99],
    zoom: 10.5,
  },
  {
    id: "lac-noir",
    name: "Lac Noir",
    aliases: ["Schwarzsee"],
    region: "Fribourg",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-noir-montsalvens-lessoc-lussy-et-seedorf-interdits",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [7.2818, 46.6651],
    zoom: 12,
  },
  {
    id: "montsalvens",
    name: "Lac de Montsalvens",
    aliases: ["Montsalvenssee"],
    region: "Fribourg",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-noir-montsalvens-lessoc-lussy-et-seedorf-interdits",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [7.1468, 46.6154],
    zoom: 11.7,
  },
  {
    id: "lessoc",
    name: "Lac de Lessoc",
    aliases: ["lac de Montbovon", "Montbovon"],
    region: "Fribourg",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-noir-montsalvens-lessoc-lussy-et-seedorf-interdits",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [7.0507, 46.4971],
    zoom: 12,
  },
  {
    id: "lussy",
    name: "Lac de Lussy",
    region: "Fribourg",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-noir-montsalvens-lessoc-lussy-et-seedorf-interdits",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [6.9, 46.5439],
    zoom: 14,
  },
  {
    id: "seedorf",
    name: "Lac de Seedorf",
    aliases: ["Seedorfsee"],
    region: "Fribourg",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-noir-montsalvens-lessoc-lussy-et-seedorf-interdits",
    sourceUrl: OFFICIAL_SOURCES.fribourg,
    center: [7.0403, 46.7959],
    zoom: 13.5,
  },
  {
    id: "bienne",
    name: "Lac de Bienne",
    aliases: ["Bielersee", "Biel"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
    center: [7.17, 47.1],
    zoom: 9.5,
  },
  {
    id: "thoune",
    name: "Lac de Thoune",
    aliases: ["Thunersee", "Thun"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
    center: [7.72, 46.69],
    zoom: 9.5,
  },
  {
    id: "brienz",
    name: "Lac de Brienz",
    aliases: ["Brienzersee"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
    center: [7.97, 46.73],
    zoom: 9.6,
  },
  {
    id: "zurich",
    name: "Lac de Zurich",
    aliases: ["Zürichsee", "Zurichsee"],
    region: "ZH · SG · SZ",
    status: "restricted",
    detail: "Le statut change selon le canton",
    target: "lac-de-zurich-statut-different-selon-le-canton",
    center: [8.65, 47.25],
    zoom: 9,
  },
  {
    id: "walensee",
    name: "Walensee",
    aliases: ["lac de Walenstadt"],
    region: "Saint-Gall · Glaris",
    status: "restricted",
    detail: "Autorisé avec plusieurs zones fermées",
    target: "walensee-autorise-avec-restrictions",
    center: [9.2, 47.12],
    zoom: 9.5,
  },
  {
    id: "sempach",
    name: "Lac de Sempach",
    aliases: ["Sempachersee"],
    region: "Lucerne",
    status: "restricted",
    detail: "Seul le secteur sud est ouvert",
    target: "lac-de-sempach-secteur-sud-autorise",
    center: [8.15, 47.14],
    zoom: 10.2,
  },
  {
    id: "quatre-cantons",
    name: "Lac des Quatre-Cantons",
    aliases: ["Vierwaldstättersee", "lac de Lucerne"],
    region: "Suisse centrale",
    status: "restricted",
    detail: "Autorisation partielle documentée",
    target: "lac-des-quatre-cantons-autorisation-partielle-documentee",
    center: [8.47, 46.99],
    zoom: 8.8,
  },
  {
    id: "zoug",
    name: "Lac de Zoug",
    aliases: ["Zugersee", "Zug"],
    region: "Zoug · Lucerne · Schwytz",
    status: "restricted",
    detail: "Autorisation partielle documentée",
    target: "lac-de-zoug-autorisation-partielle-documentee",
    center: [8.48, 47.12],
    zoom: 9.7,
  },
  {
    id: "greifensee",
    name: "Greifensee",
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
    sourceUrl: OFFICIAL_SOURCES.zurich,
    center: [8.68, 47.366],
    zoom: 11.3,
  },
  {
    id: "pfaeffikersee",
    name: "Pfäffikersee",
    aliases: ["lac de Pfäffikon"],
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
    sourceUrl: OFFICIAL_SOURCES.zurich,
    center: [8.781, 47.352],
    zoom: 11.4,
  },
  {
    id: "tuerlersee",
    name: "Türlersee",
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
    sourceUrl: OFFICIAL_SOURCES.zurich,
    center: [8.503, 47.27],
    zoom: 11.5,
  },
  {
    id: "constance",
    name: "Lac de Constance",
    aliases: ["Bodensee"],
    region: "Saint-Gall et autres rives",
    status: "restricted",
    detail: "Interdit côté saint-gallois, autres rives à vérifier",
    target: "lac-de-constance-rive-saint-galloise-interdit",
    center: [9.4, 47.6],
    zoom: 8.4,
  },
  {
    id: "majeur",
    name: "Lac Majeur",
    aliases: ["Lago Maggiore"],
    region: "Tessin",
    status: "unverified",
    detail: "Pas encore classé dans cette édition",
    target: "lacs-non-classes-dans-cette-edition-a-verifier",
    center: [8.75, 46.16],
    zoom: 8.6,
  },
  {
    id: "lugano",
    name: "Lac de Lugano",
    aliases: ["Lago di Lugano", "Ceresio"],
    region: "Tessin",
    status: "unverified",
    detail: "Pas encore classé dans cette édition",
    target: "lacs-non-classes-dans-cette-edition-a-verifier",
    center: [8.97, 45.98],
    zoom: 9.6,
  },
];

const STATUS: Record<
  LakeStatus,
  { label: string; dot: string; badge: string }
> = {
  restricted: {
    label: "Réglementé",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  forbidden: {
    label: "Interdit",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  unverified: {
    label: "À vérifier",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function SwissLakesSearch() {
  const [query, setQuery] = useState("");
  const [selectedLakeId, setSelectedLakeId] = useState<string | null>(null);
  const normalizedQuery = normalize(query);
  const selectedLake =
    LAKES.find((lake) => lake.id === selectedLakeId) ?? null;
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return LAKES.filter((lake) =>
      normalize([lake.name, ...(lake.aliases ?? [])].join(" ")).includes(
        normalizedQuery,
      ),
    ).slice(0, 8);
  }, [normalizedQuery]);

  function selectLake(lakeId: string) {
    setSelectedLakeId(lakeId);
    window.requestAnimationFrame(() => {
      document.getElementById("swiss-lakes-map")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    });
  }

  return (
    <section
      aria-labelledby="lake-search-title"
      className="mb-14 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm ring-1 ring-slate-200">
          <Search className="h-5 w-5" />
        </span>
        <div>
          <h2 id="lake-search-title" className="font-serif text-xl font-semibold text-slate-950">
            Trouver un lac
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Recherche aussi les noms allemands, italiens et les appellations locales.
          </p>
        </div>
      </div>

      <label htmlFor="swiss-lake-search" className="sr-only">
        Nom du lac
      </label>
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="swiss-lake-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex. Vernex, Léman, Murtensee…"
          autoComplete="off"
          aria-controls="swiss-lake-search-results"
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div id="swiss-lake-search-results" aria-live="polite">
        {!normalizedQuery ? (
          <p className="mt-3 text-xs text-slate-400">
            {LAKES.length} lacs et appellations sont indexés.
          </p>
        ) : results.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            Ce lac n’est pas encore répertorié. Son absence ne signifie pas qu’il est autorisé.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {results.map((lake) => {
              const status = STATUS[lake.status];
              return (
                <li key={lake.id}>
                  <button
                    type="button"
                    onClick={() => selectLake(lake.id)}
                    aria-pressed={selectedLakeId === lake.id}
                    className="group flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 aria-pressed:border-sky-400 aria-pressed:ring-2 aria-pressed:ring-sky-100"
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        status.dot,
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-slate-900 group-hover:text-sky-800">
                        {lake.name}
                      </strong>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {lake.region} · {lake.detail}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "hidden shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ring-1 sm:inline-flex",
                        status.badge,
                      )}
                    >
                      {status.label}
                    </span>
                    <ArrowDown className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-sky-600" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div id="swiss-lakes-map" className="mt-6 scroll-mt-24">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-slate-950">
              Carte des interdictions documentées
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Recherche un lac ou sélectionne directement une zone rouge.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-700">
            <span className="h-3 w-3 bg-red-600/70 ring-1 ring-red-800" />
            Kitesurf interdit
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SwissLakesRegulationMap
            selectedLake={selectedLake}
            onSelectLake={setSelectedLakeId}
          />
        </div>

        {selectedLake && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-slate-950">
                  {selectedLake.name}
                </strong>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold ring-1",
                    STATUS[selectedLake.status].badge,
                  )}
                >
                  {STATUS[selectedLake.status].label}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {selectedLake.region} · {selectedLake.detail}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
              <a
                href={`#${selectedLake.target}`}
                className="inline-flex min-h-9 items-center gap-1.5 text-sky-700 transition hover:text-sky-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Voir la règle
              </a>
              {selectedLake.sourceUrl && (
                <a
                  href={selectedLake.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 text-slate-500 transition hover:text-sky-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  Source officielle
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            La couverture cartographique est progressive. L’absence de zone
            rouge ne signifie pas que la navigation ou la mise à l’eau est
            autorisée. Consulte toujours la règle détaillée et sa source.
          </p>
        </div>
        <p className="mt-3 text-[10px] leading-4 text-slate-400">
          Contours des lacs © contributeurs OpenStreetMap, ODbL. Zones de la
          Gruyère : Source : État de Fribourg.
        </p>
      </div>
    </section>
  );
}
