"use client";
import { useSyncExternalStore } from "react";
import type { SiteLocale } from "./site";
import { placeRef, validPlace, type Place } from "./place";

const KEY = "openwind-place-v1", MAX_AGE = 8 * 3600_000;
const listeners = new Set<() => void>();
let current: Place | null = null, loaded = false;
export function selectedPlace() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try { const saved = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (saved && Number.isFinite(saved.time) && Date.now() - saved.time >= 0 && Date.now() - saved.time < MAX_AGE && validPlace(saved.place)) current = saved.place; } catch { /* Optional browser storage. */ }
  }
  return current;
}
export function selectPlace(place: Place | null) {
  if (place && !validPlace(place)) return;
  loaded = true; current = place;
  try { if (place) sessionStorage.setItem(KEY, JSON.stringify({ place, time: Date.now() })); else sessionStorage.removeItem(KEY); } catch { /* The visit can continue in memory. */ }
  listeners.forEach(fn => fn());
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export const useSelectedPlace = () => useSyncExternalStore(subscribe, selectedPlace, () => null);

/** Map popups already have public coordinates; enrich the lake association in the background. */
export async function rememberMapPlace(place: Place, locale: SiteLocale) {
  if (!validPlace(place)) return;
  selectPlace(place);
  try {
    const response = await fetch(`/api/place?${new URLSearchParams({ ref: placeRef(place), locale })}`, { signal: AbortSignal.timeout(6000) });
    const data = await response.json();
    const current = selectedPlace();
    if (response.ok && validPlace(data.place) && current?.kind === place.kind && current.id === place.id) selectPlace(data.place);
  } catch { /* Keep the selected popup's public identity during an outage. */ }
}
