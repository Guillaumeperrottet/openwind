"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { X, ExternalLink, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { windDirectionLabel, barColors } from "@/lib/utils";
import { WindProvenance } from "@/components/spot/WindProvenance";
import { detectNetwork, isNetworkFresh } from "@/lib/stationConstants";
import { WindHistoryChart } from "@/components/spot/WindHistoryChart";
import type { HistoryPoint } from "@/types";
import useSWR from "swr";
import { fetchClientJson } from "@/lib/fetch-client-json";
import { RequestFeedback } from "@/components/ui/RequestFeedback";
import { useStationLive } from "@/lib/useStationLive";
import { useFavContext } from "@/lib/FavContext";

interface StationInfo {
  id: string;
  name: string;
  description?: string;
  windSpeedKmh: number;
  windDirection: number;
  gustsKmh: number;
  altitudeM: number;
  updatedAt: string;
  colorHex: string;
  dirLabel: string;
  source: string;
  lat: number;
  lng: number;
}

interface StationPopupProps {
  station: StationInfo;
  useKnots: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  /** Called when the popup detects a fresher measurement than the GL feature
   *  was carrying — lets the parent map re-color the arrow to match. */
  onLiveUpdate?: (update: {
    id: string;
    windSpeedKmh: number;
    windDirection: number;
    gustsKmh: number;
    updatedAt: string;
  }) => void;
}

export function StationPopup({
  station,
  useKnots,
  position,
  onClose,
  onLiveUpdate,
}: StationPopupProps) {
  const { data: stationLive, error: liveError, isValidating: livePending, refresh: refreshLive } = useStationLive(station.id);
  const { favoriteStationIds, toggleStationFavorite } = useFavContext();
  const isFavorite = favoriteStationIds.has(station.id);
  const t = useTranslations("StationPage");
  const tCommon = useTranslations("Common");
  const { data: history, isLoading: loading, error: historyError, isValidating: historyPending, mutate: retryHistory } = useSWR<HistoryPoint[]>(
    `/api/stations/${encodeURIComponent(station.id)}/history`,
    async (url: string) => {
      const points = await fetchClientJson<HistoryPoint[]>(url);
      if (!Array.isArray(points)) throw new Error("Invalid history");
      return points;
    },
    { keepPreviousData: false, errorRetryCount: 2 },
  );
  const ref = useRef<HTMLDivElement>(null);
  const [flipBelow, setFlipBelow] = useState(false);
  const [popupH, setPopupH] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mobileViewport.matches);
    updateViewport();
    mobileViewport.addEventListener("change", updateViewport);
    return () => mobileViewport.removeEventListener("change", updateViewport);
  }, []);

  // Measure popup height and flip below if not enough room above
  useEffect(() => {
    if (!ref.current) return;
    const h = ref.current.offsetHeight;
    setPopupH(h);
    setFlipBelow(position.y - 8 - h < 10);
  }, [position.y, history, loading]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    // Delay adding click listener so the opening click doesn't immediately close
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 0);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick);
      clearTimeout(timer);
    };
  }, [onClose]);

  // Live header values: from useStationLive (polls /api/stations/${id}/live).
  // Falls back to GL-feature props while the first SWR fetch is in-flight.
  // This eliminates the VEV bug: header never reads from NWP forecast points.
  const stationLiveTime = stationLive
    ? new Date(stationLive.updatedAt).getTime()
    : NaN;
  const featureTime = new Date(station.updatedAt).getTime();
  const stationLiveIsNewest = Boolean(
    stationLive &&
      !isNaN(stationLiveTime) &&
      (isNaN(featureTime) || stationLiveTime >= featureTime),
  );
  const liveForDisplay =
    stationLive && stationLiveIsNewest ? stationLive : null;
  const liveSpeed = liveForDisplay?.windSpeedKmh ?? station.windSpeedKmh;
  const liveDirection = liveForDisplay?.windDirection ?? station.windDirection;
  const liveGusts = liveForDisplay?.gustsKmh ?? station.gustsKmh;
  const liveUpdatedAt = liveForDisplay?.updatedAt ?? station.updatedAt;

  // Push fresher values back to the map so the GL arrow color matches.
  useEffect(() => {
    if (!onLiveUpdate || !stationLive || !stationLiveIsNewest) return;
    if (
      stationLive.windSpeedKmh === station.windSpeedKmh &&
      stationLive.windDirection === station.windDirection &&
      stationLive.gustsKmh === station.gustsKmh
    ) {
      return;
    }
    onLiveUpdate({
      id: station.id,
      windSpeedKmh: stationLive.windSpeedKmh,
      windDirection: stationLive.windDirection,
      gustsKmh: stationLive.gustsKmh,
      updatedAt: stationLive.updatedAt,
    });
  }, [
    stationLive,
    station.id,
    station.windSpeedKmh,
    station.windDirection,
    station.gustsKmh,
    stationLiveIsNewest,
    onLiveUpdate,
  ]);

  const chartHistory = useMemo<HistoryPoint[] | null>(() => {
    if (!history) return null;
    const pointTime = new Date(liveUpdatedAt).toISOString().slice(0, 16);
    const currentPoint: HistoryPoint = {
      time: pointTime,
      windSpeedKmh: liveSpeed,
      windDirection: liveDirection,
      gustsKmh: liveGusts,
      temperatureC: liveForDisplay?.temperatureC ?? 0,
    };
    const nowIso = new Date().toISOString().slice(0, 16);
    let lastMeasuredIdx = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].time <= nowIso) {
        lastMeasuredIdx = i;
        break;
      }
    }
    if (lastMeasuredIdx === -1) return [currentPoint, ...history];
    const last = history[lastMeasuredIdx];
    if (pointTime <= last.time) return history;
    return [
      ...history.slice(0, lastMeasuredIdx + 1),
      currentPoint,
      ...history.slice(lastMeasuredIdx + 1),
    ];
  }, [
    history,
    liveUpdatedAt,
    liveSpeed,
    liveDirection,
    liveGusts,
    liveForDisplay,
  ]);

  const speedKmh = Math.round(liveSpeed);
  const speedKts = Math.round(speedKmh / 1.852);
  const gustsKmh = Math.round(liveGusts);
  const gustsKts = Math.round(gustsKmh / 1.852);
  // Same palette as the 48h history chart (barColors) for visual consistency
  const color = barColors(speedKmh)[0];
  const dir = liveDirection;
  const arrowRot = (dir + 180) % 360;
  const dirLabel = windDirectionLabel(dir);
  const primary = useKnots ? `${speedKts} kts` : `${speedKmh} km/h`;
  const gusts = useKnots ? `${gustsKts} kts` : `${gustsKmh} km/h`;
  const time = new Date(liveUpdatedAt).toLocaleTimeString("fr", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPioupiou = station.source === "pioupiou";
  const isNetatmo = station.source === "netatmo";
  const isMF = station.source === "meteofrance";
  const isWB = station.source === "windball";
  const isFrEnergy = station.source === "fr-energy";
  const sourceLabel = isPioupiou
    ? "OpenWindMap"
    : isNetatmo
      ? "Netatmo"
      : isMF
        ? "Météo-France"
        : isWB
          ? "Windball"
          : isFrEnergy
            ? "FribourgÉnergie"
            : "MeteoSwiss";
  const sourceFreq = isPioupiou
    ? "~4 min"
    : isMF
      ? "3 h"
      : isFrEnergy
        ? "10 min"
        : "~10 min";

  // Position: compute actual top clamped to viewport
  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const margin = 10;
  // Popup width clamped to 90vw — compute half for centering
  const popupW = Math.min(420, vw * 0.9);
  const halfW = popupW / 2;

  let top: number;
  if (!flipBelow) {
    top = Math.max(margin, position.y - 8 - popupH);
  } else {
    top = Math.min(position.y + 12, vh - popupH - margin);
  }
  top = Math.max(margin, Math.min(top, vh - popupH - margin));

  const maxH = vh - 2 * margin;

  const style: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: "50%",
        bottom: "calc(var(--mobile-nav-height) + 16px)",
        transform: "translateX(-50%)",
        zIndex: 100,
        maxHeight: "calc(100dvh - var(--mobile-nav-height) - 88px)",
      }
    : {
        position: "fixed",
        left: Math.min(
          Math.max(position.x, halfW + margin),
          vw - halfW - margin,
        ),
        top,
        transform: "translate(-50%, 0)",
        zIndex: 100,
        maxHeight: maxH,
      };

  return (
    <div
      ref={ref}
      style={style}
      className="ow-map-popup"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">
            {station.name}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {isPioupiou
              ? station.id.replace("piou-", "Pioupiou #")
              : `${station.id} · ${station.altitudeM} m alt.`}
          </p>
          {station.description && (
            <p className="text-[10px] text-gray-500 mt-0.5 italic line-clamp-2">
              {station.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => toggleStationFavorite(station.id)}
            aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
            aria-pressed={isFavorite}
            title={isFavorite ? t("removeFavorite") : t("addFavorite")}
            className="ow-icon-button"
          >
            <Star
              className={`h-4 w-4 ${
                isFavorite ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("close")}
            className="ow-icon-button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Wind info row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
          <circle
            cx="20"
            cy="20"
            r="19"
            fill={`${color}18`}
            stroke={color}
            strokeWidth="1.5"
          />
          <g transform={`rotate(${arrowRot},20,20)`}>
            <line
              x1="20"
              y1="30"
              x2="20"
              y2="12"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polygon points="20,6 15,15 25,15" fill={color} />
          </g>
        </svg>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--ow-ink)" }}
            >
              {primary}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {dirLabel} · {dir}°
            {station.gustsKmh > 0 ? ` · ${t("gustsLabel")} ${gusts}` : ""}
          </div>
        </div>
      </div>
      <div className="px-4 pb-3"><RequestFeedback error={Boolean(liveError)} pending={livePending} hasData onRetry={refreshLive} /><WindProvenance compact live={{ source: "station", network: detectNetwork(station.id), stationId: station.id, updatedAt: liveUpdatedAt, isFresh: liveForDisplay?.isFresh ?? isNetworkFresh(station.id, liveUpdatedAt) }} /></div>

      {/* 48h History Chart */}
      <div className="border-t border-gray-100">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-gray-700">
            {t("history48h")}
          </span>
          <span className="text-[9px] text-gray-400">
            {t("lastUpdate", { time })}
          </span>
        </div>
        <div className="px-2 pb-2">
          {loading ? (
            <div className="flex items-center justify-center h-24 text-xs text-gray-400 animate-pulse">
              {tCommon("loading")}
            </div>
          ) : historyError && !history ? (
            <RequestFeedback error pending={historyPending} onRetry={() => { void retryHistory().catch(() => {}); }} />
          ) : chartHistory && chartHistory.length > 0 ? (
            <WindHistoryChart
              history={chartHistory}
              useKnots={useKnots}
              timezone="Europe/Zurich"
            />
          ) : (
            <div className="flex items-center justify-center h-24 text-xs text-gray-400">
              {t("historyEmpty")}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <span className="text-[10px] text-gray-400">
          {sourceLabel} · {t("everyN", { freq: sourceFreq })}
        </span>
        {!isNetatmo ? (
          <Link
            href={`/stations/${encodeURIComponent(station.id)}`}
            className="text-xs font-semibold text-sky-500 hover:text-sky-600 inline-flex items-center gap-1 transition-colors"
          >
            {t("allData")} <ExternalLink className="h-3 w-3" />
          </Link>
        ) : isNetatmo ? (
          <a
            href="https://weathermap.netatmo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-400 hover:text-sky-500 inline-flex items-center gap-1 transition-colors"
          >
            weathermap.netatmo.com <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
