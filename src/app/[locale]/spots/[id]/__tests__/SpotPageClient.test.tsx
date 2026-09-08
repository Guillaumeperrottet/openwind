import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SpotPageClient } from "../SpotPageClient";

const state = vi.hoisted(() => ({ locale: "fr" }));

vi.mock("next-intl", () => ({
  useLocale: () => state.locale,
  useTranslations: () => (key: string) => key,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));
vi.mock("@/lib/FavContext", () => ({
  useFavContext: () => ({ favoriteIds: new Set(), toggleFavorite: vi.fn() }),
}));
vi.mock("@/lib/useSpotLive", () => ({ useSpotLive: () => ({ data: null }) }));
vi.mock("@/components/spot/useNearbyStations", () => ({
  useNearbyStations: () => ({ nearbyStations: [], loadingStations: false }),
}));

const spot: ComponentProps<typeof SpotPageClient>["spot"] = {
  id: "test-spot",
  name: "Spot du lac",
  description: "Une plage pour naviguer par bise.",
  descriptionEn: "A beach for northeasterly winds.",
  descriptionDe: "Ein Strand für die Bise.",
  descriptionIt: "Una spiaggia per la bise.",
  access: "Accès par le sentier public.",
  accessEn: "Access via the public footpath.",
  accessDe: "Zugang über den öffentlichen Fussweg.",
  accessIt: "Accesso dal sentiero pubblico.",
  hazards: "Attention aux arbres près du départ.",
  hazardsEn: "Watch for trees near the launch.",
  hazardsDe: "Bäume am Startplatz beachten.",
  hazardsIt: "Attenzione agli alberi alla partenza.",
  latitude: 46.63,
  longitude: 7.08,
  country: "Suisse",
  region: "Fribourg",
  difficulty: "EXPERT",
  waterType: "CHOP",
  sportType: "KITE",
  minWindKmh: 15,
  maxWindKmh: 35,
  bestMonths: ["5", "6"],
  bestWindDirections: [],
  nearestStationId: null,
  images: [{
    id: "photo-1", url: "https://example.com/spot.jpg", caption: "La mise à l’eau",
    credit: null, sourceUrl: null, license: null, licenseUrl: null,
  }],
  reports: [],
};

describe("spot details in the initial server HTML", () => {
  it.each([
    ["fr", spot.description, spot.access, spot.hazards],
    ["en", spot.descriptionEn, spot.accessEn, spot.hazardsEn],
    ["de", spot.descriptionDe, spot.accessDe, spot.hazardsDe],
    ["it", spot.descriptionIt, spot.accessIt, spot.hazardsIt],
  ])("includes the %s details without a click, while keeping mobile collapsed", (locale, description, access, hazards) => {
    state.locale = locale!;
    const html = renderToStaticMarkup(<SpotPageClient spot={spot} live={null} />);
    expect(html).toContain('aria-expanded="false" aria-controls="spot-info-details"');
    expect(html).toContain('<div id="spot-info-details" hidden="">');
    expect(html).toContain(description);
    expect(html).toContain(access);
    expect(html).toContain(hazards);
    expect(html).toContain("Fribourg, Suisse");
    expect(html).toContain('src="https://example.com/spot.jpg"');
    expect(html).toContain('alt="La mise à l’eau" loading="lazy"');
    expect(html.match(/id="spot-info-details"/g)).toHaveLength(1);
  });

  it.each([null, "", " \n "])("keeps the original details when translations are empty (%j)", (translation) => {
    state.locale = "en";
    const html = renderToStaticMarkup(
      <SpotPageClient spot={{ ...spot, descriptionEn: translation, accessEn: translation, hazardsEn: translation }} live={null} />,
    );
    expect(html).toContain(spot.description);
    expect(html).toContain(spot.access);
    expect(html).toContain(spot.hazards);
  });

  it("handles spots without descriptions or photos", () => {
    state.locale = "fr";
    const html = renderToStaticMarkup(
      <SpotPageClient spot={{ ...spot, description: null, access: null, hazards: null, images: [] }} live={null} />,
    );
    expect(html).toContain('id="spot-info-details"');
    expect(html).not.toContain("https://example.com/spot.jpg");
  });
});
