"use client";

import { useEffect, useState } from "react";
import { Star, ArrowRight, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useFavContext } from "@/lib/FavContext";
import { useWindUnits } from "@/lib/useWindUnits";
import { useSpotLive } from "@/lib/useSpotLive";
import { useStationLive } from "@/lib/useStationLive";
import { WindProvenance } from "@/components/spot/WindProvenance";
import type { SportFilter } from "@/lib/user-preferences";

type Catalogue = {
  spots: { id: string; name: string; sportType: "KITE" | "PARAGLIDE"; region: string | null }[];
  stations: { id: string; name: string }[];
};
const button = "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";

export function GuestOpenwind() {
  const t = useTranslations("PersonalExperience");
  const nav = useTranslations("Navbar");
  const { user, authLoading, favoriteSpotIds, favoriteStationIds, favoritesReady, requestSignup, requestAuth, preferences, updatePreferences, retryFavorites } = useFavContext();
  const { useKnots, setUseKnots } = useWindUnits();
  const router = useRouter();
  const [catalogue, setCatalogue] = useState<Catalogue>({ spots: [], stations: [] });
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState("");
  const key = new URLSearchParams({ spots: [...favoriteSpotIds].join(","), stations: [...favoriteStationIds].join(",") }).toString();
  const count = favoriteSpotIds.size + favoriteStationIds.size;

  // This component was rendered for a guest on the server. Refresh after import
  // completes so the authenticated dashboard includes the newly merged favorites.
  useEffect(() => {
    if (user && favoritesReady) router.refresh();
  }, [user, favoritesReady, router]);

  useEffect(() => {
    if (!count || user) return;
    const controller = new AbortController();
    fetch(`/api/favorites/preview?${key}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Catalogue unavailable");
        const data: Catalogue = await res.json();
        if (!controller.signal.aborted) { setCatalogue(data); setError(false); setLoaded(key); }
      })
      .catch(() => { if (!controller.signal.aborted) { setError(true); setLoaded(key); } });
    return () => controller.abort();
  }, [key, count, user, retry]);

  if (authLoading || user) return <div className="px-5 py-20 text-center" role="status">{t("loading")}{user && <button className={`${button} ml-3`} onClick={retryFavorites}>{t("retry")}</button>}</div>;
  const sport = preferences?.sportFilter ?? "ALL";
  const spots = [...favoriteSpotIds].filter((id) => {
    const spot = catalogue.spots.find((s) => s.id === id);
    return sport === "ALL" || !spot || spot.sportType === sport;
  });

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-slate-50 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-800">{t("onDevice")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{nav("myOpenwind")}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{count ? t("guestIntro") : t("emptyIntro")}</p>

        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label={t("sport")} className="flex flex-wrap gap-2">
            {(["ALL", "KITE", "PARAGLIDE"] as SportFilter[]).map((s) => <button key={s} className={`${button} ${sport === s ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`} aria-pressed={sport === s} onClick={() => void updatePreferences({ sportFilter: s })}>{t(s)}</button>)}
          </div>
          <div role="group" aria-label={t("units")} className="flex gap-2">
            {[true, false].map((knots) => <button key={String(knots)} className={`${button} ${useKnots === knots ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`} aria-pressed={useKnots === knots} onClick={() => setUseKnots(knots)}>{knots ? "kts" : "km/h"}</button>)}
          </div>
        </div>
        {count === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><Star aria-hidden className="mx-auto mb-4 h-8 w-8 text-sky-700" /><p className="text-slate-600">{t("firstFavorite")}</p><Link className={`${button} mt-5 gap-2 bg-slate-900 text-white`} href="/?view=map">{t("explore")}<ArrowRight aria-hidden className="h-4 w-4" /></Link></div> : <>
          {error && <p role="status" className="mb-4 text-sm text-amber-800">{t("catalogueError")} <button className="min-h-11 underline" onClick={() => setRetry((v) => v + 1)}>{t("retry")}</button></p>}
          {loaded !== key && <p role="status" className="mb-4 text-sm text-slate-600">{t("loading")}</p>}
          {!spots.length && !favoriteStationIds.size && <p role="status" className="py-6 text-slate-600">{t("sportEmpty")}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((id) => <LocalFavorite key={`spot:${id}`} id={id} kind="spot" name={catalogue.spots.find((s) => s.id === id)?.name} />)}
            {[...favoriteStationIds].map((id) => <LocalFavorite key={`station:${id}`} id={id} kind="station" name={catalogue.stations.find((s) => s.id === id)?.name} />)}
          </div>
        </>}
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5" aria-label={t("sync")}>
          <p className="max-w-xl text-sm leading-6 text-slate-600">{t("syncDescription")}</p>
          <div className="flex flex-wrap gap-3">
            <button className={`${button} border-sky-800 bg-sky-800 text-white`} onClick={requestSignup}>{t("sync")}</button>
            <button className={button} onClick={requestAuth}>{t("login")}</button>
          </div>
        </section>
        <p className="mt-8 flex items-start gap-2 text-xs leading-6 text-slate-500"><Settings2 aria-hidden className="mt-1 h-4 w-4 shrink-0" />{t("preferencesHelp")}</p>
      </div>
    </div>
  );
}

function LocalFavorite({ id, kind, name }: { id: string; kind: "spot" | "station"; name?: string }) {
  const t = useTranslations("PersonalExperience");
  const { toggleFavorite, toggleStationFavorite } = useFavContext();
  const { useKnots } = useWindUnits();
  const spot = useSpotLive(kind === "spot" ? id : null);
  const station = useStationLive(kind === "station" ? id : null);
  const { data, isLoading } = kind === "spot" ? spot : station;
  const speed = (value: number) => Math.round(useKnots ? value / 1.852 : value);
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><Link className="text-lg font-semibold text-slate-950 hover:text-sky-800 hover:underline" href={kind === "spot" ? `/spots/${id}` : `/stations/${encodeURIComponent(id)}`}>{name ?? t(kind)}</Link><button aria-label={t("removeFavorite")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-amber-600 hover:bg-amber-50" onClick={() => void (kind === "spot" ? toggleFavorite(id) : toggleStationFavorite(id))}><Star aria-hidden className="h-5 w-5 fill-current" /></button></div>
    {data ? <><p className="my-4 text-3xl font-semibold tabular-nums text-slate-950">{speed(data.windSpeedKmh)} <span className="text-sm text-slate-500">{useKnots ? "kts" : "km/h"}</span></p><p className="mb-3 text-sm text-slate-600">{t("gusts")} {speed(data.gustsKmh)} {useKnots ? "kts" : "km/h"}</p><WindProvenance compact live={data} /></> : <p className="py-6 text-sm text-slate-500">{isLoading ? t("loading") : t("unavailable")}</p>}
  </article>;
}
