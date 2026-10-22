import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchPlannerForecasts,
  fetchPlannerSeasonal,
  parsePlannerForecast,
  parsePlannerSeasonal,
} from "@/lib/planner-forecast";

const at = "2026-10-22T12:00:00Z";
const data = () => ({
  timezone: "Europe/Zurich",
  hourly: {
    time: [1792915200, 1792918800],
    wind_speed_10m: [null, 30],
    wind_direction_10m: [null, 0],
    wind_gusts_10m: [null, 35],
    precipitation: [null, 0],
  },
  daily: { sunrise: [1792909800], sunset: [1792947600] },
});
afterEach(() => vi.unstubAllGlobals());
describe("planner provider adapter", () => {
  it("retains UTC instants and missing cells without turning them into calm wind", () => {
    const result = parsePlannerForecast(data(), at)!;
    expect(result.hours[0]).toMatchObject({
      time: 1792915200000,
      wind: null,
      gust: null,
      direction: null,
      rain: null,
    });
    expect(result.hours[1].direction).toBe(0);
    expect(result.timezone).toBe("Europe/Zurich");
  });
  it("rejects wholly missing weather, daylight or an invalid timezone", () => {
    expect(
      parsePlannerForecast({ ...data(), timezone: "not/a-zone" }, at),
    ).toBeNull();
    expect(parsePlannerForecast({ ...data(), daily: {} }, at)).toBeNull();
    const broken = data();
    broken.hourly.wind_speed_10m = [null, null];
    expect(parsePlannerForecast(broken, at)).toBeNull();
  });
  it("batches every unique coordinate, maps duplicates and exposes partial failures", async () => {
    const fetcher = vi.fn(async (url: string) => {
      const query = new URL(url).searchParams;
      expect(query.get("timeformat")).toBe("unixtime");
      expect(query.get("timezone")).toBe("auto");
      return Response.json(
        query
          .get("latitude")!
          .split(",")
          .map((_, i) => (i === 0 ? null : data())),
      );
    });
    vi.stubGlobal("fetch", fetcher);
    const coords = Array.from({ length: 241 }, (_, i) => ({
      latitude: i / 100,
      longitude: 6,
    }));
    const result = await fetchPlannerForecasts(
      [...coords, coords[2]],
      "2026-10-25",
      "2026-10-25",
    );
    expect(fetcher).toHaveBeenCalledTimes(7);
    expect(result).toHaveLength(242);
    expect(result[0]).toBeNull();
    expect(result[240]).toBeNull();
    expect(result[241]).toEqual(result[2]);
  });
  it("retries a transient failure once and leaves errors distinct from no matching weather", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(Response.json(data()));
    vi.stubGlobal("fetch", fetcher);
    expect(
      (
        await fetchPlannerForecasts(
          [{ latitude: 46, longitude: 6 }],
          "2026-10-25",
          "2026-10-25",
        )
      )[0],
    ).not.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("does not retry provider validation errors", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("bad", { status: 400 }));
    vi.stubGlobal("fetch", fetcher);
    expect(
      await fetchPlannerForecasts(
        [{ latitude: 46, longitude: 6 }],
        "2026-10-25",
        "2026-10-25",
      ),
    ).toEqual([null]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not fabricate sessions or percentages from daily historical maxima", async () => {
    const archive = {
      daily: {
        time: ["2025-10-01", "2025-10-02", "2025-11-01", "2025-10-03"],
        wind_speed_10m_max: [20, 30, 80, null],
        wind_gusts_10m_max: [30, 40, 90, 50],
      },
    };
    expect(parsePlannerSeasonal(archive, new Set([10]), [2021, 2025])).toEqual({
      wind: 25,
      gust: 35,
      days: 2,
      years: [2021, 2025],
    });
    const fetcher = vi.fn().mockResolvedValue(Response.json(archive));
    vi.stubGlobal("fetch", fetcher);
    const result = await fetchPlannerSeasonal(
      [{ latitude: 46, longitude: 6 }],
      new Set([10]),
      2026,
    );
    expect(result[0]).not.toHaveProperty("windows");
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get("end_date")).toBe(
      "2025-12-31",
    );
  });
});
