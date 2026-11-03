"use client";

import { useLocale } from "next-intl";
import { useFreshnessClock, windIsFresh } from "@/lib/useFreshWind";
import { NETWORK_LABELS, isNetworkFresh } from "@/lib/stationConstants";
import { toSiteLocale } from "@/lib/site";
import type { WindLive } from "@/types";

const COPY = {
  fr: { details: "À propos de cette estimation", measured: "Vent mesuré", estimated: "Vent estimé", station: "Balise", observedAt: "Mesure du", validAt: "Estimation pour le", stale: "Données anciennes", modelNote: "Estimation de modèle au point du spot, distincte d’une mesure sur place." },
  en: { details: "About this estimate", measured: "Measured wind", estimated: "Estimated wind", station: "Station", observedAt: "Observed on", validAt: "Estimate for", stale: "Outdated data", modelNote: "Model estimate at the spot, separate from an on-site observation." },
  de: { details: "Über diese Schätzung", measured: "Gemessener Wind", estimated: "Geschätzter Wind", station: "Windstation", observedAt: "Messung vom", validAt: "Schätzung für", stale: "Veraltete Daten", modelNote: "Modellschätzung am Spot, keine Messung vor Ort." },
  it: { details: "Informazioni sulla stima", measured: "Vento misurato", estimated: "Vento stimato", station: "Stazione", observedAt: "Misura del", validAt: "Stima per il", stale: "Dati non aggiornati", modelNote: "Stima del modello sullo spot, distinta da una misura sul posto." },
};

export type WindProvenanceData = Pick<WindLive, "source" | "updatedAt" | "network" | "stationId" | "isFresh"> & Partial<Pick<WindLive, "staleAt">>;

/** Keep provenance beside the values, including when the compass is hidden on mobile. */
export function WindProvenance({ live, compact = false, expandable = false }: { live: WindProvenanceData; compact?: boolean; expandable?: boolean }) {
  const locale = toSiteLocale(useLocale());
  const c = COPY[locale];
  const now = useFreshnessClock();
  const isFresh = now === undefined ? live.isFresh : live.staleAt
    ? windIsFresh({ ...live, staleAt: live.staleAt }, now)
    : live.source === "station" && live.stationId ? isNetworkFresh(live.stationId, live.updatedAt, now) : live.isFresh;
  const estimated = live.source === "openmeteo";
  const provider = estimated ? "Open-Meteo" : live.network ? NETWORK_LABELS[live.network] : c.station;
  const date = new Date(live.updatedAt);
  const time = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Zurich", timeZoneName: "short",
  }).format(date) : "—";

  return (
    <div className={`text-xs leading-5 ${isFresh ? "text-slate-600" : "text-amber-800"}`}>
      <p className="font-semibold">{estimated ? c.estimated : c.measured} · {provider}{!estimated && live.stationId ? ` · ${live.stationId}` : ""}</p>
      <p>{estimated ? c.validAt : c.observedAt}{" "}<time dateTime={Number.isFinite(date.getTime()) ? live.updatedAt : undefined}>{time}</time>{!isFresh ? ` · ${c.stale}` : ""}</p>
      {estimated && !compact && (expandable ? <details className="ow-source-explanation"><summary>{c.details}</summary><p>{c.modelNote}</p></details> : <p className="mt-1 text-slate-500">{c.modelNote}</p>)}
    </div>
  );
}
