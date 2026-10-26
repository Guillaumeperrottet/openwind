import { z } from "zod";
import rawPatches from "@/data/neuchatel-seo-import.json";
import {
  spotFingerprint,
  type ReviewableSpot,
} from "./planner-spot-fingerprint";

const descriptions = {
  description: z.string().min(20),
  descriptionDe: z.string().min(20),
  descriptionIt: z.string().min(20),
};
const patchSchema = z
  .object({
    id: z.string().min(1),
    expectedName: z.string().min(1),
    expectedFingerprint: z.string().length(64),
    expected: z
      .object({
        ...descriptions,
        difficulty: z.literal("INTERMEDIATE"),
        bestWindDirections: z.array(z.string()),
      })
      .strict(),
    changes: z
      .object({
        ...descriptions,
        difficulty: z.literal("EXPERT"),
        bestWindDirections: z.array(z.enum(["NE", "SW"])).length(2),
      })
      .strict(),
  })
  .strict();
export const neuchatelSeoPatches = rawPatches.map((patch) =>
  patchSchema.parse(patch),
);
export type EditorialPatch = (typeof neuchatelSeoPatches)[number];

/** Bridge the untouched legacy translation until its explicit DB import.
 * New admin edits always win. Qualification checks the resulting fingerprint,
 * so no existing approval can silently survive an operational change. */
export function editorialDisplayCopy<T extends ReviewableSpot>(spot: T): T {
  const patch = neuchatelSeoPatches.find((entry) => entry.id === spot.id);
  if (
    !patch ||
    spot.name !== patch.expectedName ||
    spotFingerprint(spot) !== patch.expectedFingerprint
  )
    return spot;
  if (
    !Object.keys(patch.expected).every(
      (key) =>
        JSON.stringify(Reflect.get(spot, key)) ===
        JSON.stringify(Reflect.get(patch.expected, key)),
    )
  )
    return spot;
  return { ...spot, ...patch.changes };
}

/** Sourced, idempotent import; an intervening admin edit must be reconciled. */
export function editorialImportAction(
  current: ReviewableSpot | null,
  patch: EditorialPatch,
  hasStoredReview: boolean,
): "current" | "update" {
  if (
    !current ||
    current.id !== patch.id ||
    current.name !== patch.expectedName
  )
    throw Error(`Spot missing or renamed: ${patch.expectedName}`);
  const fields = Object.keys(patch.changes);
  if (
    fields.every(
      (key) =>
        JSON.stringify(Reflect.get(current, key)) ===
        JSON.stringify(Reflect.get(patch.changes, key)),
    )
  )
    return "current";
  if (
    spotFingerprint(current) !== patch.expectedFingerprint ||
    !fields.every(
      (key) =>
        JSON.stringify(Reflect.get(current, key)) ===
        JSON.stringify(Reflect.get(patch.expected, key)),
    )
  )
    throw Error(`Spot edited since research: ${patch.expectedName}`);
  if (hasStoredReview && current.description !== patch.changes.description)
    throw Error(
      `Reconcile planner review before editing: ${patch.expectedName}`,
    );
  return "update";
}
