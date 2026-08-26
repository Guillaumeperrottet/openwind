import { describe, expect, it } from "vitest";
import {
  articlePublicPath,
  parseArticleSources,
  slugifyArticleTitle,
} from "@/lib/articles";

describe("article helpers", () => {
  it("builds the public route for editorial articles and local guides", () => {
    expect(
      articlePublicPath({ kind: "EDITORIAL", slug: "comprendre-la-bise" }),
    ).toBe("/carnet/comprendre-la-bise");
    expect(
      articlePublicPath({ kind: "LOCAL_GUIDE", slug: "lac-de-la-gruyere" }),
    ).toBe("/vent-en-direct/lac-de-la-gruyere");
  });

  it("keeps only valid source objects", () => {
    expect(
      parseArticleSources([
        { label: "MétéoSuisse", url: "https://www.meteosuisse.admin.ch" },
        null,
        { label: "Incomplète" },
      ]),
    ).toEqual([
      { label: "MétéoSuisse", url: "https://www.meteosuisse.admin.ch" },
    ]);
  });

  it("creates stable URL slugs from French titles", () => {
    expect(slugifyArticleTitle("Bise, foehn et lac de la Gruyère !")).toBe(
      "bise-foehn-et-lac-de-la-gruyere",
    );
  });
});
