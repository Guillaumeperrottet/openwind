import type { WindHealthLevel, WindHealthSample } from "@/lib/windHealth";
import type {
  LruBlockCache,
  OmFileReader,
  OmHttpBackendPool,
} from "@openmeteo/file-reader";
import {
  OPEN_METEO_SPATIAL_BASE_URL,
  parseSpatialWindManifest,
  REQUIRED_SPATIAL_WIND_VARIABLES,
  SPATIAL_WIND_GUST_VARIABLE,
  SPATIAL_WIND_MODELS,
  type OpenMeteoSpatialMetadata,
  type SpatialWindManifest,
} from "@/lib/windSpatial";

const REQUEST_TIMEOUT_MS = 10_000;
const FRESH_MINUTES = 180;
const ICON_EU_GRID = {
  columns: 1_377,
  rows: 657,
  west: -23.5,
  south: 29.5,
  longitudeStep: 0.0625,
  latitudeStep: 0.0625,
} as const;

const DEFAULT_SAMPLE_POINTS: Array<
  Pick<WindHealthSample, "longitude" | "latitude">
> = [
  { longitude: 6.1432, latitude: 46.2044 },
  { longitude: 7.4474, latitude: 46.948 },
  { longitude: 8.5417, latitude: 47.3769 },
];

type SpatialReaderRuntime = {
  cache: LruBlockCache;
  pool: OmHttpBackendPool;
  OmDataType: typeof import("@openmeteo/file-reader").OmDataType;
};

const spatialReaderGlobal = globalThis as typeof globalThis & {
  __openwindSpatialReaderRuntime?: Promise<SpatialReaderRuntime>;
};

function getSpatialReaderRuntime(): Promise<SpatialReaderRuntime> {
  spatialReaderGlobal.__openwindSpatialReaderRuntime ??= import(
    "@openmeteo/file-reader"
  ).then(({ LruBlockCache, OmDataType, OmHttpBackendPool }) => ({
    cache: new LruBlockCache(64 * 1024, 96),
    pool: new OmHttpBackendPool({
      backendOptions: { timeoutMs: REQUEST_TIMEOUT_MS, retries: 1 },
      maxBackends: 4,
    }),
    OmDataType,
  }));
  return spatialReaderGlobal.__openwindSpatialReaderRuntime;
}

export type SpatialWindHealthCheck = {
  id: "manifest" | "freshness" | "variables" | "file" | "sample" | "cors";
  label: string;
  status: WindHealthLevel;
  message: string;
  durationMs?: number;
};

export type SpatialWindHealthReport = {
  status: "operational" | "degraded" | "outage";
  checkedAt: string;
  sourceUrl: string;
  model: SpatialWindManifest["model"];
  dataset: {
    referenceAt: string;
    validAt: string;
    updatedAt: string;
    ageMinutes: number;
    gustsAvailable: boolean;
  } | null;
  file: {
    url: string;
    bytes: number | null;
    durationMs: number;
  } | null;
  samples: WindHealthSample[];
  checks: SpatialWindHealthCheck[];
};

export type SpatialWindSampleReader = (
  fileUrl: string,
  points: Array<Pick<WindHealthSample, "longitude" | "latitude">>,
) => Promise<WindHealthSample[]>;

type SpatialWindHealthOptions = {
  baseUrl?: string;
  origin?: string;
  now?: Date;
  fetcher?: typeof fetch;
  samplePoints?: Array<Pick<WindHealthSample, "longitude" | "latitude">>;
  sampleReader?: SpatialWindSampleReader;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erreur inconnue";
}

function reportStatus(
  checks: SpatialWindHealthCheck[],
): SpatialWindHealthReport["status"] {
  if (checks.some((check) => check.status === "fail")) return "outage";
  if (checks.some((check) => check.status === "warn")) return "degraded";
  return "operational";
}

function hasValidCors(response: Response, origin: string): boolean {
  const allowedOrigin = response.headers.get("access-control-allow-origin");
  return allowedOrigin === "*" || allowedOrigin === origin;
}

function emptyReport(
  now: Date,
  sourceUrl: string,
  checks: SpatialWindHealthCheck[],
): SpatialWindHealthReport {
  return {
    status: reportStatus(checks),
    checkedAt: now.toISOString(),
    sourceUrl,
    model: SPATIAL_WIND_MODELS.dwd_icon_eu.metadata,
    dataset: null,
    file: null,
    samples: [],
    checks,
  };
}

function gridIndex(longitude: number, latitude: number) {
  const column = Math.round(
    (longitude - ICON_EU_GRID.west) / ICON_EU_GRID.longitudeStep,
  );
  const row = Math.round(
    (latitude - ICON_EU_GRID.south) / ICON_EU_GRID.latitudeStep,
  );
  if (
    column < 0 ||
    row < 0 ||
    column >= ICON_EU_GRID.columns ||
    row >= ICON_EU_GRID.rows
  ) {
    throw new Error("Le point de contrôle sort de la grille ICON-EU");
  }
  return { column, row };
}

export async function readOpenMeteoWindSamples(
  fileUrl: string,
  points: Array<Pick<WindHealthSample, "longitude" | "latitude">>,
): Promise<WindHealthSample[]> {
  const { cache, OmDataType, pool } = await getSpatialReaderRuntime();
  return pool.withReader(fileUrl, cache, async (root) => {
    const variables: OmFileReader[] = [];
    try {
      for (const name of [
        ...REQUIRED_SPATIAL_WIND_VARIABLES,
        SPATIAL_WIND_GUST_VARIABLE,
      ]) {
        const child = await root.getChildByName(name);
        if (!child) throw new Error(`Variable OM absente : ${name}`);
        const dimensions = child.getDimensions();
        if (
          dimensions.length !== 2 ||
          dimensions[0] !== ICON_EU_GRID.rows ||
          dimensions[1] !== ICON_EU_GRID.columns
        ) {
          child.dispose();
          throw new Error(`Dimensions OM inattendues pour ${name}`);
        }
        variables.push(child);
      }

      return await Promise.all(
        points.map(async (point) => {
          const { column, row } = gridIndex(point.longitude, point.latitude);
          const values = await Promise.all(
            variables.map(async (child) => {
              const value = await child.read({
                type: OmDataType.FloatArray,
                ranges: [
                  { start: row, end: row + 1 },
                  { start: column, end: column + 1 },
                ],
                prefetch: false,
              });
              return Number(value[0]);
            }),
          );
          if (values.some((value) => !Number.isFinite(value))) {
            throw new Error("Valeur météo non numérique dans le fichier OM");
          }
          return {
            ...point,
            uMps: values[0],
            vMps: values[1],
            gustMps: Math.max(Math.hypot(values[0], values[1]), values[2]),
          };
        }),
      );
    } finally {
      for (const child of variables) child.dispose();
    }
  });
}

export async function checkOpenMeteoWindHealth(
  options: SpatialWindHealthOptions = {},
): Promise<SpatialWindHealthReport> {
  const now = options.now ?? new Date();
  const origin = options.origin ?? "https://www.openwind.ch";
  const baseUrl = (
    options.baseUrl ?? OPEN_METEO_SPATIAL_BASE_URL
  ).replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;
  const checks: SpatialWindHealthCheck[] = [];
  const metadataUrl = `${baseUrl}/${SPATIAL_WIND_MODELS.dwd_icon_eu.domain}/latest.json`;
  const manifestStartedAt = Date.now();
  let metadata: OpenMeteoSpatialMetadata;
  let manifest: SpatialWindManifest;

  try {
    const metadataResponse = await fetcher(metadataUrl, {
      cache: "no-store",
      headers: { Origin: origin },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!metadataResponse.ok) throw new Error(`HTTP ${metadataResponse.status}`);
    metadata = (await metadataResponse.json()) as OpenMeteoSpatialMetadata;
    manifest = parseSpatialWindManifest("dwd_icon_eu", metadata, {
      baseUrl,
      now,
    });
    checks.push({
      id: "manifest",
      label: "Manifeste Open-Meteo",
      status: "pass",
      message: `Run ${manifest.referenceAt} · échéance ${manifest.validAt}`,
      durationMs: Date.now() - manifestStartedAt,
    });
  } catch (error) {
    checks.push({
      id: "manifest",
      label: "Manifeste Open-Meteo",
      status: "fail",
      message: errorMessage(error),
      durationMs: Date.now() - manifestStartedAt,
    });
    return emptyReport(now, baseUrl, checks);
  }

  const ageMinutes = Math.max(
    0,
    Math.round((now.getTime() - new Date(manifest.updatedAt).getTime()) / 60_000),
  );
  checks.push({
    id: "freshness",
    label: "Fraîcheur Open-Meteo",
    status: manifest.stale ? "fail" : ageMinutes > FRESH_MINUTES ? "warn" : "pass",
    message: manifest.stale
      ? `Run périmé ou échéance trop éloignée (${ageMinutes} min)`
      : `Dernière mise à jour il y a ${ageMinutes} min`,
  });

  const availableVariables = new Set(metadata.variables ?? []);
  const requiredVariables = [
    ...REQUIRED_SPATIAL_WIND_VARIABLES,
    SPATIAL_WIND_GUST_VARIABLE,
  ];
  const missingVariables = requiredVariables.filter(
    (variable) => !availableVariables.has(variable),
  );
  checks.push({
    id: "variables",
    label: "Variables météo",
    status: missingVariables.length === 0 ? "pass" : "fail",
    message:
      missingVariables.length === 0
        ? "Vent U10, V10 et rafales disponibles"
        : `Variables requises absentes : ${missingVariables.join(", ")}`,
  });

  const fileStartedAt = Date.now();
  let fileDurationMs = 0;
  let fileResponse: Response | null = null;
  let fileBytes: number | null = null;
  try {
    fileResponse = await fetcher(manifest.fileUrl, {
      method: "HEAD",
      cache: "no-store",
      headers: { Origin: origin },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!fileResponse.ok) throw new Error(`HTTP ${fileResponse.status}`);
    const contentLength = Number(fileResponse.headers.get("content-length"));
    fileBytes = Number.isFinite(contentLength) && contentLength > 0
      ? contentLength
      : null;
    fileDurationMs = Date.now() - fileStartedAt;
    checks.push({
      id: "file",
      label: "Fichier spatial réel",
      status: "pass",
      message: fileBytes
        ? `${Math.round(fileBytes / 1024 / 1024)} Mo · lecture partielle disponible`
        : "Fichier accessible · taille non exposée",
      durationMs: fileDurationMs,
    });
  } catch (error) {
    fileDurationMs = Date.now() - fileStartedAt;
    checks.push({
      id: "file",
      label: "Fichier spatial réel",
      status: "fail",
      message: errorMessage(error),
      durationMs: fileDurationMs,
    });
  }

  const sampleStartedAt = Date.now();
  let samples: WindHealthSample[] = [];
  try {
    const sampleReader = options.sampleReader ?? readOpenMeteoWindSamples;
    samples = await sampleReader(
      manifest.fileUrl,
      options.samplePoints?.length ? options.samplePoints : DEFAULT_SAMPLE_POINTS,
    );
    if (samples.length === 0) throw new Error("Aucun échantillon décodé");
    checks.push({
      id: "sample",
      label: "Décodage des données",
      status: "pass",
      message: `${samples.length} points U10/V10/rafales lus dans le fichier OM`,
      durationMs: Date.now() - sampleStartedAt,
    });
  } catch (error) {
    checks.push({
      id: "sample",
      label: "Décodage des données",
      status: "fail",
      message: errorMessage(error),
      durationMs: Date.now() - sampleStartedAt,
    });
  }

  const corsOk = fileResponse !== null && hasValidCors(fileResponse, origin);
  checks.push({
    id: "cors",
    label: "Accès navigateur Open-Meteo",
    status: corsOk ? "pass" : "fail",
    message: corsOk
      ? `CORS autorise ${origin}`
      : `CORS n’autorise pas correctement ${origin}`,
  });

  return {
    status: reportStatus(checks),
    checkedAt: now.toISOString(),
    sourceUrl: baseUrl,
    model: manifest.model,
    dataset: {
      referenceAt: manifest.referenceAt,
      validAt: manifest.validAt,
      updatedAt: manifest.updatedAt,
      ageMinutes,
      gustsAvailable: manifest.gustsAvailable,
    },
    file: {
      url: manifest.fileUrl,
      bytes: fileBytes,
      durationMs: fileDurationMs,
    },
    samples,
    checks,
  };
}
