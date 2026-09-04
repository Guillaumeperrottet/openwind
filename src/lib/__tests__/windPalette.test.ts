import { describe, expect, it } from "vitest";
import {
  OPENWIND_WIND_PALETTE_KTS,
  windPaletteBand,
  windPaletteColor,
  windPaletteGradient,
  windPaletteRgba,
} from "@/lib/windPalette";

describe("Openwind wind palette", () => {
  it("switches bands exactly at the shared knot thresholds", () => {
    expect(windPaletteColor(1.99 * 1.852)).toBe("#f5f5f5");
    expect(windPaletteColor(2 * 1.852)).toBe("#d5f0d5");
    expect(windPaletteColor(12 * 1.852)).toBe("#e8e540");
    expect(windPaletteColor(35 * 1.852)).toBe("#800080");
  });

  it("exposes the matching fill, accent and tint for every band", () => {
    const band = windPaletteBand(18 * 1.852);
    expect(band).toMatchObject({
      minKnots: 16,
      fill: "#e8b830",
      accent: "#f0a818",
      tint: "#f8cc60",
    });
    expect(windPaletteColor(18 * 1.852, "accent")).toBe("#f0a818");
    expect(windPaletteRgba(18 * 1.852, 128)).toEqual([232, 184, 48, 128]);
  });

  it("builds a hard-edged legend from every application band", () => {
    const gradient = windPaletteGradient();
    expect(gradient).toContain("#f5f5f5 0%");
    expect(gradient).toContain("#e8e540 24%");
    expect(gradient).toContain("#800080 100%");
    expect(OPENWIND_WIND_PALETTE_KTS).toHaveLength(10);
  });
});
