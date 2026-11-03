import { createHash } from "node:crypto";
import { articleVerification } from "@/lib/article-verification";
import { SaveArticleButton } from "@/components/carnet/SaveArticleButton";
import { ArticleReadingProgress } from "@/components/carnet/ArticleReadingProgress";
import { ArticleCorrection } from "@/components/carnet/ArticleCorrection";
import { cache } from "react";
import { previewCarnetRevision } from "@/lib/carnet-preview";
import { articleReading } from "@/lib/article-reading";
import { ArticleSummary, ArticleOutline } from "@/components/carnet/ArticleReadingGuide";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  PenLine,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { ArticleMarkdown } from "@/components/carnet/ArticleMarkdown";
import { ArticleReadTracker } from "@/components/carnet/ArticleReadTracker";
import { ArticleConnections } from "@/components/carnet/ArticleConnections";
import { ArticleShare } from "@/components/carnet/ArticleShare";
import { RelatedArticles } from "@/components/carnet/RelatedArticles";
import { SwissLakesSearch } from "@/components/carnet/SwissLakesSearch";
import { prisma } from "@/lib/prisma";
import { parseArticleSources } from "@/lib/articles";
import { resolveArticleConnections } from "@/lib/article-connections";
import { localizedUrl } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const findPublishedArticle = cache(async (slug: string) => {
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", kind: "EDITORIAL" },
  });
  return article ? previewCarnetRevision(article) : null;
});

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

  const reading = articleReading(article.content);
  const sources = parseArticleSources(article.sources);
  const verifiedAt = articleVerification(article.content);
  const readingArticle = { kind: "EDITORIAL" as const, slug: article.slug, title: article.title, readTime: article.readTime };
  const revision = createHash("sha256").update(reading.content).digest("hex").slice(0, 16);
  const articleUrl = localizedUrl("fr", `/carnet/${article.slug}`);
  const isSwissLakesGuide =
    article.slug === "kitesurf-lacs-suisses-autorise-interdit";
  const publishedAt = article.publishedAt ?? article.createdAt;
  const formattedDate = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(publishedAt);
  const formattedUpdatedDate = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
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
        <div className="mx-auto max-w-5xl px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-end gap-3">
          <a href="#article-share" className="inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline underline-offset-4">Partager</a>
          </div>
          <div className="mt-5 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
              {article.category}
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-xl">
              {article.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <CalendarDays className="h-4 w-4 text-sky-700" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCcw className="h-4 w-4 text-sky-700" />
                Texte mis à jour le <time dateTime={article.updatedAt.toISOString()}>{formattedUpdatedDate}</time>
              </span>
              {verifiedAt && <span className="inline-flex items-center gap-1.5 text-sky-800"><ShieldCheck aria-hidden className="h-4 w-4" />{isSwissLakesGuide ? "Règles vérifiées le" : "Sources vérifiées le"} <time dateTime={verifiedAt}>{new Intl.DateTimeFormat("fr-CH", { dateStyle: "long", timeZone: "Europe/Zurich" }).format(new Date(`${verifiedAt}T12:00:00Z`))}</time></span>}
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

            </div>
            <div className="mt-4"><SaveArticleButton article={readingArticle} /><ArticleReadingProgress article={readingArticle} revision={revision} headings={reading.outline} /></div>
          </div>
        </div>
      </header>

      {isSwissLakesGuide && <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 lg:px-10">
        <ArticleSummary points={reading.summary} />
        <ArticleOutline headings={reading.outline} collapsible />
      </div>}
      {isSwissLakesGuide && (
        <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-14 lg:px-10">
          <SwissLakesSearch />
        </div>
      )}

      <div
        className={`mx-auto grid gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:px-10 ${
          isSwissLakesGuide
            ? "max-w-6xl pb-12 sm:pb-16 lg:pb-20"
            : "max-w-5xl py-6 sm:py-8 lg:py-10"
        }`}
      >
        <div className="min-w-0">
          {!isSwissLakesGuide && <><ArticleSummary points={reading.summary} /><ArticleOutline headings={reading.outline} collapsible /></>}
          {article.coverImage && !isSwissLakesGuide && (
            <figure className="mb-8">
              <div className="aspect-[16/7] overflow-hidden bg-slate-100">
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
                <figcaption className="mt-2 text-sm text-slate-500">
                  {article.coverAlt}
                </figcaption>
              )}
        </figure>
      )}

          <div id="article-content" className="scroll-mt-24">
            <ArticleMarkdown>{reading.content}</ArticleMarkdown>
          </div>
          <span id="article-reading-end" aria-hidden className="block h-px" />
          <ArticleReadTracker
            articleSlug={article.slug}
            contentType="carnet_article"
          />

          {sources.length > 0 && (
            <section className="mt-16 border-t border-slate-200 pt-10">
              <div className="flex items-center gap-2 text-sky-700">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-xs font-bold uppercase tracking-[0.18em]">
                  Sources et références
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

        <aside className="h-fit border-l-2 border-slate-200 pl-5 lg:sticky lg:top-24">
          <ArticleOutline headings={reading.outline} />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
            Lecture terrain
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Les données aident à comprendre. L’observation, les avis officiels
            et les règles du site restent prioritaires.
          </p>
          <ArticleCorrection slug={article.slug} headings={reading.outline} />
        </aside>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-10 sm:px-8 lg:px-10">
        <ArticleShare title={article.title} text={article.excerpt} url={articleUrl} articleSlug={article.slug} />
      </div>

      {(spots.length > 0 || stations.length > 0) && (
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <ArticleConnections spots={spots} stations={stations} />
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10">
          <RelatedArticles articles={relatedArticles.map(previewCarnetRevision)} />
        </div>
      )}
    </article>
  );
}
