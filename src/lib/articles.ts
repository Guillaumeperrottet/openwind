export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type ArticleStatusValue = (typeof ARTICLE_STATUSES)[number];

export interface ArticleSource {
  label: string;
  url: string;
}

export interface ArticleDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  location: string | null;
  readTime: number;
  status: ArticleStatusValue;
  seoTitle: string | null;
  seoDescription: string | null;
  sources: ArticleSource[];
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function parseArticleSources(value: unknown): ArticleSource[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (source): source is ArticleSource =>
      typeof source === "object" &&
      source !== null &&
      typeof (source as ArticleSource).label === "string" &&
      typeof (source as ArticleSource).url === "string",
  );
}

export function articleToDto(article: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
  location: string | null;
  readTime: number;
  status: ArticleStatusValue;
  seoTitle: string | null;
  seoDescription: string | null;
  sources: unknown;
  authorName: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ArticleDto {
  return {
    ...article,
    sources: parseArticleSources(article.sources),
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export function slugifyArticleTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
