import {
  GridFactory,
  defaultOmProtocolSettings,
  domainOptions,
  getProtocolInstance,
  getRanges,
} from "@openmeteo/weather-map-layer";
import {
  DEFAULT_WIND_ACCURACY_TOLERANCE,
  compareWindAccuracy,
  summarizeWindAccuracy,
  type WindAccuracyValues,
} from "../src/lib/windAccuracy";
import {
  windVectorToMeteorologicalDirection,
  type WindBounds,
  type WindModelId,
} from "../src/lib/windField";
import {
  OPEN_METEO_SPATIAL_BASE_URL,
  parseSpatialWindManifest,
  SPATIAL_WIND_GUST_VARIABLE,
  SPATIAL_WIND_MODELS,
  type OpenMeteoSpatialMetadata,
  type SpatialWindManifest,
} from "../src/lib/windSpatial";

type AuditPoint = {
  name: string;
  latitude: number;
  longitude: number;
};

type ModelAuditConfig = {
  id: WindModelId;
  endpoint: string;
  points: readonly AuditPoint[];
  seam: {
    latitude: number;
    longitude: number;
    halfWidthDegrees: number;
  };
};

type ApiPointResponse = {
  latitude?: number;
  longitude?: number;
  hourly?: {
    time?: string[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    wind_gusts_10m?: number[];
  };
};

type ResolvedApiPoint = AuditPoint & {
  sampleLatitude: number;
  sampleLongitude: number;
  reference: WindAccuracyValues;
};

type PointAuditResult = ResolvedApiPoint & {
  native: WindAccuracyValues;
  delta: ReturnType<typeof compareWindAccuracy>;
};

const MODEL_AUDITS: readonly ModelAuditConfig[] = [
  {
    id: "meteoswiss_icon_ch1",
    endpoint: "https://api.open-meteo.com/v1/forecast",
    points: [
      { name: "Genève", latitude: 46.2044, longitude: 6.1432 },
      { name: "Lausanne", latitude: 46.5197, longitude: 6.6323 },
      { name: "Berne", latitude: 46.948, longitude: 7.4474 },
      { name: "Zurich", latitude: 47.3769, longitude: 8.5417 },
      { name: "Lucerne", latitude: 47.0502, longitude: 8.3093 },
      { name: "Lugano", latitude: 46.0037, longitude: 8.9511 },
      { name: "Saint-Moritz", latitude: 46.4908, longitude: 9.8355 },
    ],
    // Exact Web Mercator tile boundary at z7, inside ICON-CH1 coverage.
    seam: { latitude: 46.8, longitude: 8.4375, halfWidthDegrees: 0.08 },
  },
  {
    id: "gfs_global",
    endpoint: "https://api.open-meteo.com/v1/gfs",
    points: [
      { name: "Brest", latitude: 48.3904, longitude: -4.4861 },
      { name: "Londres", latitude: 51.5072, longitude: -0.1276 },
      { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
      { name: "Hambourg", latitude: 53.5511, longitude: 9.9937 },
      { name: "Madrid", latitude: 40.4168, longitude: -3.7038 },
      { name: "Rome", latitude: 41.9028, longitude: 12.4964 },
      { name: "Varsovie", latitude: 52.2297, longitude: 21.0122 },
      { name: "Athènes", latitude: 37.9838, longitude: 23.7275 },
    ],
    // Exact Web Mercator tile boundary at z4.
    seam: { latitude: 50, longitude: 0, halfWidthDegrees: 0.3 },
  },
] as const;

const SEAM_TOLERANCE = {
  speedKmh: 0.02,
  directionDegrees: 0.05,
  gustsKmh: 0.02,
} as const;

const AUDIT_MAX_ATTEMPTS = 3;
const AUDIT_RETRY_DELAY_MS = 10_000;

const reader = getProtocolInstance(defaultOmProtocolSettings).omFileReader;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return (await response.json()) as T;
}

async function fetchManifest(modelId: WindModelId) {
  const domain = SPATIAL_WIND_MODELS[modelId].domain;
  const metadata = await fetchJson<OpenMeteoSpatialMetadata>(
    `${OPEN_METEO_SPATIAL_BASE_URL}/${domain}/latest.json`,
  );
  return parseSpatialWindManifest(modelId, metadata);
}

function apiHour(value: string): string {
  return value.slice(0, 16);
}

async function fetchReferencePoints(
  config: ModelAuditConfig,
  manifest: SpatialWindManifest,
): Promise<ResolvedApiPoint[]> {
  const url = new URL(config.endpoint);
  url.searchParams.set(
    "latitude",
    config.points.map(({ latitude }) => latitude).join(","),
  );
  url.searchParams.set(
    "longitude",
    config.points.map(({ longitude }) => longitude).join(","),
  );
  url.searchParams.set(
    "hourly",
    "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
  );
  url.searchParams.set("models", config.id);
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("timezone", "GMT");
  url.searchParams.set("cell_selection", "nearest");
  url.searchParams.set("start_hour", apiHour(manifest.validAt));
  url.searchParams.set("end_hour", apiHour(manifest.validAt));

  const raw = await fetchJson<ApiPointResponse | ApiPointResponse[]>(
    url.toString(),
  );
  const responses = Array.isArray(raw) ? raw : [raw];
  if (responses.length !== config.points.length) {
    throw new Error(
      `${config.id}: expected ${config.points.length} API points, received ${responses.length}`,
    );
  }

  return responses.map((response, index) => {
    const speedKmh = response.hourly?.wind_speed_10m?.[0];
    const direction = response.hourly?.wind_direction_10m?.[0];
    const gustsKmh = response.hourly?.wind_gusts_10m?.[0];
    const time = response.hourly?.time?.[0];
    const sampleLatitude = response.latitude;
    const sampleLongitude = response.longitude;
    if (
      !Number.isFinite(speedKmh) ||
      !Number.isFinite(direction) ||
      !Number.isFinite(sampleLatitude) ||
      !Number.isFinite(sampleLongitude) ||
      time !== apiHour(manifest.validAt)
    ) {
      throw new Error(`${config.id}: incomplete point API response at index ${index}`);
    }

    return {
      ...config.points[index],
      sampleLatitude: sampleLatitude!,
      sampleLongitude: sampleLongitude!,
      reference: {
        speedKmh: speedKmh!,
        direction: direction!,
        ...(manifest.gustsAvailable && Number.isFinite(gustsKmh)
          ? { gustsKmh }
          : {}),
      },
    };
  });
}

function boundsAround(
  points: readonly { sampleLatitude: number; sampleLongitude: number }[],
  paddingDegrees: number,
): WindBounds {
  const latitudes = points.map(({ sampleLatitude }) => sampleLatitude);
  const longitudes = points.map(({ sampleLongitude }) => sampleLongitude);
  return [
    Math.min(...longitudes) - paddingDegrees,
    Math.min(...latitudes) - paddingDegrees,
    Math.max(...longitudes) + paddingDegrees,
    Math.max(...latitudes) + paddingDegrees,
  ];
}

async function sampleNativeField(
  manifest: SpatialWindManifest,
  points: readonly { sampleLatitude: number; sampleLongitude: number }[],
  bounds = boundsAround(
    points,
    manifest.model.id === "gfs_global" ? 0.3 : 0.05,
  ),
  interpolation: "linear" | "nearest" = "linear",
): Promise<WindAccuracyValues[]> {
  const domain = domainOptions.find(({ value }) => value === manifest.domain);
  if (!domain) throw new Error(`Unknown map-layer domain: ${manifest.domain}`);
  const ranges = getRanges(domain.grid, bounds);
  const wind = await reader.readVariable(
    manifest.fileUrl,
    "wind_u_component_10m",
    ranges,
  );
  if (!wind.values || !wind.directions) {
    throw new Error(`${manifest.model.id}: native vector data is incomplete`);
  }

  const grid = GridFactory.create(domain.grid, ranges);
  const eastward = new Float32Array(wind.values.length);
  const northward = new Float32Array(wind.values.length);
  for (let index = 0; index < wind.values.length; index++) {
    const radians = (wind.directions[index] * Math.PI) / 180;
    eastward[index] = -wind.values[index] * Math.sin(radians);
    northward[index] = -wind.values[index] * Math.cos(radians);
  }

  const gusts = manifest.gustsAvailable
    ? await reader.readVariable(
        manifest.fileUrl,
        SPATIAL_WIND_GUST_VARIABLE,
        ranges,
      )
    : null;
  const gustValues = gusts?.values;

  return points.map(({ sampleLatitude, sampleLongitude }) => {
    const u = grid.getInterpolatedValue(
      eastward,
      sampleLatitude,
      sampleLongitude,
      interpolation,
    );
    const v = grid.getInterpolatedValue(
      northward,
      sampleLatitude,
      sampleLongitude,
      interpolation,
    );
    const speedKmh = Math.hypot(u, v) * 3.6;
    const gustMps = gustValues
      ? grid.getInterpolatedValue(
          gustValues,
          sampleLatitude,
          sampleLongitude,
          interpolation,
        )
      : null;
    if (!Number.isFinite(speedKmh) || !Number.isFinite(u) || !Number.isFinite(v)) {
      throw new Error(
        `${manifest.model.id}: could not sample ${sampleLatitude},${sampleLongitude}`,
      );
    }

    return {
      speedKmh,
      direction: windVectorToMeteorologicalDirection(u, v),
      ...(Number.isFinite(gustMps) ? { gustsKmh: gustMps! * 3.6 } : {}),
    };
  });
}

async function auditSeam(
  manifest: SpatialWindManifest,
  config: ModelAuditConfig,
) {
  const { latitude, longitude, halfWidthDegrees } = config.seam;
  const point = { sampleLatitude: latitude, sampleLongitude: longitude };
  const verticalPadding = halfWidthDegrees;
  // Bilinear interpolation needs one native cell beyond the visible tile.
  // The map protocol requests that overlap too; reproduce it here so the two
  // independently decoded sides are compared under real rendering conditions.
  const interpolationOverlap =
    ((manifest.model.resolutionKm ?? 13) / 111.32) * 1.6;
  const [left] = await sampleNativeField(manifest, [point], [
    longitude - halfWidthDegrees,
    latitude - verticalPadding,
    longitude + interpolationOverlap,
    latitude + verticalPadding,
  ]);
  const [right] = await sampleNativeField(manifest, [point], [
    longitude - interpolationOverlap,
    latitude - verticalPadding,
    longitude + halfWidthDegrees,
    latitude + verticalPadding,
  ]);
  return {
    latitude,
    longitude,
    left,
    right,
    delta: compareWindAccuracy(left, right, SEAM_TOLERANCE),
  };
}

async function auditModel(config: ModelAuditConfig) {
  const manifest = await fetchManifest(config.id);
  const referencePoints = await fetchReferencePoints(config, manifest);
  // The point API is queried with `cell_selection=nearest`, so compare it with
  // the same native grid cell. Seam checks below intentionally keep the linear
  // interpolation used by the rendered map.
  const nativePoints = await sampleNativeField(
    manifest,
    referencePoints,
    undefined,
    "nearest",
  );
  const points: PointAuditResult[] = referencePoints.map((point, index) => {
    const native = nativePoints[index];
    return {
      ...point,
      native,
      delta: compareWindAccuracy(native, point.reference),
    };
  });
  const seam = await auditSeam(manifest, config);

  return {
    model: manifest.model,
    referenceAt: manifest.referenceAt,
    validAt: manifest.validAt,
    updatedAt: manifest.updatedAt,
    stale: manifest.stale,
    points,
    summary: summarizeWindAccuracy(points.map(({ delta }) => delta)),
    seam,
    passed:
      !manifest.stale &&
      points.every(({ delta }) => delta.passed) &&
      seam.delta.passed,
  };
}

function fixed(value: number | null, digits = 2): string {
  return value === null ? "—" : value.toFixed(digits);
}

function printReport(result: Awaited<ReturnType<typeof runAudit>>) {
  console.log(`Openwind wind accuracy audit — ${result.generatedAt}`);
  console.log(
    `Tolerance: ${DEFAULT_WIND_ACCURACY_TOLERANCE.speedKmh} km/h · ${DEFAULT_WIND_ACCURACY_TOLERANCE.directionDegrees}° · gusts ${DEFAULT_WIND_ACCURACY_TOLERANCE.gustsKmh} km/h`,
  );

  for (const audit of result.models) {
    console.log(
      `\n${audit.passed ? "✓" : "✗"} ${audit.model.label} (${audit.model.resolutionKm} km) · ${audit.validAt}`,
    );
    for (const point of audit.points) {
      console.log(
        `  ${point.delta.passed ? "✓" : "✗"} ${point.name.padEnd(13)} ` +
          `speed ${fixed(point.native.speedKmh)}/${fixed(point.reference.speedKmh)} Δ${fixed(point.delta.speedKmh)} km/h · ` +
          `dir ${fixed(point.native.direction, 1)}/${fixed(point.reference.direction, 0)} Δ${fixed(point.delta.directionDegrees, 1)}°` +
          (point.delta.gustsKmh === null
            ? ""
            : ` · gust Δ${fixed(point.delta.gustsKmh)} km/h`),
      );
    }
    console.log(
      `  Max: speed ${fixed(audit.summary.maxSpeedDeltaKmh)} km/h · direction ${fixed(audit.summary.maxDirectionDeltaDegrees, 1)}°` +
        (audit.summary.maxGustDeltaKmh === null
          ? ""
          : ` · gusts ${fixed(audit.summary.maxGustDeltaKmh)} km/h`),
    );
    console.log(
      `  ${audit.seam.delta.passed ? "✓" : "✗"} tile seam ${audit.seam.longitude}°: speed Δ${fixed(audit.seam.delta.speedKmh, 4)} km/h · direction Δ${fixed(audit.seam.delta.directionDegrees, 3)}°`,
    );
  }

  if (result.attempts > 1) {
    console.log(`\nUpstream synchronization settled after ${result.attempts} attempts.`);
  }
  console.log(`\n${result.passed ? "PASS" : "FAIL"}`);
}

async function runAuditOnce() {
  const models = await Promise.all(MODEL_AUDITS.map(auditModel));
  return {
    generatedAt: new Date().toISOString(),
    tolerance: DEFAULT_WIND_ACCURACY_TOLERANCE,
    models,
    passed: models.every(({ passed }) => passed),
  };
}

async function runAudit() {
  let result = await runAuditOnce();

  for (
    let attempt = 2;
    !result.passed && attempt <= AUDIT_MAX_ATTEMPTS;
    attempt++
  ) {
    console.warn(
      `Wind sources are not synchronized yet; retrying in ${AUDIT_RETRY_DELAY_MS / 1_000}s (${attempt}/${AUDIT_MAX_ATTEMPTS})...`,
    );
    await new Promise((resolve) => setTimeout(resolve, AUDIT_RETRY_DELAY_MS));
    result = await runAuditOnce();
    if (result.passed) return { ...result, attempts: attempt };
  }

  return { ...result, attempts: result.passed ? 1 : AUDIT_MAX_ATTEMPTS };
}

runAudit()
  .then((result) => {
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printReport(result);
    }
    process.exit(result.passed ? 0 : 1);
  })
  .catch((error: unknown) => {
    console.error(
      "Wind accuracy audit failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  });
