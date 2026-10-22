import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  reviews: vi.fn(),
  forecasts: vi.fn(),
  seasonal: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    spot: { findMany: mocks.findMany },
    systemConfig: { findMany: mocks.reviews },
  },
}));
vi.mock("@/lib/planner-forecast", () => ({
  fetchPlannerForecasts: mocks.forecasts,
  fetchPlannerSeasonal: mocks.seasonal,
}));
import { spotFingerprint } from "@/lib/planner-review-store";
import { REVIEW_PREFIX } from "@/lib/planner-review";
import { GET } from "@/app/api/plan/route";
const record = {
  id: "test",
  name: "Spot",
  latitude: 46.7,
  longitude: 6.8,
  region: null,
  country: "CH",
  sportType: "KITE",
  description: "Test spot",
  difficulty: "INTERMEDIATE",
  waterType: "CHOP",
  bestMonths: [],
  minWindKmh: 22,
  maxWindKmh: 40,
  bestWindDirections: ["N"],
  access: "Accès FR",
  accessDe: "Zugang DE",
  accessEn: null,
  accessIt: null,
  hazards: null,
  hazardsDe: null,
  hazardsIt: null,
  hazardsEn: null,
};
const forecast = {
  timezone: "Europe/Zurich",
  retrievedAt: "2026-10-22T12:00:00Z",
  daylight: [
    {
      date: "2026-10-25",
      sunrise: Date.parse("2026-10-25T07:00:00Z"),
      sunset: Date.parse("2026-10-25T17:00:00Z"),
    },
  ],
  hours: [8, 9, 10].map((h) => ({
    time: Date.parse(`2026-10-25T${String(h).padStart(2, "0")}:00:00Z`),
    wind: 30,
    gust: 35,
    direction: 0,
    rain: 0,
  })),
};
const get = (query = "") =>
  GET(
    new NextRequest(
      `https://www.openwind.ch/api/plan?startDate=2026-10-25&endDate=2026-10-25&${query}`,
    ),
  );
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T12:00:00Z"));
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([record]);
  mocks.reviews.mockImplementation(async ({ where }) =>
    where.key.in.map((key: string) => {
      const id = key.slice(REVIEW_PREFIX.length),
        i = Number(id.slice(5));
      const s = id.startsWith("spot-")
        ? { ...record, id, latitude: 46.7 + i * 0.0001 }
        : record;
      return {
        key,
        value: JSON.stringify({
          version: 1,
          status: "DOCUMENTED",
          discipline: "WATER_KITE",
          fingerprint: spotFingerprint(s),
          reviewedAt: "2026-10-22",
          expiresAt: "2027-01-20",
          sectors: [{ from: 315, to: 45 }],
          season: "CONDITIONAL",
          months: [],
          access: "CONDITIONAL",
          notes: {
            fr: "Conditions locales FR",
            de: "Lokale Bedingungen DE",
            it: "Condizioni locali IT",
            en: "Local conditions EN",
          },
          sources: [
            {
              title: "Local source",
              url: "https://example.org/local",
              covers: ["discipline", "directions", "season", "access"],
            },
          ],
        }),
      };
    }),
  );
  mocks.forecasts.mockResolvedValue([forecast]);
});
afterEach(() => vi.useRealTimers());
describe("public planner API", () => {
  it("validates before touching the catalogue or weather service", async () => {
    expect((await get("lat=Infinity&lng=6")).status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.forecasts).not.toHaveBeenCalled();
  });
  it("returns explained ranked results without any account and localizes access", async () => {
    const res = await get("locale=de"),
      body = await res.json();
    expect(res.status).toBe(200);
    expect(body.meta).toEqual({
      candidates: 1,
      available: 1,
      recommended: 1,
      failed: 0,
      qualified: 1,
      needsReview: 0,
    });
    expect(body.spots[0].access).toBe("Zugang DE");
    expect(body.spots[0].windows[0].hours).toBe(3);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
  it("keeps unreviewed spots public without presenting weather recommendations", async () => {
    mocks.reviews.mockResolvedValue([]);
    const res = await get("locale=it"),
      body = await res.json();
    expect(res.status).toBe(200);
    expect(body.spots).toHaveLength(1);
    expect(body.spots[0].windows).toEqual([]);
    expect(body.spots[0].qualification.status).toBe("MISSING");
    expect(body.spots[0].weather).toMatchObject({
      windMax: 30,
      gustMax: 35,
      samples: 3,
    });
    expect(body.meta).toMatchObject({
      recommended: 0,
      qualified: 0,
      needsReview: 1,
    });
  });
  it("returns an unreviewed windy Saint-Blaise within 150 km without fabricating a session", async () => {
    mocks.reviews.mockResolvedValue([]);
    mocks.findMany.mockResolvedValue([
      {
        ...record,
        name: "Saint-Blaise",
        latitude: 47.010611,
        longitude: 6.98829,
        bestWindDirections: ["SW"],
      },
    ]);
    mocks.forecasts.mockResolvedValue([
      {
        ...forecast,
        hours: forecast.hours.map((h) => ({
          ...h,
          wind: 41.7,
          gust: 79.6,
          direction: 225,
        })),
      },
    ]);
    const res = await get("lat=47.01&lng=6.99&radius=150"),
      body = await res.json();
    expect(res.status).toBe(200);
    expect(body.meta.candidates).toBe(1);
    expect(body.spots[0]).toMatchObject({
      name: "Saint-Blaise",
      windows: [],
      weather: { windMax: 41.7, gustMax: 79.6, gustsAboveThreshold: true },
    });
    expect(body.spots[0].distanceKm).toBeLessThan(1);
  });
  it("evaluates beyond both previous arbitrary catalogue limits", async () => {
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 241 }, (_, i) => ({
        ...record,
        id: `spot-${i}`,
        latitude: 46.7 + i * 0.0001,
      })),
    );
    mocks.forecasts.mockResolvedValue(
      Array.from({ length: 241 }, (_, i) => (i === 240 ? forecast : null)),
    );
    const body = await (await get("lat=46.7&lng=6.8&radius=500")).json();
    expect(mocks.forecasts.mock.calls[0][0]).toHaveLength(241);
    expect(mocks.findMany.mock.calls[0][0]).not.toHaveProperty("take");
    expect(body.spots[0].id).toBe("spot-240");
    expect(body.meta.failed).toBe(240);
  });
  it("distinguishes provider failure from a legitimate empty weather match", async () => {
    mocks.forecasts.mockResolvedValue([null]);
    const failed = await get();
    expect(failed.status).toBe(503);
    expect((await failed.json()).meta.failed).toBe(1);
    mocks.forecasts.mockResolvedValue([
      { ...forecast, hours: forecast.hours.map((h) => ({ ...h, wind: 2 })) },
    ]);
    const noMatch = await get();
    expect(noMatch.status).toBe(200);
    expect((await noMatch.json()).meta).toMatchObject({
      recommended: 0,
      failed: 0,
    });
  });
  it("does not fetch weather for an empty geographic scope", async () => {
    const res = await get("lat=0&lng=0&radius=10"),
      body = await res.json();
    expect(res.status).toBe(200);
    expect(body.meta.candidates).toBe(0);
    expect(mocks.forecasts.mock.calls[0][0]).toEqual([]);
  });
  it("uses the final forecast day inclusively, with seasonal data beyond it", async () => {
    await GET(
      new NextRequest(
        "https://www.openwind.ch/api/plan?startDate=2026-11-06&endDate=2026-11-06",
      ),
    );
    expect(mocks.forecasts).toHaveBeenCalledTimes(1);
    mocks.seasonal.mockResolvedValue([
      { wind: 25, gust: 35, days: 150, years: [2021, 2025] },
    ]);
    const body = await (
      await GET(
        new NextRequest(
          "https://www.openwind.ch/api/plan?startDate=2026-11-07&endDate=2026-11-07",
        ),
      )
    ).json();
    expect(body.mode).toBe("seasonal");
    expect(body.meta.recommended).toBe(0);
    expect(body.spots[0].windows).toEqual([]);
    expect(body.spots[0]).not.toHaveProperty("bestScore");
    expect(mocks.forecasts).toHaveBeenCalledTimes(1);
  });
  it("returns a controlled service error on catalogue failures", async () => {
    mocks.findMany.mockRejectedValue(new Error("private database detail"));
    const response = await get();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "SERVICE_UNAVAILABLE" });
  });
});
