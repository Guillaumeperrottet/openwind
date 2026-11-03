import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { navigationSection, PRIMARY_NAVIGATION } from "@/lib/navigation";
import { lakePageEnabled } from "@/lib/lake-page-enabled";
import { explorerPlaces } from "@/lib/explorer";
import ExplorerPage, { generateMetadata } from "@/app/[locale]/explorer/page";

vi.mock("@/components/search/GlobalSearch", () => ({ GlobalSearch: () => createElement("input", { "aria-label": "Search all Openwind" }) }));
vi.mock("@/components/navigation/PlaceActions", () => ({ PlaceActions: () => createElement("div", null, ...["balises", "webcams", "temperatures"].map(path => createElement("a", { key: path, href: `/${context.locale}/${path}` }, path))) }));

const context = vi.hoisted(() => ({ locale: "fr" }));
vi.mock("@/i18n/navigation", () => ({ Link: ({ locale = context.locale, href, prefetch, ...props }: ComponentProps<"a"> & { locale?: string; prefetch?: boolean }) => {
  void prefetch;
  return createElement("a", { ...props, href: `/${locale}${href}` });
} }));
vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string; alt: string }) => createElement("img", { src, alt }) }));
afterEach(() => { vi.unstubAllEnvs(); context.locale = "fr"; });

describe("four stable navigation destinations", () => {
  it("uses the same ordered destinations for desktop and mobile", () => {
    expect(PRIMARY_NAVIGATION.map(d => d.href)).toEqual(["/?view=map", "/explorer", "/plan", "/mon-openwind"]);
  });
  it.each([
    ["/explorer", "explore"], ["/lacs/gruyere", "explore"], ["/vent-en-direct/lac-leman", "explore"],
    ["/balises", "explore"], ["/webcams", "explore"], ["/carnet/vent", "explore"], ["/forum/kite/topic", "explore"],
    ["/spots/new", "explore"], ["/spots/morlon", "map"], ["/plan", "plan"], ["/mon-openwind", "personal"],
    ["/admin", null], ["/planet", null],
  ])("keeps the appropriate section selected on %s", (path, expected) => expect(navigationSection(path)).toBe(expected));
  it("honours explicit map links before saved launch preferences", () => {
    const dashboard = { onboardingCompleted: true, defaultView: "DASHBOARD" };
    expect(navigationSection("/", "map", dashboard)).toBe("map");
    expect(navigationSection("/", null, dashboard)).toBe("personal");
    expect(navigationSection("/", null, { onboardingCompleted: true, defaultView: "MAP" })).toBe("map");
    expect(navigationSection("/", "home", dashboard)).toBe("explore");
    expect(navigationSection("/")).toBe("explore");
  });
});

describe("Explorer remains usable without an account or provider API", () => {
  it.each(["fr", "en", "de", "it"] as const)("provides conditions, guides, articles and contributions in %s", async (locale) => {
    context.locale = locale;
    const html = renderToStaticMarkup(await ExplorerPage({ params: Promise.resolve({ locale }) }));
    for (const path of ["/balises", "/webcams", "/forum", "/spots/new", "/about"]) expect(html).toContain(`/${locale}${path}`);
    expect(html).toContain('/fr/carnet');
    expect(html).toContain("/vent-en-direct/lac-leman");
    expect(html).toContain("/vent-en-direct/lac-de-neuchatel");
    expect(html).toContain("/vent-en-direct/lac-de-zurich");
    expect(html).not.toMatch(/undefined|NaN/);
    const metadata = await generateMetadata({ params: Promise.resolve({ locale }) });
    expect(metadata.alternates?.canonical).toBe(`https://www.openwind.ch/${locale}/explorer`);
    if (locale === "en") expect(html).toContain("In French");
  });
  it("never links to the disabled water prototype in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALPLAKES_LAKE_PAGE_ENABLED", "false");
    const html = renderToStaticMarkup(await ExplorerPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(html).not.toContain("/lacs/gruyere");
    expect(html).toContain('/fr/vent-en-direct/lac-de-la-gruyere');
    expect(lakePageEnabled()).toBe(false);
  });
  it("makes the public water page available by default and retains an explicit opt-out", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALPLAKES_LAKE_PAGE_ENABLED", "true");
    expect(lakePageEnabled()).toBe(true);
    expect(renderToStaticMarkup(await ExplorerPage({ params: Promise.resolve({ locale: "fr" }) }))).toContain('/fr/temperatures');
    expect(lakePageEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(lakePageEnabled({ NODE_ENV: "production" })).toBe(true);
    expect(lakePageEnabled({ NODE_ENV: "production", ALPLAKES_LAKE_PAGE_ENABLED: "false" })).toBe(false);
  });
  it("uses existing destinations, with explicit French fallback for English guides", () => {
    expect(explorerPlaces("fr").map(p => p.slug)).toHaveLength(4);
    expect(explorerPlaces("en").every(p => p.language === "fr")).toBe(true);
    expect(explorerPlaces("de").every(p => p.language === "de")).toBe(true);
  });
});
