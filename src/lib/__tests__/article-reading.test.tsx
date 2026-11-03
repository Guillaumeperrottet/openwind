import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { articleReading } from "../article-reading";
import { ArticleMarkdown } from "@/components/carnet/ArticleMarkdown";
import { ArticleSummary, ArticleOutline } from "@/components/carnet/ArticleReadingGuide";

const summary = "## À retenir\n\n- Choisir **son activité**.\n- Vérifier les [sources](https://example.org).\n- Consulter les balises.\n\n";

describe("article reading navigation", () => {
  it("moves an explicit three-point summary out of the body without inventing facts", () => {
    const reading = articleReading(summary + "## Préparer la sortie\n\nLe texte reste ici.");
    expect(reading.summary).toEqual(["Choisir son activité.", "Vérifier les sources.", "Consulter les balises."]);
    expect(reading.content).toBe("## Préparer la sortie\n\nLe texte reste ici.");
    expect(reading.outline).toEqual([{ id: "preparer-la-sortie", title: "Préparer la sortie", depth: 2 }]);
    const html = renderToStaticMarkup(<ArticleSummary points={reading.summary} />);
    expect(html.match(/<li>/g)).toHaveLength(3);
    expect(html).toContain("Vérifier les sources.");
  });
  it("preserves prose and malformed summary sections in full", () => {
    for (const content of ["Une introduction libre.\n\n## Prévisions\n\nTexte.", "## En bref\n\n- Un\n- Deux\n- Trois\n- Quatre\n\n## Suite\n\nTexte."]) {
      expect(articleReading(content).summary).toEqual([]);
      expect(articleReading(content).content).toBe(content);
    }
  });
  it("gives every outline link the exact rendered heading ID, including inline formatting and duplicate slugs", () => {
    const reading = articleReading("## Le **vent** et les [balises](/fr/balises)\n\nTexte.\n\n## Prévisions\n\n### Prévisions\n\nTexte.\n\n## Prévisions-2\n\n## Prévisions\n\n```md\n## Faux titre\n```\n");
    expect(reading.outline.map((h) => h.id)).toEqual(["le-vent-et-les-balises", "previsions", "previsions-2-2", "previsions-3"]);
    const html = renderToStaticMarkup(<ArticleMarkdown>{reading.content}</ArticleMarkdown>);
    for (const { id } of reading.outline) expect(html).toContain(`id="${id}"`);
    const ids = [...html.matchAll(/<h[23] id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(new Set(ids).size);
    expect(html).toContain('tabindex="-1"');
    expect(reading.outline.some((h) => h.title === "Faux titre")).toBe(false);
  });
  it("keeps the mobile outline collapsible and links usable without JavaScript", () => {
    const headings = articleReading("## Départ\n\n## Vérification").outline;
    const html = renderToStaticMarkup(<ArticleOutline headings={headings} collapsible />);
    expect(html).toContain("<details");
    expect(html).not.toContain(" open=");
    expect(html).toContain('href="#verification"');
    expect(html).toContain('aria-label="Sommaire de l’article"');
    expect(renderToStaticMarkup(<ArticleOutline headings={headings.slice(0, 1)} />)).toBe("");
  });
});
