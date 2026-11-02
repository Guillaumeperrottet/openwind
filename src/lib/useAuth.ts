"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Non-blocking auth hook.
 * Silently checks if the user is logged in — never redirects or gates.
 * Exposes `user`, `loading`, and `signOut`.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let sessionEvents = 0;
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && sessionEvents === 0) setUser(session?.user ?? null);
    }).catch(() => {}).finally(() => {
      if (!cancelled) setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      sessionEvents++;
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signOut };
}
