"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PlannerResult } from "@/lib/planner";

/** Deliberately separate from the live map: no auth, sockets or wind layers. */
export default function PlannerMap({
  spots,
  onSelect,
  label,
  errorText,
}: {
  spots: PlannerResult[];
  onSelect: (id: string) => void;
  label: string;
  errorText: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!container.current || !spots.length) return;
    let map: maplibregl.Map | undefined;
    let disposed = false;
    const markers: maplibregl.Marker[] = [];
    try {
      map = new maplibregl.Map({
        container: container.current,
        style:
          process.env.NEXT_PUBLIC_MAP_STYLE ||
          "https://tiles.openfreemap.org/styles/liberty",
        center: [spots[0].longitude, spots[0].latitude],
        zoom: 7,
        attributionControl: { compact: true },
      });
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      const bounds = new maplibregl.LngLatBounds();
      spots.forEach((spot, i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(i + 1);
        button.setAttribute("aria-label", `${label} ${i + 1} : ${spot.name}`);
        button.title = spot.name;
        // Keep the leading recommendations above nearby alternative launches.
        button.style.zIndex = String(spots.length - i);
        button.className =
          "flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-sky-700 text-sm font-bold text-white shadow-lg focus-visible:outline-4 focus-visible:outline-sky-400";
        button.addEventListener("click", () => onSelect(spot.id));
        markers.push(
          new maplibregl.Marker({ element: button })
            .setLngLat([spot.longitude, spot.latitude])
            .addTo(map!),
        );
        bounds.extend([spot.longitude, spot.latitude]);
      });
      map.fitBounds(bounds, { padding: 65, maxZoom: 10, duration: 0 });
      map.on("error", () => setError(true));
    } catch {
      queueMicrotask(() => {
        if (!disposed) setError(true);
      });
    }
    return () => {
      disposed = true;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [spots, onSelect, label]);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <div
        ref={container}
        className="h-[420px] sm:h-[520px]"
        aria-label={label}
      />
      {error && (
        <p
          role="status"
          className="absolute bottom-9 left-3 right-3 rounded-xl bg-white p-3 text-sm shadow"
        >
          {errorText}
        </p>
      )}
    </div>
  );
}
