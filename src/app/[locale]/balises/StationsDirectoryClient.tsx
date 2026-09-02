"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  Compass,
  Map as MapIcon,
  RadioTower,
  Search,
  SlidersHorizontal,
  Star,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NETWORK_LABELS, type NetworkId } from "@/lib/stationConstants";
import { normalizeStationSearch } from "@/lib/stationDirectory";
import type { WindStation } from "@/lib/stations";
import { roundKnots } from "@/lib/forecast";
import {
  barColors,
  windConditionKey,
  windDirectionLabel,
} from "@/lib/utils";
import { useFavContext } from "@/lib/FavContext";

interface Props {
  initialStations: WindStation[];
}

type SourceFilter = NetworkId | "all";
type SortMode = "wind" | "name" | "latest";

const PAGE_SIZE = 48;
const NETWORK_ORDER: NetworkId[] = [
  "meteoswiss",
  "pioupiou",
  "windball",
  "fr-energy",
  "netatmo",
  "meteofrance",
];

const NETWORK_STYLES: Record<
  NetworkId,
  { dot: string; badge: string; icon: string }
> = {
  meteoswiss: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 ring-red-100",
    icon: "bg-red-50 text-red-600",
  },
  pioupiou: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: "bg-emerald-50 text-emerald-600",
  },
  netatmo: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: "bg-violet-50 text-violet-600",
  },
  meteofrance: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-blue-100",
    icon: "bg-blue-50 text-blue-600",
  },
  windball: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 ring-orange-100",
    icon: "bg-orange-50 text-orange-600",
  },
  "fr-energy": {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: "bg-amber-50 text-amber-600",
  },
};

function sourceLabel(source: NetworkId) {
  return NETWORK_LABELS[source];
}

export function StationsDirectoryClient({ initialStations }: Props) {
  const t = useTranslations("StationsDirectory");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [sort, setSort] = useState<SortMode>("wind");
  const [useKnots, setUseKnots] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const networkCounts = useMemo(() => {
    const counts = new Map<NetworkId, number>();
    for (const station of initialStations) {
      counts.set(station.source, (counts.get(station.source) ?? 0) + 1);
    }
    return counts;
  }, [initialStations]);

  const availableSources = NETWORK_ORDER.filter(
    (network) => (networkCounts.get(network) ?? 0) > 0,
  );
  const strongest = useMemo(
    () =>
      initialStations.reduce<WindStation | null>(
        (best, station) =>
          !best || station.windSpeedKmh > best.windSpeedKmh ? station : best,
        null,
      ),
    [initialStations],
  );

  const filteredStations = useMemo(() => {
    const normalizedQuery = normalizeStationSearch(query);
    const collator = new Intl.Collator(locale, { sensitivity: "base" });
    const filtered = initialStations.filter((station) => {
      if (source !== "all" && station.source !== source) return false;
      if (!normalizedQuery) return true;
      const haystack = normalizeStationSearch(
        `${station.name} ${station.id} ${station.description ?? ""} ${sourceLabel(station.source)}`,
      );
      return haystack.includes(normalizedQuery);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return collator.compare(a.name, b.name);
      if (sort === "latest") {
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      }
      return b.windSpeedKmh - a.windSpeedKmh || collator.compare(a.name, b.name);
    });
  }, [initialStations, locale, query, sort, source]);

  const visibleStations = filteredStations.slice(0, visibleCount);

  const updateSource = (nextSource: SourceFilter) => {
    setSource(nextSource);
    setVisibleCount(PAGE_SIZE);
  };
  const updateSort = (nextSort: SortMode) => {
    setSort(nextSort);
    setVisibleCount(PAGE_SIZE);
  };
  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <section className="border-b border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                <RadioTower className="h-4 w-4" />
                {t("eyebrow")}
              </p>
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {t("description")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {t("stationCount", { count: initialStations.length })}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {t("networkCount", { count: availableSources.length })}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {t("historyIncluded")}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t("strongestNow")}
              </p>
              {strongest ? (
                <>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-950">
                        {strongest.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {sourceLabel(strongest.source)}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-3xl font-bold tabular-nums text-sky-700">
                      {useKnots
                        ? roundKnots(strongest.windSpeedKmh)
                        : Math.round(strongest.windSpeedKmh)}
                      <span className="ml-1 text-xs font-semibold text-slate-400">
                        {useKnots ? "kts" : "km/h"}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/stations/${encodeURIComponent(strongest.id)}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
                  >
                    {t("openStation")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">{t("empty")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t("search")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 xl:pb-0">
              <NetworkButton
                active={source === "all"}
                label={t("allNetworks")}
                count={initialStations.length}
                onClick={() => updateSource("all")}
              />
              {availableSources.map((network) => (
                <NetworkButton
                  key={network}
                  active={source === network}
                  label={sourceLabel(network)}
                  count={networkCounts.get(network) ?? 0}
                  dotClassName={NETWORK_STYLES[network].dot}
                  onClick={() => updateSource(network)}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              {t("resultCount", { count: filteredStations.length })}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" />
              <select
                value={sort}
                onChange={(event) => updateSort(event.target.value as SortMode)}
                aria-label={t("sortLabel")}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-400"
              >
                <option value="wind">{t("sortWind")}</option>
                <option value="latest">{t("sortLatest")}</option>
                <option value="name">{t("sortName")}</option>
              </select>
              <div className="inline-flex h-9 overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUseKnots(true)}
                  aria-pressed={useKnots}
                  className={`px-3 ${useKnots ? "bg-slate-950 text-white" : "bg-white text-slate-500"}`}
                >
                  kts
                </button>
                <button
                  type="button"
                  onClick={() => setUseKnots(false)}
                  aria-pressed={!useKnots}
                  className={`border-l border-slate-200 px-3 ${!useKnots ? "bg-slate-950 text-white" : "bg-white text-slate-500"}`}
                >
                  km/h
                </button>
              </div>
              <Link
                href="/?view=map"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("map")}</span>
              </Link>
            </div>
          </div>
        </div>

        {visibleStations.length > 0 ? (
          <>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleStations.map((station) => (
                <StationDirectoryCard
                  key={station.id}
                  station={station}
                  locale={locale}
                  useKnots={useKnots}
                />
              ))}
            </div>
            {visibleCount < filteredStations.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-400 hover:text-sky-700"
                >
                  {t("showMore", {
                    count: Math.min(
                      PAGE_SIZE,
                      filteredStations.length - visibleCount,
                    ),
                  })}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <RadioTower className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {t("noResults")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("noResultsDescription")}
            </p>
            <button
              type="button"
              onClick={() => {
                updateQuery("");
                updateSource("all");
              }}
              className="mt-5 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              {t("reset")}
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3 sm:p-7">
          <DirectoryPromise icon={RadioTower} title={t("promiseRealTitle")}>
            {t("promiseRealDescription")}
          </DirectoryPromise>
          <DirectoryPromise icon={Compass} title={t("promiseHistoryTitle")}>
            {t("promiseHistoryDescription")}
          </DirectoryPromise>
          <DirectoryPromise icon={MapIcon} title={t("promiseNetworkTitle")}>
            {t("promiseNetworkDescription")}
          </DirectoryPromise>
        </div>
      </section>
    </div>
  );
}

function NetworkButton({
  active,
  label,
  count,
  dotClassName,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  dotClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold ring-1 transition ${
        active
          ? "bg-slate-950 text-white ring-slate-950"
          : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
      }`}
    >
      {dotClassName && (
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      )}
      {label}
      <span className="text-slate-400">{count}</span>
    </button>
  );
}

function StationDirectoryCard({
  station,
  locale,
  useKnots,
}: {
  station: WindStation;
  locale: string;
  useKnots: boolean;
}) {
  const t = useTranslations("StationsDirectory");
  const tWind = useTranslations("WindConditions");
  const { favoriteStationIds, toggleStationFavorite } = useFavContext();
  const isFavorite = favoriteStationIds.has(station.id);
  const style = NETWORK_STYLES[station.source];
  const color = barColors(station.windSpeedKmh)[0];
  const speed = useKnots
    ? roundKnots(station.windSpeedKmh)
    : Math.round(station.windSpeedKmh);
  const gusts =
    station.gustsKmh !== null
      ? useKnots
        ? roundKnots(station.gustsKmh)
        : Math.round(station.gustsKmh)
      : null;
  type WindCondition =
    | "calm"
    | "light"
    | "gentle"
    | "good"
    | "strong"
    | "veryStrong"
    | "danger";
  const condition = tWind(
    windConditionKey(station.windSpeedKmh).split(".")[1] as WindCondition,
  );
  const measuredAt = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  }).format(new Date(station.updatedAt));

  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
      <button
        type="button"
        onClick={() => toggleStationFavorite(station.id)}
        aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
        aria-pressed={isFavorite}
        title={isFavorite ? t("removeFavorite") : t("addFavorite")}
        className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200 transition hover:bg-amber-50 hover:text-amber-500 hover:ring-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <Star
          className={`h-4 w-4 ${
            isFavorite ? "fill-amber-400 text-amber-400" : ""
          }`}
        />
      </button>
      <Link
        href={`/stations/${encodeURIComponent(station.id)}`}
        prefetch={false}
        className="flex min-w-0 flex-1 flex-col rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <div className="flex items-start justify-between gap-3 pr-10">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
          >
            <RadioTower className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-950 group-hover:text-sky-800">
              {station.name}
            </h2>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {station.id}
              {station.altitudeM > 0
                ? ` · ${Math.round(station.altitudeM)} m`
                : ""}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${style.badge}`}
        >
          {sourceLabel(station.source)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 min-h-8 text-xs leading-4 text-slate-500">
        {station.description ||
          t("networkStation", { network: sourceLabel(station.source) })}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}16` }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-label={`${t("direction")} ${station.windDirection}°`}
          >
            <g
              transform={`rotate(${(station.windDirection + 180) % 360}, 16, 16)`}
            >
              <line
                x1="16"
                y1="25"
                x2="16"
                y2="10"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon points="16,5 11,13 21,13" fill={color} />
            </g>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {speed}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {useKnots ? "kts" : "km/h"}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {windDirectionLabel(station.windDirection)} · {station.windDirection}
            °
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
          {condition}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <Zap className="h-3 w-3" /> {t("gusts")}
          </p>
          <p className="mt-1 text-sm font-bold tabular-nums text-slate-800">
            {gusts ?? "—"}{" "}
            {gusts !== null && (
              <span className="text-[10px] font-medium text-slate-400">
                {useKnots ? "kts" : "km/h"}
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-[10px] text-slate-400">
            <Wind className="h-3 w-3" /> {t("measured")}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
            {measuredAt}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">{t("history48h")}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
          {t("details")}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
        </div>
      </Link>
    </article>
  );
}

function DirectoryPromise({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm ring-1 ring-slate-200">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{children}</p>
      </div>
    </div>
  );
}
