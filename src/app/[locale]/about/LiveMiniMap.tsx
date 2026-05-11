"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Wind } from "lucide-react";
import type { WindStation } from "@/lib/stations";
import { windColor } from "@/lib/utils";

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE ||
  "https://tiles.openfreemap.org/styles/liberty";

/**
 * Real MapLibre embed for the /about page.
 *
 * - Centers on Switzerland.
 * - Loads live stations from /api/stations and renders them as small
 *   colored dots with wind-direction arrows (HTML markers).
 * - Interactions limited (no scroll-zoom by default) so the page scroll
 *   stays smooth; click anywhere unlocks the map.
 */
export default function LiveMiniMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [stations, setStations] = useState<WindStation[] | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  // Init map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = new maplibregl.Map({
      container: el,
      style: MAP_STYLE,
      center: [8.2, 46.8], // Switzerland
      zoom: 6.4,
      attributionControl: false,
    });
    mapRef.current = map;

    // Disable interactions until the user explicitly clicks the map.
    map.scrollZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    map.on("error", (e) => {
      console.warn("[LiveMiniMap] error:", e?.error?.message || e);
    });
    map.on("load", () => {
      console.info("[LiveMiniMap] style loaded");
      try {
        map.resize();
      } catch {}
    });
    map.on("styledata", () => {
      // Re-trigger a paint if container size changed before style loaded.
      try {
        map.resize();
      } catch {}
    });

    // Container goes from 0×0 → real size when aspect-ratio applies.
    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch {}
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {}
      });
      markersRef.current = [];
      // Defer remove() to next tick so any in-flight style load can finish
      // and avoid the StrictMode "this.style is undefined" race.
      const toRemove = map;
      setTimeout(() => {
        try {
          toRemove.remove();
        } catch {}
      }, 0);
      mapRef.current = null;
    };
  }, []);

  // Fetch live stations once.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stations", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: WindStation[] | null) => {
        if (cancelled || !Array.isArray(data)) return;
        setStations(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Render markers when stations + map are ready.
  useEffect(() => {
    if (!stations) return;
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    const apply = () => {
      if (cancelled || mapRef.current !== map) return;
      // Clear previous markers
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {}
      });
      markersRef.current = [];

      for (const s of stations) {
        if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng)) continue;
        const color = windColor(s.windSpeedKmh);
        const wrap = document.createElement("div");
        wrap.style.position = "relative";
        wrap.style.width = "10px";
        wrap.style.height = "10px";
        wrap.style.pointerEvents = "none";

        const dot = document.createElement("span");
        dot.style.position = "absolute";
        dot.style.inset = "0";
        dot.style.borderRadius = "9999px";
        dot.style.background = color;
        dot.style.boxShadow = "0 0 0 1.5px white, 0 1px 2px rgba(0,0,0,0.25)";
        wrap.appendChild(dot);

        // Arrow tail (only if measurable wind)
        if (s.windSpeedKmh >= 3 && Number.isFinite(s.windDirection)) {
          const arrow = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          arrow.setAttribute("width", "20");
          arrow.setAttribute("height", "20");
          arrow.style.position = "absolute";
          arrow.style.left = "50%";
          arrow.style.top = "50%";
          arrow.style.transform = `translate(-50%, -50%) rotate(${s.windDirection}deg)`;
          arrow.style.pointerEvents = "none";
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          path.setAttribute(
            "d",
            "M 10 10 L 10 2 M 10 2 L 7.5 5 M 10 2 L 12.5 5",
          );
          path.setAttribute("stroke", color);
          path.setAttribute("stroke-width", "1.4");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("fill", "none");
          arrow.appendChild(path);
          wrap.appendChild(arrow);
        }

        const marker = new maplibregl.Marker({
          element: wrap,
          anchor: "center",
        })
          .setLngLat([s.lng, s.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);

    return () => {
      cancelled = true;
    };
  }, [stations]);

  function unlock() {
    const map = mapRef.current;
    if (!map || unlocked) return;
    setUnlocked(true);
    map.scrollZoom.enable();
    map.dragPan.enable();
    map.touchZoomRotate.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  }

  const count = stations?.length ?? null;

  return (
    <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-slate-100">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading shimmer until stations land */}
      {!stations && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow text-xs text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Chargement des stations…
          </div>
        </div>
      )}

      {/* Count pill (top-right) */}
      {count !== null && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 shadow-sm border border-black/5 text-[10px] font-semibold text-slate-700 tabular-nums">
          {count} stations
        </div>
      )}

      {/* Legend pill (bottom-left) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur shadow-sm border border-black/5 text-[10px] text-slate-600 pointer-events-none">
        <Wind className="h-3 w-3 text-slate-400" />
        Live · 5 réseaux
      </div>

      {/* Click-to-interact overlay */}
      {!unlocked && (
        <button
          type="button"
          onClick={unlock}
          className="absolute inset-0 flex items-end justify-center pb-10 group cursor-pointer"
          aria-label="Activer la carte"
        >
          <span className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Cliquer pour interagir
          </span>
        </button>
      )}
    </div>
  );
}
