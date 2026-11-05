import { describe, expect, it } from "vitest";
import { normalizeSpotMonths, spotMonthNumber } from "../spot-months";
import { spotInformationIssues } from "../spot-completeness";
import { spotCompletionPatches, completionAction, reviewAfterCompletion } from "../spot-completion-patches";
import { spotFingerprint } from "../planner-spot-fingerprint";
import { qualifyReview } from "../planner-review";
import { inSector } from "../planner-sectors";
const spot = { id: "x", name: "Spot", latitude: 46, longitude: 7, sportType: "KITE", description: "Lieu documenté", difficulty: "ADVANCED", waterType: "CHOP", minWindKmh: 15, maxWindKmh: 35, bestMonths: ["May", "Juin"], bestWindDirections: ["N"], access: "Accès identifié", hazards: "Risques identifiés" };
describe("honest catalogue inventory", () => {
  it("recognizes legacy month names without marking existing seasons as missing", () => {
    expect(normalizeSpotMonths(["July", "7", "Août", "September", "9", "Décembre"])).toEqual(["7", "8", "9", "12"]);
    expect(spotMonthNumber("März")).toBe(3); expect(spotMonthNumber("13")).toBeNull();
    expect(spotInformationIssues(spot)).toEqual([]);
  });
  it.each([
    ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
  ])("recognizes the complete imported calendar starting with %s", (...months) => {
    expect(normalizeSpotMonths([...months].reverse())).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)));
  });
  it("does not turn unknown tokens into a season", () => {
    expect(normalizeSpotMonths(["", "all year", "0", "13", "  AOÛT  ", "August", "8"])).toEqual(["8"]);
  });
  it("flags missing details, non-selective directions and genuinely unknown seasons", () => {
    expect(spotInformationIssues({ ...spot, description: null, access: null, hazards: "", bestMonths: [], bestWindDirections: [] })).toEqual(["description", "access", "hazards", "directions", "season"]);
  });
  it("requires a reviewed conditional season rather than inventing a monthly calendar", () => {
    expect(spotInformationIssues({ ...spot, bestMonths: [] })).toContain("season");
  });
});
describe("sourced gap filling", () => {
  it("validates every prepared translation and preserves existing information", () => {
    for (const patch of spotCompletionPatches()) {
      expect(patch.source.url).toMatch(/^https:/);
      expect(Object.entries(patch.fields).every(([key, value]) => !/^(description|hazards|access)/.test(key) || (typeof value === "string" && value.length >= 20))).toBe(true);
    }
    const empty = { ...spot, hazards: null }, patch = { ...spotCompletionPatches()[0], id: "x", previousFingerprint: spotFingerprint(empty) };
    expect(completionAction(empty, patch)).toBe("fill");
    expect(() => completionAction({ ...empty, hazardsEn: "Recent editor translation" }, patch)).toThrow("preserved");
    expect(() => completionAction({ ...empty, access: "New instructions" }, patch)).toThrow("changed");
    expect(completionAction({ ...empty, ...patch.fields }, patch)).toBe("current");
  });
  it("allows an explained correction only against its exact original values", () => {
    const patch = {
      ...spotCompletionPatches()[0], id: spot.id, previousFingerprint: spotFingerprint(spot),
      fields: { bestMonths: ["1", "2", "10", "11", "12"] },
      previousValues: { bestMonths: spot.bestMonths }, reason: "Correction de la saison selon le règlement publié.",
    };
    expect(completionAction(spot, patch)).toBe("fill");
    expect(completionAction({ ...spot, ...patch.fields }, patch)).toBe("current");
    expect(() => completionAction({ ...spot, bestMonths: ["6"] }, patch)).toThrow("changed");
    expect(() => completionAction(spot, { ...patch, reason: undefined })).toThrow("explanation");
    expect(() => completionAction(spot, { ...patch, previousValues: { bestMonths: ["4"] } })).toThrow("preserved");
  });
  it("requires a replacement review to describe the completed record", () => {
    const reviewed = spotCompletionPatches().find(p => p.review?.status === "DOCUMENTED")!;
    const patch = { ...reviewed, id: spot.id, previousFingerprint: spotFingerprint(spot), fields: { bestMonths: ["1"] }, previousValues: { bestMonths: spot.bestMonths } };
    expect(() => completionAction(spot, patch)).toThrow("mismatch");
    expect(() => completionAction({ ...spot, ...patch.fields }, patch)).toThrow("mismatch");
    expect(completionAction(spot, { ...patch, review: { ...patch.review!, fingerprint: spotFingerprint({ ...spot, ...patch.fields }) } })).toBe("fill");
  });
  it("excludes Makkum in summer and does not confuse north with an excluded east wind", () => {
    const review = spotCompletionPatches().find(p => p.name === "Makkum")!.review!;
    expect(qualifyReview(review, review.fingerprint, "KITE", "2027-01-10", "2027-01-10", "2026-11-04", "fr").eligible).toBe(true);
    // A current review, rather than an expired one, must reject a summer request.
    const summerReview = { ...review, reviewedAt: "2027-05-01", expiresAt: "2027-07-01" };
    expect(qualifyReview(summerReview, review.fingerprint, "KITE", "2027-06-10", "2027-06-10", "2027-05-01", "fr").status).toBe("OUT_OF_SEASON");
    expect(inSector(0, review.sectors)).toBe(true);
    expect(inSector(90, review.sectors)).toBe(false);
  });
  it("does not approve a tide-dependent spot from a wind forecast alone", () => {
    const review = spotCompletionPatches().find(p => p.name === "Camber Sands")!.review!;
    expect(qualifyReview(review, review.fingerprint, "KITE", "2026-11-05", "2026-11-05", "2026-11-04", "fr").eligible).toBe(false);
  });
  it("requires a fresh approval when an existing difficulty was understated", () => {
    const patch = {
      ...spotCompletionPatches().find(p => p.name === "Moléson")!, id: spot.id,
      fields: { difficulty: "ADVANCED" as const }, previousValues: { difficulty: "BEGINNER" },
    };
    const before = { ...spot, difficulty: "BEGINNER" };
    const existing = spotCompletionPatches().find(p => p.name === "Makkum")!.review!;
    const updated = { ...before, ...patch.fields };
    const review = reviewAfterCompletion(updated, patch, existing)!;
    expect(review.status).toBe("NEEDS_REVIEW");
    expect(review.reviewedAt).toBe(existing.reviewedAt);
    expect(review.expiresAt).toBe(existing.expiresAt);
    expect(review.fingerprint).toBe(spotFingerprint(updated));
    expect(reviewAfterCompletion(updated, patch)).toBeUndefined();
  });
  it("preserves a hazard-only approval without extending its validity", () => {
    const patch = { ...spotCompletionPatches()[0], id: spot.id };
    const existing = spotCompletionPatches().find(p => p.name === "Makkum")!.review!;
    const updated = { ...spot, ...patch.fields };
    expect(reviewAfterCompletion(updated, patch, existing)).toEqual({ ...existing, fingerprint: spotFingerprint(updated) });
  });
  it("honours an explicit hold when a previously approved location needs checking", () => {
    const patch = spotCompletionPatches().find(p => p.name === "Portalban")!;
    const updated = { ...spot, id: patch.id, ...patch.fields };
    const held = { ...patch, review: { ...patch.review!, fingerprint: spotFingerprint(updated) } };
    expect(reviewAfterCompletion(updated, held, patch.previousReview!)).toEqual(held.review);
    expect(held.review.status).toBe("NEEDS_REVIEW");
    expect(() => reviewAfterCompletion({ ...updated, latitude: 47 }, held)).toThrow("mismatch");
  });
});
