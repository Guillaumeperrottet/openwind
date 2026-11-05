"use client";

import { normalizeSpotMonths } from "@/lib/spot-months";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  MapPin,
  Wind,
  TrendingUp,
  Waves,
  Calendar,
  AlertTriangle,
  Car,
  ExternalLink,
  Sailboat,
  Mountain,
  Pencil,
  Images,
  Star,
  Radio,
  Camera,
  ChevronDown,
  CloudRain,
  Snowflake,
} from "lucide-react";
import { isSnowkiteSpot, spotActivityLabel } from "@/lib/spot-activity";
import dynamic from "next/dynamic";
import { WindCompass } from "@/components/spot/WindCompass";
import { WindDirectionRose } from "@/components/spot/WindDirectionRose";
import { WindChart } from "@/components/spot/WindChart";
import { WindHistoryChart } from "@/components/spot/WindHistoryChart";
import { NearbyStationsPanel } from "@/components/spot/NearbyStationsPanel";
import { useNearbyStations } from "@/components/spot/useNearbyStations";
import { SpotLightbox } from "@/components/spot/SpotLightbox";
import { WindProvenance } from "@/components/spot/WindProvenance";
import { LocalGuideLinks } from "@/components/carnet/LocalGuideLinks";

// Lazy-load heavy below-fold components — keeps initial bundle small
const ForecastWithToggle = dynamic(
  () =>
    import("@/components/spot/ForecastWithToggle").then(
      (m) => m.ForecastWithToggle,
    ),
  { ssr: false },
);

/** Rough Switzerland bounding box — covers all of CH + a small buffer. */
function isInSwitzerland(lat: number, lng: number): boolean {
  return lat >= 45.7 && lat <= 47.9 && lng >= 5.8 && lng <= 10.6;
}
const WindArchives = dynamic(
  () => import("@/components/spot/WindArchives").then((m) => m.WindArchives),
  { ssr: false },
);
const SpotMiniMap = dynamic(() => import("./SpotMiniMap"), { ssr: false });
import {
  windDirectionLabel,
  MONTHS,
  getWindData,
  relativeTime,
} from "@/lib/utils";
import { useFreshWind } from "@/lib/useFreshWind";
import { fetchClientJson } from "@/lib/fetch-client-json";
import { RequestFeedback } from "@/components/ui/RequestFeedback";
import { useSpotLive } from "@/lib/useSpotLive";
import { NETWORK_LABELS as STATION_NETWORK_LABELS } from "@/lib/stationConstants";
import { roundKnots } from "@/lib/forecast";
import { useFavContext } from "@/lib/FavContext";
import { useWindUnits } from "@/lib/useWindUnits";
import {
  Badge,
  DIFFICULTY_COLORS,
  useBadgeLabels,
} from "@/components/ui/Badge";
import type { HistoryPoint, WindData, WindLive, SportType } from "@/types";
import type { FullForecast } from "@/lib/forecast";

/**
 * Conditional rain alert — visible only if significant precipitation is
 * forecast in the next 6 hours. Shows the upcoming total + start time.
 */
function PrecipAlert({ hourly }: { hourly: FullForecast["hourly"] }) {
  // Capture "now" via lazy state init at mount (pure during render), then
  // refresh every 5 min via setInterval (pure-effect pattern).
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const summary = useMemo(() => {
    if (nowMs === null) return null;
    const upcoming = hourly
      .filter((p) => {
        const t = new Date(p.time).getTime();
        return t >= nowMs && t <= nowMs + 6 * 60 * 60 * 1000;
      })
      .slice(0, 6);

    if (upcoming.length === 0) return null;

    const totalMm = upcoming.reduce((s, p) => s + (p.precipMmh || 0), 0);
    if (totalMm < 0.5) return null;

    const firstRain = upcoming.find((p) => p.precipMmh >= 0.1);
    if (!firstRain) return null;

    return {
      startHour: firstRain.time.slice(11, 16),
      totalMm,
      intensity:
        totalMm > 5 ? "Pluie soutenue" : totalMm > 2 ? "Pluie" : "Pluie faible",
    };
  }, [hourly, nowMs]);

  if (!summary) return null;

  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
      <CloudRain className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{summary.intensity} attendue</span>
        <span className="text-blue-700">
          {" "}
          dès {summary.startHour} · {summary.totalMm.toFixed(1)} mm sur les 6
          prochaines heures
        </span>
      </div>
    </div>
  );
}

/** SSR-safe media query for `min-width: 768px` (md breakpoint). */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(min-width: 768px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

// Serialised spot from Prisma (dates are strings after JSON)
interface SpotData {
  id: string;
  name: string;
  description: string | null;
  descriptionEn?: string | null;
  descriptionDe?: string | null;
  descriptionIt?: string | null;
  latitude: number;
  longitude: number;
  country: string | null;
  region: string | null;
  difficulty: string;
  waterType: string;
  sportType: SportType;
  minWindKmh: number;
  maxWindKmh: number;
  bestMonths: string[];
  bestWindDirections: string[];
  hazards: string | null;
  hazardsEn?: string | null;
  hazardsDe?: string | null;
  hazardsIt?: string | null;
  access: string | null;
  accessEn?: string | null;
  accessDe?: string | null;
  accessIt?: string | null;
  nearestStationId: string | null;
  images: {
    id: string;
    url: string;
    caption: string | null;
    credit: string | null;
    sourceUrl: string | null;
    license: string | null;
    licenseUrl: string | null;
  }[];
  reports: {
    id: string;
    date: string;
    windSpeedKmh: number;
    windDirection: number;
    gustsKmh: number | null;
    isKitable: boolean;
    comment: string | null;
    rating: number;
  }[];
}

interface Props {
  spot: SpotData;
  canEdit?: boolean;
  live: WindLive | null;
  initialForecast?: FullForecast | null;
  waterTemperature?: ReactNode;
  children?: ReactNode;
}

function pickNewestLive(
  a: WindLive | null,
  b: WindLive | null,
): WindLive | null {
  if (!a) return b;
  if (!b) return a;
  const aTime = new Date(a.updatedAt).getTime();
  const bTime = new Date(b.updatedAt).getTime();
  if (isNaN(aTime)) return b;
  if (isNaN(bTime)) return a;
  return bTime > aTime ? b : a;
}

export function SpotPageClient({
  spot,
  canEdit = false,
  live: initialLive,
  initialForecast = null,
  waterTemperature,
  children,
}: Props) {
  const { useKnots, setUseKnots } = useWindUnits();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Infos détaillées (badges, description, meta, photos) :
  // repliées sur mobile, dépliées sur desktop par défaut.
  const isDesktop = useIsDesktop();
  const [userToggled, setUserToggled] = useState(false);
  const [manualShow, setManualShow] = useState(false);
  const showInfo = userToggled ? manualShow : isDesktop;
  const [fetchedForecast, setForecast] = useState<FullForecast | null>(null);
  const forecast =
    fetchedForecast &&
    (!initialForecast ||
      Date.parse(fetchedForecast.fetchedAt) >=
        Date.parse(initialForecast.fetchedAt))
      ? fetchedForecast
      : initialForecast;
  const historySection = useRef<HTMLElement>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    spot.nearestStationId,
  );
  // Single SWR hook replaces the two manual polling effects (liveStation +
  // openMeteoLive). Deduplicates requests when other components subscribe
  // to the same spot. Falls back to Open-Meteo server-side when stale.
  const overrideStation =
    selectedStationId !== spot.nearestStationId ? selectedStationId : null;
  const { data: spotLive, error: liveError, isValidating: livePending, refresh: refreshLive } = useSpotLive(spot.id, overrideStation);
  const [historySource, setHistorySource] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [historyAttempt, setHistoryAttempt] = useState(0);
  const [historySelection, setHistorySelection] = useState<string | null>(null);
  const historyKey = `${spot.id}:${selectedStationId ?? "model"}`;
  const historyPending = historyLoading || historySelection !== historyKey;

  const router = useRouter();
  const { favoriteIds, toggleFavorite } = useFavContext();
  const isFav = favoriteIds.has(spot.id);
  const t = useTranslations("SpotPage");
  const locale = useLocale();

  // Locale-aware text fields
  const localizedDescription =
    (locale === "en"
      ? spot.descriptionEn
      : locale === "de"
        ? spot.descriptionDe
        : locale === "it"
          ? spot.descriptionIt
          : null
    )?.trim() || spot.description;
  const localizedHazards =
    (locale === "en"
      ? spot.hazardsEn
      : locale === "de"
        ? spot.hazardsDe
        : locale === "it"
          ? spot.hazardsIt
          : null
    )?.trim() || spot.hazards;
  const localizedAccess =
    (locale === "en"
      ? spot.accessEn
      : locale === "de"
        ? spot.accessDe
        : locale === "it"
          ? spot.accessIt
          : null
    )?.trim() || spot.access;

  const { nearbyStations, loadingStations, stationsError, refresh: refreshNearby } = useNearbyStations(
    spot.latitude,
    spot.longitude,
  );

  // (liveStation + openMeteoLive effects removed — replaced by useSpotLive above)

  // Keep forecast and history tied to the selected station. Aborting the previous
  // request prevents a slower response from replacing a newer selection.
  useEffect(() => {
    const controller = new AbortController();
    const stationParam = selectedStationId ? `?stationId=${encodeURIComponent(selectedStationId)}` : "";
    queueMicrotask(() => { if (!controller.signal.aborted) { setHistoryLoading(true); setHistoryError(false); setHistorySource(null); } });
    fetchClientJson<{ forecast?: FullForecast; history?: HistoryPoint[]; stationId?: string }>(`/api/spots/${spot.id}/weather${stationParam}`, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data?.forecast) setForecast(data.forecast);
        setHistory(data?.history ?? null);
        setHistorySource(data?.stationId ?? null);
      })
      .catch(() => { if (!controller.signal.aborted) { setHistory(null); setHistoryError(true); } })
      .finally(() => { if (!controller.signal.aborted) { setHistoryLoading(false); setHistorySelection(historyKey); } });
    return () => controller.abort();
  }, [spot.id, selectedStationId, historyKey, historyAttempt]);

  // Cards derive from the freshest unified WindLive. The SSR value can be
  // newer than the first SWR response when the HTTP endpoint is served from
  // a 60s/stale-while-revalidate cache, so never let the client go backward.
  const baselineLive = overrideStation ? null : initialLive;
  const resolvedLive = useFreshWind(pickNewestLive(baselineLive, spotLive));
  const wind = useMemo<WindData | null>(() => {
    if (resolvedLive) {
      return getWindData(
        resolvedLive.windSpeedKmh,
        resolvedLive.windDirection,
        resolvedLive.gustsKmh,
        resolvedLive.updatedAt,
        resolvedLive.source,
      );
    }
    return null;
  }, [resolvedLive]);

  const windSource = useMemo(() => {
    if (
      !resolvedLive ||
      resolvedLive.source !== "station"
    ) {
      return null;
    }
    const stationId = resolvedLive.stationId ?? historySource;
    if (stationId) {
      const networkLabel =
        STATION_NETWORK_LABELS[resolvedLive.network ?? "meteoswiss"];
      return { name: stationId, network: networkLabel };
    }
    return null;
  }, [resolvedLive, historySource]);

  // Inject the live trame at the end of `history` so the chart's last bar
  // matches the card. Only when source=station and isFresh — otherwise we'd
  // plant a stale or NWP value at current time, contradicting the cards.
  const chartHistory = useMemo<HistoryPoint[] | null>(() => {
    if (!history) return history;
    if (
      !resolvedLive ||
      resolvedLive.source !== "station" ||
      !resolvedLive.isFresh
    )
      return history;
    if (historySource && resolvedLive.stationId !== historySource)
      return history;
    const liveTime = new Date(resolvedLive.updatedAt)
      .toISOString()
      .slice(0, 16);
    const livePoint: HistoryPoint = {
      time: liveTime,
      windSpeedKmh: resolvedLive.windSpeedKmh,
      windDirection: resolvedLive.windDirection,
      gustsKmh: resolvedLive.gustsKmh,
      temperatureC: resolvedLive.temperatureC ?? 0,
    };
    // Find the last *measured* point (skip future forecast points).
    const nowIso = new Date().toISOString().slice(0, 16);
    let lastMeasuredIdx = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].time <= nowIso) {
        lastMeasuredIdx = i;
        break;
      }
    }
    if (lastMeasuredIdx === -1) return [livePoint, ...history];
    const last = history[lastMeasuredIdx];
    if (liveTime <= last.time) return history; // chart is already up-to-date
    // Insert the live point right after the last measured point, before forecast tail.
    return [
      ...history.slice(0, lastMeasuredIdx + 1),
      livePoint,
      ...history.slice(lastMeasuredIdx + 1),
    ];
  }, [history, resolvedLive, historySource]);

  // Auto-refresh when tab becomes visible after being hidden for 10+ min.
  // Avoids polling every 10 min in background tabs, saving ~3 API calls per cycle.
  useEffect(() => {
    let hiddenSince = 0;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSince = Date.now();
      } else if (hiddenSince && Date.now() - hiddenSince > 10 * 60 * 1000) {
        router.refresh();
        setLastRefreshed(new Date());
        hiddenSince = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    // Also refresh every 10 min while actively viewing
    const id = setInterval(
      () => {
        if (!document.hidden) {
          router.refresh();
          setLastRefreshed(new Date());
        }
      },
      10 * 60 * 1000,
    );
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(id);
    };
  }, [router]);

  const speedKmh = wind?.windSpeedKmh ?? 0;
  const gustsKmh = wind?.gustsKmh ?? null;
  const dirLabel = wind ? windDirectionLabel(wind.windDirection) : "—";
  const speedKts = roundKnots(speedKmh);
  const gustsKts = gustsKmh !== null ? roundKnots(gustsKmh) : null;

  const app = useTranslations("AppDesign");
  const tMonths = useTranslations("Months");
  const { difficultyLabel, waterLabel } = useBadgeLabels();

  const bestMonthLabels = normalizeSpotMonths(spot.bestMonths)
    .map((m) => {
      const n = parseInt(m);
      return n >= 1 && n <= 12
        ? tMonths(String(n) as Parameters<typeof tMonths>[0])
        : MONTHS[n - 1];
    })
    .filter(Boolean);

  const isKite = spot.sportType === "KITE";
  const isSnowkite = isSnowkiteSpot(spot);

  return (
    <div className="ow-spot">
      <header className="ow-spot-heading">
        <div className="ow-spot-container">
          <div className="ow-spot-breadcrumb">
            <nav className="ow-spot-quicklinks" aria-label={app("spotNavigation")}>
            <Link href="/?view=map" className="ow-spot-back"><ArrowLeft aria-hidden className="h-4 w-4" />{t("backToMap")}</Link>
              <a href="#previsions" className="ow-spot-back ow-forecast-shortcut"><Calendar aria-hidden className="h-4 w-4" />{app("forecastShortcut")}</a>
            </nav>
            <div className="ow-spot-actions">
              <button type="button" onClick={() => toggleFavorite(spot.id)} className="ow-icon-button" aria-label={isFav ? t("removeFavorite") : t("addFavorite")} aria-pressed={isFav} title={isFav ? t("removeFavorite") : t("addFavorite")}>
                <Star aria-hidden className="h-5 w-5" fill={isFav ? "currentColor" : "none"} strokeWidth={isFav ? 0 : 2} />
              </button>
              {canEdit && <Link href={`/spots/${spot.id}/edit`} className="ow-icon-button" aria-label={t("editSpot")} title={t("editSpot")}><Pencil aria-hidden className="h-4 w-4" /></Link>}
            </div>
          </div>
          <div className="ow-spot-title">
            <h1>{spot.name}</h1>
            {spot.bestWindDirections.length > 0 && <div title={`Meilleures directions : ${spot.bestWindDirections.join(", ")}`}><WindDirectionRose bestDirections={spot.bestWindDirections} size={48} variant="minimal" showLabels /></div>}
          </div>
          <div className="ow-spot-meta">
            {(spot.country || spot.region) && <span><MapPin aria-hidden className="h-4 w-4" />{[spot.region, spot.country].filter(Boolean).join(", ")}</span>}
            <span>{isSnowkite ? <Snowflake aria-hidden className="h-4 w-4" /> : isKite ? <Sailboat aria-hidden className="h-4 w-4" /> : <Mountain aria-hidden className="h-4 w-4" />}{spotActivityLabel(spot, locale)}</span>
            <Link href={`/webcams?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spot.name)}&back=${encodeURIComponent(`/spots/${spot.id}`)}`}><Camera aria-hidden className="h-4 w-4" />Webcams</Link>
            <a href="#balises"><Radio aria-hidden className="h-4 w-4" />{t("nearbyStationsLink")}</a>
          </div>
        </div>
      </header>
      <div className="ow-spot-container ow-spot-body">
        <section aria-label={app("currentConditions")}>
          <div className="ow-conditions-toolbar">
            <div className="ow-conditions-source min-h-10">{resolvedLive ? <WindProvenance live={resolvedLive} expandable /> : livePending ? <p role="status" className="text-sm text-slate-600">{t("loading")}</p> : null}</div>
            <div className="ow-unit-control" role="group" aria-label={app("units")}>
              <button type="button" aria-pressed={useKnots} onClick={() => setUseKnots(true)}>kts</button>
              <button type="button" aria-pressed={!useKnots} onClick={() => setUseKnots(false)}>km/h</button>
            </div>
          </div>
          <RequestFeedback error={Boolean(liveError)} pending={livePending} hasData={Boolean(resolvedLive)} onRetry={refreshLive} />
          {forecast && <PrecipAlert hourly={forecast.hourly} />}
          <div className="ow-current-grid">
            <dl className="ow-current-metrics">
              <div className="ow-current-metric"><dt>{t("avgWind")}</dt><dd><span className="ow-current-value">{wind ? (useKnots ? speedKts : Math.round(speedKmh)) : "—"}</span>{wind && <span className="ow-current-unit">{useKnots ? "kts" : "km/h"}</span>}</dd>{wind?.updatedAt && <span className="ow-current-age">{relativeTime(wind.updatedAt)}</span>}</div>
              <div className="ow-current-metric"><dt>{t("gusts")}</dt><dd><span className="ow-current-value">{gustsKts !== null && gustsKmh !== null ? (useKnots ? gustsKts : Math.round(gustsKmh)) : "—"}</span>{gustsKmh !== null && <span className="ow-current-unit">{useKnots ? "kts" : "km/h"}</span>}</dd></div>
              <div className="ow-current-metric"><dt>{t("direction")}</dt><dd><span className="ow-current-value">{dirLabel}</span>{wind && <span className="ow-current-unit">{wind.windDirection}°</span>}</dd></div>
            </dl>
            <div className="ow-current-compass">
              {wind ? <WindCompass wind={wind} size={112} light sourceLabel={windSource ? `${windSource.name} · ${windSource.network}` : "Open-Meteo · NWP"} /> : <p>{t("windUnavailable")}</p>}
              {windSource ? <span>{windSource.network}</span> : <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo <ExternalLink aria-hidden className="inline h-3 w-3" /></a>}
            </div>
          </div>
        </section>
        {waterTemperature}
          {/* 48h history chart */}
          <section ref={historySection} className="ow-section scroll-mt-20" id="spot-history" tabIndex={-1} aria-labelledby="spot-history-title">
            <div className="ow-section-header">
              <h2 id="spot-history-title" className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                {t("history48h")}
              </h2>
              {historyPending ? (
                <span className="text-[10px] text-gray-500">{selectedStationId ? nearbyStations.find((station) => station.id === selectedStationId)?.name ?? selectedStationId : "Open-Meteo"}</span>
              ) : historySource ? (
                <span className="text-[10px] text-gray-500">
                  {historySource}
                  {nearbyStations.find((s) => s.id === historySource)
                    ? ` · ${nearbyStations.find((s) => s.id === historySource)?.source === "meteoswiss" ? "MeteoSwiss" : nearbyStations.find((s) => s.id === historySource)?.source === "pioupiou" ? "Pioupiou" : nearbyStations.find((s) => s.id === historySource)?.source === "netatmo" ? "Netatmo" : nearbyStations.find((s) => s.id === historySource)?.source === "meteofrance" ? "Météo-France" : nearbyStations.find((s) => s.id === historySource)?.source === "windball" ? "Windball" : ""}`
                    : windSource
                      ? ` · ${windSource.network}`
                      : ""}
                </span>
              ) : windSource ? (
                <span className="text-[10px] text-gray-500">
                  {windSource.name} · {windSource.network}
                </span>
              ) : (
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-0.5"
                >
                  Open-Meteo · NWP open source
                  <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                </a>
              )}
            </div>
            <div className="ow-section-chart">
              {historyPending ? (
                <div role="status" className="flex items-center justify-center h-28 text-sm text-slate-600 gap-2">
                  <svg aria-hidden="true" className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {t("loading")}
                </div>
              ) : historyError ? (
                <RequestFeedback error onRetry={() => setHistoryAttempt((attempt) => attempt + 1)} />
              ) : chartHistory && chartHistory.length > 0 ? (
                <WindHistoryChart
                  key={historySource}
                  history={chartHistory}
                  forecast={forecast?.hourly}
                  useKnots={useKnots}
                  timezone={forecast?.timezone ?? "UTC"}
                />
              ) : (
                <div className="flex items-center justify-center h-28 text-sm text-gray-500">
                  {t("historyUnavailable")}
                </div>
              )}
            </div>
          </section>

        {/* Detailed hourly forecast */}
        {forecast ? (
          <section id="previsions" className="ow-section ow-forecast-first">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {t("windguru")}
            </h2>
            <ForecastWithToggle
              forecast={forecast}
              spotId={spot.id}
              lat={spot.latitude}
              lng={spot.longitude}
              enableMeteoSwiss={isInSwitzerland(spot.latitude, spot.longitude)}
            />
          </section>
        ) : (
          <div id="previsions" className="ow-section ow-forecast-first text-sm text-gray-500 py-8">
            {t("forecastUnavailable")}
          </div>
        )}

        {/* ── Graphique vent · 7 jours ───────────────────────────── */}
        {forecast && (
          <section className="ow-section">
            <div className="ow-section-header">
              <h2 className="text-base font-semibold text-gray-900">
                {t("forecast7days")}
              </h2>
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-0.5"
              >
                Open-Meteo · NWP open source
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </a>
            </div>
            <div className="ow-section-chart">
              <WindChart
                hourly={forecast.hourly}
                timezone={forecast.timezone}
                useKnots={useKnots}
              />
            </div>
          </section>
        )}

        <section className="ow-spot-information" aria-labelledby="spot-information-title">
          <h2 id="spot-information-title" className="text-xl font-semibold">{app("spotInformation")}</h2>
          <div className="ow-spot-info-grid"><div>
            {/* Toggle infos détaillées */}
            <button
              type="button"
              onClick={() => {
                setManualShow(!showInfo);
                setUserToggled(true);
              }}
              aria-expanded={showInfo}
              aria-controls="spot-info-details"
              className="ow-spot-back"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showInfo ? "rotate-180" : ""}`}
              />
              {showInfo ? t("hideInfo") : t("showInfo")}
            </button>

            {/* Keep the details in the initial HTML; only their visibility changes. */}
            {localizedDescription && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-2xl">
                {localizedDescription}
              </p>
            )}
            <div id="spot-info-details" hidden={!showInfo}>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={DIFFICULTY_COLORS[spot.difficulty]}>
                  {difficultyLabel(spot.difficulty)}
                </Badge>
                {isKite && !isSnowkite && (
                  <Badge className="bg-gray-100 text-gray-700">
                    <Waves className="h-3 w-3 mr-1" />{" "}
                    {waterLabel(spot.waterType)}
                  </Badge>
                )}
                <Badge className="bg-gray-100 text-gray-700">
                  <Wind className="h-3 w-3 mr-1" />{" "}
                  {useKnots
                    ? `${roundKnots(spot.minWindKmh)}–${roundKnots(spot.maxWindKmh)} kts`
                    : `${spot.minWindKmh}–${spot.maxWindKmh} km/h`}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                {bestMonthLabels.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {bestMonthLabels.join(", ")}
                  </span>
                )}
                {localizedHazards && (
                  <span className="flex items-center gap-1 text-orange-500">
                    <AlertTriangle className="h-3 w-3" />
                    {localizedHazards}
                  </span>
                )}
                {localizedAccess && (
                  <span className="flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    {localizedAccess}
                  </span>
                )}
              </div>
            </div>

            {lastRefreshed && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                màj auto,{" "}
                {lastRefreshed.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          <div
            className="ow-spot-photos"
            hidden={!showInfo}
          >
            {spot.images.length > 0 && (
              <div className="flex gap-1.5">
                {spot.images.slice(0, 3).map((img, idx) => (
                  <button
                    type="button"
                    key={img.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || spot.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    {idx === 2 && spot.images.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-0.5">
                        <Images className="h-4 w-4 text-white" />
                        <span className="text-white font-semibold text-xs">
                          +{spot.images.length - 3}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </section>
        {children}
        <LocalGuideLinks locale={locale} spotId={spot.id} />

        {/* ── Lightbox modal ─────────────────────────────────────── */}
        {lightboxIndex !== null && spot.images.length > 0 && (
          <SpotLightbox
            images={spot.images}
            currentIndex={lightboxIndex}
            spotName={spot.name}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        {/* ── Balises à proximité ─────────────────────────────── */}
        <section id="balises" className="ow-section scroll-mt-20">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-gray-500" />
            {t("nearbyStations")}
          </h2>
          {!loadingStations && nearbyStations.length > 0 && <p className="ow-caption mb-3">{t("selectStationHint")}</p>}
          <NearbyStationsPanel
            stations={nearbyStations}
            loading={loadingStations}
            onRetry={() => { void refreshNearby(spot.latitude, spot.longitude); }}
            error={stationsError}
            useKnots={useKnots}
            selectedId={selectedStationId}
            onSelect={(s) => {
              setSelectedStationId(s.id);
              historySection.current?.focus({ preventScroll: true });
              historySection.current?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
                block: "start",
              });
            }}
          />
        </section>

        {/* ── Archives vent historiques ────────────────────────── */}
        <section className="ow-section">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("windArchives")}
          </h2>
          <WindArchives spotId={spot.id} useKnots={useKnots} />
        </section>

        {/* ── Situation ─────────────────────────────────────────── */}
        <section className="ow-section">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t("location")}
          </h2>
          <div className="relative rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-72 sm:h-96">
            <SpotMiniMap
              lat={spot.latitude}
              lng={spot.longitude}
              name={spot.name}
              bestDirections={spot.bestWindDirections}
            />
          </div>
        </section>

        {/* ── Coordonnées + liens ──────────────────────────────────── */}
        <div className="mt-14 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
            </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}&zoom=13`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              {t("openStreetMap")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
