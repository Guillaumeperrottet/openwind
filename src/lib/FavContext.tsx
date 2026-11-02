"use client";

import {
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "@/lib/useAuth";
import { useFavorites } from "@/lib/useFavorites";
import { AuthModal } from "@/components/ui/AuthModal";
import { AccountOnboarding } from "@/components/account/AccountOnboarding";
import { useBrowserPreferences } from "@/lib/browser-preferences";
import { FavoriteFeedback } from "@/components/account/FavoriteFeedback";

export { useFavContext } from "./favorite-context";
export type { AccountPreferencePatch } from "./favorite-context";
import { FavoriteContext as FavContext } from "./favorite-context";

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
    toggleFavorite,
    toggleStationFavorite,
    favoritesReady,
    retryFavorites,
    notice,
    dismissNotice,
  } = useFavorites(user, authLoading);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { preferences, preferencesLoading, preferencesError, updatePreferences, retryPreferences, dismissPreferencesError } =
    useBrowserPreferences(user, authLoading);
  const dismissFeedback = useCallback(() => {
    dismissNotice();
    dismissPreferencesError();
  }, [dismissNotice, dismissPreferencesError]);

  const requestAuth = useCallback(() => {
    setAuthMode("login");
    setShowAuth(true);
  }, []);
  const requestSignup = useCallback(() => {
    setAuthMode("signup");
    setShowAuth(true);
  }, []);

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
      favoritesReady,
      retryFavorites,
      toggleSpotFavorite: toggleFavorite,
      toggleStationFavorite,
      requestAuth,
      requestSignup,
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
      favoritesReady,
      retryFavorites,
      toggleStationFavorite,
      requestAuth,
      requestSignup,
      updatePreferences,
      signOut,
    ],
  );

  return (
    <FavContext.Provider value={value}>
      {children}
      <AccountOnboarding />
      <FavoriteFeedback notice={notice} preferencesError={preferencesError} onDismiss={dismissFeedback} onRetryPreferences={retryPreferences} />
      {showAuth && <AuthModal key={authMode} initialMode={authMode} open onClose={() => setShowAuth(false)} />}
    </FavContext.Provider>
  );
}
