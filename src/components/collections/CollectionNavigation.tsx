import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  collectionPath,
  pageNumbers,
  type CollectionQuery,
} from "@/lib/collections";

export const COLLECTION_COPY = {
  fr: {
    search: "Rechercher",
    label: "Rechercher un lac, une région ou une balise",
    placeholder: "Un lac, une région, une balise…",
    clear: "Tout afficher",
    previous: "Précédent",
    next: "Suivant",
    nav: "Pagination",
    page: "Page",
    of: "sur",
    results: "résultats",
    empty: "Aucun guide trouvé",
    emptyText: "Essayez un autre nom de lac, de rive ou de région.",
  },
  de: {
    search: "Suchen",
    label: "See, Region oder Windstation suchen",
    placeholder: "See, Region, Windstation…",
    clear: "Alle anzeigen",
    previous: "Zurück",
    next: "Weiter",
    nav: "Seitennavigation",
    page: "Seite",
    of: "von",
    results: "Ergebnisse",
    empty: "Keine Guides gefunden",
    emptyText: "Versuche einen anderen See, Uferort oder eine Region.",
  },
  it: {
    search: "Cerca",
    label: "Cerca un lago, una regione o una stazione",
    placeholder: "Lago, regione, stazione…",
    clear: "Mostra tutto",
    previous: "Precedente",
    next: "Successiva",
    nav: "Paginazione",
    page: "Pagina",
    of: "di",
    results: "risultati",
    empty: "Nessuna guida trovata",
    emptyText: "Prova un altro lago, una località sulla riva o una regione.",
  },
};
type Locale = keyof typeof COLLECTION_COPY;
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

export function CollectionSearch({
  path,
  locale,
  query,
  label,
}: {
  path: string;
  locale: Locale;
  query: CollectionQuery;
  label?: string;
}) {
  const copy = COLLECTION_COPY[locale];
  return (
    <form
      action={`/${locale}${path}#collection-results`}
      method="get"
      role="search"
      className="flex max-w-3xl flex-wrap items-end gap-3"
    >
      <div className="min-w-0 flex-1 basis-60">
        <label
          htmlFor="collection-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          {label ?? copy.label}
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-4 h-4 w-4 text-slate-400"
          />
          <input
            key={`${query.q}:${query.kind}:${query.page}`}
            id="collection-search"
            name="q"
            type="search"
            defaultValue={query.q}
            maxLength={120}
            placeholder={copy.placeholder}
            className={`h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-950 ${focus}`}
          />
        </div>
      </div>
      {query.kind !== "all" && (
        <input name="kind" type="hidden" value={query.kind} />
      )}
      <button
        type="submit"
        className={`min-h-12 rounded-xl bg-sky-800 px-5 text-sm font-semibold text-white hover:bg-sky-900 ${focus}`}
      >
        {copy.search}
      </button>
      {(query.q || query.kind !== "all") && (
        <Link
          href={`${path}#collection-results`}
          className={`py-3 text-sm font-semibold text-sky-800 underline underline-offset-4 ${focus}`}
        >
          {copy.clear}
        </Link>
      )}
    </form>
  );
}

export function CollectionPagination({
  path,
  locale,
  query,
  pages,
}: {
  path: string;
  locale: Locale;
  query: CollectionQuery;
  pages: number;
}) {
  if (pages <= 1) return null;
  const copy = COLLECTION_COPY[locale];
  const href = (page: number) =>
    `${collectionPath(path, query, page)}#collection-results`;
  const button = `inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-800 ${focus}`;
  return (
    <nav
      aria-label={copy.nav}
      className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-6"
    >
      {query.page > 1 && (
        <Link href={href(query.page - 1)} rel="prev" className={button}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">{copy.previous}</span>
          <span className="sr-only sm:hidden">{copy.previous}</span>
        </Link>
      )}
      {pageNumbers(query.page, pages).map((page, index) =>
        page === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-slate-400"
          >
            …
          </span>
        ) : page === query.page ? (
          <span
            key={page}
            aria-current="page"
            aria-label={`${copy.page} ${page}`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-800 px-3 text-sm font-semibold text-white"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            aria-label={`${copy.page} ${page}`}
            className={button}
          >
            {page}
          </Link>
        ),
      )}
      {query.page < pages && (
        <Link href={href(query.page + 1)} rel="next" className={button}>
          <span className="hidden sm:inline">{copy.next}</span>
          <span className="sr-only sm:hidden">{copy.next}</span>
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
      <p className="mt-2 w-full text-center text-xs text-slate-500">
        {copy.page} {query.page} {copy.of} {pages}
      </p>
    </nav>
  );
}
