"use client";

import { ACCESS_COPY } from "@/lib/access";
import { waterTemperatureView, type LakeTemperature } from "@/lib/lake-temperature";
import { useFreshnessClock } from "@/lib/useFreshWind";
import { WATER_COPY } from "@/lib/water-temperature-copy";
import type { SiteLocale } from "@/lib/site";

export function TemperatureDirectoryReading({ series, initialNow, locale }: { series: LakeTemperature | null; initialNow: number; locale: SiteLocale }) {
  const now = useFreshnessClock() ?? initialNow;
  const view = waterTemperatureView(series, now), c = ACCESS_COPY[locale];
  if (!view.current) return <p className="ow-access-note" role="status">{c.waterUnavailable}</p>;
  return <><p className="ow-temperature-reading">{new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(view.current.temperatureC)}<small> °C</small></p>
    <p className="ow-access-note">{c.valid} <time dateTime={view.current.time}>{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich", timeZoneName: "short" }).format(new Date(view.current.time))}</time>{view.stale && <strong className="ow-lake-stale">{WATER_COPY[locale].stale}</strong>}</p></>;
}
