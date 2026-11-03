import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import fixture from "./fixtures/alplakes-gruyere.json";
import { gruyereRequestRange, parseAlplakesTemperature, waterTemperatureView } from "@/lib/lake-temperature";
import { WaterTemperatureCard } from "@/components/spot/WaterTemperatureCard";

const now = Date.parse("2026-11-03T08:00:00Z");
const range = { startMs: Date.parse("2026-11-03T00:00:00Z"), endMs: Date.parse("2026-11-06T00:00:00Z") };
const series = () => parseAlplakesTemperature(fixture.series, range);

describe("actual Alplakes Gruyère response", () => {
  it("accepts the advertised 1D model and stays within its date coverage", () => {
    expect(gruyereRequestRange(fixture.metadata, now)).toMatchObject({ start: "202611020000", end: "202611060000" });
    expect(() => gruyereRequestRange({ ...fixture.metadata, name: "geneva" }, now)).toThrow();
    expect(() => gruyereRequestRange(fixture.metadata, Date.parse("2026-11-10T00:00Z"))).toThrow();
  });
  it("reads the real API schema and selects the last model time before now", () => {
    const data = series();
    expect(data.depthM).toBe(1);
    expect(data.points).toHaveLength(24);
    expect(waterTemperatureView(data, now).current).toEqual({ time: "2026-11-03T07:00:02.880Z", temperatureC: 15.009 });
  });
  it("rejects a wrong depth or unit instead of relabelling it as 1 m in Celsius", () => {
    expect(() => parseAlplakesTemperature({ ...fixture.series, depth: { ...fixture.series.depth, data: 2 } }, range)).toThrow();
    expect(() => parseAlplakesTemperature({ ...fixture.series, variables: { T: { data: [280], unit: "K" } } }, range)).toThrow();
  });
  it("keeps zero, skips missing or implausible temperatures, and never chooses a future sample as current", () => {
    const raw = { ...fixture.series, time: fixture.series.time.slice(0, 4), variables: { T: { data: [null, 0, 100, 14], unit: "degC" } } };
    const data = parseAlplakesTemperature(raw, range);
    expect(data.points.map((p) => p.temperatureC)).toEqual([0, 14]);
    expect(waterTemperatureView(data, now).current?.temperatureC).toBe(0);
    expect(waterTemperatureView(data, range.startMs).current).toBeNull();
  });
  it("rejects malformed arrays and timezone-free times", () => {
    expect(() => parseAlplakesTemperature({ ...fixture.series, time: [] }, range)).toThrow();
    expect(() => parseAlplakesTemperature({ ...fixture.series, time: fixture.series.time.map((time) => time.split("+")[0]) }, range)).toThrow();
  });
  it("flags old estimates and hides temperatures older than 24 hours", () => {
    const data = { depthM: 1, points: [series().points[0]] };
    const time = Date.parse(data.points[0].time);
    expect(waterTemperatureView(data, time + 7 * 3600_000)).toMatchObject({ stale: true, current: data.points[0] });
    expect(waterTemperatureView(data, time + 25 * 3600_000).current).toBeNull();
  });
  it("groups only future available samples by the Swiss calendar day", () => {
    const view = waterTemperatureView(series(), now);
    expect(view.days[0]).toMatchObject({ date: "2026-11-03", min: 14.925, max: 15.034 });
    expect(view.days[0].first).toBe("2026-11-03T10:00:02.880Z");
    expect(view.days).toHaveLength(3);
  });
});

describe("water card", () => {
  it.each(["fr", "en", "de", "it"] as const)("identifies the model, depth, source and licence in %s", (locale) => {
    const html = renderToStaticMarkup(<WaterTemperatureCard series={series()} initialNow={now} locale={locale} />);
    expect(html).toContain("Simstrat");
    expect(html).toContain("1 m");
    expect(html).toContain("Alplakes / Eawag");
    expect(html).toContain("CC BY 4.0");
    expect(html).toMatch(/datetime="2026-11-03T07:00:02.880Z"/i);
    expect(html).not.toContain("lake.lindt.one");
  });
  it("shows absence rather than 0°C during an outage", () => {
    const html = renderToStaticMarkup(<WaterTemperatureCard series={null} initialNow={now} locale="fr" />);
    expect(html).toContain("Estimation momentanément indisponible");
    expect(html).not.toContain("0,0");
    expect(html).not.toContain("<table");
  });
});

vi.mock("server-only", () => ({}));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
describe("server fetch and fair use", () => {
  it("coalesces requests and caches them, using only the official API with a named client", async () => {
    const fetcher = vi.fn(async (url: string) => new Response(JSON.stringify(url.includes("/metadata/") ? fixture.metadata : fixture.series), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    const { getGruyereWaterTemperature } = await import("@/lib/alplakes");
    const [first, second] = await Promise.all([getGruyereWaterTemperature(now), getGruyereWaterTemperature(now)]);
    expect(first).toEqual(second);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await getGruyereWaterTemperature(now + 60_000);
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const [url, options] of fetcher.mock.calls as unknown as [string, RequestInit & { next: { revalidate: number } }][]) {
      expect(url).toMatch(/^https:\/\/alplakes-api\.eawag\.ch\/simulations\/1d\//);
      expect(options.headers).toMatchObject({ "User-Agent": expect.stringContaining("Openwind/") });
      expect(options.next.revalidate).toBe(86400);
    }
  });
  it("does not repeatedly call a failing API, and respects Retry-After", async () => {
    const fetcher = vi.fn(async () => new Response("rate limited", { status: 429, headers: { "Retry-After": "3600" } }));
    vi.stubGlobal("fetch", fetcher);
    const { getGruyereWaterTemperature } = await import("@/lib/alplakes");
    const time = Date.now();
    expect(await getGruyereWaterTemperature(time)).toBeNull();
    expect(await getGruyereWaterTemperature(time + 10 * 60_000)).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("isolates an invalid provider response from the wind page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const { getGruyereWaterTemperature } = await import("@/lib/alplakes");
    expect(await getGruyereWaterTemperature(now)).toBeNull();
  });
});
