"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { trackEvent } from "@/lib/analytics";
import {
  parseFavoriteIds, toggleFavoriteId, readLocalFavorites, favoritePayload,
  remainingLocalFavorites, LOCAL_FAVORITES_KEY, MAX_LOCAL_FAVORITES,
  type FavoriteKind, type FavoriteIdSets,
} from "@/lib/favorites";

type Notice = "savedLocally" | "favoriteError" | "storageError" | "localLimit" | "syncError" | null;
const empty = () => parseFavoriteIds(null);

export function useFavorites(user: User | null, authLoading = false) {
  const owner = user?.id ?? null;
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const [local, setLocal] = useState<FavoriteIdSets>(empty);
  const [account, setAccount] = useState<{ owner: string; ids: FavoriteIdSets } | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const loading = useRef<Promise<void>>(Promise.resolve());
  const busy = useRef(new Set<string>());
  const accountRef = useRef<FavoriteIdSets>(empty());
  const accountOwner = useRef<string | null>(null);

  const storeLocal = useCallback((ids: FavoriteIdSets) => {
    setLocal(ids);
    try {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favoritePayload(ids.spotIds, ids.stationIds)));
      return true;
    } catch { setNotice("storageError"); return false; }
  }, []);

  useEffect(() => {
    const read = () => setLocal(readLocalFavorites());
    queueMicrotask(read);
    const changed = (event: StorageEvent) => {
      if (event.key === LOCAL_FAVORITES_KEY || event.key === null) read();
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);

  useEffect(() => {
    if (authLoading || !owner) return;
    let cancelled = false;
    loading.current = (async () => {
      try {
        const saved = readLocalFavorites();
        let imported = empty();
        if (saved.spotIds.size + saved.stationIds.size) {
          const res = await fetch("/api/favorites", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(favoritePayload(saved.spotIds, saved.stationIds)),
          });
          if (!res.ok) throw new Error("Favorite sync failed");
          imported = parseFavoriteIds(await res.json());
        }
        if (cancelled || ownerRef.current !== owner) return;
        const res = await fetch("/api/favorites", { cache: "no-store" });
        if (!res.ok) throw new Error("Favorites unavailable");
        const ids = parseFavoriteIds(await res.json());
        if (cancelled || ownerRef.current !== owner) return;
        const remaining = remainingLocalFavorites(readLocalFavorites(), imported);
        accountRef.current = ids;
        accountOwner.current = owner;
        setAccount({ owner, ids });
        const persisted = storeLocal(remaining);
        if (persisted) setNotice(remaining.spotIds.size + remaining.stationIds.size ? "syncError" : null);
        if (imported.spotIds.size + imported.stationIds.size)
          window.dispatchEvent(new Event("openwind:favorites-imported"));
      } catch {
        if (!cancelled && ownerRef.current === owner) setNotice("syncError");
      } finally {
        if (!cancelled && ownerRef.current === owner) setReadyFor(owner);
      }
    })();
    return () => { cancelled = true; };
  }, [owner, authLoading, retry, storeLocal]);

  const toggle = useCallback(async (kind: FavoriteKind, id: string): Promise<boolean | null> => {
    const forOwner = ownerRef.current;
    const field = kind === "spot" ? "spotIds" : "stationIds";
    if (!forOwner) {
      if (authLoading) return null;
      // Read again to include favorites added in another tab.
      const previous = readLocalFavorites();
      const alreadySaved = previous[field].has(id);
      if (!alreadySaved && previous.spotIds.size + previous.stationIds.size >= MAX_LOCAL_FAVORITES) {
        setNotice("localLimit"); return null;
      }
      const ids = { ...previous, [field]: toggleFavoriteId(previous[field], id) };
      if (storeLocal(ids)) setNotice(alreadySaved ? null : "savedLocally");
      trackEvent(alreadySaved ? "favorite_removed" : "favorite_added", { favorite_type: kind, storage: "device", ...(kind === "spot" ? { spot_id: id } : { station_id: id }) });
      return !alreadySaved;
    }
    const key = `${forOwner}:${kind}:${id}`;
    if (busy.current.has(key)) return null;
    busy.current.add(key);
    try {
      await loading.current;
      if (ownerRef.current !== forOwner) return null;
      if (accountOwner.current !== forOwner) { setNotice("syncError"); return null; }
      const pendingLocal = readLocalFavorites();
      if (!accountRef.current[field].has(id) && pendingLocal[field].has(id)) {
        pendingLocal[field].delete(id);
        storeLocal(pendingLocal);
        setNotice(null);
        return false;
      }
      const previous = accountRef.current[field].has(id);
      const optimistic = { ...accountRef.current, [field]: toggleFavoriteId(accountRef.current[field], id) };
      accountRef.current = optimistic;
      setAccount({ owner: forOwner, ids: optimistic });
      try {
        const res = await fetch("/api/favorites", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kind === "spot" ? { spotId: id } : { stationId: id }),
        });
        if (!res.ok) throw new Error("Favorite save failed");
        const { favorited } = await res.json();
        if (ownerRef.current !== forOwner) return null;
        const next = new Set(accountRef.current[field]);
        if (favorited) next.add(id); else next.delete(id);
        const ids = { ...accountRef.current, [field]: next };
        accountRef.current = ids;
        setAccount({ owner: forOwner, ids });
        // Removing a pending local favorite must not import it again on retry.
        const localIds = readLocalFavorites();
        if (localIds[field].has(id)) {
          localIds[field].delete(id);
          storeLocal(localIds);
        }
        setNotice(null);
        trackEvent(favorited ? "favorite_added" : "favorite_removed", { favorite_type: kind, storage: "account", ...(kind === "spot" ? { spot_id: id } : { station_id: id }) });
        return Boolean(favorited);
      } catch {
        if (ownerRef.current !== forOwner) return null;
        const rollback = new Set(accountRef.current[field]);
        if (previous) rollback.add(id); else rollback.delete(id);
        accountRef.current = { ...accountRef.current, [field]: rollback };
        setAccount({ owner: forOwner, ids: accountRef.current });
        setNotice("favoriteError");
        return null;
      }
    } finally { busy.current.delete(key); }
  }, [authLoading, storeLocal]);

  const ids = owner && account?.owner === owner ? {
    spotIds: new Set([...account.ids.spotIds, ...local.spotIds]),
    stationIds: new Set([...account.ids.stationIds, ...local.stationIds]),
  } : local;
  return {
    favoriteIds: ids.spotIds,
    favoriteSpotIds: ids.spotIds,
    favoriteStationIds: ids.stationIds,
    toggleFavorite: useCallback((id: string) => toggle("spot", id), [toggle]),
    toggleStationFavorite: useCallback((id: string) => toggle("station", id), [toggle]),
    favoritesReady: !authLoading && (!owner || readyFor === owner),
    notice,
    dismissNotice: useCallback(() => setNotice(null), []),
    retryFavorites: useCallback(() => setRetry((v) => v + 1), []),
  };
}
