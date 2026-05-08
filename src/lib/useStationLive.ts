"use client";

import useSWR from "swr";
import type { WindLive } from "@/types";

const fetcher = async (url: string): Promise<WindLive> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<WindLive>;
};

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
} {
  const key = stationId
    ? `/api/stations/${encodeURIComponent(stationId)}/live`
    : null;

  const { data, isLoading } = useSWR<WindLive>(key, fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: true,
    dedupingInterval: 30 * 1000,
    keepPreviousData: true,
  });

  return { data: data ?? null, isLoading };
}
