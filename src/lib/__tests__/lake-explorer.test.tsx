import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import fixture from "./fixtures/alplakes-gruyere.json";
import { parseAlplakesTemperature } from "@/lib/lake-temperature";
import { lakeDisplayRange, lakeExplorerChart } from "@/lib/lake-explorer";
import { LakeTemperatureExplorer } from "@/components/lake/LakeTemperatureExplorer";

vi.mock("@/components/navigation/ContextDestination", () => ({ ContextDestination: ({ feature, ...props }: { feature?: string }) => { void feature; return createElement("a", props); } }));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, locale, ...props }: { href: string; locale?: string }) => {
    void locale;
    return createElement("a", { href, ...props });
  },
}));
const now = Date.parse("2026-11-03T08:00:00Z");
const series = parseAlplakesTemperature(fixture.series, { startMs: now - 48 * 3600_000, endMs: now + 72 * 3600_000 });

describe("lake timeline with real Alplakes data", () => {
  it("formats ranges consistently across renderers and collapses equal rounded temperatures", () => {
    expect(lakeDisplayRange("14,9", "15,0")).toBe("14,9 – 15,0");
    expect(lakeDisplayRange("14,9", "14,9")).toBe("14,9");
  });
  it("separates modelled past and forecast, with an explicit nonzero vertical scale", () => {
    const chart = lakeExplorerChart(series, now)!;
    expect(chart.segments.some((s) => !s.future)).toBe(true);
    expect(chart.segments.some((s) => s.future)).toBe(true);
    expect(chart.low).toBeLessThan(Math.min(...chart.points.map((p) => p.temperatureC)));
    expect(chart.high - chart.low).toBeGreaterThanOrEqual(2);
    expect(chart.nowX).toBeGreaterThan(0);
    expect(chart.nowX).toBeLessThan(600);
    const boundary = chart.segments.findIndex((s, index) => !s.future && chart.segments[index + 1]?.future);
    expect(boundary).toBeGreaterThanOrEqual(0);
    expect(chart.segments[boundary].path.split(" L ")[1]).toBe(chart.segments[boundary + 1].path.split(" L ")[0].replace("M ", ""));
  });
  it("does not bridge a model outage or invent a curve with one point", () => {
    const points = [series.points[0], series.points.at(-1)!];
    expect(lakeExplorerChart({ depthM: 1, points }, now)?.segments).toEqual([]);
    expect(lakeExplorerChart({ depthM: 1, points: points.slice(0, 1) }, now)).toBeNull();
    expect(lakeExplorerChart(null, now)).toBeNull();
  });
  it.each(["fr", "de", "it", "en"] as const)("has readable data, licence and functional exits in %s", (locale) => {
    const html = renderToStaticMarkup(<LakeTemperatureExplorer series={series} locale={locale} initialNow={now} />);
    expect(html).toContain("Simstrat");
    expect(html).toContain("CC BY 4.0");
    expect(html).toContain('href="https://www.alplakes.eawag.ch/gruyere"');
    expect(html).toContain('href="/spots/cmnq613tx00it04kw1d0vraq4"');
    expect(html).toContain("2026-11-03T07:00:02.880Z");
    expect(html).toContain("<table");
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it("keeps the outings and source links usable during an outage without showing 0°C", () => {
    const html = renderToStaticMarkup(<LakeTemperatureExplorer series={null} locale="fr" initialNow={now} />);
    expect(html).toContain("momentanément indisponible");
    expect(html).toContain("Voir le spot de Morlon");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<table");
    expect(html).not.toContain("0,0");
  });
  it("does not present forecasts as current when the last estimate is stale", () => {
    const old = { depthM: 1, points: [{ time: new Date(now - 8 * 3600_000).toISOString(), temperatureC: 14 }] };
    const html = renderToStaticMarkup(<LakeTemperatureExplorer series={old} locale="fr" initialNow={now} />);
    expect(html).toContain("Estimation ancienne");
    expect(html).toContain("Les données disponibles sont anciennes");
  });
});
