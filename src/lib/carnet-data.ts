import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { articlePublicPath } from "@/lib/articles";
import {
  carnetCollection,
  type CarnetIndexArticle,
} from "@/lib/publication-index";

// Share one publication snapshot between metadata and page rendering per request.
export const getCarnetPublications = cache(async () => {
  const publishedArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      kind: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      coverAlt: true,
      category: true,
      location: true,
      readTime: true,
      publishedAt: true,
      createdAt: true,
    },
  });
  const publicationDate = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Zurich",
  });

  const publishedIndexArticles: CarnetIndexArticle[] = publishedArticles.map(
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
      publishedLabel: publicationDate.format(
        article.publishedAt ?? article.createdAt,
      ),
      sortDate: (article.publishedAt ?? article.createdAt).toISOString(),
    }),
  );
  return carnetCollection(publishedIndexArticles);
});
