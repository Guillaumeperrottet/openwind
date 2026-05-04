"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Returns a `[setRef, visible]` tuple. Attach `setRef` to any element via
 * `ref={setRef}` — the element fades in once it enters the viewport.
 *
 * Implemented with a callback ref + IntersectionObserver so we never read
 * `ref.current` during render (keeps lint / React Compiler happy).
 */
export function useReveal(
  threshold = 0.15,
): [(node: Element | null) => void, boolean] {
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") return;
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
