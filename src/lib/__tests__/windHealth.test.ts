import { describe, expect, it } from "vitest";
import { checkWindHealth, type WindHealthFetcher } from "@/lib/windHealth";
import {
  encodeOpenwindWindTile,
  type OpenwindWindTileManifest,
} from "@/lib/windTiles";

const NOW = new Date("2026-09-04T12:00:00.000Z");
const SOURCE = "https://tiles.openwind.ch";
const ORIGIN = "https://www.openwind.ch";

const manifest: OpenwindWindTileManifest = {
  schemaVersion: 1,
  encoding: "oww1",
  datasetId: "dwd_icon_eu:2026090406:006",
  runId: "2026090406",
  model: {
    id: "dwd_icon_eu",
    label: "ICON-EU",
    source: "DWD",
    resolutionKm: 6.5,
  },
  referenceAt: "2026-09-04T06:00:00.000Z",
  validAt: "2026-09-04T12:00:00.000Z",
  updatedAt: "2026-09-04T11:41:00.000Z",
  stale: false,
  gustsAvailable: true,
  attribution: {
    name: "Deutscher Wetterdienst (DWD)",
    url: "https://www.dwd.de/",
  },
  grid: {
    bounds: [0, 48, 3, 50],
    west: 0,
    north: 50,
    columns: 4,
    rows: 3,
    longitudeStep: 1,
    latitudeStep: 1,
    tileSize: 2,
    tileColumns: 2,
    tileRows: 2,
  },
  tileUrlTemplate:
    "https://tiles.openwind.ch/dwd_icon_eu/runs/2026090406/006/{x}/{y}.oww",
};

function healthyFetcher(value: OpenwindWindTileManifest): WindHealthFetcher {
  const tileBuffer = encodeOpenwindWindTile({
    width: 2,
    height: 1,
    west: 2,
    north: 48,
    longitudeStep: 1,
    latitudeStep: 1,
    scaleMps: 0.01,
    gustsAvailable: true,
    uMps: [1, 2],
    vMps: [2, 3],
    gustMps: [4, 5],
  });

  return async (input) => {
    const headers = {
      "Access-Control-Allow-Origin": ORIGIN,
    };
    if (input.includes("latest.json")) {
      return Response.json(value, { headers });
    }
    return new Response(tileBuffer, {
      headers: { ...headers, "Content-Type": "application/octet-stream" },
    });
  };
}

describe("wind health", () => {
  it("validates a live manifest, its CORS policy and a real tile", async () => {
    const report = await checkWindHealth({
      source: SOURCE,
      origin: ORIGIN,
      now: NOW,
      fetcher: healthyFetcher(manifest),
    });

    expect(report.status).toBe("operational");
    expect(report.dataset?.ageMinutes).toBe(19);
    expect(report.tile).toMatchObject({ x: 1, y: 1, width: 2, height: 1 });
    expect(report.checks.every((check) => check.status === "pass")).toBe(true);
  });

  it("reports an outage when the published data is too old", async () => {
    const report = await checkWindHealth({
      source: SOURCE,
      origin: ORIGIN,
      now: NOW,
      fetcher: healthyFetcher({
        ...manifest,
        validAt: "2026-09-03T12:00:00.000Z",
        updatedAt: "2026-09-03T12:00:00.000Z",
      }),
    });

    expect(report.status).toBe("outage");
    expect(report.checks.find((check) => check.id === "freshness")?.status).toBe(
      "fail",
    );
  });

  it("rejects tile URLs that leave the configured R2 origin", async () => {
    const report = await checkWindHealth({
      source: SOURCE,
      origin: ORIGIN,
      now: NOW,
      fetcher: healthyFetcher({
        ...manifest,
        tileUrlTemplate: "https://example.com/{x}/{y}.oww",
      }),
    });

    expect(report.status).toBe("outage");
    expect(report.checks.find((check) => check.id === "tile")?.message).toMatch(
      /origine inattendue/,
    );
  });
});
