import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WindProvenance, type WindProvenanceData } from "@/components/spot/WindProvenance";

const state = vi.hoisted(() => ({ locale: "fr" }));
vi.mock("next-intl", () => ({ useLocale: () => state.locale }));
const station: WindProvenanceData = {
  source: "station", network: "meteoswiss", stationId: "VEV",
  updatedAt: "2026-11-02T08:00:00Z", isFresh: true,
};

describe("wind provenance shown beside values", () => {
  it.each([
    ["fr", "Vent mesuré", "Vent estimé"],
    ["en", "Measured wind", "Estimated wind"],
    ["de", "Gemessener Wind", "Geschätzter Wind"],
    ["it", "Vento misurato", "Vento stimato"],
  ])("distinguishes observations and model estimates in %s", (locale, observed, estimated) => {
    state.locale = locale;
    const measurement = renderToStaticMarkup(<WindProvenance live={station} />);
    expect(measurement).toContain(observed);
    expect(measurement).toContain("MeteoSwiss · VEV");
    expect(measurement).toMatch(/datetime="2026-11-02T08:00:00Z"/i);
    const model = renderToStaticMarkup(<WindProvenance live={{ ...station, source: "openmeteo" }} />);
    expect(model).toContain(estimated);
    expect(model).toContain("Open-Meteo");
    expect(model).not.toContain("MeteoSwiss");
    expect(model).not.toContain("VEV");
  });
  it("keeps old measurements identifiable and flags their age", () => {
    state.locale = "fr";
    const html = renderToStaticMarkup(<WindProvenance live={{ ...station, isFresh: false }} />);
    expect(html).toContain("Vent mesuré");
    expect(html).toContain("Données anciennes");
  });
  it("handles a missing network and invalid timestamp without inventing a provider", () => {
    state.locale = "fr";
    const html = renderToStaticMarkup(<WindProvenance live={{ ...station, network: undefined, updatedAt: "invalid" }} />);
    expect(html).toContain("Vent mesuré · Balise");
    expect(html).not.toContain("MeteoSwiss");
    expect(html).not.toMatch(/datetime="invalid"/i);
  });
});
