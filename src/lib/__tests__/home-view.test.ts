import { describe, expect, it } from "vitest";
import { resolveHomeView } from "../home-view";

describe("home and map launch preferences", () => {
  it("shows discovery for visitors and accounts still onboarding", () => {
    expect(resolveHomeView(undefined)).toBe("home");
    expect(
      resolveHomeView(undefined, {
        defaultView: "MAP",
        onboardingCompleted: false,
      }),
    ).toBe("home");
  });
  it("preserves the saved map and dashboard launch preferences", () => {
    expect(
      resolveHomeView(undefined, {
        defaultView: "MAP",
        onboardingCompleted: true,
      }),
    ).toBe("map");
    expect(
      resolveHomeView(undefined, {
        defaultView: "DASHBOARD",
        onboardingCompleted: true,
      }),
    ).toBe("dashboard");
  });
  it("lets explicit home and map links override any preference", () => {
    for (const defaultView of ["MAP", "DASHBOARD"]) {
      expect(
        resolveHomeView("map", { defaultView, onboardingCompleted: true }),
      ).toBe("map");
      expect(
        resolveHomeView("home", { defaultView, onboardingCompleted: true }),
      ).toBe("home");
    }
  });
});
