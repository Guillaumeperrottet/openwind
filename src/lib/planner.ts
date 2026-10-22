import { haversineKm } from "@/lib/utils";
import type { SportType } from "@/types";
import type { PlannerQualification } from "@/lib/planner-review";
import { inSector } from "@/lib/planner-sectors";

export interface PlannerCriteria {
  startDate: string;
  endDate: string;
  sport: SportType;
  radius: number;
  lat?: number;
  lng?: number;
}
export interface PlannerSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string | null;
  country: string | null;
  sportType: SportType;
  minWindKmh: number;
  maxWindKmh: number;
  bestWindDirections: string[];
  access: string | null;
  hazards: string | null;
  distanceKm: number | null;
  qualification?: PlannerQualification;
}
export interface PlannerHour {
  time: number; // UTC milliseconds; never parse a naive local time.
  wind: number | null;
  gust: number | null;
  direction: number | null;
  rain: number | null;
}
export interface PlannerForecast {
  timezone: string;
  retrievedAt: string;
  daylight: { date: string; sunrise: number; sunset: number }[];
  hours: PlannerHour[];
}
export interface PlannerWindow {
  start: number;
  end: number;
  hours: number;
  windMin: number;
  windMax: number;
  gustMax: number;
  directions: number[];
  score: number; // Ranking index, not a probability or a safety rating.
}
export type PlannerReason =
  | "missing"
  | "orientation"
  | "wind"
  | "gusts"
  | "rain"
  | "daylight";
export interface PlannerResult extends PlannerSpot {
  timezone?: string;
  retrievedAt?: string;
  windows: PlannerWindow[];
  reasons: Partial<Record<PlannerReason, number>>;
  unavailable: boolean;
  seasonal?: {
    wind: number;
    gust: number;
    days: number;
    years: [number, number];
  };
}
export interface PlannerResponse {
  mode: "forecast" | "seasonal";
  spots: PlannerResult[];
  meta: {
    candidates: number;
    available: number;
    recommended: number;
    failed: number;
    qualified?: number;
    needsReview?: number;
  };
}
export function localDate(now: Date, timezone = "Europe/Zurich"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function quickDates(
  today: string,
  preset: "today" | "tomorrow" | "weekend" | "week",
): [string, string] {
  if (preset === "today") return [today, today];
  if (preset === "tomorrow") return [addDays(today, 1), addDays(today, 1)];
  if (preset === "week") return [today, addDays(today, 6)];
  const day = new Date(`${today}T12:00:00Z`).getUTCDay();
  const start = addDays(today, day === 0 || day === 6 ? 0 : 6 - day);
  return [start, day === 0 ? start : addDays(start, 1)];
}
function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function parsePlannerCriteria(
  params: URLSearchParams,
  today: string,
): PlannerCriteria | null {
  const startDate = params.get("startDate") || today,
    endDate = params.get("endDate") || startDate;
  const radius = Number(params.get("radius") ?? 150),
    sport = params.get("sport") || "KITE";
  if (
    !validDate(startDate) ||
    !validDate(endDate) ||
    startDate < today ||
    endDate < startDate ||
    endDate > addDays(today, 90) ||
    endDate > addDays(startDate, 13) ||
    !Number.isFinite(radius) ||
    radius < 10 ||
    radius > 1000 ||
    !["KITE", "PARAGLIDE"].includes(sport)
  )
    return null;
  const latValue = params.get("lat"),
    lngValue = params.get("lng");
  if ((latValue === null) !== (lngValue === null)) return null;
  if (latValue !== null && lngValue !== null) {
    const lat = Number(latValue),
      lng = Number(lngValue);
    if (
      !latValue.trim() ||
      !lngValue.trim() ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    )
      return null;
    return { startDate, endDate, radius, sport: sport as SportType, lat, lng };
  }
  return { startDate, endDate, radius, sport: sport as SportType };
}
export function candidatesInRadius<
  T extends { latitude: number; longitude: number },
>(
  spots: T[],
  criteria: PlannerCriteria,
): (T & { distanceKm: number | null })[] {
  return spots
    .filter(
      (s) =>
        Number.isFinite(s.latitude) &&
        Number.isFinite(s.longitude) &&
        Math.abs(s.latitude) <= 90 &&
        Math.abs(s.longitude) <= 180,
    )
    .map((spot) => ({
      ...spot,
      distanceKm:
        criteria.lat === undefined || criteria.lng === undefined
          ? null
          : haversineKm(
              criteria.lat,
              criteria.lng,
              spot.latitude,
              spot.longitude,
            ),
    }))
    .filter(
      (spot) => spot.distanceKm === null || spot.distanceKm <= criteria.radius,
    );
}
/** Comparison heuristic, not a local launch safety assessment. All hourly filters
 * must pass; gaps and local days split windows. Unknown data never means calm. */
export function evaluateSpot(
  spot: PlannerSpot,
  forecast: PlannerForecast | null,
  criteria: PlannerCriteria,
  now: number,
): PlannerResult {
  const result: PlannerResult = {
    ...spot,
    windows: [],
    reasons: {},
    unavailable: !forecast,
  };
  if (!forecast) return result;
  result.timezone = forecast.timezone;
  result.retrievedAt = forecast.retrievedAt;
  if (!spot.qualification?.eligible) return result;
  const min = spot.sportType === "KITE" ? Math.max(22, spot.minWindKmh) : 0;
  const max = Math.min(spot.sportType === "KITE" ? 45 : 15, spot.maxWindKmh);
  const accepted: {
    start: number;
    end: number;
    day: string;
    hour: PlannerHour;
  }[] = [];
  for (const hour of [...forecast.hours].sort((a, b) => a.time - b.time)) {
    const day = localDate(new Date(hour.time), forecast.timezone);
    if (
      day < criteria.startDate ||
      day > criteria.endDate ||
      hour.time + 3600000 <= now
    )
      continue;
    const daylight = forecast.daylight.find((d) => d.date === day);
    let reason: PlannerReason | undefined;
    if (!daylight) reason = "missing";
    else if (
      hour.time >= daylight.sunset ||
      hour.time + 3600000 <= daylight.sunrise
    )
      reason = "daylight";
    else if (
      hour.wind === null ||
      hour.gust === null ||
      hour.direction === null ||
      !spot.qualification.sectors.length ||
      (spot.sportType === "PARAGLIDE" && hour.rain === null)
    )
      reason = "missing";
    else if (!inSector(hour.direction!, spot.qualification.sectors))
      reason = "orientation";
    else if (hour.wind < min || hour.wind > max) reason = "wind";
    else if (
      hour.gust < hour.wind ||
      hour.gust >
        (spot.sportType === "KITE" ? Math.min(max, hour.wind * 1.5) : 20)
    )
      reason = "gusts";
    else if (spot.sportType === "PARAGLIDE" && hour.rain! > 0.1)
      reason = "rain";
    if (reason) {
      result.reasons[reason] = (result.reasons[reason] || 0) + 1;
      continue;
    }
    accepted.push({
      start: Math.max(hour.time, daylight!.sunrise, now),
      end: Math.min(hour.time + 3600000, daylight!.sunset),
      day,
      hour,
    });
  }
  const groups: (typeof accepted)[] = [];
  for (const slot of accepted) {
    const previous = groups.at(-1)?.at(-1);
    if (previous && previous.day === slot.day && previous.end === slot.start)
      groups.at(-1)!.push(slot);
    else if (!previous || slot.start >= previous.end) groups.push([slot]);
  }
  for (const group of groups) {
    const start = group[0].start,
      end = group.at(-1)!.end,
      hours = (end - start) / 3600000;
    if (hours < 1) continue;
    const winds = group.map((s) => s.hour.wind!),
      mean = winds.reduce((a, b) => a + b, 0) / winds.length;
    const gustMax = Math.max(...group.map((s) => s.hour.gust!));
    const target = spot.sportType === "KITE" ? (min + max) / 2 : 5;
    const fit = Math.max(
      0,
      1 - Math.abs(mean - target) / Math.max(max - min, 1),
    );
    const regularity = Math.max(0, 1 - (gustMax - mean) / Math.max(mean, 5));
    const score = Math.round(
      50 * Math.min(hours / 4, 1) + 30 * fit + 20 * regularity,
    );
    result.windows.push({
      start,
      end,
      hours,
      windMin: Math.min(...winds),
      windMax: Math.max(...winds),
      gustMax,
      directions: [...new Set(group.map((h) => h.hour.direction!))],
      score,
    });
  }
  result.windows.sort(
    (a, b) => b.score - a.score || b.hours - a.hours || a.start - b.start,
  );
  return result;
}
export function rankResults(results: PlannerResult[]): PlannerResult[] {
  return [...results].sort(
    (a, b) =>
      (b.windows[0]?.score ?? -1) - (a.windows[0]?.score ?? -1) ||
      (b.windows[0]?.hours ?? 0) - (a.windows[0]?.hours ?? 0) ||
      Number(a.unavailable) - Number(b.unavailable) ||
      (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) ||
      a.id.localeCompare(b.id),
  );
}

/** Avoid three neighbouring launches filling the shortlist. Full ranking stays
 * available; this diversity rule only affects the three discovery suggestions. */
export function selectRecommendations(
  results: PlannerResult[],
): PlannerResult[] {
  const selected: PlannerResult[] = [];
  for (const spot of results) {
    if (!spot.windows.length || !spot.qualification?.eligible) continue;
    if (
      selected.every(
        (other) =>
          haversineKm(
            spot.latitude,
            spot.longitude,
            other.latitude,
            other.longitude,
          ) >= 15,
      )
    )
      selected.push(spot);
    if (selected.length === 3) break;
  }
  return selected;
}
