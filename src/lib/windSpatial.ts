import type {
  WindModelId,
  WindModelMetadata,
} from "@/lib/windField";

export const OPEN_METEO_SPATIAL_BASE_URL =
  "https://openmeteo.s3.amazonaws.com/data_spatial";

export const SPATIAL_WIND_MODELS: Record<
  WindModelId,
  {
    domain: string;
    metadata: WindModelMetadata;
  }
> = {
  gfs_global: {
    domain: "ncep_gfs013",
    metadata: {
      id: "gfs_global",
      label: "GFS",
      source: "NOAA",
      resolutionKm: 13,
    },
  },
  meteoswiss_icon_ch1: {
    domain: "meteoswiss_icon_ch1",
    metadata: {
      id: "meteoswiss_icon_ch1",
      label: "ICON-CH1",
      source: "MeteoSwiss",
      resolutionKm: 1,
    },
  },
};

export const REQUIRED_SPATIAL_WIND_VARIABLES = [
  "wind_u_component_10m",
  "wind_v_component_10m",
] as const;

export const SPATIAL_WIND_GUST_VARIABLE = "wind_gusts_10m";

const MAX_VALID_TIME_DISTANCE_MS = 3 * 60 * 60 * 1000;
const MAX_UPDATE_AGE_MS = 12 * 60 * 60 * 1000;

export type OpenMeteoSpatialMetadata = {
  completed?: boolean;
  last_modified_time?: string;
  reference_time?: string;
  valid_times?: string[];
  variables?: string[];
};

export type SpatialWindManifest = {
  model: WindModelMetadata;
  domain: string;
  fileUrl: string;
  referenceAt: string;
  validAt: string;
  updatedAt: string;
  gustsAvailable: boolean;
  stale: boolean;
};

function normalizeIsoDate(value: string | undefined, field: string): string {
  if (!value) throw new Error(`Missing ${field}`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${field}`);
  return parsed.toISOString();
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function isWindModelId(value: string | null): value is WindModelId {
  return value !== null && value in SPATIAL_WIND_MODELS;
}

/** Pick the available model time closest to now without inventing a timestep. */
export function selectClosestSpatialValidTime(
  validTimes: string[],
  now = new Date(),
): string {
  if (validTimes.length === 0) throw new Error("No valid model times");

  const target = now.getTime();
  let selected: string | null = null;
  let selectedDistance = Number.POSITIVE_INFINITY;

  for (const value of validTimes) {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) continue;
    const distance = Math.abs(time - target);
    if (distance < selectedDistance) {
      selected = new Date(time).toISOString();
      selectedDistance = distance;
    }
  }

  if (!selected) throw new Error("No parseable model times");
  return selected;
}

export function buildSpatialOmFileUrl(
  baseUrl: string,
  domain: string,
  referenceAt: string,
  validAt: string,
): string {
  const reference = new Date(referenceAt);
  const valid = new Date(validAt);
  if (
    Number.isNaN(reference.getTime()) ||
    Number.isNaN(valid.getTime()) ||
    !/^[a-z0-9_]+$/i.test(domain)
  ) {
    throw new Error("Invalid spatial file coordinates");
  }

  const referenceFolder = [
    reference.getUTCFullYear(),
    pad(reference.getUTCMonth() + 1),
    pad(reference.getUTCDate()),
    `${pad(reference.getUTCHours())}${pad(reference.getUTCMinutes())}Z`,
  ].join("/");
  const validFile = `${valid.getUTCFullYear()}-${pad(
    valid.getUTCMonth() + 1,
  )}-${pad(valid.getUTCDate())}T${pad(valid.getUTCHours())}${pad(
    valid.getUTCMinutes(),
  )}.om`;

  return `${baseUrl.replace(/\/$/, "")}/${domain}/${referenceFolder}/${validFile}`;
}

export function parseSpatialWindManifest(
  modelId: WindModelId,
  raw: OpenMeteoSpatialMetadata,
  options: {
    baseUrl?: string;
    now?: Date;
    stale?: boolean;
  } = {},
): SpatialWindManifest {
  if (raw.completed !== true) throw new Error("Model run is not complete");

  const variables = Array.isArray(raw.variables) ? raw.variables : [];
  for (const variable of REQUIRED_SPATIAL_WIND_VARIABLES) {
    if (!variables.includes(variable)) {
      throw new Error(`Model run is missing ${variable}`);
    }
  }

  const configured = SPATIAL_WIND_MODELS[modelId];
  const referenceAt = normalizeIsoDate(raw.reference_time, "reference_time");
  const updatedAt = normalizeIsoDate(
    raw.last_modified_time,
    "last_modified_time",
  );
  const validAt = selectClosestSpatialValidTime(
    Array.isArray(raw.valid_times) ? raw.valid_times : [],
    options.now,
  );
  const now = options.now ?? new Date();
  const stale =
    options.stale ??
    (Math.abs(now.getTime() - new Date(validAt).getTime()) >
      MAX_VALID_TIME_DISTANCE_MS ||
      now.getTime() - new Date(updatedAt).getTime() > MAX_UPDATE_AGE_MS);

  return {
    model: configured.metadata,
    domain: configured.domain,
    fileUrl: buildSpatialOmFileUrl(
      options.baseUrl ?? OPEN_METEO_SPATIAL_BASE_URL,
      configured.domain,
      referenceAt,
      validAt,
    ),
    referenceAt,
    validAt,
    updatedAt,
    gustsAvailable: variables.includes(SPATIAL_WIND_GUST_VARIABLE),
    stale,
  };
}
