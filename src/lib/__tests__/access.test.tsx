import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { accessRoute, journeyKey, safeReturnPath } from "../access";
import { WebcamDirectory } from "@/components/ui/WebcamDirectory";
import { TemperatureDirectoryReading } from "@/components/lake/TemperatureDirectoryReading";
import TemperaturesPage from "@/app/[locale]/temperatures/page";
import WebcamsPage, { generateMetadata as webcamMetadata } from "@/app/[locale]/webcams/page";

vi.mock("next-intl", () => ({ useLocale: () => "fr" }));
vi.mock("server-only", () => ({}));
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key }));
vi.mock("@/i18n/navigation", () => ({ Link: ({ href, locale = "fr", prefetch, ...props }: ComponentProps<"a"> & { locale?: string; prefetch?: boolean }) => { void prefetch; return createElement("a", { ...props, href: `/${locale}${href}` }); } }));
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("public return destinations", () => {
  it.each(["https://evil.test/fr/carnet", "//evil.test/fr/carnet", "javascript:alert(1)", "/fr/admin", "/api/users", "/fr/reset-password?token=abc", "/fr/webcams%2f..%2fadmin", "/fr/spots%5cadmin", "/fr/\\evil", "/fr/../admin"])("rejects %s", (href) => expect(safeReturnPath(href, "fr")).toBeNull());
  it("preserves filtered pages, locales and section anchors while keeping canonical links in the local site", () => {
    expect(safeReturnPath("https://www.openwind.ch/de/vent-en-direct/lac-leman#vent-direct", "fr")).toBe("/de/vent-en-direct/lac-leman#vent-direct");
    expect(safeReturnPath("/carnet?q=bise&page=2#collection-results", "fr")).toBe("/fr/carnet?q=bise&page=2#collection-results");
    expect(safeReturnPath("/fr/webcams?lat=46.63&back=%2Ffr%2Fwebcams%3Fq%3DGruyere", "fr")).toContain("back=%2Ffr%2Fwebcams");
  });
  it("drops credentials and unrecognised fragments", () => {
    expect(safeReturnPath("/fr/plan?minWind=12&token=secret&email=a#access_token=secret", "fr")).toBe("/fr/plan?minWind=12");
  });
  it("ignores back parameters and anchors when identifying a destination", () => {
    expect(journeyKey("/fr/webcams?lng=7&lat=46&back=%2Fspots%2F1#cameras")).toBe(journeyKey("/fr/webcams?lat=46&lng=7"));
  });
});

describe("consistent public wayfinding", () => {
  it.each(["/temperatures", "/lacs/gruyere", "/webcams", "/vent-en-direct", "/vent-en-direct/lac-leman", "/carnet", "/carnet/bise", "/forum", "/forum/kite", "/forum/kite/topic", "/about", "/spots/new"])("places %s within Explorer", path => {
    const route = accessRoute(`/de${path}`, "de");
    expect(route.frame).toBe(true);
    expect(route.crumbs[0]).toMatchObject({ href: "/de/explorer" });
    expect(route.parent?.href).not.toBe(`/de${path}`);
  });
  it.each(["/", "/explorer", "/balises", "/stations/PRE", "/spots/morlon", "/spots/morlon/edit", "/admin/articles"])("preserves the established layout on %s", path => expect(accessRoute(path, "fr").frame).toBe(false));
  it("provides useful direct-entry parents without inventing browsing history", () => {
    expect(accessRoute("/fr/lacs/gruyere", "fr").parent?.href).toBe("/fr/temperatures");
    expect(accessRoute("/fr/forum/kite/123", "fr").parent?.href).toBe("/fr/forum/kite");
    expect(accessRoute("/fr/plan", "fr").parent).toBeUndefined();
  });
});

describe("context retained during a visit", () => {
  it("retains filters and the original locale across successive pages, resets primary destinations and limits stored history", async () => {
    vi.resetModules();
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("sessionStorage", { getItem: (key: string) => storage.get(key), setItem: (key: string, value: string) => storage.set(key, value) });
    const { rememberJourney, journeyReturn } = await import("../journey-store");
    rememberJourney("/fr/carnet/article", { href: "/en/carnet?page=2&q=bise#collection-results", title: "Carnet" }, "fr");
    expect(journeyReturn("/fr/carnet/article")?.href).toBe("/en/carnet?page=2&q=bise#collection-results");
    rememberJourney("/fr/carnet/article", { href: "https://evil.test", title: "Bad" }, "fr");
    expect(journeyReturn("/fr/carnet/article")?.title).toBe("Carnet");
    rememberJourney("/fr/carnet/article", null, "fr");
    expect(journeyReturn("/fr/carnet/article")).toBeNull();
    for (let i = 0; i < 45; i++) rememberJourney(`/fr/spots/${i}`, { href: "/fr/explorer", title: "Explorer" }, "fr");
    expect(Object.keys(JSON.parse(storage.get("openwind-journeys-v1")!))).toHaveLength(40);
  });
  it("still works when storage is denied", async () => {
    vi.resetModules();
    vi.stubGlobal("window", {});
    vi.stubGlobal("sessionStorage", { getItem: () => { throw Error("denied"); }, setItem: () => { throw Error("denied"); } });
    const { rememberJourney, journeyReturn } = await import("../journey-store");
    rememberJourney("/fr/lacs/gruyere", { href: "/fr/temperatures", title: "Eau" }, "fr");
    expect(journeyReturn("/fr/lacs/gruyere")?.href).toBe("/fr/temperatures");
  });
});

describe("useful entry pages without invented observations", () => {
  it("indexes the webcam directory while keeping searches out of the index", async () => {
    const params = Promise.resolve({ locale: "fr" });
    expect((await webcamMetadata({ params, searchParams: Promise.resolve({}) })).robots).toMatchObject({ index: true });
    expect((await webcamMetadata({ params, searchParams: Promise.resolve({ q: "gruyere" }) })).robots).toMatchObject({ index: false });
    expect((await webcamMetadata({ params, searchParams: Promise.resolve({ lat: "46", lng: "7" }) })).robots).toMatchObject({ index: false });
  });
  it("finds webcam places without accents and returns to the filtered directory", () => {
    const html = renderToStaticMarkup(<WebcamDirectory locale="fr" query="gruyere" />);
    expect(html).toContain("Lac de la Gruyère");
    expect(html).not.toContain("Lac Léman");
    expect(html).toContain("back=%2Ffr%2Fwebcams%3Fq%3Dgruyere");
    expect(html).toContain("lat=46.63");
    expect(renderToStaticMarkup(<WebcamDirectory locale="fr" query="unknown-lake" />)).toContain("Aucun lieu");
  });
  it.each([{}, { lat: "46bad", lng: "7" }, { lat: "999", lng: "7" }, { lat: "46", lng: "" }])("opens a directory for missing or invalid coordinates %j without calling Windy", async params => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const result = await WebcamsPage({ params: Promise.resolve({ locale: "fr" }), searchParams: Promise.resolve(params) });
    expect(result.type).toBe(WebcamDirectory);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses the official source when the local lake page is disabled in production", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("ALPLAKES_LAKE_PAGE_ENABLED", "false");
    const html = renderToStaticMarkup(await TemperaturesPage({ params: Promise.resolve({ locale: "fr" }) }));
    expect(html).not.toContain('href="/fr/lacs/gruyere"');
    expect(html).toContain("https://www.alplakes.eawag.ch/gruyere");
    expect(html).toContain("CC BY 4.0");
  });
  it("shows absence rather than zero, preserves real zero and hides obsolete estimates", () => {
    const now = Date.parse("2026-11-03T08:00Z");
    const render = (series: ComponentProps<typeof TemperatureDirectoryReading>["series"]) => renderToStaticMarkup(<TemperatureDirectoryReading series={series} initialNow={now} locale="fr" />);
    expect(render(null)).toContain("indisponible");
    expect(render({ depthM: 1, points: [{ time: "2026-11-03T07:00Z", temperatureC: 0 }] })).toContain("0,0");
    expect(render({ depthM: 1, points: [{ time: "2026-11-01T07:00Z", temperatureC: 15 }] })).toContain("indisponible");
  });
});
