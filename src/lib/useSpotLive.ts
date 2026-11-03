"use client";

import useSWR from "swr";
import type { WindLive } from "@/types";

import { fetchClientJson } from "@/lib/fetch-client-json";
import { useFreshWind } from "@/lib/useFreshWind";

const fetcher = (url: string) => fetchClientJson<WindLive>(url);

/**
 * SWR hook — live current wind for a spot.
 *
 * Polls `/api/spots/:id/live` every 60 s. When multiple components subscribe
 * to the same spot, SWR deduplicates to a single in-flight request.
 *
 * @param spotId         The Prisma Spot.id. Pass null to skip fetching.
 * @param overrideStation  Optional: override the spot's nearestStationId
 *                         (used when the user selects a different nearby station).
 */
export function useSpotLive(
  spotId: string | null,
  overrideStation?: string | null,
): { data: WindLive | null; isLoading: boolean; error: Error | null; isValidating: boolean; refresh: () => void } {
  const key = spotId
    ? overrideStation
      ? `/api/spots/${spotId}/live?stationId=${encodeURIComponent(overrideStation)}`
      : `/api/spots/${spotId}/live`
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<WindLive, Error>(key, fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: true,
    dedupingInterval: 30 * 1000,
    // Cache the current resource while refreshing; never reuse another spot/station.
    keepPreviousData: false,
    errorRetryCount: 2,
  });

  const freshData = useFreshWind(data ?? null);
  return { data: freshData, isLoading, isValidating, error: error ?? null, refresh: () => { void mutate().catch(() => {}); } };
}
