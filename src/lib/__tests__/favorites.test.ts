import { describe, expect, it } from "vitest";
import { parseFavoriteIds, toggleFavoriteId } from "@/lib/favorites";

describe("favorite ID helpers", () => {
  it("keeps older spot-only API responses compatible", () => {
    const favorites = parseFavoriteIds({ spotIds: ["spot-1", "spot-2"] });

    expect([...favorites.spotIds]).toEqual(["spot-1", "spot-2"]);
    expect([...favorites.stationIds]).toEqual([]);
  });

  it("normalizes spot and station IDs while ignoring invalid values", () => {
    const favorites = parseFavoriteIds({
      spotIds: ["spot-1", null, ""],
      stationIds: ["VEV", 42, "piou-2153"],
    });

    expect([...favorites.spotIds]).toEqual(["spot-1"]);
    expect([...favorites.stationIds]).toEqual(["VEV", "piou-2153"]);
  });

  it("toggles membership without mutating the previous Set", () => {
    const previous = new Set(["VEV"]);
    const removed = toggleFavoriteId(previous, "VEV");
    const added = toggleFavoriteId(previous, "MAS");

    expect([...previous]).toEqual(["VEV"]);
    expect([...removed]).toEqual([]);
    expect([...added]).toEqual(["VEV", "MAS"]);
  });
});
