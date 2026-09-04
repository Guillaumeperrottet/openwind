import { describe, expect, it } from "vitest";
import {
  buildWindSampleGrid,
  meteorologicalWindToVector,
  normalizeUtcModelTime,
  paddedWindBounds,
  selectWindModel,
  windPerformanceSignal,
  windRenderProfile,
  windRuntimeProfile,
  windSpeedColor,
  windBoundsCoverView,
  windVectorToMeteorologicalDirection,
} from "@/lib/windField";

describe("normalizeUtcModelTime", () => {
  it("treats a GMT model timestamp as UTC", () => {
    expect(normalizeUtcModelTime("2026-09-03T09:15")).toBe(
      "2026-09-03T09:15:00.000Z",
    );
  });

  it("preserves explicit offsets and rejects invalid values", () => {
    expect(normalizeUtcModelTime("2026-09-03T11:15+02:00")).toBe(
      "2026-09-03T09:15:00.000Z",
    );
    expect(normalizeUtcModelTime("not-a-date")).toBeNull();
  });
});

describe("meteorologicalWindToVector", () => {
  it.each([
    { direction: 0, expectedU: 0, expectedV: -20 },
    { direction: 90, expectedU: -20, expectedV: 0 },
    { direction: 180, expectedU: 0, expectedV: 20 },
    { direction: 270, expectedU: 20, expectedV: 0 },
  ])(
    "moves particles away from a $direction° source direction",
    ({ direction, expectedU, expectedV }) => {
      const vector = meteorologicalWindToVector(20, direction);
      expect(vector.u).toBeCloseTo(expectedU, 8);
      expect(vector.v).toBeCloseTo(expectedV, 8);
    },
  );

  it("round-trips a meteorological direction", () => {
    const vector = meteorologicalWindToVector(32, 348);
    expect(windVectorToMeteorologicalDirection(vector.u, vector.v)).toBeCloseTo(
      348,
      8,
    );
  });
});

describe("wind model selection and sampling", () => {
  it("selects ICON-CH1 for a local Swiss view", () => {
    expect(selectWindModel([5.6, 45.6, 10.8, 48.2])).toMatchObject({
      id: "meteoswiss_icon_ch1",
      resolutionKm: 1,
    });
  });

  it("selects GFS for a continental view", () => {
    expect(selectWindModel([-15, 32, 35, 62])).toMatchObject({
      id: "gfs_global",
      resolutionKm: 13,
    });
  });

  it("keeps GFS when a view extends beyond ICON-CH1 coverage", () => {
    expect(selectWindModel([1.2, 40.1, 9.6, 48])).toMatchObject({
      id: "gfs_global",
    });
  });

  it("keeps GFS near the real eastern edge of the ICON-CH1 grid", () => {
    expect(selectWindModel([10, 45, 17, 49])).toMatchObject({
      id: "gfs_global",
    });
  });

  it("keeps the sampling grid within its point budget and covers every edge", () => {
    const grid = buildWindSampleGrid([5, 45, 11, 48], 1, 225);
    expect(grid.lats.length).toBeLessThanOrEqual(225);
    expect(grid.lats.length).toBe(grid.lons.length);
    expect(grid.lats).toContain(45);
    expect(grid.lats).toContain(48);
    expect(grid.lons).toContain(5);
    expect(grid.lons).toContain(11);
    expect(grid.spacingKm).toBeGreaterThan(1);
  });
});

describe("wind speed palette", () => {
  it("uses the exact Openwind application bands", () => {
    const calm = windSpeedColor(0);
    const twoKnots = windSpeedColor(2 * 1.852);
    const moderate = windSpeedColor(10 * 1.852);
    const strong = windSpeedColor(31 * 1.852);

    expect(calm).toEqual([245, 245, 245, 255]);
    expect(twoKnots).toEqual([213, 240, 213, 255]);
    expect(moderate).toEqual([61, 188, 61, 255]);
    expect(strong).toEqual([176, 0, 88, 255]);
  });
});

describe("wind render profile", () => {
  it("increases precision on capable desktop devices", () => {
    const profile = windRenderProfile(1440, 900, {
      mobile: false,
      reducedMotion: false,
      hardwareConcurrency: 10,
    });

    expect(profile.fieldWidth).toBe(320);
    expect(profile.fieldHeight).toBe(224);
    expect(profile.framesPerSecond).toBe(45);
    expect(profile.particleCount).toBeGreaterThan(2_000);
    expect(profile.particleCount).toBeLessThanOrEqual(2_800);
  });

  it("caps work for mobile and reduced-motion devices", () => {
    const mobile = windRenderProfile(390, 844, {
      mobile: true,
      reducedMotion: false,
      hardwareConcurrency: 4,
    });
    const reduced = windRenderProfile(1440, 900, {
      mobile: false,
      reducedMotion: true,
      hardwareConcurrency: 10,
    });

    expect(mobile.particleCount).toBeLessThanOrEqual(950);
    expect(mobile.framesPerSecond).toBe(24);
    expect(reduced).toMatchObject({
      particleCount: 320,
      framesPerSecond: 12,
      fieldWidth: 144,
      fieldHeight: 100,
    });
  });

  it("precomputes progressively lighter runtime tiers", () => {
    const base = windRenderProfile(1440, 900, {
      mobile: false,
      reducedMotion: false,
      hardwareConcurrency: 10,
    });
    const high = windRuntimeProfile(base, "high");
    const balanced = windRuntimeProfile(base, "balanced");
    const low = windRuntimeProfile(base, "low");

    expect(high.particleCount).toBe(base.particleCount);
    expect(balanced.particleCount).toBeLessThan(high.particleCount);
    expect(low.particleCount).toBeLessThan(balanced.particleCount);
    expect(balanced.framesPerSecond).toBe(30);
    expect(low.framesPerSecond).toBe(24);
  });

  it("degrades only for sustained frame pressure and recovers with headroom", () => {
    expect(
      windPerformanceSignal({
        durationMs: 3_000,
        rafFrames: 180,
        renderedFrames: 70,
        renderWorkMs: 700,
        maxRafGapMs: 260,
        targetFramesPerSecond: 45,
      }),
    ).toBe("degrade");

    expect(
      windPerformanceSignal({
        durationMs: 3_000,
        rafFrames: 180,
        renderedFrames: 134,
        renderWorkMs: 240,
        maxRafGapMs: 34,
        targetFramesPerSecond: 45,
      }),
    ).toBe("recover");

    expect(
      windPerformanceSignal({
        durationMs: 500,
        rafFrames: 30,
        renderedFrames: 20,
        renderWorkMs: 50,
        maxRafGapMs: 20,
        targetFramesPerSecond: 45,
      }),
    ).toBe("hold");
  });
});

describe("wind field request bounds", () => {
  it("pads and snaps the viewport for stable panning", () => {
    expect(paddedWindBounds([6, 46, 7, 47])).toEqual([
      5.4, 45.4, 7.6, 47.6,
    ]);
  });

  it("reuses a loaded field while the viewport stays safely inside it", () => {
    const loaded = [5, 45, 9, 48] as const;
    expect(windBoundsCoverView([...loaded], [5.5, 45.5, 8.5, 47.5])).toBe(
      true,
    );
    expect(windBoundsCoverView([...loaded], [5.1, 45.5, 8.5, 47.5])).toBe(
      false,
    );
  });
});
