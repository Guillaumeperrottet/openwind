"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KiteMap } from "@/components/map/KiteMap";
import { Button } from "@/components/ui/Button";
import { windColor, windConditionLabel } from "@/lib/utils";
import type { SpotWithForecast, SportType } from "@/types";
import Link from "next/link";
import {
  MapPin,
  Wind,
  Clock,
  Navigation,
  Locate,
  AlertTriangle,
} from "lucide-react";

// Score 0–100 → display color
function scoreColor(score: number): string {
  if (score >= 70) return "#2e7d32";
  if (score >= 45) return "#f59e0b";
  if (score >= 20) return "#9ca3af";
  return "#d1d5db";
}

type SortKey = "score" | "distance" | "wind";

export function TripPlanner() {
  const router = useRouter();

  const toISO = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(toISO(1));
  const [endDate, setEndDate] = useState(toISO(7));
  const [radius, setRadius] = useState(150);
  const [sport, setSport] = useState<SportType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [results, setResults] = useState<SpotWithForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const reverseGeocode = useCallback(async (la: number, lo: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json`,
        { headers: { "Accept-Language": "fr" } },
      );
      const data = await res.json();
      setLocationName(
        data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          null,
      );
    } catch {
      setLocationName(null);
    }
  }, []);

  const handlePickLocation = useCallback(
    (latitude: number, longitude: number) => {
      setLat(latitude);
      setLng(longitude);
      reverseGeocode(latitude, longitude);
    },
    [reverseGeocode],
  );

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 },
    );
  };

  const handleSearch = async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setSearched(true);
    setError(null);

    // Encode in URL for shareability
    const params = new URLSearchParams({
      lat: lat.toFixed(5),
      lng: lng.toFixed(5),
      startDate,
      endDate,
      radius: radius.toString(),
      ...(sport !== "ALL" ? { sport } : {}),
    });
    router.replace(`/plan?${params}`, { scroll: false });

    try {
      const res = await fetch(`/api/plan?${params}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: SpotWithForecast[] = await res.json();
      setResults(data);
    } catch {
      setError("Impossible de récupérer les prévisions. Réessayez.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isMultiDay = startDate !== endDate;

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return (b.bestScore ?? 0) - (a.bestScore ?? 0);
    if (sortBy === "wind") {
      const aPeak = a.days?.[a.bestDayIndex ?? 0]?.peakWindKmh ?? 0;
      const bPeak = b.days?.[b.bestDayIndex ?? 0]?.peakWindKmh ?? 0;
      return bPeak - aPeak;
    }
    return a.distanceKm - b.distanceKm;
  });

  const ctrlInput =
    "rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-sky-500";

  return (
    <div className="flex flex-col h-full">
      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex flex-wrap items-end gap-2.5">
          {/* Destination */}
          <div className="flex items-end gap-1.5 min-w-0 flex-1">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-500 mb-1 block">
                Destination
              </label>
              <div
                className={`${ctrlInput} flex items-center gap-2 h-9.5 cursor-default`}
              >
                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-700 text-sm">
                  {lat && lng
                    ? locationName || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`
                    : null}
                  {!lat && (
                    <span className="text-gray-400">Cliquez sur la carte…</span>
                  )}
                </span>
              </div>
            </div>
            {/* Geolocate */}
            <button
              onClick={handleGeolocate}
              disabled={geoLoading}
              title="Utiliser ma position"
              className="h-9.5 w-9.5 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-40"
            >
              <Locate className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Date range */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Du</label>
            <input
              type="date"
              value={startDate}
              min={toISO(0)}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (e.target.value > endDate) setEndDate(e.target.value);
              }}
              className={ctrlInput}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Au</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={ctrlInput}
            />
          </div>

          {/* Radius */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rayon</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={ctrlInput}
            >
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={150}>150 km</option>
              <option value={300}>300 km</option>
              <option value={500}>500 km</option>
            </select>
          </div>

          {/* Sport toggle */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Sport</label>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {(
                [
                  ["ALL", "Tous"],
                  ["KITE", "Kite"],
                  ["PARAGLIDE", "Para"],
                ] as const
              ).map(([key, label], i) => (
                <button
                  key={key}
                  onClick={() => setSport(key)}
                  className={`px-3 py-2 font-medium transition-colors ${
                    sport === key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  } ${i > 0 ? "border-l border-gray-200" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!lat || !lng || loading}
            className="h-9.5 self-end"
          >
            {loading ? "Recherche…" : "Trouver"}
          </Button>
        </div>
      </div>

      {/* ── Map + Results ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Map — result spots are rendered as GeoJSON markers */}
        <div className="lg:flex-1 h-64 lg:h-full border-b lg:border-b-0 lg:border-r border-gray-200">
          <KiteMap
            spots={results}
            pickMode={true}
            onPickLocation={handlePickLocation}
          />
        </div>

        {/* Results panel */}
        <div className="w-full lg:w-105 flex flex-col min-h-0">
          {/* Sort bar */}
          {results.length > 1 && (
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-gray-100 text-xs">
              <span className="text-gray-400">Trier :</span>
              {(
                [
                  ["score", "Score"],
                  ["distance", "Distance"],
                  ["wind", "Vent"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-2 py-0.5 rounded-full transition-colors ${
                    sortBy === key
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Empty state */}
            {!searched && !loading && (
              <div className="text-center text-gray-400 text-sm py-12">
                <Navigation className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-gray-500">
                  Choisissez une destination
                </p>
                <p className="text-xs mt-1.5 opacity-70">
                  Cliquez sur la carte ou{" "}
                  <button
                    onClick={handleGeolocate}
                    className="underline underline-offset-2"
                  >
                    utilisez votre position
                  </button>
                  , puis lancez la recherche.
                </p>
              </div>
            )}

            {/* Skeleton loader */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gray-50 border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="flex justify-between mb-3">
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-gray-200 rounded w-28" />
                        <div className="h-2.5 bg-gray-200 rounded w-20" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4 border border-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* No results */}
            {!loading && searched && results.length === 0 && !error && (
              <div className="text-center text-gray-400 text-sm py-12">
                <Wind className="h-7 w-7 mx-auto mb-3 opacity-30" />
                Aucun spot dans un rayon de {radius} km.
                <br />
                <span className="text-xs opacity-60">
                  Élargissez le rayon ou changez de destination.
                </span>
              </div>
            )}

            {/* Results */}
            {!loading &&
              sorted.map((spot) => {
                const bestDay = spot.days?.[spot.bestDayIndex ?? 0];
                if (!bestDay) return null;
                const sc = spot.bestScore ?? 0;
                const color = windColor(bestDay.peakWindKmh);

                return (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.id}`}
                    className="block rounded-xl bg-white border border-gray-200 p-4 hover:border-sky-400/60 hover:shadow-sm transition-all"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {spot.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[spot.region, spot.country]
                            .filter(Boolean)
                            .join(", ")}
                          {" · "}
                          {Math.round(spot.distanceKm)} km
                          {" · "}
                          {spot.sportType === "KITE" ? "🪁 Kite" : "🪂 Para"}
                        </p>
                      </div>
                      {/* Score badge */}
                      <div
                        className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white"
                        style={{ background: scoreColor(sc) }}
                      >
                        <span className="text-lg font-bold leading-none">
                          {sc}
                        </span>
                        <span className="text-[9px] opacity-80">/100</span>
                      </div>
                    </div>

                    {/* Wind summary */}
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 mb-2">
                      <div
                        className="text-2xl font-bold tabular-nums leading-none"
                        style={{ color }}
                      >
                        {Math.round(bestDay.peakWindKmh)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Pic km/h
                        </div>
                        <div
                          className="text-xs font-medium mt-0.5"
                          style={{ color }}
                        >
                          {windConditionLabel(bestDay.peakWindKmh) || "—"}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                          <Clock className="h-3 w-3" />
                          {bestDay.kitableHours}h rideable
                        </div>
                        {bestDay.bestHour && (
                          <div className="text-[10px] text-gray-400">
                            Pic à {new Date(bestDay.bestHour.time).getHours()}
                            h00
                          </div>
                        )}
                        {bestDay.gustFactor > 1.35 && (
                          <div className="flex items-center gap-0.5 text-[10px] text-orange-500 justify-end">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Rafales ×{bestDay.gustFactor.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini forecast bar (best day, 6h–21h) */}
                    {bestDay.forecast.length > 0 && (
                      <>
                        <div className="flex gap-px h-4 rounded overflow-hidden">
                          {bestDay.forecast.slice(6, 22).map((h, i) => (
                            <div
                              key={i}
                              className="flex-1"
                              style={{ background: windColor(h.windSpeedKmh) }}
                              title={`${new Date(h.time).getHours()}h : ${Math.round(h.windSpeedKmh)} km/h`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
                          <span>6h</span>
                          <span>21h</span>
                        </div>
                      </>
                    )}

                    {/* Multi-day calendar strip */}
                    {isMultiDay && spot.days && spot.days.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1">
                        {spot.days.map((day, i) => {
                          const isBest = i === (spot.bestDayIndex ?? 0);
                          const dayDate = new Date(day.date + "T12:00:00Z");
                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <span className="text-[9px] text-gray-400 uppercase">
                                {dayDate.toLocaleDateString("fr", {
                                  weekday: "short",
                                })}
                              </span>
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                style={{
                                  background: scoreColor(day.score),
                                  outline: isBest
                                    ? `2px solid ${scoreColor(day.score)}`
                                    : "none",
                                  outlineOffset: "2px",
                                }}
                                title={`${day.date} — ${day.score}/100 · ${day.kitableHours}h`}
                              >
                                {day.score > 0 ? day.score : "·"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
