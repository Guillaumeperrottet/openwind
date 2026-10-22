"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { selectRecommendations, type PlannerResult } from "@/lib/planner";
import type { SiteLocale } from "@/lib/site";
import { plannerMapLocale } from "@/lib/planner-map-locale";
import { plannerUiCopy } from "@/lib/planner-ui-copy";
import { readCamera, saveCamera } from "@/lib/planner-map-state";

/** Independent of the live map: no authentication, sockets or wind layers. */
export default function PlannerMap({
  spots,
  onSelect,
  label,
  errorText,
  scope,
  selectedId,
  locale,
}: {
  spots: PlannerResult[];
  onSelect: (id: string) => void;
  label: string;
  errorText: string;
  scope: string;
  selectedId?: string;
  locale: SiteLocale;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const recenter = useRef<() => void>(() => {});
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const selected = useRef(selectedId);
  const [error, setError] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const ui = plannerUiCopy[locale];
  useEffect(() => {
    selected.current = selectedId;
    for (const [id, button] of buttons.current) {
      const active = id === `p:${selectedId}`;
      button.setAttribute("aria-pressed", String(active));
      button.style.backgroundColor = active
        ? "#0f172a"
        : button.dataset.color || "#64748b";
    }
  }, [selectedId]);
  useEffect(() => {
    if (!container.current || !spots.length) return;
    let map: maplibregl.Map | undefined;
    let disposed = false,
      generation = 0;
    queueMicrotask(() => {
      if (!disposed) {
        setMembers([]);
        setError(false);
      }
    });
    const markers = new Map<string, maplibregl.Marker>();
    const recommendations = selectRecommendations(spots);
    const buttonCache = buttons.current;
    const duration = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350;
    const remember = () => {
      if (!map) return;
      const center = map.getCenter();
      try {
        saveCamera(sessionStorage, scope, {
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      } catch {
        /* storage disabled */
      }
    };
    try {
      let camera = null;
      try {
        camera = readCamera(sessionStorage, scope);
      } catch {
        /* storage disabled */
      }
      map = new maplibregl.Map({
        container: container.current,
        style:
          process.env.NEXT_PUBLIC_MAP_STYLE ||
          "https://tiles.openfreemap.org/styles/liberty",
        center: camera?.center ?? [spots[0].longitude, spots[0].latitude],
        zoom: camera?.zoom ?? 7,
        bearing: camera?.bearing ?? 0,
        pitch: camera?.pitch ?? 0,
        attributionControl: { compact: true },
        maxZoom: 18,
        cooperativeGestures: true,
        locale: plannerMapLocale(locale),
      });
      mapRef.current = map;
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      const bounds = new maplibregl.LngLatBounds();
      spots.forEach((s) => bounds.extend([s.longitude, s.latitude]));
      recenter.current = () =>
        map?.fitBounds(bounds, {
          padding: 65,
          maxZoom: 10,
          duration: duration(),
        });
      if (!camera)
        map.fitBounds(bounds, { padding: 65, maxZoom: 10, duration: 0 });
      map.on("moveend", remember);
      map.on("load", () => {
        if (disposed || !map) return;
        map.addSource("planner-spots", {
          type: "geojson",
          cluster: true,
          clusterRadius: 60,
          clusterMaxZoom: 18,
          data: {
            type: "FeatureCollection",
            features: spots.map((s) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [s.longitude, s.latitude],
              },
              properties: {
                spotId: s.id,
                rank: recommendations.findIndex((r) => r.id === s.id) + 1,
                name: s.name,
                status: ui.status[s.qualification?.status ?? "MISSING"],
              },
            })),
          },
        });
        // A transparent layer makes MapLibre load source tiles; HTML buttons provide
        // native keyboard focus and 44px targets for both points and clusters.
        map.addLayer({
          id: "planner-source",
          type: "circle",
          source: "planner-spots",
          paint: { "circle-radius": 0, "circle-opacity": 0 },
        });
        const update = () => {
          if (disposed || !map?.isSourceLoaded("planner-spots")) return;
          const active = new Set<string>();
          for (const feature of map.querySourceFeatures("planner-spots")) {
            if (feature.geometry.type !== "Point") continue;
            const p = feature.properties,
              cluster = !!p.cluster;
            const id = cluster ? `c:${p.cluster_id}` : `p:${p.spotId}`;
            if (active.has(id)) continue;
            const coords = feature.geometry.coordinates as [number, number];
            // Source queries include neighbouring tiles. Keep their DOM targets
            // outside the viewport out of the keyboard order.
            const projected = map.project(coords),
              size = map.getContainer();
            if (
              projected.x < -22 ||
              projected.y < -22 ||
              projected.x > size.clientWidth + 22 ||
              projected.y > size.clientHeight + 22
            )
              continue;
            active.add(id);
            if (markers.has(id)) continue;
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = cluster
              ? String(p.point_count)
              : p.rank
                ? String(p.rank)
                : "·";
            button.setAttribute(
              "aria-label",
              cluster
                ? `${ui.cluster} ${p.point_count} ${ui.expand}`
                : `${label}${p.rank ? ` ${p.rank}` : ""} : ${p.name} · ${p.status}`,
            );
            if (!cluster)
              button.setAttribute(
                "aria-pressed",
                String(p.spotId === selected.current),
              );
            button.dataset.color = p.rank ? "#0369a1" : "#64748b";
            button.style.backgroundColor = cluster
              ? "#fff"
              : p.spotId === selected.current
                ? "#0f172a"
                : button.dataset.color;
            button.className = `flex h-11 min-w-11 items-center justify-center rounded-full border-2 px-2 text-sm font-bold shadow-lg focus-visible:outline-4 focus-visible:outline-sky-400 ${cluster ? "border-sky-700 text-sky-900" : "border-white text-white"}`;
            button.addEventListener("click", async () => {
              if (!cluster) {
                setMembers([]);
                generation++;
                onSelect(p.spotId);
                return;
              }
              const token = ++generation;
              try {
                const source = map!.getSource(
                  "planner-spots",
                ) as maplibregl.GeoJSONSource;
                const [zoom, leaves] = await Promise.all([
                  source.getClusterExpansionZoom(p.cluster_id),
                  source.getClusterLeaves(p.cluster_id, spots.length, 0),
                ]);
                if (disposed || token !== generation) return;
                setMembers(
                  leaves
                    .map((f) => String(f.properties?.spotId))
                    .filter((id) => spots.some((s) => s.id === id)),
                );
                map?.easeTo({
                  center: coords,
                  zoom: Math.min(zoom, 18),
                  duration: duration(),
                });
              } catch {
                if (!disposed) setError(true);
              }
            });
            markers.set(
              id,
              new maplibregl.Marker({ element: button })
                .setLngLat(coords)
                .addTo(map),
            );
            if (!cluster) buttonCache.set(id, button);
          }
          for (const [id, marker] of markers)
            if (!active.has(id)) {
              marker.remove();
              markers.delete(id);
              buttonCache.delete(id);
            }
        };
        map.on("render", update);
      });
      map.on("error", () => {
        if (!disposed) setError(true);
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed) setError(true);
      });
    }
    return () => {
      remember();
      disposed = true;
      generation++;
      markers.forEach((m) => m.remove());
      buttonCache.clear();
      map?.remove();
      mapRef.current = null;
      recenter.current = () => {};
    };
  }, [spots, onSelect, label, scope, ui, locale]);
  return (
    <div className="planner-map overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative bg-slate-100">
        <div
          ref={container}
          className="h-[420px] sm:h-[520px]"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => recenter.current()}
          className="absolute left-3 top-3 min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow"
        >
          {ui.recenter}
        </button>
        {error && (
          <p
            role="status"
            className="absolute bottom-9 left-3 right-3 rounded-xl bg-white p-3 text-sm shadow"
          >
            {errorText}
          </p>
        )}
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
        {ui.mapLegend}
      </p>
      {!!members.length && (
        <div className="border-t border-slate-100 p-3">
          <p
            role="status"
            className="mb-1 text-xs font-semibold text-slate-600"
          >
            {ui.members} ({members.length})
          </p>
          <ul className="max-h-48 overflow-y-auto">
            {members.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={id === selectedId}
                  onClick={() => onSelect(id)}
                  className="min-h-11 w-full rounded-lg px-2 text-left text-sm text-sky-900 hover:bg-sky-50 aria-pressed:bg-sky-50"
                >
                  {spots.find((s) => s.id === id)?.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
