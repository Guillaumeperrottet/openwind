"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useFavContext } from "@/lib/favorite-context";
import { useSpotLive } from "@/lib/useSpotLive";
import { useStationLive } from "@/lib/useStationLive";
import { useWindUnits } from "@/lib/useWindUnits";
import { windChange, windSnapshot, type WindSnapshot } from "@/lib/personal-summary";
import { WindProvenance } from "@/components/spot/WindProvenance";
import { usePersonalForecast } from "@/lib/usePersonalForecast";

export interface BriefFavorite { id: string; name: string; kind: "spot" | "station"; }
export function PersonalBrief({ favorites, spotIds, manageFavorites = false }: { favorites: BriefFavorite[]; spotIds: string[]; manageFavorites?: boolean }) {
  const t = useTranslations("ReturnExperience");
  const { windows, isLoading, error, hasSpots } = usePersonalForecast(spotIds);
  const [expanded, setExpanded] = useState(false);
  if (!favorites.length) return null;
  return <section aria-labelledby="personal-brief-title" className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 sm:p-6">
    <h2 id="personal-brief-title" className="text-xl font-semibold text-slate-950">{t("briefTitle")}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t("briefHelp")}</p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-3">{(expanded ? favorites : favorites.slice(0, 3)).map((favorite) => <BriefObservation key={`${favorite.kind}:${favorite.id}`} favorite={favorite} manageable={manageFavorites} />)}</ul>
    {favorites.length > 3 && <button className="mt-3 min-h-11 text-sm font-semibold text-sky-900 underline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{t(expanded ? "fewerFavorites" : "allFavorites", { count: favorites.length })}</button>}
    {hasSpots && <p className="mt-4 text-sm leading-6 text-slate-700">{isLoading ? t("forecastLoading") : error ? t("forecastError") : windows.length ? <Link href="#personal-forecast" className="inline-flex min-h-11 items-center font-semibold text-sky-900 underline underline-offset-4">{t("windowsFound", { count: windows.length })}</Link> : t("noWindowsBrief")}</p>}
  </section>;
}

function BriefObservation({ favorite, manageable }: { favorite: BriefFavorite; manageable: boolean }) {
  const t = useTranslations("ReturnExperience");
  const locale = useLocale();
  const { user, authLoading, toggleFavorite, toggleStationFavorite } = useFavContext();
  const { useKnots } = useWindUnits();
  const spot = useSpotLive(favorite.kind === "spot" ? favorite.id : null);
  const station = useStationLive(favorite.kind === "station" ? favorite.id : null);
  const { data: live, isLoading } = favorite.kind === "spot" ? spot : station;
  const snapshot = windSnapshot(live);
  const key = `openwind-visit:v1:${user?.id ?? "guest"}:${favorite.kind}:${favorite.id}`;
  const baseline = useRef<{ key: string; value: WindSnapshot | null } | null>(null);
  const [change, setChange] = useState<{ key: string; delta: number | null; at: number | null; sample: number | null }>({ key, delta: null, at: null, sample: null });
  const source = snapshot?.source, stationId = snapshot?.stationId, at = snapshot?.at, wind = snapshot?.wind;
  useEffect(() => {
    if (authLoading || source === undefined || at === undefined || wind === undefined) return;
    try {
      if (baseline.current?.key !== key) {
        const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
        baseline.current = { key, value: parsed && typeof parsed === "object" ? parsed : null };
      }
      const current = { source, stationId: stationId ?? null, at, wind };
      const previous = baseline.current.value;
      const delta = windChange(previous, current);
      queueMicrotask(() => setChange({ key, delta, at: previous?.at ?? null, sample: at }));
      localStorage.setItem(key, JSON.stringify(current));
    } catch { /* The brief remains useful when browser storage is unavailable. */ }
  }, [key, authLoading, source, stationId, at, wind]);
  const delta = change.key === key && snapshot && change.sample === snapshot.at ? change.delta : null;
  const speed = (value: number) => Math.round(value / (useKnots ? 1.852 : 1));
  return <li className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-2"><Link href={favorite.kind === "spot" ? `/spots/${favorite.id}` : `/stations/${encodeURIComponent(favorite.id)}`} className="font-semibold text-slate-950 hover:underline">{favorite.name}</Link>{manageable && <button type="button" aria-label={t("removeFavorite", { name: favorite.name })} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-amber-600 hover:bg-amber-50" onClick={() => void (favorite.kind === "spot" ? toggleFavorite(favorite.id) : toggleStationFavorite(favorite.id))}><Star aria-hidden className="h-4 w-4 fill-current" /></button>}</div>
    {live ? <><p className="mt-2 text-lg font-semibold text-slate-900">{speed(live.windSpeedKmh)} {useKnots ? "kts" : "km/h"}</p><p className="mb-2 text-xs text-slate-600">{t("gusts")} {speed(live.gustsKmh)} {useKnots ? "kts" : "km/h"}</p><WindProvenance compact live={live} />
      {delta !== null && change.at !== null ? <p className="mt-3 text-xs leading-5 text-sky-900">{t(delta > 0 ? "windIncreased" : "windDecreased", { value: Math.abs(speed(delta)), unit: useKnots ? "kts" : "km/h", time: new Intl.DateTimeFormat(locale, { timeZone: "Europe/Zurich", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(change.at) })}</p> : <p className="mt-3 text-xs leading-5 text-slate-500">{t("latestOnly")}</p>}</> : <p role="status" className="mt-2 text-sm text-slate-500">{isLoading ? t("loading") : t("observationUnavailable")}</p>}
  </li>;
}
