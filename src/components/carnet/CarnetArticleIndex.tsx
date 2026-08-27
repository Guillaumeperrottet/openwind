"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface CarnetIndexArticle {
  id: string;
  kind: "EDITORIAL" | "LOCAL_GUIDE";
  href: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  location: string | null;
  readTime: number;
  publishedLabel: string | null;
}

interface Props {
  articles: CarnetIndexArticle[];
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/\s+/g, " ")
    .trim();
}

export function CarnetArticleIndex({ articles }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);

  const filteredArticles = useMemo(() => {
    const normalizedTerms = normalizedQuery.split(" ").filter(Boolean);
    if (normalizedTerms.length === 0) return articles;

    return articles.filter((article) => {
      const searchableText = normalizeSearch(
        [
          article.title,
          article.excerpt,
          article.category,
          article.location,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return normalizedTerms.every((term) => searchableText.includes(term));
    });
  }, [articles, normalizedQuery]);

  const localGuide = filteredArticles.find(
    (article) => article.kind === "LOCAL_GUIDE",
  );
  const editorialArticles = filteredArticles.filter(
    (article) => article.kind === "EDITORIAL",
  );
  const hasQuery = normalizedQuery.length > 0;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="group relative block w-full max-w-2xl">
          <label htmlFor="carnet-search" className="sr-only">
            Rechercher dans les Carnets
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-700"
          />
          <input
            id="carnet-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un vent, un spot, une région…"
            autoComplete="off"
            className="h-12 w-full rounded-none border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p
          aria-live="polite"
          className="shrink-0 text-xs font-medium text-slate-500"
        >
          {hasQuery
            ? `${filteredArticles.length} résultat${filteredArticles.length > 1 ? "s" : ""}`
            : `${articles.length} publication${articles.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center border border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <Search className="h-7 w-7 text-sky-700" />
          <h3 className="mt-5 font-serif text-3xl font-semibold text-slate-950">
            Aucun Carnet trouvé
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Essaie un autre mot-clé, une région ou une catégorie comme « vent »,
            « Gruyère » ou « mode d’emploi ».
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-6 border-b border-slate-900 pb-1 text-sm font-semibold text-slate-950 transition hover:border-sky-700 hover:text-sky-700"
          >
            Afficher tous les Carnets
          </button>
        </div>
      ) : (
        <div
          className={
            localGuide && editorialArticles.length > 0
              ? "grid items-stretch gap-6 xl:grid-cols-[1.22fr_0.78fr]"
              : "grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
          }
        >
          {localGuide && <LocalGuideCard article={localGuide} />}

          {editorialArticles.length > 0 && (
            <div
              className={`grid gap-6 ${
                localGuide
                  ? `${editorialArticles.length > 1 ? "sm:grid-cols-2" : ""} xl:grid-cols-1`
                  : "contents"
              }`}
            >
              {editorialArticles.map((article) => (
                <EditorialCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LocalGuideCard({ article }: { article: CarnetIndexArticle }) {
  return (
    <article className="grid h-full overflow-hidden border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
      <Link
        href={article.href}
        className="group relative min-h-72 overflow-hidden bg-slate-100 sm:min-h-96 lg:min-h-[460px]"
      >
        {article.coverImage ? (
          // Article covers may come from any admin-approved HTTPS source.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-slate-200" />
        )}
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900 backdrop-blur">
          {article.category}
        </span>
      </Link>

      <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {article.publishedLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {article.publishedLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {article.readTime} min
            </span>
            {article.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {article.location}
              </span>
            )}
          </div>
          <h3 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl">
            {article.title}
          </h3>
          <p className="mt-5 text-base leading-7 text-slate-600">
            {article.excerpt}
          </p>
        </div>

        <Link
          href={article.href}
          className="mt-9 inline-flex w-fit items-center gap-3 border-b border-slate-900 pb-1 text-sm font-semibold text-slate-950 transition hover:border-sky-600 hover:text-sky-700"
        >
          Lire le guide local
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function EditorialCard({ article }: { article: CarnetIndexArticle }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm">
      <Link
        href={article.href}
        className="relative min-h-60 flex-1 overflow-hidden bg-slate-100 sm:min-h-72 xl:min-h-0"
      >
        {article.coverImage ? (
          // Article covers may come from any admin-approved HTTPS source.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-slate-200" />
        )}
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900 backdrop-blur">
          {article.category}
        </span>
      </Link>

      <div className="flex flex-col justify-between p-6 sm:p-8 xl:min-h-[270px]">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>{article.category}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {article.readTime} min
            </span>
            {article.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {article.location}
              </span>
            )}
          </div>
          <h3 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-[-0.02em]">
            {article.title}
          </h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {article.excerpt}
          </p>
        </div>
        <Link
          href={article.href}
          className="mt-7 inline-flex w-fit items-center gap-2 border-b border-slate-900 pb-1 text-sm font-semibold transition hover:border-sky-600 hover:text-sky-700"
        >
          Lire l’article
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
