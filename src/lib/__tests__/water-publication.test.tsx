import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlaceActions } from "@/components/navigation/PlaceActions";
import { PublicFeaturesProvider } from "../public-features";
const mocks = vi.hoisted(() => ({ temperature: vi.fn() }));
vi.mock("@/lib/alplakes", () => ({ getGruyereWaterTemperature: mocks.temperature }));
vi.mock("next-intl", () => ({ useLocale: () => "fr" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/fr/explorer" }));
vi.mock("@/lib/place-store", () => ({ useSelectedPlace: () => null, selectPlace: vi.fn() }));
import { WaterTemperature, WaterTemperatureLoading } from "@/components/spot/WaterTemperature";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("water publication uses the shared feature switch", () => {
  it("hides both the estimate and its loading placeholder before any provider call", async () => {
    vi.stubEnv("ALPLAKES_LAKE_PAGE_ENABLED", "false");
    expect(await WaterTemperature({ locale: "fr" })).toBeNull();
    expect(WaterTemperatureLoading({ locale: "fr" })).toBeNull();
    expect(mocks.temperature).not.toHaveBeenCalled();
  });
  it("keeps wind and webcams accessible outside the public feature provider", () => {
    const html = renderToStaticMarkup(<PlaceActions />);
    expect(html).toContain('href="/fr/balises"'); expect(html).toContain('href="/fr/webcams"');
    expect(html).not.toContain("/temperatures"); expect(html).not.toContain("Eau");
  });
  it("exposes the restored water shortcuts through the public feature provider", () => {
    expect(renderToStaticMarkup(<PublicFeaturesProvider water><PlaceActions /></PublicFeaturesProvider>)).toContain('href="/fr/temperatures"');
  });
});
