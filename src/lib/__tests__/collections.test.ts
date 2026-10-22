import { describe, expect, it } from "vitest";
import {
  collectionPage,
  collectionPath,
  collectionQuery,
  pageNumbers,
} from "../collections";
import {
  carnetCollection,
  carnetPage,
  guideCollection,
  type CarnetIndexArticle,
} from "../publication-index";
import { LOCAL_GUIDES } from "../local-guides";

describe("URL based collections", () => {
  it.each(["0", "-1", "1.5", "abc", "01", "99999999999999999999", ["1", "2"]])(
    "rejects invalid page %s",
    (page) => {
      expect(collectionQuery({ page }).page).toBe(0);
    },
  );
  it("normalizes filters, caps the query and keeps the first page URL clean", () => {
    expect(collectionQuery({ q: "  lac   Léman ", kind: "surprise" })).toEqual({
      page: 1,
      q: "lac Léman",
      kind: "all",
    });
    expect(collectionQuery({ q: "a".repeat(150) }).q).toHaveLength(120);
    const query = { page: 3, q: "Ägeri & Zoug", kind: "guides" as const };
    expect(collectionPath("/carnet", query, 1)).toBe(
      "/carnet?q=%C3%84geri+%26+Zoug&kind=guides",
    );
    expect(collectionPath("/carnet", { page: 1, q: "", kind: "all" })).toBe(
      "/carnet",
    );
  });
  it("never duplicates or loses items between pages, handles empty results and rejects missing pages", () => {
    const items = Array.from({ length: 23 }, (_, index) => index);
    expect(
      [1, 2, 3, 4].flatMap((page) => collectionPage(items, page, 6).items),
    ).toEqual(items);
    expect(collectionPage(items, 4, 6)).toMatchObject({
      start: 19,
      end: 23,
      pages: 4,
      valid: true,
    });
    expect(collectionPage(items, 5, 6).valid).toBe(false);
    expect(collectionPage([], 1, 6)).toMatchObject({
      items: [],
      valid: true,
      start: 0,
      end: 0,
      pages: 1,
    });
    expect(collectionPage([], 2, 6).valid).toBe(false);
    expect(pageNumbers(6, 20)).toEqual([1, "gap", 5, 6, 7, "gap", 20]);
    expect(pageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
  });
  it.each(["fr", "de", "it"] as const)(
    "finds guides using names and shore aliases in %s",
    (locale) => {
      for (const q of ["Ägerisee", "Aegerisee", "Oberaegeri"])
        expect(
          guideCollection(locale, q).some(
            (guide) => guide.slug === "lac-d-aegeri",
          ),
        ).toBe(true);
      expect(guideCollection(locale, "zzzzzz")).toHaveLength(0);
    },
  );
});

describe("Carnet registry integration", () => {
  const editorial: CarnetIndexArticle = {
    id: "article",
    kind: "EDITORIAL",
    href: "/carnet/vent",
    title: "Comprendre le vent",
    excerpt: "Le vent local",
    coverImage: null,
    coverAlt: null,
    category: "Météo",
    location: null,
    readTime: 5,
    publishedLabel: null,
    sortDate: "2026-10-01",
  };
  it("includes every lake, merges admin editions by destination and keeps an editorial lead", () => {
    const guide = LOCAL_GUIDES[0];
    const override = {
      ...editorial,
      id: "admin-guide",
      kind: "LOCAL_GUIDE" as const,
      href: `/vent-en-direct/${guide.slug}`,
      title: "Édition mise à jour",
      coverImage: "/community.jpg",
    };
    const all = carnetCollection([editorial, override]);
    expect(all).toHaveLength(LOCAL_GUIDES.length + 1);
    expect(all[0]).toEqual(editorial);
    expect(all.filter((item) => item.href === override.href)).toHaveLength(1);
    expect(all.find((item) => item.href === override.href)).toMatchObject({
      title: override.title,
      coverImage: override.coverImage,
      coverCredit: undefined,
    });
    expect(
      all.find((item) => item.href.endsWith("/sihlsee"))?.coverCredit?.author,
    ).toBe("Jane kurko");
    const guides = carnetPage(all, { page: 1, q: "", kind: "guides" });
    expect(guides.total).toBe(LOCAL_GUIDES.length);
    const articles = carnetPage(all, { page: 1, q: "", kind: "articles" });
    expect(articles.items).toEqual([editorial]);
    expect(
      carnetPage(all, { page: 1, q: "Hallwilersee", kind: "all" }).items.some(
        (item) => item.href.endsWith("/lac-de-hallwil"),
      ),
    ).toBe(true);
  });
});
