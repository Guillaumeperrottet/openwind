import type { PlannerResult } from "./planner";
export function comparisonReason(
  spot: PlannerResult,
  results: PlannerResult[],
): "longest" | "closest" | "best" | "alternative" | undefined {
  const pool = results.filter(
    (s) => s.qualification?.eligible && s.windows.length,
  );
  if (
    !spot.qualification?.eligible ||
    !spot.windows.length ||
    !pool.some((s) => s.id === spot.id)
  )
    return;
  const w = spot.windows[0];
  if (
    pool.length > 1 &&
    pool.every((s) => s.id === spot.id || w.hours > s.windows[0].hours)
  )
    return "longest";
  if (
    pool.length > 1 &&
    spot.distanceKm !== null &&
    pool.every(
      (s) =>
        s.id === spot.id ||
        (s.distanceKm !== null && spot.distanceKm! < s.distanceKm),
    )
  )
    return "closest";
  if (pool.every((s) => w.score >= s.windows[0].score)) return "best";
  return "alternative";
}
export function roundedWindRange(min: number, max: number, divisor: number) {
  const lo = Math.round(min / divisor),
    hi = Math.round(max / divisor);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}
