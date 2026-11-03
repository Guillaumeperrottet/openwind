import { describe, expect, it } from "vitest";
import { articleVerification } from "../article-verification";
const marker = "**Dernière vérification des sources officielles : 28 septembre 2026.** Ce guide conserve les sources datées.";
describe("documented source verification", () => {
  it("reads a deliberately documented verification date, independent of editorial updates", () => {
    expect(articleVerification(marker, "2026-11-02")).toBe("2026-09-28");
    expect(articleVerification("Texte mis à jour le 2 novembre 2026.\n\nhttps://example.org", "2026-11-02")).toBeNull();
  });
  it.each(["31 février 2026", "3 novembre 2026", "28 inconnue 2026"])("does not claim an invalid or future check: %s", (date) => {
    expect(articleVerification(`Dernière vérification des sources officielles : ${date}.`, "2026-11-02")).toBeNull();
  });
  it("ignores quoted and fenced examples and refuses conflicting dates", () => {
    expect(articleVerification(`\`\`\`md\n${marker}\n\`\`\``, "2026-11-02")).toBeNull();
    expect(articleVerification(`> ${marker}`, "2026-11-02")).toBeNull();
    expect(articleVerification(`${marker}\n\n${marker.replace("28 septembre", "29 septembre")}`, "2026-11-02")).toBeNull();
  });
});
