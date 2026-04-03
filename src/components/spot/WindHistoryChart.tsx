"use client";

import { useRef, useEffect, useState } from "react";
import { windCellStyle, roundKnots } from "@/lib/forecast";
import { windDirectionLabel } from "@/lib/utils";
import type { HistoryPoint } from "@/types";

interface Props {
  history: HistoryPoint[];
  useKnots: boolean;
}

export function WindHistoryChart({ history, useKnots }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (history.length === 0) return null;

  // ── Helper: convert "YYYY-MM-DDTHH:mm" UTC to local timezone ──────────
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const toLocal = (utcTime: string) => {
    const d = new Date(utcTime + ":00Z");
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  // ── Layout constants ──────────────────────────────────────────────────────
  const BAR_W = 2;
  const BAR_GAP = 1;
  const BAR_SLOT = BAR_W + BAR_GAP;
  const CHART_H = 230;
  const DAY_H = 16;
  const TIME_H = 13;
  const AXIS_W = 30;
  const totalH = DAY_H + TIME_H + CHART_H;
  const totalW = AXIS_W + history.length * BAR_SLOT + 4;

  // ── Wind Y scale ──────────────────────────────────────────────────────────
  const toDisp = (kmh: number) => (useKnots ? roundKnots(kmh) : kmh);
  const dataMax = Math.max(
    ...history.flatMap((p) => [toDisp(p.windSpeedKmh), toDisp(p.gustsKmh)]),
    useKnots ? 5 : 10,
  );
  const yMax = Math.ceil(dataMax / 5) * 5 + 5;
  const bH = (kmh: number) => Math.max((toDisp(kmh) / yMax) * CHART_H, 1);
  const bY = (kmh: number) => DAY_H + TIME_H + CHART_H - bH(kmh);

  // ── Temperature Y scale ───────────────────────────────────────────────────
  const validTemps = history
    .map((p) => p.temperatureC)
    .filter((t) => isFinite(t));
  const tempMin = validTemps.length
    ? Math.floor(Math.min(...validTemps) - 2)
    : 0;
  const tempMax = validTemps.length
    ? Math.ceil(Math.max(...validTemps) + 2)
    : 30;
  const tempRange = tempMax - tempMin || 1;
  const tempY = (c: number) =>
    DAY_H + TIME_H + CHART_H - ((c - tempMin) / tempRange) * CHART_H;

  // ── Day groups (by local date) ────────────────────────────────────────────
  type DayGroup = { date: string; startIdx: number; count: number };
  const dayGroups: DayGroup[] = [];
  let prevDay = "";
  history.forEach((p, i) => {
    const day = toLocal(p.time).slice(0, 10);
    if (day !== prevDay) {
      dayGroups.push({ date: day, startIdx: i, count: 1 });
      prevDay = day;
    } else {
      dayGroups[dayGroups.length - 1].count++;
    }
  });

  const fmtDay = (d: string) => {
    const dt = new Date(d + "T12:00:00Z");
    const days = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
    return `${days[dt.getUTCDay()]} ${dt.getUTCDate()}.${dt.getUTCMonth() + 1}`;
  };

  // ── Now index ─────────────────────────────────────────────────────────────
  const nowStr = new Date().toISOString().slice(0, 16);
  let nowIdx = -1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].time <= nowStr) {
      nowIdx = i;
      break;
    }
  }

  // ── Y ticks ───────────────────────────────────────────────────────────────
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += 5) yTicks.push(v);

  // ── Temperature polyline ──────────────────────────────────────────────────
  const tempPolyline = history
    .map((p, i) => {
      const x = AXIS_W + i * BAR_SLOT + BAR_W / 2;
      const y = tempY(p.temperatureC);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // ── Auto-scroll to show "now" at 80% from left ────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!containerRef.current || nowIdx < 0) return;
    const nowX = AXIS_W + nowIdx * BAR_SLOT;
    const visible = containerRef.current.clientWidth;
    containerRef.current.scrollLeft = Math.max(0, nowX - visible * 0.8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const svgX = e.clientX - svgRect.left;
    const idx = Math.floor((svgX - AXIS_W) / BAR_SLOT);
    if (idx >= 0 && idx < history.length) {
      setHoveredIdx(idx);
      const container = containerRef.current!;
      const containerRect = container.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - containerRect.left + container.scrollLeft,
        y: e.clientY - containerRect.top,
      });
    }
  };

  const hovPoint = hoveredIdx !== null ? history[hoveredIdx] : null;
  const TTW = 190;

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {/* ── Hover tooltip ───────────────────────────────────────────────── */}
      {hovPoint &&
        (() => {
          const style = windCellStyle(hovPoint.windSpeedKmh);
          const container = containerRef.current;
          const containerW = container?.clientWidth ?? 0;
          const scrollLeft = container?.scrollLeft ?? 0;
          const visibleX = tooltipPos.x - scrollLeft;
          const tipX = Math.max(
            scrollLeft + 4,
            Math.min(
              visibleX + 14 + TTW > containerW
                ? tooltipPos.x - TTW - 6
                : tooltipPos.x + 14,
              scrollLeft + containerW - TTW - 4,
            ),
          );
          const tipY = Math.max(tooltipPos.y - 110, 4);

          return (
            <div
              className="absolute z-20 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 pointer-events-none"
              style={{ left: tipX, top: tipY, width: TTW }}
            >
              <div className="text-[10px] text-gray-400 font-medium mb-2">
                {new Date(hovPoint.time + ":00Z").toLocaleDateString("fr", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                — {toLocal(hovPoint.time).slice(11, 16)}
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Vent moyen</span>
                <span
                  className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded"
                  style={{ background: style.background, color: style.color }}
                >
                  {useKnots
                    ? roundKnots(hovPoint.windSpeedKmh)
                    : Math.round(hovPoint.windSpeedKmh)}{" "}
                  {useKnots ? "kts" : "km/h"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Rafales</span>
                <span className="text-xs font-semibold tabular-nums text-gray-600">
                  {useKnots
                    ? roundKnots(hovPoint.gustsKmh)
                    : Math.round(hovPoint.gustsKmh)}{" "}
                  {useKnots ? "kts" : "km/h"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">T°</span>
                <span className="text-xs text-rose-400 font-medium">
                  {Math.round(hovPoint.temperatureC)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Direction</span>
                <span className="text-xs text-gray-600">
                  {windDirectionLabel(hovPoint.windDirection)}{" "}
                  {hovPoint.windDirection}°
                </span>
              </div>
            </div>
          );
        })()}

      {/* ── Main SVG chart ───────────────────────────────────────────────── */}
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{
          display: "block",
          cursor: "crosshair",
          minWidth: `${totalW}px`,
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Grid lines + Y-axis labels */}
        {yTicks.map((tick) => {
          if (tick === 0) return null;
          const y = DAY_H + TIME_H + CHART_H - (tick / yMax) * CHART_H;
          return (
            <g key={tick}>
              <line
                x1={AXIS_W}
                y1={y}
                x2={totalW}
                y2={y}
                stroke={tick % 10 === 0 ? "#e5e7eb" : "#f9fafb"}
                strokeWidth="1"
              />
              {tick % 10 === 0 && (
                <text
                  x={AXIS_W - 5}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9"
                  fill="#d1d5db"
                  fontFamily="system-ui, sans-serif"
                >
                  {tick}
                </text>
              )}
            </g>
          );
        })}

        {/* Y-axis unit rotated */}
        <text
          x={10}
          y={DAY_H + TIME_H + CHART_H / 2}
          textAnchor="middle"
          fontSize="8"
          fill="#d1d5db"
          fontFamily="system-ui, sans-serif"
          transform={`rotate(-90, 10, ${DAY_H + TIME_H + CHART_H / 2})`}
        >
          {useKnots ? "kts" : "km/h"}
        </text>

        {/* Day separators + labels */}
        {dayGroups.map((g, gi) => {
          const x = AXIS_W + g.startIdx * BAR_SLOT;
          const w = g.count * BAR_SLOT;
          return (
            <g key={g.date}>
              {gi > 0 && (
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={totalH}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              )}
              <text
                x={x + w / 2}
                y={DAY_H / 2 + 5}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
              >
                {fmtDay(g.date)}
              </text>
            </g>
          );
        })}

        {/* Hour labels: every 3h (local time) */}
        {history.map((p, i) => {
          const local = toLocal(p.time);
          const minStr = local.slice(14, 16);
          const hourStr = local.slice(11, 13);
          const hour = parseInt(hourStr, 10);
          if (minStr !== "00" || hour % 3 !== 0) return null;
          const x = AXIS_W + i * BAR_SLOT + BAR_W / 2;
          return (
            <text
              key={`t-${i}`}
              x={x}
              y={DAY_H + TIME_H - 3}
              textAnchor="middle"
              fontSize="8"
              fill="#9ca3af"
              fontFamily="system-ui, sans-serif"
            >
              {hourStr}h
            </text>
          );
        })}

        {/* Hover column highlight */}
        {hoveredIdx !== null && (
          <rect
            x={AXIS_W + hoveredIdx * BAR_SLOT - BAR_GAP / 2}
            y={DAY_H + TIME_H}
            width={BAR_SLOT}
            height={CHART_H}
            fill="rgba(0,0,0,0.06)"
            rx="1"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* Wind + gust bars */}
        {history.map((p, i) => {
          const style = windCellStyle(p.windSpeedKmh);
          const color = style.background;
          const x = AXIS_W + i * BAR_SLOT;
          const windH_ = bH(p.windSpeedKmh);
          const gustH_ = bH(p.gustsKmh);
          const baseY = DAY_H + TIME_H + CHART_H;
          return (
            <g key={`b-${i}`}>
              {p.gustsKmh > p.windSpeedKmh && (
                <rect
                  x={x}
                  y={baseY - gustH_}
                  width={BAR_W}
                  height={gustH_ - windH_}
                  fill={color}
                  opacity={0.3}
                  rx="0.5"
                />
              )}
              <rect
                x={x}
                y={baseY - windH_}
                width={BAR_W}
                height={windH_}
                fill={color}
                rx="0.5"
              />
            </g>
          );
        })}

        {/* Temperature polyline */}
        <polyline
          points={tempPolyline}
          fill="none"
          stroke="#fca5a5"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Temperature dots at each hour (local time) */}
        {history.map((p, i) => {
          if (toLocal(p.time).slice(14, 16) !== "00") return null;
          return (
            <circle
              key={`td-${i}`}
              cx={AXIS_W + i * BAR_SLOT + BAR_W / 2}
              cy={tempY(p.temperatureC)}
              r={2.5}
              fill="#f87171"
            />
          );
        })}

        {/* Baseline */}
        <line
          x1={AXIS_W}
          y1={DAY_H + TIME_H + CHART_H}
          x2={totalW}
          y2={DAY_H + TIME_H + CHART_H}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Now vertical line */}
        {nowIdx >= 0 && (
          <line
            x1={AXIS_W + nowIdx * BAR_SLOT + BAR_W / 2}
            y1={DAY_H}
            x2={AXIS_W + nowIdx * BAR_SLOT + BAR_W / 2}
            y2={DAY_H + TIME_H + CHART_H}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
      </svg>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-2 px-1 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-[#5cb85c]" />
          Vent moyen
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded-sm bg-[#5cb85c] opacity-30" />
          Rafales
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2 border-[#f87171]" />
          Température
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <span className="inline-block w-4 border-t-2 border-dashed border-red-500" />
          Maintenant
        </span>
      </div>
    </div>
  );
}
