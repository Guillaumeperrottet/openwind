import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WindData } from "@/types";
import { windPaletteBand, windPaletteColor } from "@/lib/windPalette";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Wind bar color pair — same palette as the 48h history chart.
 * Returns [solid, light] — solid for text/stroke, light for background fills.
 */
export function barColors(kmh: number): [string, string] {
  const band = windPaletteBand(kmh);
  return [band.accent, band.tint];
}

/** Haversine distance between two lat/lng points, returns km */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Wind direction degrees → compass label */
export function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Wind speed → canonical Openwind fill color.
 * Used for chart bars, map markers, and other graphical elements.
 */
export function windColor(kmh: number): string {
  return windPaletteColor(kmh);
}

export function windConditionLabel(kmh: number): string {
  if (kmh < 8) return "Calme";
  if (kmh < 15) return "Faible";
  if (kmh < 22) return "Léger";
  if (kmh < 30) return "Bon";
  if (kmh < 38) return "Fort";
  if (kmh < 50) return "Très fort";
  return "Danger";
}

/** Returns the i18n message key for a wind speed — use with t(windConditionKey(kmh)) */
export function windConditionKey(kmh: number): string {
  if (kmh < 8) return "WindConditions.calm";
  if (kmh < 15) return "WindConditions.light";
  if (kmh < 22) return "WindConditions.gentle";
  if (kmh < 30) return "WindConditions.good";
  if (kmh < 38) return "WindConditions.strong";
  if (kmh < 50) return "WindConditions.veryStrong";
  return "WindConditions.danger";
}

export function getWindData(
  windSpeedKmh: number,
  windDirection: number,
  gustsKmh: number,
  updatedAt?: string,
  source?: "station" | "openmeteo",
): WindData {
  return {
    windSpeedKmh,
    windDirection,
    gustsKmh,
    updatedAt,
    source,
    isKitable: windSpeedKmh >= 22 && windSpeedKmh <= 45,
    conditionLabel: windConditionLabel(windSpeedKmh),
    color: windColor(windSpeedKmh),
  };
}

/** Arrow unicode for wind direction — points where the wind BLOWS TO */
export function windArrow(deg: number): string {
  const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
  return arrows[Math.round(deg / 45) % 8];
}

export const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/** Returns the i18n message key for a month number (1-based) — use with t('Months.X') */
export function monthKey(monthNumber: number): string {
  return `Months.${monthNumber}`;
}

/**
 * Format an ISO timestamp as a short relative time in French.
 * Examples: "à l'instant" · "il y a 4 min" · "il y a 2 h" · "il y a 3 j"
 * @deprecated In React components, use relativeTimeI18n(iso, t) instead.
 */
export function relativeTime(iso: string | undefined | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diffSec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (diffSec < 60) return "à l'instant";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const day = Math.round(hr / 24);
  return `il y a ${day} j`;
}

/** Locale-aware relative time — pass the next-intl translator for the root messages */
export function relativeTimeI18n(
  iso: string | undefined | null,
  t: (key: string, values?: Record<string, unknown>) => string,
): string {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (isNaN(ts)) return "";
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diffSec < 60) return t("RelativeTime.justNow");
  const min = Math.round(diffSec / 60);
  if (min < 60) return t("RelativeTime.minutesAgo", { min });
  const hr = Math.round(min / 60);
  if (hr < 24) return t("RelativeTime.hoursAgo", { hr });
  const day = Math.round(hr / 24);
  return t("RelativeTime.daysAgo", { day });
}
