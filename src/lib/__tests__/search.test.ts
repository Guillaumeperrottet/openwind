import { describe, expect, it } from "vitest";
import { GUIDE_LOCALES } from "../local-guides";
import {
  guideSearchEntries,
  normalizeSearch,
  searchEntries,
  type SearchEntry,
} from "../search";

const data: SearchEntry[] = [
  ...guideSearchEntries("de"),
  {
    id: "spot",
    kind: "spot",
    title: "Saint-Blaise",
    subtitle: "Neuchâtel",
    terms: "kite",
    href: "/de/spots/spot",
  },
  {
    id: "NEU",
    kind: "station",
    title: "Neuchâtel",
    subtitle: "MeteoSwiss",
    terms: "NEU",
    href: "/de/stations/NEU",
  },
  {
    id: "article",
    kind: "article",
    title: "Comprendre la bise",
    subtitle: "Neuchâtel et Léman",
    terms: "bise",
    href: "/fr/carnet/bise",
  },
];
describe("global search across public content", () => {
  it("normalizes accents, punctuation and German sharp s", () => {
    expect(normalizeSearch("  Neuchâtel — Straße ")).toBe("neuchatel strasse");
  });
  it.each(["Léman", "Genfersee", "Lake Geneva", "Lago di Ginevra"])(
    "finds the German lake guide from %s",
    (query) => {
      expect(
        searchEntries(data, query).some(
          (x) => x.href === "/de/vent-en-direct/lac-leman",
        ),
      ).toBe(true);
    },
  );
  it("keeps relevant results from all five content types", () => {
    expect(
      new Set(searchEntries(data, "Neuchatel").map((entry) => entry.kind)),
    ).toEqual(new Set(["lake", "spot", "station", "webcam", "article"]));
  });
  it.each([
    ["Silvaplanersee", "lac-de-silvaplana"],
    ["Lej da Silvaplauna", "lac-de-silvaplana"],
    ["Lac d’Uri", "urnersee"],
    ["Fluelen", "urnersee"],
    ["Lago Maggiore", "lac-majeur"],
    ["Langensee", "lac-majeur"],
    ["Verbano", "lac-majeur"],
    ["Bielersee", "lac-de-bienne"],
    ["Lago di Bienne", "lac-de-bienne"],
    ["Saint-Joux", "lac-de-bienne"],
  ])(
    "finds the new guide from its local name %s in all three languages",
    (query, slug) => {
      for (const locale of GUIDE_LOCALES) {
        expect(
          searchEntries(guideSearchEntries(locale), query).some(
            (entry) => entry.href === `/${locale}/vent-en-direct/${slug}`,
          ),
        ).toBe(true);
      }
    },
  );
  it("understands a webcam query without claiming individual camera availability", () => {
    const results = searchEntries(data, "webcam leman");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (result) =>
          result.kind === "webcam" &&
          result.href.startsWith("/de/webcams?lat="),
      ),
    ).toBe(true);
  });
  it("does not flood a mixed search with station matches", () => {
    const entries = [
      ...data,
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `station-${i}`,
        kind: "station" as const,
        title: "Neuchâtel",
        subtitle: "",
        terms: "",
        href: `/de/stations/${i}`,
      })),
    ];
    const result = searchEntries(entries, "Neuchatel");
    expect(result.filter((x) => x.kind === "station")).toHaveLength(3);
    expect(result.some((x) => x.kind === "lake")).toBe(true);
    expect(searchEntries(entries, "Neuchatel", "station")).toHaveLength(10);
  });
  it("suggests only lake guides and the requested public favourite identities when empty", () => {
    const result = searchEntries(data, "", undefined, ["station:NEU"]);
    expect(result[0].id).toBe("NEU");
    expect(result.every((x) => x.kind === "lake" || x.id === "NEU")).toBe(true);
  });
  it("does not send internal ranking terms to the browser or return unrelated fuzzy matches", () => {
    expect(searchEntries(data, "nonexistent-place")).toEqual([]);
    expect(searchEntries(data, "Léman")[0]).not.toHaveProperty("terms");
  });
  it("uses explicit French links for content without English translations", () => {
    expect(
      guideSearchEntries("en")
        .filter((entry) => entry.kind === "lake")
        .every((entry) => entry.href.startsWith("/fr/")),
    ).toBe(true);
  });
});
