import type { AccountPreferences } from "@/lib/user-preferences";
import type { SportType } from "@/types";
import type { WindStation } from "@/lib/stations";

export interface DashboardFavoriteSpot {
  id: string;
  dashboardSelected: boolean;
  dashboardOrder: number;
  windAlertEnabled: boolean;
  windAlertMinKmh: number | null;
  windAlertMaxKmh: number | null;
  name: string;
  region: string | null;
  country: string | null;
  sportType: SportType;
  imageUrl: string | null;
  minWindKmh: number;
  maxWindKmh: number;
  bestWindDirections: string[];
}

export interface DashboardFavoriteStation {
  id: string;
  dashboardSelected: boolean;
  dashboardOrder: number;
  windAlertEnabled: boolean;
  windAlertMinKmh: number | null;
  windAlertMaxKmh: number | null;
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
  userId: string;
  userName: string | null;
  preferences: AccountPreferences;
  favoriteSpots: DashboardFavoriteSpot[];
  favoriteStations: DashboardFavoriteStation[];
  articles: DashboardArticle[];
  community: DashboardCommunityItem[];
}
