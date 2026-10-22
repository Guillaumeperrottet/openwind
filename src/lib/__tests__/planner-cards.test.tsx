import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
import { ResultCard } from "@/components/plan/ResultCard";
import { comparisonReason, roundedWindRange } from "@/lib/planner-comparison";
import { plannerCopy } from "@/lib/planner-copy";
import { plannerUiCopy } from "@/lib/planner-ui-copy";
import type { PlannerResult } from "@/lib/planner";
const spot: PlannerResult = {
  id: "s",
  name: "Spot <test>",
  sportType: "KITE",
  latitude: 46,
  longitude: 7,
  region: "Neuchâtel",
  country: "CH",
  minWindKmh: 20,
  maxWindKmh: 40,
  bestWindDirections: ["N"],
  distanceKm: 10,
  access: null,
  hazards: null,
  qualification: {
    status: "DOCUMENTED",
    eligible: true,
    discipline: "WATER_KITE",
    note: "Conditions locales documentées",
    sources: [
      {
        title: "Club local",
        url: "https://example.org/local",
        covers: ["access"],
      },
    ],
    sectors: [{ from: 0, to: 45 }],
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
  },
  timezone: "Europe/Zurich",
  retrievedAt: "2026-10-22T12:00:00Z",
  windows: [
    {
      start: Date.parse("2026-10-24T10:00:00Z"),
      end: Date.parse("2026-10-24T13:00:00Z"),
      hours: 3,
      windMin: 24,
      windMax: 25,
      gustMax: 30,
      directions: [0],
      score: 80,
    },
  ],
  unavailable: false,
  reasons: {},
};
describe("compact, evidence-based cards", () => {
  it.each(["fr", "de", "it"] as const)(
    "keeps details and source evidence collapsed and localized in %s",
    (locale) => {
      const html = renderToStaticMarkup(
        <ResultCard
          spot={spot}
          rank={1}
          c={plannerCopy[locale]}
          locale={locale}
          comparison={[spot]}
        />,
      );
      expect(html).toContain("<details");
      expect(html).not.toContain("<details open");
      expect(html).toContain(plannerUiCopy[locale].details);
      expect(html).toContain(plannerUiCopy[locale].documented);
      expect(html).toContain("Spot &lt;test&gt;");
      expect(html).toContain('href="https://example.org/local"');
      expect(html).not.toContain("13–13");
    },
  );
  it("does not show an undocumented profile as a ranked compatible recommendation", () => {
    const html = renderToStaticMarkup(
      <ResultCard
        spot={{ ...spot, qualification: undefined }}
        rank={1}
        c={plannerCopy.fr}
        locale="fr"
        comparison={[spot]}
      />,
    );
    expect(html).toContain("Profil à documenter");
    expect(html).not.toContain("Orientation compatible");
    expect(html).not.toContain("13 kts");
    expect(html).not.toContain(">01<");
    expect(html).toContain('href="/spots/s"');
  });
  it("makes comparative reasons true against the whole documented matching pool", () => {
    const longer = {
      ...spot,
      id: "longer",
      distanceKm: 20,
      windows: [{ ...spot.windows[0], hours: 5, score: 85 }],
    };
    expect(comparisonReason(spot, [spot, longer])).toBe("closest");
    expect(comparisonReason(longer, [spot, longer])).toBe("longest");
    expect(
      comparisonReason({ ...spot, qualification: undefined }, [spot]),
    ).toBeUndefined();
    expect(
      comparisonReason({ ...spot, distanceKm: null }, [
        { ...spot, distanceKm: null },
        longer,
      ]),
    ).toBe("alternative");
    expect(roundedWindRange(24, 25, 1.852)).toBe("13");
    expect(roundedWindRange(22, 30, 1.852)).toBe("12–16");
  });
});
