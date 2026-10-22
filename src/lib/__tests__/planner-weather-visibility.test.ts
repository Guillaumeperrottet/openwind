import { describe, expect, it } from "vitest";
import {
  evaluateSpot,
  plannerSpotMatches,
  selectRecommendations,
  type PlannerSpot,
  type PlannerCriteria,
  type PlannerForecast,
} from "@/lib/planner";

const criteria: PlannerCriteria = {
  startDate: "2026-10-23",
  endDate: "2026-10-23",
  sport: "KITE",
  radius: 150,
  lat: 47.01,
  lng: 6.99,
};
const spot: PlannerSpot = {
  id: "saint-blaise",
  name: "Saint-Blaise",
  latitude: 47.010611,
  longitude: 6.98829,
  region: "Neuchâtel",
  country: "Suisse",
  sportType: "KITE",
  minWindKmh: 18,
  maxWindKmh: 45,
  bestWindDirections: ["SW", "WSW", "SSW"],
  distanceKm: 0.15,
  access: null,
  hazards: null,
  qualification: {
    status: "MISSING",
    eligible: false,
    discipline: "UNKNOWN",
    sources: [],
    note: "",
    sectors: [],
  },
};
const time = (h: number) =>
  Date.parse(`2026-10-23T${String(h).padStart(2, "0")}:00:00Z`);
const forecast: PlannerForecast = {
  timezone: "Europe/Zurich",
  retrievedAt: "2026-10-22T12:00:00Z",
  daylight: [{ date: "2026-10-23", sunrise: time(6), sunset: time(17) }],
  hours: [
    { time: time(2), wind: 100, gust: 150, direction: 225, rain: 0 },
    { time: time(9), wind: 34.2, gust: 59.8, direction: 226, rain: 0 },
    { time: time(14), wind: 41.7, gust: 76, direction: 217, rain: 0 },
    { time: time(15), wind: 35.2, gust: 79.6, direction: 236, rain: 0 },
  ],
};
describe("weather visibility independently of documentary qualification", () => {
  it("shows Saint-Blaise wind and gusts even without a reviewed profile or a retained session", () => {
    const r = evaluateSpot(
      spot,
      forecast,
      criteria,
      Date.parse("2026-10-22T12:00:00Z"),
    );
    expect(r.weather).toEqual({
      windMin: 34.2,
      windMax: 41.7,
      gustMax: 79.6,
      windPeakAt: time(14),
      gustPeakAt: time(15),
      samples: 3,
      gustsAboveThreshold: true,
      windAboveThreshold: false,
    });
    expect(r.windows).toEqual([]);
    expect(r.qualification?.status).toBe("MISSING");
    expect(selectRecommendations([r])).toEqual([]);
  });
  it("never treats strong wind with excessive gusts as a suitable documented session", () => {
    const r = evaluateSpot(
      {
        ...spot,
        qualification: {
          ...spot.qualification!,
          eligible: true,
          status: "DOCUMENTED",
          discipline: "WATER_KITE",
          sectors: [{ from: 200, to: 270 }],
        },
      },
      forecast,
      criteria,
      time(0),
    );
    expect(r.weather?.windMax).toBe(41.7);
    expect(r.weather?.gustMax).toBe(79.6);
    expect(r.reasons.gusts).toBe(3);
    expect(r.windows).toEqual([]);
  });
  it("respects local days, daylight and elapsed intervals for weather maxima", () => {
    const r = evaluateSpot(spot, forecast, criteria, time(15));
    expect(r.weather).toMatchObject({
      samples: 1,
      windMax: 35.2,
      windPeakAt: time(15),
    });
    expect(
      evaluateSpot(spot, forecast, criteria, time(16)).weather,
    ).toBeUndefined();
    expect(
      evaluateSpot(
        spot,
        forecast,
        { ...criteria, startDate: "2026-10-24", endDate: "2026-10-24" },
        time(0),
      ).weather,
    ).toBeUndefined();
  });
  it("keeps missing gusts unknown while preserving usable wind forecasts", () => {
    const r = evaluateSpot(
      spot,
      {
        ...forecast,
        hours: forecast.hours.map((h) => ({
          ...h,
          gust: null,
          direction: null,
        })),
      },
      criteria,
      time(0),
    );
    expect(r.weather).toMatchObject({
      windMax: 41.7,
      gustMax: null,
      gustPeakAt: null,
      gustsAboveThreshold: false,
    });
    expect(r.windows).toEqual([]);
    expect(evaluateSpot(spot, null, criteria, time(0)).weather).toBeUndefined();
  });
  it("finds Saint-Blaise using abbreviations and accents within the returned list", () => {
    for (const query of [
      "St-Blaise",
      "st blaise",
      "Saint Blaise",
      "BLAISE",
      "Neuchatel",
      "",
    ])
      expect(plannerSpotMatches(spot, query)).toBe(true);
    expect(plannerSpotMatches(spot, "Lugano")).toBe(false);
  });
});
