import { useContext, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { FavoriteContext } from "@/lib/favorite-context";
import { DEFAULT_PREFERENCES } from "@/lib/user-preferences";
import type { PlannerResult } from "@/lib/planner";
import { ExplainedWindow } from "@/components/dashboard/PersonalForecast";
import fr from "../../../messages/fr.json";
import en from "../../../messages/en.json";
import de from "../../../messages/de.json";
import itMessages from "../../../messages/it.json";
vi.mock("@/i18n/navigation", () => ({ Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a> }));

const spot: PlannerResult = {
  id: "example", name: "Yvonand", latitude: 46.8, longitude: 6.7, sportType: "KITE", region: null, country: "CH",
  minWindKmh: 20, maxWindKmh: 40, bestWindDirections: ["NE"], distanceKm: null, access: null, hazards: null,
  timezone: "Europe/Zurich", retrievedAt: "2026-11-02T09:00:00Z", unavailable: false, reasons: {},
  qualification: { eligible: true, status: "DOCUMENTED", discipline: "WATER_KITE", note: "Accès conditionnel à vérifier", sectors: [{ from: 0, to: 90 }], sources: [{ title: "Club local", url: "https://example.org/local", covers: ["access"] }] },
  windows: [{ start: Date.parse("2026-11-03T10:00:00Z"), end: Date.parse("2026-11-03T13:00:00Z"), hours: 3, windMin: 24, windMax: 30, gustMax: 35, directions: [30, 45], score: 87 }],
};
function Units({ children, knots }: { children: ReactNode; knots: boolean }) {
  const value = useContext(FavoriteContext);
  return <FavoriteContext.Provider value={{ ...value, preferences: { ...DEFAULT_PREFERENCES, useKnots: knots } }}>{children}</FavoriteContext.Provider>;
}
describe("explained windows instead of ambiguous percentages", () => {
  it.each([["fr", fr], ["en", en], ["de", de], ["it", itMessages]] as const)("shows the actual interval, provider and evidence in %s", (locale, messages) => {
    const html = renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Los_Angeles"><Units knots={false}><ExplainedWindow spot={spot} window={spot.windows[0]} /></Units></NextIntlClientProvider>);
    expect(html).toContain("11:00–14:00");
    expect(html).toContain("24–30 km/h");
    expect(html).toContain("35 km/h");
    expect(html).toContain("22–40 km/h");
    expect(html).toContain("0°–90°");
    expect(html).toContain("https://example.org/local");
    expect(html).toContain(messages.ReturnExperience.forecastSource);
    expect(html).toContain(messages.ReturnExperience.whyWindow);
    expect(html).toContain("<details");
    expect(html).not.toContain("87%");
    expect(html).not.toContain("MISSING_MESSAGE");
  });
  it("uses the shared knots preference for values and threshold explanations", () => {
    const html = renderToStaticMarkup(<NextIntlClientProvider locale="fr" messages={fr} timeZone="Europe/Zurich"><Units knots><ExplainedWindow spot={spot} window={spot.windows[0]} /></Units></NextIntlClientProvider>);
    expect(html).toContain("13–16 kts");
    expect(html).toContain("12–22 kts");
    expect(html).toContain("19 kts");
  });
});
