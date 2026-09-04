export type WindPaletteBand = {
  /** Inclusive lower bound, in knots. */
  minKnots: number;
  /** Large filled surfaces, such as forecast cells and the wind raster. */
  fill: string;
  /** High-contrast accents, such as markers, strokes and chart bars. */
  accent: string;
  /** Soft companion color used behind accents. */
  tint: string;
  /** Readable text color on top of `fill`. */
  foreground: string;
};

/**
 * The canonical Openwind wind scale.
 *
 * Every wind visualization uses these exact thresholds and colors. Filled
 * surfaces deliberately use the familiar forecast-table colors, while thin
 * marks use the stronger chart/map accent from the same band.
 */
export const OPENWIND_WIND_PALETTE_KTS: readonly WindPaletteBand[] = [
  {
    minKnots: 0,
    fill: "#f5f5f5",
    accent: "#c0cdda",
    tint: "#e0e8ef",
    foreground: "#555555",
  },
  {
    minKnots: 2,
    fill: "#d5f0d5",
    accent: "#90e86a",
    tint: "#c8f4b0",
    foreground: "#333333",
  },
  {
    minKnots: 5,
    fill: "#8edb8e",
    accent: "#6de840",
    tint: "#b0f590",
    foreground: "#1a4a1a",
  },
  {
    minKnots: 8,
    fill: "#3dbc3d",
    accent: "#50d818",
    tint: "#8eed60",
    foreground: "#0a350a",
  },
  {
    minKnots: 12,
    fill: "#e8e540",
    accent: "#e6d620",
    tint: "#f2ec78",
    foreground: "#555555",
  },
  {
    minKnots: 16,
    fill: "#e8b830",
    accent: "#f0a818",
    tint: "#f8cc60",
    foreground: "#4a2e00",
  },
  {
    minKnots: 20,
    fill: "#e07020",
    accent: "#fc762d",
    tint: "#fda56a",
    foreground: "#ffffff",
  },
  {
    minKnots: 25,
    fill: "#d42020",
    accent: "#e04010",
    tint: "#f48050",
    foreground: "#ffffff",
  },
  {
    minKnots: 30,
    fill: "#b00058",
    accent: "#8f0905",
    tint: "#c83830",
    foreground: "#ffffff",
  },
  {
    minKnots: 35,
    fill: "#800080",
    accent: "#6a0020",
    tint: "#a83050",
    foreground: "#ffffff",
  },
] as const;

export type WindPaletteRole = "fill" | "accent" | "tint";

const MAX_LEGEND_KNOTS = 50;

export function windPaletteBand(kmh: number): WindPaletteBand {
  const knots = Math.max(0, Number.isFinite(kmh) ? kmh / 1.852 : 0);
  let band = OPENWIND_WIND_PALETTE_KTS[0];

  for (let index = 1; index < OPENWIND_WIND_PALETTE_KTS.length; index++) {
    if (knots < OPENWIND_WIND_PALETTE_KTS[index].minKnots) break;
    band = OPENWIND_WIND_PALETTE_KTS[index];
  }

  return band;
}

export function windPaletteColor(
  kmh: number,
  role: WindPaletteRole = "fill",
): string {
  return windPaletteBand(kmh)[role];
}

export function hexToRgb(hex: string): readonly [number, number, number] {
  const value = hex.startsWith("#") ? hex.slice(1) : hex;
  if (!/^[\da-f]{6}$/i.test(value)) return [0, 0, 0];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

export function windPaletteRgba(
  kmh: number,
  alpha = 255,
  role: WindPaletteRole = "fill",
): [number, number, number, number] {
  const [red, green, blue] = hexToRgb(windPaletteColor(kmh, role));
  return [red, green, blue, Math.min(255, Math.max(0, Math.round(alpha)))];
}

/** A hard-edged CSS gradient that mirrors the app's discrete wind bands. */
export function windPaletteGradient(
  role: WindPaletteRole = "fill",
): string {
  const stops = OPENWIND_WIND_PALETTE_KTS.flatMap((band, index) => {
    const next = OPENWIND_WIND_PALETTE_KTS[index + 1];
    const start = (band.minKnots / MAX_LEGEND_KNOTS) * 100;
    const end = ((next?.minKnots ?? MAX_LEGEND_KNOTS) / MAX_LEGEND_KNOTS) * 100;
    return [`${band[role]} ${start}%`, `${band[role]} ${end}%`];
  });
  return `linear-gradient(to right, ${stops.join(", ")})`;
}
