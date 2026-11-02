"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWindUnits } from "@/lib/useWindUnits";
import { usePersonalForecast } from "@/lib/usePersonalForecast";
import type { PlannerResult, PlannerWindow } from "@/lib/planner";
import { roundedWindRange } from "@/lib/planner-comparison";
import { windDirectionLabel } from "@/lib/utils";

export function PersonalForecast({ spotIds }: { spotIds: string[] }) {
  const t = useTranslations("ReturnExperience");
  const { windows, partial, hasSpots, isLoading, error, isValidating, mutate } = usePersonalForecast(spotIds);
  return <section id="personal-forecast" className="scroll-mt-20" aria-labelledby="personal-forecast-title">
    <h2 id="personal-forecast-title" className="text-xl font-semibold text-slate-950">{t("forecastTitle")}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t("forecastHelp")}</p>
    {isLoading ? <p role="status" className="mt-4 text-sm text-slate-600">{t("forecastLoading")}</p> : !hasSpots ? <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600">{t("noForecastSpots")}</p> : error ? <p role="status" className="mt-4 text-sm text-amber-900">{t("forecastError")} <button disabled={isValidating} className="min-h-11 px-2 font-semibold underline" onClick={() => void mutate()}>{t("retry")}</button></p> : <>
      {partial && <p role="status" className="mt-4 text-sm text-amber-900">{t("partialForecast")}</p>}
      {!windows.length ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm leading-6 text-slate-600">{t("noWindows")}</p><Link href="/plan" className="mt-3 inline-flex min-h-11 items-center font-semibold text-sky-800 underline">{t("broadenSearch")}</Link></div> : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{windows.map(({ spot, window }) => <ExplainedWindow key={`${spot.id}:${window.start}`} spot={spot} window={window} />)}</div>}
    </>}
  </section>;
}

export function ExplainedWindow({ spot, window: slot }: { spot: PlannerResult; window: PlannerWindow }) {
  const t = useTranslations("ReturnExperience");
  const locale = useLocale();
  const { useKnots } = useWindUnits();
  const divisor = useKnots ? 1.852 : 1, unit = useKnots ? "kts" : "km/h";
  const speed = (value: number) => Math.round(value / divisor);
  const date = (value: number, timeOnly = false) => new Intl.DateTimeFormat(locale, { timeZone: spot.timezone, ...(timeOnly ? {} : { weekday: "short", day: "numeric", month: "short" } as const), hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(value);
  const min = spot.sportType === "KITE" ? Math.max(22, spot.minWindKmh) : 0;
  const max = Math.min(spot.sportType === "KITE" ? 45 : 15, spot.maxWindKmh);
  return <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="font-semibold text-slate-950"><Link href={`/spots/${spot.id}`} className="hover:text-sky-800 hover:underline">{spot.name}</Link></h3>
    <p className="mt-2 text-sm font-semibold text-sky-900">{date(slot.start)}–{date(slot.end, true)}</p>
    <p className="mt-2 text-sm text-slate-700">{t("wind")} {roundedWindRange(slot.windMin, slot.windMax, divisor)} {unit} · {t("gusts")} {speed(slot.gustMax)} {unit}</p>
    <p className="mt-1 text-sm text-slate-600">{t("direction")} {[...new Set(slot.directions.map(windDirectionLabel))].join(" / ")}</p>
    <details className="mt-4 border-t border-slate-100 pt-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-sky-900">{t("whyWindow")}</summary>
      <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
        <li>{t("windCriterion", { min: speed(min), max: speed(max), unit })}</li>
        <li>{t(spot.sportType === "KITE" ? "kiteGustCriterion" : "paraGustCriterion", { max: speed(spot.sportType === "KITE" ? max : 20), unit })}</li>
        <li>{t("orientationCriterion", { sectors: spot.qualification?.sectors.map((s) => `${s.from}°–${s.to}°`).join(" / ") ?? "" })}</li>
        <li>{t("accessCriterion")}</li>
        {spot.sportType === "PARAGLIDE" && <li>{t("rainCriterion")}</li>}
      </ul>
      {spot.qualification?.note && <p className="mt-3 text-xs leading-5 text-slate-600">{spot.qualification.note}</p>}
      {spot.qualification?.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 block break-words text-xs text-sky-800 underline">{source.title}</a>)}
    </details>
    <p className="mt-3 text-xs leading-5 text-slate-500">{t("forecastSource")}{spot.retrievedAt && <> · {t("retrievedAt", { time: date(Date.parse(spot.retrievedAt)) })}</>} · {spot.timezone}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{t("windowCaution")}</p>
    <Link href={`/spots/${spot.id}`} className="mt-3 inline-flex min-h-11 items-center self-start text-sm font-semibold text-sky-800 underline underline-offset-4">{t("viewSpot")}</Link>
  </article>;
}
