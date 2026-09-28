"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import forbiddenZonesData from "./swiss-lakes-forbidden.geojson.json";

type MapLake = {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  status: "restricted" | "forbidden" | "unverified";
};

interface Props {
  selectedLake: MapLake | null;
  onSelectLake: (lakeId: string) => void;
}

type ForbiddenZoneProperties = {
  lakeId: string;
  name: string;
  target: string;
};

const SOURCE_ID = "swiss-lake-forbidden-zones";
const FILL_LAYER_ID = "swiss-lake-forbidden-fill";
const OUTLINE_LAYER_ID = "swiss-lake-forbidden-outline";
const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE ||
  "https://tiles.openfreemap.org/styles/liberty";
const FORBIDDEN_ZONES = forbiddenZonesData as unknown as GeoJSON.FeatureCollection<
  GeoJSON.Polygon,
  ForbiddenZoneProperties
>;

export function SwissLakesRegulationMap({
  selectedLake,
  onSelectLake,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [8.05, 46.92],
        zoom: 6.4,
        minZoom: 5.5,
        maxZoom: 15,
        attributionControl: false,
        cooperativeGestures: true,
      });
    } catch {
      queueMicrotask(() => setMapFailed(true));
      return;
    }

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: FORBIDDEN_ZONES,
      });
      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#dc2626",
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            0.5,
            12,
            0.32,
          ],
        },
      });
      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        filter: ["!=", ["get", "zoneKind"], "island-buffer"],
        paint: {
          "line-color": "#991b1b",
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 1.5, 12, 3],
        },
      });

      map.on("mouseenter", FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", FILL_LAYER_ID, (event) => {
        const lakeId = event.features?.[0]?.properties?.lakeId;
        if (typeof lakeId === "string") onSelectLake(lakeId);
      });

      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectLake]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectedLake) return;
    map.flyTo({
      center: selectedLake.center,
      zoom: selectedLake.zoom,
      duration: 700,
      essential: false,
    });
  }, [mapReady, selectedLake]);

  if (mapFailed) {
    return (
      <div className="flex min-h-80 items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-600">
        La carte n’a pas pu être chargée. Les règles détaillées restent
        disponibles sous la carte.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-slate-100">
      <div
        ref={containerRef}
        role="region"
        aria-label="Carte interactive des interdictions de kitesurf documentées"
        className="h-[360px] w-full sm:h-[460px]"
      />
      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          Chargement de la carte…
        </div>
      )}
      {selectedLake && mapReady && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-5rem)] bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-lg backdrop-blur"
        >
          <span
            className={`mr-2 inline-block h-2 w-2 rounded-full ${
              selectedLake.status === "forbidden"
                ? "bg-red-600"
                : "bg-slate-300"
            }`}
          />
          {selectedLake.name}
        </div>
      )}
    </div>
  );
}
