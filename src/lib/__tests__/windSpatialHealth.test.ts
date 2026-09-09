import { describe, expect, it, vi } from "vitest";
import {
  checkOpenMeteoWindHealth,
  type SpatialWindSampleReader,
} from "@/lib/windSpatialHealth";

const NOW = new Date("2026-09-09T06:20:00.000Z");
const ORIGIN = "https://www.openwind.ch";
const metadata = {
  completed: true,
  reference_time: "2026-09-09T03:00:00Z",
  last_modified_time: "2026-09-09T06:05:00Z",
  valid_times: ["2026-09-09T05:00Z", "2026-09-09T06:00Z"],
  variables: [
    "wind_u_component_10m",
    "wind_v_component_10m",
    "wind_gusts_10m",
  ],
};

function healthyFetcher(value = metadata): typeof fetch {
  return vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const headers = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Content-Length": "5242880",
      "Accept-Ranges": "bytes",
    };
    if (init?.method === "HEAD") return new Response(null, { headers });
    return Response.json(value, { headers });
  }) as unknown as typeof fetch;
}

const sampleReader: SpatialWindSampleReader = async (_url, points) =>
  points.map((point, index) => ({
    ...point,
    uMps: 1 + index,
    vMps: 2 + index,
    gustMps: 5 + index,
  }));

describe("Open-Meteo spatial health", () => {
  it("checks metadata, the immutable file and decoded wind values", async () => {
    const report = await checkOpenMeteoWindHealth({
      now: NOW,
      origin: ORIGIN,
      fetcher: healthyFetcher(),
      sampleReader,
    });

    expect(report.status).toBe("operational");
    expect(report.dataset).toMatchObject({
      referenceAt: "2026-09-09T03:00:00.000Z",
      validAt: "2026-09-09T06:00:00.000Z",
      ageMinutes: 15,
    });
    expect(report.file?.bytes).toBe(5_242_880);
    expect(report.samples).toHaveLength(3);
    expect(report.checks.every((check) => check.status === "pass")).toBe(true);
  });

  it("reports stale official data as an outage", async () => {
    const report = await checkOpenMeteoWindHealth({
      now: new Date("2026-09-10T06:20:00.000Z"),
      origin: ORIGIN,
      fetcher: healthyFetcher(),
      sampleReader,
    });

    expect(report.status).toBe("outage");
    expect(report.checks.find((check) => check.id === "freshness")?.status).toBe(
      "fail",
    );
  });

  it("fails when a real OM sample cannot be decoded", async () => {
    const report = await checkOpenMeteoWindHealth({
      now: NOW,
      origin: ORIGIN,
      fetcher: healthyFetcher(),
      sampleReader: async () => {
        throw new Error("OM illisible");
      },
    });

    expect(report.status).toBe("outage");
    expect(report.checks.find((check) => check.id === "sample")?.message).toBe(
      "OM illisible",
    );
  });
});
