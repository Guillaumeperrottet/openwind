"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink, Loader2 } from "lucide-react";
import { windDirectionLabel } from "@/lib/utils";
import { windPaletteColor } from "@/lib/windPalette";
import { roundKnots } from "@/lib/forecast";
import type { StationWithDist } from "@/components/spot/useNearbyStations";

const SOURCE_LABELS: Record<string, string> = {
  meteoswiss: "MeteoSwiss",
  pioupiou: "Pioupiou",
  netatmo: "Netatmo",
  meteofrance: "Météo-France",
  windball: "Windball",
  "fr-energy": "FribourgÉnergie",
};

/** Marker color for station wind speed (same palette as map) */
function stationColor(kmh: number): string {
  return windPaletteColor(kmh, "accent");
}

interface Props {
  stations: StationWithDist[];
  loading: boolean;
  error?: boolean;
  useKnots: boolean;
  /** Currently selected station ID (highlighted) */
  selectedId?: string | null;
  /** Called when user clicks a station card */
  onSelect?: (station: StationWithDist) => void;
}

export function NearbyStationsPanel({
  stations,
  loading,
  error = false,
  useKnots,
  selectedId,
  onSelect,
}: Props) {
  const app = useTranslations("AppDesign");
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 ow-caption gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {app("stationsLoading")}
      </div>
    );
  }

  if (stations.length === 0) return <p role="status" className="ow-caption py-4">{app(error ? "stationsUnavailable" : "noNearbyStations")}</p>;

  return (
    <div className="ow-station-list">
      {stations.map((s) => {
        const kts = roundKnots(s.windSpeedKmh);
        const dir = windDirectionLabel(s.windDirection);
        const isSelected = selectedId === s.id;
        const cls = `group text-left bg-white rounded-xl border shadow-sm p-3.5 hover:border-gray-300 hover:shadow transition-colors ${
          isSelected ? "border-sky-400 ring-2 ring-sky-100" : "border-gray-200"
        }`;

        const content = (
          <>
            {/* Header: name + distance */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stationColor(s.windSpeedKmh) }}
                />
                <span className="text-sm font-medium text-gray-800 truncate">
                  {s.name}
                </span>
              </div>
              <span className="text-[10px] ow-muted shrink-0">
                {s.dist < 1
                  ? `${Math.round(s.dist * 1000)}m`
                  : `${s.dist.toFixed(1)}km`}
              </span>
            </div>

            {/* Wind data row */}
            <div className="flex items-center gap-3">
              {/* Speed */}
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-2xl font-bold tabular-nums leading-none"
                    style={{ color: "var(--ow-ink)" }}
                  >
                    {useKnots ? kts : Math.round(s.windSpeedKmh)}
                  </span>
                  <span className="text-[10px] ow-muted font-medium">
                    {useKnots ? "kts" : "km/h"}
                  </span>
                </div>
                <div className="text-[9px] ow-muted mt-0.5">
                  /{" "}
                  {useKnots
                    ? `${Math.round(s.windSpeedKmh)} km/h`
                    : `${kts} kts`}
                </div>
              </div>

              {/* Direction */}
              <div className="flex items-center gap-1">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <g
                    transform={`rotate(${(s.windDirection + 180) % 360}, 8, 8)`}
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
                <span className="text-sm font-semibold text-gray-700">
                  {dir}
                </span>
                <span className="text-[10px] ow-muted">
                  {s.windDirection}°
                </span>
              </div>
            </div>

            {/* Footer: source + time */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-50 ow-muted">
                {SOURCE_LABELS[s.source] ?? s.source}
              </span>
              <div className="flex items-center gap-1">
                {s.updatedAt && (
                  <span className="text-[9px] ow-muted">
                    {new Date(s.updatedAt).toLocaleTimeString("fr", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                <ExternalLink className="h-2.5 w-2.5 text-gray-300 group-hover:text-sky-500 transition-colors" />
              </div>
            </div>
          </>
        );

        return onSelect ? (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            aria-pressed={isSelected}
            className={cls}
          >
            {content}
          </button>
        ) : (
          <Link key={s.id} href={`/stations/${s.id}`} className={cls}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
