import { describe, expect, it } from "vitest";
import type { WindStation } from "@/lib/stations";
import {
  isInStationDirectory,
  normalizeStationSearch,
} from "@/lib/stationDirectory";

function stationAt(lat: number, lng: number): WindStation {
  return {
    id: "TEST",
    name: "Test station",
    lat,
    lng,
    altitudeM: 0,
    windSpeedKmh: 10,
    gustsKmh: 15,
    windDirection: 180,
    updatedAt: "2026-08-27T08:00:00Z",
    source: "pioupiou",
  };
}

describe("station directory", () => {
  it("keeps Swiss and nearby regional stations", () => {
    expect(isInStationDirectory(stationAt(46.54, 7.11))).toBe(true);
    expect(isInStationDirectory(stationAt(47.37, 8.54))).toBe(true);
  });

  it("excludes stations outside the regional directory", () => {
    expect(isInStationDirectory(stationAt(48.85, 2.35))).toBe(false);
    expect(isInStationDirectory(stationAt(43.6, 1.44))).toBe(false);
  });

  it("normalizes accents and letter case for search", () => {
    expect(normalizeStationSearch("  LÉVANCHY  ")).toBe("levanchy");
    expect(normalizeStationSearch("MétéoSuisse")).toBe("meteosuisse");
  });
});
