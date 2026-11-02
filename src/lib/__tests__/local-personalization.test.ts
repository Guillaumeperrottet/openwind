import { afterEach, describe, expect, it, vi } from "vitest";
import { parseLocalPreferences } from "@/lib/user-preferences";
import { LOCAL_FAVORITES_KEY, MAX_LOCAL_FAVORITES, parseFavoriteIds, readLocalFavorites, remainingLocalFavorites } from "@/lib/favorites";

afterEach(() => vi.unstubAllGlobals());

describe("local preferences and favorites survive sign-in safely", () => {
  it("imports explicit settings only, without defaulting or trusting account fields", () => {
    expect(parseLocalPreferences({ useKnots: false, sportFilter: "PARAGLIDE", userId: "other", onboardingCompleted: false })).toEqual({ useKnots: false, sportFilter: "PARAGLIDE" });
    expect(parseLocalPreferences({ useKnots: "false", sportFilter: "UNKNOWN" })).toEqual({});
    expect(parseLocalPreferences(null)).toEqual({});
  });
  it("preserves favorites that the server could not import, including new additions", () => {
    const remaining = remainingLocalFavorites(
      parseFavoriteIds({ spotIds: ["saved", "new"], stationIds: ["offline", "VEV"] }),
      parseFavoriteIds({ spotIds: ["saved"], stationIds: ["VEV"] }),
    );
    expect([...remaining.spotIds]).toEqual(["new"]);
    expect([...remaining.stationIds]).toEqual(["offline"]);
  });
  it("handles unavailable and corrupted browser storage", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("Blocked"); } });
    expect(readLocalFavorites().spotIds.size).toBe(0);
    vi.stubGlobal("localStorage", { getItem: () => "{" });
    expect(readLocalFavorites().stationIds.size).toBe(0);
  });
  it("deduplicates and bounds guest imports to avoid oversized requests", () => {
    const data = { spotIds: ["a", "a", ...Array.from({ length: 20 }, (_, i) => `s${i}`)], stationIds: ["VEV"] };
    const getItem = vi.fn(() => JSON.stringify(data));
    vi.stubGlobal("localStorage", { getItem });
    const ids = readLocalFavorites();
    expect(getItem).toHaveBeenCalledWith(LOCAL_FAVORITES_KEY);
    expect(ids.spotIds.size + ids.stationIds.size).toBe(MAX_LOCAL_FAVORITES);
    expect([...ids.spotIds].filter((id) => id === "a")).toHaveLength(1);
  });
});
