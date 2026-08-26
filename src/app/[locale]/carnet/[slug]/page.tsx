import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  PenLine,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { ArticleMarkdown } from "@/components/carnet/ArticleMarkdown";
import { ArticleConnections } from "@/components/carnet/ArticleConnections";
import { ArticleShare } from "@/components/carnet/ArticleShare";
import { RelatedArticles } from "@/components/carnet/RelatedArticles";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { parseArticleSources } from "@/lib/articles";
import { resolveArticleConnections } from "@/lib/article-connections";
import { localizedUrl } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function findPublishedArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", kind: "EDITORIAL" },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "fr") return { robots: { index: false, follow: false } };

  const article = await findPublishedArticle(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const url = localizedUrl("fr", `/carnet/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — Openwind`,
      description,
      url,
      type: "article",
      locale: "fr_CH",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      images: article.coverImage
        ? [{ url: article.coverImage, alt: article.coverAlt || article.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Openwind`,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  if (locale !== "fr") notFound();

  const article = await findPublishedArticle(slug);
  if (!article) notFound();

  const { spots, stations, relatedArticles } =
    await resolveArticleConnections(article);

  const sources = parseArticleSources(article.sources);
  const articleUrl = localizedUrl("fr", `/carnet/${article.slug}`);
  const publishedAt = article.publishedAt ?? article.createdAt;
  const formattedDate = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(publishedAt);
  const formattedUpdatedDate = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(article.updatedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        url: articleUrl,
        inLanguage: "fr-CH",
        datePublished: publishedAt.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        image: article.coverImage || undefined,
        author: { "@type": "Organization", name: article.authorName },
        publisher: { "@type": "Organization", name: "Openwind" },
        citation: sources.map((source) => source.url),
        about: spots.map((spot) => ({
          "@type": "Place",
          name: spot.name,
          url: localizedUrl("fr", `/spots/${spot.id}`),
        })),
        mentions: stations.map((station) => ({
          "@type": "Thing",
          name: `Balise vent ${station.name}`,
          url: localizedUrl(
            "fr",
            `/stations/${encodeURIComponent(station.id)}`,
          ),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Openwind",
            item: localizedUrl("fr"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Le Carnet Openwind",
            item: localizedUrl("fr", "/carnet"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  };

  return (
    <article className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:px-10">
          <Link
            href="/carnet"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-sky-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Tous les Carnets
          </Link>

          <div className="mt-10 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              {article.category}
            </p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              {article.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-sky-700" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-sky-700" />
                {article.readTime} min
              </span>
              {article.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-700" />
                  {article.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <PenLine className="h-4 w-4 text-sky-700" />
                Par {article.authorName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCcw className="h-4 w-4 text-sky-700" />
                Mis à jour le {formattedUpdatedDate}
              </span>
            </div>
          </div>
        </div>
      </header>

      {article.coverImage && (
        <figure className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10">
          <div className="aspect-[16/8] overflow-hidden bg-slate-100">
            {/* Admins can reference any HTTPS image source, so a native image is intentional here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.coverAlt || article.title}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
          {article.coverAlt && (
            <figcaption className="mt-2 text-xs text-slate-400">
              {article.coverAlt}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8 sm:pt-10 lg:px-10">
        <ArticleShare
          title={article.title}
          text={article.excerpt}
          url={articleUrl}
          articleSlug={article.slug}
        />
      </div>

      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_220px] lg:px-10 lg:py-20">
        <div className="min-w-0">
          <ArticleMarkdown>{article.content}</ArticleMarkdown>

          {sources.length > 0 && (
            <section className="mt-16 border-t border-slate-200 pt-10">
              <div className="flex items-center gap-2 text-sky-700">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-xs font-bold uppercase tracking-[0.18em]">
                  Sources vérifiées
                </h2>
              </div>
              <ul className="mt-5 space-y-3">
                {sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-2 text-sm font-medium leading-6 text-slate-700 transition hover:text-sky-700"
                    >
                      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-600" />
                      <span className="border-b border-slate-200 group-hover:border-sky-300">
                        {source.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="h-fit border-l-2 border-sky-600 pl-5 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            Lecture terrain
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Les données aident à comprendre. L’observation, les avis officiels
            et les règles du site restent prioritaires.
          </p>
          <Link
            href="/forum"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-sky-700"
          >
            Signaler une correction
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>

      {(spots.length > 0 || stations.length > 0) && (
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <ArticleConnections spots={spots} stations={stations} />
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
          <RelatedArticles articles={relatedArticles} />
        </div>
      )}
    </article>
  );
}
