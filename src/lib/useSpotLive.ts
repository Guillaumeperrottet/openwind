"use client";

import useSWR from "swr";
import type { WindLive } from "@/types";

const fetcher = async (url: string): Promise<WindLive> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<WindLive>;
};

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
): { data: WindLive | null; isLoading: boolean } {
  const key = spotId
    ? overrideStation
      ? `/api/spots/${spotId}/live?stationId=${encodeURIComponent(overrideStation)}`
      : `/api/spots/${spotId}/live`
    : null;

  const { data, isLoading } = useSWR<WindLive>(key, fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: true,
    dedupingInterval: 30 * 1000,
    // Keep stale data visible while revalidating (no flash of empty)
    keepPreviousData: true,
  });

  return { data: data ?? null, isLoading };
}
