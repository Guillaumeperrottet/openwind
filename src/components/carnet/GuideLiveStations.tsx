"use client";

import { Link } from "@/i18n/navigation";
import { useStationLive } from "@/lib/useStationLive";
import { GUIDE_COPY, type GuideLocale } from "@/lib/local-guides";
import { NETWORK_LABELS } from "@/lib/stationConstants";
import { roundKnots } from "@/lib/forecast";
import { windDirectionLabel } from "@/lib/utils";
import type { WindLive } from "@/types";

export type GuideObservation = Omit<WindLive, "gustsKmh"> & {
  gustsKmh: number | null;
};

export interface GuideStation {
  id: string;
  name: string;
  source: keyof typeof NETWORK_LABELS;
  initialLive: GuideObservation | null;
  context?: Partial<Record<GuideLocale, string>>;
}

function StationCard({
  station,
  locale,
}: {
  station: GuideStation;
  locale: GuideLocale;
}) {
  const copy = GUIDE_COPY[locale];
  const { data } = useStationLive(station.id);
  // A delayed HTTP response must not replace a newer server observation.
  const live =
    station.initialLive &&
    (!data ||
      Date.parse(station.initialLive.updatedAt) > Date.parse(data.updatedAt))
      ? station.initialLive
      : data;
  return (
    <Link
      href={`/stations/${encodeURIComponent(station.id)}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400"
    >
      <h3 className="text-lg font-semibold text-slate-950">{station.name}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {copy.source} : {NETWORK_LABELS[station.source]}
      </p>
      {station.context?.[locale] && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {station.context[locale]}
        </p>
      )}
      {live && live.source === "station" ? (
        <>
          <p className="mt-5 text-3xl font-bold text-sky-700">
            {roundKnots(live.windSpeedKmh)} <span className="text-sm">kts</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {Math.round(live.windSpeedKmh)} km/h ·{" "}
            {windDirectionLabel(live.windDirection)} · {copy.gusts}{" "}
            {live.gustsKmh == null ? "—" : `${roundKnots(live.gustsKmh)} kts`}
          </p>
          <p className="mt-4 text-xs text-slate-500">
            {live.isFresh ? copy.observation : copy.stale}
            {" · "}
            <time dateTime={live.updatedAt}>
              {new Intl.DateTimeFormat(locale, {
                timeZone: "Europe/Zurich",
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(live.updatedAt))}
            </time>
          </p>
        </>
      ) : (
        <p className="mt-5 text-sm text-slate-500">{copy.unavailable}</p>
      )}
    </Link>
  );
}

export function GuideLiveStations({
  stations,
  locale,
}: {
  stations: GuideStation[];
  locale: GuideLocale;
}) {
  return (
    <div
      className={`grid gap-4 ${stations.length <= 1 ? "md:grid-cols-1" : stations.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
    >
      {stations.map((station) => (
        <StationCard key={station.id} station={station} locale={locale} />
      ))}
    </div>
  );
}
