import { z } from "zod";
import { coversCompass } from "./planner-sectors";
import type { SiteLocale } from "@/lib/site";

export const REVIEW_PREFIX = "planner-review:v1:";
const note = z.object({
  fr: z.string().trim().min(12).max(2000),
  de: z.string().trim().min(12).max(2000),
  it: z.string().trim().min(12).max(2000),
  en: z.string().trim().min(12).max(2000),
});
const date = z.iso.date();
export const reviewSchema = z
  .object({
    version: z.literal(1),
    status: z.enum(["DOCUMENTED", "NEEDS_REVIEW"]),
    discipline: z.enum(["WATER_KITE", "SNOW_KITE", "PARAGLIDE", "UNKNOWN"]),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    reviewedAt: date,
    expiresAt: date,
    sectors: z
      .array(
        z.object({
          from: z.number().min(0).max(359),
          to: z.number().min(0).max(360),
        }),
      )
      .max(8),
    season: z.enum(["MONTHS", "CONDITIONAL", "UNKNOWN"]),
    months: z.array(z.number().int().min(1).max(12)).max(12),
    access: z.enum(["CONDITIONAL", "CLOSED", "UNKNOWN"]),
    notes: note,
    sources: z
      .array(
        z.object({
          title: z.string().trim().min(3).max(150),
          url: z
            .url()
            .refine((url) => url.startsWith("https://"), "HTTPS required"),
          covers: z
            .array(z.enum(["discipline", "directions", "season", "access"]))
            .min(1),
        }),
      )
      .max(10),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (
      r.expiresAt < r.reviewedAt ||
      Date.parse(r.expiresAt) - Date.parse(r.reviewedAt) > 180 * 86400000
    )
      ctx.addIssue({
        code: "custom",
        message: "Review validity must be 0–180 days",
        path: ["expiresAt"],
      });
    if (r.status === "DOCUMENTED") {
      if (
        !r.sectors.length ||
        coversCompass(r.sectors) ||
        r.sectors.some((s) => s.from === s.to)
      )
        ctx.addIssue({
          code: "custom",
          message: "Specific wind sectors required",
          path: ["sectors"],
        });
      if (
        r.discipline === "UNKNOWN" ||
        r.season === "UNKNOWN" ||
        r.access === "UNKNOWN" ||
        (r.season === "MONTHS" && !r.months.length)
      )
        ctx.addIssue({
          code: "custom",
          message: "Discipline, season and access must be documented",
        });
      const coverage = new Set(r.sources.flatMap((s) => s.covers));
      if (
        !(["discipline", "directions", "season", "access"] as const).every(
          (c) => coverage.has(c),
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Sources for all four review topics required",
          path: ["sources"],
        });
    }
  });
export type PlannerReview = z.infer<typeof reviewSchema>;
export type ReviewStatus =
  | "DOCUMENTED"
  | "MISSING"
  | "NEEDS_REVIEW"
  | "EXPIRED"
  | "CHANGED"
  | "OTHER_DISCIPLINE"
  | "OUT_OF_SEASON"
  | "CLOSED";
export interface PlannerQualification {
  status: ReviewStatus;
  eligible: boolean;
  discipline: PlannerReview["discipline"];
  reviewedAt?: string;
  expiresAt?: string;
  sources: PlannerReview["sources"];
  note: string;
  sectors: PlannerReview["sectors"];
}
export function qualifyReview(
  review: PlannerReview | null,
  fingerprint: string,
  sport: string,
  start: string,
  end: string,
  today: string,
  locale: SiteLocale,
): PlannerQualification {
  let status: ReviewStatus = "MISSING";
  if (review) {
    if (review.fingerprint !== fingerprint) status = "CHANGED";
    else if (
      review.reviewedAt > today ||
      review.expiresAt < today ||
      review.expiresAt < end
    )
      status = "EXPIRED";
    else if (review.status !== "DOCUMENTED") status = "NEEDS_REVIEW";
    else if (review.access === "CLOSED") status = "CLOSED";
    else if (
      review.discipline !== (sport === "KITE" ? "WATER_KITE" : "PARAGLIDE")
    )
      status = "OTHER_DISCIPLINE";
    else {
      status = "DOCUMENTED";
      if (review.season === "MONTHS") {
        for (
          let date = Date.parse(start);
          date <= Date.parse(end);
          date += 86400000
        ) {
          if (!review.months.includes(new Date(date).getUTCMonth() + 1)) {
            status = "OUT_OF_SEASON";
            break;
          }
        }
      }
    }
  }
  return {
    status,
    eligible: status === "DOCUMENTED",
    discipline: review?.discipline ?? "UNKNOWN",
    reviewedAt: review?.reviewedAt,
    expiresAt: review?.expiresAt,
    sources: review?.sources ?? [],
    note: review?.notes[locale] ?? "",
    sectors: review?.sectors ?? [],
  };
}
