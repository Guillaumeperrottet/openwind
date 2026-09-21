"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Compass,
  Gauge,
  GripVertical,
  LayoutDashboard,
  Map,
  MapPin,
  MessageCircle,
  Newspaper,
  Plus,
  RadioTower,
  Route,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Wind,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavContext } from "@/lib/FavContext";
import { useSpotLive } from "@/lib/useSpotLive";
import { useStationLive } from "@/lib/useStationLive";
import { cn, windArrow, windDirectionLabel } from "@/lib/utils";
import { timeAgo } from "@/lib/forum";
import { trackEvent } from "@/lib/analytics";
import {
  DASHBOARD_MODULES,
  type AccountPreferences,
  type DashboardModule,
  type DefaultView,
  type SportFilter,
} from "@/lib/user-preferences";
import type {
  DashboardArticle,
  DashboardCommunityItem,
  DashboardFavoriteSpot,
  DashboardFavoriteStation,
  DashboardForecastDay,
  MonOpenwindData,
} from "@/components/dashboard/types";
import { NETWORK_LABELS } from "@/lib/stationConstants";
import type { WindLive } from "@/types";

interface Props {
  initialData: MonOpenwindData;
}

type DashboardFavoriteChoice = {
  kind: "spot" | "station";
  id: string;
};

type DashboardFavoriteItem =
  | { kind: "spot"; item: DashboardFavoriteSpot }
  | { kind: "station"; item: DashboardFavoriteStation };

const MAX_DASHBOARD_FAVORITES = 3;

function favoriteChoiceKey(choice: DashboardFavoriteChoice) {
  return `${choice.kind}:${choice.id}`;
}

function moveArrayItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const COMPASS_DEGREES: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

function isDirectionCompatible(direction: number, bestDirections: string[]) {
  if (bestDirections.length === 0) return true;
  return bestDirections.some((label) => {
    const expected = COMPASS_DEGREES[label.toUpperCase()];
    if (expected === undefined) return false;
    const difference = Math.abs(direction - expected);
    return Math.min(difference, 360 - difference) <= 45;
  });
}

function isLiveWindCompatible(spot: DashboardFavoriteSpot, live: WindLive) {
  const sourceUsable = live.source === "openmeteo" || live.isFresh;
  const speedCompatible =
    spot.sportType === "PARAGLIDE"
      ? live.windSpeedKmh <= 15
      : live.windSpeedKmh >= spot.minWindKmh &&
        live.windSpeedKmh <= spot.maxWindKmh;
  const gustsCompatible =
    spot.sportType === "PARAGLIDE"
      ? live.gustsKmh <= 25
      : live.gustsKmh / Math.max(live.windSpeedKmh, 1) <= 1.45;
  const directionCompatible =
    spot.sportType === "PARAGLIDE" ||
    isDirectionCompatible(live.windDirection, spot.bestWindDirections);

  return (
    sourceUsable && speedCompatible && gustsCompatible && directionCompatible
  );
}

export function MonOpenwindClient({ initialData }: Props) {
  const t = useTranslations("MonOpenwind");
  const { preferences: contextPreferences } = useFavContext();
  const preferences = contextPreferences ?? initialData.preferences;
  const [favoriteSpots, setFavoriteSpots] = useState(initialData.favoriteSpots);
  const [favoriteStations, setFavoriteStations] = useState(
    initialData.favoriteStations,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    trackEvent("mon_openwind_viewed", {
      favorite_count: favoriteSpots.length + favoriteStations.length,
      favorite_spot_count: favoriteSpots.length,
      favorite_station_count: favoriteStations.length,
    });
    // A dashboard view should be counted once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleSpots = useMemo(
    () =>
      favoriteSpots.filter(
        (spot) =>
          preferences.sportFilter === "ALL" ||
          spot.sportType === preferences.sportFilter,
      ),
    [favoriteSpots, preferences.sportFilter],
  );

  const dashboardSpots = useMemo(
    () => visibleSpots.filter((spot) => spot.dashboardSelected),
    [visibleSpots],
  );
  const dashboardStations = useMemo(
    () => favoriteStations.filter((station) => station.dashboardSelected),
    [favoriteStations],
  );
  const dashboardFavorites = useMemo<DashboardFavoriteItem[]>(
    () =>
      [
        ...dashboardSpots.map((item) => ({ kind: "spot" as const, item })),
        ...dashboardStations.map((item) => ({
          kind: "station" as const,
          item,
        })),
      ].sort((a, b) => a.item.dashboardOrder - b.item.dashboardOrder),
    [dashboardSpots, dashboardStations],
  );

  const visibleSpotIds = useMemo(
    () => new Set(dashboardSpots.map((spot) => spot.id)),
    [dashboardSpots],
  );
  const favoriteStationIds = useMemo(
    () => new Set(dashboardStations.map((station) => station.id)),
    [dashboardStations],
  );

  const articles = initialData.articles.filter(
    (article) =>
      article.linkedSpotIds.some((id) => visibleSpotIds.has(id)) ||
      article.linkedStationIds.some((id) => favoriteStationIds.has(id)),
  );
  const community = initialData.community.filter(
    (item) => item.spotId === null || visibleSpotIds.has(item.spotId),
  );

  const windows = useMemo(
    () =>
      dashboardSpots
        .flatMap((spot) =>
          spot.forecastDays.map((day) => ({ spot, day })),
        )
        .filter(({ day }) => day.score >= 35)
        .sort((a, b) => b.day.score - a.day.score)
        .slice(0, 6),
    [dashboardSpots],
  );

  const promisingCount = windows.filter(({ day }) => day.score >= 60).length;
  const firstName = initialData.userName?.trim().split(/\s+/)[0] ?? null;
  const bestWindow = windows[0] ?? null;

  const selectDashboardFavorites = async (
    choices: DashboardFavoriteChoice[],
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/favorites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboardFavorites: choices }),
      });
      if (!response.ok) return false;

      const selected = new globalThis.Map(
        choices.map((choice, index) => [favoriteChoiceKey(choice), index]),
      );
      setFavoriteSpots((current) =>
        current.map((spot) => ({
          ...spot,
          dashboardSelected: selected.has(`spot:${spot.id}`),
          dashboardOrder: selected.get(`spot:${spot.id}`) ?? 0,
        })),
      );
      setFavoriteStations((current) =>
        current.map((station) => ({
          ...station,
          dashboardSelected: selected.has(`station:${station.id}`),
          dashboardOrder: selected.get(`station:${station.id}`) ?? 0,
        })),
      );
      trackEvent("dashboard_favorites_selected", {
        favorite_count: choices.length,
        favorite_spot_count: choices.filter((choice) => choice.kind === "spot")
          .length,
        favorite_station_count: choices.filter(
          (choice) => choice.kind === "station",
        ).length,
      });
      return true;
    } catch {
      return false;
    }
  };

  const moduleContent: Record<DashboardModule, React.ReactNode> = {
    FAVORITES: (
      <FavoritesSection
        favorites={dashboardFavorites}
        hasSavedFavorites={favoriteSpots.length + favoriteStations.length > 0}
        useKnots={preferences.useKnots}
        onSpotRemoved={(spotId) =>
          setFavoriteSpots((current) =>
            current.filter((spot) => spot.id !== spotId),
          )
        }
        onStationRemoved={(stationId) =>
          setFavoriteStations((current) =>
            current.filter((station) => station.id !== stationId),
          )
        }
      />
    ),
    FORECAST: (
      <ForecastSection windows={windows} useKnots={preferences.useKnots} />
    ),
    ARTICLES: <ArticlesSection articles={articles} />,
    COMMUNITY: <CommunitySection items={community} spots={dashboardSpots} />,
    QUICK_ACTIONS: <QuickActions />,
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-white text-slate-950">
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-6 lg:px-10">
          <div className="mb-6 flex items-center justify-between gap-3 sm:mb-7">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <Link
                href="/?view=map"
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                <Map className="h-4 w-4" />
                {t("switch.map")}
              </Link>
              <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                <LayoutDashboard className="h-4 w-4" />
                {t("switch.dashboard")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t("customize")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-4"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("customize")}</span>
            </button>
          </div>

          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(310px,0.72fr)] md:items-stretch lg:gap-10">
            <DashboardHeroIntro
              firstName={firstName}
              favoriteCount={dashboardFavorites.length}
              promisingCount={promisingCount}
            />
            <BestWindowHeroCard
              window={bestWindow}
              useKnots={preferences.useKnots}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {preferences.dashboardLayout.map((module) => (
          <div key={module}>{moduleContent[module]}</div>
        ))}
      </div>

      {settingsOpen && (
        <DashboardSettings
          preferences={preferences}
          spots={favoriteSpots}
          stations={favoriteStations}
          onSelectionChange={selectDashboardFavorites}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

function DashboardHeroIntro({
  firstName,
  favoriteCount,
  promisingCount,
}: {
  firstName: string | null;
  favoriteCount: number;
  promisingCount: number;
}) {
  const t = useTranslations("MonOpenwind");
  const locale = useLocale();
  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="flex min-w-0 flex-col justify-center py-2 md:py-4">
      <p className="mb-2 flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-sky-600">
        <span>{t("eyebrow")}</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span className="capitalize text-slate-400">{today}</span>
      </p>
      <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[44px] lg:leading-[1.05]">
        {firstName ? t("helloName", { name: firstName }) : t("hello")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {favoriteCount === 0
          ? t("summary.empty")
          : promisingCount > 0
            ? t("summary.promising", {
                count: promisingCount,
                spots: favoriteCount,
              })
            : t("summary.quiet", { count: favoriteCount })}
      </p>
    </div>
  );
}

function BestWindowHeroCard({
  window,
  useKnots,
}: {
  window: { spot: DashboardFavoriteSpot; day: DashboardForecastDay } | null;
  useKnots: boolean;
}) {
  const t = useTranslations("MonOpenwind.hero");
  const locale = useLocale();

  if (!window) {
    return (
      <div className="relative flex min-h-52 flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_72%)] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-sky-100/60 blur-2xl" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm ring-1 ring-slate-100">
            <Wind className="h-5 w-5" />
          </span>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
            {t("nextWindow")}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            {t("waitingTitle")}
          </h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            {t("waitingDescription")}
          </p>
        </div>
        <Link
          href="/?view=map"
          className="relative mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          {t("chooseSpots")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { spot, day } = window;
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${day.date}T12:00:00`));
  const speedKmh = day.bestHour?.windSpeedKmh ?? day.averageWindKmh;
  const gustsKmh = day.bestHour?.gustsKmh ?? day.peakWindKmh;
  const speed = Math.round(useKnots ? speedKmh / 1.852 : speedKmh);
  const gusts = Math.round(useKnots ? gustsKmh / 1.852 : gustsKmh);
  const unit = useKnots ? "kts" : "km/h";
  const time = day.bestHour
    ? new Date(day.bestHour.time).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="relative flex min-h-52 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(145deg,#f8fbff_0%,#ffffff_70%)] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
            {t("nextWindow")}
          </p>
          <h2 className="mt-1 line-clamp-2 text-xl font-bold leading-tight tracking-tight text-slate-950 sm:text-2xl">
            {spot.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs capitalize text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {date}
            {time && <span>· {t("around", { time })}</span>}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {day.score}%
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-white bg-white/85 px-1 py-3 shadow-sm backdrop-blur">
        <HeroWeatherValue label={t("wind")} value={`${speed} ${unit}`} />
        <HeroWeatherValue label={t("gusts")} value={`${gusts} ${unit}`} />
        <HeroWeatherValue
          label={t("direction")}
          value={
            day.bestHour
              ? `${windArrow(day.bestHour.windDirection)} ${windDirectionLabel(day.bestHour.windDirection)}`
              : "—"
          }
        />
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-4 pt-5">
        <p className="text-[11px] leading-4 text-slate-400">
          {t("suitableHours", { count: day.suitableHours })}
        </p>
        <Link
          href={`/spots/${spot.id}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          {t("viewWindow")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function HeroWeatherValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2.5">
      <span className="block text-[9px] uppercase tracking-[0.1em] text-slate-400">
        {label}
      </span>
      <strong className="mt-1 block truncate text-sm tabular-nums text-slate-900">
        {value}
      </strong>
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function FavoritesSection({
  favorites,
  hasSavedFavorites,
  useKnots,
  onSpotRemoved,
  onStationRemoved,
}: {
  favorites: DashboardFavoriteItem[];
  hasSavedFavorites: boolean;
  useKnots: boolean;
  onSpotRemoved: (spotId: string) => void;
  onStationRemoved: (stationId: string) => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");

  return (
    <section aria-labelledby="favorite-spots-heading">
      <SectionHeading
        id="favorite-spots-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      {favorites.length === 0 ? (
        hasSavedFavorites ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm font-medium text-slate-500">
            {t("selectionEmpty")}
          </div>
        ) : (
          <EmptyFavorites />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((favorite) =>
            favorite.kind === "spot" ? (
              <FavoriteSpotCard
                key={`spot:${favorite.item.id}`}
                spot={favorite.item}
                useKnots={useKnots}
                onRemoved={() => onSpotRemoved(favorite.item.id)}
              />
            ) : (
              <FavoriteStationCard
                key={`station:${favorite.item.id}`}
                station={favorite.item}
                useKnots={useKnots}
                onRemoved={() => onStationRemoved(favorite.item.id)}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function DashboardFavoriteSelector({
  spots,
  stations,
  selectedKeys,
  onToggle,
  onMove,
}: {
  spots: DashboardFavoriteSpot[];
  stations: DashboardFavoriteStation[];
  selectedKeys: string[];
  onToggle: (key: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");
  const selected = new Set(selectedKeys);
  const options = [
    ...spots.map((spot) => ({
      key: `spot:${spot.id}`,
      icon: MapPin,
      label: spot.name,
      detail: spot.region ?? spot.country ?? t("locationUnknown"),
    })),
    ...stations.map((station) => ({
      key: `station:${station.id}`,
      icon: RadioTower,
      label: station.name,
      detail: NETWORK_LABELS[station.source] ?? station.source,
    })),
  ];
  const byKey = new globalThis.Map(
    options.map((option) => [option.key, option]),
  );
  const orderedOptions = [
    ...selectedKeys
      .map((key) => byKey.get(key))
      .filter((option): option is (typeof options)[number] => Boolean(option)),
    ...options.filter((option) => !selected.has(option.key)),
  ];

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <p
          id="dashboard-favorite-selector-help"
          className="text-xs leading-5 text-slate-400"
        >
          {t("selectorDescription")}
        </p>
        <span
          className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700"
          aria-live="polite"
        >
          {t("selectionCount", {
            count: selectedKeys.length,
            max: MAX_DASHBOARD_FAVORITES,
          })}
        </span>
      </div>

      <div className="space-y-2">
        {orderedOptions.map((option) => {
          const selectedIndex = selectedKeys.indexOf(option.key);
          return (
          <DashboardFavoriteOption
            key={option.key}
            icon={option.icon}
            label={option.label}
            detail={option.detail}
            selected={selected.has(option.key)}
            disabled={
              !selected.has(option.key) &&
              selectedKeys.length >= MAX_DASHBOARD_FAVORITES
            }
            position={selectedIndex >= 0 ? selectedIndex : null}
            selectedTotal={selectedKeys.length}
            onClick={() => onToggle(option.key)}
            onMoveUp={() => onMove(selectedIndex, -1)}
            onMoveDown={() => onMove(selectedIndex, 1)}
          />
          );
        })}
      </div>
    </div>
  );
}

function DashboardFavoriteOption({
  icon: Icon,
  label,
  detail,
  selected,
  disabled,
  position,
  selectedTotal,
  onClick,
  onMoveUp,
  onMoveDown,
}: {
  icon: typeof MapPin;
  label: string;
  detail: string;
  selected: boolean;
  disabled: boolean;
  position: number | null;
  selectedTotal: number;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");
  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-2 rounded-xl border p-2 transition-colors",
        selected
          ? "border-sky-300 bg-sky-50/60 text-slate-950"
          : "border-slate-200 bg-white text-slate-600",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-describedby="dashboard-favorite-selector-help"
        disabled={disabled}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            selected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500",
          )}
        >
          {selected ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm">{label}</strong>
          <span className="mt-0.5 block truncate text-[11px] text-slate-400">
            {detail}
          </span>
        </span>
      </button>
      {selected && position !== null && (
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={position === 0}
            className="flex h-8 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-sky-700 disabled:opacity-25"
            aria-label={t("moveFavoriteUp", { name: label })}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={position === selectedTotal - 1}
            className="flex h-8 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-sky-700 disabled:opacity-25"
            aria-label={t("moveFavoriteDown", { name: label })}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function FavoriteSpotCard({
  spot,
  useKnots,
  onRemoved,
}: {
  spot: DashboardFavoriteSpot;
  useKnots: boolean;
  onRemoved: () => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");
  const locale = useLocale();
  const { toggleFavorite } = useFavContext();
  const { data: live, isLoading, error } = useSpotLive(spot.id);
  const [removing, setRemoving] = useState(false);
  const speed = live
    ? useKnots
      ? Math.round(live.windSpeedKmh / 1.852)
      : Math.round(live.windSpeedKmh)
    : null;
  const gusts = live
    ? useKnots
      ? Math.round(live.gustsKmh / 1.852)
      : Math.round(live.gustsKmh)
    : null;
  const unit = useKnots ? "kts" : "km/h";
  const windCompatible = live ? isLiveWindCompatible(spot, live) : false;
  const measuredAt = live
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(new Date(live.updatedAt))
    : null;
  const liveSource = live?.network
    ? NETWORK_LABELS[live.network] ?? live.network
    : t("stationSource");
  const status = live
    ? live.source === "openmeteo"
      ? t("estimatedAt", { time: measuredAt ?? "—" })
      : live.isFresh
        ? t("liveAt", { source: liveSource, time: measuredAt ?? "—" })
        : t("staleAt", { source: liveSource, time: measuredAt ?? "—" })
    : error
      ? t("unavailable")
      : isLoading
        ? t("loading")
        : t("unavailable");

  const remove = async () => {
    if (removing) return;
    setRemoving(true);
    const result = await toggleFavorite(spot.id);
    setRemoving(false);
    if (result === false) onRemoved();
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="relative h-28 overflow-hidden bg-[linear-gradient(135deg,#e0f2fe,#f8fafc)] sm:h-32">
        {spot.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sky-300">
            <Wind className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
          {spot.sportType === "KITE" ? t("kite") : t("paraglide")}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={removing}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-amber-500 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-50"
          aria-label={t("remove")}
          title={t("remove")}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/spots/${spot.id}`}
              className="text-base font-bold text-slate-950 hover:text-sky-700"
            >
              {spot.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {[spot.region, spot.country].filter(Boolean).join(" · ") ||
                t("locationUnknown")}
            </p>
          </div>
          {live && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold",
                windCompatible
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700",
              )}
              title={t("windStatusHelp")}
              aria-label={`${
                windCompatible ? t("windCompatible") : t("windCaution")
              }. ${t("windStatusHelp")}`}
            >
              {windCompatible ? t("windCompatible") : t("windCaution")}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 px-2 py-3">
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("wind")}
            </span>
            <strong className="mt-0.5 block text-base tabular-nums text-slate-900">
              {isLoading && speed === null ? "…" : speed ?? "—"}
              {speed !== null && (
                <span className="ml-1 text-[10px] font-medium text-slate-400">
                  {unit}
                </span>
              )}
            </strong>
          </div>
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("gusts")}
            </span>
            <strong className="mt-0.5 block text-base tabular-nums text-slate-900">
              {isLoading && gusts === null ? "…" : gusts ?? "—"}
            </strong>
          </div>
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("direction")}
            </span>
            <strong className="mt-0.5 block text-base text-slate-900">
              {live
                ? `${windArrow(live.windDirection)} ${windDirectionLabel(live.windDirection)}`
                : "—"}
            </strong>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={cn(
              "truncate text-slate-400",
              error && !live && "text-red-600",
            )}
            aria-live="polite"
          >
            {status}
          </span>
          <Link
            href={`/spots/${spot.id}`}
            className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900"
          >
            {t("details")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FavoriteStationCard({
  station,
  useKnots,
  onRemoved,
}: {
  station: DashboardFavoriteStation;
  useKnots: boolean;
  onRemoved: () => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");
  const locale = useLocale();
  const { toggleStationFavorite } = useFavContext();
  const { data: live, isLoading } = useStationLive(station.id);
  const [removing, setRemoving] = useState(false);
  const windSpeedKmh = live?.windSpeedKmh ?? station.windSpeedKmh;
  const gustsKmh = live?.gustsKmh ?? station.gustsKmh;
  const direction = live?.windDirection ?? station.windDirection;
  const updatedAt = live?.updatedAt ?? station.updatedAt;
  const speed =
    windSpeedKmh === null
      ? null
      : Math.round(useKnots ? windSpeedKmh / 1.852 : windSpeedKmh);
  const gusts =
    gustsKmh === null
      ? null
      : Math.round(useKnots ? gustsKmh / 1.852 : gustsKmh);
  const unit = useKnots ? "kts" : "km/h";
  const measurementTime = updatedAt
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      }).format(new Date(updatedAt))
    : null;
  const networkLabel = NETWORK_LABELS[station.source] ?? station.source;

  const remove = async () => {
    if (removing) return;
    setRemoving(true);
    const result = await toggleStationFavorite(station.id);
    setRemoving(false);
    if (result === false) onRemoved();
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="relative flex h-28 items-end overflow-hidden bg-[linear-gradient(135deg,#e0f2fe,#f8fafc)] p-4 sm:h-32">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-sky-200/50 blur-2xl" />
        <RadioTower className="absolute left-4 top-4 h-7 w-7 text-sky-400" />
        <span className="relative rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
          {networkLabel}
        </span>
        <button
          type="button"
          onClick={remove}
          disabled={removing}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-amber-500 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-50"
          aria-label={t("removeStation")}
          title={t("removeStation")}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/stations/${encodeURIComponent(station.id)}`}
              className="text-base font-bold text-slate-950 hover:text-sky-700"
            >
              {station.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
              <RadioTower className="h-3 w-3 shrink-0" />
              {station.id}
              {station.altitudeM > 0
                ? ` · ${Math.round(station.altitudeM)} m`
                : ""}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold",
              live?.source === "station" && live.isFresh
                ? "bg-emerald-50 text-emerald-700"
                : windSpeedKmh !== null
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-500",
            )}
          >
            {live?.source === "station" && live.isFresh
              ? t("stationLive")
              : windSpeedKmh !== null
                ? t("stationCached")
                : t("stationUnavailable")}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 px-2 py-3">
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("wind")}
            </span>
            <strong className="mt-0.5 block text-base tabular-nums text-slate-900">
              {isLoading && speed === null ? "…" : speed ?? "—"}
              {speed !== null && (
                <span className="ml-1 text-[10px] font-medium text-slate-400">
                  {unit}
                </span>
              )}
            </strong>
          </div>
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("gusts")}
            </span>
            <strong className="mt-0.5 block text-base tabular-nums text-slate-900">
              {isLoading && gusts === null ? "…" : gusts ?? "—"}
            </strong>
          </div>
          <div className="px-2">
            <span className="block text-[10px] uppercase tracking-wide text-slate-400">
              {t("direction")}
            </span>
            <strong className="mt-0.5 block text-base text-slate-900">
              {direction !== null
                ? `${windArrow(direction)} ${windDirectionLabel(direction)}`
                : "—"}
            </strong>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-slate-400">
            {measurementTime
              ? t("stationMeasuredAt", { time: measurementTime })
              : t("stationUnavailable")}
          </span>
          <Link
            href={`/stations/${encodeURIComponent(station.id)}`}
            className="inline-flex shrink-0 items-center gap-1 font-semibold text-sky-700 hover:text-sky-900"
          >
            {t("stationDetails")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyFavorites() {
  const t = useTranslations("MonOpenwind.favorites");
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-12 text-center sm:py-16">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <Star className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{t("emptyTitle")}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {t("emptyDescription")}
      </p>
      <Link
        href="/?view=map"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
      >
        <Map className="h-4 w-4" />
        {t("explore")}
      </Link>
    </div>
  );
}

function ForecastSection({
  windows,
  useKnots,
}: {
  windows: Array<{ spot: DashboardFavoriteSpot; day: DashboardForecastDay }>;
  useKnots: boolean;
}) {
  const t = useTranslations("MonOpenwind.forecast");
  return (
    <section aria-labelledby="forecast-windows-heading">
      <SectionHeading
        id="forecast-windows-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/plan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            {t("openPlanner")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {windows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {t("emptyTitle")}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {windows.map(({ spot, day }) => (
            <ForecastWindowCard
              key={`${spot.id}-${day.date}`}
              spot={spot}
              day={day}
              useKnots={useKnots}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ForecastWindowCard({
  spot,
  day,
  useKnots,
}: {
  spot: DashboardFavoriteSpot;
  day: DashboardForecastDay;
  useKnots: boolean;
}) {
  const t = useTranslations("MonOpenwind.forecast");
  const locale = useLocale();
  const speed = useKnots
    ? Math.round(day.averageWindKmh / 1.852)
    : Math.round(day.averageWindKmh);
  const unit = useKnots ? "kts" : "km/h";
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(`${day.date}T12:00:00`));
  const scoreTone =
    day.score >= 70
      ? "bg-emerald-500"
      : day.score >= 50
        ? "bg-amber-400"
        : "bg-slate-300";

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-sky-700">
            {spot.name}
          </p>
          <p className="mt-0.5 capitalize text-xs text-slate-400">{date}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
          <span className={cn("h-2 w-2 rounded-full", scoreTone)} />
          {day.score}%
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <span className="text-2xl font-bold tabular-nums text-slate-950">
            {speed}
          </span>
          <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
          <p className="mt-0.5 text-[11px] text-slate-400">{t("averageWind")}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">
            {t("hours", { count: day.suitableHours })}
          </p>
          {day.bestHour && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {t("bestAround", {
                time: new Date(day.bestHour.time).toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ArticlesSection({ articles }: { articles: DashboardArticle[] }) {
  const t = useTranslations("MonOpenwind.articles");
  return (
    <section aria-labelledby="favorite-articles-heading">
      <SectionHeading
        id="favorite-articles-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/carnet"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            {t("all")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
          <BookOpen className="mx-auto mb-3 h-7 w-7 text-slate-300" />
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.path}
              className="group grid min-h-40 grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:grid-cols-[140px_minmax(0,1fr)]"
            >
              <div className="overflow-hidden bg-slate-100">
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Newspaper className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-600">
                  {article.location ?? article.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900 group-hover:text-sky-700">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                  {article.excerpt}
                </p>
                <p className="mt-auto flex items-center gap-1 pt-3 text-[11px] text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  {t("readTime", { count: article.readTime })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CommunitySection({
  items,
  spots,
}: {
  items: DashboardCommunityItem[];
  spots: DashboardFavoriteSpot[];
}) {
  const t = useTranslations("MonOpenwind.community");
  return (
    <section aria-labelledby="local-community-heading">
      <SectionHeading
        id="local-community-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            {t("forum")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {t("emptyTitle")}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {spots.length > 0 ? t("emptyFavorite") : t("emptyNoFavorite")}
              </p>
            </div>
          </div>
          <Link
            href="/forum"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:text-sky-700 sm:mt-0"
          >
            <Plus className="h-4 w-4" />
            {t("start")}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/forum/${item.categorySlug}/${item.id}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-50 text-sky-600">
                {item.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  {item.spotName ? `${item.spotName} · ` : ""}
                  {item.authorName} · {timeAgo(item.updatedAt)}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-400">
                <MessageCircle className="h-3.5 w-3.5" />
                {item.postCount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function QuickActions() {
  const t = useTranslations("MonOpenwind.actions");
  const actions = [
    { href: "/?view=map", icon: Map, label: t("map"), detail: t("mapDetail") },
    { href: "/plan", icon: Route, label: t("plan"), detail: t("planDetail") },
    { href: "/forum", icon: MessageCircle, label: t("share"), detail: t("shareDetail") },
    { href: "/carnet", icon: Newspaper, label: t("read"), detail: t("readDetail") },
  ];

  return (
    <section aria-labelledby="quick-actions-heading">
      <SectionHeading
        id="quick-actions-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ href, icon: Icon, label, detail }) => (
          <Link
            key={href}
            href={href}
            className="group flex min-h-24 items-center gap-4 rounded-2xl border border-slate-200 p-4 transition-all hover:border-sky-200 hover:bg-sky-50/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <strong className="block text-sm text-slate-900">{label}</strong>
              <span className="mt-0.5 block text-xs leading-4 text-slate-400">
                {detail}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DashboardSettings({
  preferences,
  spots,
  stations,
  onSelectionChange,
  onClose,
}: {
  preferences: AccountPreferences;
  spots: DashboardFavoriteSpot[];
  stations: DashboardFavoriteStation[];
  onSelectionChange: (choices: DashboardFavoriteChoice[]) => Promise<boolean>;
  onClose: () => void;
}) {
  const t = useTranslations("MonOpenwind.settings");
  const { updatePreferences } = useFavContext();
  const [defaultView, setDefaultView] = useState<DefaultView>(
    preferences.defaultView,
  );
  const [useKnots, setUseKnots] = useState(preferences.useKnots);
  const [sportFilter, setSportFilter] = useState<SportFilter>(
    preferences.sportFilter,
  );
  const [layout, setLayout] = useState<DashboardModule[]>(
    preferences.dashboardLayout,
  );
  const [favoriteSelection, setFavoriteSelection] = useState<string[]>(() =>
    [
      ...spots.map((item) => ({ key: `spot:${item.id}`, item })),
      ...stations.map((item) => ({ key: `station:${item.id}`, item })),
    ]
      .filter(({ item }) => item.dashboardSelected)
      .sort((a, b) => a.item.dashboardOrder - b.item.dashboardOrder)
      .map(({ key }) => key),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const focusFrame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const toggleModule = (module: DashboardModule) => {
    setSaved(false);
    setLayout((current) => {
      if (current.includes(module)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== module);
      }
      return [...current, module];
    });
  };

  const moveModule = (module: DashboardModule, direction: -1 | 1) => {
    setSaved(false);
    setLayout((current) => {
      const index = current.indexOf(module);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleFavoriteSelection = (key: string) => {
    setSaved(false);
    setFavoriteSelection((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= MAX_DASHBOARD_FAVORITES) return current;
      return [...current, key];
    });
  };

  const moveFavoriteSelection = (index: number, direction: -1 | 1) => {
    setSaved(false);
    setFavoriteSelection((current) => moveArrayItem(current, index, direction));
  };

  const save = async () => {
    setSaveError(false);
    setSaving(true);
    const choices = favoriteSelection.map((key): DashboardFavoriteChoice => {
      const [kind, ...idParts] = key.split(":");
      return {
        kind: kind === "station" ? "station" : "spot",
        id: idParts.join(":"),
      };
    });
    const [result, favoritesSaved] = await Promise.all([
      updatePreferences({
        defaultView,
        useKnots,
        sportFilter,
        dashboardLayout: layout,
      }),
      spots.length + stations.length > 0
        ? onSelectionChange(choices)
        : Promise.resolve(true),
    ]);
    setSaving(false);
    if (!result || !favoritesSaved) {
      setSaveError(true);
      return;
    }
    setSaved(true);
    trackEvent("mon_openwind_customized", {
      default_view: defaultView.toLowerCase(),
      module_count: layout.length,
      sport_filter: sportFilter.toLowerCase(),
    });
    window.setTimeout(onClose, 500);
  };

  const moduleLabels: Record<DashboardModule, string> = {
    FAVORITES: t("modules.favorites"),
    FORECAST: t("modules.forecast"),
    ARTICLES: t("modules.articles"),
    COMMUNITY: t("modules.community"),
    QUICK_ACTIONS: t("modules.actions"),
  };
  const orderedModules = [
    ...layout,
    ...DASHBOARD_MODULES.filter((module) => !layout.includes(module)),
  ];

  return (
    <div
      className="fixed inset-0 z-200 flex justify-end bg-slate-950/35 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-settings-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
              {t("eyebrow")}
            </p>
            <h2 id="dashboard-settings-title" className="text-xl font-bold text-slate-950">
              {t("title")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-6">
          <SettingsGroup
            icon={Star}
            title={t("favoritesTitle")}
            description={t("favoritesDescription")}
          >
            {spots.length + stations.length > 0 ? (
              <DashboardFavoriteSelector
                spots={spots}
                stations={stations}
                selectedKeys={favoriteSelection}
                onToggle={toggleFavoriteSelection}
                onMove={moveFavoriteSelection}
              />
            ) : (
              <Link
                href="/?view=map"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-slate-50"
              >
                <Map className="h-4 w-4" />
                {t("chooseOnMap")}
              </Link>
            )}
          </SettingsGroup>

          <SettingsGroup
            icon={Sparkles}
            title={t("startTitle")}
            description={t("startDescription")}
          >
            <div className="grid grid-cols-2 gap-2">
              {([
                ["DASHBOARD", LayoutDashboard, t("dashboard")],
                ["MAP", Map, t("map")],
              ] as const).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={defaultView === value}
                  onClick={() => {
                    setSaved(false);
                    setDefaultView(value);
                  }}
                  className={cn(
                    "relative rounded-xl border p-3 text-left text-sm font-semibold transition-colors",
                    defaultView === value
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <Icon className="mb-2 h-4 w-4" />
                  {label}
                  {defaultView === value && (
                    <Check className="absolute right-2.5 top-2.5 h-4 w-4 text-sky-600" />
                  )}
                </button>
              ))}
            </div>
          </SettingsGroup>

          <SettingsGroup
            icon={SlidersHorizontal}
            title={t("displayTitle")}
            description={t("displayDescription")}
          >
            <div className="space-y-2">
              {orderedModules.map((module) => {
                const active = layout.includes(module);
                const index = layout.indexOf(module);
                return (
                  <div
                    key={module}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2",
                      active
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 text-slate-400",
                    )}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleModule(module)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                          active
                            ? "border-sky-600 bg-sky-600 text-white"
                            : "border-slate-300 bg-white",
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="truncate">{moduleLabels[module]}</span>
                    </button>
                    {active && (
                      <div className="flex shrink-0">
                        <button
                          type="button"
                          onClick={() => moveModule(module, -1)}
                          disabled={index === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                          aria-label={t("moveUp")}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModule(module, 1)}
                          disabled={index === layout.length - 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                          aria-label={t("moveDown")}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SettingsGroup>

          <SettingsGroup
            icon={Compass}
            title={t("practiceTitle")}
            description={t("practiceDescription")}
          >
            <div className="grid grid-cols-3 gap-2">
              {(["ALL", "KITE", "PARAGLIDE"] as SportFilter[]).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sportFilter === value}
                    onClick={() => {
                      setSaved(false);
                      setSportFilter(value);
                    }}
                    className={cn(
                      "min-h-10 rounded-xl border px-2 py-2 text-xs font-semibold",
                      sportFilter === value
                        ? "border-sky-500 bg-sky-50 text-sky-800"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {value === "ALL"
                      ? t("allSports")
                      : value === "KITE"
                        ? t("kite")
                        : t("paraglide")}
                  </button>
                ),
              )}
            </div>
          </SettingsGroup>

          <SettingsGroup
            icon={Gauge}
            title={t("unitsTitle")}
            description={t("unitsDescription")}
          >
            <div className="grid grid-cols-2 gap-2">
              <UnitButton
                active={useKnots}
                label={t("knots")}
                detail="kts"
                onClick={() => {
                  setSaved(false);
                  setUseKnots(true);
                }}
              />
              <UnitButton
                active={!useKnots}
                label={t("kilometersPerHour")}
                detail="km/h"
                onClick={() => {
                  setSaved(false);
                  setUseKnots(false);
                }}
              />
            </div>
          </SettingsGroup>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          {saveError && (
            <p className="mb-2 text-center text-xs text-red-600">{t("error")}</p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={
              saving ||
              (spots.length + stations.length > 0 &&
                favoriteSelection.length === 0)
            }
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-60",
              saved ? "bg-emerald-600" : "bg-slate-950 hover:bg-sky-700",
            )}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> {t("saved")}
              </>
            ) : saving ? (
              t("saving")
            ) : (
              t("save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Settings2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function UnitButton({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border p-3 text-left",
        active
          ? "border-sky-500 bg-sky-50"
          : "border-slate-200 hover:bg-slate-50",
      )}
    >
      <strong className="block text-xs text-slate-800">{label}</strong>
      <span className="mt-0.5 block text-[11px] text-slate-400">{detail}</span>
      {active && (
        <Check className="absolute right-2.5 top-2.5 h-4 w-4 text-sky-600" />
      )}
    </button>
  );
}
