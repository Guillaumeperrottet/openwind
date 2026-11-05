import { z } from "zod";
import { COMPASS_DIRECTIONS } from "./spot-completeness";
const source = z.string().trim().max(2048).url().refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}, "Une source publique HTTPS est nécessaire.");
export const contributionDetails = {
  discipline: z.enum(["WATER_KITE", "SNOW_KITE", "PARAGLIDE"]).optional(),
  seasonMode: z.enum(["MONTHS", "CONDITIONAL"]).optional(),
  seasonDetails: z.string().trim().max(1200).optional(),
  sources: z.object({ discipline: source, directions: source, season: source, access: source }).optional(),
};
/** Shared client/server contract; signing in alone does not make a contribution complete. */
export const newSpotSchema = z.object({
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().min(40).max(12000),
  descriptionEn: z.string().max(12000).optional(), descriptionDe: z.string().max(12000).optional(), descriptionIt: z.string().max(12000).optional(),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  country: z.string().trim().min(2).max(150), region: z.string().max(150).optional(),
  sportType: z.enum(["KITE", "PARAGLIDE"]), difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  waterType: z.enum(["FLAT", "CHOP", "WAVES", "MIXED"]),
  minWindKmh: z.number().int().min(0).max(100), maxWindKmh: z.number().int().min(0).max(150),
  bestMonths: z.array(z.string().regex(/^(?:[1-9]|1[0-2])$/)).max(12),
  bestWindDirections: z.array(z.enum(COMPASS_DIRECTIONS)).min(1).max(15),
  hazards: z.string().trim().min(20).max(8000), access: z.string().trim().min(30).max(8000),
  hazardsEn: z.string().max(8000).optional(), hazardsDe: z.string().max(8000).optional(), hazardsIt: z.string().max(8000).optional(),
  accessEn: z.string().max(8000).optional(), accessDe: z.string().max(8000).optional(), accessIt: z.string().max(8000).optional(),
  nearestStationId: z.string().max(200).optional(),
  ...contributionDetails,
}).superRefine((spot, ctx) => {
  if (spot.maxWindKmh <= spot.minWindKmh) ctx.addIssue({ code: "custom", path: ["maxWindKmh"], message: "Le vent maximum doit dépasser le vent minimum." });
  if (!spot.discipline || (spot.sportType === "PARAGLIDE") !== (spot.discipline === "PARAGLIDE")) ctx.addIssue({ code: "custom", path: ["discipline"], message: "Précisez la discipline pratiquée sur ce spot." });
  if (!spot.sources) ctx.addIssue({ code: "custom", path: ["sources"], message: "Renseignez les sources des quatre sujets." });
  if (!spot.seasonMode || (spot.seasonMode === "MONTHS" && !spot.bestMonths.length)) ctx.addIssue({ code: "custom", path: ["bestMonths"], message: "Renseignez la saison de pratique." });
  if (spot.seasonMode === "CONDITIONAL" && (spot.seasonDetails?.length ?? 0) < 20) ctx.addIssue({ code: "custom", path: ["seasonDetails"], message: "Expliquez les conditions saisonnières de pratique." });
  for (const key of ["bestMonths", "bestWindDirections"] as const) if (new Set(spot[key]).size !== spot[key].length) ctx.addIssue({ code: "custom", path: [key], message: "Supprimez les valeurs en double." });
});
export type NewSpotInput = z.infer<typeof newSpotSchema>;
