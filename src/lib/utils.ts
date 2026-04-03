import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WindData } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
 * Wind speed → color (blanc-gris palette for OpenKite)
 * White = calm, grey = light, blue-grey = good kite wind, orange/red = danger
 */
export function windColor(kmh: number): string {
  const kn = kmh / 1.852;
  if (kn < 3) return "#d0d0d0"; // calm
  if (kn < 7) return "#7ec8e3"; // very light — light blue
  if (kn < 10) return "#7ec8e3"; // light — cyan
  if (kn < 14) return "#a8d8a8"; // marginal kite — light green
  if (kn < 18) return "#5cb85c"; // good kite — green
  if (kn < 22) return "#2e7d32"; // ideal kite — dark green
  if (kn < 27) return "#ffa726"; // strong — orange
  if (kn < 33) return "#e65100"; // very strong — deep orange
  return "#b71c1c"; // dangerous — red
}

export function windConditionLabel(kmh: number): string {
  if (kmh < 8) return "Calme";
  if (kmh < 15) return "Faible";
  if (kmh < 22) return "";
  if (kmh < 30) return "Bon";
  if (kmh < 38) return "Fort";
  if (kmh < 50) return "Très fort";
  return "Danger";
}

export function getWindData(
  windSpeedKmh: number,
  windDirection: number,
  gustsKmh: number,
): WindData {
  return {
    windSpeedKmh,
    windDirection,
    gustsKmh,
    isKitable: windSpeedKmh >= 15 && windSpeedKmh <= 45,
    conditionLabel: windConditionLabel(windSpeedKmh),
    color: windColor(windSpeedKmh),
  };
}

/** Arrow unicode for wind direction */
export function windArrow(deg: number): string {
  const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
  // wind direction = where wind comes FROM, arrow shows where it blows TO
  return arrows[Math.round(((deg + 180) % 360) / 45) % 8];
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
