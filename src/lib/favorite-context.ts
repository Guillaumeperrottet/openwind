"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AccountPreferences, PreferencePatch } from "./user-preferences";

export type AccountPreferencePatch = PreferencePatch;

interface FavContextValue {
  user: User | null;
  authLoading: boolean;
  /** Backward-compatible alias for favoriteSpotIds. */
  favoriteIds: Set<string>;
  favoriteSpotIds: Set<string>;
  favoriteStationIds: Set<string>;
  preferences: AccountPreferences | null;
  preferencesLoading: boolean;
  favoritesReady: boolean;
  retryFavorites: () => void;
  /** Toggle a local or account favorite. Null indicates a failed save. */
  toggleFavorite: (spotId: string) => Promise<boolean | null>;
  toggleSpotFavorite: (spotId: string) => Promise<boolean | null>;
  toggleStationFavorite: (stationId: string) => Promise<boolean | null>;
  /** Open the auth modal programmatically. */
  requestAuth: () => void;
  requestSignup: () => void;
  updatePreferences: (
    patch: AccountPreferencePatch,
  ) => Promise<AccountPreferences | null>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

export const FavoriteContext = createContext<FavContextValue>({
  user: null,
  authLoading: true,
  favoritesReady: false,
  retryFavorites: () => {},
  favoriteIds: new Set(),
  favoriteSpotIds: new Set(),
  favoriteStationIds: new Set(),
  preferences: null,
  preferencesLoading: true,
  toggleFavorite: async () => null,
  toggleSpotFavorite: async () => null,
  toggleStationFavorite: async () => null,
  requestAuth: () => {},
  requestSignup: () => {},
  updatePreferences: async () => null,
  signOut: async () => {},
});

export function useFavContext() {
  return useContext(FavoriteContext);
}

