"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useFavContext } from "./favorite-context";
import { MAX_SAVED_ARTICLES, MAX_READING_POSITIONS, mergeReadingLibraries, parseReadingLibrary, readingIdentity, type ReadingArticle, type ReadingLibrary, type ReadingPosition } from "./reading-library";

const prefix = "openwind-reading:v1:";
const changed = "openwind:reading-library";
function read(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener(changed, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(changed, callback); };
}
function write(key: string, data: ReadingLibrary) {
  localStorage.setItem(key, JSON.stringify({ version: 1, ...data }));
  window.dispatchEvent(new Event(changed));
}
const noSubscribe = () => () => {};

export function useReadingLibrary() {
  const { user, authLoading } = useFavContext();
  const scope = prefix + (user?.id ?? "guest");
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const raw = useSyncExternalStore(subscribe, useCallback(() => read(scope), [scope]), () => null);
  const library = useMemo(() => parseReadingLibrary(raw), [raw]);
  const [error, setError] = useState(false);
  const ready = hydrated && !authLoading;

  useEffect(() => {
    if (!user || authLoading) return;
    const guest = parseReadingLibrary(read(prefix + "guest"));
    if (!guest.saved.length && !guest.positions.length) return;
    const { merged, remaining } = mergeReadingLibraries(parseReadingLibrary(read(scope)), guest);
    try { write(scope, merged); write(prefix + "guest", remaining); }
    catch { queueMicrotask(() => setError(true)); }
  }, [user, authLoading, scope]);

  const toggle = useCallback((article: ReadingArticle): "saved" | "removed" | "limit" | "error" => {
    if (!ready) return "error";
    const data = parseReadingLibrary(read(scope));
    const exists = data.saved.some((s) => readingIdentity(s) === readingIdentity(article));
    if (!exists && data.saved.length >= MAX_SAVED_ARTICLES) return "limit";
    try {
      write(scope, { ...data, saved: exists ? data.saved.filter((s) => readingIdentity(s) !== readingIdentity(article)) : [...data.saved, article] });
      setError(false); return exists ? "removed" : "saved";
    } catch { setError(true); return "error"; }
  }, [ready, scope]);
  const restore = useCallback((article: ReadingArticle) => {
    if (!ready) return false;
    const data = parseReadingLibrary(read(scope));
    if (data.saved.some((item) => readingIdentity(item) === readingIdentity(article))) return true;
    if (data.saved.length >= MAX_SAVED_ARTICLES) return false;
    try { write(scope, { ...data, saved: [...data.saved, article] }); setError(false); return true; }
    catch { setError(true); return false; }
  }, [ready, scope]);
  const remove = useCallback((article: Pick<ReadingArticle, "kind" | "slug">) => {
    if (!ready) return false;
    try { const data = parseReadingLibrary(read(scope)); write(scope, { ...data, saved: data.saved.filter((s) => readingIdentity(s) !== readingIdentity(article)) }); setError(false); return true; }
    catch { setError(true); return false; }
  }, [ready, scope]);
  const savePosition = useCallback((position: ReadingPosition | null, article: Pick<ReadingArticle, "kind" | "slug">) => {
    if (!ready) return;
    const data = parseReadingLibrary(read(scope));
    const previous = data.positions.find((p) => readingIdentity(p) === readingIdentity(article));
    if ((!position && !previous) || (position && previous?.revision === position.revision && previous.heading === position.heading)) return;
    const positions = data.positions.filter((p) => readingIdentity(p) !== readingIdentity(article));
    try { write(scope, { ...data, positions: position ? [position, ...positions].slice(0, MAX_READING_POSITIONS) : positions }); } catch { /* Reading remains available when storage is blocked. */ }
  }, [ready, scope]);
  return { ...library, ready, scope, error, toggle, restore, remove, savePosition };
}
