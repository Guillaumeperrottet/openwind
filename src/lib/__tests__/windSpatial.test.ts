import { describe, expect, it } from "vitest";
import {
  buildSpatialOmFileUrl,
  isWindModelId,
  parseSpatialWindManifest,
  selectClosestSpatialValidTime,
} from "@/lib/windSpatial";

const metadata = {
  completed: true,
  reference_time: "2026-09-03T06:00:00Z",
  last_modified_time: "2026-09-03T11:14:51Z",
  valid_times: [
    "2026-09-03T10:00Z",
    "2026-09-03T11:00Z",
    "2026-09-03T12:00Z",
  ],
  variables: [
    "wind_gusts_10m",
    "wind_u_component_10m",
    "wind_v_component_10m",
  ],
};

describe("spatial wind manifests", () => {
  it("accepts only allow-listed model identifiers", () => {
    expect(isWindModelId("gfs_global")).toBe(true);
    expect(isWindModelId("meteoswiss_icon_ch1")).toBe(true);
    expect(isWindModelId("../../secret")).toBe(false);
  });

  it("selects an actual timestep closest to now", () => {
    expect(
      selectClosestSpatialValidTime(
        metadata.valid_times,
        new Date("2026-09-03T11:34:00Z"),
      ),
    ).toBe("2026-09-03T12:00:00.000Z");
  });

  it("builds the immutable OM file URL for a completed model run", () => {
    expect(
      buildSpatialOmFileUrl(
        "https://data.example.test/data_spatial/",
        "ncep_gfs013",
        "2026-09-03T06:00:00Z",
        "2026-09-03T12:00:00Z",
      ),
    ).toBe(
      "https://data.example.test/data_spatial/ncep_gfs013/2026/09/03/0600Z/2026-09-03T1200.om",
    );
  });

  it("normalizes a valid GFS manifest", () => {
    const result = parseSpatialWindManifest("gfs_global", metadata, {
      baseUrl: "https://data.example.test/data_spatial",
      now: new Date("2026-09-03T11:34:00Z"),
    });

    expect(result).toMatchObject({
      domain: "ncep_gfs013",
      validAt: "2026-09-03T12:00:00.000Z",
      gustsAvailable: true,
      stale: false,
      model: { id: "gfs_global", resolutionKm: 13 },
    });
  });

  it("rejects incomplete runs and runs missing vector data", () => {
    expect(() =>
      parseSpatialWindManifest("gfs_global", {
        ...metadata,
        completed: false,
      }),
    ).toThrow("not complete");
    expect(() =>
      parseSpatialWindManifest("gfs_global", {
        ...metadata,
        variables: ["wind_u_component_10m"],
      }),
    ).toThrow("wind_v_component_10m");
  });

  it("marks an upstream run stale when its nearest timestep is too old", () => {
    const result = parseSpatialWindManifest("gfs_global", metadata, {
      now: new Date("2026-09-04T04:00:00Z"),
    });

    expect(result.stale).toBe(true);
  });
});
