"use client";

import { useCallback } from "react";
import { useFavContext } from "./favorite-context";

export function useWindUnits() {
  const { preferences, updatePreferences } = useFavContext();
  const setUseKnots = useCallback((useKnots: boolean) => {
    void updatePreferences({ useKnots });
  }, [updatePreferences]);
  return { useKnots: preferences?.useKnots ?? true, setUseKnots };
}
