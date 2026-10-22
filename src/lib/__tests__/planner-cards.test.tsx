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
import { checkedSwissProfiles } from "@/lib/swiss-planner-profile-import";
import { qualifyReview } from "@/lib/planner-review";
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
    "shows sourced annual and exceptional closures in %s without a signup gate",
    (locale) => {
      const p = checkedSwissProfiles().find(
        (p) => p.spot.id === "swiss-kite-berlingen-eschlibach",
      )!;
      const review = {
        ...p.review,
        closures: [
          ...p.review.closures!,
          {
            ...p.review.closures![0],
            kind: "DATED" as const,
            start: "2026-10-25",
            end: "2026-10-25",
          },
        ],
      };
      const qualification = qualifyReview(
        review,
        review.fingerprint,
        "KITE",
        "2026-11-16",
        "2026-11-16",
        "2026-10-22",
        locale,
      );
      const html = renderToStaticMarkup(
        <ResultCard
          spot={{
            ...spot,
            ...p.spot,
            qualification,
            windows: [],
            weather: {
              windMin: 25,
              windMax: 27,
              gustMax: 30,
              windPeakAt: 1792922400000,
              gustPeakAt: 1792922400000,
              samples: 3,
              gustsAboveThreshold: false,
              windAboveThreshold: false,
            },
          }}
          locale={locale}
          c={plannerCopy[locale]}
          rank={1}
        />,
      );
      expect(html).toContain(plannerUiCopy[locale].status.CLOSED);
      expect(html).toContain(plannerUiCopy[locale].restrictions);
      expect(html).toContain(plannerUiCopy[locale].annual);
      expect(html).toContain(plannerUiCopy[locale].dated);
      expect(html).toContain("2026");
      expect(html).toContain("08:00–21:00");
      expect(html).toContain(review.closures[0].reason[locale]);
      expect(html).toContain(`href="${review.closures[0].sourceUrl}"`);
      expect(html).toContain(plannerUiCopy[locale].weatherMaxima);
      expect(html).not.toContain('href="/login');
      expect(html).not.toContain("01</span>");
    },
  );
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
  it.each(["fr", "de", "it"] as const)(
    "shows unreviewed weather with explicit excessive-gust information in %s",
    (locale) => {
      const html = renderToStaticMarkup(
        <ResultCard
          spot={{
            ...spot,
            name: "Saint-Blaise",
            qualification: undefined,
            windows: [],
            weather: {
              windMin: 3.3,
              windMax: 41.7,
              gustMax: 79.6,
              windPeakAt: Date.parse("2026-10-23T14:00:00Z"),
              gustPeakAt: Date.parse("2026-10-23T15:00:00Z"),
              samples: 11,
              gustsAboveThreshold: true,
              windAboveThreshold: false,
            },
          }}
          c={plannerCopy[locale]}
          locale={locale}
        />,
      );
      expect(html).toContain("Saint-Blaise");
      expect(html).toContain("23 kts");
      expect(html).toContain("43 kts");
      expect(html).toContain(plannerUiCopy[locale].highGusts);
      expect(html).toContain(plannerUiCopy[locale].weatherMaxima);
      expect(html).not.toContain(plannerCopy[locale].direction);
      expect(html).toContain(plannerUiCopy[locale].status.MISSING);
    },
  );
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
