import { spotMonthNumber } from "./spot-months";
import type { ReviewableSpot } from "./planner-spot-fingerprint";
import type { PlannerReview } from "./planner-review";
export const COMPASS_DIRECTIONS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"] as const;
export type SpotInformationIssue = "description" | "access" | "hazards" | "directions" | "season" | "windRange";
export function spotInformationIssues(spot: ReviewableSpot, review?: PlannerReview | null): SpotInformationIssue[] {
  const issues: SpotInformationIssue[] = [];
  for (const key of ["description", "access", "hazards"] as const) if (!spot[key]?.trim()) issues.push(key);
  if (!spot.bestWindDirections.length || spot.bestWindDirections.some(d => !(COMPASS_DIRECTIONS as readonly string[]).includes(d)) || new Set(spot.bestWindDirections).size === 16) issues.push("directions");
  const months = spot.bestMonths;
  if (months.some(m => spotMonthNumber(m) === null) || (!months.length && review?.season !== "CONDITIONAL")) issues.push("season");
  if (!Number.isFinite(spot.minWindKmh) || !Number.isFinite(spot.maxWindKmh) || spot.minWindKmh < 0 || spot.maxWindKmh <= spot.minWindKmh) issues.push("windRange");
  return issues;
}
