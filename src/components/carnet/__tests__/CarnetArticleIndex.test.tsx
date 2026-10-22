import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  CarnetArticleIndex,
  type CarnetIndexArticle,
} from "@/components/carnet/CarnetArticleIndex";
import {
  CARNET_PAGE_SIZE,
  collectionPage,
  collectionQuery,
} from "@/lib/collections";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));

function article(
  index: number,
  kind: CarnetIndexArticle["kind"],
): CarnetIndexArticle {
  return {
    id: `publication-${index}`,
    kind,
    href:
      kind === "LOCAL_GUIDE"
        ? `/vent-en-direct/lac-${index}`
        : `/carnet/vent-${index}`,
    title: `Publication ${index}`,
    excerpt:
      "Un guide pour comprendre le vent et préparer sa prochaine sortie.",
    coverImage: index % 2 ? null : `/capture/map.png`,
    coverAlt: "Une carte des balises",
    category: kind === "LOCAL_GUIDE" ? "Guide local" : "Comprendre le vent",
    location: "Suisse romande",
    readTime: 8,
    publishedLabel: "8 sept. 2026",
  };
}

describe("Carnet publication index", () => {
  it.each(["EDITORIAL", "LOCAL_GUIDE", "MIXED"] as const)(
    "renders every publication exactly once across pages for a large %s collection",
    (collection) => {
      const articles = Array.from({ length: 16 }, (_, index) =>
        article(
          index,
          collection === "MIXED"
            ? index % 3
              ? "EDITORIAL"
              : "LOCAL_GUIDE"
            : collection,
        ),
      );
      const pages = Array.from(
        { length: collectionPage(articles, 1, CARNET_PAGE_SIZE).pages },
        (_, index) =>
          renderToStaticMarkup(
            <CarnetArticleIndex
              articles={articles}
              query={collectionQuery({ page: String(index + 1) })}
            />,
          ),
      );
      const html = pages.join("");
      for (const page of pages)
        expect((page.match(/<article /g) ?? []).length).toBeLessThanOrEqual(
          CARNET_PAGE_SIZE,
        );

      // Guides beyond the first one used to be counted but omitted from the page.
      const renderedIds = [
        ...html.matchAll(/<article aria-labelledby="([^"]+)"/g),
      ].map((match) => match[1]);
      expect(renderedIds).toEqual(
        articles.map((item) => `carnet-title-${item.id}`),
      );
      expect(html.match(/À la une/g)).toHaveLength(1);
      expect(html).toContain("sur 16 publications");
      expect(pages[0]).toContain("/carnet?page=2#collection-results");
      expect(pages[1]).toContain('aria-current="page"');
      for (const item of articles) {
        expect(html).toContain(`href="${item.href}"`);
      }
    },
  );

  it("filters all pages on the server and preserves filters in pagination links", () => {
    const articles = Array.from({ length: 22 }, (_, index) =>
      article(index, "LOCAL_GUIDE"),
    );
    const html = renderToStaticMarkup(
      <CarnetArticleIndex
        articles={articles}
        query={{ page: 2, q: "guide", kind: "guides" }}
      />,
    );
    expect(html).toContain("10–18 sur 22 publications");
    expect(html).toContain(
      "q=guide&amp;kind=guides&amp;page=3#collection-results",
    );
    expect(html).not.toContain("À la une");
    expect(html).toContain('method="get"');
    expect(html).toContain('name="q"');
  });

  it("displays a single article without duplicating it in the grid", () => {
    const html = renderToStaticMarkup(
      <CarnetArticleIndex articles={[article(0, "EDITORIAL")]} />,
    );
    expect(html.match(/<article /g)).toHaveLength(1);
    expect(html).toContain("1 publication");
  });

  it("does not invent a published guide when the collection is empty", () => {
    const html = renderToStaticMarkup(<CarnetArticleIndex articles={[]} />);
    expect(html).not.toContain("<article ");
    expect(html).toContain("0 publication");
    expect(html).toContain("Les prochains Carnets arrivent");
    expect(html).not.toContain("Afficher tous les Carnets");
  });
});
