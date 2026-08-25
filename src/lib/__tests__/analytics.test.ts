import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent", () => {
  it("is a no-op during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackEvent("plan_search")).not.toThrow();
  });

  it("uses the Google tag and removes empty parameters", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("sign_up", {
      method: "email",
      ignored: undefined,
      alsoIgnored: null,
    });

    expect(gtag).toHaveBeenCalledWith("event", "sign_up", {
      method: "email",
    });
  });

  it("falls back to a dataLayer event when gtag is not ready", () => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", { dataLayer });

    trackEvent("favorite_added", { spot_id: "spot-1" });

    expect(dataLayer).toEqual([
      { event: "favorite_added", spot_id: "spot-1" },
    ]);
  });
});
