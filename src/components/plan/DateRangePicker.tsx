"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  /** Default: today */
  minDate?: string;
  /** Max number of days from `minDate` selectable. Default 90. */
  maxDays?: number;
  /** Threshold above which we warn that data falls back to historical averages. Default 16. */
  forecastDays?: number;
  className?: string;
}

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const DOW_FR = ["L", "M", "M", "J", "V", "S", "D"];

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const startOfDay = (d: Date) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};
const formatLabel = (s: string) =>
  fromISO(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const diffDays = (a: string, b: string) =>
  Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000) + 1;

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  // Convert getDay (Sun=0..Sat=6) to Mon=0..Sun=6
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDays = 90,
  forecastDays = 16,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const todayISO = useMemo(() => toISO(startOfDay(new Date())), []);
  const minISO = minDate ?? todayISO;
  const maxISO = useMemo(
    () => toISO(addDays(fromISO(minISO), maxDays)),
    [minISO, maxDays],
  );

  const initialMonth = useMemo(() => {
    const d = fromISO(startDate || todayISO);
    return new Date(d.getFullYear(), d.getMonth(), 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current?.contains(e.target as Node)) return;
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const days = startDate && endDate ? diffDays(startDate, endDate) : 0;
  const beyondForecast =
    days > 0 &&
    fromISO(endDate).getTime() - fromISO(todayISO).getTime() >
      forecastDays * 86400000;

  const handleDayClick = (iso: string) => {
    if (iso < minISO || iso > maxISO) return;
    if (!pickingEnd) {
      onChange(iso, iso);
      setPickingEnd(true);
      setHoverDate(iso);
    } else {
      if (iso < startDate) {
        onChange(iso, iso);
        setPickingEnd(true);
        setHoverDate(iso);
        return;
      }
      onChange(startDate, iso);
      setPickingEnd(false);
      setHoverDate(null);
    }
  };

  const presets = useMemo(() => {
    const today = fromISO(todayISO);
    const dow = (today.getDay() + 6) % 7; // Mon=0..Sun=6
    const sat = addDays(today, (5 - dow + 7) % 7);
    const sun = addDays(sat, 1);
    return [
      { label: "Aujourd'hui", start: todayISO, end: todayISO },
      { label: "Ce week-end", start: toISO(sat), end: toISO(sun) },
      { label: "7 jours", start: todayISO, end: toISO(addDays(today, 6)) },
      { label: "14 jours", start: todayISO, end: toISO(addDays(today, 13)) },
    ];
  }, [todayISO]);

  const renderMonth = (base: Date) => {
    const y = base.getFullYear();
    const m = base.getMonth();
    const grid = buildMonthGrid(y, m);
    return (
      <div className="flex-1 min-w-0">
        <div className="text-center text-sm font-semibold text-gray-800 mb-2 capitalize">
          {MONTHS_FR[m]} {y}
        </div>
        <div className="grid grid-cols-7 text-[10px] text-gray-400 mb-1 font-medium">
          {DOW_FR.map((d, i) => (
            <div key={i} className="text-center py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((d) => {
            const iso = toISO(d);
            const isCurrentMonth = d.getMonth() === m;
            const isDisabled = iso < minISO || iso > maxISO;
            const isStart = iso === startDate;
            const isEnd = iso === endDate && endDate !== startDate;
            const isSingle =
              iso === startDate && startDate === endDate && !pickingEnd;
            const inRange =
              startDate && endDate && iso > startDate && iso < endDate;
            const inHoverRange =
              pickingEnd &&
              hoverDate &&
              hoverDate > startDate &&
              iso > startDate &&
              iso <= hoverDate;

            const isRangeEdge = isStart || isEnd;
            const colored = isRangeEdge || inRange || inHoverRange || isSingle;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleDayClick(iso)}
                onMouseEnter={() => pickingEnd && setHoverDate(iso)}
                disabled={isDisabled || !isCurrentMonth}
                className="h-9 p-0 relative"
                style={{ background: "transparent" }}
              >
                <span
                  className={[
                    "absolute inset-y-0 flex items-center justify-center text-sm w-full transition-colors",
                    !isCurrentMonth ? "text-transparent" : "",
                    isDisabled && isCurrentMonth
                      ? "text-gray-300 cursor-not-allowed"
                      : "",
                    isCurrentMonth && !isDisabled && !colored
                      ? "text-gray-700 hover:bg-gray-100 rounded-full"
                      : "",
                  ].join(" ")}
                >
                  {/* Range background (rectangle) */}
                  {(inRange || inHoverRange) && (
                    <span className="absolute inset-y-1 inset-x-0 bg-sky-100" />
                  )}
                  {/* Edge half-rectangle to bridge into range */}
                  {isStart &&
                    (endDate !== startDate ||
                      (pickingEnd && hoverDate && hoverDate > startDate)) && (
                      <span className="absolute inset-y-1 right-0 left-1/2 bg-sky-100" />
                    )}
                  {isEnd && (
                    <span className="absolute inset-y-1 left-0 right-1/2 bg-sky-100" />
                  )}
                  {/* Edge circle */}
                  {(isRangeEdge || isSingle) && (
                    <span className="absolute inset-y-0.5 left-1/2 -translate-x-1/2 aspect-square h-8 rounded-full bg-sky-600" />
                  )}
                  <span
                    className={`relative z-10 ${
                      isRangeEdge || isSingle
                        ? "text-white font-semibold"
                        : inRange || inHoverRange
                          ? "text-sky-700"
                          : ""
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const triggerLabel =
    startDate && endDate
      ? startDate === endDate
        ? formatLabel(startDate)
        : `${formatLabel(startDate)} → ${formatLabel(endDate)}`
      : "Sélectionner";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-sky-500 transition-colors"
      >
        <Calendar className="h-3.5 w-3.5 text-sky-500 shrink-0" />
        <span className="flex-1 text-left truncate">{triggerLabel}</span>
        {days > 0 && (
          <span
            className={`text-xs shrink-0 px-1.5 py-0.5 rounded-md ${
              beyondForecast
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {days} j
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute z-50 mt-2 left-0 w-[min(640px,calc(100vw-2rem))] bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
        >
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {presets.map((p) => {
              const active = p.start === startDate && p.end === endDate;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    onChange(p.start, p.end);
                    setPickingEnd(false);
                    setHoverDate(null);
                    setViewMonth(
                      new Date(
                        fromISO(p.start).getFullYear(),
                        fromISO(p.start).getMonth(),
                        1,
                      ),
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(
                    viewMonth.getFullYear(),
                    viewMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  new Date(
                    viewMonth.getFullYear(),
                    viewMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Months: 2 on desktop, 1 on mobile */}
          <div className="flex gap-6">
            {renderMonth(viewMonth)}
            <div className="hidden sm:block flex-1">
              {renderMonth(
                new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="text-xs text-gray-600 min-w-0 flex-1">
              {days > 0 ? (
                <>
                  <span className="font-semibold text-gray-800">
                    {days} jour{days > 1 ? "s" : ""}
                  </span>
                  {" · "}
                  {beyondForecast ? (
                    <span className="text-amber-600">
                      Au-delà de {forecastDays} j → moyennes historiques
                    </span>
                  ) : (
                    <span className="text-emerald-600">
                      Prévisions précises
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-400">Choisis une date de début</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
