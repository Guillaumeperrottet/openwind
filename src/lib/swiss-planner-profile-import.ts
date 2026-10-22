import {
  spotFingerprint,
  type ReviewableSpot,
} from "./planner-spot-fingerprint";
import { reviewSchema } from "./planner-review";
import { z } from "zod";
import profiles from "@/data/swiss-planner-profiles.json";

const spotSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(2),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    sportType: z.literal("KITE"),
    difficulty: z.enum(["ADVANCED", "EXPERT"]),
    waterType: z.enum(["FLAT", "CHOP", "WAVES", "MIXED"]),
    country: z.string(),
    region: z.string().nullable(),
    minWindKmh: z.number().int(),
    maxWindKmh: z.number().int(),
    bestMonths: z.array(z.string()),
    bestWindDirections: z.array(z.string()),
    description: z.string().min(30),
    descriptionDe: z.string().min(30),
    descriptionIt: z.string().min(30),
    descriptionEn: z.string().min(30),
    access: z.string().min(30),
    accessDe: z.string().min(30),
    accessIt: z.string().min(30),
    accessEn: z.string().min(30),
    hazards: z.string().min(30),
    hazardsDe: z.string().min(30),
    hazardsIt: z.string().min(30),
    hazardsEn: z.string().min(30),
  })
  .strict();

/** Data is shipped with the implementation; importing is a separate explicit
 * operation so builds and anonymous requests never write catalogue content. */
export function checkedSwissProfiles() {
  return profiles.map((profile) => {
    const review = reviewSchema.parse(profile.review);
    const spot = spotSchema.parse(profile.spot);
    if (review.fingerprint !== spotFingerprint(spot))
      throw Error(`Catalogue/review mismatch: ${profile.spot.name}`);
    return { ...profile, spot, review };
  });
}

export function catalogueImportAction(
  current: ReviewableSpot | null,
  profile: ReturnType<typeof checkedSwissProfiles>[number],
): "create" | "update" | "current" {
  if (!current) {
    if (profile.previousFingerprint)
      throw Error(`Missing existing spot: ${profile.spot.name}`);
    return "create";
  }
  const fingerprint = spotFingerprint(current);
  if (fingerprint === profile.review.fingerprint)
    return Object.entries(profile.spot).every(
      ([key, value]) =>
        JSON.stringify(Reflect.get(current, key)) === JSON.stringify(value),
    )
      ? "current"
      : "update";
  if (
    !profile.previousFingerprint ||
    fingerprint !== profile.previousFingerprint
  )
    throw Error(
      `Spot changed since research; review again: ${profile.spot.name}`,
    );
  return "update";
}
