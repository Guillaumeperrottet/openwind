import { useState, useRef, useCallback } from "react";

// ── Snap positions (fraction of viewport height) ──
export const SNAP_PEEK = 0.08;
export const SNAP_HALF = 0.5;
export const SNAP_FULL = 0.92;
const SNAPS = [SNAP_PEEK, SNAP_HALF, SNAP_FULL];

function closestSnap(frac: number): number {
  let best = SNAPS[0];
  let bestDist = Math.abs(frac - best);
  for (const s of SNAPS) {
    const d = Math.abs(frac - s);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

export function useBottomSheet(initialFrac: number) {
  const [sheetFrac, setSheetFrac] = useState(initialFrac);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartFrac = useRef(0);
  const viewportH = useRef(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  // Track whether a content touch became a sheet drag
  const contentDragging = useRef(false);

  const updateViewportHeight = useCallback(() => {
    viewportH.current = window.innerHeight;
  }, []);

  const handleDragStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      dragStartY.current = clientY;
      dragStartFrac.current = sheetFrac;
    },
    [sheetFrac],
  );

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const deltaY = dragStartY.current - clientY;
      const deltaFrac = deltaY / viewportH.current;
      const newFrac = Math.max(
        SNAP_PEEK,
        Math.min(SNAP_FULL, dragStartFrac.current + deltaFrac),
      );
      setSheetFrac(newFrac);
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      setIsDragging(false);
      const deltaY = dragStartY.current - clientY;
      const velocity = deltaY / viewportH.current;
      const biasedFrac = sheetFrac + velocity * 0.3;
      setSheetFrac(closestSnap(biasedFrac));
    },
    [isDragging, sheetFrac],
  );

  const handleSheetToggle = useCallback(() => {
    if (sheetFrac < SNAP_HALF - 0.05) setSheetFrac(SNAP_HALF);
    else if (sheetFrac < SNAP_FULL - 0.05) setSheetFrac(SNAP_FULL);
    else setSheetFrac(SNAP_PEEK);
  }, [sheetFrac]);

  // ── Content area touch handlers ──
  // Allow swiping the sheet from the scrollable content area:
  // - Swipe DOWN when scrolled to top → collapse the sheet
  // - Swipe UP when sheet is not FULL → expand the sheet
  // - Otherwise let normal scroll happen
  const contentTouchStart = useCallback(
    (e: React.TouchEvent) => {
      contentDragging.current = false;
      const scrollEl = scrollRef.current;
      const atTop = !scrollEl || scrollEl.scrollTop <= 0;
      const isSwipeDown = atTop && dragStartY.current === 0; // will be set below
      // Always record start position; we decide in move whether to take over
      dragStartY.current = e.touches[0].clientY;
      dragStartFrac.current = sheetFrac;
      // If scrolled to top or sheet is below FULL, we may take over
      void isSwipeDown;
    },
    [sheetFrac],
  );

  const contentTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const clientY = e.touches[0].clientY;
      const deltaY = dragStartY.current - clientY; // positive = finger moves up
      const scrollEl = scrollRef.current;
      const atTop = !scrollEl || scrollEl.scrollTop <= 0;

      if (contentDragging.current) {
        // Already took over — move the sheet
        e.preventDefault();
        const deltaFrac = deltaY / viewportH.current;
        const newFrac = Math.max(
          SNAP_PEEK,
          Math.min(SNAP_FULL, dragStartFrac.current + deltaFrac),
        );
        setSheetFrac(newFrac);
        return;
      }

      // Decide whether to take over:
      // 1) Swiping down and content is at top → collapse sheet
      // 2) Swiping up and sheet is below FULL → expand sheet
      const threshold = 8; // px of movement before we decide
      if (Math.abs(deltaY) < threshold) return;

      const swipingUp = deltaY > 0;
      const swipingDown = deltaY < 0;
      const sheetBelowFull = sheetFrac < SNAP_FULL - 0.05;

      if ((swipingDown && atTop) || (swipingUp && sheetBelowFull)) {
        // Take over — start dragging the sheet
        contentDragging.current = true;
        setIsDragging(true);
        e.preventDefault();
        return;
      }
      // Otherwise let the scroll happen normally
    },
    [sheetFrac, setSheetFrac, setIsDragging],
  );

  const contentTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!contentDragging.current) return;
      contentDragging.current = false;
      setIsDragging(false);
      const clientY = e.changedTouches[0].clientY;
      const deltaY = dragStartY.current - clientY;
      const velocity = deltaY / viewportH.current;
      const currentFrac = dragStartFrac.current + deltaY / viewportH.current;
      const biasedFrac = currentFrac + velocity * 0.3;
      setSheetFrac(closestSnap(biasedFrac));
    },
    [setSheetFrac, setIsDragging],
  );

  return {
    sheetFrac,
    setSheetFrac,
    isDragging,
    sheetRef,
    scrollRef,
    updateViewportHeight,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleSheetToggle,
    contentTouchStart,
    contentTouchMove,
    contentTouchEnd,
  };
}
