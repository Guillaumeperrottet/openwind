"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchClientJson } from "@/lib/fetch-client-json";
import { haversineKm } from "@/lib/utils";
import type { WindStation } from "@/lib/stations";

export type StationWithDist = WindStation & { dist: number };

/**
 * Hook that fetches and sorts nearby wind stations by distance from a given point.
 * Returns the 5 closest stations. Re-fetches when `refresh` is called.
 */
export function useNearbyStations(initialLat?: number, initialLng?: number) {
  const [nearbyStations, setNearbyStations] = useState<StationWithDist[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [stationsError, setStationsError] = useState(false);

  const refresh = useCallback(async (lat: number, lng: number) => {
    setLoadingStations(true);
    setStationsError(false);
    try {
      const all = await fetchClientJson<WindStation[]>("/api/stations");
      const withDist: StationWithDist[] = all.map((s) => ({
        ...s,
        dist: haversineKm(lat, lng, s.lat, s.lng),
      }));
      withDist.sort((a, b) => a.dist - b.dist);
      setNearbyStations(withDist.filter((s) => s.dist <= 10).slice(0, 5));
    } catch {
      setStationsError(true);
    } finally {
      setLoadingStations(false);
    }
  }, []);

  // Auto-fetch on mount when editing a spot with existing coordinates
  useEffect(() => {
    if (initialLat && initialLng) {
      refresh(initialLat, initialLng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount

  return { nearbyStations, loadingStations, stationsError, refresh };
}
