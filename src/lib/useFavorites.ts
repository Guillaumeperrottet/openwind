"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

/**
 * Manages the user's favorite spot IDs.
 * Non-blocking: works silently, returns empty set when not logged in.
 */
export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Load favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.spotIds)) {
          setFavoriteIds(new Set(data.spotIds));
        }
      })
      .catch(() => {});
  }, [user]);

  const toggleFavorite = useCallback(
    async (spotId: string): Promise<boolean | null> => {
      if (!user) return null; // Caller should show auth modal

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(spotId)) next.delete(spotId);
        else next.add(spotId);
        return next;
      });

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.favorited;
      } catch {
        // Rollback on error
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (next.has(spotId)) next.delete(spotId);
          else next.add(spotId);
          return next;
        });
        return null;
      }
    },
    [user],
  );

  return { favoriteIds, toggleFavorite };
}
