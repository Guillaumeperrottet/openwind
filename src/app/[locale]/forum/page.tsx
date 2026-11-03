import { articleCorrectionDraft } from "@/lib/article-correction";
import { previewCarnetRevision } from "@/lib/carnet-preview";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";
import { ForumPageClient } from "./ForumPageClient";

const FORUM_DESCRIPTIONS = {
  fr: "Forum communautaire Openwind — discussions sur les spots, le matériel, le projet et entraide entre pratiquants.",
  en: "Openwind community forum — discuss spots, equipment, the project and share advice with other riders.",
  de: "Openwind Community-Forum — Austausch über Spots, Ausrüstung, das Projekt und gegenseitige Hilfe.",
  it: "Forum della comunità Openwind — discussioni su spot, attrezzatura, progetto e consigli tra praticanti.",
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;
  const description = FORUM_DESCRIPTIONS[toSiteLocale(locale)];

  return {
    title: "Forum",
    ...(query.article ? { robots: { index: false, follow: true } } : {}),
    description,
    alternates: localizedAlternates(locale, "/forum"),
    openGraph: {
      title: "Forum — Openwind",
      description,
      url: localizedUrl(locale, "/forum"),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ForumPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  let correctionDraft = null;
  if (locale === "fr" && typeof query.article === "string" && /^[a-z0-9-]{1,160}$/.test(query.article) && (query.section === undefined || (typeof query.section === "string" && /^[a-z0-9-]{0,300}$/.test(query.section)))) {
    const article = await prisma.article.findFirst({ where: { slug: query.article, kind: "EDITORIAL", status: "PUBLISHED" } });
    if (article) correctionDraft = articleCorrectionDraft(previewCarnetRevision(article), (query.section as string | undefined) ?? "");
  }
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { topics: true } },
      topics: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          author: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .filter(Boolean);
  const isAdmin = !!user && adminIds.includes(user.id);

  const serialized = categories.map((cat: (typeof categories)[number]) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    order: cat.order,
    topicCount: cat._count.topics,
    lastTopic: cat.topics[0]
      ? {
          title: cat.topics[0].title,
          authorName: cat.topics[0].author.name ?? "Anonyme",
        }
      : null,
  }));

  return <ForumPageClient categories={serialized} isAdmin={isAdmin} correctionDraft={correctionDraft} correctionUnavailable={!!query.article && !correctionDraft} />;
}
