export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type WaterType = "FLAT" | "CHOP" | "WAVES" | "MIXED";
export type SportType = "KITE" | "PARAGLIDE";

export interface Spot {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
  difficulty: Difficulty;
  waterType: WaterType;
  minWindKmh: number;
  maxWindKmh: number;
  bestMonths: string[];
  bestWindDirections: string[];
  hazards: string | null;
  access: string | null;
  sportType: SportType;
  nearestStationId: string | null;
  createdAt: string;
  updatedAt: string;
  images: SpotImage[];
  reports?: WindReport[];
}

export interface SpotImage {
  id: string;
  spotId: string;
  url: string;
  caption: string | null;
  createdAt: string;
}

export interface WindReport {
  id: string;
  spotId: string;
  date: string;
  windSpeedKmh: number;
  windDirection: number;
  gustsKmh: number | null;
  isKitable: boolean;
  comment: string | null;
  rating: number;
}

export interface WindData {
  windSpeedKmh: number;
  windDirection: number;
  gustsKmh: number;
  isKitable: boolean;
  conditionLabel: string;
  color: string;
  /** Time of last update from Open-Meteo, e.g. "2026-04-01T14:45" */
  updatedAt?: string;
}

export interface ForecastHour {
  time: string;
  windSpeedKmh: number;
  windDirection: number;
  gustsKmh: number;
}

export interface SpotWithForecast extends Spot {
  distanceKm: number;
  forecast: ForecastHour[];
  currentWind?: WindData;
  /** Per-day analysis when using multi-day planner */
  days?: DayAnalysis[];
  /** Best single-day score (max of days[].score) */
  bestScore?: number;
  /** Best day index in the days[] array */
  bestDayIndex?: number;
}

/** Analysis of one day's forecast for a given spot */
export interface DayAnalysis {
  date: string; // "YYYY-MM-DD"
  /** 0–100 composite score */
  score: number;
  kitableHours: number;
  peakWindKmh: number;
  avgWindKmh: number;
  /** Average gusts / average wind — 1.0 = perfectly steady */
  gustFactor: number;
  bestHour: ForecastHour | null;
  forecast: ForecastHour[];
}

export interface HistoryPoint {
  /** UTC ISO datetime, e.g. "2026-04-02T14:15" */
  time: string;
  windSpeedKmh: number;
  windDirection: number;
  gustsKmh: number;
  temperatureC: number;
}

export interface TripPlanQuery {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  radiusKm: number;
  sport?: SportType;
}
