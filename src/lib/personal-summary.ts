import type { WindLive } from "@/types";

export interface WindSnapshot { source: string; stationId: string | null; at: number; wind: number; }
export function windSnapshot(live: WindLive | null, now = Date.now()): WindSnapshot | null {
  if (live?.source !== "station" || !live.isFresh || Date.parse(live.staleAt) <= now || !Number.isFinite(Date.parse(live.staleAt)) || !Number.isFinite(live.windSpeedKmh) || live.windSpeedKmh < 0) return null;
  const at = Date.parse(live.updatedAt);
  if (!Number.isFinite(at) || at > now) return null;
  return { source: `${live.source}:${live.network ?? ""}`, stationId: live.stationId ?? null, at, wind: live.windSpeedKmh };
}
/** Compare only newer samples from the same source, within one day. */
export function windChange(previous: WindSnapshot | null, current: WindSnapshot | null) {
  if (!previous || !current || !Number.isFinite(previous.wind) || previous.wind < 0 || !Number.isFinite(previous.at) ||
    previous.source !== current.source || previous.stationId !== current.stationId ||
    current.at <= previous.at || current.at - previous.at > 86400000) return null;
  const delta = current.wind - previous.wind;
  return Math.abs(delta) >= 5 ? delta : null;
}
