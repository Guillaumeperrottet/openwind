"use client";

import useSWR from "swr";
import { useLocale } from "next-intl";
import { addDays, localDate, type PlannerResponse } from "./planner";

interface PersonalForecastData { responses: PlannerResponse[]; partial: boolean; }
export function usePersonalForecast(spotIds: string[]) {
  const locale = useLocale();
  const ids = [...new Set(spotIds)].sort().slice(0, 12);
  const today = localDate(new Date());
  const key = ids.length ? `personal-forecast:${locale}:${today}:${ids.join(",")}` : null;
  const result = useSWR<PersonalForecastData>(key, async () => {
    const settled = await Promise.allSettled((["KITE", "PARAGLIDE"] as const).map(async (sport) => {
      const params = new URLSearchParams({ startDate: today, endDate: addDays(today, 3), sport, spotIds: ids.join(","), locale });
      const response = await fetch(`/api/plan?${params}`, { signal: AbortSignal.timeout(50000) });
      const data = await response.json();
      if (!Array.isArray(data.spots)) throw new Error("Outlook unavailable");
      return data as PlannerResponse;
    }));
    const responses = settled.flatMap((r) => r.status === "fulfilled" ? [r.value] : []);
    const spots = responses.flatMap((r) => r.spots);
    const partial = settled.some((r) => r.status === "rejected") || spots.some((spot) => spot.unavailable);
    // Keep usable results from one sport if the other provider request fails.
    if (!responses.length || (partial && !spots.some((spot) => !spot.unavailable))) throw new Error("Forecast unavailable");
    return { responses, partial };
  }, { dedupingInterval: 60000, refreshInterval: 15 * 60000, revalidateOnFocus: true, errorRetryCount: 1 });
  const spots = result.data?.responses.flatMap((data) => data.spots) ?? [];
  const windows = spots.flatMap((spot) => spot.qualification?.eligible ? spot.windows.filter((window) => window.end > Date.now()).map((window) => ({ spot, window })) : [])
    .sort((a, b) => a.window.start - b.window.start || b.window.score - a.window.score).slice(0, 6);
  return { ...result, spots, windows, partial: result.data?.partial ?? false, hasSpots: ids.length > 0 };
}
