import {
  checkWindHealth,
  type WindHealthLevel,
  type WindHealthReport,
} from "@/lib/windHealth";
import {
  checkOpenMeteoWindHealth,
  type SpatialWindHealthReport,
} from "@/lib/windSpatialHealth";

export type WindConsistencyReport = {
  status: WindHealthLevel;
  comparable: boolean;
  checkedPoints: number;
  maxVectorDifferenceMps: number | null;
  maxGustDifferenceMps: number | null;
  message: string;
};

export type WindSystemHealthReport = {
  status: "operational" | "degraded" | "outage";
  checkedAt: string;
  activeProvider: "openmeteo_spatial" | "openwind_tiles" | "none";
  fallbackReady: boolean;
  fallbackReason: string | null;
  primary: SpatialWindHealthReport;
  fallback: WindHealthReport;
  consistency: WindConsistencyReport;
};

function failedCheckMessage(report: SpatialWindHealthReport): string {
  return (
    report.checks.find((check) => check.status === "fail")?.message ??
    "source primaire indisponible"
  );
}

export function compareWindHealthSources(
  primary: SpatialWindHealthReport,
  fallback: WindHealthReport,
): WindConsistencyReport {
  if (!primary.dataset || !fallback.dataset) {
    return {
      status: "warn",
      comparable: false,
      checkedPoints: 0,
      maxVectorDifferenceMps: null,
      maxGustDifferenceMps: null,
      message: "Comparaison reportée : une source ne fournit aucun jeu de données",
    };
  }

  if (
    primary.dataset.referenceAt !== fallback.dataset.referenceAt ||
    primary.dataset.validAt !== fallback.dataset.validAt
  ) {
    return {
      status: "warn",
      comparable: false,
      checkedPoints: 0,
      maxVectorDifferenceMps: null,
      maxGustDifferenceMps: null,
      message: "Comparaison reportée : les deux sources n’ont pas encore la même échéance",
    };
  }

  const checkedPoints = Math.min(primary.samples.length, fallback.samples.length);
  if (checkedPoints === 0) {
    return {
      status: "warn",
      comparable: false,
      checkedPoints: 0,
      maxVectorDifferenceMps: null,
      maxGustDifferenceMps: null,
      message: "Comparaison reportée : aucun point commun décodé",
    };
  }

  let maxVectorDifferenceMps = 0;
  let maxGustDifferenceMps = 0;
  for (let index = 0; index < checkedPoints; index++) {
    const primarySample = primary.samples[index];
    const fallbackSample = fallback.samples[index];
    if (
      Math.abs(primarySample.longitude - fallbackSample.longitude) > 0.001 ||
      Math.abs(primarySample.latitude - fallbackSample.latitude) > 0.001
    ) {
      return {
        status: "warn",
        comparable: false,
        checkedPoints: index,
        maxVectorDifferenceMps: null,
        maxGustDifferenceMps: null,
        message: "Comparaison reportée : les points décodés ne coïncident pas",
      };
    }
    maxVectorDifferenceMps = Math.max(
      maxVectorDifferenceMps,
      Math.hypot(
        primarySample.uMps - fallbackSample.uMps,
        primarySample.vMps - fallbackSample.vMps,
      ),
    );
    maxGustDifferenceMps = Math.max(
      maxGustDifferenceMps,
      Math.abs(primarySample.gustMps - fallbackSample.gustMps),
    );
  }

  const status: WindHealthLevel =
    maxVectorDifferenceMps > 1.5 || maxGustDifferenceMps > 2
      ? "fail"
      : maxVectorDifferenceMps > 0.35 || maxGustDifferenceMps > 0.5
        ? "warn"
        : "pass";
  return {
    status,
    comparable: true,
    checkedPoints,
    maxVectorDifferenceMps,
    maxGustDifferenceMps,
    message: `${checkedPoints} points · écart vectoriel max. ${maxVectorDifferenceMps.toFixed(2)} m/s · rafales ${maxGustDifferenceMps.toFixed(2)} m/s`,
  };
}

export function buildWindSystemHealthReport(
  primary: SpatialWindHealthReport,
  fallback: WindHealthReport,
  checkedAt = new Date().toISOString(),
): WindSystemHealthReport {
  const consistency = compareWindHealthSources(primary, fallback);
  const bothUnavailable =
    primary.status === "outage" && fallback.status === "outage";
  const fullyOperational =
    primary.status === "operational" &&
    fallback.status === "operational" &&
    consistency.status === "pass";
  const activeProvider =
    primary.status !== "outage"
      ? "openmeteo_spatial"
      : fallback.status !== "outage"
        ? "openwind_tiles"
        : "none";

  return {
    status: bothUnavailable
      ? "outage"
      : fullyOperational
        ? "operational"
        : "degraded",
    checkedAt,
    activeProvider,
    fallbackReady: fallback.status !== "outage",
    fallbackReason:
      activeProvider === "openwind_tiles"
        ? `Open-Meteo indisponible : ${failedCheckMessage(primary)}`
        : null,
    primary,
    fallback,
    consistency,
  };
}

export async function checkWindSystemHealth(
  options: { source?: string; origin?: string; now?: Date } = {},
): Promise<WindSystemHealthReport> {
  const checkedAt = options.now ?? new Date();
  const fallback = await checkWindHealth({
    now: checkedAt,
    source: options.source,
    origin: options.origin,
  });
  const primary = await checkOpenMeteoWindHealth({
    now: checkedAt,
    origin: options.origin,
    samplePoints: fallback.samples.map(({ longitude, latitude }) => ({
      longitude,
      latitude,
    })),
  });
  return buildWindSystemHealthReport(
    primary,
    fallback,
    checkedAt.toISOString(),
  );
}
