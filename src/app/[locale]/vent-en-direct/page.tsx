import { GuideImageCredit } from "@/components/carnet/GuideImageCredit";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { GUIDE_COPY, GUIDE_LOCALES, isGuideLocale } from "@/lib/local-guides";
import { localizedUrl } from "@/lib/site";
import {
  collectionPage,
  collectionPath,
  collectionQuery,
  GUIDE_PAGE_SIZE,
  type CollectionParams,
} from "@/lib/collections";
import { guideCollection } from "@/lib/publication-index";
import {
  COLLECTION_COPY,
  CollectionSearch,
  CollectionPagination,
} from "@/components/collections/CollectionNavigation";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CollectionParams>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isGuideLocale(locale)) return {};
  const copy = GUIDE_COPY[locale];
  const query = {
    ...collectionQuery(await searchParams),
    kind: "all" as const,
  };
  const path = collectionPath("/vent-en-direct", query);
  if (
    !collectionPage(
      guideCollection(locale, query.q),
      query.page,
      GUIDE_PAGE_SIZE,
    ).valid
  )
    notFound();
  const title =
    copy.title +
    (query.page > 1 ? ` · ${COLLECTION_COPY[locale].page} ${query.page}` : "");
  return {
    title,
    description: copy.description,
    alternates: {
      canonical: localizedUrl(locale, path),
      ...(!query.q
        ? {
            languages: {
              "x-default": localizedUrl("fr", path),
              ...Object.fromEntries(
                GUIDE_LOCALES.map((language) => [
                  language,
                  localizedUrl(language, path),
                ]),
              ),
            },
          }
        : {}),
    },
    robots: query.q
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description: copy.description,
      url: localizedUrl(locale, path),
      type: "website",
    },
  };
}

export default async function GuidesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isGuideLocale(locale)) permanentRedirect("/fr/vent-en-direct");
  const copy = GUIDE_COPY[locale];
  const query = {
    ...collectionQuery(await searchParams),
    kind: "all" as const,
  };
  const result = collectionPage(
    guideCollection(locale, query.q),
    query.page,
    GUIDE_PAGE_SIZE,
  );
  if (!result.valid) notFound();
  const guides = result.items;
  const labels = COLLECTION_COPY[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.title,
    description: copy.description,
    inLanguage: `${locale}-CH`,
    url: localizedUrl(locale, collectionPath("/vent-en-direct", query)),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: result.items.length,
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: (query.page - 1) * GUIDE_PAGE_SIZE + index + 1,
        name: guide.translations[locale]!.title,
        url: localizedUrl(locale, `/vent-en-direct/${guide.slug}`),
      })),
    },
  };
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="text-sm font-semibold uppercase tracking-widest text-sky-700">
        Openwind · Suisse / Schweiz / Svizzera
      </p>
      <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
        {copy.description}
      </p>
      <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-sky-700">
        <Link href="/balises">{copy.stations} →</Link>
        <Link href="/?view=map">{copy.map} →</Link>
        <Link href="/plan">{copy.plan} →</Link>
        <Link href="/carnet" locale="fr">
          {locale === "fr" ? "Le Carnet : articles et guides" : "Carnet · FR"} →
        </Link>
      </div>
      <section id="collection-results" className="mt-12 scroll-mt-24">
        <CollectionSearch
          path="/vent-en-direct"
          locale={locale}
          query={query}
        />
        <p role="status" className="my-6 text-sm text-slate-500">
          {result.start}–{result.end} {labels.of} {result.total}{" "}
          {labels.results}
        </p>
        {result.total === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-semibold">{labels.empty}</h2>
            <p className="mt-3 text-slate-600">{labels.emptyText}</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => {
            const translation = guide.translations[locale]!;
            return (
              <article
                key={guide.slug}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <Link href={`/vent-en-direct/${guide.slug}`}>
                  <Image
                    src={guide.coverImage}
                    alt={translation.coverAlt}
                    width={1200}
                    height={763}
                    className="aspect-[16/9] w-full object-cover"
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      {guide.region}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      {translation.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {translation.description}
                    </p>
                    <span className="mt-5 inline-block text-sm font-semibold text-sky-700">
                      {copy.now} →
                    </span>
                  </div>
                </Link>
                <GuideImageCredit
                  credit={guide.coverCredit}
                  className="px-6 pb-4 text-slate-500"
                />
              </article>
            );
          })}
        </div>
        <CollectionPagination
          path="/vent-en-direct"
          locale={locale}
          query={query}
          pages={result.pages}
        />
      </section>
    </div>
  );
}
