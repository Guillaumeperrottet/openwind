import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/analytics";

const { trackVercelEvent } = vi.hoisted(() => ({
  trackVercelEvent: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({
  track: trackVercelEvent,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("trackEvent", () => {
  it("is a no-op during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackEvent("plan_search")).not.toThrow();
    expect(trackVercelEvent).not.toHaveBeenCalled();
  });

  it("uses Vercel and the Google tag while removing empty parameters", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("sign_up", {
      method: "email",
      ignored: undefined,
      alsoIgnored: null,
    });

    expect(trackVercelEvent).toHaveBeenCalledWith("sign_up", {
      method: "email",
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

  it("keeps Google tracking alive if Vercel rejects an event", () => {
    const gtag = vi.fn();
    trackVercelEvent.mockImplementationOnce(() => {
      throw new Error("Unavailable");
    });
    vi.stubGlobal("window", { gtag });

    expect(() => trackEvent("login", { method: "email" })).not.toThrow();
    expect(gtag).toHaveBeenCalledWith("event", "login", {
      method: "email",
    });
  });
});
