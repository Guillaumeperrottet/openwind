import { describe, expect, it } from "vitest";
import { newSpotSchema } from "../spot-contribution";
import { submittedSpotReview } from "../spot-contribution-review";
import { qualifyReview } from "../planner-review";
import { spotFingerprint } from "../planner-spot-fingerprint";
import { COMPASS_DIRECTIONS } from "../spot-completeness";
const input = {
  name: "Spot complet", latitude: 46, longitude: 7, country: "Suisse", sportType: "KITE", discipline: "WATER_KITE", difficulty: "ADVANCED", waterType: "CHOP",
  description: "Un lieu de pratique précisément décrit avec ses caractéristiques et ses particularités locales.",
  minWindKmh: 15, maxWindKmh: 35, bestMonths: ["5", "6"], bestWindDirections: ["NNW", "N", "NNE"],
  hazards: "Des baigneurs et des obstacles sont présents près de la zone de départ.", access: "Accès sous conditions locales, par une zone de départ identifiée et séparée de la baignade.",
  seasonMode: "MONTHS", sources: { discipline: "https://club.example/spot", directions: "https://club.example/spot", season: "https://club.example/spot", access: "https://club.example/spot" },
};
describe("complete spot contributions", () => {
  it.each(["description", "hazards", "access", "country", "discipline", "sources", "seasonMode"])("requires %s even when an account is signed in", field => expect(newSpotSchema.safeParse({ ...input, [field]: undefined }).success).toBe(false));
  it.each(["", " ", "not a URL", "http://club.example/spot", "https://user:password@club.example/spot"])("rejects an invalid or credential-bearing source %j without throwing", url => {
    expect(newSpotSchema.safeParse({ ...input, sources: { ...input.sources, access: url } }).success).toBe(false);
  });
  it("requires a selective orientation, a valid month list and a consistent activity", () => {
    for (const change of [{ bestWindDirections: [] }, { bestWindDirections: COMPASS_DIRECTIONS }, { bestWindDirections: ["N", "N"] }, { bestMonths: [] }, { bestMonths: ["13"] }, { bestMonths: ["5", "5"] }, { discipline: "PARAGLIDE" }, { maxWindKmh: 15 }]) expect(newSpotSchema.safeParse({ ...input, ...change }).success).toBe(false);
  });
  it("accepts conditional seasons without inventing twelve open months", () => {
    expect(newSpotSchema.safeParse({ ...input, bestMonths: [], seasonMode: "CONDITIONAL" }).success).toBe(false);
    expect(newSpotSchema.safeParse({ ...input, bestMonths: [], seasonMode: "CONDITIONAL", seasonDetails: "Saison dépendant de la neige et des consignes locales affichées." }).success).toBe(true);
  });
  it("retains submitted information without turning it into an automatic recommendation", () => {
    const parsed = newSpotSchema.parse({ ...input, status: "DOCUMENTED" }), spot = { ...parsed, id: "new-spot" };
    const review = submittedSpotReview(spot, parsed, "2026-11-04");
    expect(review.status).toBe("NEEDS_REVIEW"); expect(review.sources).toHaveLength(1);
    expect(review.sources[0].covers).toHaveLength(4); expect(review.sectors).toEqual([{ from: 326.25, to: 33.75 }]);
    expect(qualifyReview(review, spotFingerprint(spot), "KITE", "2026-11-04", "2026-11-04", "2026-11-04", "fr").eligible).toBe(false);
  });
  it("preserves discontinuous wind sectors and distinguishes snowkiting", () => {
    const parsed = newSpotSchema.parse({ ...input, discipline: "SNOW_KITE", bestWindDirections: ["N", "S"] });
    const review = submittedSpotReview({ ...parsed, id: "snow" }, parsed, "2026-11-04");
    expect(review.discipline).toBe("SNOW_KITE"); expect(review.sectors).toEqual([{ from: 168.75, to: 191.25 }, { from: 348.75, to: 11.25 }]);
  });
});
