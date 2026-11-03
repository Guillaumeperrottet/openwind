import { describe, expect, it } from "vitest";
import { articleCorrectionDraft } from "../article-correction";
const article = { slug: "planifier-sortie", title: "Planifier une sortie", content: "## Prévisions\n\nTexte.\n\n## Les **balises**\n\nTexte." };
describe("article correction preparation", () => {
  it("prepares editable context for an existing section without publishing anything", () => {
    const draft = articleCorrectionDraft(article, "les-balises");
    expect(draft?.body).toContain("Rubrique : Les balises");
    expect(draft?.body).toContain("https://www.openwind.ch/fr/carnet/planifier-sortie#les-balises");
    expect(draft?.body).toContain("Correction proposée :\n");
    expect(draft?.title).toBe("Correction : Planifier une sortie");
  });
  it("rejects invented anchors and accepts an article-wide correction", () => {
    expect(articleCorrectionDraft(article, "https://evil.test")).toBeNull();
    expect(articleCorrectionDraft(article, "unknown")).toBeNull();
    expect(articleCorrectionDraft(article, "")?.href).toBe("https://www.openwind.ch/fr/carnet/planifier-sortie");
  });
});
