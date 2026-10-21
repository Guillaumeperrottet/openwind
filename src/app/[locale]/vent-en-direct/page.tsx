import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  GUIDE_COPY,
  GUIDE_LOCALES,
  LOCAL_GUIDES,
  isGuideLocale,
} from "@/lib/local-guides";
import { localizedUrl } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isGuideLocale(locale)) return {};
  const copy = GUIDE_COPY[locale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: localizedUrl(locale, "/vent-en-direct"),
      languages: {
        "x-default": localizedUrl("fr", "/vent-en-direct"),
        ...Object.fromEntries(
          GUIDE_LOCALES.map((language) => [
            language,
            localizedUrl(language, "/vent-en-direct"),
          ]),
        ),
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: localizedUrl(locale, "/vent-en-direct"),
      type: "website",
    },
  };
}

export default async function GuidesPage({ params }: Props) {
  const { locale } = await params;
  if (!isGuideLocale(locale)) permanentRedirect("/fr/vent-en-direct");
  const copy = GUIDE_COPY[locale];
  const guides = LOCAL_GUIDES.filter((guide) => guide.translations[locale]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.title,
    description: copy.description,
    inLanguage: `${locale}-CH`,
    url: localizedUrl(locale, "/vent-en-direct"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
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
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {guides.map((guide) => {
          const translation = guide.translations[locale]!;
          return (
            <article
              key={guide.slug}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Link href={`/vent-en-direct/${guide.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guide.coverImage}
                  alt={translation.coverAlt}
                  width={1200}
                  height={763}
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
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
            </article>
          );
        })}
      </div>
    </div>
  );
}
