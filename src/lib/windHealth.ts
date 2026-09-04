import {
  decodeOpenwindWindTile,
  openwindWindTileUrl,
  parseOpenwindWindTileManifest,
  type OpenwindWindTileManifest,
} from "@/lib/windTiles";

export const WIND_HEALTH_MODEL = "dwd_icon_eu" as const;
export const WIND_HEALTH_FRESH_MINUTES = 180;
export const WIND_HEALTH_MAX_AGE_MINUTES = 360;

const REQUEST_TIMEOUT_MS = 8_000;

export type WindHealthLevel = "pass" | "warn" | "fail";
export type WindHealthStatus = "operational" | "degraded" | "outage";

export type WindHealthCheck = {
  id: "manifest" | "freshness" | "tile" | "cors";
  label: string;
  status: WindHealthLevel;
  message: string;
  durationMs?: number;
};

export type WindHealthReport = {
  status: WindHealthStatus;
  checkedAt: string;
  sourceUrl: string | null;
  model: {
    id: string;
    label: string;
    source: string;
    resolutionKm: number;
  } | null;
  dataset: {
    id: string;
    runId: string;
    referenceAt: string;
    validAt: string;
    updatedAt: string;
    ageMinutes: number;
    forecastOffsetMinutes: number;
    gustsAvailable: boolean;
  } | null;
  tile: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    bytes: number;
    durationMs: number;
  } | null;
  checks: WindHealthCheck[];
};

export type WindHealthFetcher = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

type WindHealthOptions = {
  source?: string;
  origin?: string;
  now?: Date;
  fetcher?: WindHealthFetcher;
};

function normalizeSource(source: string): URL {
  const url = new URL(source);
  if (url.protocol !== "https:") {
    throw new Error("La source des tuiles doit utiliser HTTPS");
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}/`;
  url.search = "";
  url.hash = "";
  return url;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erreur inconnue";
}

function reportStatus(checks: WindHealthCheck[]): WindHealthStatus {
  if (checks.some((check) => check.status === "fail")) return "outage";
  if (checks.some((check) => check.status === "warn")) return "degraded";
  return "operational";
}

function baseReport(
  now: Date,
  sourceUrl: string | null,
  checks: WindHealthCheck[],
): WindHealthReport {
  return {
    status: reportStatus(checks),
    checkedAt: now.toISOString(),
    sourceUrl,
    model: null,
    dataset: null,
    tile: null,
    checks,
  };
}

function hasValidCors(response: Response, origin: string): boolean {
  const allowedOrigin = response.headers.get("access-control-allow-origin");
  return allowedOrigin === "*" || allowedOrigin === origin;
}

function expectedTileDimensions(
  manifest: OpenwindWindTileManifest,
  x: number,
  y: number,
) {
  return {
    width: Math.min(
      manifest.grid.tileSize,
      manifest.grid.columns - x * manifest.grid.tileSize,
    ),
    height: Math.min(
      manifest.grid.tileSize,
      manifest.grid.rows - y * manifest.grid.tileSize,
    ),
  };
}

export async function checkWindHealth(
  options: WindHealthOptions = {},
): Promise<WindHealthReport> {
  const now = options.now ?? new Date();
  const origin = options.origin ?? "https://www.openwind.ch";
  const fetcher = options.fetcher ?? fetch;
  const checks: WindHealthCheck[] = [];
  let sourceUrl: URL;

  try {
    const configuredSource =
      options.source ?? process.env.OPENWIND_WIND_TILE_SOURCE?.trim() ?? "";
    if (!configuredSource) throw new Error("La source des tuiles est absente");
    sourceUrl = normalizeSource(configuredSource);
  } catch (error) {
    checks.push({
      id: "manifest",
      label: "Manifeste",
      status: "fail",
      message: errorMessage(error),
    });
    return baseReport(now, null, checks);
  }

  let manifest: OpenwindWindTileManifest;
  let manifestResponse: Response;
  const manifestUrl = new URL(`${WIND_HEALTH_MODEL}/latest.json`, sourceUrl);
  manifestUrl.searchParams.set("healthcheck", String(now.getTime()));
  const manifestStartedAt = Date.now();

  try {
    manifestResponse = await fetcher(manifestUrl.toString(), {
      cache: "no-store",
      headers: { Origin: origin },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!manifestResponse.ok) {
      throw new Error(`HTTP ${manifestResponse.status}`);
    }
    manifest = parseOpenwindWindTileManifest(
      (await manifestResponse.json()) as unknown,
    );
    checks.push({
      id: "manifest",
      label: "Manifeste",
      status: "pass",
      message: `${manifest.datasetId} chargé et validé`,
      durationMs: Date.now() - manifestStartedAt,
    });
  } catch (error) {
    checks.push({
      id: "manifest",
      label: "Manifeste",
      status: "fail",
      message: errorMessage(error),
      durationMs: Date.now() - manifestStartedAt,
    });
    return baseReport(now, sourceUrl.origin, checks);
  }

  const updatedAtMs = new Date(manifest.updatedAt).getTime();
  const validAtMs = new Date(manifest.validAt).getTime();
  const ageMinutes = Math.max(
    0,
    Math.round((now.getTime() - updatedAtMs) / 60_000),
  );
  const forecastOffsetMinutes = Math.round(
    (validAtMs - now.getTime()) / 60_000,
  );
  const forecastTooFar = Math.abs(forecastOffsetMinutes) > 360;

  if (
    manifest.stale ||
    forecastTooFar ||
    ageMinutes > WIND_HEALTH_MAX_AGE_MINUTES
  ) {
    checks.push({
      id: "freshness",
      label: "Fraîcheur",
      status: "fail",
      message: `Données âgées de ${ageMinutes} min ou échéance hors fenêtre`,
    });
  } else if (ageMinutes > WIND_HEALTH_FRESH_MINUTES) {
    checks.push({
      id: "freshness",
      label: "Fraîcheur",
      status: "warn",
      message: `Dernière publication il y a ${ageMinutes} min`,
    });
  } else {
    checks.push({
      id: "freshness",
      label: "Fraîcheur",
      status: "pass",
      message: `Dernière publication il y a ${ageMinutes} min`,
    });
  }

  const x = Math.floor(manifest.grid.tileColumns / 2);
  const y = Math.floor(manifest.grid.tileRows / 2);
  const tileUrl = openwindWindTileUrl(manifest, { x, y });
  let tileResult: WindHealthReport["tile"] = null;
  let tileResponse: Response | null = null;
  const tileStartedAt = Date.now();

  try {
    const parsedTileUrl = new URL(tileUrl);
    if (parsedTileUrl.protocol !== "https:") {
      throw new Error("La tuile de contrôle n’utilise pas HTTPS");
    }
    if (parsedTileUrl.origin !== sourceUrl.origin) {
      throw new Error("Le manifeste pointe vers une origine inattendue");
    }

    tileResponse = await fetcher(parsedTileUrl.toString(), {
      cache: "no-store",
      headers: { Origin: origin },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!tileResponse.ok) throw new Error(`HTTP ${tileResponse.status}`);
    const buffer = await tileResponse.arrayBuffer();
    const tile = decodeOpenwindWindTile(buffer);
    const expected = expectedTileDimensions(manifest, x, y);
    if (tile.width !== expected.width || tile.height !== expected.height) {
      throw new Error("Dimensions de tuile incohérentes avec le manifeste");
    }

    const durationMs = Date.now() - tileStartedAt;
    tileResult = {
      url: parsedTileUrl.toString(),
      x,
      y,
      width: tile.width,
      height: tile.height,
      bytes: buffer.byteLength,
      durationMs,
    };
    checks.push({
      id: "tile",
      label: "Tuile réelle",
      status: "pass",
      message: `${x}/${y} · ${tile.width}×${tile.height} · ${buffer.byteLength} octets`,
      durationMs,
    });
  } catch (error) {
    checks.push({
      id: "tile",
      label: "Tuile réelle",
      status: "fail",
      message: errorMessage(error),
      durationMs: Date.now() - tileStartedAt,
    });
  }

  const corsOk =
    hasValidCors(manifestResponse, origin) &&
    tileResponse !== null &&
    hasValidCors(tileResponse, origin);
  checks.push({
    id: "cors",
    label: "Accès navigateur",
    status: corsOk ? "pass" : "fail",
    message: corsOk
      ? `CORS autorise ${origin}`
      : `CORS n’autorise pas correctement ${origin}`,
  });

  return {
    status: reportStatus(checks),
    checkedAt: now.toISOString(),
    sourceUrl: sourceUrl.origin,
    model: {
      id: manifest.model.id,
      label: manifest.model.label,
      source: manifest.model.source,
      resolutionKm: manifest.model.resolutionKm,
    },
    dataset: {
      id: manifest.datasetId,
      runId: manifest.runId,
      referenceAt: manifest.referenceAt,
      validAt: manifest.validAt,
      updatedAt: manifest.updatedAt,
      ageMinutes,
      forecastOffsetMinutes,
      gustsAvailable: manifest.gustsAvailable,
    },
    tile: tileResult,
    checks,
  };
}
