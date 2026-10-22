export type CollectionParams = Record<string, string | string[] | undefined>;
export type PublicationKind = "all" | "guides" | "articles";
export interface CollectionQuery {
  page: number;
  q: string;
  kind: PublicationKind;
}

export const GUIDE_PAGE_SIZE = 6;
export const CARNET_PAGE_SIZE = 9;
export const HOME_GUIDE_COUNT = 6;

export function collectionQuery(params: CollectionParams): CollectionQuery {
  const rawPage = params.page;
  const page =
    rawPage === undefined
      ? 1
      : typeof rawPage === "string" &&
          /^[1-9]\d*$/.test(rawPage) &&
          Number.isSafeInteger(Number(rawPage))
        ? Number(rawPage)
        : 0;
  return {
    page,
    q:
      typeof params.q === "string"
        ? params.q.trim().replace(/\s+/g, " ").slice(0, 120)
        : "",
    kind:
      params.kind === "guides" || params.kind === "articles"
        ? params.kind
        : "all",
  };
}

/** Page one has no page parameter. Filters survive pagination, never a stale page number. */
export function collectionPath(
  path: string,
  query: CollectionQuery,
  page = query.page,
): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.kind !== "all") params.set("kind", query.kind);
  if (page > 1) params.set("page", String(page));
  return path + (params.size ? `?${params}` : "");
}

export function collectionPage<T>(
  items: readonly T[],
  page: number,
  size: number,
) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const valid = page >= 1 && page <= pages;
  const offset = (page - 1) * size;
  return {
    items: valid ? items.slice(offset, offset + size) : [],
    total: items.length,
    pages,
    page,
    valid,
    start: items.length && valid ? offset + 1 : 0,
    end: valid ? Math.min(offset + size, items.length) : 0,
  };
}

export function pageNumbers(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((value) => value > 0 && value <= pages)
    .sort((a, b) => a - b);
  return numbers.flatMap((value, index) =>
    index && value - numbers[index - 1] > 1 ? ["gap" as const, value] : [value],
  );
}
