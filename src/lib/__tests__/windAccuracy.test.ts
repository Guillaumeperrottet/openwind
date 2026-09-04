import { describe, expect, it } from "vitest";
import {
  circularDirectionDelta,
  compareWindAccuracy,
  summarizeWindAccuracy,
} from "@/lib/windAccuracy";

describe("wind accuracy", () => {
  it("compares directions across north without a 360-degree error", () => {
    expect(circularDirectionDelta(359.7, 0.2)).toBeCloseTo(0.5, 8);
    expect(circularDirectionDelta(5, 355)).toBe(10);
  });

  it("accepts only values inside the point API rounding tolerance", () => {
    expect(
      compareWindAccuracy(
        { speedKmh: 18.04, direction: 270.4, gustsKmh: 27.96 },
        { speedKmh: 18, direction: 270, gustsKmh: 28 },
      ).passed,
    ).toBe(true);
    expect(
      compareWindAccuracy(
        { speedKmh: 19, direction: 250 },
        { speedKmh: 18, direction: 270 },
      ).passed,
    ).toBe(false);
  });

  it("summarizes maximum and mean errors", () => {
    const deltas = [
      compareWindAccuracy(
        { speedKmh: 10.02, direction: 90.2 },
        { speedKmh: 10, direction: 90 },
      ),
      compareWindAccuracy(
        { speedKmh: 20.04, direction: 179.6 },
        { speedKmh: 20, direction: 180 },
      ),
    ];
    const summary = summarizeWindAccuracy(deltas);

    expect(summary).toMatchObject({ samples: 2, passed: true });
    expect(summary.meanSpeedDeltaKmh).toBeCloseTo(0.03, 8);
    expect(summary.maxDirectionDeltaDegrees).toBeCloseTo(0.4, 8);
    expect(summary.maxGustDeltaKmh).toBeNull();
  });
});
