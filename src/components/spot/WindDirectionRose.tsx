"use client";

/**
 * WindDirectionRose
 *
 * Displays a 16-segment wind rose where each segment corresponds to one of the
 * 16 compass points (N, NNE, NE … NNW). Best directions are highlighted in
 * sky-blue; the rest are gray.
 *
 * Props:
 *  - bestDirections: string[]  — e.g. ["N", "NNE", "NE"]
 *  - currentDirection?: number — live wind direction in degrees (0–360)
 *  - size?: number             — SVG size in px (default 80)
 *  - interactive?: boolean     — if true, clicking a segment toggles it
 *  - onChange?: (dirs: string[]) => void — called when a segment is toggled
 *  - label?: boolean           — show N/E/S/W labels (default true)
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

function segmentPath(
  index: number,
  cx: number,
  cy: number,
  ri: number,
  ro: number,
  gapDeg = 1.5,
): string {
  const step = (2 * Math.PI) / 16;
  const gapRad = (gapDeg * Math.PI) / 180;
  // N is at top (-90°), directions go clockwise
  const base = index * step - Math.PI / 2;
  const a1 = base + gapRad;
  const a2 = base + step - gapRad;

  const x1 = cx + ri * Math.cos(a1);
  const y1 = cy + ri * Math.sin(a1);
  const x2 = cx + ro * Math.cos(a1);
  const y2 = cy + ro * Math.sin(a1);
  const x3 = cx + ro * Math.cos(a2);
  const y3 = cy + ro * Math.sin(a2);
  const x4 = cx + ri * Math.cos(a2);
  const y4 = cy + ri * Math.sin(a2);

  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `L ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `A ${ro} ${ro} 0 0 1 ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    `L ${x4.toFixed(2)} ${y4.toFixed(2)}`,
    `A ${ri} ${ri} 0 0 0 ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    "Z",
  ].join(" ");
}

interface Props {
  bestDirections: string[];
  currentDirection?: number | null;
  size?: number;
  interactive?: boolean;
  onChange?: (dirs: string[]) => void;
  showLabels?: boolean;
}

export function WindDirectionRose({
  bestDirections,
  currentDirection,
  size = 80,
  interactive = false,
  onChange,
  showLabels = true,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const ri = size * 0.22;
  const ro = size * 0.44;

  const best = new Set(bestDirections.map((d) => d.toUpperCase()));

  const toggle = (dir: string) => {
    if (!interactive || !onChange) return;
    const next = best.has(dir)
      ? bestDirections.filter((d) => d.toUpperCase() !== dir)
      : [...bestDirections, dir];
    onChange(next);
  };

  // Cardinal label positions (just outside the rose)
  const labelR = size * 0.5;
  const cardinals = [
    { label: "N", angle: -Math.PI / 2 },
    { label: "E", angle: 0 },
    { label: "S", angle: Math.PI / 2 },
    { label: "W", angle: Math.PI },
  ];

  // Arrow for current live wind direction
  const arrowLength = size * 0.18;
  let arrowEl: React.ReactNode = null;
  if (currentDirection != null) {
    const angle = ((currentDirection - 90) * Math.PI) / 180;
    const ax = cx + arrowLength * Math.cos(angle);
    const ay = cy + arrowLength * Math.sin(angle);
    arrowEl = (
      <line
        x1={cx}
        y1={cy}
        x2={ax}
        y2={ay}
        stroke="#0ea5e9"
        strokeWidth={size * 0.04}
        strokeLinecap="round"
        style={{ pointerEvents: "none" }}
      />
    );
  }

  const fontSize = size * 0.12;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Rose des vents"
    >
      {/* Segments */}
      {DIRS.map((dir, i) => {
        const active = best.has(dir);
        return (
          <path
            key={dir}
            d={segmentPath(i, cx, cy, ri, ro)}
            fill={active ? "#0ea5e9" : "#e5e7eb"}
            opacity={active ? 1 : 0.6}
            style={interactive ? { cursor: "pointer" } : undefined}
            onClick={() => toggle(dir)}
          >
            {interactive && <title>{dir}</title>}
          </path>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.05} fill="#cbd5e1" />

      {/* Live wind arrow */}
      {arrowEl}

      {/* Cardinal labels */}
      {showLabels &&
        cardinals.map(({ label, angle }) => {
          const x = cx + labelR * Math.cos(angle);
          const y = cy + labelR * Math.sin(angle);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight="600"
              fill="#6b7280"
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
        <div className="flex flex-wrap gap-1 justify-center max-w-[160px]">
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
