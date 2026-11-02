"use client";

import { useLocale } from "next-intl";
import { NETWORK_LABELS } from "@/lib/stationConstants";
import { toSiteLocale } from "@/lib/site";
import type { WindLive } from "@/types";

const COPY = {
  fr: { measured: "Vent mesuré", estimated: "Vent estimé", station: "Balise", observedAt: "Mesure du", validAt: "Estimation pour le", stale: "Données anciennes", modelNote: "Estimation de modèle au point du spot, distincte d’une mesure sur place." },
  en: { measured: "Measured wind", estimated: "Estimated wind", station: "Station", observedAt: "Observed on", validAt: "Estimate for", stale: "Outdated data", modelNote: "Model estimate at the spot, separate from an on-site observation." },
  de: { measured: "Gemessener Wind", estimated: "Geschätzter Wind", station: "Windstation", observedAt: "Messung vom", validAt: "Schätzung für", stale: "Veraltete Daten", modelNote: "Modellschätzung am Spot, keine Messung vor Ort." },
  it: { measured: "Vento misurato", estimated: "Vento stimato", station: "Stazione", observedAt: "Misura del", validAt: "Stima per il", stale: "Dati non aggiornati", modelNote: "Stima del modello sullo spot, distinta da una misura sul posto." },
};

export type WindProvenanceData = Pick<WindLive, "source" | "updatedAt" | "network" | "stationId" | "isFresh">;

/** Keep provenance beside the values, including when the compass is hidden on mobile. */
export function WindProvenance({ live, compact = false }: { live: WindProvenanceData; compact?: boolean }) {
  const locale = toSiteLocale(useLocale());
  const c = COPY[locale];
  const estimated = live.source === "openmeteo";
  const provider = estimated ? "Open-Meteo" : live.network ? NETWORK_LABELS[live.network] : c.station;
  const date = new Date(live.updatedAt);
  const time = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Zurich", timeZoneName: "short",
  }).format(date) : "—";

  return (
    <div className={`text-xs leading-5 ${live.isFresh ? "text-slate-600" : "text-amber-800"}`}>
      <p className="font-semibold">{estimated ? c.estimated : c.measured} · {provider}{!estimated && live.stationId ? ` · ${live.stationId}` : ""}</p>
      <p>{estimated ? c.validAt : c.observedAt}{" "}<time dateTime={Number.isFinite(date.getTime()) ? live.updatedAt : undefined}>{time}</time>{!live.isFresh ? ` · ${c.stale}` : ""}</p>
      {estimated && !compact && <p className="mt-1 text-slate-500">{c.modelNote}</p>}
    </div>
  );
}
