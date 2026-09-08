import { describe, expect, it } from "vitest";
import {
  buildArticleSchema,
  buildPlaceSchema,
  buildSpotDescription,
  buildSpotTitle,
} from "@/lib/seo";

const spot = {
  id: "morlon",
  name: "Morlon beach",
  sportType: "KITE" as const,
  region: "Fribourg",
  country: "Suisse",
  difficulty: "EXPERT" as const,
  description: "Mise à l’eau au bord du lac de la Gruyère.",
  descriptionEn: "Launch on the shores of Lake Gruyère.",
  descriptionDe: "Einstieg am Ufer des Greyerzersees.",
  descriptionIt: "Accesso sulle rive del lago della Gruyère.",
  latitude: 46.63,
  longitude: 7.08,
  access: "Accès par le sentier.",
  images: [],
  reports: [],
  createdAt: new Date("2026-08-01T12:00:00Z"),
  updatedAt: new Date("2026-09-08T12:00:00Z"),
};

describe("spot metadata", () => {
  it.each([
    ["fr", "Kitesurf à Morlon beach (Fribourg) : vent en direct"],
    ["en", "Kitesurfing at Morlon beach (Fribourg): live wind"],
    ["de", "Kitesurfen in Morlon beach (Fribourg): Live-Wind"],
    ["it", "Kitesurf a Morlon beach (Fribourg): vento in diretta"],
  ])("builds a localized, unbranded %s title from actual spot fields", (locale, title) => {
    expect(buildSpotTitle(spot, locale)).toBe(title);
  });

  it.each([
    ["fr", "Parapente"], ["en", "Paragliding"],
    ["de", "Gleitschirmfliegen"], ["it", "Parapendio"],
  ])("uses the correct sport for paragliding in %s", (locale, sportLabel) => {
    const paraglide = { ...spot, sportType: "PARAGLIDE" as const };
    expect(buildSpotTitle(paraglide, locale)).toContain(sportLabel);
    expect(buildSpotDescription(paraglide, locale).toLowerCase()).toContain(sportLabel.toLowerCase());
  });

  it.each([
    ["fr", spot.description], ["en", spot.descriptionEn],
    ["de", spot.descriptionDe], ["it", spot.descriptionIt],
  ])("reuses the editable %s description in metadata and structured data", (locale, detail) => {
    const description = buildSpotDescription(spot, locale);
    expect(description).toContain("Morlon beach (Fribourg, Suisse)");
    expect(description).toContain(detail);
    expect(buildArticleSchema(spot, locale).description).toBe(detail);
    expect(buildPlaceSchema(spot, locale).description).toBe(detail);
  });

  it("uses the country when the region is absent and does not invent a location", () => {
    expect(buildSpotTitle({ ...spot, region: null })).toContain("(Suisse)");
    const noLocation = { ...spot, region: null, country: null };
    expect(buildSpotTitle(noLocation)).toBe("Kitesurf à Morlon beach : vent en direct");
    expect(buildSpotDescription(noLocation)).not.toContain("()");
    expect(buildSpotTitle(spot)).not.toContain("Gruyère");
  });

  it("normalizes whitespace and repeated location fields", () => {
    const messy = { ...spot, name: "  Morlon\n beach ", region: " Suisse ", country: "suisse" };
    expect(buildSpotDescription(messy)).toContain("Morlon beach (Suisse)");
    expect(buildSpotDescription(messy)).not.toContain("Suisse, suisse");
    expect(buildSpotTitle({ ...messy, name: "Suisse" })).not.toContain("(Suisse)");
  });

  it("falls back to the original description for missing or blank translations", () => {
    for (const descriptionEn of [undefined, null, "", " \n "]) {
      expect(buildSpotDescription({ ...spot, descriptionEn }, "en")).toContain(spot.description);
    }
    expect(buildSpotTitle(spot, "unknown")).toBe(buildSpotTitle(spot, "fr"));
  });

  it("keeps incomplete spots distinct without the old duplicated difficulty wording", () => {
    const incomplete = { ...spot, description: null };
    const description = buildSpotDescription(incomplete);
    expect(description).toContain(spot.name);
    expect(description).toContain("prévisions");
    expect(description).not.toMatch(/spot spot|undefined|null/);
    expect(buildSpotDescription({ ...incomplete, name: "Autre plage" })).not.toBe(description);
  });

  it("updates metadata when an editor changes the spot fields", () => {
    const edited = { ...spot, name: "Morlon", description: "Nouvel accès décrit par un membre." };
    expect(buildSpotTitle(edited)).toContain("à Morlon (");
    expect(buildSpotDescription(edited)).toContain(edited.description);
    expect(buildSpotDescription(edited)).not.toBe(buildSpotDescription(spot));
  });

  it("shortens long descriptions at a word boundary", () => {
    const long = buildSpotDescription({ ...spot, description: "Informations locales détaillées. ".repeat(20) });
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long).toMatch(/…$/);
    expect(long).toMatch(/(?:Informations|locales|détaillées\.)…$/);
    expect(long).not.toContain("\n");
  });
});
