import { describe, expect, it } from "vitest";
import type { WindHealthReport } from "@/lib/windHealth";
import type { SpatialWindHealthReport } from "@/lib/windSpatialHealth";
import {
  buildWindSystemHealthReport,
  compareWindHealthSources,
} from "@/lib/windSystemHealth";

const samples = [
  { longitude: 7, latitude: 47, uMps: 2, vMps: 3, gustMps: 6 },
  { longitude: 8, latitude: 48, uMps: 4, vMps: 1, gustMps: 7 },
];

const fallback: WindHealthReport = {
  status: "operational",
  checkedAt: "2026-09-09T06:20:00.000Z",
  sourceUrl: "https://tiles.openwind.ch",
  model: {
    id: "dwd_icon_eu",
    label: "ICON-EU",
    source: "DWD",
    resolutionKm: 6.5,
  },
  dataset: {
    id: "dwd_icon_eu:2026090903:003",
    runId: "2026090903",
    referenceAt: "2026-09-09T03:00:00.000Z",
    validAt: "2026-09-09T06:00:00.000Z",
    updatedAt: "2026-09-09T06:05:00.000Z",
    ageMinutes: 15,
    forecastOffsetMinutes: -20,
    gustsAvailable: true,
  },
  tile: null,
  samples,
  checks: [],
};

const primary: SpatialWindHealthReport = {
  status: "operational",
  checkedAt: "2026-09-09T06:20:00.000Z",
  sourceUrl: "https://openmeteo.s3.amazonaws.com/data_spatial",
  model: {
    id: "dwd_icon_eu",
    label: "ICON-EU",
    source: "Open-Meteo · DWD",
    resolutionKm: 6.5,
  },
  dataset: {
    referenceAt: "2026-09-09T03:00:00.000Z",
    validAt: "2026-09-09T06:00:00.000Z",
    updatedAt: "2026-09-09T06:05:00.000Z",
    ageMinutes: 15,
    gustsAvailable: true,
  },
  file: null,
  samples: samples.map((sample) => ({ ...sample, uMps: sample.uMps + 0.04 })),
  checks: [],
};

describe("wind system health", () => {
  it("is operational when primary, fallback and values agree", () => {
    const report = buildWindSystemHealthReport(primary, fallback);

    expect(report.status).toBe("operational");
    expect(report.activeProvider).toBe("openmeteo_spatial");
    expect(report.fallbackReady).toBe(true);
    expect(report.consistency.status).toBe("pass");
  });

  it("switches to R2 without declaring a total outage", () => {
    const report = buildWindSystemHealthReport(
      {
        ...primary,
        status: "outage",
        checks: [
          {
            id: "file",
            label: "Fichier",
            status: "fail",
            message: "HTTP 503",
          },
        ],
      },
      fallback,
    );

    expect(report.status).toBe("degraded");
    expect(report.activeProvider).toBe("openwind_tiles");
    expect(report.fallbackReason).toContain("HTTP 503");
  });

  it("flags a material numerical divergence", () => {
    const comparison = compareWindHealthSources(
      {
        ...primary,
        samples: primary.samples.map((sample) => ({
          ...sample,
          uMps: sample.uMps + 2,
        })),
      },
      fallback,
    );

    expect(comparison.status).toBe("fail");
    expect(comparison.maxVectorDifferenceMps).toBeGreaterThan(1.5);
  });

  it("stays operational during a normal timestep rollover", () => {
    const report = buildWindSystemHealthReport(
      {
        ...primary,
        dataset: {
          ...primary.dataset!,
          validAt: "2026-09-09T07:00:00.000Z",
        },
      },
      fallback,
    );

    expect(report.status).toBe("operational");
    expect(report.consistency.comparable).toBe(false);
    expect(report.consistency.status).toBe("warn");
  });

  it("never compares values sampled at different coordinates", () => {
    const comparison = compareWindHealthSources(
      {
        ...primary,
        samples: primary.samples.map((sample) => ({
          ...sample,
          longitude: sample.longitude + 1,
        })),
      },
      fallback,
    );

    expect(comparison.comparable).toBe(false);
    expect(comparison.message).toContain("ne coïncident pas");
  });
});
