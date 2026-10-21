import { Link } from "@/i18n/navigation";
import { localizedUrl } from "@/lib/site";
import { GUIDE_COPY, LOCAL_GUIDES, guideLanguages } from "@/lib/local-guides";
import Image from "next/image";
import { GuideImageCredit } from "./GuideImageCredit";
import type { LocalGuideData } from "@/lib/local-guide-data";
import { ArticleMarkdown } from "./ArticleMarkdown";
import { ArticleReadTracker } from "./ArticleReadTracker";
import { ArticleShare } from "./ArticleShare";
import { RelatedArticles } from "./RelatedArticles";
import { GuideLiveStations } from "./GuideLiveStations";
import { ForecastSummary } from "@/components/spot/ForecastSummary";

export function LocalGuideTemplate({ data }: { data: LocalGuideData }) {
  const { definition, translation, locale } = data;
  const copy = GUIDE_COPY[locale];
  const url = localizedUrl(locale, `/vent-en-direct/${definition.slug}`);
  const date = new Intl.DateTimeFormat(locale, {
    timeZone: "Europe/Zurich",
    dateStyle: "long",
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#guide`,
        url,
        mainEntityOfPage: url,
        headline: translation.title,
        description: translation.description,
        inLanguage: `${locale}-CH`,
        image: new URL(data.coverImage, url).href,
        datePublished: data.publishedAt,
        dateModified: data.updatedAt,
        author: { "@type": "Organization", name: data.author },
        publisher: {
          "@type": "Organization",
          name: "Openwind",
          url: localizedUrl(locale),
        },
        citation: data.sources.map((source) => source.url),
        about: {
          "@type": "Place",
          name: translation.place,
          geo: {
            "@type": "GeoCoordinates",
            latitude: definition.coordinates.lat,
            longitude: definition.coordinates.lng,
          },
        },
        mentions: data.stations.map((station) => ({
          "@type": "Thing",
          name: station.name,
          url: localizedUrl(
            locale,
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
            item: localizedUrl(locale),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.guides,
            item: localizedUrl(locale, "/vent-en-direct"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: translation.place,
            item: url,
          },
        ],
      },
    ],
  };
  return (
    <article className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="relative isolate min-h-[500px] overflow-hidden bg-slate-950">
        <Image
          src={data.coverImage}
          alt={data.coverAlt}
          width={1200}
          height={763}
          sizes="100vw"
          preload
          unoptimized={
            !data.coverImage.includes(".supabase.co/") &&
            !data.coverImage.startsWith("/")
          }
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/30" />
        <div className="relative mx-auto flex min-h-[500px] max-w-6xl flex-col justify-end px-5 py-12 sm:px-8 lg:px-10">
          <nav
            aria-label={copy.guides}
            className="mb-12 flex flex-wrap gap-2 text-sm text-white/80"
          >
            <Link href="/">Openwind</Link>
            <span aria-hidden="true">/</span>
            <Link href="/vent-en-direct">{copy.guides}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{translation.place}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-200">
            {definition.region}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {translation.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">
            {translation.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="#vent-direct"
              className="rounded-xl bg-sky-500 px-5 py-3 text-white hover:bg-sky-400"
            >
              {copy.now}
            </a>
            <Link
              href="/balises"
              className="rounded-xl border border-white/30 px-5 py-3 text-white"
            >
              {copy.stations}
            </Link>
          </div>
        </div>
      </header>
      {data.coverImage === definition.coverImage && (
        <GuideImageCredit
          credit={definition.coverCredit}
          className="mx-auto max-w-6xl px-5 pt-3 text-slate-500 sm:px-8"
        />
      )}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-wrap justify-between gap-5 text-sm text-slate-500">
          <p>
            {copy.by} {data.author} · {copy.updated}{" "}
            <time dateTime={data.updatedAt}>
              {date.format(new Date(data.updatedAt))}
            </time>
          </p>
          <nav aria-label={copy.language} className="flex gap-4">
            {guideLanguages(definition).map((language) => (
              <Link
                key={language}
                href={`/vent-en-direct/${definition.slug}`}
                locale={language}
                hrefLang={language}
                aria-current={language === locale ? "page" : undefined}
                className="font-semibold underline decoration-slate-300 underline-offset-4"
              >
                {{ fr: "Français", de: "Deutsch", it: "Italiano" }[language]}
              </Link>
            ))}
          </nav>
        </div>
        {locale === "fr" && (
          <div className="mt-6">
            <ArticleShare
              title={translation.title}
              text={translation.description}
              url={url}
              articleSlug={definition.slug}
            />
          </div>
        )}
        <section id="vent-direct" className="mt-12 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-950">{copy.live}</h2>
          <p className="mb-6 mt-3 max-w-3xl leading-7 text-slate-600">
            {copy.liveIntro}
          </p>
          <GuideLiveStations stations={data.stations} locale={locale} />
        </section>
        {data.forecast ? (
          <>
            {definition.forecastPlace && (
              <p className="mt-8 text-sm leading-6 text-slate-600">
                {copy.forecastPoint} :{" "}
                <strong>{definition.forecastPlace}</strong>.{" "}
                {copy.forecastScope}
              </p>
            )}
            <ForecastSummary forecast={data.forecast} locale={locale} />
          </>
        ) : (
          <section className="my-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">{copy.forecast}</h2>
            <p className="mt-2 text-sm text-slate-500">{copy.unavailable}</p>
          </section>
        )}
        <section className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0">
            <ArticleMarkdown>{data.content}</ArticleMarkdown>
            <ArticleReadTracker
              articleSlug={definition.slug}
              contentType="local_guide"
            />
          </div>
          <aside className="h-fit border-l-2 border-sky-600 pl-5 lg:sticky lg:top-24">
            <h2 className="font-semibold text-sky-700">{copy.context}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.caution}
            </p>
          </aside>
        </section>
        {data.spots.length > 0 && (
          <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-bold">{copy.localSpots}</h2>
            {translation.spotsIntro && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {translation.spotsIntro}
              </p>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {data.spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="rounded-xl border border-slate-200 p-5 hover:border-sky-400"
                >
                  <h3 className="font-semibold">{spot.name}</h3>
                  <p className="mt-2 text-sm text-sky-700">{copy.openSpot} →</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="mt-14 rounded-3xl border border-slate-200 bg-white p-7">
          <h2 className="text-2xl font-bold">{copy.faq}</h2>
          <div className="mt-5 divide-y divide-slate-200">
            {translation.faq.map((item) => (
              <div key={item.question} className="py-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-14 rounded-3xl bg-sky-700 p-7 text-white">
          <h2 className="text-2xl font-bold">{copy.plan}</h2>
          <div className="mt-5 flex flex-wrap gap-5 font-semibold">
            <Link href="/plan" className="underline underline-offset-4">
              {copy.plan} →
            </Link>
            <Link
              href="/?view=map"
              prefetch={false}
              className="underline underline-offset-4"
            >
              {copy.map} →
            </Link>
            <Link
              href={`/webcams?${new URLSearchParams({ lat: String(definition.coordinates.lat), lng: String(definition.coordinates.lng), name: translation.place, back: url })}`}
              className="underline underline-offset-4"
            >
              {copy.webcams} →
            </Link>
          </div>
        </section>
        {data.relatedArticles.length > 0 && (
          <div className="mt-14">
            <RelatedArticles articles={data.relatedArticles} />
          </div>
        )}
        <aside className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold">{copy.otherGuides}</h2>
          <ul className="mt-4 flex flex-wrap gap-5 text-sm font-semibold text-sky-800">
            {LOCAL_GUIDES.filter(
              (guide) =>
                guide.slug !== definition.slug && guide.translations[locale],
            ).map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/vent-en-direct/${guide.slug}`}
                  className="underline underline-offset-4"
                >
                  {guide.translations[locale]!.place} →
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <footer className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold">{copy.sources}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {data.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 underline underline-offset-4"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </article>
  );
}
