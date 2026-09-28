"use client";

import { useMemo, useState } from "react";
import { ArrowDown, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type LakeStatus = "restricted" | "forbidden" | "unverified";

interface LakeSearchEntry {
  name: string;
  aliases?: string[];
  region: string;
  status: LakeStatus;
  detail: string;
  target: string;
}

const LAKES: LakeSearchEntry[] = [
  {
    name: "Lac Léman",
    aliases: ["lac de Genève", "Genfersee", "Lake Geneva"],
    region: "Vaud · Genève",
    status: "restricted",
    detail: "Autorisé avec restrictions selon la rive",
    target: "lac-leman-autorise-avec-restrictions",
  },
  {
    name: "Lac de Neuchâtel",
    aliases: ["Neuenburgersee"],
    region: "NE · VD · FR · BE",
    status: "restricted",
    detail: "Autorisé avec zones protégées et règles locales",
    target: "lac-de-neuchatel-autorise-avec-restrictions",
  },
  {
    name: "Lac de Joux",
    region: "Vaud",
    status: "restricted",
    detail: "Autorisé dans les limites fixées par le canton",
    target: "lac-de-joux-autorise-avec-restrictions",
  },
  {
    name: "Lac du Vernex",
    aliases: ["lac de Rossinière", "Rossinière"],
    region: "Vaud",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "lac-du-vernex-rossiniere-interdit",
  },
  {
    name: "Lac de la Gruyère",
    aliases: ["Gruyère"],
    region: "Fribourg",
    status: "restricted",
    detail: "Autorisé avec zones d’exclusion",
    target: "lac-de-la-gruyere-autorise-avec-restrictions",
  },
  {
    name: "Lac de Morat",
    aliases: ["Murtensee", "Murten"],
    region: "Fribourg · Vaud",
    status: "restricted",
    detail: "Autorisé côté fribourgeois, interdit côté vaudois",
    target: "lac-de-morat-autorise-avec-restrictions",
  },
  {
    name: "Lac de Schiffenen",
    aliases: ["Schiffenensee"],
    region: "Fribourg",
    status: "restricted",
    detail: "Autorisé sur une partie seulement",
    target: "lac-de-schiffenen-autorise-sur-une-partie-seulement",
  },
  {
    name: "Lac de Bienne",
    aliases: ["Bielersee", "Biel"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
  },
  {
    name: "Lac de Thoune",
    aliases: ["Thunersee", "Thun"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
  },
  {
    name: "Lac de Brienz",
    aliases: ["Brienzersee"],
    region: "Berne",
    status: "restricted",
    detail: "Autorisé hors des zones interdites",
    target: "lacs-de-bienne-de-thoune-et-de-brienz-autorises-avec-zones-interdites",
  },
  {
    name: "Lac de Zurich",
    aliases: ["Zürichsee", "Zurichsee"],
    region: "ZH · SG · SZ",
    status: "restricted",
    detail: "Le statut change selon le canton",
    target: "lac-de-zurich-statut-different-selon-le-canton",
  },
  {
    name: "Walensee",
    aliases: ["lac de Walenstadt"],
    region: "Saint-Gall · Glaris",
    status: "restricted",
    detail: "Autorisé avec plusieurs zones fermées",
    target: "walensee-autorise-avec-restrictions",
  },
  {
    name: "Lac de Sempach",
    aliases: ["Sempachersee"],
    region: "Lucerne",
    status: "restricted",
    detail: "Seul le secteur sud est ouvert",
    target: "lac-de-sempach-secteur-sud-autorise",
  },
  {
    name: "Lac des Quatre-Cantons",
    aliases: ["Vierwaldstättersee", "lac de Lucerne"],
    region: "Suisse centrale",
    status: "restricted",
    detail: "Autorisation partielle documentée",
    target: "lac-des-quatre-cantons-autorisation-partielle-documentee",
  },
  {
    name: "Lac de Zoug",
    aliases: ["Zugersee", "Zug"],
    region: "Zoug · Lucerne · Schwytz",
    status: "restricted",
    detail: "Autorisation partielle documentée",
    target: "lac-de-zoug-autorisation-partielle-documentee",
  },
  {
    name: "Greifensee",
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
  },
  {
    name: "Pfäffikersee",
    aliases: ["lac de Pfäffikon"],
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
  },
  {
    name: "Türlersee",
    region: "Zurich",
    status: "forbidden",
    detail: "Kitesurf interdit",
    target: "greifensee-pfaffikersee-et-turlersee-interdits",
  },
  {
    name: "Lac de Constance",
    aliases: ["Bodensee"],
    region: "Saint-Gall et autres rives",
    status: "restricted",
    detail: "Interdit côté saint-gallois, autres rives à vérifier",
    target: "lac-de-constance-rive-saint-galloise-interdit",
  },
  {
    name: "Lac Majeur",
    aliases: ["Lago Maggiore"],
    region: "Tessin",
    status: "unverified",
    detail: "Pas encore classé dans cette édition",
    target: "lacs-non-classes-dans-cette-edition-a-verifier",
  },
  {
    name: "Lac de Lugano",
    aliases: ["Lago di Lugano", "Ceresio"],
    region: "Tessin",
    status: "unverified",
    detail: "Pas encore classé dans cette édition",
    target: "lacs-non-classes-dans-cette-edition-a-verifier",
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
  const normalizedQuery = normalize(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return LAKES.filter((lake) =>
      normalize([lake.name, ...(lake.aliases ?? [])].join(" ")).includes(
        normalizedQuery,
      ),
    ).slice(0, 8);
  }, [normalizedQuery]);

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
                <li key={lake.name}>
                  <a
                    href={`#${lake.target}`}
                    className="group flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-sky-300 hover:shadow-sm"
                  >
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", status.dot)} />
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
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
