import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WindStation } from "@/lib/stations";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { systemConfig: { findMany } } }));
import {
  getStationCatalog,
  mergeStationSnapshots,
  parseStationSnapshot,
} from "@/lib/station-catalog";
import { getStationFromCache } from "@/lib/stationData";

const station: WindStation = {
  id: "MAS",
  name: "Marsens",
  lat: 46.65,
  lng: 7.05,
  altitudeM: 700,
  source: "meteoswiss",
  windSpeedKmh: 12,
  gustsKmh: 17,
  windDirection: 180,
  updatedAt: "2026-10-20T10:00:00Z",
};

beforeEach(() => {
  findMany.mockReset();
});

describe("persistent station identity", () => {
  it("keeps a known station when its provider disappears from the current snapshot", async () => {
    findMany.mockResolvedValue([
      { key: "stations_catalog", value: JSON.stringify([station]) },
      { key: "stations_cache", value: "[]" },
    ]);
    expect(await getStationFromCache("MAS")).toEqual(station);
    expect(await getStationFromCache("unknown")).toBeNull();
  });

  it("prefers the current snapshot and preserves the original timestamp of absent stations", () => {
    const updated = {
      ...station,
      windSpeedKmh: 24,
      updatedAt: "2026-10-21T10:00:00Z",
    };
    expect(mergeStationSnapshots([station], [updated])).toEqual([updated]);
    expect(mergeStationSnapshots([station], [])).toEqual([station]);
  });

  it("works before the first catalog has been created", async () => {
    findMany.mockResolvedValue([
      { key: "stations_cache", value: JSON.stringify([station]) },
    ]);
    expect(await getStationCatalog()).toEqual([station]);
  });

  it("propagates a DB failure rather than turning a valid station into a 404", async () => {
    findMany.mockRejectedValue(new Error("database unavailable"));
    await expect(getStationFromCache("MAS")).rejects.toThrow(
      "database unavailable",
    );
  });

  it("does not overwrite a damaged snapshot with a silently empty catalog", () => {
    expect(() => parseStationSnapshot("{invalid")).toThrow();
    expect(() => parseStationSnapshot("{}")).toThrow();
    expect(parseStationSnapshot(undefined)).toEqual([]);
  });
});
