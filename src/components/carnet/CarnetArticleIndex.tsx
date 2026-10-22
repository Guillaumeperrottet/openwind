import Image from "next/image";
import { ArrowRight, CalendarDays, Clock3, MapPin, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GuideImageCredit } from "@/components/carnet/GuideImageCredit";
import {
  CollectionSearch,
  CollectionPagination,
} from "@/components/collections/CollectionNavigation";
import { collectionPath, type CollectionQuery } from "@/lib/collections";
import { carnetPage, type CarnetIndexArticle } from "@/lib/publication-index";
export type { CarnetIndexArticle } from "@/lib/publication-index";

export function CarnetArticleIndex({
  articles,
  query = { q: "", kind: "all", page: 1 },
}: {
  articles: CarnetIndexArticle[];
  query?: CollectionQuery;
}) {
  const result = carnetPage(articles, query);
  const featuredArticle =
    !query.q && query.kind === "all" && query.page === 1
      ? result.items[0]
      : undefined;
  const gridArticles = featuredArticle ? result.items.slice(1) : result.items;
  const filters = [
    ["all", "Tout"],
    ["articles", "Articles"],
    ["guides", "Guides des lacs"],
  ] as const;
  return (
    <div id="collection-results" className="scroll-mt-24">
      <CollectionSearch
        path="/carnet"
        locale="fr"
        query={query}
        label="Rechercher dans le Carnet"
      />
      <nav
        aria-label="Types de publications"
        className="mt-5 flex flex-wrap gap-2"
      >
        {filters.map(([kind, label]) => (
          <Link
            key={kind}
            href={
              collectionPath("/carnet", { ...query, kind, page: 1 }) +
              "#collection-results"
            }
            aria-current={query.kind === kind ? "true" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${query.kind === kind ? "border-sky-800 bg-sky-800 text-white" : "border-slate-200 text-slate-600 hover:border-sky-600 hover:text-sky-800"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <p role="status" className="my-6 text-sm text-slate-500">
        {result.total ? `${result.start}–${result.end} sur ` : ""}
        {result.total} publication{result.total > 1 ? "s" : ""}
      </p>
      {result.total === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center border border-slate-200 bg-slate-50 p-8 text-center">
          <Search aria-hidden="true" className="h-7 w-7 text-sky-700" />
          <h3 className="mt-5 font-serif text-3xl font-semibold">
            {query.q || query.kind !== "all"
              ? "Aucune publication trouvée"
              : "Les prochains Carnets arrivent"}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Essayez un nom de lac, une région ou un thème comme « vent » ou «
            accès ».
          </p>
          {(query.q || query.kind !== "all") && (
            <Link
              href="/carnet#collection-results"
              className="mt-6 min-h-11 text-sm font-semibold text-sky-800 underline underline-offset-4"
            >
              Afficher tout le Carnet
            </Link>
          )}
        </div>
      ) : (
        <div id="carnet-results" className="space-y-8">
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
      <CollectionPagination
        path="/carnet"
        locale="fr"
        query={query}
        pages={result.pages}
      />
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
          <Image
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            fill
            loading="lazy"
            sizes={
              featured
                ? "(max-width: 1023px) 100vw, 50vw"
                : "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
            }
            unoptimized={
              !article.coverImage.startsWith("/") &&
              !article.coverImage.includes(".supabase.co/")
            }
            className="absolute inset-0 h-full w-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-slate-200" />
        )}
        <span className="absolute left-4 right-4 top-4 w-fit max-w-[calc(100%-2rem)] rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900 [overflow-wrap:anywhere]">
          {article.category}
        </span>
      </Link>

      <GuideImageCredit
        credit={article.coverCredit}
        className={`px-6 pt-3 text-slate-500 ${featured ? "lg:col-start-1 lg:row-start-2" : ""}`}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col p-6 ${
          featured
            ? "sm:p-8 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:p-10 xl:p-12"
            : "sm:p-7"
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
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
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
