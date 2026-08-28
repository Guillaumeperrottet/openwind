"use client";

import { ArrowUpRight, Radio, RefreshCw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { roundKnots } from "@/lib/forecast";
import { NETWORK_LABELS, type NetworkId } from "@/lib/stationConstants";
import { useStationLive } from "@/lib/useStationLive";
import { windDirectionLabel } from "@/lib/utils";

export interface LiveStationSummary {
  id: string;
  name: string;
  source: NetworkId;
}

const STATION_ROLES: Record<string, string> = {
  "windball-wf-35": "Mesure au bord du lac",
  "piou-2153": "Mesure au Camping du Lac",
  MAS: "Repère régional",
};

function stationRole(stationId: string) {
  return STATION_ROLES[stationId] ?? "Balise associée au guide";
}

function stationNetwork(station: LiveStationSummary) {
  if (station.id === "windball-wf-35") return "Windfox · Windball";
  return NETWORK_LABELS[station.source];
}

function windColor(kmh: number): string {
  if (kmh < 8) return "#94a3b8";
  if (kmh < 15) return "#22c55e";
  if (kmh < 22) return "#14b8a6";
  if (kmh < 30) return "#0284c7";
  if (kmh < 38) return "#f59e0b";
  if (kmh < 50) return "#f97316";
  return "#dc2626";
}

function LiveStationCard({
  station,
}: {
  station: LiveStationSummary;
}) {
  const { data, isLoading } = useStationLive(station.id);

  return (
    <Link
      href={`/stations/${encodeURIComponent(station.id)}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
            {stationRole(station.id)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            {station.name}
          </h3>
          <p className="text-xs text-slate-500">
            {stationNetwork(station)}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-sky-600" />
      </div>

      {isLoading && !data ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Chargement de la mesure…
        </div>
      ) : data ? (
        <div className="mt-6">
          <div className="flex items-end gap-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold tabular-nums"
                  style={{ color: windColor(data.windSpeedKmh) }}
                >
                  {roundKnots(data.windSpeedKmh)}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  kts
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {Math.round(data.windSpeedKmh)} km/h
              </p>
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2 text-slate-800">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <g
                    transform={`rotate(${(data.windDirection + 180) % 360}, 8, 8)`}
                  >
                    <line
                      x1="8"
                      y1="12"
                      x2="8"
                      y2="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <polygon points="8,2.5 5.5,6.5 10.5,6.5" fill="currentColor" />
                  </g>
                </svg>
                <span className="text-lg font-semibold">
                  {windDirectionLabel(data.windDirection)}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(data.windDirection)}°
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Rafales {roundKnots(data.gustsKmh)} kts
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                data.isFresh ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  data.isFresh ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {data.isFresh ? "Mesure récente" : "Mesure ancienne"}
            </span>
            <span className="text-slate-400">
              {new Date(data.updatedAt).toLocaleTimeString("fr-CH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <Radio className="h-4 w-4" />
          Mesure momentanément indisponible
        </div>
      )}
    </Link>
  );
}

export function LiveStations({
  stations,
}: {
  stations: LiveStationSummary[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stations.map((station) => (
        <LiveStationCard key={station.id} station={station} />
      ))}
    </div>
  );
}
