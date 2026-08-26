import { describe, expect, it } from "vitest";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  normalizeDashboardLayout,
  shouldOnboardAccount,
} from "@/lib/user-preferences";

describe("Mon Openwind preferences", () => {
  it("shows the one-time choice only to accounts created after launch", () => {
    expect(shouldOnboardAccount("2026-08-26T08:59:59Z")).toBe(false);
    expect(shouldOnboardAccount("2026-08-26T09:00:00Z")).toBe(true);
    expect(shouldOnboardAccount("2027-01-01T08:00:00Z")).toBe(true);
    expect(shouldOnboardAccount(undefined)).toBe(false);
  });

  it("keeps a valid custom module order", () => {
    expect(
      normalizeDashboardLayout(["ARTICLES", "FAVORITES", "COMMUNITY"]),
    ).toEqual(["ARTICLES", "FAVORITES", "COMMUNITY"]);
  });

  it("drops invalid and duplicate modules and restores an empty layout", () => {
    expect(
      normalizeDashboardLayout([
        "FAVORITES",
        "UNKNOWN",
        "FAVORITES",
        "FORECAST",
      ]),
    ).toEqual(["FAVORITES", "FORECAST"]);
    expect(normalizeDashboardLayout([])).toEqual(DEFAULT_DASHBOARD_LAYOUT);
  });
});
