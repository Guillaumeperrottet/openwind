"use client";

import { X } from "lucide-react";
import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { roundKnots } from "@/lib/forecast";
import { windDirectionLabel } from "@/lib/utils";

type Reading = { windSpeedKmh: number; gustsKmh: number; windDirection: number };

/** A pinned, readable alternative to a hover-only chart tooltip. Times are location-local. */
export function ChartReading({ point, time, forecast, useKnots, index, count, onSelect, onClear, compact = false }: {
  compact?: boolean;
  point: Reading | null; time: string; forecast: boolean; useKnots: boolean;
  index: number; count: number; onSelect: (index: number) => void; onClear: () => void;
}) {
  const t = useTranslations("WindChart");
  const locale = useLocale();
  const id = useId();
  if (!count) return null;
  const speed = (value: number) => useKnots ? roundKnots(value) : Math.round(value);
  const date = time ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${time.slice(0, 10)}T12:00:00Z`)) : "";
  return <div className={compact ? "ow-chart-reading-compact border-t border-slate-200" : "mt-3 border-t border-slate-200 pt-3"}>
    <label htmlFor={id} className="sr-only">{t("browse")}</label>
    <div className="flex min-h-11 items-center gap-3">
      <input id={id} type="range" min={0} max={count - 1} step={1} value={Math.min(index, count - 1)} onChange={(e) => onSelect(Number(e.target.value))} aria-valuetext={point ? `${date} ${time.slice(11, 16)}` : t("selectHour")} className="block h-11 min-w-0 flex-1 accent-sky-800" />
      {point && <button type="button" aria-label={t("clear")} onClick={onClear} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><X aria-hidden className="h-4 w-4" /></button>}
    </div>
    <output htmlFor={id} aria-live="polite" aria-atomic="true" className="block min-h-12 text-sm leading-6 text-slate-700">
      {point ? <><span className="font-semibold text-slate-950">{date} · {time.slice(11, 16)} · {t(forecast ? "forecast" : "history")}</span><span className="block tabular-nums">{t("wind")} {speed(point.windSpeedKmh)} {useKnots ? "kts" : "km/h"} · {t("gusts")} {speed(point.gustsKmh)} {useKnots ? "kts" : "km/h"} · {windDirectionLabel(point.windDirection)} {point.windDirection}°</span></> : t("selectHour")}
    </output>
  </div>;
}
