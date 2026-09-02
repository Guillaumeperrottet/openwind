"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/lib/useAuth";
import { useFavorites } from "@/lib/useFavorites";
import { AuthModal } from "@/components/ui/AuthModal";
import { AccountOnboarding } from "@/components/account/AccountOnboarding";
import type { AccountPreferences } from "@/lib/user-preferences";

export type AccountPreferencePatch = Partial<
  Pick<
    AccountPreferences,
    | "sportFilter"
    | "useKnots"
    | "defaultView"
    | "onboardingCompleted"
    | "dashboardLayout"
  >
>;

interface FavContextValue {
  user: User | null;
  authLoading: boolean;
  /** Backward-compatible alias for favoriteSpotIds. */
  favoriteIds: Set<string>;
  favoriteSpotIds: Set<string>;
  favoriteStationIds: Set<string>;
  preferences: AccountPreferences | null;
  preferencesLoading: boolean;
  /** Toggle favorite. Returns null if not logged in (modal opens). */
  toggleFavorite: (spotId: string) => Promise<boolean | null>;
  toggleSpotFavorite: (spotId: string) => Promise<boolean | null>;
  toggleStationFavorite: (stationId: string) => Promise<boolean | null>;
  /** Open the auth modal programmatically. */
  requestAuth: () => void;
  updatePreferences: (
    patch: AccountPreferencePatch,
  ) => Promise<AccountPreferences | null>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

const FavContext = createContext<FavContextValue>({
  user: null,
  authLoading: true,
  favoriteIds: new Set(),
  favoriteSpotIds: new Set(),
  favoriteStationIds: new Set(),
  preferences: null,
  preferencesLoading: true,
  toggleFavorite: async () => null,
  toggleSpotFavorite: async () => null,
  toggleStationFavorite: async () => null,
  requestAuth: () => {},
  updatePreferences: async () => null,
  signOut: async () => {},
});

export function useFavContext() {
  return useContext(FavContext);
}

/**
 * Wrap around the app in layout.tsx (or just inside body).
 * Provides auth + favorites + auth modal to all descendants.
 */
export function FavProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    favoriteIds,
    favoriteSpotIds,
    favoriteStationIds,
    toggleFavorite: rawToggle,
    toggleStationFavorite: rawToggleStation,
  } = useFavorites(user);
  const [showAuth, setShowAuth] = useState(false);
  const [preferenceState, setPreferenceState] = useState<{
    userId: string;
    data: AccountPreferences | null;
  } | null>(null);
  const preferences =
    user && preferenceState?.userId === user.id ? preferenceState.data : null;
  const preferencesLoading =
    authLoading || Boolean(user && preferenceState?.userId !== user.id);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    let cancelled = false;

    // Sync first so a brand-new account receives its one-time onboarding row
    // before the preferences are read.
    fetch("/api/auth/sync", { method: "POST" })
      .then(() => fetch("/api/preferences", { cache: "no-store" }))
      .then((response) => (response.ok ? response.json() : null))
      .then((data: AccountPreferences | null) => {
        if (!cancelled) setPreferenceState({ userId: user.id, data });
      })
      .catch(() => {
        if (!cancelled) setPreferenceState({ userId: user.id, data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const toggleFavorite = useCallback(
    async (spotId: string) => {
      if (!user) {
        setShowAuth(true);
        return null;
      }
      return rawToggle(spotId);
    },
    [user, rawToggle],
  );

  const toggleStationFavorite = useCallback(
    async (stationId: string) => {
      if (!user) {
        setShowAuth(true);
        return null;
      }
      return rawToggleStation(stationId);
    },
    [user, rawToggleStation],
  );

  const requestAuth = useCallback(() => setShowAuth(true), []);

  const updatePreferences = useCallback(
    async (
      patch: AccountPreferencePatch,
    ): Promise<AccountPreferences | null> => {
      if (!user) return null;
      try {
        const response = await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!response.ok) return null;
        const next = (await response.json()) as AccountPreferences;
        setPreferenceState({ userId: user.id, data: next });
        return next;
      } catch {
        return null;
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      authLoading,
      favoriteIds,
      favoriteSpotIds,
      favoriteStationIds,
      preferences,
      preferencesLoading,
      toggleFavorite,
      toggleSpotFavorite: toggleFavorite,
      toggleStationFavorite,
      requestAuth,
      updatePreferences,
      signOut,
    }),
    [
      user,
      authLoading,
      favoriteIds,
      favoriteSpotIds,
      favoriteStationIds,
      preferences,
      preferencesLoading,
      toggleFavorite,
      toggleStationFavorite,
      requestAuth,
      updatePreferences,
      signOut,
    ],
  );

  return (
    <FavContext.Provider value={value}>
      {children}
      <AccountOnboarding />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </FavContext.Provider>
  );
}
