import { describe, expect, it } from "vitest";
import { plannerRecoveryActions } from "@/lib/planner-recovery";
import { addDays, parsePlannerCriteria, type PlannerCriteria } from "@/lib/planner";

const today = "2026-11-02";
const criteria: PlannerCriteria = { startDate: today, endDate: "2026-11-04", sport: "PARAGLIDE", radius: 150, lat: 46.52, lng: 6.63 };

describe("helpful follow-up searches without changing qualification rules", () => {
  it("preserves origin and sport while shifting the complete date range", () => {
    const action = plannerRecoveryActions(criteria, today).find((a) => a.kind === "nextDay")!;
    expect(action.criteria).toEqual({ ...criteria, startDate: "2026-11-03", endDate: "2026-11-05" });
  });
  it("expands only the radius when the user chose a location", () => {
    expect(plannerRecoveryActions(criteria, today).find((a) => a.kind === "wider")?.criteria).toEqual({ ...criteria, radius: 250 });
    expect(plannerRecoveryActions({ ...criteria, lat: undefined, lng: undefined }, today).some((a) => a.kind === "wider")).toBe(false);
  });
  it("respects maximum radius and horizon", () => {
    const edge = { ...criteria, radius: 1000, startDate: addDays(today, 90), endDate: addDays(today, 90) };
    expect(plannerRecoveryActions(edge, today).map((a) => a.kind)).toEqual(["weekend"]);
  });
  it("does not suggest the same weekend twice", () => {
    const weekend = { ...criteria, startDate: "2026-11-07", endDate: "2026-11-08" };
    expect(plannerRecoveryActions(weekend, today).some((a) => a.kind === "weekend")).toBe(false);
  });
  it("produces criteria accepted by the same server validator", () => {
    for (const { criteria: next } of plannerRecoveryActions(criteria, today)) {
      const params = new URLSearchParams(Object.entries(next).map(([key, value]) => [key, String(value)]));
      expect(parsePlannerCriteria(params, today)).toEqual(next);
    }
  });
});
