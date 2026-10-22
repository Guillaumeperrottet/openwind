import { createHash } from "node:crypto";

export interface ReviewableSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sportType: string;
  description: string | null;
  difficulty: string;
  waterType: string;
  minWindKmh: number;
  maxWindKmh: number;
  bestMonths: string[];
  bestWindDirections: string[];
  access: string | null;
  hazards: string | null;
}
/** Relevant catalogue edits invalidate the documentary review. Translations do
 * not affect qualification, and no access rule is inferred from prose. */
export function spotFingerprint(s: ReviewableSpot): string {
  const fields = [
    s.id,
    s.name,
    s.latitude,
    s.longitude,
    s.sportType,
    s.description,
    s.difficulty,
    s.waterType,
    s.minWindKmh,
    s.maxWindKmh,
    [...s.bestMonths].sort(),
    [...s.bestWindDirections].sort(),
    s.access || null,
    s.hazards || null,
  ];
  return createHash("sha256").update(JSON.stringify(fields)).digest("hex");
}
