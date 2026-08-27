"use client";

import { useEffect, useMemo, useState } from "react";
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
  DashboardForecastDay,
  MonOpenwindData,
} from "@/components/dashboard/types";

interface Props {
  initialData: MonOpenwindData;
}

export function MonOpenwindClient({ initialData }: Props) {
  const t = useTranslations("MonOpenwind");
  const { preferences: contextPreferences } = useFavContext();
  const preferences = contextPreferences ?? initialData.preferences;
  const [favoriteSpots, setFavoriteSpots] = useState(initialData.favoriteSpots);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    trackEvent("mon_openwind_viewed", {
      favorite_count: favoriteSpots.length,
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

  const visibleSpotIds = useMemo(
    () => new Set(visibleSpots.map((spot) => spot.id)),
    [visibleSpots],
  );

  const articles = initialData.articles.filter((article) =>
    article.linkedSpotIds.some((id) => visibleSpotIds.has(id)),
  );
  const community = initialData.community.filter(
    (item) => item.spotId === null || visibleSpotIds.has(item.spotId),
  );

  const windows = useMemo(
    () =>
      visibleSpots
        .flatMap((spot) =>
          spot.forecastDays.map((day) => ({ spot, day })),
        )
        .filter(({ day }) => day.score >= 35)
        .sort((a, b) => b.day.score - a.day.score)
        .slice(0, 6),
    [visibleSpots],
  );

  const promisingCount = windows.filter(({ day }) => day.score >= 60).length;
  const firstName = initialData.userName?.trim().split(/\s+/)[0] ?? null;
  const bestWindow = windows[0] ?? null;

  const moduleContent: Record<DashboardModule, React.ReactNode> = {
    FAVORITES: (
      <FavoritesSection
        spots={visibleSpots}
        useKnots={preferences.useKnots}
        onRemoved={(spotId) =>
          setFavoriteSpots((current) =>
            current.filter((spot) => spot.id !== spotId),
          )
        }
      />
    ),
    FORECAST: (
      <ForecastSection windows={windows} useKnots={preferences.useKnots} />
    ),
    ARTICLES: <ArticlesSection articles={articles} />,
    COMMUNITY: <CommunitySection items={community} spots={visibleSpots} />,
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
              favoriteCount={visibleSpots.length}
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
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">
          {eyebrow}
        </p>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
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
  spots,
  useKnots,
  onRemoved,
}: {
  spots: DashboardFavoriteSpot[];
  useKnots: boolean;
  onRemoved: (spotId: string) => void;
}) {
  const t = useTranslations("MonOpenwind.favorites");
  return (
    <section aria-labelledby="favorite-spots-heading">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/?view=map"
            className="hidden items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 sm:inline-flex"
          >
            {t("manage")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {spots.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spots.map((spot) => (
            <FavoriteSpotCard
              key={spot.id}
              spot={spot}
              useKnots={useKnots}
              onRemoved={() => onRemoved(spot.id)}
            />
          ))}
        </div>
      )}
    </section>
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
  const { toggleFavorite } = useFavContext();
  const { data: live, isLoading } = useSpotLive(spot.id);
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
  const suitable = live
    ? spot.sportType === "PARAGLIDE"
      ? live.windSpeedKmh <= 15
      : live.windSpeedKmh >= spot.minWindKmh &&
        live.windSpeedKmh <= spot.maxWindKmh
    : false;

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
                suitable
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {suitable ? t("favorable") : t("watch")}
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
          <span className="text-slate-400">
            {live?.isFresh ? t("live") : t("estimated")}
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
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/plan"
            className="hidden items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 sm:inline-flex"
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
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/carnet"
            className="hidden items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 sm:inline-flex"
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
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/forum"
            className="hidden items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 sm:inline-flex"
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
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
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
  onClose,
}: {
  preferences: AccountPreferences;
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
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

  const save = async () => {
    setSaveError(false);
    setSaving(true);
    const result = await updatePreferences({
      defaultView,
      useKnots,
      sportFilter,
      dashboardLayout: layout,
    });
    setSaving(false);
    if (!result) {
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
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
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
            disabled={saving}
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
