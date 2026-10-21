import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  GUIDE_LOCALES,
  LOCAL_GUIDES,
  guideAlternates,
  getLocalGuide,
} from "@/lib/local-guides";
import { LocalGuideTemplate } from "@/components/carnet/LocalGuideTemplate";
import {
  ForecastSummary,
  summarizeForecast,
} from "@/components/spot/ForecastSummary";
import type { LocalGuideData } from "@/lib/local-guide-data";
import type { FullForecast, HourlyPoint } from "@/lib/forecast";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ locale, ...props }: ComponentProps<"a"> & { locale?: string }) => (
    <a {...props} href={`/${locale ?? "fr"}${props.href}`} />
  ),
}));
vi.mock("@/components/carnet/ArticleReadTracker", () => ({
  ArticleReadTracker: () => null,
}));
vi.mock("@/components/carnet/ArticleShare", () => ({
  ArticleShare: () => null,
}));
vi.mock("@/components/carnet/RelatedArticles", () => ({
  RelatedArticles: () => null,
}));

const forecast: FullForecast = {
  fetchedAt: "2026-10-21T08:00:00Z",
  timezone: "Europe/Zurich",
  hasWaves: false,
  hourly: [
    { time: "2026-10-20T12:00", windSpeedKmh: 100, gustsKmh: 150 },
    { time: "2026-10-21T10:00", windSpeedKmh: 18.52, gustsKmh: 37.04 },
    { time: "2026-10-21T11:00", windSpeedKmh: 27.78, gustsKmh: 46.3 },
    { time: "2026-10-22T10:00", windSpeedKmh: 10, gustsKmh: 20 },
  ] as HourlyPoint[],
};

describe("local guides served without browser interaction", () => {
  it.each(
    LOCAL_GUIDES.flatMap((definition) =>
      GUIDE_LOCALES.map((locale) => ({ definition, locale })),
    ),
  )(
    "renders the $definition.slug $locale title, actual observation, timestamp, forecast and sources in server HTML",
    ({ definition, locale }) => {
      const translation = definition.translations[locale]!;
      const data: LocalGuideData = {
        definition,
        translation,
        locale,
        content: translation.content,
        coverImage: definition.coverImage,
        coverAlt: translation.coverAlt,
        author: "Openwind",
        sources: definition.sources,
        publishedAt: definition.publishedAt,
        updatedAt: definition.updatedAt,
        spots: definition.spotIds.map((id) => ({
          id,
          name: "Associated spot",
        })),
        stations: [
          {
            ...definition.stations[0],
            initialLive: {
              source: "station",
              stationId: definition.stations[0].id,
              network: definition.stations[0].source,
              staleAt: "2026-10-21T08:30:00Z",
              isFresh: true,
              windSpeedKmh: 18.52,
              gustsKmh: 37.04,
              windDirection: 180,
              updatedAt: "2026-10-21T08:00:00Z",
            },
          },
        ],
        forecast,
        relatedArticles: [],
      };
      const html = renderToStaticMarkup(<LocalGuideTemplate data={data} />);
      expect(html).toContain(translation.title);
      expect(html).toContain('dateTime="2026-10-21T08:00:00Z"');
      expect(html).toContain("19 km/h");
      expect(html).toContain("<table");
      expect(html).toContain('dateTime="2026-10-22"');
      expect(html).toContain(`href="${definition.sources[0].url}"`);
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
      if (!definition.spotIds.length) {
        expect(html).not.toContain("/spots/undefined");
        expect(html).not.toContain("Associated spot");
      }
      if (translation.spotsIntro) {
        expect(html).toContain(translation.spotsIntro);
        expect(html.indexOf(translation.spotsIntro)).toBeLessThan(
          html.indexOf(`/spots/${definition.spotIds[0]}`),
        );
      }
      const comparisonGuide: Record<string, string> = {
        "lac-des-quatre-cantons": "urnersee",
        "lac-de-brienz": "lac-de-thoune",
        "lac-de-sils": "lac-de-silvaplana",
      };
      if (comparisonGuide[definition.slug]) {
        expect(html).toContain(
          `href="/${locale}/vent-en-direct/${comparisonGuide[definition.slug]}"`,
        );
      }
      const schema = JSON.parse(
        html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1],
      );
      expect(schema["@graph"][0].inLanguage).toBe(`${locale}-CH`);
      expect(schema["@graph"][0].url).toBe(
        guideAlternates(definition, locale).canonical,
      );
    },
  );

  it("advertises only available translations with a self canonical", () => {
    const guide = LOCAL_GUIDES[0];
    expect(Object.keys(guideAlternates(guide, "de").languages).sort()).toEqual([
      "de",
      "fr",
      "it",
      "x-default",
    ]);
    expect(guideAlternates(guide, "de").canonical).toBe(
      "https://www.openwind.ch/de/vent-en-direct/lac-de-la-gruyere",
    );
    expect(getLocalGuide("not-a-published-guide")).toBeUndefined();
    expect(
      guideAlternates(
        { ...guide, translations: { fr: guide.translations.fr } },
        "fr",
      ).languages,
    ).not.toHaveProperty("de");
  });

  it("summarizes daily ranges without treating yesterday's wind as today's forecast", () => {
    expect(summarizeForecast(forecast)).toEqual([
      ["2026-10-21", { min: 18.52, max: 27.78, gusts: 46.3 }],
      ["2026-10-22", { min: 10, max: 10, gusts: 20 }],
    ]);
    expect(
      renderToStaticMarkup(
        <ForecastSummary forecast={{ ...forecast, hourly: [] }} locale="fr" />,
      ),
    ).toBe("");
  });
});
