import { addDays, parsePlannerCriteria, quickDates, type PlannerCriteria } from "./planner";

export const MAX_SAVED_SEARCHES = 8;
export type SearchPeriod = "fixed" | "weekend";
export interface SavedSearch {
  id: string;
  title: string;
  place: string;
  period: SearchPeriod;
  criteria: PlannerCriteria;
}

export function searchParams(criteria: PlannerCriteria, place = "") {
  const params = new URLSearchParams({ startDate: criteria.startDate, endDate: criteria.endDate, sport: criteria.sport, radius: String(criteria.radius) });
  if (criteria.lat !== undefined && criteria.lng !== undefined) {
    params.set("lat", String(criteria.lat)); params.set("lng", String(criteria.lng));
    if (place) params.set("place", place);
  }
  return params;
}

/** Validate stored data using the original start date so expired searches survive. */
export function parseSavedSearches(raw: string | null): SavedSearch[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return [];
    const valid: SavedSearch[] = [];
    for (const item of value) {
      if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(item.id) ||
        typeof item.title !== "string" || !item.title.trim() || item.title.length > 80 || typeof item.place !== "string" || item.place.length > 120 ||
        !["fixed", "weekend"].includes(item.period) || !item.criteria || typeof item.criteria.startDate !== "string") continue;
      const criteria = parsePlannerCriteria(searchParams(item.criteria), item.criteria.startDate);
      if (!criteria || valid.some((s) => s.id === item.id)) continue;
      valid.push({ id: item.id, title: item.title.trim(), place: item.place, period: item.period, criteria });
      if (valid.length === MAX_SAVED_SEARCHES) break;
    }
    return valid;
  } catch { return []; }
}

export function savedSearchIdentity(search: Pick<SavedSearch, "criteria" | "period">) {
  const criteria = search.period === "weekend" ? { ...search.criteria, startDate: "weekend", endDate: "weekend" } : search.criteria;
  return searchParams(criteria).toString();
}

export function resolveSavedSearch(search: SavedSearch, today: string, moveExpired = false): PlannerCriteria | null {
  let criteria = search.criteria;
  if (search.period === "weekend") {
    const [startDate, endDate] = quickDates(today, "weekend");
    criteria = { ...criteria, startDate, endDate };
  } else if (criteria.startDate < today) {
    if (!moveExpired) return null;
    const days = Math.round((Date.parse(criteria.endDate) - Date.parse(criteria.startDate)) / 86400000);
    criteria = { ...criteria, startDate: today, endDate: addDays(today, days) };
  }
  return parsePlannerCriteria(searchParams(criteria), today);
}

export function mergeSavedSearches(account: SavedSearch[], guest: SavedSearch[]) {
  const merged = [...account];
  const remaining: SavedSearch[] = [];
  for (const search of guest) {
    if (merged.some((s) => savedSearchIdentity(s) === savedSearchIdentity(search))) continue;
    if (merged.length < MAX_SAVED_SEARCHES) merged.push(search);
    else remaining.push(search);
  }
  return { merged, remaining };
}
