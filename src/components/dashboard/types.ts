import type { AccountPreferences } from "@/lib/user-preferences";
import type { SportType } from "@/types";
import type { WindStation } from "@/lib/stations";

export interface DashboardForecastDay {
  date: string;
  score: number;
  suitableHours: number;
  averageWindKmh: number;
  peakWindKmh: number;
  bestHour: {
    time: string;
    windSpeedKmh: number;
    gustsKmh: number;
    windDirection: number;
  } | null;
}

export interface DashboardFavoriteSpot {
  id: string;
  name: string;
  region: string | null;
  country: string | null;
  sportType: SportType;
  imageUrl: string | null;
  minWindKmh: number;
  maxWindKmh: number;
  bestWindDirections: string[];
  forecastDays: DashboardForecastDay[];
}

export interface DashboardFavoriteStation {
  id: string;
  name: string;
  source: WindStation["source"];
  latitude: number;
  longitude: number;
  altitudeM: number;
  windSpeedKmh: number | null;
  gustsKmh: number | null;
  windDirection: number | null;
  updatedAt: string | null;
  isAvailable: boolean;
}

export interface DashboardArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  location: string | null;
  coverImage: string | null;
  readTime: number;
  path: string;
  linkedSpotIds: string[];
  linkedStationIds: string[];
}

export interface DashboardCommunityItem {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  avatarUrl: string | null;
  spotId: string | null;
  spotName: string | null;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

export interface MonOpenwindData {
  userName: string | null;
  preferences: AccountPreferences;
  favoriteSpots: DashboardFavoriteSpot[];
  favoriteStations: DashboardFavoriteStation[];
  articles: DashboardArticle[];
  community: DashboardCommunityItem[];
}
