"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { WindLive } from "@/types";

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    timer = setInterval(tick, 30_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}

export function useFreshnessClock(): number | undefined {
  return useSyncExternalStore(subscribe, () => now, () => undefined);
}

/** A successful HTTP refresh does not make an old observation recent. */
export function windIsFresh(live: Pick<WindLive, "isFresh" | "staleAt"> & Partial<Pick<WindLive, "source" | "updatedAt">>, time?: number): boolean {
  if (time === undefined) return live.isFresh;
  const staleAt = Date.parse(live.staleAt);
  const modelTime = live.source === "openmeteo" ? Date.parse(live.updatedAt ?? "") : null;
  if (modelTime !== null && (!Number.isFinite(modelTime) || time >= modelTime + 60 * 60_000)) return false;
  return Number.isFinite(staleAt) && time < staleAt;
}

export function useFreshWind(live: WindLive | null): WindLive | null {
  const time = useFreshnessClock();
  return useMemo(() => live ? { ...live, isFresh: windIsFresh(live, time) } : null, [live, time]);
}
