import { addDays, quickDates, type PlannerCriteria } from "./planner";

export type RecoveryAction = { kind: "nextDay" | "weekend" | "wider"; criteria: PlannerCriteria };

/** Change one search constraint, preserving the sport, origin and safety filters. */
export function plannerRecoveryActions(criteria: PlannerCriteria, today: string): RecoveryAction[] {
  const actions: RecoveryAction[] = [];
  if (addDays(criteria.endDate, 1) <= addDays(today, 90)) {
    actions.push({ kind: "nextDay", criteria: { ...criteria, startDate: addDays(criteria.startDate, 1), endDate: addDays(criteria.endDate, 1) } });
  }
  const [startDate, endDate] = quickDates(today, "weekend");
  if (startDate !== criteria.startDate || endDate !== criteria.endDate)
    actions.push({ kind: "weekend", criteria: { ...criteria, startDate, endDate } });
  const wider = [50, 100, 150, 250, 500, 1000].find((value) => value > criteria.radius);
  if (criteria.lat !== undefined && criteria.lng !== undefined && wider)
    actions.push({ kind: "wider", criteria: { ...criteria, radius: wider } });
  return actions;
}
