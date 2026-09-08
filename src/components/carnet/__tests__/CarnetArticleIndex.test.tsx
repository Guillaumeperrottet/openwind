import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  CarnetArticleIndex,
  type CarnetIndexArticle,
} from "@/components/carnet/CarnetArticleIndex";

vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));

function article(index: number, kind: CarnetIndexArticle["kind"]): CarnetIndexArticle {
  return {
    id: `publication-${index}`,
    kind,
    href: kind === "LOCAL_GUIDE" ? `/vent-en-direct/lac-${index}` : `/carnet/vent-${index}`,
    title: `Publication ${index}`,
    excerpt: "Un guide pour comprendre le vent et préparer sa prochaine sortie.",
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
    "renders every publication exactly once in order for a large %s collection",
    (collection) => {
      const articles = Array.from({ length: 16 }, (_, index) =>
        article(index, collection === "MIXED" ? (index % 3 ? "EDITORIAL" : "LOCAL_GUIDE") : collection),
      );
      const html = renderToStaticMarkup(<CarnetArticleIndex articles={articles} />);

      // Guides beyond the first one used to be counted but omitted from the page.
      const renderedIds = [...html.matchAll(/<article aria-labelledby="([^"]+)"/g)]
        .map((match) => match[1]);
      expect(renderedIds).toEqual(articles.map((item) => `carnet-title-${item.id}`));
      expect(html.match(/À la une/g)).toHaveLength(1);
      expect(html).toContain("16 publications");
      for (const item of articles) {
        expect(html).toContain(`href="${item.href}"`);
      }
    },
  );

  it("displays a single article without duplicating it in the grid", () => {
    const html = renderToStaticMarkup(<CarnetArticleIndex articles={[article(0, "EDITORIAL")]} />);
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
