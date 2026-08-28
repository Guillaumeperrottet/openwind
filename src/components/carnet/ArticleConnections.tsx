"use client";

import { ArrowRight, Compass, Gauge, MapPin, Radio, Wind } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ResolvedArticleConnections } from "@/lib/article-connections";
import { trackEvent } from "@/lib/analytics";
import { NETWORK_LABELS } from "@/lib/stationConstants";
import { windDirectionLabel } from "@/lib/utils";

type Connections = Pick<ResolvedArticleConnections, "spots" | "stations">;

const difficultyLabels = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
  EXPERT: "Expert",
} as const;

export function ArticleConnections({ spots, stations }: Connections) {
  if (spots.length === 0 && stations.length === 0) return null;

  return (
    <section aria-labelledby="article-connections-heading">
      <div className="border-b border-slate-900 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
          Passer de la lecture au terrain
        </p>
        <h2
          id="article-connections-heading"
          className="mt-1 font-serif text-3xl font-semibold sm:text-4xl"
        >
          Spots et vent en direct
        </h2>
      </div>

      {stations.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            <Radio className="h-4 w-4 text-sky-600" />
            Balises associées
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {stations.map((station) => (
              <Link
                key={station.id}
                href={`/stations/${encodeURIComponent(station.id)}`}
                onClick={() =>
                  trackEvent("related_content_click", {
                    content_type: "station",
                    content_id: station.id,
                    placement: "article_connections",
                  })
                }
                className="group flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                    {NETWORK_LABELS[station.source]}
                  </p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-slate-950">
                    {station.name}
                  </h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{Math.round(station.windSpeedKmh / 1.852)} kts</span>
                    <span>{windDirectionLabel(station.windDirection)}</span>
                    <span>{Math.round(station.altitudeM)} m</span>
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                  <Wind className="h-5 w-5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {spots.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            <MapPin className="h-4 w-4 text-sky-600" />
            Spots associés
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {spots.map((spot) => (
              <Link
                key={spot.id}
                href={`/spots/${spot.id}`}
                onClick={() =>
                  trackEvent("related_content_click", {
                    content_type: "spot",
                    content_id: spot.id,
                    placement: "article_connections",
                  })
                }
                className="group rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">
                      {spot.sportType === "KITE" ? "Kitesurf" : "Parapente"}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{spot.name}</h3>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 text-sky-300 transition group-hover:translate-x-1" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
                  {(spot.region || spot.country) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {spot.region || spot.country}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
                    <Gauge className="h-3.5 w-3.5" />
                    {difficultyLabels[spot.difficulty]}
                  </span>
                  {spot.bestWindDirections.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
                      <Compass className="h-3.5 w-3.5" />
                      {spot.bestWindDirections.slice(0, 4).join(" · ")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
