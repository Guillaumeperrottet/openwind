import { describe, expect, it, vi, beforeEach } from "vitest";
const db = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { systemConfig: { findMany: db.findMany } },
}));
import {
  reviewSchema,
  qualifyReview,
  REVIEW_PREFIX,
  type PlannerReview,
} from "@/lib/planner-review";
import { inSector } from "@/lib/planner-sectors";
import { starterReviews } from "@/lib/planner-review-seeds";
import {
  loadReviews,
  spotFingerprint,
  type ReviewableSpot,
} from "@/lib/planner-review-store";
import { evaluateSpot, selectRecommendations } from "@/lib/planner";

const seed = starterReviews.cmnr312220004ijf6l2oobbhb;
const qualify = (
  r: PlannerReview | null = seed,
  start = "2026-10-24",
  end = start,
  fp = seed.fingerprint,
) => qualifyReview(r, fp, "KITE", start, end, "2026-10-22", "de");
beforeEach(() => {
  db.findMany.mockReset();
  db.findMany.mockResolvedValue([]);
});
describe("documentary profile qualification", () => {
  it("validates every dated starter profile and preserves translated source notes", () => {
    for (const r of Object.values(starterReviews))
      expect(reviewSchema.safeParse(r).success).toBe(true);
    expect(qualify()).toMatchObject({
      eligible: true,
      status: "DOCUMENTED",
      note: seed.notes.de,
    });
    expect(qualify().sources).toEqual(seed.sources);
  });
  it("fails closed for unknown, expired, changed, future and closed reviews", () => {
    expect(qualify(null).status).toBe("MISSING");
    expect(qualify({ ...seed, expiresAt: "2026-10-21" }).status).toBe(
      "EXPIRED",
    );
    expect(qualify(seed, "2027-01-21").status).toBe("EXPIRED");
    expect(qualify({ ...seed, reviewedAt: "2026-10-23" }).eligible).toBe(false);
    expect(
      qualify(seed, "2026-10-24", "2026-10-24", "f".repeat(64)).status,
    ).toBe("CHANGED");
    expect(qualify({ ...seed, access: "CLOSED" }).status).toBe("CLOSED");
  });
  it("does not turn a snow location or a seasonal boundary into a water session", () => {
    expect(qualify({ ...seed, discipline: "SNOW_KITE" }).status).toBe(
      "OTHER_DISCIPLINE",
    );
    const r = { ...seed, season: "MONTHS" as const, months: [10] };
    expect(qualify(r, "2026-10-31", "2026-11-01").status).toBe("OUT_OF_SEASON");
    expect(qualify(r).eligible).toBe(true);
  });
  it("requires precise sectors and sources covering each documentary topic", () => {
    for (const sectors of [
      [],
      [{ from: 0, to: 360 }],
      [
        { from: 0, to: 180 },
        { from: 180, to: 360 },
      ],
      [{ from: 45, to: 45 }],
    ])
      expect(reviewSchema.safeParse({ ...seed, sectors }).success).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...seed,
        sources: [{ ...seed.sources[0], covers: ["directions"] }],
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ ...seed, expiresAt: "2027-12-01" }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...seed,
        sources: [{ ...seed.sources[0], url: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
  });
  it("honours exact source sectors without expanding them by 45 degrees", () => {
    expect(inSector(45, seed.sectors)).toBe(true);
    expect(inSector(46, seed.sectors)).toBe(false);
    expect(inSector(315, seed.sectors)).toBe(false);
    expect(inSector(359, [{ from: 315, to: 45 }])).toBe(true);
    expect(inSector(NaN, seed.sectors)).toBe(false);
  });
  it("invalidates meaningful catalogue edits and ignores ordering of set-like fields", () => {
    const spot: ReviewableSpot = {
      id: "s",
      name: "Test",
      latitude: 46,
      longitude: 6,
      sportType: "KITE",
      description: null,
      difficulty: "INTERMEDIATE",
      waterType: "CHOP",
      minWindKmh: 20,
      maxWindKmh: 40,
      bestMonths: ["10", "9"],
      bestWindDirections: ["NE", "N"],
      access: null,
      hazards: null,
    };
    expect(
      spotFingerprint({
        ...spot,
        bestMonths: ["9", "10"],
        bestWindDirections: ["N", "NE"],
      }),
    ).toBe(spotFingerprint(spot));
    for (const change of [
      { description: "New" },
      { latitude: 45 },
      { access: "Closed" },
      { maxWindKmh: 60 },
      { difficulty: "BEGINNER" },
    ])
      expect(spotFingerprint({ ...spot, ...change })).not.toBe(
        spotFingerprint(spot),
      );
  });
  it("never restores an old seed approval over a malformed administrative review", async () => {
    const id = "cmnr312220004ijf6l2oobbhb";
    expect((await loadReviews([id])).get(id)).toEqual(seed);
    db.findMany.mockResolvedValue([
      { key: REVIEW_PREFIX + id, value: "invalid" },
    ]);
    expect((await loadReviews([id])).has(id)).toBe(false);
    db.findMany.mockResolvedValue([
      {
        key: REVIEW_PREFIX + id,
        value: JSON.stringify({ ...seed, status: "NEEDS_REVIEW" }),
      },
    ]);
    expect((await loadReviews([id])).get(id)?.status).toBe("NEEDS_REVIEW");
  });
  it("cannot shortlist a high-scoring but undocumented catalogue spot", () => {
    const result = {
      id: "unreviewed",
      name: "Unknown",
      sportType: "KITE" as const,
      latitude: 46,
      longitude: 6,
      region: null,
      country: null,
      minWindKmh: 20,
      maxWindKmh: 40,
      bestWindDirections: ["N"],
      distanceKm: null,
      access: null,
      hazards: null,
      windows: [
        {
          start: 1,
          end: 2,
          hours: 10,
          windMin: 30,
          windMax: 30,
          gustMax: 35,
          directions: [0],
          score: 100,
        },
      ],
      reasons: {},
      unavailable: false,
    };
    expect(selectRecommendations([result])).toEqual([]);
    expect(
      evaluateSpot(
        result,
        {
          timezone: "Europe/Zurich",
          retrievedAt: "2026-10-22",
          hours: [],
          daylight: [],
        },
        {
          startDate: "2026-10-24",
          endDate: "2026-10-24",
          sport: "KITE",
          radius: 150,
        },
        0,
      ).windows,
    ).toEqual([]);
  });
});
