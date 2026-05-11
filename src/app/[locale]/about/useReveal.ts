"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Returns a `[setRef, visible]` tuple. Attach `setRef` to any element via
 * `ref={setRef}` — the element fades in once it enters the viewport.
 *
 * Always starts `visible=false` to keep server/client first paint identical
 * (no hydration mismatch). The fallback for missing IntersectionObserver
 * lives inside the callback ref, so we never setState in a render-phase
 * effect.
 */
export function useReveal(
  threshold = 0.15,
): [(node: Element | null) => void, boolean] {
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") {
        // No IO support: just reveal once attached.
        setVisible(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              io.disconnect();
              break;
            }
          }
        },
        { threshold, rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(node);
      observerRef.current = io;
    },
    [threshold],
  );

  return [setRef, visible];
}
