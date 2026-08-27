import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Compass,
  MapPin,
  MessageSquare,
  Radio,
  ShieldCheck,
  Wind,
} from "lucide-react";
import {
  CarnetArticleIndex,
  type CarnetIndexArticle,
} from "@/components/carnet/CarnetArticleIndex";
import { Link } from "@/i18n/navigation";
import { articlePublicPath } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { localizedUrl } from "@/lib/site";

const PAGE_PATH = "/carnet";
const PAGE_URL = localizedUrl("fr", PAGE_PATH);
const GRUYERE_PATH = "/vent-en-direct/lac-de-la-gruyere";
const GRUYERE_URL = localizedUrl("fr", GRUYERE_PATH);
const HERO_IMAGE =
  "https://fnndeoqzqfxpznhcundq.supabase.co/storage/v1/object/public/spot-images/cmnq613tx00it04kw1d0vraq4/1776010538678.jpeg";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "fr") {
    return { robots: { index: false, follow: false } };
  }

  const title = "Le Carnet — Journal du kite en Suisse romande";
  const description =
    "Le journal de terrain Openwind : guides de spots, vents locaux, balises en direct, accès et règles pour le kite en Suisse romande.";

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title: `${title} — Openwind`,
      description,
      url: PAGE_URL,
      type: "website",
      locale: "fr_CH",
      images: [
        {
          url: HERO_IMAGE,
          width: 1200,
          height: 763,
          alt: "Le lac de la Gruyère vu depuis les airs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Openwind`,
      description,
      images: [HERO_IMAGE],
    },
  };
}

const editorialPillars = [
  {
    icon: MapPin,
    number: "01",
    title: "Les spots, vraiment",
    text: "Des guides ancrés dans le terrain : accès, orientations, particularités et points de vigilance.",
  },
  {
    icon: Radio,
    number: "02",
    title: "Le vent mesuré",
    text: "Les balises Openwind donnent le contexte en direct et permettent de comparer le spot à sa région.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Les règles vérifiées",
    text: "Des sources officielles, une date de mise à jour et la signalisation locale toujours prioritaire.",
  },
];

export default async function CarnetPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "fr") notFound();

  const publishedArticles = await prisma.article
    .findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    })
    .catch(() => []);
  const localGuide = publishedArticles.find(
    (article) => article.kind === "LOCAL_GUIDE",
  );
  const editorialArticles = publishedArticles.filter(
    (article) => article.kind === "EDITORIAL",
  );
  const guideDate = new Intl.DateTimeFormat("fr-CH", {
    month: "long",
    year: "numeric",
  }).format(localGuide?.publishedAt ?? localGuide?.createdAt ?? new Date());

  const carnetIndexArticles: CarnetIndexArticle[] = publishedArticles.map(
    (article) => ({
      id: article.id,
      kind: article.kind,
      href: articlePublicPath(article),
      title: article.title,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      coverAlt: article.coverAlt,
      category: article.category,
      location: article.location,
      readTime: article.readTime,
      publishedLabel: article.kind === "LOCAL_GUIDE" ? guideDate : null,
    }),
  );

  if (!localGuide) {
    carnetIndexArticles.unshift({
      id: "fallback-guide-gruyere",
      kind: "LOCAL_GUIDE",
      href: GRUYERE_PATH,
      title: "Comprendre le vent au lac de la Gruyère",
      excerpt:
        "Deux balises, un relief qui change tout et un spot exigeant à Morlon. Les mesures, les directions, l’accès et les règles à connaître avant d’aller sur l’eau.",
      coverImage: HERO_IMAGE,
      coverAlt: "Lac de la Gruyère et Préalpes fribourgeoises",
      category: "Guide local",
      location: "Fribourg",
      readTime: 6,
      publishedLabel: guideDate,
    });
  }

  const listedArticles = localGuide
    ? [localGuide, ...editorialArticles]
    : editorialArticles;
  const itemListElement = [
    ...(!localGuide
      ? [
          {
            "@type": "ListItem",
            position: 1,
            name: "Comprendre le vent au lac de la Gruyère",
            url: GRUYERE_URL,
          },
        ]
      : []),
    ...listedArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + (localGuide ? 1 : 2),
      name: article.title,
      url: localizedUrl("fr", articlePublicPath(article)),
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Le Carnet Openwind",
        headline: "Le journal de terrain du vent et des spots de kite",
        description:
          "Guides de spots, vents locaux, balises en direct, accès et règles pour le kite en Suisse romande.",
        url: PAGE_URL,
        inLanguage: "fr-CH",
        image: HERO_IMAGE,
        publisher: { "@type": "Organization", name: "Openwind" },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: itemListElement.length,
          itemListElement,
        },
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
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-slate-200">
        <div className="mx-auto w-full max-w-[1480px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between border-y border-slate-900 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 sm:text-xs">
            <span>Journal de terrain</span>
            <span className="hidden sm:inline">Suisse romande</span>
            <span>Édition 2026</span>
          </div>

          <div className="grid gap-10 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
            <div>
              <div className="flex items-center gap-2 text-sky-700">
                <Wind className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.22em]">
                  Openwind présente
                </span>
              </div>
              <h1 className="mt-5 font-serif text-6xl font-semibold leading-[0.9] tracking-[-0.04em] text-slate-950 sm:text-7xl lg:text-[6.4rem] xl:text-[7.4rem]">
                Le Carnet{" "}
                <span className="block italic text-sky-700">Openwind</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
                Le journal du vent et des spots de kite en Suisse romande,
                écrit pour préparer une session sans perdre le contact avec le
                terrain.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Compass className="h-4 w-4 text-sky-700" />
                  Guides locaux
                </span>
                <span className="inline-flex items-center gap-2">
                  <Radio className="h-4 w-4 text-sky-700" />
                  Balises en direct
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-sky-700" />
                  Sources vérifiées
                </span>
              </div>
            </div>

            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <Image
                  src={HERO_IMAGE}
                  alt="Vue aérienne du lac de la Gruyère"
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
                <span className="absolute bottom-4 right-4 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-900 sm:left-4 sm:right-auto">
                  Carnet Nº01 · La Gruyère
                </span>
              </div>
              <figcaption className="mt-2 flex justify-between gap-4 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                <span>Morlon, Fribourg</span>
                <span>Photo de la communauté Openwind</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <div>
        <section className="mx-auto w-full max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 xl:px-12">
          <div className="mb-8 border-b border-slate-900 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                À la une
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
                Les Carnets à lire
              </h2>
            </div>
          </div>

          <CarnetArticleIndex articles={carnetIndexArticles} />
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto w-full max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 xl:px-12">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                Notre ligne éditoriale
              </p>
              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                Observer, vérifier, raconter.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Le Carnet ne promet pas le vent. Il donne les bons repères pour
                le comprendre et rappelle ce qu&apos;aucune application ne remplace
                : l&apos;observation sur place et l&apos;expérience locale.
              </p>
            </div>

            <div className="mt-10 grid border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200">
              {editorialPillars.map(({ icon: Icon, number, title, text }) => (
                <article
                  key={number}
                  className="border-b border-slate-200 py-7 last:border-b-0 md:border-b-0 md:px-7 md:first:pl-0 md:last:pr-0"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-sky-700" />
                    <span className="font-serif text-sm italic text-slate-400">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 xl:px-12">
          <aside className="border-l-2 border-sky-700 pl-6 sm:pl-8">
            <MessageSquare className="h-6 w-6 text-sky-700" />
            <h2 className="mt-5 font-serif text-3xl font-semibold">
              Ton spot a une histoire.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Une mise à l&apos;eau a changé, une règle mérite d&apos;être précisée ou
              une balise raconte mal la réalité ? La communauté peut aider le
              Carnet à rester juste.
            </p>
            <Link
              href="/forum"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 transition hover:text-sky-600"
            >
              Partager une information locale
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>

      </div>
    </div>
  );
}
