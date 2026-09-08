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
        [article.title, article.excerpt, article.category, article.location]
          .filter(Boolean)
          .join(" "),
      );

      return normalizedTerms.every((term) => searchableText.includes(term));
    });
  }, [articles, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0;
  const featuredArticle = hasQuery ? undefined : filteredArticles[0];
  const gridArticles = featuredArticle
    ? filteredArticles.slice(1)
    : filteredArticles;

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
            aria-controls="carnet-results"
            className="h-12 w-full rounded-none border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p
          aria-live="polite"
          aria-atomic="true"
          className="shrink-0 text-xs font-medium text-slate-500"
        >
          {hasQuery
            ? `${filteredArticles.length} résultat${filteredArticles.length > 1 ? "s" : ""}`
            : `${articles.length} publication${articles.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <div id="carnet-results">
        {filteredArticles.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <Search className="h-7 w-7 text-sky-700" aria-hidden="true" />
            <h3 className="mt-5 font-serif text-3xl font-semibold text-slate-950">
              {hasQuery ? "Aucun Carnet trouvé" : "Les prochains Carnets arrivent"}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              {hasQuery
                ? "Essaie un autre mot-clé, une région ou une catégorie comme « vent », « Gruyère » ou « mode d’emploi »."
                : "Retrouve bientôt nos guides locaux, décryptages météo et conseils pour préparer tes sorties."}
            </p>
            {hasQuery && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-6 border-b border-slate-900 pb-1 text-sm font-semibold text-slate-950 transition hover:border-sky-700 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-700"
              >
                Afficher tous les Carnets
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {featuredArticle && (
              <ArticleCard article={featuredArticle} featured />
            )}

            {gridArticles.length > 0 && (
              <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  featured = false,
}: {
  article: CarnetIndexArticle;
  featured?: boolean;
}) {
  const titleId = `carnet-title-${article.id}`;
  const readLabel =
    article.kind === "LOCAL_GUIDE" ? "Lire le guide local" : "Lire l’article";

  return (
    <article
      aria-labelledby={titleId}
      className={`group min-w-0 overflow-hidden border border-slate-200 bg-white shadow-sm ${
        featured ? "grid lg:grid-cols-2" : "flex h-full flex-col"
      }`}
    >
      <Link
        href={article.href}
        aria-label={`${readLabel} : ${article.title}`}
        className={`relative block aspect-[16/10] min-w-0 shrink-0 overflow-hidden bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-700 ${
          featured ? "lg:aspect-auto lg:min-h-96" : ""
        }`}
      >
        {article.coverImage ? (
          // Article covers may come from any admin-approved HTTPS source.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-slate-200" />
        )}
        <span className="absolute left-4 right-4 top-4 w-fit max-w-[calc(100%-2rem)] rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900 [overflow-wrap:anywhere]">
          {article.category}
        </span>
      </Link>

      <div
        className={`flex min-w-0 flex-1 flex-col p-6 ${
          featured ? "sm:p-8 lg:p-10 xl:p-12" : "sm:p-7"
        }`}
      >
        {featured && (
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            À la une
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {article.publishedLabel && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {article.publishedLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {article.readTime} min
          </span>
          {article.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5 [overflow-wrap:anywhere]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {article.location}
            </span>
          )}
        </div>
        <h3
          id={titleId}
          className={`mt-5 font-serif font-semibold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere] ${
            featured ? "text-3xl sm:text-4xl xl:text-5xl" : "text-3xl"
          }`}
        >
          <Link
            href={article.href}
            className="transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-700"
          >
            {article.title}
          </Link>
        </h3>
        <p
          className={`mb-7 mt-4 text-slate-600 [overflow-wrap:anywhere] ${
            featured ? "text-base leading-7" : "text-sm leading-6"
          }`}
        >
          {article.excerpt}
        </p>
        <Link
          href={article.href}
          aria-label={`${readLabel} : ${article.title}`}
          className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 border-b border-slate-900 text-sm font-semibold transition hover:border-sky-600 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-700"
        >
          {readLabel}
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
