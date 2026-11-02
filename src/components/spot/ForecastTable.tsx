"use client";

import { useTranslations, useLocale } from "next-intl";
import type { FullForecast, HourlyPoint } from "@/lib/forecast";
import { windCellStyle, tempCellStyle, roundKnots } from "@/lib/forecast";
import { useWindUnits } from "@/lib/useWindUnits";
import { windPaletteLegend } from "@/lib/windPalette";

// ─── Data helpers ─────────────────────────────────────────────────────────────

/** Keep only the entries at 00h, 03h, 06h … 21h (every 3 hours). */
function filterEvery3h(hourly: HourlyPoint[]): HourlyPoint[] {
  return hourly.filter((pt) => {
    const hour = parseInt(pt.time.slice(11, 13), 10);
    return hour % 3 === 0;
  });
}

type DayGroup = {
  /** "2026-04-01" */
  date: string;
  /** "Me 1.4" */
  label: string;
  points: HourlyPoint[];
};

function groupByDay(points: HourlyPoint[], locale: string = "fr"): DayGroup[] {
  const map = new Map<string, HourlyPoint[]>();
  for (const pt of points) {
    const date = pt.time.slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(pt);
  }
  return Array.from(map.entries()).map(([date, pts]) => {
    // Parse as local noon to avoid DST edge cases
    const d = new Date(`${date}T12:00:00`);
    const dayAbbr = new Intl.DateTimeFormat(locale, {
      weekday: "short",
    }).format(d);
    const label = `${dayAbbr} ${d.getDate()}.${d.getMonth() + 1}`;
    return { date, label, points: pts };
  });
}

/** true if this point is the first column of a new day (00h, not the very first column). */
function isDayStart(pt: HourlyPoint, idx: number): boolean {
  return idx > 0 && parseInt(pt.time.slice(11, 13), 10) === 0;
}

// ─── Sub-components (server-safe, no "use client") ────────────────────────────

/** Inline SVG wind-direction arrow. Rotated so it points where the wind BLOWS TO. */
function WindArrow({ direction }: { direction: number }) {
  const rotation = (direction + 180) % 360;
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      style={{ display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      <g transform={`rotate(${rotation}, 8, 8)`}>
        <line
          x1="8"
          y1="13"
          x2="8"
          y2="4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polygon points="8,1.5 4.5,6.5 11.5,6.5" fill="currentColor" />
      </g>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  forecast: FullForecast;
  /** Use light (white) background instead of dark zinc-900 */
  light?: boolean;
  /** Source attribution shown in footer (defaults to Open-Meteo) */
  source?: { label: string; url?: string };
}

/**
 * Windguru-style 7-day forecast table.
 *
 * Rows: Vent (kn) · Rafales (kn) · Direction · Temp (°C) ·
 *       Nuages (%) · Précip (mm) · [Vagues (m)]
 *
 * Displayed values are in **knots** (industry standard for kitesurfing).
 * Colors are computed from km/h thresholds for accuracy.
 */
export function ForecastTable({ forecast, light = true, source }: Props) {
  const t = useTranslations("ForecastTable");
  const locale = useLocale();
  const { useKnots } = useWindUnits();
  const speed = (kmh: number) => useKnots ? roundKnots(kmh) : Math.round(kmh);
  const unit = useKnots ? "kts" : "km/h";
  const windLabel = (key: "wind" | "gusts") => t(key).replace(/\((?:kn|kts)\)/g, `(${unit})`);
  const points = filterEvery3h(forecast.hourly);
  const days = groupByDay(points, locale);
  const allPoints = days.flatMap((d) => d.points);

  const LABEL_CELL = light
    ? "sticky left-0 z-10 bg-white text-[11px] text-gray-600 font-semibold px-3 py-2 text-left whitespace-nowrap border-r border-gray-100 select-none"
    : "sticky left-0 z-10 bg-zinc-900 text-[11px] text-zinc-300 font-semibold px-3 py-2 text-left whitespace-nowrap border-r border-white/10 select-none";
  const DATA_CELL = light
    ? "text-center text-[11px] font-bold tabular-nums px-1 py-1.5 min-w-[34px] border-b border-gray-50"
    : "text-center text-[11px] font-bold tabular-nums px-1 py-1.5 min-w-[34px] border-b border-white/5";
  const DAY_BORDER = light
    ? "border-l-2 border-gray-300"
    : "border-l-2 border-white/30";
  const ROW_BORDER = light
    ? "border-b border-gray-100"
    : "border-b border-white/10";

  return (
    <div className="ow-forecast-scroll" data-tone={light ? "light" : "dark"}>
      <div className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-sky-600" role="region" aria-label={t("caption")} tabIndex={0}>
        <table className="border-collapse w-max">
          <caption className="sr-only">{t("caption")}</caption>
          {/* ── Header: day names ────────────────────────────── */}
          <thead>
            <tr>
              {/* Top-left empty cell — aligns with label column */}
              <th
                className={`${LABEL_CELL} ${ROW_BORDER} ${light ? "bg-gray-50" : "bg-zinc-900/90"}`}
                rowSpan={2}
              >
                <span
                  className={`ow-forecast-muted font-normal`}
                >
                  {unit} / °C
                </span>
              </th>

              {days.map((day) => (
                <th
                  key={day.date}
                  scope="colgroup"
                  colSpan={day.points.length}
                  className={`text-center text-[10px] font-semibold ${light ? "text-gray-700" : "text-zinc-200"} px-1 py-1 ${ROW_BORDER} ${light ? "border-l-2 border-gray-300" : "border-l-2 border-white/30"}`}
                >
                  {day.label}
                </th>
              ))}
            </tr>

            {/* Hour labels */}
            <tr>
              {allPoints.map((pt, i) => {
                const hourStr = pt.time.slice(11, 13) + "h";
                return (
                  <td
                    key={i}
                    className={`text-center text-[9px] ow-forecast-muted px-0 py-0.5 ${ROW_BORDER} ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                  >
                    {hourStr}
                  </td>
                );
              })}
            </tr>
          </thead>

          {/* ── Body rows ────────────────────────────────────── */}
          <tbody>
            {/* Wind speed (knots) */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{windLabel("wind")}</th>
              {allPoints.map((pt, i) => (
                <td
                  key={i}
                  style={windCellStyle(pt.windSpeedKmh)}
                  className={`${DATA_CELL} ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                  title={`${Math.round(pt.windSpeedKmh)} km/h`}
                >
                  {speed(pt.windSpeedKmh)}
                </td>
              ))}
            </tr>

            {/* Gusts (knots) */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{windLabel("gusts")}</th>
              {allPoints.map((pt, i) => (
                <td
                  key={i}
                  style={windCellStyle(pt.gustsKmh)}
                  className={`${DATA_CELL} ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                  title={`${Math.round(pt.gustsKmh)} km/h`}
                >
                  {speed(pt.gustsKmh)}
                </td>
              ))}
            </tr>

            {/* Wind direction (SVG arrows) */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{t("direction")}</th>
              {allPoints.map((pt, i) => (
                <td
                  key={i}
                  className={`${DATA_CELL} ${light ? "text-gray-500" : "text-zinc-400"} ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                  title={`${pt.windDirection}°`}
                >
                  <WindArrow direction={pt.windDirection} />
                </td>
              ))}
            </tr>

            {/* Temperature */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{t("temp")}</th>
              {allPoints.map((pt, i) => (
                <td
                  key={i}
                  style={tempCellStyle(pt.temperatureC)}
                  className={`${DATA_CELL} ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                >
                  {Math.round(pt.temperatureC)}
                </td>
              ))}
            </tr>

            {/* Cloud cover */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{t("clouds")}</th>
              {allPoints.map((pt, i) => (
                <td
                  key={i}
                  className={`${DATA_CELL} font-normal ow-forecast-muted ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                >
                  {pt.cloudcover > 0 ? pt.cloudcover : ""}
                </td>
              ))}
            </tr>

            {/* Precipitation */}
            <tr>
              <th scope="row" className={LABEL_CELL}>{t("precip")}</th>
              {allPoints.map((pt, i) => {
                const hasPrecip = pt.precipMmh >= 0.1;
                return (
                  <td
                    key={i}
                    className={`${DATA_CELL} font-normal ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                    style={
                      hasPrecip
                        ? { background: "var(--ow-rain)", color: "var(--ow-rain-ink)" }
                        : {}
                    }
                  >
                    {hasPrecip ? pt.precipMmh.toFixed(1) : ""}
                  </td>
                );
              })}
            </tr>

            {/* Waves — only shown for coastal spots */}
            {forecast.hasWaves && (
              <>
                <tr>
                  <th scope="row" className={LABEL_CELL}>{t("waves")}</th>
                  {allPoints.map((pt, i) => (
                    <td
                      key={i}
                      className={`${DATA_CELL} font-normal ow-forecast-muted ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                    >
                      {pt.waveHeightM != null ? pt.waveHeightM.toFixed(1) : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className={LABEL_CELL}>{t("wavePeriod")}</th>
                  {allPoints.map((pt, i) => (
                    <td
                      key={i}
                      className={`${DATA_CELL} font-normal ow-forecast-muted ${isDayStart(pt, i) ? DAY_BORDER : ""}`}
                    >
                      {pt.wavePeriodS != null
                        ? Math.round(pt.wavePeriodS)
                        : "—"}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Numeric intensity scale, separate from any assessment of suitability. */}
      <div className={`px-4 py-3 border-t ${light ? "border-gray-100" : "border-white/10"}`}>
        <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
          {windPaletteLegend(useKnots).map(({ color, range }) => (
            <span key={range} className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className={light ? "text-gray-600" : "text-zinc-300"}>
                {range}
              </span>
            </span>
          ))}
        </div>
        <p className={`text-xs leading-5 sm:mt-2 ${light ? "text-gray-600" : "text-zinc-300"}`}>
          {source?.label ?? "Open-Meteo"} · CC BY 4.0 · {t("timezone")} {forecast.timezone}
        </p>
      </div>
    </div>
  );
}
