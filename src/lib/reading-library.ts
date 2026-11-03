export const MAX_SAVED_ARTICLES = 24;
export const MAX_READING_POSITIONS = 40;
export type ReadingKind = "EDITORIAL" | "LOCAL_GUIDE";
export interface ReadingArticle { kind: ReadingKind; slug: string; title: string; readTime: number }
export interface ReadingPosition { kind: ReadingKind; slug: string; revision: string; heading: string; title: string }
export interface ReadingLibrary { saved: ReadingArticle[]; positions: ReadingPosition[] }
export const readingIdentity = (item: Pick<ReadingArticle, "kind" | "slug">) => `${item.kind}:${item.slug}`;
const text = (value: unknown, max: number): value is string => typeof value === "string" && !!value.trim() && value.length <= max;
function identity(value: unknown): value is { kind: ReadingKind; slug: string; [key: string]: unknown } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["EDITORIAL", "LOCAL_GUIDE"].includes(String(item.kind)) && typeof item.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) && item.slug.length <= 160;
}
export function parseReadingLibrary(raw: string | null): ReadingLibrary {
  const empty: ReadingLibrary = { saved: [], positions: [] };
  try {
    if (raw && raw.length > 150000) return empty;
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1) return empty;
    if (Array.isArray(value.saved)) for (const item of value.saved) {
      if (!identity(item) || !text(item.title, 240) || typeof item.readTime !== "number" || !Number.isInteger(item.readTime) || item.readTime < 1 || item.readTime > 180 || empty.saved.some((s) => readingIdentity(s) === readingIdentity(item))) continue;
      empty.saved.push({ kind: item.kind, slug: item.slug, title: item.title.trim(), readTime: item.readTime });
      if (empty.saved.length === MAX_SAVED_ARTICLES) break;
    }
    if (Array.isArray(value.positions)) for (const item of value.positions) {
      if (!identity(item) || !text(item.title, 240) || typeof item.revision !== "string" || !/^[a-f0-9]{16}$/.test(item.revision) || typeof item.heading !== "string" || !/^[a-z0-9-]{1,300}$/.test(item.heading) || empty.positions.some((p) => readingIdentity(p) === readingIdentity(item))) continue;
      empty.positions.push({ kind: item.kind, slug: item.slug, revision: item.revision, heading: item.heading, title: item.title });
      if (empty.positions.length === MAX_READING_POSITIONS) break;
    }
    return empty;
  } catch { return empty; }
}
export function mergeReadingLibraries(account: ReadingLibrary, guest: ReadingLibrary) {
  const saved = [...account.saved], positions = [...account.positions];
  const remaining: ReadingLibrary = { saved: [], positions: [] };
  for (const article of guest.saved) {
    if (saved.some((s) => readingIdentity(s) === readingIdentity(article))) continue;
    if (saved.length < MAX_SAVED_ARTICLES) saved.push(article); else remaining.saved.push(article);
  }
  for (const position of guest.positions) {
    if (positions.some((p) => readingIdentity(p) === readingIdentity(position))) continue;
    if (positions.length < MAX_READING_POSITIONS) positions.push(position); else remaining.positions.push(position);
  }
  return { merged: { saved, positions }, remaining };
}
