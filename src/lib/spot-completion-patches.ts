import patches from "@/data/spot-completion-patches.json";
import { z } from "zod";
import { spotFingerprint, type ReviewableSpot } from "./planner-spot-fingerprint";
import { reviewSchema, type PlannerReview } from "./planner-review";
import { COMPASS_DIRECTIONS } from "./spot-completeness";
const fieldsSchema = z.object({
  description: z.string().min(40).max(12000), descriptionEn: z.string().min(40).max(12000), descriptionDe: z.string().min(40).max(12000), descriptionIt: z.string().min(40).max(12000),
  hazards: z.string().min(20).max(8000), hazardsEn: z.string().min(20).max(8000), hazardsDe: z.string().min(20).max(8000), hazardsIt: z.string().min(20).max(8000),
  access: z.string().min(30).max(8000), accessEn: z.string().min(30).max(8000), accessDe: z.string().min(30).max(8000), accessIt: z.string().min(30).max(8000),
  bestMonths: z.array(z.string().regex(/^(?:[1-9]|1[0-2])$/)).max(12),
  bestWindDirections: z.array(z.enum(COMPASS_DIRECTIONS)).min(1).max(15),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
}).partial().strict();
const sourceSchema = z.object({ title: z.string().min(3), url: z.url().refine(url => url.startsWith("https://")) }).strict();
const patchSchema = z.object({
  id: z.string(), name: z.string(), previousFingerprint: z.string().regex(/^[a-f0-9]{64}$/), checkedAt: z.iso.date(),
  source: sourceSchema, additionalSources: z.array(sourceSchema).max(10).optional(),
  fields: fieldsSchema,
  previousValues: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()])).optional(),
  reason: z.string().min(15).optional(),
  review: reviewSchema.optional(), previousReview: reviewSchema.nullable().optional(),
}).strict().superRefine((patch, ctx) => {
  const keys = Object.keys(patch.fields);
  if (!keys.length) ctx.addIssue({ code: "custom", path: ["fields"], message: "Empty completion" });
  for (const group of ["hazards", "access", "description"] as const) {
    if (keys.some(k => k.startsWith(group)) && ![group, `${group}En`, `${group}De`, `${group}It`].every(k => keys.includes(k))) ctx.addIssue({ code: "custom", path: ["fields", group], message: "All four languages are required" });
  }
  if (patch.review && !("previousReview" in patch)) ctx.addIssue({ code: "custom", path: ["previousReview"], message: "A replacement review requires its original snapshot" });
  if (patch.previousValues && (Object.keys(patch.previousValues).some(k => !keys.includes(k)) || keys.some(k => !(k in patch.previousValues!)))) ctx.addIssue({ code: "custom", path: ["previousValues"], message: "Expected values must cover exactly the changed fields" });
});
export const spotCompletionPatches = () => patches.map(patch => patchSchema.parse(patch));
export type SpotCompletionPatch = ReturnType<typeof spotCompletionPatches>[number];
type Spot = ReviewableSpot & { descriptionEn?: string | null; descriptionDe?: string | null; descriptionIt?: string | null; hazardsEn?: string | null; hazardsDe?: string | null; hazardsIt?: string | null; accessEn?: string | null; accessDe?: string | null; accessIt?: string | null };
export function completionAction(spot: Spot, patch: SpotCompletionPatch) {
  if (spot.id !== patch.id) throw Error("Spot identity mismatch");
  const expected = patch.previousValues ?? Object.fromEntries(Object.keys(patch.fields).map(k => [k, null]));
  if (patch.review && patch.review.fingerprint !== spotFingerprint({ ...spot, ...patch.fields })) throw Error(`Review/completion mismatch: ${patch.name}`);
  const same = Object.entries(patch.fields).every(([key, value]) => JSON.stringify(Reflect.get(spot, key)) === JSON.stringify(value));
  if (same && spotFingerprint({ ...spot, ...expected } as Spot) === patch.previousFingerprint) return "current";
  if (spotFingerprint(spot) !== patch.previousFingerprint) throw Error(`Catalogue changed: ${patch.name}`);
  if (!patch.reason && Object.entries(expected).some(([, value]) => Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim().length > 0)) throw Error(`A sourced correction needs an explanation: ${patch.name}`);
  if (Object.keys(patch.fields).some(key => JSON.stringify(Reflect.get(spot, key) ?? null) !== JSON.stringify(expected[key]))) throw Error(`Existing information must be preserved: ${patch.name}`);
  return "fill";
}

/** Filling a sourced hazard does not renew an approval. Substantive corrections
 * need a fresh review, including when the difficulty was previously understated. */
export function reviewAfterCompletion(
  updated: Spot,
  patch: SpotCompletionPatch,
  existing?: PlannerReview,
): PlannerReview | undefined {
  const fingerprint = spotFingerprint(updated);
  if (patch.review) {
    if (patch.review.fingerprint !== fingerprint) throw Error(`Review/completion mismatch: ${patch.name}`);
    return patch.review;
  }
  if (!existing) return undefined;
  const needsReview = ["description", "access", "bestMonths", "bestWindDirections", "difficulty"]
    .some(key => key in patch.fields);
  return { ...existing, ...(needsReview ? { status: "NEEDS_REVIEW" as const } : {}), fingerprint };
}
