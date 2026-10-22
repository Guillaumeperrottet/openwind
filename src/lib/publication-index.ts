import {
  LOCAL_GUIDES,
  type LocalGuide,
  type GuideLocale,
} from "@/lib/local-guides";
import { normalizeSearch } from "@/lib/search";
import {
  CARNET_PAGE_SIZE,
  collectionPage,
  type CollectionQuery,
} from "@/lib/collections";

export interface CarnetIndexArticle {
  id: string;
  kind: "EDITORIAL" | "LOCAL_GUIDE";
  href: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  coverCredit?: LocalGuide["coverCredit"];
  category: string;
  location: string | null;
  readTime: number;
  publishedLabel: string | null;
  sortDate?: string;
  searchTerms?: string;
}

export function matchesCollection(
  query: string,
  ...values: (string | null | undefined)[]
) {
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  const text = normalizeSearch(values.filter(Boolean).join(" "));
  return words.every((word) => text.includes(word));
}

export function guideSearchText(guide: LocalGuide) {
  return [
    guide.region,
    ...(guide.aliases ?? []),
    ...Object.values(guide.translations).flatMap((copy) =>
      copy ? [copy.title, copy.place] : [],
    ),
  ].join(" ");
}

export function guideCollection(locale: GuideLocale, q: string) {
  return LOCAL_GUIDES.filter(
    (guide) =>
      guide.translations[locale] &&
      matchesCollection(
        q,
        guideSearchText(guide),
        guide.translations[locale]?.description,
      ),
  );
}

/** The registry supplies every guide; a published French admin edition takes precedence. */
export function carnetCollection(published: CarnetIndexArticle[]) {
  const date = new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Zurich",
  });
  const byPath = new Map(published.map((article) => [article.href, article]));
  for (const guide of LOCAL_GUIDES) {
    const href = `/vent-en-direct/${guide.slug}`;
    const translation = guide.translations.fr;
    const override = byPath.get(href);
    byPath.set(href, {
      id: `guide-${guide.slug}`,
      kind: "LOCAL_GUIDE",
      href,
      title: translation.title,
      excerpt: translation.description,
      coverImage: guide.coverImage,
      coverAlt: translation.coverAlt,
      category: "Guide de lac",
      location: translation.place,
      readTime: Math.max(
        1,
        Math.ceil(translation.content.split(/\s+/).length / 200),
      ),
      publishedLabel: date.format(new Date(guide.updatedAt)),
      sortDate: guide.publishedAt,
      ...override,
      coverCredit:
        !override || override.coverImage === guide.coverImage
          ? guide.coverCredit
          : undefined,
      searchTerms: guideSearchText(guide),
    });
  }
  const sorted = [...byPath.values()].sort(
    (a, b) =>
      (b.sortDate ?? "").localeCompare(a.sortDate ?? "") ||
      a.href.localeCompare(b.href),
  );
  const featured = sorted.find((article) => article.kind === "EDITORIAL");
  return featured
    ? [featured, ...sorted.filter((article) => article !== featured)]
    : sorted;
}

export function carnetPage(
  articles: CarnetIndexArticle[],
  query: CollectionQuery,
) {
  const filtered = articles.filter(
    (article) =>
      (query.kind === "all" ||
        article.kind ===
          (query.kind === "guides" ? "LOCAL_GUIDE" : "EDITORIAL")) &&
      matchesCollection(
        query.q,
        article.title,
        article.excerpt,
        article.location,
        article.category,
        article.searchTerms,
      ),
  );
  return collectionPage(filtered, query.page, CARNET_PAGE_SIZE);
}
