"use client";

/**
 * WindDirectionRose
 *
 * Professional compass-style wind rose with tick marks, cross-hairs,
 * and highlighted sectors for best wind directions.
 */

const DIRS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export type CompassDir = (typeof DIRS)[number];

/** Wedge path from center outward for a 22.5° segment */
function wedgePath(
  index: number,
  cx: number,
  cy: number,
  ro: number,
  gapDeg = 0.8,
): string {
  const step = (2 * Math.PI) / 16;
  const gapRad = (gapDeg * Math.PI) / 180;
  const base = index * step - Math.PI / 2;
  const a1 = base + gapRad;
  const a2 = base + step - gapRad;
  const x1 = cx;
  const y1 = cy;
  const x2 = cx + ro * Math.cos(a1);
  const y2 = cy + ro * Math.sin(a1);
  const x3 = cx + ro * Math.cos(a2);
  const y3 = cy + ro * Math.sin(a2);
  return `M ${x1} ${y1} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${ro} ${ro} 0 0 1 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
}

interface Props {
  bestDirections: string[];
  currentDirection?: number | null;
  size?: number;
  interactive?: boolean;
  onChange?: (dirs: string[]) => void;
  showLabels?: boolean;
  /**
   * Visual style. `minimal` is a clean, modern dial: thin ring,
   * green arcs on the active directions with their labels outside.
   * Use it where space is tight and you only want to convey the
   * favorable direction(s) at a glance. `full` is the original
   * compass (ticks, wedges, cross-hairs).
   */
  variant?: "full" | "minimal";
}

export function WindDirectionRose({
  bestDirections,
  currentDirection,
  size = 80,
  interactive = false,
  onChange,
  showLabels = true,
  variant = "full",
}: Props) {
  if (variant === "minimal" && !interactive) {
    return (
      <MinimalRose
        bestDirections={bestDirections}
        currentDirection={currentDirection}
        size={size}
        showLabels={showLabels}
      />
    );
  }
  return (
    <FullRose
      bestDirections={bestDirections}
      currentDirection={currentDirection}
      size={size}
      interactive={interactive}
      onChange={onChange}
      showLabels={showLabels}
    />
  );
}

function FullRose({
  bestDirections,
  currentDirection,
  size = 80,
  interactive = false,
  onChange,
  showLabels = true,
}: Omit<Props, "variant">) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.44; // main circle radius
  const best = new Set(bestDirections.map((d) => d.toUpperCase()));

  const toggle = (dir: string) => {
    if (!interactive || !onChange) return;
    const next = best.has(dir)
      ? bestDirections.filter((d) => d.toUpperCase() !== dir)
      : [...bestDirections, dir];
    onChange(next);
  };

  const labelR = size * 0.5;
  const tickOuter = R;
  const tickMajor = R * 0.88;
  const tickMinor = R * 0.92;
  const sw = Math.max(1, size * 0.008);

  // 8 compass labels (cardinal + intercardinal)
  const labels = [
    { label: "N", angle: -90 },
    { label: "NE", angle: -45 },
    { label: "E", angle: 0 },
    { label: "SE", angle: 45 },
    { label: "S", angle: 90 },
    { label: "SW", angle: 135 },
    { label: "W", angle: 180 },
    { label: "NW", angle: -135 },
  ];

  const fontSize = size * 0.09;
  const fontSizeCardinal = size * 0.11;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Rose des vents"
    >
      {/* Best direction wedges — filled sectors from center */}
      {DIRS.map((dir, i) => {
        const active = best.has(dir);
        if (!active && !interactive) return null;
        return (
          <path
            key={`w-${dir}`}
            d={wedgePath(i, cx, cy, R * 0.82)}
            fill={active ? "#0d9488" : "transparent"}
            opacity={active ? 0.55 : 0}
            style={interactive ? { cursor: "pointer" } : undefined}
            onClick={() => toggle(dir)}
          >
            {interactive && <title>{dir}</title>}
          </path>
        );
      })}

      {/* Main circle */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#374151"
        strokeWidth={sw * 1.5}
      />

      {/* Cross-hairs (N–S, E–W) */}
      {[0, 90].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = cx + R * Math.cos(rad);
        const y1 = cy + R * Math.sin(rad);
        const x2 = cx - R * Math.cos(rad);
        const y2 = cy - R * Math.sin(rad);
        return (
          <line
            key={`cross-${deg}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth={sw}
            opacity={0.4}
          />
        );
      })}

      {/* Tick marks — 16 ticks, major every 2 (=45°) */}
      {Array.from({ length: 16 }, (_, i) => {
        const angleDeg = i * 22.5 - 90;
        const rad = (angleDeg * Math.PI) / 180;
        const isMajor = i % 2 === 0;
        const inner = isMajor ? tickMajor : tickMinor;
        return (
          <line
            key={`tick-${i}`}
            x1={cx + inner * Math.cos(rad)}
            y1={cy + inner * Math.sin(rad)}
            x2={cx + tickOuter * Math.cos(rad)}
            y2={cy + tickOuter * Math.sin(rad)}
            stroke="#374151"
            strokeWidth={isMajor ? sw * 2 : sw}
          />
        );
      })}

      {/* Outer ring markers for best directions */}
      {DIRS.map((dir, i) => {
        if (!best.has(dir)) return null;
        const angleDeg = i * 22.5 - 90;
        const rad = (angleDeg * Math.PI) / 180;
        const mr = R * 0.96;
        const mw = size * 0.04;
        const mh = size * 0.025;
        return (
          <rect
            key={`mark-${dir}`}
            x={cx + mr * Math.cos(rad) - mw / 2}
            y={cy + mr * Math.sin(rad) - mh / 2}
            width={mw}
            height={mh}
            rx={mh / 2}
            fill="#16a34a"
            transform={`rotate(${angleDeg + 90}, ${cx + mr * Math.cos(rad)}, ${cy + mr * Math.sin(rad)})`}
          />
        );
      })}

      {/* Interactive hit areas (invisible, over wedges) */}
      {interactive &&
        DIRS.map((dir, i) => (
          <path
            key={`hit-${dir}`}
            d={wedgePath(i, cx, cy, R)}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => toggle(dir)}
          >
            <title>{dir}</title>
          </path>
        ))}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.02} fill="#374151" />

      {/* Current wind arrow */}
      {currentDirection != null &&
        (() => {
          const angleDeg = currentDirection - 90;
          const rad = (angleDeg * Math.PI) / 180;
          const tipR = R * 0.78;
          const baseR = size * 0.06;
          const halfW = size * 0.035;
          const perpRad = rad + Math.PI / 2;
          // Arrow tip
          const tx = cx + tipR * Math.cos(rad);
          const ty = cy + tipR * Math.sin(rad);
          // Arrow base wings
          const bx1 = cx + baseR * Math.cos(rad) + halfW * Math.cos(perpRad);
          const by1 = cy + baseR * Math.sin(rad) + halfW * Math.sin(perpRad);
          const bx2 = cx + baseR * Math.cos(rad) - halfW * Math.cos(perpRad);
          const by2 = cy + baseR * Math.sin(rad) - halfW * Math.sin(perpRad);
          return (
            <polygon
              points={`${tx},${ty} ${bx1},${by1} ${bx2},${by2}`}
              fill="#0ea5e9"
              opacity={0.7}
              style={{ pointerEvents: "none" }}
            />
          );
        })()}

      {/* Compass labels */}
      {showLabels &&
        labels.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const x = cx + labelR * Math.cos(rad);
          const y = cy + labelR * Math.sin(rad);
          const isCardinal = label.length === 1;
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isCardinal ? fontSizeCardinal : fontSize}
              fontWeight={isCardinal ? "700" : "600"}
              fill="#374151"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {label}
            </text>
          );
        })}
    </svg>
  );
}

/**
 * Interactive picker version with surrounding label + count badge.
 * Used inside CreateSpotForm.
 */
interface PickerProps {
  value: string[];
  onChange: (dirs: string[]) => void;
  size?: number;
}

export function WindDirectionPicker({
  value,
  onChange,
  size = 130,
}: PickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <WindDirectionRose
        bestDirections={value}
        size={size}
        interactive
        onChange={onChange}
        showLabels
      />
      <p className="text-[11px] text-gray-400 text-center leading-tight">
        Cliquez pour sélectionner les
        <br />
        meilleures directions de vent
        {value.length > 0 && (
          <span className="ml-1 text-sky-600 font-medium">
            · {value.length} sélectionnée{value.length > 1 ? "s" : ""}
          </span>
        )}
      </p>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-40">
          {value.map((d) => (
            <span
              key={d}
              className="text-[10px] font-medium bg-sky-100 text-sky-700 rounded px-1.5 py-0.5"
            >
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * MinimalRose
 *
 * Nautical-style compass: thin ring, 4 cardinal labels (N in red),
 * tiny dots on intercardinals, and inward-pointing blue trapezoids
 * for each favorable wind direction.
 */
function MinimalRose({
  bestDirections,
  currentDirection,
  size,
  showLabels,
}: {
  bestDirections: string[];
  currentDirection?: number | null;
  size: number;
  showLabels: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  // Padding inside the viewBox so cardinal labels never get clipped.
  const pad = size * 0.18;
  const R = (size - pad * 2) / 2;
  const ringStroke = Math.max(1, size * 0.018);
  const best = new Set(bestDirections.map((d) => d.toUpperCase()));

  const labelR = R + pad * 0.55;
  const cardinalFont = Math.max(9, size * 0.13);

  // Inward trapezoid: wide near the ring, narrow toward the center.
  const trapezoid = (index: number): string => {
    const step = (2 * Math.PI) / 16;
    const angle = index * step - Math.PI / 2; // 0 = North
    const halfOuter = step * 0.32;
    const halfInner = step * 0.18;
    const rOuter = R * 0.86;
    const rInner = R * 0.42;
    const a1 = angle - halfOuter;
    const a2 = angle + halfOuter;
    const a3 = angle + halfInner;
    const a4 = angle - halfInner;
    const p = (r: number, a: number) =>
      `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    return `${p(rOuter, a1)} ${p(rOuter, a2)} ${p(rInner, a3)} ${p(rInner, a4)}`;
  };

  const cardinals = [
    { label: "N", angle: -90, color: "#dc2626" },
    { label: "E", angle: 0, color: "#1f2937" },
    { label: "S", angle: 90, color: "#1f2937" },
    { label: "W", angle: 180, color: "#1f2937" },
  ];

  // Intercardinal dots (NE, SE, SW, NW)
  const intercardinals = [-45, 45, 135, -135];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Vent favorable depuis : ${bestDirections.join(", ") || "aucune direction"}`}
    >
      {/* Thin outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#1f2937"
        strokeWidth={ringStroke * 1.4}
      />

      {/* Faint cross-hairs */}
      {[0, 90].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <line
            key={`cross-${deg}`}
            x1={cx + R * 0.92 * Math.cos(rad)}
            y1={cy + R * 0.92 * Math.sin(rad)}
            x2={cx - R * 0.92 * Math.cos(rad)}
            y2={cy - R * 0.92 * Math.sin(rad)}
            stroke="#cbd5e1"
            strokeWidth={ringStroke}
          />
        );
      })}

      {/* Intercardinal dots */}
      {intercardinals.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={`dot-${deg}`}
            cx={cx + R * 0.78 * Math.cos(rad)}
            cy={cy + R * 0.78 * Math.sin(rad)}
            r={Math.max(1, size * 0.018)}
            fill="#cbd5e1"
          />
        );
      })}

      {/* Favorable direction trapezoids */}
      {DIRS.map((dir, i) =>
        best.has(dir) ? (
          <polygon
            key={`tz-${dir}`}
            points={trapezoid(i)}
            fill="#7ea4c4"
            stroke="#1f2937"
            strokeWidth={ringStroke}
            strokeLinejoin="round"
          />
        ) : null,
      )}

      {/* Current wind direction needle */}
      {currentDirection != null &&
        (() => {
          const angleDeg = currentDirection - 90;
          const rad = (angleDeg * Math.PI) / 180;
          return (
            <line
              x1={cx + R * 0.85 * Math.cos(rad)}
              y1={cy + R * 0.85 * Math.sin(rad)}
              x2={cx + R * 0.3 * Math.cos(rad)}
              y2={cy + R * 0.3 * Math.sin(rad)}
              stroke="#0ea5e9"
              strokeWidth={Math.max(1.5, size * 0.025)}
              strokeLinecap="round"
            />
          );
        })()}

      {/* Cardinal labels */}
      {showLabels &&
        cardinals.map(({ label, angle, color }) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <text
              key={label}
              x={cx + labelR * Math.cos(rad)}
              y={cy + labelR * Math.sin(rad)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={cardinalFont}
              fontWeight={700}
              fill={color}
              style={{ userSelect: "none" }}
            >
              {label}
            </text>
          );
        })}
    </svg>
  );
}
