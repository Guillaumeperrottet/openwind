"use client";

import { useEffect, useRef } from "react";
import type maplibregl from "maplibre-gl";
import { WindGL } from "./windgl/WindGL";
import type { WindData } from "./windgl/WindGL";

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * GPU-accelerated wind particle overlay.
 *
 * Fetches adaptive wind-grid data for the current viewport, encodes it as a
 * WebGL texture, and renders thousands of animated particles at 60 fps using
 * the GPU (via the WindGL class). A single WebGL canvas is stacked on top of
 * the map; no color-field canvas is needed.
 */
export function useWindOverlay(
  mapRef: React.RefObject<maplibregl.Map | null>,
  windCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  showWindOverlay: boolean,
  mapLoaded: boolean,
) {
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = windCanvasRef.current;
    const map = mapRef.current;

    if (!showWindOverlay || !mapLoaded || !canvas || !map) {
      // Clear leftover content when overlay is toggled off
      if (canvas) {
        const gl = canvas.getContext("webgl2");
        if (gl) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      }
      return;
    }

    // ── WebGL context + renderer ────────────────────────────────────
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) {
      console.warn(
        "[WindOverlay] Failed to get WebGL2 context — try a hard refresh (Cmd+Shift+R)",
      );
      return;
    }

    const windgl = new WindGL(gl);

    const dpr = window.devicePixelRatio || 1;

    const setupCanvas = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      windgl.resize();
    };
    setupCanvas();

    // ── Mutable state ───────────────────────────────────────────────
    let gridBounds: [number, number, number, number] = [0, 0, 0, 0]; // lng0, lat0, lng1, lat1
    let hasData = false;
    let animating = true;

    // ── Animation loop ──────────────────────────────────────────────
    const animate = () => {
      if (!animating || !hasData) return;

      // Project grid corners to screen pixels (CSS px)
      const nw = map.project([gridBounds[0], gridBounds[3]]); // NW
      const se = map.project([gridBounds[2], gridBounds[1]]); // SE
      const screenBounds: [number, number, number, number] = [
        nw.x,
        nw.y,
        se.x,
        se.y,
      ];
      const canvasSize: [number, number] = [
        canvas.clientWidth,
        canvas.clientHeight,
      ];

      // Adapt speed factor: ~2px screen displacement per frame at 20 km/h
      const gridW = Math.abs(se.x - nw.x);
      windgl.speedFactor = 0.1 / Math.max(gridW, 100);

      windgl.draw(screenBounds, canvasSize);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    // ── Adaptive wind-grid fetch ────────────────────────────────────
    let fetchAbort: AbortController | null = null;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchWind = () => {
      if (fetchAbort) fetchAbort.abort();
      fetchAbort = new AbortController();
      const signal = fetchAbort.signal;

      const zoom = map.getZoom();
      const bounds = map.getBounds();

      let step: number;
      if (zoom < 4) step = 3.0;
      else if (zoom < 5.5) step = 1.5;
      else if (zoom < 7) step = 0.75;
      else step = 0.35;

      const pad = step * 2;
      const snap = (v: number, s: number) => Math.round(v / s) * s;
      const bLat0 = Math.max(-85, snap(bounds.getSouth() - pad, step));
      const bLat1 = Math.min(85, snap(bounds.getNorth() + pad, step));
      const bLng0 = Math.max(-180, snap(bounds.getWest() - pad, step));
      const bLng1 = Math.min(180, snap(bounds.getEast() + pad, step));

      let nLats = Math.max(2, Math.round((bLat1 - bLat0) / step) + 1);
      let nLngs = Math.max(2, Math.round((bLng1 - bLng0) / step) + 1);
      while (nLats * nLngs > 200) {
        step *= 1.3;
        nLats = Math.max(2, Math.round((bLat1 - bLat0) / step) + 1);
        nLngs = Math.max(2, Math.round((bLng1 - bLng0) / step) + 1);
      }

      const lats: number[] = [];
      const lons: number[] = [];
      for (let i = 0; i < nLats; i++)
        for (let j = 0; j < nLngs; j++) {
          lats.push(+(bLat0 + i * step).toFixed(1));
          lons.push(+(bLng0 + j * step).toFixed(1));
        }

      fetch(`/api/wind/grid?lats=${lats.join(",")}&lngs=${lons.join(",")}`, {
        signal,
      })
        .then((r) => {
          if (r.status === 429 || r.status === 502) {
            if (animating)
              refetchTimer = setTimeout(
                fetchWind,
                r.status === 429 ? 10000 : 5000,
              );
            return null;
          }
          if (!r.ok) return null;
          return r.json();
        })
        .then((raw: unknown) => {
          if (!raw || !animating) return;
          const data = (Array.isArray(raw) ? raw : [raw]) as Array<{
            current?: {
              wind_speed_10m: number;
              wind_direction_10m: number;
            };
          } | null>;
          if (!data.length || !data[0]?.current) return;

          const windData = buildWindTexture(data, nLats, nLngs);
          const lat1Actual = bLat0 + (nLats - 1) * step;
          const lng1Actual = bLng0 + (nLngs - 1) * step;

          windgl.setWind(windData, [bLng0, bLat0, lng1Actual, lat1Actual]);
          gridBounds = [bLng0, bLat0, lng1Actual, lat1Actual];
          hasData = true;
          console.log(
            `[WindOverlay] Grid ${nLngs}×${nLats}, bounds ${bLng0.toFixed(1)},${bLat0.toFixed(1)}→${lng1Actual.toFixed(1)},${lat1Actual.toFixed(1)}, uRange ${windData.uMin.toFixed(1)}..${windData.uMax.toFixed(1)}, vRange ${windData.vMin.toFixed(1)}..${windData.vMax.toFixed(1)}`,
          );

          if (!animFrameRef.current)
            animFrameRef.current = requestAnimationFrame(animate);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.warn("[WindOverlay] fetch error", err);
          if (animating && !hasData) refetchTimer = setTimeout(fetchWind, 5000);
        });
    };

    // ── Map event handlers ──────────────────────────────────────────
    const onMoveEnd = () => {
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(fetchWind, 3000);
    };
    const onZoomStart = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
    const onZoomEnd = () => {
      if (hasData && !animFrameRef.current)
        animFrameRef.current = requestAnimationFrame(animate);
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(fetchWind, 1500);
    };
    const onResize = () => setupCanvas();

    map.on("moveend", onMoveEnd);
    map.on("zoomstart", onZoomStart);
    map.on("zoomend", onZoomEnd);
    window.addEventListener("resize", onResize);

    // Kick off first fetch
    fetchWind();

    return () => {
      animating = false;
      if (refetchTimer) clearTimeout(refetchTimer);
      if (fetchAbort) fetchAbort.abort();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
      map.off("moveend", onMoveEnd);
      map.off("zoomstart", onZoomStart);
      map.off("zoomend", onZoomEnd);
      window.removeEventListener("resize", onResize);
      windgl.destroy();
    };
  }, [showWindOverlay, mapLoaded, mapRef, windCanvasRef]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type GridRow = {
  current?: { wind_speed_10m: number; wind_direction_10m: number };
} | null;

function buildWindTexture(
  data: GridRow[],
  nLats: number,
  nLngs: number,
): WindData {
  const n = nLats * nLngs;
  const us = new Float32Array(n);
  const vs = new Float32Array(n);

  for (let idx = 0; idx < Math.min(data.length, n); idx++) {
    const d = data[idx];
    if (!d?.current) continue;
    const kmh = d.current.wind_speed_10m;
    const rad = (d.current.wind_direction_10m * Math.PI) / 180;
    us[idx] = -kmh * Math.sin(rad);
    vs[idx] = -kmh * Math.cos(rad);
  }

  let uMin = Infinity;
  let uMax = -Infinity;
  let vMin = Infinity;
  let vMax = -Infinity;
  for (let i = 0; i < n; i++) {
    if (us[i] < uMin) uMin = us[i];
    if (us[i] > uMax) uMax = us[i];
    if (vs[i] < vMin) vMin = vs[i];
    if (vs[i] > vMax) vMax = vs[i];
  }
  if (uMax - uMin < 0.01) {
    uMin -= 1;
    uMax += 1;
  }
  if (vMax - vMin < 0.01) {
    vMin -= 1;
    vMax += 1;
  }

  const image = new Uint8Array(n * 4);
  for (let idx = 0; idx < n; idx++) {
    image[idx * 4] = Math.round(((us[idx] - uMin) / (uMax - uMin)) * 255);
    image[idx * 4 + 1] = Math.round(((vs[idx] - vMin) / (vMax - vMin)) * 255);
    image[idx * 4 + 2] = 0;
    image[idx * 4 + 3] = 255;
  }

  return { width: nLngs, height: nLats, image, uMin, uMax, vMin, vMax };
}
