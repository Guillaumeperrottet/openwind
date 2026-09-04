import { describe, expect, it } from "vitest";
import {
  decodeOpenwindWindTile,
  encodeOpenwindWindTile,
  openwindWindTileCoordinatesForBounds,
  parseOpenwindWindTileManifest,
  sampleOpenwindWindTileSet,
  selectOpenwindWindTileModel,
  type OpenwindWindTileManifest,
  type OpenwindWindTileSet,
} from "@/lib/windTiles";

const manifest: OpenwindWindTileManifest = {
  schemaVersion: 1,
  encoding: "oww1",
  datasetId: "dwd_icon_eu:2026090300:000",
  runId: "2026090300",
  model: {
    id: "dwd_icon_eu",
    label: "ICON-EU",
    source: "DWD",
    resolutionKm: 6.5,
  },
  referenceAt: "2026-09-03T00:00:00.000Z",
  validAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T02:43:55.000Z",
  stale: false,
  gustsAvailable: true,
  attribution: {
    name: "Deutscher Wetterdienst (DWD)",
    url: "https://www.dwd.de/",
  },
  grid: {
    bounds: [0, 48, 3, 50],
    west: 0,
    north: 50,
    columns: 4,
    rows: 3,
    longitudeStep: 1,
    latitudeStep: 1,
    tileSize: 2,
    tileColumns: 2,
    tileRows: 2,
  },
  tileUrlTemplate: "/wind/{x}/{y}.oww",
};

function tile(
  west: number,
  north: number,
  width: number,
  height: number,
  values: number[],
) {
  return decodeOpenwindWindTile(
    encodeOpenwindWindTile({
      width,
      height,
      west,
      north,
      longitudeStep: 1,
      latitudeStep: 1,
      scaleMps: 0.01,
      gustsAvailable: true,
      uMps: values,
      vMps: values.map((value) => value * 2),
      gustMps: values.map((value) => value * 3),
    }),
  );
}

describe("Openwind wind tiles", () => {
  it("round-trips quantized vectors and missing values", () => {
    const decoded = decodeOpenwindWindTile(
      encodeOpenwindWindTile({
        width: 2,
        height: 1,
        west: 6,
        north: 47,
        longitudeStep: 0.0625,
        latitudeStep: 0.0625,
        scaleMps: 0.01,
        gustsAvailable: true,
        uMps: [3.141, Number.NaN],
        vMps: [-4.876, 2],
        gustMps: [8.555, 4],
      }),
    );

    expect(decoded).toMatchObject({
      width: 2,
      height: 1,
      gustsAvailable: true,
    });
    expect(Array.from(decoded.values)).toEqual([
      314,
      -488,
      856,
      -32768,
      200,
      400,
    ]);
  });

  it("loads the cells needed on both sides of a tile seam", () => {
    expect(openwindWindTileCoordinatesForBounds(manifest, [1.9, 48.9, 2.1, 49.1]))
      .toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]);
  });

  it("interpolates continuously across tile seams", () => {
    const tileSet: OpenwindWindTileSet = {
      manifest,
      tiles: new Map([
        ["0:0", tile(0, 50, 2, 2, [0, 1, 10, 11])],
        ["1:0", tile(2, 50, 2, 2, [2, 3, 12, 13])],
        ["0:1", tile(0, 48, 2, 1, [20, 21])],
        ["1:1", tile(2, 48, 2, 1, [22, 23])],
      ]),
    };

    expect(sampleOpenwindWindTileSet(tileSet, 1.999, 49)?.uMps).toBeCloseTo(
      11.999,
      6,
    );
    expect(sampleOpenwindWindTileSet(tileSet, 2.001, 49)?.uMps).toBeCloseTo(
      12.001,
      6,
    );
    const center = sampleOpenwindWindTileSet(tileSet, 1.5, 48.5);
    expect(center?.uMps).toBeCloseTo(16.5, 5);
    expect(center?.vMps).toBeCloseTo(33, 5);
    expect(center?.gustMps).toBeCloseTo(49.5, 5);
  });

  it("rejects malformed manifests and unsupported areas", () => {
    expect(parseOpenwindWindTileManifest(manifest)).toEqual(manifest);
    expect(() =>
      parseOpenwindWindTileManifest({ ...manifest, schemaVersion: 2 }),
    ).toThrow("Unsupported");
    expect(selectOpenwindWindTileModel([-6, 38, 25, 57])).toBe("dwd_icon_eu");
    expect(selectOpenwindWindTileModel([-30, 38, 25, 57])).toBeNull();
  });
});
