import { describe, expect, it } from "vitest";
import { MAX_SAVED_ARTICLES, MAX_READING_POSITIONS, mergeReadingLibraries, parseReadingLibrary, readingIdentity, type ReadingArticle } from "../reading-library";
const article = (index: number): ReadingArticle => ({ kind: "EDITORIAL", slug: `article-${index}`, title: `Article ${index}`, readTime: 5 });
const raw = (saved: unknown[], positions: unknown[] = []) => JSON.stringify({ version: 1, saved, positions });

describe("device reading library", () => {
  it("retains validated public metadata and no arbitrary stored fields", () => {
    const result = parseReadingLibrary(raw([{ ...article(1), token: "untrusted", href: "javascript:alert(1)" }]));
    expect(result.saved).toEqual([article(1)]);
    expect(readingIdentity(result.saved[0])).toBe("EDITORIAL:article-1");
  });
  it("rejects malformed storage, unsupported versions, unsafe slugs and impossible values", () => {
    for (const value of [null, "broken", '{"version":2,"saved":[]}', "x".repeat(150001)]) expect(parseReadingLibrary(value)).toEqual({ saved: [], positions: [] });
    const invalid = [null, {}, { ...article(1), slug: "//evil.test" }, { ...article(2), kind: "DRAFT" }, { ...article(3), readTime: -1 }, { ...article(4), title: " " }, { ...article(5), readTime: "5" }];
    expect(parseReadingLibrary(raw(invalid)).saved).toEqual([]);
  });
  it("bounds storage and deduplicates identities independently for bookmarks and positions", () => {
    const saved = Array.from({ length: 30 }, (_, i) => article(i));
    const position = (index: number) => ({ ...article(index), revision: "a".repeat(16), heading: "un-titre", title: "Une rubrique" });
    const result = parseReadingLibrary(raw([saved[0], ...saved], [position(0), ...Array.from({ length: 50 }, (_, i) => position(i))]));
    expect(result.saved).toHaveLength(MAX_SAVED_ARTICLES);
    expect(result.positions).toHaveLength(MAX_READING_POSITIONS);
    expect(parseReadingLibrary(raw([], [{ ...position(1), heading: "#injected" }, { ...position(2), revision: "old" }])).positions).toEqual([]);
  });
  it("imports guest reading idempotently, keeping account choices and unimported guest entries", () => {
    const account = { saved: Array.from({ length: MAX_SAVED_ARTICLES - 1 }, (_, i) => article(i)), positions: [] };
    const guest = { saved: [{ ...article(0), title: "Guest name" }, article(25), article(26)], positions: [] };
    const result = mergeReadingLibraries(account, guest);
    expect(result.merged.saved).toHaveLength(MAX_SAVED_ARTICLES);
    expect(result.merged.saved[0].title).toBe("Article 0");
    expect(result.remaining.saved).toEqual([article(26)]);
    expect(mergeReadingLibraries(result.merged, guest)).toEqual(result);
  });
});
