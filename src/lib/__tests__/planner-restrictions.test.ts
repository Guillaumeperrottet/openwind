import { describe, expect, it } from "vitest";
import { closureApplies, accessInterval } from "@/lib/planner-restrictions";
import {
  reviewSchema,
  qualifyReview,
  type PlannerReview,
} from "@/lib/planner-review";
import {
  checkedSwissProfiles,
  catalogueImportAction,
} from "@/lib/swiss-planner-profile-import";
import {
  evaluateSpot,
  selectRecommendations,
  type PlannerSpot,
} from "@/lib/planner";
import { URNERSEE_GUIDE } from "@/lib/guides/urnersee";
import { LAC_DE_CONSTANCE_GUIDE } from "@/lib/guides/lac-de-constance";
import { spotFingerprint } from "@/lib/planner-spot-fingerprint";

const profiles = checkedSwissProfiles();
const isle = profiles.find((p) => p.spot.id === "swiss-kite-isleten")!;
const berlingen = profiles.find(
  (p) => p.spot.id === "swiss-kite-berlingen-eschlibach",
)!;
const qualify = (
  r: PlannerReview,
  start: string,
  end = start,
  locale: "fr" | "de" | "it" = "fr",
) => qualifyReview(r, r.fingerprint, "KITE", start, end, r.reviewedAt, locale);
const summerReview = (r: PlannerReview): PlannerReview => ({
  ...r,
  reviewedAt: "2026-06-01",
  expiresAt: "2026-11-27",
});
const criteria = (day: string, end = day) => ({
  startDate: day,
  endDate: end,
  sport: "KITE" as const,
  radius: 500,
});
function forecast(days: string[], direction = 0) {
  return {
    timezone: "Europe/Zurich",
    retrievedAt: "2026-10-22T09:00:00Z",
    daylight: days.map((date) => ({
      date,
      sunrise: Date.parse(`${date}T04:00Z`),
      sunset: Date.parse(`${date}T21:00Z`),
    })),
    hours: days.flatMap((date) =>
      [10, 11, 12].map((hour) => ({
        time: Date.parse(`${date}T${hour}:00Z`),
        wind: 27,
        gust: 30,
        direction,
        rain: 0,
      })),
    ),
  };
}
function spotFor(
  p = isle,
  start = "2026-10-24",
  end = start,
  review = p.review,
): PlannerSpot {
  return {
    ...p.spot,
    distanceKm: 0,
    qualification: qualify(review, start, end),
  };
}

describe("sourced access calendar", () => {
  it("uses inclusive closure boundaries and wraps annual periods across New Year", () => {
    const winter = berlingen.review.closures![0];
    for (const date of ["2026-11-16", "2026-12-31", "2027-01-01", "2027-03-14"])
      expect(closureApplies(winter, date), date).toBe(true);
    for (const date of ["2026-11-15", "2027-03-15", "2027-07-01"])
      expect(closureApplies(winter, date), date).toBe(false);
    const summer = isle.review.closures![0];
    expect(closureApplies(summer, "2026-06-14")).toBe(false);
    expect(closureApplies(summer, "2026-06-15")).toBe(true);
    expect(closureApplies(summer, "2026-08-31")).toBe(true);
    expect(closureApplies(summer, "2026-09-01")).toBe(false);
  });
  it("does not repeat an exceptional closure in another year", () => {
    const dated = {
      ...isle.review.closures![0],
      kind: "DATED" as const,
      start: "2026-10-24",
      end: "2026-10-25",
    };
    expect(closureApplies(dated, "2026-10-24")).toBe(true);
    expect(closureApplies(dated, "2026-10-25")).toBe(true);
    expect(closureApplies(dated, "2027-10-24")).toBe(false);
  });
  it("rejects impossible dates, reversed absolute closures and unsupported source claims", () => {
    const r = isle.review;
    const c = r.closures![0];
    for (const start of ["02-30", "04-31", "13-01", "2-03"])
      expect(
        reviewSchema.safeParse({ ...r, closures: [{ ...c, start }] }).success,
      ).toBe(false);
    expect(
      reviewSchema.safeParse({ ...r, closures: [{ ...c, start: "02-29" }] })
        .success,
    ).toBe(true);
    expect(
      reviewSchema.safeParse({
        ...r,
        closures: [
          { ...c, kind: "DATED", start: "2026-10-25", end: "2026-10-24" },
        ],
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...r,
        closures: [{ ...c, sourceUrl: "https://unlisted.example/" }],
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...r,
        closures: [{ ...c, reason: { ...c.reason, it: "" } }],
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...r,
        dailyHours: { ...r.dailyHours!, from: 800, to: 800 },
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({
        ...r,
        dailyHours: {
          ...r.dailyHours!,
          sourceUrl: "https://unlisted.example/",
        },
      }).success,
    ).toBe(false);
  });
  it("marks a fully closed stay as closed without hiding its weather", () => {
    const day = "2026-06-15",
      r = summerReview(isle.review);
    const q = qualify(r, day);
    expect(q.status).toBe("CLOSED");
    const result = evaluateSpot(
      spotFor(isle, day, day, r),
      forecast([day]),
      criteria(day),
      0,
    );
    expect(result.weather?.windMax).toBe(27);
    expect(result.windows).toEqual([]);
    expect(selectRecommendations([result])).toEqual([]);
  });
  it("keeps only open local days on mixed stays and never bridges a closure", () => {
    const r = summerReview(isle.review),
      start = "2026-06-14",
      end = "2026-06-16";
    expect(qualify(r, start, end).eligible).toBe(true);
    const result = evaluateSpot(
      spotFor(isle, start, end, r),
      forecast([start, "2026-06-15", end]),
      criteria(start, end),
      0,
    );
    expect(result.windows).toHaveLength(1);
    expect(new Date(result.windows[0].start).toISOString().slice(0, 10)).toBe(
      start,
    );
    expect(result.reasons.restriction).toBe(6);
    const dated = {
      ...r.closures![0],
      kind: "DATED" as const,
      start: "2026-10-25",
      end: "2026-10-25",
    };
    const review = { ...isle.review, closures: [dated] };
    const split = evaluateSpot(
      spotFor(isle, "2026-10-24", "2026-10-26", review),
      forecast(["2026-10-24", "2026-10-25", "2026-10-26"]),
      criteria("2026-10-24", "2026-10-26"),
      0,
    );
    expect(split.windows).toHaveLength(2);
    expect(split.windows.every((w) => w.hours === 3)).toBe(true);
  });
  it("clips access hours in local time before and after DST, including partial samples", () => {
    const hours = { from: 480, to: 1260 };
    for (const [time, expected] of [
      ["2026-10-24T05:00Z", false],
      ["2026-10-24T06:00Z", true],
      ["2026-10-26T06:00Z", false],
      ["2026-10-26T07:00Z", true],
      ["2026-10-24T19:00Z", false],
    ]) {
      const i = accessInterval(
        Date.parse(String(time)),
        "Europe/Zurich",
        hours,
      );
      expect(i.end > i.start, String(time)).toBe(expected);
    }
    const i = accessInterval(Date.parse("2026-10-24T06:00Z"), "Europe/Zurich", {
      from: 510,
      to: 1260,
    });
    expect(i.start).toBe(Date.parse("2026-10-24T06:30Z"));
    const p = spotFor();
    const f = forecast(["2026-10-24"]);
    f.hours = Array.from({ length: 24 }, (_, hour) => ({
      time: Date.parse("2026-10-24T00:00Z") + hour * 3600000,
      wind: 27,
      gust: 30,
      direction: 0,
      rain: 0,
    }));
    const result = evaluateSpot(p, f, criteria("2026-10-24"), 0);
    expect(result.windows[0].start).toBe(Date.parse("2026-10-24T06:00Z"));
    expect(result.windows[0].end).toBe(Date.parse("2026-10-24T19:00Z"));
  });
  it("uses the spot's local date across UTC midnight", () => {
    const day = "2026-06-15",
      r = summerReview(isle.review);
    const result = evaluateSpot(
      spotFor(isle, "2026-06-14", day, r),
      {
        timezone: "Europe/Zurich",
        retrievedAt: "2026-06-01",
        daylight: [
          {
            date: day,
            sunrise: Date.parse("2026-06-14T21:00Z"),
            sunset: Date.parse("2026-06-15T22:00Z"),
          },
        ],
        hours: [22, 23].map((h) => ({
          time: Date.parse(`2026-06-14T${h}:00Z`),
          wind: 27,
          gust: 30,
          direction: 0,
          rain: 0,
        })),
      },
      criteria("2026-06-14", day),
      0,
    );
    expect(result.windows).toEqual([]);
    expect(result.reasons.restriction).toBe(2);
  });
});

describe("eight Swiss launch profiles", () => {
  it("connects both new launches to the multilingual lake guides and their search terms", () => {
    for (const [guide, profile] of [
      [URNERSEE_GUIDE, isle],
      [LAC_DE_CONSTANCE_GUIDE, berlingen],
    ] as const) {
      expect(guide.spotIds).toContain(profile.spot.id);
      for (const locale of ["fr", "de", "it"] as const)
        expect(guide.translations[locale]!.content).toContain(
          `/${locale}/spots/${profile.spot.id}`,
        );
    }
    expect(LAC_DE_CONSTANCE_GUIDE.aliases).toContain("Berlingen");
  });
  it("validates all translations and admits each profile when its date, sector and weather match", () => {
    expect(profiles).toHaveLength(8);
    for (const p of profiles) {
      for (const locale of ["fr", "de", "it"] as const) {
        const q = qualify(p.review, "2026-10-24", "2026-10-24", locale);
        expect(q.eligible, p.spot.name).toBe(true);
        expect(q.note).toBe(p.review.notes[locale]);
        const sector = p.review.sectors[0];
        const direction =
          sector.from > sector.to ? 0 : (sector.from + sector.to) / 2;
        const result = evaluateSpot(
          { ...spotFor(p), qualification: q },
          forecast(["2026-10-24"], direction),
          criteria("2026-10-24"),
          0,
        );
        expect(selectRecommendations([result]), p.spot.name).toHaveLength(1);
      }
    }
  });
  it("does not recommend Saint-Blaise in Joran, Silvaplana in north wind or Isleten in south foehn", () => {
    for (const [p, direction] of [
      [profiles[0], 270],
      [profiles[5], 0],
      [isle, 180],
    ] as const) {
      const result = evaluateSpot(
        spotFor(p),
        forecast(["2026-10-24"], direction),
        criteria("2026-10-24"),
        0,
      );
      expect(result.windows).toHaveLength(0);
      expect(result.reasons.orientation).toBe(3);
    }
  });
  it("prevents imports from overwriting later catalogue edits and can be rerun", () => {
    const previous = {
      ...isle.spot,
      description: "Previous catalogue description",
    };
    expect(
      catalogueImportAction(previous, {
        ...isle,
        previousFingerprint: spotFingerprint(previous),
      }),
    ).toBe("update");
    expect(catalogueImportAction(null, isle)).toBe("create");
    expect(catalogueImportAction(isle.spot, isle)).toBe("current");
    expect(() =>
      catalogueImportAction(
        { ...isle.spot, hazards: "New local closure" },
        isle,
      ),
    ).toThrow("changed");
    expect(() => catalogueImportAction(null, profiles[0])).toThrow("Missing");
  });
});
