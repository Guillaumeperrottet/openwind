"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_PREFERENCES, parseLocalPreferences, type AccountPreferences, type PreferencePatch } from "./user-preferences";

export const PREFERENCES_STORAGE_KEY = "openwind-preferences:v1";

function readLocal() {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}");
    return { saved: parseLocalPreferences(value.saved), pending: parseLocalPreferences(value.pending), owner: typeof value.owner === "string" ? value.owner : null };
  } catch {
    return { saved: {}, pending: {}, owner: null };
  }
}

export function useBrowserPreferences(user: User | null, authLoading: boolean) {
  const [state, setState] = useState<{ owner: string | null; data: AccountPreferences }>(
    { owner: null, data: DEFAULT_PREFERENCES },
  );
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const owner = user?.id ?? null;
  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  const current = useRef(DEFAULT_PREFERENCES);
  const pending = useRef<PreferencePatch>({});
  const guestPending = useRef<PreferencePatch>({});
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const version = useRef(0);

  const publish = useCallback((data: AccountPreferences, forOwner: string | null) => {
    if (ownerRef.current !== forOwner) return;
    current.current = data;
    setState({ owner: forOwner, data });
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({
        saved: parseLocalPreferences(data), pending: forOwner ? guestPending.current : pending.current, owner: forOwner,
      }));
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (!owner) return;
    const changed = (event: StorageEvent) => {
      if (event.key !== PREFERENCES_STORAGE_KEY) return;
      const next = readLocal();
      if (next.owner !== owner) return;
      current.current = { ...current.current, ...next.saved, ...pending.current };
      setState({ owner, data: current.current });
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [owner]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const local = readLocal();
    guestPending.current = local.pending;
    pending.current = {};
    if (!owner) {
      pending.current = local.pending;
      queueMicrotask(() => {
        if (!cancelled) publish({ ...DEFAULT_PREFERENCES, ...local.saved }, null);
      });
      const onStorage = (event: StorageEvent) => {
        if (event.key !== PREFERENCES_STORAGE_KEY && event.key !== null) return;
        const next = readLocal();
        pending.current = next.pending;
        // Do not write a received storage event back to other tabs.
        current.current = { ...DEFAULT_PREFERENCES, ...next.saved };
        setState({ owner: null, data: current.current });
      };
      window.addEventListener("storage", onStorage);
      return () => { cancelled = true; window.removeEventListener("storage", onStorage); };
    }

    const loadVersion = version.current;
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (cancelled || ownerRef.current !== owner) return;
      try {
        const res = await fetch("/api/preferences", { cache: "no-store" });
        if (!res.ok) throw new Error("Preferences unavailable");
        let data: AccountPreferences = await res.json();
        if (cancelled || ownerRef.current !== owner) return;
        // A user's edits made while loading always win over the delayed GET.
        const imported = { ...local.pending, ...pending.current };
        if (Object.keys(imported).length) {
          const saved = await fetch("/api/preferences", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(imported),
          });
          if (!saved.ok) throw new Error("Preference sync failed");
          data = await saved.json();
        }
        if (cancelled || ownerRef.current !== owner) return;
        guestPending.current = {};
        if (loadVersion === version.current) publish(data, owner);
        else publish({ ...data, ...pending.current }, owner);
        pending.current = {};
        setError(false);
      } catch {
        if (!cancelled && ownerRef.current === owner) {
          publish({ ...DEFAULT_PREFERENCES, ...local.saved, ...pending.current }, owner);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoadedFor(owner);
      }
    });
    return () => { cancelled = true; };
  }, [owner, authLoading, publish]);

  const updatePreferences = useCallback(async (patch: PreferencePatch) => {
    const forOwner = ownerRef.current;
    const revision = ++version.current;
    pending.current = { ...pending.current, ...patch };
    const pendingPatch = { ...guestPending.current, ...pending.current };
    publish({ ...current.current, ...patch }, forOwner);
    if (!forOwner) return current.current;
    const save = queue.current.catch(() => {}).then(async () => {
      if (ownerRef.current !== forOwner) return null;
      try {
        const res = await fetch("/api/preferences", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingPatch), keepalive: true,
        });
        if (!res.ok) throw new Error("Preference save failed");
        const data: AccountPreferences = await res.json();
        if (ownerRef.current !== forOwner) return null;
        guestPending.current = {};
        if (version.current === revision) { pending.current = {}; publish(data, forOwner); }
        setError(false);
        return data;
      } catch {
        if (ownerRef.current === forOwner) setError(true);
        return null;
      }
    });
    queue.current = save;
    return save;
  }, [publish]);

  return {
    preferences: state.owner === owner || (owner && state.owner === null) ? state.data : DEFAULT_PREFERENCES,
    preferencesLoading: authLoading || Boolean(owner && loadedFor !== owner),
    preferencesError: error,
    retryPreferences: useCallback(() => updatePreferences({ ...guestPending.current, ...pending.current, ...parseLocalPreferences(current.current) }), [updatePreferences]),
    dismissPreferencesError: useCallback(() => setError(false), []),
    updatePreferences,
  };
}
