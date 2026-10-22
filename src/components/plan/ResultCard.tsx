"use client";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PlannerResult, PlannerWindow } from "@/lib/planner";
import type { PlannerCopy } from "@/lib/planner-copy";
import type { SiteLocale } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import { plannerUiCopy } from "@/lib/planner-ui-copy";
import { comparisonReason, roundedWindRange } from "@/lib/planner-comparison";
import { QualificationPanel } from "./QualificationPanel";

function windowLabel(w: PlannerWindow, timezone: string, locale: SiteLocale) {
  const day = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(w.start);
  const time = (v: number) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(v);
  return `${day} · ${time(w.start)}–${time(w.end)}`;
}
export function ResultCard({
  spot,
  rank,
  c,
  locale,
  comparison = [],
}: {
  spot: PlannerResult;
  rank?: number;
  c: PlannerCopy;
  locale: SiteLocale;
  comparison?: PlannerResult[];
}) {
  const ui = plannerUiCopy[locale],
    q = spot.qualification;
  const w = q?.eligible ? spot.windows[0] : undefined;
  const reason = comparisonReason(spot, comparison);
  const divisor = spot.sportType === "KITE" ? 1.852 : 1,
    unit = spot.sportType === "KITE" ? "kts" : "km/h";
  const speed = (v: number) => Math.round(v / divisor);
  const number = (v: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v);
  const at = (v: number) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: spot.timezone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(v);
  const open = () =>
    trackEvent("plan_result_open", {
      spot_id: spot.id,
      sport: spot.sportType.toLowerCase(),
      score: w?.score,
      interaction: "navigate",
    });
  return (
    <article
      data-planner-card
      className={`min-w-0 overflow-hidden rounded-2xl border bg-white ${rank && w ? "border-sky-200 shadow-sm" : "border-slate-200"}`}
    >
      <div className="px-4 pt-4">
        <div className="flex items-start gap-2.5">
          {rank && w && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sm font-semibold text-sky-800">
              {String(rank).padStart(2, "0")}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug">
              <Link
                href={`/spots/${spot.id}`}
                onClick={open}
                className="hover:text-sky-800 hover:underline"
              >
                {spot.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {[
                spot.region,
                spot.country,
                spot.distanceKm === null
                  ? null
                  : `${Math.round(spot.distanceKm)} km`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <p
          className={`mt-2 text-[11px] font-medium ${q?.eligible ? "text-teal-800" : "text-amber-800"}`}
        >
          {ui.status[q?.status ?? "MISSING"]}
        </p>
        {w ? (
          <div className="mt-2 rounded-xl bg-sky-50 px-3 py-2.5">
            <p className="text-sm font-semibold text-sky-950">
              {windowLabel(w, spot.timezone!, locale)}
            </p>
            <p className="mt-1 text-sm text-sky-900">
              <strong>
                {roundedWindRange(w.windMin, w.windMax, divisor)} {unit}
              </strong>
              <span className="mx-2 text-sky-300">/</span>
              {c.gust} {speed(w.gustMax)} {unit}
            </p>
          </div>
        ) : spot.weather ? (
          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-medium text-slate-600">
              {ui.weatherMaxima}
            </p>
            <p className="mt-1 text-sm text-slate-900">
              <strong>
                {ui.windMax} {speed(spot.weather.windMax)} {unit}
              </strong>
              <span className="mx-2 text-slate-300">/</span>
              {ui.gustMax}{" "}
              {spot.weather.gustMax === null
                ? "—"
                : `${speed(spot.weather.gustMax)} ${unit}`}
            </p>
            {(spot.weather.gustsAboveThreshold ||
              spot.weather.windAboveThreshold) && (
              <p className="mt-1 text-xs font-medium text-amber-900">
                {spot.weather.gustsAboveThreshold ? ui.highGusts : ui.highWind}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">{ui.preview}</p>
          </div>
        ) : spot.seasonal ? (
          <p className="mt-3 text-sm text-slate-700">
            {c.historicalWind} :{" "}
            <strong>
              {speed(spot.seasonal.wind)} {unit}
            </strong>
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            {q?.eligible
              ? spot.unavailable
                ? c.unavailable
                : c.noWindow
              : ui.pending}
          </p>
        )}
        {reason && (
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {ui[reason]}
          </p>
        )}
      </div>
      <details className="group mt-2 px-4 text-xs leading-relaxed text-slate-600">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-medium text-slate-800">
          {ui.details}
          <span aria-hidden className="text-base group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="space-y-3 border-t border-slate-100 py-3">
          {!w && spot.weather && (
            <>
              <p>
                {ui.windPeak} : {at(spot.weather.windPeakAt)} ·{" "}
                {speed(spot.weather.windMax)} {unit}
              </p>
              {spot.weather.gustPeakAt !== null &&
                spot.weather.gustMax !== null && (
                  <p>
                    {ui.gustPeak} : {at(spot.weather.gustPeakAt)} ·{" "}
                    {speed(spot.weather.gustMax)} {unit}
                  </p>
                )}
              <p>
                {c.localTime} ({spot.timezone}) · {c.source}{" "}
                {spot.retrievedAt ? at(Date.parse(spot.retrievedAt)) : "—"}
              </p>
            </>
          )}
          {w && (
            <>
              <p>
                {number(w.hours)} h {c.continuous} · {c.localTime} (
                {spot.timezone})
              </p>
              <p>
                {c.direction} :{" "}
                {w.directions.map((d) => `${Math.round(d)}°`).join(" / ")} ·{" "}
                {c.gustMatch}
              </p>
              {spot.windows.length > 1 && (
                <div>
                  <p className="font-medium">{c.otherWindows}</p>
                  <ul>
                    {spot.windows.slice(1).map((slot) => (
                      <li key={slot.start}>
                        {windowLabel(slot, spot.timezone!, locale)} ·{" "}
                        {number(slot.hours)} h
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p>
                {c.index} {w.score}/100 · {c.source}{" "}
                {spot.retrievedAt
                  ? new Intl.DateTimeFormat(locale, {
                      timeZone: spot.timezone,
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(spot.retrievedAt))
                  : "—"}
              </p>
            </>
          )}
          {!w && q?.eligible && (
            <ul>
              {Object.entries(spot.reasons)
                .filter(([r]) => r !== "daylight")
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([r]) => (
                  <li key={r}>{c.reasons[r as keyof typeof c.reasons]}</li>
                ))}
            </ul>
          )}
          {spot.seasonal && (
            <p>
              {c.historicalGust} : {speed(spot.seasonal.gust)} {unit} ·{" "}
              {spot.seasonal.years.join("–")} · {spot.seasonal.days}{" "}
              {c.observations}
            </p>
          )}
          <QualificationPanel qualification={q} locale={locale} />
          {spot.access && (
            <p>
              <strong>{c.access} : </strong>
              {spot.access}
            </p>
          )}
          {spot.hazards && (
            <p>
              <strong>{c.hazards} : </strong>
              {spot.hazards}
            </p>
          )}
        </div>
      </details>
      <Link
        href={`/spots/${spot.id}`}
        onClick={open}
        className="flex min-h-11 items-center justify-between gap-2 border-t border-slate-100 px-4 py-2 text-xs font-medium text-sky-800 hover:bg-sky-50"
      >
        {c.open}
        <ArrowUpRight size={16} className="shrink-0" aria-hidden />
      </Link>
    </article>
  );
}
