"use client";

import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { articlePublicPath, type ArticleDto } from "@/lib/articles";
import { trackEvent } from "@/lib/analytics";

type RelatedArticle = Pick<
  ArticleDto,
  | "id"
  | "kind"
  | "slug"
  | "title"
  | "excerpt"
  | "coverImage"
  | "coverAlt"
  | "category"
  | "location"
  | "readTime"
>;

export function RelatedArticles({ articles }: { articles: RelatedArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-articles-heading">
      <div className="mb-7 flex items-end justify-between gap-6 border-b border-slate-900 pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            Continuer la lecture
          </p>
          <h2
            id="related-articles-heading"
            className="mt-1 font-serif text-3xl font-semibold sm:text-4xl"
          >
            À lire aussi
          </h2>
        </div>
      </div>

      <div
        className={`grid gap-6 ${
          articles.length === 1
            ? "max-w-xl"
            : articles.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        {articles.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm"
          >
            <Link
              href={articlePublicPath(article)}
              onClick={() =>
                trackEvent("related_content_click", {
                  content_type: "article",
                  content_id: article.id,
                  placement: "related_articles",
                })
              }
              className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
            >
              {article.coverImage ? (
                // Article covers may come from an admin-approved HTTPS source.
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
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900 backdrop-blur">
                {article.kind === "LOCAL_GUIDE" ? "Guide local" : article.category}
              </span>
            </Link>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
              <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight">
                {article.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {article.excerpt}
              </p>
              <Link
                href={articlePublicPath(article)}
                onClick={() =>
                  trackEvent("related_content_click", {
                    content_type: "article",
                    content_id: article.id,
                    placement: "related_articles",
                  })
                }
                className="mt-6 inline-flex w-fit items-center gap-2 border-b border-slate-900 pb-1 text-sm font-semibold transition hover:border-sky-600 hover:text-sky-700"
              >
                Lire le Carnet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
