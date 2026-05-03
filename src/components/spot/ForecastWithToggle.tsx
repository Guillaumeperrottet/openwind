"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { FullForecast, HourlyPoint } from "@/lib/forecast";
import { ForecastTable } from "./ForecastTable";

const STORAGE_KEY = "openwind-forecast-source";

type Source = "openmeteo" | "meteoswiss";

interface Props {
  /** The default Open-Meteo forecast (already loaded server-side) */
  forecast: FullForecast;
  /** Spot id — used to call /api/spots/[id]/forecast-mch */
  spotId: string;
  /** Spot coordinates */
  lat: number;
  lng: number;
  /** Whether the spot is in Switzerland (only then offer the toggle) */
  enableMeteoSwiss?: boolean;
}

/**
 * Client wrapper around `<ForecastTable>` that lets the user toggle between
 * Open-Meteo (default, worldwide) and MeteoSwiss E4 (Switzerland only).
 *
 * Toggle state is persisted in localStorage. When MeteoSwiss is selected,
 * lazy-fetches `/api/spots/[id]/forecast-mch` and shows a loading spinner.
 * On error, falls back transparently to the Open-Meteo forecast.
 */
export function ForecastWithToggle({
  forecast,
  spotId,
  lat,
  lng,
  enableMeteoSwiss = true,
}: Props) {
  const [source, setSource] = useState<Source>("openmeteo");
  const [mchForecast, setMchForecast] = useState<FullForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore preference from localStorage on mount
  useEffect(() => {
    if (!enableMeteoSwiss) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "meteoswiss" || saved === "openmeteo") {
        setSource(saved);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [enableMeteoSwiss]);

  // Lazy-fetch MCH forecast when toggled on
  useEffect(() => {
    if (source !== "meteoswiss" || mchForecast || loading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/spots/${spotId}/forecast-mch?lat=${lat}&lng=${lng}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: FullForecast) => {
        if (!cancelled) setMchForecast(data);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          // Fall back to Open-Meteo silently
          setSource("openmeteo");
          try {
            localStorage.setItem(STORAGE_KEY, "openmeteo");
          } catch {
            /* ignore */
          }
        }
      })
      .finally(() => {
        // Always reset loading, even if the effect was cancelled
        // (otherwise the button stays disabled forever when the user
        // toggles back to Open-Meteo while a fetch is in flight).
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // We intentionally exclude `loading` from deps: it's a guard read at
    // effect start, not a trigger. Including it would re-run the effect
    // when we set it to true above, causing a redundant fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, spotId, lat, lng, mchForecast]);

  function handleToggle(next: Source) {
    setSource(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  // Merge MCH wind data with Open-Meteo backbone (temp, precip, cloud) by
  // matching timestamps. MCH only provides wind/gust/direction (its grid
  // for temp/precip uses different point IDs incompatible with our station
  // lookup), so we keep Open-Meteo's other fields for a complete table.
  const activeForecast = useMemo<FullForecast>(() => {
    if (source !== "meteoswiss" || !mchForecast) return forecast;
    const mchByTime = new Map<string, HourlyPoint>();
    for (const p of mchForecast.hourly) mchByTime.set(p.time, p);

    const merged: HourlyPoint[] = forecast.hourly.map((om) => {
      const mch = mchByTime.get(om.time);
      if (!mch) return om;
      return {
        ...om,
        windSpeedKmh: mch.windSpeedKmh,
        windSpeedKnots: mch.windSpeedKnots,
        gustsKmh: mch.gustsKmh,
        gustsKnots: mch.gustsKnots,
        windDirection: mch.windDirection,
        isKitable: mch.isKitable,
        kitableScore: mch.kitableScore,
      };
    });

    return { ...forecast, hourly: merged };
  }, [source, mchForecast, forecast]);

  return (
    <div>
      {/* Toggle bar */}
      {enableMeteoSwiss && (
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => handleToggle("openmeteo")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                source === "openmeteo"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-pressed={source === "openmeteo"}
            >
              Open-Meteo
            </button>
            <button
              type="button"
              onClick={() => handleToggle("meteoswiss")}
              className={`px-2.5 py-1 rounded-md font-medium transition inline-flex items-center gap-1 ${
                source === "meteoswiss"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-pressed={source === "meteoswiss"}
              disabled={loading}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              MeteoSwiss
            </button>
          </div>
          {error && (
            <span className="text-[10px] text-red-600">
              MeteoSwiss indisponible — Open-Meteo affiché
            </span>
          )}
          <span className="text-[10px] text-gray-400">
            {source === "meteoswiss"
              ? loading
                ? "Téléchargement du modèle ICON-CH2-EPS… (cache 1h)"
                : "Modèle ICON-CH2-EPS · ~6000 points · maillé Suisse"
              : "Modèle global · couverture mondiale"}
          </span>
        </div>
      )}

      {/* The actual forecast table */}
      <ForecastTable
        forecast={activeForecast}
        light
        source={
          source === "meteoswiss" && mchForecast
            ? { label: "MeteoSwiss ICON-CH2-EPS (vent) + Open-Meteo (météo)" }
            : { label: "Open-Meteo" }
        }
      />
    </div>
  );
}
