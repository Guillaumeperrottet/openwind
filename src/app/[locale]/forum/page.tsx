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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const description = FORUM_DESCRIPTIONS[toSiteLocale(locale)];

  return {
    title: "Forum",
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

export default async function ForumPage() {
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

  return <ForumPageClient categories={serialized} isAdmin={isAdmin} />;
}
