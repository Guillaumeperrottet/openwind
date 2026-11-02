import { describe, expect, it } from "vitest";
import { windChange, windSnapshot, type WindSnapshot } from "@/lib/personal-summary";
import type { WindLive } from "@/types";

const now = Date.parse("2026-11-02T10:00:00Z");
const live: WindLive = { source: "station", network: "meteoswiss", stationId: "DOL", windSpeedKmh: 30, gustsKmh: 40, windDirection: 0, updatedAt: "2026-11-02T09:50:00Z", staleAt: "2026-11-02T10:10:00Z", isFresh: true };
const previous: WindSnapshot = { source: "station:meteoswiss", stationId: "DOL", wind: 20, at: now - 3600000 };
describe("honest changes since the previous visit", () => {
  it("compares only newer measured values from the same network and station", () => {
    expect(windChange(previous, windSnapshot(live, now))).toBe(10);
    expect(windChange(previous, windSnapshot({ ...live, stationId: "NEU" }, now))).toBeNull();
    expect(windChange(previous, windSnapshot({ ...live, network: "pioupiou" }, now))).toBeNull();
  });
  it("never presents a model fallback as an observed change", () => {
    expect(windSnapshot({ ...live, source: "openmeteo" }, now)).toBeNull();
    expect(windChange(null, windSnapshot(live, now))).toBeNull();
  });
  it("rejects stale, future, invalid and repeated samples", () => {
    expect(windSnapshot({ ...live, isFresh: false }, now)).toBeNull();
    expect(windSnapshot(live, now + 3600000)).toBeNull();
    expect(windSnapshot({ ...live, updatedAt: "2027-01-01T00:00:00Z" }, now)).toBeNull();
    expect(windSnapshot({ ...live, windSpeedKmh: NaN }, now)).toBeNull();
    expect(windChange(previous, previous)).toBeNull();
  });
  it("ignores small changes and samples more than a day apart", () => {
    expect(windChange(previous, { ...previous, wind: 24, at: now })).toBeNull();
    expect(windChange(previous, { ...previous, wind: 30, at: previous.at + 86400001 })).toBeNull();
    expect(windChange(previous, { ...previous, wind: 14, at: now })).toBe(-6);
  });
});
