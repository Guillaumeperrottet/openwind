"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Activity,
  ArrowLeft,
  Cloud,
  Database,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import {
  useWindOverlay,
  type WindOverlayDetails,
  type WindOverlayProvider,
} from "@/components/map/useWindOverlay";

const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE ||
  "https://tiles.openfreemap.org/styles/liberty";

type ComparisonProvider = Exclude<WindOverlayProvider, "auto">;

type CameraState = {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
};

type NetworkStats = {
  requests: number;
  failedRequests: number;
  responseBytes: number;
};

const EMPTY_NETWORK_STATS: Record<ComparisonProvider, NetworkStats> = {
  openwind_tiles: { requests: 0, failedRequests: 0, responseBytes: 0 },
  openmeteo_spatial: { requests: 0, failedRequests: 0, responseBytes: 0 },
};

function cloneEmptyNetworkStats(): Record<ComparisonProvider, NetworkStats> {
  return {
    openwind_tiles: { ...EMPTY_NETWORK_STATS.openwind_tiles },
    openmeteo_spatial: { ...EMPTY_NETWORK_STATS.openmeteo_spatial },
  };
}

function requestUrl(input: RequestInfo | URL): URL | null {
  try {
    const value =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : input;
    return new URL(value, window.location.origin);
  } catch {
    return null;
  }
}

function requestProvider(url: URL): ComparisonProvider | null {
  if (
    url.hostname === "tiles.openwind.ch" ||
    url.pathname === "/api/wind/tiles/manifest"
  ) {
    return "openwind_tiles";
  }
  if (
    url.hostname === "openmeteo.s3.amazonaws.com" ||
    (url.pathname === "/api/wind/spatial/manifest" &&
      url.searchParams.get("model") === "dwd_icon_eu")
  ) {
    return "openmeteo_spatial";
  }
  return null;
}

function responseBytes(response: Response, method: string): number {
  if (method.toUpperCase() === "HEAD") return 0;
  const value = Number(response.headers.get("content-length"));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "Non exposé";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatValidAt(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-CH", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function useNetworkMonitor() {
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState(cloneEmptyNetworkStats);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const monitoredFetch: typeof window.fetch = async (input, init) => {
      const url = requestUrl(input);
      const provider = url ? requestProvider(url) : null;
      const method =
        init?.method ?? (input instanceof Request ? input.method : "GET");

      try {
        const response = await originalFetch(input, init);
        if (provider) {
          const bytes = responseBytes(response, method);
          setStats((current) => ({
            ...current,
            [provider]: {
              requests: current[provider].requests + 1,
              failedRequests:
                current[provider].failedRequests + (response.ok ? 0 : 1),
              responseBytes: current[provider].responseBytes + bytes,
            },
          }));
        }
        return response;
      } catch (error) {
        if (provider) {
          setStats((current) => ({
            ...current,
            [provider]: {
              ...current[provider],
              requests: current[provider].requests + 1,
              failedRequests: current[provider].failedRequests + 1,
            },
          }));
        }
        throw error;
      }
    };

    window.fetch = monitoredFetch;
    const readyTimer = window.setTimeout(() => setReady(true), 0);
    return () => {
      window.clearTimeout(readyTimer);
      if (window.fetch === monitoredFetch) window.fetch = originalFetch;
    };
  }, []);

  return {
    ready,
    stats,
    reset: () => setStats(cloneEmptyNetworkStats()),
  };
}

export function WindComparisonClient() {
  const mapsRef = useRef<Partial<Record<ComparisonProvider, MapLibreMap>>>({});
  const synchronizingRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);
  const network = useNetworkMonitor();

  const registerMap = useCallback(
    (provider: ComparisonProvider, map: MapLibreMap | null) => {
      if (map) mapsRef.current[provider] = map;
      else delete mapsRef.current[provider];
    },
    [],
  );

  const synchronizeCamera = useCallback(
    (source: ComparisonProvider, camera: CameraState) => {
      if (synchronizingRef.current) return;
      const targetProvider =
        source === "openwind_tiles"
          ? "openmeteo_spatial"
          : "openwind_tiles";
      const target = mapsRef.current[targetProvider];
      if (!target) return;

      synchronizingRef.current = true;
      target.jumpTo(camera);
      synchronizingRef.current = false;
    },
    [],
  );

  const restart = () => {
    network.reset();
    setReloadKey((current) => current + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/wind"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la santé du vent
            </Link>
            <h1 className="text-3xl font-bold text-slate-950">
              Comparateur ICON-EU
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Même carte, même palette Openwind, même interpolation et mêmes
              particules. Seule la chaîne de données change entre nos tuiles R2
              et les fichiers spatiaux officiels Open-Meteo sur AWS S3.
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <RefreshCw className="h-4 w-4" />
            Relancer la comparaison
          </button>
        </div>

        <div className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Outil expérimental réservé aux administrateurs. Il ne modifie pas
            la source utilisée par les visiteurs. Les deux cartes restent
            synchronisées pendant les déplacements et les zooms.
          </p>
        </div>

        {network.ready ? (
          <div className="grid gap-5 xl:grid-cols-2">
            <ComparisonMap
              key={`r2-${reloadKey}`}
              provider="openwind_tiles"
              title="Openwind R2"
              subtitle="Tuiles OWW1 générées et publiées par Openwind"
              icon={Database}
              network={network.stats.openwind_tiles}
              onMapReady={registerMap}
              onCameraChange={synchronizeCamera}
            />
            <ComparisonMap
              key={`s3-${reloadKey}`}
              provider="openmeteo_spatial"
              title="Open-Meteo S3"
              subtitle="Fichier data_spatial ICON-EU lu par weather-map-layer"
              icon={Cloud}
              network={network.stats.openmeteo_spatial}
              onMapReady={registerMap}
              onCameraChange={synchronizeCamera}
            />
          </div>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
          </div>
        )}

        <p className="mt-5 text-center text-xs text-slate-400">
          Le volume indiqué correspond aux tailles HTTP exposées par les
          réponses. Un cache navigateur peut réduire le trafic réellement
          transféré lors des essais suivants.
        </p>
      </div>
    </div>
  );
}

function ComparisonMap({
  provider,
  title,
  subtitle,
  icon: Icon,
  network,
  onMapReady,
  onCameraChange,
}: {
  provider: ComparisonProvider;
  title: string;
  subtitle: string;
  icon: typeof Activity;
  network: NetworkStats;
  onMapReady: (provider: ComparisonProvider, map: MapLibreMap | null) => void;
  onCameraChange: (provider: ComparisonProvider, camera: CameraState) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const wind = useWindOverlay(mapRef, true, mapLoaded, provider);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: [11.5, 49],
      zoom: 4.4,
      attributionControl: false,
    });
    map.fitBounds(
      [
        [-5, 39],
        [26, 58],
      ],
      { padding: 24, duration: 0 },
    );
    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    onMapReady(provider, map);

    const reportCamera = () => {
      const center = map.getCenter();
      onCameraChange(provider, {
        center: [center.lng, center.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    };
    const handleLoad = () => setMapLoaded(true);
    map.on("load", handleLoad);
    map.on("move", reportCamera);

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.off("load", handleLoad);
      map.off("move", reportCamera);
      onMapReady(provider, null);
      mapRef.current = null;
      setTimeout(() => {
        try {
          map.remove();
        } catch {
          // MapLibre can already be disposed during a fast React remount.
        }
      }, 0);
    };
  }, [onCameraChange, onMapReady, provider]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex min-w-0 gap-3">
          <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-950">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <StatusBadge status={wind.status} stale={wind.details?.stale} />
      </div>

      <div className="relative h-[560px] bg-slate-100">
        <div ref={containerRef} className="absolute inset-0" />
        {wind.status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[1px]">
            <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
          </div>
        )}
        {wind.status === "error" && (
          <div className="absolute inset-x-4 top-4 z-10 rounded-lg border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm">
            Cette source n’a pas pu charger le secteur affiché.
          </div>
        )}
        {wind.hoveredWind && (
          <div
            className="pointer-events-none absolute z-20 min-w-36 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
            style={{
              left: wind.hoveredWind.flipX
                ? wind.hoveredWind.x - 150
                : wind.hoveredWind.x + 12,
              top: wind.hoveredWind.flipY
                ? wind.hoveredWind.y - 86
                : wind.hoveredWind.y + 12,
            }}
          >
            <p className="font-semibold text-slate-900">
              {(wind.hoveredWind.speedKmh / 1.852).toFixed(1)} nd
            </p>
            <p className="mt-0.5 text-slate-500">
              Rafales {(wind.hoveredWind.gustsKmh / 1.852).toFixed(1)} nd ·{" "}
              {Math.round(wind.hoveredWind.direction)}°
            </p>
          </div>
        )}
      </div>

      <ComparisonMetrics
        details={wind.details}
        validAt={wind.validAt}
        network={network}
      />
    </section>
  );
}

function StatusBadge({
  status,
  stale,
}: {
  status: "idle" | "loading" | "ready" | "error";
  stale?: boolean;
}) {
  if (status === "ready" && !stale) {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        Prêt
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
        Erreur
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      {stale ? "Ancien" : "Chargement"}
    </span>
  );
}

function ComparisonMetrics({
  details,
  validAt,
  network,
}: {
  details: WindOverlayDetails | null;
  validAt: string | null;
  network: NetworkStats;
}) {
  const metrics = [
    {
      label: "Premier rendu",
      value: details ? `${details.loadDurationMs} ms` : "—",
    },
    {
      label: "Réponses HTTP",
      value: `${network.requests}`,
      warning: network.failedRequests > 0,
    },
    {
      label: "Volume exposé",
      value: formatBytes(network.responseBytes),
    },
    {
      label: "Fluidité mesurée",
      value: details?.performance.measuredFramesPerSecond
        ? `${details.performance.measuredFramesPerSecond} fps`
        : "Mesure en cours",
    },
    {
      label: "Particules",
      value: details
        ? `${details.performance.particleCount} · ${details.performance.tier}`
        : "—",
    },
    {
      label: "Échéance",
      value: formatValidAt(validAt),
    },
  ];

  return (
    <div className="grid grid-cols-2 border-t border-slate-200 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="min-w-0 border-b border-r border-slate-100 px-4 py-3 last:border-r-0"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {metric.label}
          </p>
          <p
            className={`mt-1 truncate text-sm font-semibold ${
              metric.warning ? "text-red-600" : "text-slate-800"
            }`}
            title={metric.value}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}
