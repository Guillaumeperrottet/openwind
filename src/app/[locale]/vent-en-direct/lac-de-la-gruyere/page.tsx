import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  ExternalLink,
  Gauge,
  MapPin,
  PenLine,
  RefreshCcw,
  ShieldAlert,
  Waves,
  Wind,
} from "lucide-react";
import { ArticleMarkdown } from "@/components/carnet/ArticleMarkdown";
import { ArticleReadTracker } from "@/components/carnet/ArticleReadTracker";
import { ArticleShare } from "@/components/carnet/ArticleShare";
import { RelatedArticles } from "@/components/carnet/RelatedArticles";
import { Link } from "@/i18n/navigation";
import { parseArticleSources } from "@/lib/articles";
import { resolveArticleConnections } from "@/lib/article-connections";
import { prisma } from "@/lib/prisma";
import { localizedUrl } from "@/lib/site";
import {
  LiveStations,
  type LiveStationSummary,
} from "./LiveStations";

const PAGE_PATH = "/vent-en-direct/lac-de-la-gruyere";
const PAGE_URL = localizedUrl("fr", PAGE_PATH);
const CARNET_URL = localizedUrl("fr", "/carnet");
const MORLON_SPOT_ID = "cmnq613tx00it04kw1d0vraq4";
const HERO_IMAGE =
  "https://fnndeoqzqfxpznhcundq.supabase.co/storage/v1/object/public/spot-images/cmnq613tx00it04kw1d0vraq4/1776010538678.jpeg";
const FALLBACK_TITLE = "Vent en direct au lac de la Gruyère";
const FALLBACK_DESCRIPTION =
  "Les mesures de Morlon Beach et Marsens, le spot local, les directions à surveiller et les informations essentielles avant d’aller sur l’eau.";
const FALLBACK_STATIONS: LiveStationSummary[] = [
  {
    id: "windball-wf-35",
    name: "Morlon Beach",
    source: "windball",
  },
  {
    id: "MAS",
    name: "Marsens",
    source: "meteoswiss",
  },
];

interface Props {
  params: Promise<{ locale: string }>;
}

async function findGruyereGuide() {
  return prisma.article.findFirst({
    where: {
      kind: "LOCAL_GUIDE",
      slug: "lac-de-la-gruyere",
      status: "PUBLISHED",
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "fr") {
    return { robots: { index: false, follow: false } };
  }

  const guide = await findGruyereGuide().catch(() => null);
  const title = guide?.seoTitle || guide?.title || FALLBACK_TITLE;
  const description =
    guide?.seoDescription || guide?.excerpt || FALLBACK_DESCRIPTION;
  const heroImage = guide?.coverImage || HERO_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: `${title} — Openwind`,
      description,
      url: PAGE_URL,
      type: "article",
      locale: "fr_CH",
      publishedTime: guide?.publishedAt?.toISOString(),
      modifiedTime: guide?.updatedAt.toISOString(),
      authors: guide ? [guide.authorName] : ["Openwind"],
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 763,
          alt:
            guide?.coverAlt ||
            "Le lac de la Gruyère et les Préalpes fribourgeoises",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Openwind`,
      description,
      images: [heroImage],
    },
  };
}

const faq = [
  {
    question: "Où voir le vent en direct au lac de la Gruyère ?",
    answer:
      "Les balises sélectionnées pour ce guide sont affichées dans le bloc « Le vent mesuré autour du lac ». Elles permettent de comparer plusieurs points du lac et un repère régional complémentaire.",
  },
  {
    question: "Le kitesurf est-il autorisé sur le lac de la Gruyère ?",
    answer:
      "La pratique est autorisée dans les zones qui ne figurent pas parmi les secteurs d’exclusion. Il faut consulter la signalisation locale et la réglementation cantonale en vigueur avant chaque mise à l’eau.",
  },
  {
    question: "Morlon Beach convient-il aux débutants ?",
    answer:
      "La fiche locale Openwind classe le spot comme expert en raison d’un vent souvent irrégulier, du plan d’eau clapoteux et des obstacles proches de la zone de départ. L’encadrement par un professionnel est recommandé si le spot n’est pas familier.",
  },
];

export default async function LacDeLaGruyerePage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "fr") notFound();

  const guide = await findGruyereGuide().catch(() => null);
  const connections = guide ? await resolveArticleConnections(guide) : null;
  const relatedArticles = connections?.relatedArticles ?? [];
  const displayedStations: LiveStationSummary[] = guide
    ? (connections?.stations ?? []).map(({ id, name, source }) => ({
        id,
        name,
        source,
      }))
    : FALLBACK_STATIONS;
  const sources = parseArticleSources(guide?.sources);
  const heroImage = guide?.coverImage || HERO_IMAGE;
  const title = guide?.title || FALLBACK_TITLE;
  const description = guide?.excerpt || FALLBACK_DESCRIPTION;
  const publishedAt = guide?.publishedAt ?? guide?.createdAt;
  const formattedPublishedDate = publishedAt
    ? new Intl.DateTimeFormat("fr-CH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(publishedAt)
    : null;
  const formattedUpdatedDate = guide
    ? new Intl.DateTimeFormat("fr-CH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(guide.updatedAt)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description,
        url: PAGE_URL,
        inLanguage: "fr-CH",
        image: heroImage,
        author: {
          "@type": "Organization",
          name: guide?.authorName || "Openwind",
        },
      },
      ...(guide
        ? [
            {
              "@type": "Article",
              headline: guide.title,
              description: guide.excerpt,
              url: PAGE_URL,
              mainEntityOfPage: PAGE_URL,
              inLanguage: "fr-CH",
              datePublished: publishedAt?.toISOString(),
              dateModified: guide.updatedAt.toISOString(),
              image: heroImage,
              author: {
                "@type": "Organization",
                name: guide.authorName,
              },
              publisher: { "@type": "Organization", name: "Openwind" },
              citation: sources.map((source) => source.url),
            },
          ]
        : []),
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
            item: CARNET_URL,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Vent au lac de la Gruyère",
            item: PAGE_URL,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative isolate min-h-[540px] overflow-hidden bg-slate-950">
        {/* The guide cover can be changed to any admin-approved HTTPS source. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={
            guide?.coverAlt ||
            "Vue aérienne du lac de la Gruyère et des Préalpes"
          }
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[540px] max-w-6xl flex-col justify-end px-5 pb-14 pt-20 sm:px-8 lg:px-10">
          <nav className="mb-auto flex items-center gap-2 text-xs text-white/70">
            <Link href="/carnet" className="transition hover:text-white">
              Le Carnet Openwind
            </Link>
            <span>/</span>
            <span>Lac de la Gruyère</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
              <MapPin className="h-3.5 w-3.5" />
              Carnet Nº01 · Fribourg
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {displayedStations.length > 0 && (
                <a
                  href="#vent-direct"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400"
                >
                  Voir le vent maintenant
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <Link
                href={`/spots/${MORLON_SPOT_ID}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Fiche de Morlon Beach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        {guide && (
          <div className="mb-12">
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              {formattedPublishedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-sky-700" />
                  {formattedPublishedDate}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-sky-700" />
                {guide.readTime} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PenLine className="h-4 w-4 text-sky-700" />
                Par {guide.authorName}
              </span>
              {formattedUpdatedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCcw className="h-4 w-4 text-sky-700" />
                  Mis à jour le {formattedUpdatedDate}
                </span>
              )}
            </div>
            <ArticleShare
              title={guide.title}
              text={guide.excerpt}
              url={PAGE_URL}
              articleSlug={guide.slug}
            />
          </div>
        )}

        {displayedStations.length > 0 && (
          <section id="vent-direct" className="scroll-mt-24">
            <div className="mb-7 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                Balises en direct
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Le vent mesuré autour du lac
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Compare les directions, les rafales et l&apos;heure de mise à jour
                des balises choisies pour ce guide. Les écarts entre deux points
                peuvent révéler un effet très local lié au relief ou à la rive.
              </p>
            </div>
            <LiveStations stations={displayedStations} />
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Les mesures sont indicatives. Observe toujours les conditions sur
              place et leur évolution avant de t&apos;engager.
            </p>
          </section>
        )}

        {guide && (
          <section className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="min-w-0">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                Le Carnet local
              </p>
              <ArticleMarkdown>{guide.content}</ArticleMarkdown>
              <ArticleReadTracker
                articleSlug={guide.slug}
                contentType="local_guide"
              />
            </div>
            <aside className="h-fit border-l-2 border-sky-600 pl-5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                Conseil terrain
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Une mesure aide à comprendre le vent à un point précis. Elle ne
                remplace jamais l’observation du lac, des rafales et de leur
                évolution.
              </p>
            </aside>
          </section>
        )}

        <section className="mt-20 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Wind className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
                  Spot local
                </p>
                <h2 className="text-2xl font-bold text-slate-950">
                  Morlon Beach
                </h2>
              </div>
            </div>

            <p className="mt-6 leading-7 text-slate-600">
              Morlon est le point de référence Openwind pour le kitesurf sur
              le lac. La fiche locale indique des directions favorables
              réparties du nord-est au nord-ouest. La configuration encaissée
              et les reliefs environnants peuvent toutefois produire un vent
              irrégulier : la moyenne seule ne suffit pas, les rafales et les
              variations de direction comptent tout autant.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Compass,
                  label: "Directions relevées",
                  value: "NE à NW",
                },
                {
                  icon: Gauge,
                  label: "Niveau conseillé",
                  value: "Expert",
                },
                {
                  icon: Waves,
                  label: "Plan d’eau",
                  value: "Clapot possible",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <Icon className="h-4 w-4 text-sky-600" />
                  <p className="mt-3 text-xs text-slate-500">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/spots/${MORLON_SPOT_ID}`}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-500"
            >
              Consulter les prévisions et l&apos;historique de Morlon
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <aside className="rounded-3xl bg-slate-900 p-7 text-white shadow-sm sm:p-9">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
            <h2 className="mt-5 text-2xl font-bold">Sécurité et accès</h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
              <li>
                Morlon Beach est une plage publique partagée avec les
                baigneurs et les autres activités nautiques.
              </li>
              <li>
                Des arbres et obstacles se trouvent près de la zone de départ.
                Prévois une marge importante pour le décollage et
                l&apos;atterrissage.
              </li>
              <li>
                Le kitesurf est soumis aux zones d&apos;exclusion cantonales et à
                la signalisation locale. Une distance minimale de 200 m doit
                être respectée avec les bateaux concessionnaires et les
                débarcadères.
              </li>
              <li>
                Vérifie les rafales, la direction et la tendance, puis confirme
                visuellement les conditions au bord de l&apos;eau.
              </li>
            </ul>
            <a
              href="https://bdlf.fr.ch/app/fr/texts_of_law/785.21"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
            >
              Réglementation cantonale actuelle
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </aside>
        </section>

        {!guide && (
          <section className="mt-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                Lire les conditions
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Trois contrôles avant une sortie
              </h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Comparer les balises",
                  text: "Morlon décrit le bord du lac, tandis que Marsens donne le contexte régional. Une différence marquée mérite de rester prudent.",
                },
                {
                  number: "02",
                  title: "Regarder les rafales",
                  text: "Sur un site irrégulier, l’écart entre vent moyen et rafales est aussi important que la vitesse affichée.",
                },
                {
                  number: "03",
                  title: "Observer le plan d’eau",
                  text: "Les lignes de vent, le clapot, les grains et les autres usagers donnent des informations qu’aucune balise ne remplace.",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="rounded-3xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-sm font-bold text-sky-600">
                    {item.number}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-20 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Questions fréquentes
          </h2>
          <div className="mt-7 divide-y divide-slate-200">
            {faq.map((item) => (
              <article key={item.question} className="py-6 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 flex flex-col justify-between gap-6 rounded-3xl bg-sky-600 p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-sm font-semibold text-sky-100">
              Prépare ta prochaine session
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              Compare les meilleurs jours autour de la Gruyère
            </h2>
          </div>
          <Link
            href="/plan"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Ouvrir le planificateur
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {relatedArticles.length > 0 && (
          <div className="mt-20">
            <RelatedArticles articles={relatedArticles} />
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/carnet"
            className="inline-flex items-center gap-2 border-b border-slate-400 pb-1 text-sm font-semibold text-slate-700 transition hover:border-sky-600 hover:text-sky-700"
          >
            Découvrir tous les Carnets Openwind
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-8 text-xs leading-5 text-slate-500">
          {sources.length > 0 ? (
            <>
              <p className="font-semibold uppercase tracking-[0.14em] text-slate-600">
                Sources vérifiées
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                    >
                      {source.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              Sources locales : Région de Fribourg et État de Fribourg. Les
              règles et la signalisation sur place restent prioritaires.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
