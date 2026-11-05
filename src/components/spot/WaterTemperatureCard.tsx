"use client";

import { ExternalLink, Thermometer } from "lucide-react";
import { ALPLAKES_GRUYERE, waterTemperatureView, type LakeTemperature } from "@/lib/lake-temperature";
import { useFreshnessClock } from "@/lib/useFreshWind";
import { WATER_COPY } from "@/lib/water-temperature-copy";
import type { SiteLocale } from "@/lib/site";

export function WaterTemperatureCard({ series, initialNow, locale, lakeHref }: { series: LakeTemperature | null; initialNow: number; locale: SiteLocale; lakeHref?: string }) {
  const now = useFreshnessClock() ?? initialNow;
  const c = WATER_COPY[locale];
  const view = waterTemperatureView(series, now);
  const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const date = (time: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich", timeZoneName: "short" }).format(new Date(time));
  const hour = (time: string) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }).format(new Date(time));

  return <section id="water-temperature" className="ow-water-card scroll-mt-20" aria-labelledby="water-temperature-title">
    <div className="ow-water-preview">
      <div className="ow-water-reading">
        <Thermometer aria-hidden className="h-5 w-5" />
        <div>
          <h2 id="water-temperature-title">{c.title}</h2>
          <p>{c.subtitle}</p>
        </div>
        <p className="ow-water-value"><span>{view.current ? number.format(view.current.temperatureC) : "—"}</span>{view.current && " °C"}</p>
      </div>
      <div className="ow-water-attribution">
        {view.current ? <p className={view.stale ? "!text-amber-800" : undefined}>{c.validAt}{" "}<time dateTime={view.current.time}>{date(view.current.time)}</time>{view.stale && <span className="block font-medium">{c.stale}</span>}</p> : <p role="status">{c.unavailable}</p>}
        <a href={ALPLAKES_GRUYERE.page} target="_blank" rel="noopener noreferrer">Alplakes / Eawag <ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>
        {lakeHref && <a href={lakeHref}>{({ fr: "Voir la page du lac", en: "View the lake page", de: "Seeseite ansehen", it: "Vedi la pagina del lago" })[locale]}</a>}
      </div>
    </div>
    <details className="ow-water-details">
      <summary>{c.details}</summary>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{c.explanation}</p>
      {view.current && !view.stale && view.days.length > 0 && <div className="mt-4 max-w-xl">
        <h3 className="text-sm font-semibold text-slate-900">{c.forecast}</h3>
        <table className="mt-2 w-full text-left text-sm">
          <caption className="caption-bottom pt-2 text-left text-xs leading-5 text-slate-600">{c.forecastNote}</caption>
          <thead><tr className="border-b border-slate-200 text-xs text-slate-600"><th scope="col" className="py-2 font-medium">{c.day}</th><th scope="col" className="py-2 text-right font-medium">{c.range}</th></tr></thead>
          <tbody>{view.days.map((day) => <tr key={day.date} className="border-b border-slate-100">
            <th scope="row" className="py-2 font-normal"><time dateTime={day.first}>{new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Zurich" }).format(new Date(day.first))}</time><span className="ml-2 text-xs text-slate-600">{hour(day.first)}–{hour(day.last)}</span></th>
            <td className="py-2 text-right tabular-nums">{number.format(day.min)}–{number.format(day.max)} °C</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <p className="mt-3 text-xs leading-5 text-slate-600">{c.rounded}{" "}Data: Alplakes, Eawag · <a href={ALPLAKES_GRUYERE.licence} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">CC BY 4.0</a></p>
    </details>
  </section>;
}
