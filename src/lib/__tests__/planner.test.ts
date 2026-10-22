import { describe, it, expect } from "vitest";
import {
  addDays,
  candidatesInRadius,
  evaluateSpot,
  localDate,
  parsePlannerCriteria,
  quickDates,
  rankResults,
  selectRecommendations,
  type PlannerCriteria,
  type PlannerForecast,
  type PlannerSpot,
} from "@/lib/planner";

const criteria: PlannerCriteria = {
  startDate: "2026-10-25",
  endDate: "2026-10-25",
  sport: "KITE",
  radius: 500,
};
const spot: PlannerSpot = {
  id: "spot",
  name: "Test",
  latitude: 46.7,
  longitude: 6.8,
  region: null,
  country: "CH",
  sportType: "KITE",
  minWindKmh: 22,
  maxWindKmh: 40,
  bestWindDirections: ["N"],
  access: null,
  hazards: null,
  distanceKm: null,
  qualification: {
    status: "DOCUMENTED",
    eligible: true,
    discipline: "WATER_KITE",
    sources: [],
    note: "Test fixture",
    sectors: [{ from: 315, to: 45 }],
  },
};
const ms = (time: string) => Date.parse(`2026-10-25T${time}:00Z`);
function forecast(hours = [8, 9, 10, 11]): PlannerForecast {
  return {
    timezone: "Europe/Zurich",
    retrievedAt: "2026-10-22T12:00:00Z",
    daylight: [
      { date: "2026-10-25", sunrise: ms("07:30"), sunset: ms("17:15") },
    ],
    hours: hours.map((h) => ({
      time: ms(`${h.toString().padStart(2, "0")}:00`),
      wind: 30,
      gust: 35,
      direction: 0,
      rain: 0,
    })),
  };
}
const analyze = (data = forecast(), profile = spot, now = ms("00:00")) =>
  evaluateSpot(profile, data, criteria, now);

describe("planner input and calendar", () => {
  it("keeps Swiss local dates across UTC midnight and DST", () => {
    expect(localDate(new Date("2026-10-24T22:30:00Z"))).toBe("2026-10-25");
    expect(localDate(new Date("2026-10-25T23:30:00Z"))).toBe("2026-10-26");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
  });
  it("offers this weekend without moving Sunday into the past", () => {
    expect(quickDates("2026-10-22", "weekend")).toEqual([
      "2026-10-24",
      "2026-10-25",
    ]);
    expect(quickDates("2026-10-24", "weekend")).toEqual([
      "2026-10-24",
      "2026-10-25",
    ]);
    expect(quickDates("2026-10-25", "weekend")).toEqual([
      "2026-10-25",
      "2026-10-25",
    ]);
    expect(quickDates("2026-10-25", "week")).toEqual([
      "2026-10-25",
      "2026-10-31",
    ]);
  });
  it.each([
    "lat=Infinity&lng=6",
    "lat=NaN&lng=6",
    "lat=46",
    "lat=91&lng=6",
    "lat=&lng=0",
    "lat=0&lng=181",
    "radius=-1",
    "radius=Infinity",
    "radius=150km",
    "radius=1001",
    "sport=SKI",
    "startDate=2026-02-30",
    "startDate=2026-10-21",
    "endDate=2026-10-20",
    "endDate=2027-02-01",
    "endDate=2026-11-05",
  ])("rejects invalid criteria %s", (query) => {
    expect(
      parsePlannerCriteria(new URLSearchParams(query), "2026-10-22"),
    ).toBeNull();
  });
  it("accepts zero coordinates and a complete 14-day range", () => {
    expect(
      parsePlannerCriteria(
        new URLSearchParams("lat=0&lng=0&endDate=2026-11-04"),
        "2026-10-22",
      ),
    ).toMatchObject({ lat: 0, lng: 0, sport: "KITE" });
  });
});
describe("continuous model windows", () => {
  it("returns the actual continuous interval rather than adding separated hours", () => {
    expect(
      analyze(forecast([8, 9, 12, 13])).windows.map((w) => w.hours),
    ).toEqual([2, 2]);
  });
  it("clips sunrise, sunset and elapsed time", () => {
    const data = forecast([7, 8, 16, 17, 18]);
    expect(analyze(data).windows.map((w) => [w.start, w.end])).toEqual([
      [ms("07:30"), ms("09:00")],
      [ms("16:00"), ms("17:15")],
    ]);
    expect(analyze(forecast(), spot, ms("09:30")).windows[0]).toMatchObject({
      start: ms("09:30"),
      end: ms("12:00"),
      hours: 2.5,
    });
    expect(analyze(forecast(), spot, ms("12:00")).windows).toEqual([]);
  });
  it("does not call a short fragment a one-hour window", () => {
    expect(analyze(forecast([17])).windows).toEqual([]);
  });
  it("handles the repeated DST hour as distinct instants, and never merges local days", () => {
    const data = forecast();
    data.daylight = [
      { date: "2026-10-25", sunrise: ms("00:00"), sunset: ms("04:00") },
    ];
    data.hours = [0, 1, 2].map((h) => ({
      ...data.hours[0],
      time: ms(`0${h}:00`),
    }));
    expect(analyze(data).windows[0].hours).toBe(3);
    const twoDays = {
      ...data,
      daylight: [
        { date: "2026-10-25", sunrise: ms("22:00"), sunset: ms("23:00") },
        {
          date: "2026-10-26",
          sunrise: ms("23:00"),
          sunset: ms("23:00") + 7200000,
        },
      ],
      hours: [22, 23, 24].map((h) => ({
        ...data.hours[0],
        time: ms("00:00") + h * 3600000,
      })),
    };
    const windows = evaluateSpot(
      spot,
      twoDays,
      { ...criteria, endDate: "2026-10-26" },
      ms("00:00"),
    ).windows;
    expect(windows.map((w) => w.hours).sort()).toEqual([1, 2]);
  });
  it("does not double count duplicate samples", () => {
    const data = forecast();
    data.hours.push(data.hours[0]);
    expect(analyze(data).windows[0].hours).toBe(4);
  });
  it("rejects incompatible directions, including wrap-around at north", () => {
    const data = forecast();
    data.hours.forEach((h) => (h.direction = 180));
    expect(analyze(data).windows).toEqual([]);
    expect(analyze(data).reasons.orientation).toBe(4);
    data.hours.forEach((h) => (h.direction = 359));
    expect(analyze(data).windows[0].directions).toEqual([359]);
  });
  it("does not replace missing directions or gusts with favourable values", () => {
    expect(
      analyze(forecast(), {
        ...spot,
        qualification: { ...spot.qualification!, sectors: [] },
      }).windows,
    ).toEqual([]);
    const data = forecast();
    data.hours.forEach((h) => (h.gust = null));
    expect(analyze(data).reasons.missing).toBe(4);
  });
  it("retains actual directions rather than an ambiguous average of opposing winds", () => {
    const data = forecast();
    data.hours.forEach((h, i) => (h.direction = i % 2 ? 180 : 0));
    expect(
      analyze(data, {
        ...spot,
        qualification: {
          ...spot.qualification!,
          sectors: [
            { from: 315, to: 45 },
            { from: 135, to: 225 },
          ],
        },
      }).windows[0].directions,
    ).toEqual([0, 180]);
  });
  it("rejects excessive gust ratios even with otherwise ideal wind", () => {
    const data = forecast();
    data.hours.forEach((h) => {
      h.wind = 24;
      h.gust = 38;
    });
    expect(analyze(data).reasons.gusts).toBe(4);
    expect(analyze(data).windows).toEqual([]);
  });
  it("respects the narrower spot thresholds", () => {
    expect(analyze(forecast(), { ...spot, maxWindKmh: 28 }).reasons.wind).toBe(
      4,
    );
  });
  it("requires rain data and modest gusts for paragliding", () => {
    const data = forecast();
    data.hours.forEach((h) => {
      h.wind = 5;
      h.gust = 10;
    });
    const para = { ...spot, sportType: "PARAGLIDE" as const };
    expect(analyze(data, para).windows).toHaveLength(1);
    data.hours.forEach((h) => (h.rain = null));
    expect(analyze(data, para).windows).toEqual([]);
    data.hours.forEach((h) => (h.rain = 0.2));
    expect(analyze(data, para).reasons.rain).toBe(4);
  });
  it("ranks every candidate before selecting, with reproducible ties", () => {
    const all = Array.from({ length: 241 }, (_, i) => ({
      ...spot,
      id: `id-${i.toString().padStart(3, "0")}`,
      latitude: 46.7 + i * 0.0001,
    }));
    const candidates = candidatesInRadius(all, {
      ...criteria,
      lat: 46.7,
      lng: 6.8,
    });
    expect(candidates).toHaveLength(241);
    const ranked = rankResults(
      candidates.map((s, i) =>
        analyze(i === 240 ? forecast() : forecast([8]), s),
      ),
    );
    expect(ranked[0].id).toBe("id-240");
    const a = analyze(forecast(), { ...spot, id: "a" }),
      b = analyze(forecast(), { ...spot, id: "b" });
    expect(rankResults([b, a]).map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("filters by actual radius, including across the date line", () => {
    expect(
      candidatesInRadius(
        [
          { latitude: 0, longitude: -179.9 },
          { latitude: 0, longitude: 170 },
        ],
        { ...criteria, lat: 0, lng: 179.9, radius: 50 },
      ),
    ).toHaveLength(1);
    expect(
      candidatesInRadius([{ latitude: NaN, longitude: 6 }], criteria),
    ).toEqual([]);
  });
  it("offers distinct sectors without filling the shortlist with neighbouring launches", () => {
    const all = [
      spot,
      { ...spot, id: "neighbour", latitude: 46.701 },
      { ...spot, id: "other", latitude: 47 },
      { ...spot, id: "third", latitude: 48 },
      { ...spot, id: "fourth", latitude: 49 },
    ].map((s) => analyze(forecast(), s));
    expect(selectRecommendations(all).map((s) => s.id)).toEqual([
      "spot",
      "other",
      "third",
    ]);
    expect(selectRecommendations(all.slice(0, 2))).toHaveLength(1);
    expect(all).toHaveLength(5);
  });
});
