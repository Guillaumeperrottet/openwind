import {
  OPENWIND_WIND_PALETTE_KTS,
  hexToRgb,
  windPaletteGradient as openwindPaletteGradient,
  windPaletteRgba,
} from "@/lib/windPalette";

export type WindBounds = [
  west: number,
  south: number,
  east: number,
  north: number,
];

export type WindVector = {
  u: number;
  v: number;
};

export type WindModelId = "gfs_global" | "meteoswiss_icon_ch1";

export type WindModelMetadata = {
  id: WindModelId | "dwd_icon_eu" | "live_stations";
  label: string;
  source: string;
  resolutionKm: number | null;
};

export type WindSampleGrid = {
  lats: number[];
  lons: number[];
  stepDegrees: number;
  spacingKm: number;
};

export type WindRenderProfile = {
  particleCount: number;
  framesPerSecond: number;
  fieldWidth: number;
  fieldHeight: number;
  movementPerSecond: number;
};

export type WindPerformanceTier = "high" | "balanced" | "low";

export type WindRuntimeProfile = {
  tier: WindPerformanceTier;
  particleCount: number;
  framesPerSecond: number;
};

export type WindPerformanceWindow = {
  durationMs: number;
  rafFrames: number;
  renderedFrames: number;
  renderWorkMs: number;
  maxRafGapMs: number;
  targetFramesPerSecond: number;
};

export type WindPerformanceSignal = "degrade" | "hold" | "recover";

export type WindColorStop = {
  speed: number;
  color: readonly [number, number, number];
};

export const WIND_COLOR_STOPS_KTS: readonly WindColorStop[] =
  OPENWIND_WIND_PALETTE_KTS.map(({ minKnots, fill }) => ({
    speed: minKnots,
    color: hexToRgb(fill),
  }));

// Conservative inset of the real rotated ICON-CH1 grid. Staying inside this
// extent avoids empty edge tiles when a padded viewport crosses the model edge.
const ICON_CH1_COVERAGE_BOUNDS: WindBounds = [0.2, 42.8, 16.7, 49.8];
const EARTH_KM_PER_DEGREE = 111.32;

const MIN_REQUEST_PADDING_DEGREES = 0.6;
const REQUEST_SNAP_DEGREES = 0.05;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Balance visual density and field precision against the available viewport
 * and CPU. CSS pixels are used intentionally: Deck.gl already handles DPR.
 */
export function windRenderProfile(
  viewportWidth: number,
  viewportHeight: number,
  options: {
    mobile: boolean;
    reducedMotion: boolean;
    hardwareConcurrency?: number;
  },
): WindRenderProfile {
  const width = clamp(Math.round(viewportWidth), 240, 2560);
  const height = clamp(Math.round(viewportHeight), 240, 1440);
  const cores = options.hardwareConcurrency ?? 4;

  if (options.reducedMotion) {
    return {
      particleCount: 320,
      framesPerSecond: 12,
      fieldWidth: 144,
      fieldHeight: 100,
      movementPerSecond: 0.65,
    };
  }

  const lowPower = cores <= 4;
  const densityArea = options.mobile ? 470 : 360;
  const minimum = options.mobile ? 420 : 1_100;
  const maximum = options.mobile ? 950 : 2_800;
  const powerFactor = lowPower ? 0.76 : 1;
  const particleCount = Math.round(
    clamp((width * height * powerFactor) / densityArea, minimum, maximum),
  );

  return {
    particleCount,
    framesPerSecond: options.mobile ? (lowPower ? 24 : 30) : lowPower ? 30 : 45,
    fieldWidth: options.mobile ? 180 : lowPower ? 256 : 320,
    fieldHeight: options.mobile ? 126 : lowPower ? 180 : 224,
    movementPerSecond: options.mobile ? 1.65 : 1.9,
  };
}

/**
 * Keep three precomputed particle budgets available so runtime quality changes
 * only switch stable Deck.gl arrays instead of allocating on every frame.
 */
export function windRuntimeProfile(
  base: WindRenderProfile,
  tier: WindPerformanceTier,
): WindRuntimeProfile {
  if (tier === "high") {
    return {
      tier,
      particleCount: base.particleCount,
      framesPerSecond: base.framesPerSecond,
    };
  }

  if (tier === "balanced") {
    return {
      tier,
      particleCount: Math.max(240, Math.round(base.particleCount * 0.72)),
      framesPerSecond: Math.min(base.framesPerSecond, 30),
    };
  }

  return {
    tier,
    particleCount: Math.max(180, Math.round(base.particleCount * 0.45)),
    framesPerSecond: Math.min(
      base.framesPerSecond,
      base.framesPerSecond <= 24 ? 20 : 24,
    ),
  };
}

/**
 * Classify a three-second animation window. The delivery ratio is compared to
 * the lower of the display RAF rate and our own cap, so 60/90/120 Hz screens
 * are judged consistently. Work time catches CPU pressure that has not yet
 * translated into visibly dropped frames.
 */
export function windPerformanceSignal(
  sample: WindPerformanceWindow,
): WindPerformanceSignal {
  if (
    sample.durationMs < 1_500 ||
    sample.rafFrames <= 0 ||
    sample.renderedFrames <= 0 ||
    sample.targetFramesPerSecond <= 0
  ) {
    return "hold";
  }

  const durationSeconds = sample.durationMs / 1000;
  const rafFps = sample.rafFrames / durationSeconds;
  const renderedFps = sample.renderedFrames / durationSeconds;
  const achievableFps = Math.max(
    1,
    Math.min(sample.targetFramesPerSecond, rafFps),
  );
  const deliveryRatio = renderedFps / achievableFps;
  const meanWorkMs = sample.renderWorkMs / sample.renderedFrames;
  const frameBudgetMs = 1000 / sample.targetFramesPerSecond;

  if (
    rafFps < 18 ||
    deliveryRatio < 0.76 ||
    meanWorkMs > frameBudgetMs * 0.72 ||
    sample.maxRafGapMs > 220
  ) {
    return "degrade";
  }

  if (
    deliveryRatio >= 0.92 &&
    meanWorkMs < frameBudgetMs * 0.42 &&
    sample.maxRafGapMs < 100
  ) {
    return "recover";
  }

  return "hold";
}

/** Open-Meteo returns timezone-less timestamps when explicitly queried in GMT. */
export function normalizeUtcModelTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? value
    : `${value}Z`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Convert the meteorological convention (direction the wind comes FROM) to
 * the east/north vector used to move particles toward their destination.
 */
export function meteorologicalWindToVector(
  speedKmh: number,
  directionDegrees: number,
): WindVector {
  const radians = (directionDegrees * Math.PI) / 180;
  return {
    u: -speedKmh * Math.sin(radians),
    v: -speedKmh * Math.cos(radians),
  };
}

/** Convert an east/north movement vector back to the direction it comes from. */
export function windVectorToMeteorologicalDirection(
  u: number,
  v: number,
): number {
  const degrees = (Math.atan2(-u, -v) * 180) / Math.PI;
  return (degrees + 360) % 360;
}

/**
 * Use MeteoSwiss' kilometre-scale model for a Swiss/local viewport and the
 * global GFS field when the requested area is wider or outside that region.
 */
export function selectWindModel(bounds: WindBounds): WindModelMetadata {
  const [west, south, east, north] = bounds;
  const focusesOnIconArea =
    west >= ICON_CH1_COVERAGE_BOUNDS[0] &&
    east <= ICON_CH1_COVERAGE_BOUNDS[2] &&
    south >= ICON_CH1_COVERAGE_BOUNDS[1] &&
    north <= ICON_CH1_COVERAGE_BOUNDS[3] &&
    east - west <= 25 &&
    north - south <= 18;

  return focusesOnIconArea
    ? {
        id: "meteoswiss_icon_ch1",
        label: "ICON-CH1",
        source: "MeteoSwiss",
        resolutionKm: 1,
      }
    : {
        id: "gfs_global",
        label: "GFS",
        source: "NOAA",
        resolutionKm: 13,
      };
}

function linearValues(start: number, end: number, count: number): number[] {
  if (count <= 1) return [(start + end) / 2];
  return Array.from({ length: count }, (_, index) =>
    Number((start + ((end - start) * index) / (count - 1)).toFixed(5)),
  );
}

/**
 * Build an aspect-ratio-aware sampling grid. It follows the native model grid
 * for small views and reports the real sampling distance whenever the public
 * coordinate API forces us to thin a larger field.
 */
export function buildWindSampleGrid(
  bounds: WindBounds,
  modelResolutionKm: number,
  maxPoints: number,
): WindSampleGrid {
  const [west, south, east, north] = bounds;
  const centerLatRadians = (((south + north) / 2) * Math.PI) / 180;
  const widthKm =
    (east - west) *
    EARTH_KM_PER_DEGREE *
    Math.max(0.2, Math.cos(centerLatRadians));
  const heightKm = (north - south) * EARTH_KM_PER_DEGREE;
  const nativeColumns = Math.max(2, Math.ceil(widthKm / modelResolutionKm) + 1);
  const nativeRows = Math.max(2, Math.ceil(heightKm / modelResolutionKm) + 1);
  let columns = nativeColumns;
  let rows = nativeRows;

  if (columns * rows > maxPoints) {
    const scale = Math.sqrt(maxPoints / (columns * rows));
    columns = Math.max(2, Math.floor(columns * scale));
    rows = Math.max(2, Math.floor(rows * scale));
    while (columns * rows > maxPoints) {
      if (columns >= rows && columns > 2) columns -= 1;
      else if (rows > 2) rows -= 1;
      else break;
    }
  }

  const latitudeValues = linearValues(south, north, rows);
  const longitudeValues = linearValues(west, east, columns);
  const lats: number[] = [];
  const lons: number[] = [];
  for (const lat of latitudeValues) {
    for (const lon of longitudeValues) {
      lats.push(lat);
      lons.push(lon);
    }
  }

  const latSpacing = rows > 1 ? heightKm / (rows - 1) : heightKm;
  const lonSpacing = columns > 1 ? widthKm / (columns - 1) : widthKm;

  return {
    lats,
    lons,
    stepDegrees: Math.max(
      rows > 1 ? (north - south) / (rows - 1) : north - south,
      columns > 1 ? (east - west) / (columns - 1) : east - west,
    ),
    spacingKm: Math.max(modelResolutionKm, latSpacing, lonSpacing),
  };
}

export function windSpeedColor(
  speedKmh: number,
  alpha = 255,
): [number, number, number, number] {
  return windPaletteRgba(speedKmh, alpha);
}

export function windPaletteGradient(): string {
  return openwindPaletteGradient();
}

/**
 * Request a padded, snapped area so small map moves reuse the current field
 * instead of rebuilding the particle texture after every pan.
 */
export function paddedWindBounds(
  bounds: WindBounds,
  paddingRatio = 0.6,
): WindBounds {
  const [west, south, east, north] = bounds;

  if (
    !bounds.every(Number.isFinite) ||
    east <= west ||
    north <= south ||
    east - west >= 350
  ) {
    return [-180, -80, 180, 80];
  }

  const lngPadding = Math.max(
    MIN_REQUEST_PADDING_DEGREES,
    (east - west) * paddingRatio,
  );
  const latPadding = Math.max(
    MIN_REQUEST_PADDING_DEGREES,
    (north - south) * paddingRatio,
  );
  const snapDown = (value: number) =>
    Number(
      (
        Math.floor((value + Number.EPSILON * 100) / REQUEST_SNAP_DEGREES) *
        REQUEST_SNAP_DEGREES
      ).toFixed(2),
    );
  const snapUp = (value: number) =>
    Number(
      (
        Math.ceil((value - Number.EPSILON * 100) / REQUEST_SNAP_DEGREES) *
        REQUEST_SNAP_DEGREES
      ).toFixed(2),
    );

  return [
    clamp(snapDown(west - lngPadding), -180, 180),
    clamp(snapDown(south - latPadding), -80, 80),
    clamp(snapUp(east + lngPadding), -180, 180),
    clamp(snapUp(north + latPadding), -80, 80),
  ];
}

/**
 * Keep a small safety margin around the viewport so particles never reach the
 * texture edge while the next field is being fetched.
 */
export function windBoundsCoverView(
  loadedBounds: WindBounds,
  viewBounds: WindBounds,
  safetyRatio = 0.06,
): boolean {
  const [loadedWest, loadedSouth, loadedEast, loadedNorth] = loadedBounds;
  const [viewWest, viewSouth, viewEast, viewNorth] = viewBounds;
  const lngSafety = (loadedEast - loadedWest) * safetyRatio;
  const latSafety = (loadedNorth - loadedSouth) * safetyRatio;

  return (
    viewWest >= loadedWest + lngSafety &&
    viewEast <= loadedEast - lngSafety &&
    viewSouth >= loadedSouth + latSafety &&
    viewNorth <= loadedNorth - latSafety
  );
}
