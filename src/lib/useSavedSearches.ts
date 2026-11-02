"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useFavContext } from "./favorite-context";
import { MAX_SAVED_SEARCHES, mergeSavedSearches, parseSavedSearches, savedSearchIdentity, type SavedSearch } from "./saved-searches";
import { trackEvent } from "./analytics";

const prefix = "openwind-searches:v1:";
const changed = "openwind:saved-searches";
function read(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener(changed, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(changed, callback); };
}
function write(key: string, searches: SavedSearch[]) { localStorage.setItem(key, JSON.stringify(searches)); window.dispatchEvent(new Event(changed)); }

export function useSavedSearches() {
  const { user, authLoading } = useFavContext();
  const key = prefix + (user?.id ?? "guest");
  const [error, setError] = useState(false);
  const raw = useSyncExternalStore(subscribe, useCallback(() => read(key), [key]), () => null);
  const searches = useMemo(() => parseSavedSearches(raw), [raw]);
  useEffect(() => {
    if (!user || authLoading) return;
    const guest = parseSavedSearches(read(prefix + "guest"));
    if (!guest.length) return;
    const { merged, remaining } = mergeSavedSearches(parseSavedSearches(read(key)), guest);
    try {
      // Only remove a guest search after the scoped account copy is durable.
      write(key, merged); write(prefix + "guest", remaining);
    } catch { queueMicrotask(() => setError(true)); }
  }, [user, authLoading, key]);
  const save = (search: SavedSearch) => {
    if (authLoading) return false;
    const current = parseSavedSearches(read(key));
    const existing = current.find((s) => savedSearchIdentity(s) === savedSearchIdentity(search));
    if (!existing && current.length >= MAX_SAVED_SEARCHES) return false;
    try {
      write(key, existing ? current.map((s) => s.id === existing.id ? { ...search, id: existing.id } : s) : [...current, search]);
      setError(false);
      trackEvent("plan_search_saved", { sport: search.criteria.sport, period: search.period });
      return true;
    } catch { setError(true); return false; }
  };
  const remove = (id: string) => {
    if (authLoading) return false;
    try { write(key, parseSavedSearches(read(key)).filter((s) => s.id !== id)); setError(false); return true; }
    catch { setError(true); return false; }
  };
  return { searches: authLoading ? [] : searches, save, remove, error, ready: !authLoading };
}
