export const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const ARTICLE_KINDS = ["EDITORIAL", "LOCAL_GUIDE"] as const;

export type ArticleStatusValue = (typeof ARTICLE_STATUSES)[number];
export type ArticleKindValue = (typeof ARTICLE_KINDS)[number];

export interface ArticleSource {
  label: string;
  url: string;
}

export interface ArticleDto {
  id: string;
  kind: ArticleKindValue;
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
  linkedSpotIds: string[];
  linkedStationIds: string[];
  relatedArticleIds: string[];
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
  kind: ArticleKindValue;
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
  linkedSpotIds: string[];
  linkedStationIds: string[];
  relatedArticleIds: string[];
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

export interface ArticleRelationOptions {
  spots: Array<{
    id: string;
    name: string;
    region: string | null;
    country: string | null;
    sportType: "KITE" | "PARAGLIDE";
  }>;
  stations: Array<{
    id: string;
    name: string;
    source: string;
    altitudeM: number;
  }>;
  articles: Array<{
    id: string;
    title: string;
    kind: ArticleKindValue;
    status: ArticleStatusValue;
  }>;
}

export function articlePublicPath(
  article: Pick<ArticleDto, "kind" | "slug">,
): string {
  return article.kind === "LOCAL_GUIDE"
    ? `/vent-en-direct/${article.slug}`
    : `/carnet/${article.slug}`;
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
