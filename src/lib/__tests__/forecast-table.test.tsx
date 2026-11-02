import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { useContext, type ReactNode } from "react";
import { FavoriteContext } from "@/lib/favorite-context";
import { DEFAULT_PREFERENCES } from "@/lib/user-preferences";
import { WindCompass } from "@/components/spot/WindCompass";
import { ForecastSummary } from "@/components/spot/ForecastSummary";
import { getWindData } from "@/lib/utils";
import { ForecastWithToggle } from "@/components/spot/ForecastWithToggle";
import type { FullForecast } from "@/lib/forecast";
import fr from "../../../messages/fr.json";
import en from "../../../messages/en.json";
import de from "../../../messages/de.json";
import itMessages from "../../../messages/it.json";

const forecast: FullForecast = {
  timezone: "Europe/Zurich", fetchedAt: "2026-11-02T08:00:00Z", hasWaves: false,
  hourly: [{
    time: "2026-11-02T09:00", windSpeedKmh: 24, windSpeedKnots: 13,
    gustsKmh: 48, gustsKnots: 26, windDirection: 55, temperatureC: 7,
    precipMmh: 0, cloudcover: 20, weathercode: 0, waveHeightM: null,
    wavePeriodS: null, waveDirection: null, isKitable: true, kitableScore: 1,
  }],
};

function Units({ children, useKnots }: { children: ReactNode; useKnots: boolean }) {
  const context = useContext(FavoriteContext);
  return <FavoriteContext.Provider value={{ ...context, preferences: { ...DEFAULT_PREFERENCES, useKnots } }}>{children}</FavoriteContext.Provider>;
}

describe("accessible, attributed hourly forecasts", () => {
  it("uses the same km/h preference in the table, compass and daily summary", () => {
    const html = renderToStaticMarkup(<NextIntlClientProvider locale="fr" messages={fr} timeZone="Europe/Zurich"><Units useKnots={false}>
      <ForecastWithToggle forecast={forecast} spotId="test" lat={46.8} lng={6.7} />
      <WindCompass wind={getWindData(24, 55, 48)} />
      <ForecastSummary forecast={forecast} locale="fr" />
    </Units></NextIntlClientProvider>);
    expect(html).toContain("Vent (km/h)");
    expect(html).toContain("Rafales (km/h)");
    expect(html).toMatch(/aria-label="Vent : 24 km\/h, rafales 48 km\/h/);
    expect(html).toContain("24–24 km/h");
    expect(html).not.toContain("Vent (kts)");
  });
  it.each([["fr", fr], ["en", en], ["de", de], ["it", itMessages]] as const)(
    "renders translated row headers and the actual provider in %s",
    (locale, messages) => {
      const html = renderToStaticMarkup(
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Zurich">
          <ForecastWithToggle forecast={forecast} spotId="test" lat={46.8} lng={6.7} />
        </NextIntlClientProvider>,
      );
      expect(html).toContain(messages.ForecastSources.global);
      expect(html).toContain(messages.ForecastTable.wind.replace("(kn)", "(kts)"));
      expect(html).toContain(messages.ForecastTable.gusts.replace("(kn)", "(kts)"));
      expect(html.match(/scope="row"/g)).toHaveLength(6);
      expect(html).toContain(`aria-label="${messages.ForecastTable.caption}"`);
      expect(html).toContain("Open-Meteo · CC BY 4.0");
      expect(html).not.toContain(messages.ForecastTable.legendGood);
    },
  );
});
