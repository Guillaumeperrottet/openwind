"use client";

import { ALPLAKES_GRUYERE, MORLON_SPOT_ID, waterTemperatureView, type LakeTemperature } from "@/lib/lake-temperature";
import { lakeDisplayRange, lakeExplorerChart } from "@/lib/lake-explorer";
import { LAKE_PAGE_COPY } from "@/lib/lake-page-copy";
import { ContextDestination } from "@/components/navigation/ContextDestination";
import { ACCESS_COPY } from "@/lib/access";
import { WATER_COPY } from "@/lib/water-temperature-copy";
import { useFreshnessClock } from "@/lib/useFreshWind";
import type { SiteLocale } from "@/lib/site";
import { Link } from "@/i18n/navigation";

export function LakeTemperatureExplorer({ series, initialNow, locale }: { series: LakeTemperature | null; initialNow: number; locale: SiteLocale }) {
  const now = useFreshnessClock() ?? initialNow;
  const c = LAKE_PAGE_COPY[locale], water = WATER_COPY[locale];
  const view = waterTemperatureView(series, now);
  const chart = lakeExplorerChart(series, now);
  const number = (value: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  const range = (min: number, max: number) => lakeDisplayRange(number(min), number(max));
  const date = (time: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich", timeZoneName: "short" }).format(new Date(time));
  const hour = (time: string) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }).format(new Date(time));
  const hours = (first: string, last: string) => lakeDisplayRange(hour(first), hour(last));
  const day = (time: string) => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Zurich" }).format(new Date(time));

  return <>
    <section className="ow-lake-overview" aria-labelledby="lake-reading">
      <div className="ow-lake-current">
        <h2 id="lake-reading">{c.reading}</h2>
        <p className="ow-lake-temperature">{view.current ? <>{number(view.current.temperatureC)}<span> °C</span></> : "—"}</p>
        <p>{c.depth}</p>
        {view.current ? <p className="ow-lake-caption">{water.validAt} <time dateTime={view.current.time}>{date(view.current.time)}</time>{view.stale && <strong className="ow-lake-stale">{water.stale}</strong>}</p> : <p role="status" className="ow-lake-unavailable">{c.empty}</p>}
      </div>
      <div className="ow-lake-days">
        <h2>{c.next}</h2>
        {view.current && !view.stale && view.days.length > 0 ? <>
          <ul>{view.days.map((d) => <li key={d.date}>
            <div><time dateTime={d.first}>{day(d.first)}</time><span>{hours(d.first, d.last)}</span></div>
            <strong>{range(d.min, d.max)}<span> °C</span></strong>
          </li>)}</ul>
          <p className="ow-lake-caption">{c.sampleRange}</p>
        </> : <p className="ow-lake-caption">{view.stale ? c.staleForecast : water.unavailable}</p>}
      </div>
    </section>

    <section className="ow-lake-evolution" aria-labelledby="lake-evolution">
      <div className="ow-lake-section-head"><h2 id="lake-evolution">{c.evolution}</h2><p>{c.depth}</p></div>
      {chart ? <>
        <div className="ow-lake-legend"><span><i aria-hidden />{c.past}</span><span><i aria-hidden />{c.future}</span></div>
        <figure className="ow-lake-figure" aria-labelledby="lake-evolution" aria-describedby="lake-scale">
          <div className="ow-lake-chart-grid">
            <div className="ow-lake-y-axis" aria-hidden>{chart.ticks.map((v) => <span key={v}>{number(v)}°</span>)}</div>
            <div className="ow-lake-plot">
              {chart.nowX !== null && <span className="ow-lake-now-label" style={{ left: `${chart.nowX / 6}%` }}>{c.now}</span>}
              <svg className="ow-lake-chart" viewBox="0 0 600 220" preserveAspectRatio="none" role="img" aria-label={`${c.evolution}. ${c.scale} : ${range(chart.low, chart.high)} °C. ${c.hourly}.`}>
              {[0, 110, 220].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className="ow-lake-gridline" vectorEffect="non-scaling-stroke" />)}
              {chart.segments.map((s, i) => <path key={i} d={s.path} className={s.future ? "ow-lake-line-future" : "ow-lake-line-past"} vectorEffect="non-scaling-stroke" />)}
              {chart.nowX !== null && <line x1={chart.nowX} x2={chart.nowX} y1="0" y2="220" className="ow-lake-now-line" vectorEffect="non-scaling-stroke" />}
              </svg>
            </div>
            <div className="ow-lake-x-axis" aria-hidden>{chart.times.map((t) => <span key={t}>{day(t)}<small>{hour(t)}</small></span>)}</div>
          </div>
          <figcaption id="lake-scale">{c.scale} : {range(chart.low, chart.high)} °C. {c.timezone}</figcaption>
        </figure>
        <details className="ow-lake-hourly">
          <summary>{c.hourly}</summary>
          <table><caption>{c.timezone}</caption><thead><tr><th scope="col">{c.time}</th><th scope="col">{c.temperature}</th></tr></thead>
            <tbody>{chart.points.map((p) => <tr key={p.time}><th scope="row"><time dateTime={p.time}>{date(p.time)}</time><span>{Date.parse(p.time) > now ? c.future : c.past}</span></th><td>{number(p.temperatureC)} °C</td></tr>)}</tbody>
          </table>
        </details>
      </> : <p role="status" className="ow-lake-unavailable">{c.noCurve} <a href={`/${locale}/lacs/gruyere`}>{c.retry}</a></p>}
    </section>

    <section className="ow-lake-links" aria-labelledby="lake-outing"><h2 id="lake-outing">{c.around}</h2><div>
      <Link href={`/spots/${MORLON_SPOT_ID}`} className="ow-primary">{c.morlon}</Link>
      <ContextDestination feature="webcams" href={`/${locale}/webcams?${new URLSearchParams({ lat: "46.63", lng: "7.08", name: c.title, back: `/${locale}/lacs/gruyere` })}`} className="ow-lake-link">{ACCESS_COPY[locale].webcams}</ContextDestination>
      <Link href="/vent-en-direct/lac-de-la-gruyere" locale={locale === "en" ? "fr" : locale} className="ow-lake-link">{c.wind}</Link>
    </div></section>

    <details className="ow-lake-method"><summary>{c.meaning}</summary>
      <p>{c.explanation}</p><p>{c.sourceNote}</p>
      <div className="ow-lake-source-links"><a href={ALPLAKES_GRUYERE.page} target="_blank" rel="noopener noreferrer">Alplakes / Eawag</a><a href={ALPLAKES_GRUYERE.licence} target="_blank" rel="noopener noreferrer">CC BY 4.0</a></div>
    </details>
    <p className="ow-lake-attribution">Data: Alplakes, Eawag (CC BY 4.0). <a href={ALPLAKES_GRUYERE.page} target="_blank" rel="noopener noreferrer">{c.sources}</a></p>
  </>;
}

export function LakeTemperatureLoading({ locale }: { locale: SiteLocale }) {
  return <div className="ow-lake-loading" role="status"><span className="ow-lake-loading-value" aria-hidden /><p>{LAKE_PAGE_COPY[locale].loading}</p></div>;
}
