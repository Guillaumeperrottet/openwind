"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { BitmapLayer, LineLayer } from "@deck.gl/layers";
import {
  meteorologicalWindToVector,
  paddedWindBounds,
  selectWindModel,
  WIND_COLOR_STOPS_KTS,
  windBoundsCoverView,
  windPerformanceSignal,
  windRenderProfile,
  windRuntimeProfile,
  windSpeedColor,
  windVectorToMeteorologicalDirection,
  type WindBounds,
  type WindModelMetadata,
  type WindPerformanceTier,
  type WindPerformanceWindow,
} from "@/lib/windField";
import {
  SPATIAL_WIND_GUST_VARIABLE,
  type SpatialWindManifest,
} from "@/lib/windSpatial";
import {
  loadOpenwindWindTileSet,
  parseOpenwindWindTileManifest,
  sampleOpenwindWindTileSet,
  selectOpenwindWindTileModel,
  type OpenwindWindTileManifest,
  type OpenwindWindTileSet,
} from "@/lib/windTiles";
import type {
  OmProtocolSettings,
  RenderableColorScale,
} from "@openmeteo/weather-map-layer";

const FIELD_REFRESH_MS = 10 * 60 * 1000;
const NATIVE_LOAD_TIMEOUT_MS = 12_000;
const NATIVE_SOURCE_SETTLE_TIMEOUT_MS = 5_000;
const CLIENT_MANIFEST_TIMEOUT_MS = 10_000;
const CLIENT_TILE_TIMEOUT_MS = 12_000;
const CLIENT_FALLBACK_TIMEOUT_MS = 18_000;
const PERFORMANCE_WINDOW_MS = 3_000;
const PERFORMANCE_WARMUP_MS = 3_000;
const NATIVE_WIND_SOURCE_ID = "openwind-native-wind-source";
const NATIVE_GUST_SOURCE_ID = "openwind-native-gust-source";
const NATIVE_WIND_LAYER_ID = "openwind-native-wind-raster";
const NATIVE_GUST_LAYER_ID = "openwind-native-gust-loader";
const WIND_TILE_ATTRIBUTION_SOURCE_ID = "openwind-wind-tile-attribution";

type OmModule = typeof import("@openmeteo/weather-map-layer");

let omModulePromise: Promise<OmModule> | null = null;
let omSettings: OmProtocolSettings | null = null;
let omProtocolRegistered = false;

const nativeWindColorScale: RenderableColorScale = {
  type: "breakpoint",
  unit: "m/s",
  breakpoints: WIND_COLOR_STOPS_KTS.map(({ speed }) => speed * 0.514444),
  colors: WIND_COLOR_STOPS_KTS.map(
    ({ color }) =>
      [color[0], color[1], color[2], 1] as [
        number,
        number,
        number,
        number,
      ],
  ),
};

type WindPoint = {
  lat: number;
  lon: number;
  speed: number;
  direction: number;
  gusts?: number;
};

type TextureResponse = {
  points: WindPoint[];
  bounds: WindBounds;
  step: number;
  sampleSpacingKm: number;
  validAt: string | null;
  model: WindModelMetadata;
  dataSource: "forecast" | "stations";
};

type OverlayDataSource =
  | TextureResponse["dataSource"]
  | "native"
  | "openwind_tiles";
type OverlayStatus = "idle" | "loading" | "ready" | "error";

type VectorPoint = {
  x: number;
  y: number;
  u: number;
  v: number;
  gust: number;
};

type VectorField = {
  bounds: WindBounds;
  width: number;
  height: number;
  u: Float32Array;
  v: Float32Array;
  gust: Float32Array;
};

type WindSample = {
  speedKmh: number;
  gustsKmh: number;
  direction: number;
};

type NativeSampler = {
  gustsLoaded: boolean;
  sample: (longitude: number, latitude: number) => WindSample | null;
};

type Particle = {
  lng: number;
  lat: number;
  tailLng: number;
  tailLat: number;
  age: number;
  lifespan: number;
  speed: number;
  alpha: number;
};

const PERFORMANCE_TIERS: readonly WindPerformanceTier[] = [
  "low",
  "balanced",
  "high",
];

function adjacentPerformanceTier(
  tier: WindPerformanceTier,
  direction: -1 | 1,
): WindPerformanceTier {
  const index = PERFORMANCE_TIERS.indexOf(tier);
  return PERFORMANCE_TIERS[
    Math.min(PERFORMANCE_TIERS.length - 1, Math.max(0, index + direction))
  ];
}

export type WindOverlaySample = WindSample & {
  x: number;
  y: number;
  flipX: boolean;
  flipY: boolean;
  lat: number;
  lon: number;
};

export type WindOverlayDetails = {
  model: WindModelMetadata;
  dataSource: OverlayDataSource;
  sampleSpacingKm: number;
  pointCount: number;
  gustsAvailable: boolean;
  stale: boolean;
  performance: {
    tier: WindPerformanceTier;
    particleCount: number;
    targetFramesPerSecond: number;
    measuredFramesPerSecond: number | null;
  };
};

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchWithDeadline(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const deadlineController = new AbortController();
  const upstreamSignal = init.signal;
  const abortFromUpstream = () => deadlineController.abort();
  if (upstreamSignal?.aborted) abortFromUpstream();
  else upstreamSignal?.addEventListener("abort", abortFromUpstream, {
    once: true,
  });
  const timer = window.setTimeout(() => deadlineController.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: deadlineController.signal });
  } finally {
    window.clearTimeout(timer);
    upstreamSignal?.removeEventListener("abort", abortFromUpstream);
  }
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { signal: AbortSignal },
  options: { timeoutMs: number; attempts: number },
): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      const response = await fetchWithDeadline(input, init, options.timeoutMs);
      const retryable =
        response.status === 408 || response.status >= 500;
      if (!retryable || attempt === options.attempts - 1) return response;
      await response.body?.cancel().catch(() => {});
    } catch (error) {
      if (init.signal.aborted) throw error;
      lastError = error;
      if (attempt === options.attempts - 1) throw error;
    }

    await waitForRetry(300 * 2 ** attempt + Math.random() * 180, init.signal);
  }

  throw lastError ?? new Error("Wind request failed");
}

async function initializeOmProtocol(): Promise<{
  om: OmModule;
  settings: OmProtocolSettings;
}> {
  omModulePromise ??= import("@openmeteo/weather-map-layer");
  const om = await omModulePromise;

  if (!omSettings) {
    omSettings = {
      ...om.defaultOmProtocolSettings,
      fileReaderConfig: {
        ...om.defaultOmProtocolSettings.fileReaderConfig,
        retries: 2,
        eTagValidation: true,
      },
      colorScales: {
        ...om.defaultOmProtocolSettings.colorScales,
        custom: nativeWindColorScale,
      },
    };
  }

  if (!omProtocolRegistered) {
    const settings = omSettings;
    maplibregl.addProtocol("om", async (params, abortController) => {
      // The current Open-Meteo reader can emit unhandled AbortErrors while a
      // shared range read is cancelled by one of many obsolete MapLibre tiles.
      // Let the shared read finish and rely on MapLibre to discard its response;
      // the reader deduplicates and caches that work for the replacement view.
      const readController = new AbortController();
      try {
        return await om.omProtocol(params, readController, settings);
      } catch (error) {
        // MapLibre legitimately aborts obsolete tiles during pans and model
        // switches. Treat those cancellations as empty responses instead of
        // surfacing noisy runtime errors to the application.
        if (
          abortController.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return { data: null };
        }
        throw error;
      }
    });
    omProtocolRegistered = true;
  }

  return { om, settings: omSettings };
}

function interpolateVector(
  points: VectorPoint[],
  x: number,
  y: number,
): { u: number; v: number; gust: number } {
  let sumWeight = 0;
  let sumU = 0;
  let sumV = 0;
  let sumGust = 0;

  for (const point of points) {
    const dx = x - point.x;
    const dy = y - point.y;
    const squaredDistance = dx * dx + dy * dy;
    if (squaredDistance < 0.0001) {
      return { u: point.u, v: point.v, gust: point.gust };
    }
    const weight = 1 / squaredDistance;
    sumU += weight * point.u;
    sumV += weight * point.v;
    sumGust += weight * point.gust;
    sumWeight += weight;
  }

  return sumWeight > 0
    ? {
        u: sumU / sumWeight,
        v: sumV / sumWeight,
        gust: sumGust / sumWeight,
      }
    : { u: 0, v: 0, gust: 0 };
}

function buildFallbackVectorField(
  points: WindPoint[],
  bounds: WindBounds,
  width: number,
  height: number,
): VectorField {
  const [west, south, east, north] = bounds;
  const vectors = points.map((point) => {
    const { u, v } = meteorologicalWindToVector(
      point.speed,
      point.direction,
    );
    return {
      x: ((point.lon - west) / (east - west)) * (width - 1),
      y: ((north - point.lat) / (north - south)) * (height - 1),
      u,
      v,
      gust: Math.max(point.speed, point.gusts ?? point.speed),
    };
  });
  const u = new Float32Array(width * height);
  const v = new Float32Array(width * height);
  const gust = new Float32Array(width * height);

  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const vector = interpolateVector(vectors, column, row);
      const index = row * width + column;
      u[index] = vector.u;
      v[index] = vector.v;
      gust[index] = vector.gust;
    }
  }

  return { bounds, width, height, u, v, gust };
}

function buildNativeVectorField(
  sampler: NativeSampler,
  bounds: WindBounds,
  width: number,
  height: number,
): VectorField {
  const [west, south, east, north] = bounds;
  const u = new Float32Array(width * height);
  const v = new Float32Array(width * height);
  const gust = new Float32Array(width * height);

  for (let row = 0; row < height; row++) {
    const latitude = north - ((north - south) * row) / (height - 1);
    for (let column = 0; column < width; column++) {
      const longitude = west + ((east - west) * column) / (width - 1);
      const wind = sampler.sample(longitude, latitude);
      const index = row * width + column;
      if (!wind) {
        u[index] = Number.NaN;
        v[index] = Number.NaN;
        gust[index] = Number.NaN;
        continue;
      }
      const vector = meteorologicalWindToVector(
        wind.speedKmh,
        wind.direction,
      );
      u[index] = vector.u;
      v[index] = vector.v;
      gust[index] = wind.gustsKmh;
    }
  }

  return { bounds, width, height, u, v, gust };
}

function sampleWindField(
  field: VectorField,
  longitude: number,
  latitude: number,
): { u: number; v: number; gust: number } | null {
  const [west, south, east, north] = field.bounds;
  if (
    longitude < west ||
    longitude > east ||
    latitude < south ||
    latitude > north
  )
    return null;

  const x = ((longitude - west) / (east - west)) * (field.width - 1);
  const y = ((north - latitude) / (north - south)) * (field.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(field.width - 1, x0 + 1);
  const y1 = Math.min(field.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const index00 = y0 * field.width + x0;
  const index10 = y0 * field.width + x1;
  const index01 = y1 * field.width + x0;
  const index11 = y1 * field.width + x1;
  const interpolate = (values: Float32Array) =>
    values[index00] * (1 - tx) * (1 - ty) +
    values[index10] * tx * (1 - ty) +
    values[index01] * (1 - tx) * ty +
    values[index11] * tx * ty;
  const sampled = {
    u: interpolate(field.u),
    v: interpolate(field.v),
    gust: interpolate(field.gust),
  };

  return Object.values(sampled).every(Number.isFinite) ? sampled : null;
}

function buildRasterCanvas(field: VectorField): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = field.width;
  canvas.height = field.height;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const image = context.createImageData(field.width, field.height);
  for (let index = 0; index < field.u.length; index++) {
    const speed = Math.hypot(field.u[index], field.v[index]);
    if (!Number.isFinite(speed)) {
      image.data[index * 4 + 3] = 0;
      continue;
    }
    const alpha = Math.round(105 + Math.min(1, speed / 65) * 85);
    const color = windSpeedColor(speed, alpha);
    const pixel = index * 4;
    image.data[pixel] = color[0];
    image.data[pixel + 1] = color[1];
    image.data[pixel + 2] = color[2];
    image.data[pixel + 3] = color[3];
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function currentViewBounds(map: maplibregl.Map): WindBounds {
  const bounds = map.getBounds();
  return [
    Math.max(-180, bounds.getWest()),
    Math.max(-80, bounds.getSouth()),
    Math.min(180, bounds.getEast()),
    Math.min(80, bounds.getNorth()),
  ];
}

function resetParticle(
  particle: Particle,
  field: VectorField,
  map: maplibregl.Map,
  randomAge: boolean,
) {
  const view = currentViewBounds(map);
  const west = Math.max(field.bounds[0], view[0]);
  const south = Math.max(field.bounds[1], view[1]);
  const east = Math.min(field.bounds[2], view[2]);
  const north = Math.min(field.bounds[3], view[3]);
  const spawnBounds =
    west < east && south < north
      ? ([west, south, east, north] as WindBounds)
      : field.bounds;

  particle.lng =
    spawnBounds[0] + Math.random() * (spawnBounds[2] - spawnBounds[0]);
  particle.lat =
    spawnBounds[1] + Math.random() * (spawnBounds[3] - spawnBounds[1]);
  particle.tailLng = particle.lng;
  particle.tailLat = particle.lat;
  particle.lifespan = 1.8 + Math.random() * 2.8;
  particle.age = randomAge ? Math.random() * particle.lifespan : 0;
  particle.speed = 0;
  particle.alpha = 0;
}

function createParticles(
  count: number,
  field: VectorField,
  map: maplibregl.Map,
): Particle[] {
  return Array.from({ length: count }, () => {
    const particle: Particle = {
      lng: 0,
      lat: 0,
      tailLng: 0,
      tailLat: 0,
      age: 0,
      lifespan: 1,
      speed: 0,
      alpha: 0,
    };
    resetParticle(particle, field, map, true);
    return particle;
  });
}

function particleColor(particle: Particle): [number, number, number, number] {
  const [red, green, blue] = windSpeedColor(particle.speed);
  const luminance =
    (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance < 0.42
    ? [255, 255, 255, particle.alpha]
    : [15, 23, 42, particle.alpha];
}

function particleHaloColor(
  particle: Particle,
): [number, number, number, number] {
  const [red] = particleColor(particle);
  return red === 255
    ? [15, 23, 42, Math.round(particle.alpha * 0.38)]
    : [255, 255, 255, Math.round(particle.alpha * 0.3)];
}

function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function createNativeSampler(
  om: OmModule,
  settings: OmProtocolSettings,
  fileUrl: string,
  gustsAvailable: boolean,
): NativeSampler | null {
  const instance = om.getProtocolInstance(settings);
  const states = [...instance.stateByKey.values()];
  const speedState = states.find(
    (state) =>
      state.omFileUrl === fileUrl &&
      state.dataOptions.variable === "wind_u_component_10m",
  );
  if (!speedState?.data?.values || !speedState.data.directions) return null;

  const speedGrid = om.GridFactory.create(
    speedState.dataOptions.domain.grid,
    speedState.ranges,
  );
  const speedValues = speedState.data.values;
  const directions = speedState.data.directions;
  const eastwardValues = new Float32Array(speedValues.length);
  const northwardValues = new Float32Array(speedValues.length);
  for (let index = 0; index < speedValues.length; index++) {
    const radians = (directions[index] * Math.PI) / 180;
    eastwardValues[index] = -speedValues[index] * Math.sin(radians);
    northwardValues[index] = -speedValues[index] * Math.cos(radians);
  }
  const gustState = gustsAvailable
    ? states.find(
        (state) =>
          state.omFileUrl === fileUrl &&
          state.dataOptions.variable === SPATIAL_WIND_GUST_VARIABLE,
      )
    : undefined;
  const gustGrid = gustState?.data?.values
    ? om.GridFactory.create(
        gustState.dataOptions.domain.grid,
        gustState.ranges,
      )
    : null;
  const gustValues = gustState?.data?.values ?? null;

  return {
    gustsLoaded: Boolean(gustGrid && gustValues),
    sample(longitude, latitude) {
      const normalizedLongitude = normalizeLongitude(longitude);
      const eastwardMps = speedGrid.getInterpolatedValue(
        eastwardValues,
        latitude,
        normalizedLongitude,
        "linear",
      );
      const northwardMps = speedGrid.getInterpolatedValue(
        northwardValues,
        latitude,
        normalizedLongitude,
        "linear",
      );
      if (!Number.isFinite(eastwardMps) || !Number.isFinite(northwardMps))
        return null;

      const speedMps = Math.hypot(eastwardMps, northwardMps);
      const speedKmh = Math.max(0, speedMps * 3.6);
      const direction = windVectorToMeteorologicalDirection(
        eastwardMps,
        northwardMps,
      );
      const sampledGustMps =
        gustGrid && gustValues
          ? gustGrid.getInterpolatedValue(
              gustValues,
              latitude,
              normalizedLongitude,
              "linear",
            )
          : speedMps;

      return {
        speedKmh,
        direction,
        gustsKmh: Math.max(
          speedKmh,
          Number.isFinite(sampledGustMps) ? sampledGustMps * 3.6 : speedKmh,
        ),
      };
    },
  };
}

function createOpenwindTileSampler(tileSet: OpenwindWindTileSet): NativeSampler {
  return {
    gustsLoaded: tileSet.manifest.gustsAvailable,
    sample(longitude, latitude) {
      const vector = sampleOpenwindWindTileSet(tileSet, longitude, latitude);
      if (!vector) return null;
      const speedKmh = Math.hypot(vector.uMps, vector.vMps) * 3.6;
      return {
        speedKmh,
        direction: windVectorToMeteorologicalDirection(
          vector.uMps,
          vector.vMps,
        ),
        gustsKmh: Math.max(speedKmh, vector.gustMps * 3.6),
      };
    },
  };
}

function escapeAttribution(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function addWindTileAttribution(
  map: maplibregl.Map,
  attribution: OpenwindWindTileManifest["attribution"],
) {
  map.addSource(WIND_TILE_ATTRIBUTION_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    attribution: `Weather data: <a href="${escapeAttribution(attribution.url)}" target="_blank" rel="noopener">${escapeAttribution(attribution.name)}</a>`,
  });
}

function sourceLayerInsertionPoint(map: maplibregl.Map): string | undefined {
  const preferredLayers = ["spots-halo", "spots-circle", "stations-circle"];
  for (const layerId of preferredLayers) {
    if (map.getLayer(layerId)) return layerId;
  }
  return map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
}

function removeNativeLayers(map: maplibregl.Map) {
  // React refreshes and route transitions can dispose the map before passive
  // effect cleanup runs. MapLibre throws when queried after its style is gone.
  try {
    if (!map.getStyle()) return;
    if (map.getLayer(NATIVE_GUST_LAYER_ID))
      map.removeLayer(NATIVE_GUST_LAYER_ID);
    if (map.getLayer(NATIVE_WIND_LAYER_ID))
      map.removeLayer(NATIVE_WIND_LAYER_ID);
    if (map.getSource(NATIVE_GUST_SOURCE_ID))
      map.removeSource(NATIVE_GUST_SOURCE_ID);
    if (map.getSource(NATIVE_WIND_SOURCE_ID))
      map.removeSource(NATIVE_WIND_SOURCE_ID);
    if (map.getSource(WIND_TILE_ATTRIBUTION_SOURCE_ID))
      map.removeSource(WIND_TILE_ATTRIBUTION_SOURCE_ID);
  } catch {
    // The owning Map instance is already gone; there is nothing left to clean.
  }
}

export function useWindOverlay(
  mapRef: React.RefObject<maplibregl.Map | null>,
  showWindOverlay: boolean,
  mapLoaded: boolean,
) {
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [status, setStatus] = useState<OverlayStatus>("idle");
  const [validAt, setValidAt] = useState<string | null>(null);
  const [details, setDetails] = useState<WindOverlayDetails | null>(null);
  const [hoveredWind, setHoveredWind] = useState<WindOverlaySample | null>(
    null,
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map) return;
    const activeMap: maplibregl.Map = map;

    if (!showWindOverlay) {
      removeNativeLayers(map);
      if (overlayRef.current) {
        map.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
    map.addControl(overlay);
    overlayRef.current = overlay;

    let alive = true;
    let hasField = false;
    let currentField: VectorField | null = null;
    let nativeSampler: NativeSampler | null = null;
    let fallbackRasterLayer: BitmapLayer | null = null;
    let activeManifest: SpatialWindManifest | null = null;
    let activeModelId: WindModelMetadata["id"] | null = null;
    let activeOmModule: OmModule | null = null;
    let activeOmSettings: OmProtocolSettings | null = null;
    let fetchAbort: AbortController | null = null;
    let refetchTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let nativePollTimer: ReturnType<typeof setTimeout> | null = null;
    let nativeTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let animationFrame: number | null = null;
    let hoverFrame: number | null = null;
    let loadedBounds: WindBounds | null = null;
    let requestedBounds: WindBounds | null = null;
    let loadGeneration = 0;
    let activatedGeneration = -1;
    let activatedWithGusts = false;
    let retryAttempt = 0;
    let windTileProviderDisabled = false;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const currentRenderProfile = () => {
      const canvas = map.getCanvas();
      return windRenderProfile(canvas.clientWidth, canvas.clientHeight, {
        mobile: window.innerWidth < 768,
        reducedMotion: reducedMotionQuery.matches,
        hardwareConcurrency: navigator.hardwareConcurrency,
      });
    };

    const clearLoadTimers = () => {
      if (nativePollTimer) clearTimeout(nativePollTimer);
      if (nativeTimeoutTimer) clearTimeout(nativeTimeoutTimer);
      nativePollTimer = null;
      nativeTimeoutTimer = null;
    };

    const waitForNativeSourcesToSettle = async (generation: number) => {
      const deadline = Date.now() + NATIVE_SOURCE_SETTLE_TIMEOUT_MS;
      const sourceIds = [NATIVE_WIND_SOURCE_ID, NATIVE_GUST_SOURCE_ID];

      while (alive && generation === loadGeneration) {
        const settled = sourceIds.every((sourceId) => {
          if (!map.getSource(sourceId)) return true;
          try {
            return map.isSourceLoaded(sourceId);
          } catch {
            return true;
          }
        });
        if (settled || Date.now() >= deadline) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return false;
    };

    const startAnimation = (field: VectorField) => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);

      const canvas = map.getCanvas();
      const baseProfile = currentRenderProfile();
      const particles = createParticles(baseProfile.particleCount, field, map);
      const profiles = Object.fromEntries(
        PERFORMANCE_TIERS.map((tier) => [
          tier,
          windRuntimeProfile(baseProfile, tier),
        ]),
      ) as Record<WindPerformanceTier, ReturnType<typeof windRuntimeProfile>>;
      // Every tier owns two stable arrays. Deck.gl sees a data revision while
      // animation frames themselves remain allocation-free.
      const renderBuffers = Object.fromEntries(
        PERFORMANCE_TIERS.map((tier) => {
          const count = profiles[tier].particleCount;
          return [tier, [particles.slice(0, count), particles.slice(0, count)]];
        }),
      ) as Record<WindPerformanceTier, [Particle[], Particle[]]>;

      let activeProfile = profiles.high;
      let previousFrame = 0;
      let previousRaf = 0;
      let nextRenderAt = 0;
      let renderBufferIndex = 0;
      let performanceStartedAt = 0;
      let rafFrames = 0;
      let renderedFrames = 0;
      let renderWorkMs = 0;
      let maxRafGapMs = 0;
      let slowWindows = 0;
      let healthyWindows = 0;
      let warmupUntil = performance.now() + PERFORMANCE_WARMUP_MS;

      const resetPerformanceWindow = (time: number) => {
        performanceStartedAt = time;
        rafFrames = 0;
        renderedFrames = 0;
        renderWorkMs = 0;
        maxRafGapMs = 0;
      };

      const publishPerformance = (measuredFramesPerSecond: number | null) => {
        setDetails((current) =>
          current
            ? {
                ...current,
                performance: {
                  tier: activeProfile.tier,
                  particleCount: activeProfile.particleCount,
                  targetFramesPerSecond: activeProfile.framesPerSecond,
                  measuredFramesPerSecond,
                },
              }
            : current,
        );
      };

      const evaluatePerformance = (time: number) => {
        if (
          time < warmupUntil ||
          performanceStartedAt === 0 ||
          time - performanceStartedAt < PERFORMANCE_WINDOW_MS
        ) {
          return;
        }

        const sample: WindPerformanceWindow = {
          durationMs: time - performanceStartedAt,
          rafFrames,
          renderedFrames,
          renderWorkMs,
          maxRafGapMs,
          targetFramesPerSecond: activeProfile.framesPerSecond,
        };
        const signal = windPerformanceSignal(sample);
        slowWindows = signal === "degrade" ? slowWindows + 1 : 0;
        healthyWindows = signal === "recover" ? healthyWindows + 1 : 0;

        let nextTier = activeProfile.tier;
        if (slowWindows >= 2) {
          nextTier = adjacentPerformanceTier(activeProfile.tier, -1);
          slowWindows = 0;
          healthyWindows = 0;
        } else if (healthyWindows >= 5) {
          nextTier = adjacentPerformanceTier(activeProfile.tier, 1);
          slowWindows = 0;
          healthyWindows = 0;
        }

        const measuredFramesPerSecond =
          (renderedFrames * 1000) / sample.durationMs;
        if (nextTier !== activeProfile.tier) {
          activeProfile = profiles[nextTier];
          previousFrame = 0;
          nextRenderAt = time;
          // Give the new budget time to settle before judging it.
          warmupUntil = time + PERFORMANCE_WARMUP_MS;
        }
        publishPerformance(Number(measuredFramesPerSecond.toFixed(1)));
        resetPerformanceWindow(time);
      };

      const animate = (time: number) => {
        if (!alive || !overlayRef.current) return;
        animationFrame = requestAnimationFrame(animate);
        if (document.hidden) {
          previousFrame = 0;
          previousRaf = 0;
          nextRenderAt = 0;
          resetPerformanceWindow(0);
          return;
        }

        if (time >= warmupUntil) {
          if (performanceStartedAt === 0) resetPerformanceWindow(time);
          rafFrames += 1;
          if (previousRaf > 0) {
            maxRafGapMs = Math.max(maxRafGapMs, time - previousRaf);
          }
        }
        previousRaf = time;

        const targetFrameMs = 1000 / activeProfile.framesPerSecond;
        if (nextRenderAt === 0) nextRenderAt = time;
        if (time + 0.5 < nextRenderAt) {
          evaluatePerformance(time);
          return;
        }

        const elapsed = previousFrame ? time - previousFrame : targetFrameMs;
        previousFrame = time;
        do nextRenderAt += targetFrameMs;
        while (nextRenderAt <= time);

        const integrationMs = Math.min(targetFrameMs * 2, elapsed);
        const frameScale = integrationMs / targetFrameMs;
        const movementScale =
          (baseProfile.movementPerSecond * integrationMs) / 1000;
        const view = currentViewBounds(map);
        const degreesPerPixelX =
          (view[2] - view[0]) / Math.max(1, canvas.clientWidth);
        const degreesPerPixelY =
          (view[3] - view[1]) / Math.max(1, canvas.clientHeight);
        renderBufferIndex = 1 - renderBufferIndex;
        const renderData =
          renderBuffers[activeProfile.tier][renderBufferIndex];
        const workStartedAt = performance.now();

        for (const particle of renderData) {
          const vector = sampleWindField(field, particle.lng, particle.lat);
          const outsideView =
            particle.lng < view[0] ||
            particle.lng > view[2] ||
            particle.lat < view[1] ||
            particle.lat > view[3];
          if (!vector || outsideView || particle.age >= particle.lifespan) {
            resetParticle(particle, field, map, false);
            continue;
          }

          const speed = Math.hypot(vector.u, vector.v);
          if (speed < 0.35) {
            resetParticle(particle, field, map, false);
            continue;
          }

          // Midpoint (RK2) integration follows curved flow better than a
          // single Euler step, especially around Alpine valleys and fronts.
          const longitudeStep = degreesPerPixelX * movementScale;
          const latitudeStep = degreesPerPixelY * movementScale;
          const midpoint = sampleWindField(
            field,
            particle.lng + vector.u * longitudeStep * 0.5,
            particle.lat + vector.v * latitudeStep * 0.5,
          );
          const flow = midpoint ?? vector;
          const tailCatchup = 1 - Math.pow(0.84, frameScale);
          particle.tailLng +=
            (particle.lng - particle.tailLng) * tailCatchup;
          particle.tailLat +=
            (particle.lat - particle.tailLat) * tailCatchup;
          particle.lng += flow.u * longitudeStep;
          particle.lat += flow.v * latitudeStep;
          particle.age += integrationMs / 1000;
          particle.speed = Math.hypot(flow.u, flow.v);
          const life = particle.age / particle.lifespan;
          const fadeIn = Math.min(1, particle.age / 0.18);
          const fadeOut = Math.min(
            1,
            Math.max(0, particle.lifespan - particle.age) / 0.32,
          );
          particle.alpha = Math.round(
            205 * Math.min(1, Math.sin(Math.PI * life) * 2.4) * fadeIn * fadeOut,
          );
        }

        const particleHaloLayer = new LineLayer<Particle>({
          id: "wind-particles-halo",
          data: renderData,
          getSourcePosition: (particle) => [
            particle.tailLng,
            particle.tailLat,
          ],
          getTargetPosition: (particle) => [particle.lng, particle.lat],
          getColor: particleHaloColor,
          getWidth: (particle) =>
            1.7 + Math.min(0.8, particle.speed / 70),
          widthUnits: "pixels",
          widthMinPixels: 1.7,
          opacity: 0.8,
          pickable: false,
        });
        const particleLayer = new LineLayer<Particle>({
          id: "wind-particles",
          data: renderData,
          getSourcePosition: (particle) => [
            particle.tailLng,
            particle.tailLat,
          ],
          getTargetPosition: (particle) => [particle.lng, particle.lat],
          getColor: particleColor,
          getWidth: (particle) =>
            0.7 + Math.min(0.75, particle.speed / 65),
          widthUnits: "pixels",
          widthMinPixels: 0.7,
          opacity: 0.96,
          pickable: false,
        });

        overlayRef.current.setProps({
          layers: fallbackRasterLayer
            ? [fallbackRasterLayer, particleHaloLayer, particleLayer]
            : [particleHaloLayer, particleLayer],
        });
        if (time >= warmupUntil) {
          renderedFrames += 1;
          renderWorkMs += performance.now() - workStartedAt;
        }
        evaluatePerformance(time);
      };

      animationFrame = requestAnimationFrame(animate);
      return activeProfile;
    };

    const activateNativeField = (generation = loadGeneration) => {
      if (
        !alive ||
        generation !== loadGeneration ||
        !activeManifest ||
        !activeOmModule ||
        !activeOmSettings ||
        !requestedBounds
      )
        return false;

      const sampler = createNativeSampler(
        activeOmModule,
        activeOmSettings,
        activeManifest.fileUrl,
        activeManifest.gustsAvailable,
      );
      if (!sampler) return false;

      // Source events can fire repeatedly while MapLibre settles its tile set.
      // Rebuild once for wind, then at most once more when the optional gust
      // grid becomes available.
      if (
        activatedGeneration === generation &&
        (activatedWithGusts || !sampler.gustsLoaded)
      ) {
        return true;
      }

      const profile = currentRenderProfile();
      const field = buildNativeVectorField(
        sampler,
        requestedBounds,
        profile.fieldWidth,
        profile.fieldHeight,
      );
      const centerSample = sampler.sample(
        (requestedBounds[0] + requestedBounds[2]) / 2,
        (requestedBounds[1] + requestedBounds[3]) / 2,
      );
      if (!centerSample) return false;

      clearLoadTimers();
      nativeSampler = sampler;
      currentField = field;
      fallbackRasterLayer = null;
      loadedBounds = requestedBounds;
      activeModelId = activeManifest.model.id;
      hasField = true;
      activatedGeneration = generation;
      activatedWithGusts = sampler.gustsLoaded;
      const animationProfile = startAnimation(field);
      setValidAt(activeManifest.validAt);
      setDetails({
        model: activeManifest.model,
        dataSource: "native",
        sampleSpacingKm: activeManifest.model.resolutionKm ?? 13,
        pointCount: field.width * field.height,
        gustsAvailable: sampler.gustsLoaded,
        stale: activeManifest.stale,
        performance: {
          tier: animationProfile.tier,
          particleCount: animationProfile.particleCount,
          targetFramesPerSecond: animationProfile.framesPerSecond,
          measuredFramesPerSecond: null,
        },
      });
      setStatus("ready");
      retryAttempt = 0;
      return true;
    };

    const pollNativeField = (generation: number) => {
      if (
        !alive ||
        generation !== loadGeneration ||
        activateNativeField(generation)
      )
        return;
      nativePollTimer = setTimeout(() => pollNativeField(generation), 180);
    };

    const scheduleRetry = (minimumDelayMs = 0) => {
      if (!alive) return;
      if (refetchTimer) clearTimeout(refetchTimer);
      const exponentialDelay = Math.min(60_000, 4_000 * 2 ** retryAttempt);
      retryAttempt = Math.min(retryAttempt + 1, 4);
      const delay = navigator.onLine
        ? Math.max(minimumDelayMs, exponentialDelay) + Math.random() * 1_000
        : 30_000;
      refetchTimer = setTimeout(loadNativeWind, delay);
    };

    const loadFallback = async (generation: number) => {
      if (
        !alive ||
        generation !== loadGeneration ||
        !requestedBounds ||
        !fetchAbort
      )
        return;
      const boundsString = requestedBounds
        .map((value) => value.toFixed(2))
        .join(",");
      let retryAfterMs = 0;

      try {
        const response = await fetchWithRetry(
          `/api/wind/texture?bounds=${boundsString}`,
          { signal: fetchAbort.signal },
          { timeoutMs: CLIENT_FALLBACK_TIMEOUT_MS, attempts: 2 },
        );
        if (!response.ok) {
          if (response.status === 429) {
            const retryAfterSeconds = Number(response.headers.get("Retry-After"));
            if (Number.isFinite(retryAfterSeconds)) {
              retryAfterMs = Math.max(0, retryAfterSeconds * 1000);
            }
          }
          throw new Error(`Fallback returned ${response.status}`);
        }
        const data = (await response.json()) as TextureResponse;
        if (
          !alive ||
          generation !== loadGeneration ||
          data.points.length < 4 ||
          !overlayRef.current
        )
          return;

        const profile = currentRenderProfile();
        const field = buildFallbackVectorField(
          data.points,
          data.bounds,
          profile.fieldWidth,
          profile.fieldHeight,
        );
        nativeSampler = null;
        currentField = field;
        fallbackRasterLayer = new BitmapLayer({
          id: "wind-speed-raster-fallback",
          image: buildRasterCanvas(field),
          bounds: data.bounds,
          opacity: 0.82,
          pickable: false,
        });
        removeNativeLayers(map);
        const animationProfile = startAnimation(field);
        hasField = true;
        loadedBounds = data.bounds;
        activeModelId = data.model.id;
        setValidAt(data.validAt);
        setDetails({
          model: data.model,
          dataSource: data.dataSource,
          sampleSpacingKm: data.sampleSpacingKm,
          pointCount: data.points.length,
          gustsAvailable: data.points.some((point) =>
            Number.isFinite(point.gusts),
          ),
          stale: false,
          performance: {
            tier: animationProfile.tier,
            particleCount: animationProfile.particleCount,
            targetFramesPerSecond: animationProfile.framesPerSecond,
            measuredFramesPerSecond: null,
          },
        });
        setStatus("ready");
        retryAttempt = 0;
      } catch {
        if (fetchAbort.signal.aborted) return;
        if (!hasField) setStatus("error");
        else {
          setDetails((current) =>
            current ? { ...current, stale: true } : current,
          );
        }
        scheduleRetry(retryAfterMs);
      }
    };

    const loadOpenwindTileWind = async (
      modelId: "dwd_icon_eu",
      bounds: WindBounds,
      generation: number,
    ): Promise<boolean> => {
      if (
        windTileProviderDisabled ||
        !alive ||
        generation !== loadGeneration ||
        !fetchAbort
      ) {
        return false;
      }

      const manifestResponse = await fetchWithRetry(
        `/api/wind/tiles/manifest?model=${modelId}`,
        { signal: fetchAbort.signal },
        { timeoutMs: CLIENT_MANIFEST_TIMEOUT_MS, attempts: 2 },
      );
      if (manifestResponse.status === 404) {
        windTileProviderDisabled = true;
        return false;
      }
      if (!manifestResponse.ok) {
        throw new Error(`Wind tile manifest returned ${manifestResponse.status}`);
      }

      const manifest = parseOpenwindWindTileManifest(
        (await manifestResponse.json()) as unknown,
      );
      const tileSet = await loadOpenwindWindTileSet(manifest, bounds, {
        signal: fetchAbort.signal,
        concurrency: 6,
        fetcher: (input, init) =>
          fetchWithRetry(
            input,
            { ...init, signal: fetchAbort!.signal },
            { timeoutMs: CLIENT_TILE_TIMEOUT_MS, attempts: 2 },
          ),
      });
      if (
        !alive ||
        generation !== loadGeneration ||
        !overlayRef.current ||
        fetchAbort.signal.aborted
      ) {
        return false;
      }

      const sampler = createOpenwindTileSampler(tileSet);
      const centerSample = sampler.sample(
        (bounds[0] + bounds[2]) / 2,
        (bounds[1] + bounds[3]) / 2,
      );
      if (!centerSample) throw new Error("Wind tile field has no center sample");

      const profile = currentRenderProfile();
      const field = buildNativeVectorField(
        sampler,
        bounds,
        profile.fieldWidth,
        profile.fieldHeight,
      );
      removeNativeLayers(map);
      addWindTileAttribution(map, manifest.attribution);
      clearLoadTimers();
      activeManifest = null;
      activeOmModule = null;
      activeOmSettings = null;
      nativeSampler = sampler;
      currentField = field;
      fallbackRasterLayer = new BitmapLayer({
        id: "wind-speed-raster-openwind-tiles",
        image: buildRasterCanvas(field),
        bounds,
        opacity: 0.82,
        pickable: false,
      });
      loadedBounds = bounds;
      activeModelId = manifest.model.id;
      hasField = true;
      const animationProfile = startAnimation(field);
      const sourcePointCount = [...tileSet.tiles.values()].reduce(
        (total, tile) => total + tile.width * tile.height,
        0,
      );
      setValidAt(manifest.validAt);
      setDetails({
        model: manifest.model,
        dataSource: "openwind_tiles",
        sampleSpacingKm: manifest.model.resolutionKm,
        pointCount: sourcePointCount,
        gustsAvailable: manifest.gustsAvailable,
        stale: manifest.stale,
        performance: {
          tier: animationProfile.tier,
          particleCount: animationProfile.particleCount,
          targetFramesPerSecond: animationProfile.framesPerSecond,
          measuredFramesPerSecond: null,
        },
      });
      setStatus("ready");
      retryAttempt = 0;
      return true;
    };

    const installNativeSources = async (
      om: OmModule,
      manifest: SpatialWindManifest,
      bounds: WindBounds,
      generation: number,
    ) => {
      // A large search jump can start obsolete tiles just before moveend.
      // Let those shared reads settle before removing their source so their
      // workers complete normally and the next model starts from a clean state.
      if (!(await waitForNativeSourcesToSettle(generation))) return false;
      removeNativeLayers(map);
      om.updateCurrentBounds(bounds);

      // Interpolate the numerical wind field, then apply Openwind's exact
      // discrete color bands. Blending colors would invent intermediate hues
      // that do not exist anywhere else in the application.
      const baseParams = "tile_size=256&interpolation=linear&color_blend=false";
      const windUrl = `om://${manifest.fileUrl}?variable=wind_u_component_10m&${baseParams}`;
      const gustUrl = `om://${manifest.fileUrl}?variable=${SPATIAL_WIND_GUST_VARIABLE}&${baseParams}`;
      const beforeId = sourceLayerInsertionPoint(map);

      map.addSource(NATIVE_WIND_SOURCE_ID, {
        type: "raster",
        url: windUrl,
        tileSize: 256,
        maxzoom: 12,
        attribution:
          'Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a>',
      });
      map.addLayer(
        {
          id: NATIVE_WIND_LAYER_ID,
          type: "raster",
          source: NATIVE_WIND_SOURCE_ID,
          paint: {
            "raster-opacity": 0.82,
            "raster-fade-duration": 180,
            "raster-resampling": "linear",
          },
        },
        beforeId,
      );

      if (manifest.gustsAvailable) {
        map.addSource(NATIVE_GUST_SOURCE_ID, {
          type: "raster",
          url: gustUrl,
          tileSize: 256,
          maxzoom: 12,
          attribution:
            'Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a>',
        });
        map.addLayer(
          {
            id: NATIVE_GUST_LAYER_ID,
            type: "raster",
            source: NATIVE_GUST_SOURCE_ID,
            // A strictly zero-opacity raster may be culled before the protocol
            // has populated its in-memory grid. Keep it imperceptibly visible
            // so hover sampling can use real native gust values.
            paint: { "raster-opacity": 0.0001 },
          },
          beforeId,
        );
      }

      pollNativeField(generation);
      nativeTimeoutTimer = setTimeout(() => {
        if (
          generation === loadGeneration &&
          activatedGeneration !== generation
        ) {
          void loadFallback(generation);
        }
      }, NATIVE_LOAD_TIMEOUT_MS);
      return true;
    };

    async function loadNativeWind() {
      if (!alive) return;
      const generation = ++loadGeneration;
      activatedGeneration = -1;
      activatedWithGusts = false;
      clearLoadTimers();
      if (fetchAbort) fetchAbort.abort();
      if (refreshTimer) clearTimeout(refreshTimer);
      if (refetchTimer) clearTimeout(refetchTimer);
      fetchAbort = new AbortController();
      requestedBounds = paddedWindBounds(currentViewBounds(activeMap));
      const model = selectWindModel(requestedBounds);
      if (!hasField) setStatus("loading");

      const tileModel =
        model.id === "gfs_global"
          ? selectOpenwindWindTileModel(requestedBounds)
          : null;
      if (tileModel && !windTileProviderDisabled) {
        try {
          if (
            await loadOpenwindTileWind(tileModel, requestedBounds, generation)
          ) {
            refreshTimer = setTimeout(loadNativeWind, FIELD_REFRESH_MS);
            return;
          }
        } catch {
          if (fetchAbort.signal.aborted) return;
          // The independent feed is still a staged provider. Keep the current
          // Open-Meteo path as a seamless fallback until production storage is
          // provisioned and the scheduled publisher is continuously healthy.
        }
      }

      try {
        const [{ om, settings }, response] = await Promise.all([
          initializeOmProtocol(),
          fetchWithRetry(
            `/api/wind/spatial/manifest?model=${model.id}`,
            { signal: fetchAbort.signal },
            { timeoutMs: CLIENT_MANIFEST_TIMEOUT_MS, attempts: 2 },
          ),
        ]);
        if (!response.ok) {
          throw new Error(`Manifest returned ${response.status}`);
        }
        const manifest = (await response.json()) as SpatialWindManifest;
        if (!alive || generation !== loadGeneration) return;

        activeManifest = manifest;
        activeOmModule = om;
        activeOmSettings = settings;
        nativeSampler = null;
        if (
          await installNativeSources(om, manifest, requestedBounds, generation)
        ) {
          refreshTimer = setTimeout(loadNativeWind, FIELD_REFRESH_MS);
        }
      } catch {
        if (fetchAbort.signal.aborted) return;
        if (!alive || generation !== loadGeneration) return;
        await loadFallback(generation);
      }
    }

    const onMoveEnd = () => {
      setHoveredWind(null);
      const viewBounds = currentViewBounds(map);
      const paddedBounds = paddedWindBounds(viewBounds);
      const fallbackModel = selectWindModel(paddedBounds);
      const requestedModelId =
        fallbackModel.id === "gfs_global" && !windTileProviderDisabled
          ? (selectOpenwindWindTileModel(paddedBounds) ?? fallbackModel.id)
          : fallbackModel.id;
      if (
        activeModelId === requestedModelId &&
        loadedBounds &&
        windBoundsCoverView(loadedBounds, viewBounds)
      ) {
        return;
      }
      if (refetchTimer) clearTimeout(refetchTimer);
      refetchTimer = setTimeout(loadNativeWind, 450);
    };

    const onDataLoading = () => {
      if (!activeOmModule) return;
      activeOmModule.updateCurrentBounds(
        paddedWindBounds(currentViewBounds(map)),
      );
    };

    const onSourceData = (event: maplibregl.MapSourceDataEvent) => {
      if (
        event.sourceId !== NATIVE_WIND_SOURCE_ID &&
        event.sourceId !== NATIVE_GUST_SOURCE_ID
      )
        return;
      if (event.isSourceLoaded) activateNativeField(loadGeneration);
    };

    const onMouseMove = (event: maplibregl.MapMouseEvent) => {
      if (!currentField || hoverFrame !== null) return;
      const { lng, lat } = event.lngLat;
      const { x, y } = event.point;
      hoverFrame = requestAnimationFrame(() => {
        hoverFrame = null;
        if (!alive || !currentField) return;
        const exactWind = nativeSampler?.sample(lng, lat);
        const vector = exactWind ? null : sampleWindField(currentField, lng, lat);
        const wind =
          exactWind ??
          (vector
            ? {
                speedKmh: Math.hypot(vector.u, vector.v),
                gustsKmh: Math.max(
                  Math.hypot(vector.u, vector.v),
                  vector.gust,
                ),
                direction: windVectorToMeteorologicalDirection(
                  vector.u,
                  vector.v,
                ),
              }
            : null);
        if (!wind) {
          setHoveredWind(null);
          return;
        }
        const canvas = map.getCanvas();
        setHoveredWind({
          x,
          y,
          flipX: x > canvas.clientWidth - 210,
          flipY: y > canvas.clientHeight - 135,
          lat,
          lon: lng,
          ...wind,
        });
      });
    };

    const clearHover = () => setHoveredWind(null);
    const restartAnimationForProfile = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!alive || !currentField) return;
        const animationProfile = startAnimation(currentField);
        setDetails((current) =>
          current
            ? {
                ...current,
                performance: {
                  tier: animationProfile.tier,
                  particleCount: animationProfile.particleCount,
                  targetFramesPerSecond: animationProfile.framesPerSecond,
                  measuredFramesPerSecond: null,
                },
              }
            : current,
        );
      }, 300);
    };
    const onOnline = () => {
      retryAttempt = 0;
      if (refetchTimer) clearTimeout(refetchTimer);
      void loadNativeWind();
    };
    map.on("moveend", onMoveEnd);
    map.on("resize", restartAnimationForProfile);
    map.on("dataloading", onDataLoading);
    map.on("sourcedata", onSourceData);
    map.on("movestart", clearHover);
    map.on("mousemove", onMouseMove);
    map.getCanvas().addEventListener("mouseleave", clearHover);
    reducedMotionQuery.addEventListener("change", restartAnimationForProfile);
    window.addEventListener("online", onOnline);
    void loadNativeWind();

    return () => {
      alive = false;
      loadGeneration += 1;
      if (fetchAbort) fetchAbort.abort();
      if (refetchTimer) clearTimeout(refetchTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      clearLoadTimers();
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      if (hoverFrame !== null) cancelAnimationFrame(hoverFrame);
      map.off("moveend", onMoveEnd);
      map.off("resize", restartAnimationForProfile);
      map.off("dataloading", onDataLoading);
      map.off("sourcedata", onSourceData);
      map.off("movestart", clearHover);
      map.off("mousemove", onMouseMove);
      map.getCanvas().removeEventListener("mouseleave", clearHover);
      reducedMotionQuery.removeEventListener(
        "change",
        restartAnimationForProfile,
      );
      window.removeEventListener("online", onOnline);
      removeNativeLayers(map);
      if (overlayRef.current) {
        map.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [showWindOverlay, mapLoaded, mapRef]);

  return {
    status: showWindOverlay ? status : "idle",
    validAt: showWindOverlay ? validAt : null,
    details: showWindOverlay ? details : null,
    hoveredWind: showWindOverlay ? hoveredWind : null,
  };
}
