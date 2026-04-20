"use client";

import { useEffect, useRef } from "react";
import type maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { BitmapLayer } from "@deck.gl/layers";
import { WindParticleLayer, generateWindTexture } from "maplibre-gl-wind";

// ── Wind color palette (same as station markers, by km/h) ────────────────────
const SPEED_COLORS: [number, number, number, number][] = [
  [200, 212, 220, 255], // 0     - très calme
  [200, 212, 220, 255], // 8     - calme
  [208, 208, 208, 255], // 15    - léger
  [168, 189, 212, 255], // 22    - modéré
  [106, 156, 189, 255], // 30    - bon
  [58, 127, 168, 255], // 38    - kitable
  [224, 119, 32, 255], // 50    - fort
  [204, 51, 51, 255], // 50+   - danger
];
const SPEED_BREAKS = [0, 8, 15, 22, 30, 38, 50, 70];

function speedToColor(kmh: number): [number, number, number, number] {
  for (let i = SPEED_BREAKS.length - 1; i >= 0; i--) {
    if (kmh >= SPEED_BREAKS[i]) {
      if (i === SPEED_BREAKS.length - 1) return SPEED_COLORS[i];
      const t =
        (kmh - SPEED_BREAKS[i]) / (SPEED_BREAKS[i + 1] - SPEED_BREAKS[i]);
      const a = SPEED_COLORS[i];
      const b = SPEED_COLORS[i + 1];
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
        255,
      ];
    }
  }
  return SPEED_COLORS[0];
}

type WindPoint = {
  lat: number;
  lon: number;
  speed: number;
  direction: number;
  gusts?: number;
};

type TextureResponse = {
  points: WindPoint[];
  bounds: [number, number, number, number];
  step: number;
};

// ── IDW interpolation for raster ─────────────────────────────────────────────
function idwSpeed(
  points: WindPoint[],
  lat: number,
  lon: number,
  power = 2,
): number {
  let sumW = 0;
  let sumS = 0;
  for (const p of points) {
    const dx = lon - p.lon;
    const dy = lat - p.lat;
    const d2 = dx * dx + dy * dy;
    if (d2 < 1e-10) return p.speed;
    const w = 1 / Math.pow(d2, power / 2);
    sumS += w * p.speed;
    sumW += w;
  }
  return sumW > 0 ? sumS / sumW : 0;
}

// Generate a colored raster canvas from wind points
function buildRasterCanvas(
  points: WindPoint[],
  bounds: [number, number, number, number],
  width: number,
  height: number,
): HTMLCanvasElement {
  const [west, south, east, north] = bounds;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(width, height);

  for (let row = 0; row < height; row++) {
    // Flip Y: row 0 = north
    const lat = north - (row / (height - 1)) * (north - south);
    for (let col = 0; col < width; col++) {
      const lon = west + (col / (width - 1)) * (east - west);
      const speed = idwSpeed(points, lat, lon);
      const [r, g, b, a] = speedToColor(speed);
      const idx = (row * width + col) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = a;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function useWindOverlay(
  mapRef: React.RefObject<maplibregl.Map | null>,
  showWindOverlay: boolean,
  mapLoaded: boolean,
) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map) return;

    if (!showWindOverlay) {
      if (overlayRef.current) {
        map.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
    map.addControl(overlay);
    overlayRef.current = overlay;

    let alive = true;
    let fetchAbort: AbortController | null = null;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchWind = () => {
      if (!alive) return;
      if (fetchAbort) fetchAbort.abort();
      fetchAbort = new AbortController();
      const signal = fetchAbort.signal;

      const b = map.getBounds();
      const boundsStr = [
        b.getWest().toFixed(2),
        b.getSouth().toFixed(2),
        b.getEast().toFixed(2),
        b.getNorth().toFixed(2),
      ].join(",");

      fetch(`/api/wind/texture?bounds=${boundsStr}`, { signal })
        .then((r) => {
          if (!r.ok) {
            if (alive)
              refetchTimer = setTimeout(
                fetchWind,
                r.status === 429 ? 15000 : 5000,
              );
            return null;
          }
          return r.json() as Promise<TextureResponse>;
        })
        .then((data) => {
          if (!alive || !data || !overlayRef.current) return;
          const { points, bounds } = data;
          if (points.length < 4) return;

          const texW = 128;
          const texH = 128;

          // 1) Raster coloré (fond)
          const rasterCanvas = buildRasterCanvas(points, bounds, texW, texH);
          const rasterLayer = new BitmapLayer({
            id: "wind-raster",
            image: rasterCanvas,
            bounds,
            opacity: 0.2,
            pickable: false,
          });

          // 2) Particules animées
          const {
            canvas: windCanvas,
            uMin,
            uMax,
            vMin,
            vMax,
          } = generateWindTexture(points, {
            width: texW,
            height: texH,
            bounds,
          });

          const particleLayer = new WindParticleLayer({
            id: "wind-particles",
            image: windCanvas.toDataURL(),
            bounds,
            imageUnscale: [Math.min(uMin, vMin), Math.max(uMax, vMax)],
            numParticles: 5000,
            maxAge: 10,
            speedFactor: 3,
            color: [255, 255, 255, 255],
            width: 2,
            opacity: 0.2,
          });

          overlayRef.current.setProps({
            layers: [rasterLayer, particleLayer],
          });
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (alive) refetchTimer = setTimeout(fetchWind, 5000);
        });
    };

    const onMoveEnd = () => {
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(fetchWind, 500);
    };

    map.on("moveend", onMoveEnd);
    fetchWind();

    return () => {
      alive = false;
      if (fetchAbort) fetchAbort.abort();
      if (refetchTimer) clearTimeout(refetchTimer);
      map.off("moveend", onMoveEnd);
      if (overlayRef.current) {
        map.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [showWindOverlay, mapLoaded, mapRef]);
}
