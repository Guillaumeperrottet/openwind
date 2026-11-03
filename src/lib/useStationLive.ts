"use client";

import useSWR from "swr";
import type { WindLive } from "@/types";

import { fetchClientJson } from "@/lib/fetch-client-json";
import { useFreshWind } from "@/lib/useFreshWind";

const fetcher = (url: string) => fetchClientJson<WindLive>(url);

/**
 * SWR hook — live current wind for a station.
 *
 * Polls `/api/stations/:id/live` every 60 s. SWR deduplicates concurrent
 * calls for the same station (e.g. popup + station page open at once).
 *
 * @param stationId  Station identifier (e.g. "VEV", "piou-110"). Pass null to skip.
 */
export function useStationLive(stationId: string | null): {
  data: WindLive | null;
  isLoading: boolean;
  error: Error | null;
  isValidating: boolean;
  refresh: () => void;
} {
  const key = stationId
    ? `/api/stations/${encodeURIComponent(stationId)}/live`
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
