"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { trackEvent } from "@/lib/analytics";
import {
  parseFavoriteIds,
  toggleFavoriteId,
  type FavoriteKind,
} from "@/lib/favorites";

/**
 * Manages the user's favorite spot and station IDs.
 * Non-blocking: works silently, returns empty set when not logged in.
 */
export function useFavorites(user: User | null) {
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<Set<string>>(
    new Set(),
  );
  const [favoriteStationIds, setFavoriteStationIds] = useState<Set<string>>(
    new Set(),
  );

  // Load favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavoriteSpotIds(new Set());
      setFavoriteStationIds(new Set());
      return;
    }

    let cancelled = false;
    fetch("/api/favorites")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        const favorites = parseFavoriteIds(data);
        setFavoriteSpotIds(favorites.spotIds);
        setFavoriteStationIds(favorites.stationIds);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (kind: FavoriteKind, id: string): Promise<boolean | null> => {
      if (!user) return null; // Caller should show auth modal

      const setIds =
        kind === "spot" ? setFavoriteSpotIds : setFavoriteStationIds;
      setIds((previous) => toggleFavoriteId(previous, id));

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            kind === "spot" ? { spotId: id } : { stationId: id },
          ),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const favorited = Boolean(data.favorited);
        setIds((previous) => {
          const next = new Set(previous);
          if (favorited) next.add(id);
          else next.delete(id);
          return next;
        });
        trackEvent(favorited ? "favorite_added" : "favorite_removed", {
          favorite_type: kind,
          ...(kind === "spot" ? { spot_id: id } : { station_id: id }),
        });
        return favorited;
      } catch {
        setIds((previous) => toggleFavoriteId(previous, id));
        return null;
      }
    },
    [user],
  );

  const toggleSpotFavorite = useCallback(
    (spotId: string) => toggle("spot", spotId),
    [toggle],
  );
  const toggleStationFavorite = useCallback(
    (stationId: string) => toggle("station", stationId),
    [toggle],
  );

  return {
    favoriteIds: favoriteSpotIds,
    favoriteSpotIds,
    favoriteStationIds,
    toggleFavorite: toggleSpotFavorite,
    toggleSpotFavorite,
    toggleStationFavorite,
  };
}
