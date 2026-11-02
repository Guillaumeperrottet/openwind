"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localDate } from "@/lib/planner";
import { MAX_SAVED_SEARCHES, resolveSavedSearch, searchParams, type SavedSearch } from "@/lib/saved-searches";
import { useSavedSearches } from "@/lib/useSavedSearches";
import { trackEvent } from "@/lib/analytics";

export function SavedSearches() {
  const t = useTranslations("ReturnExperience");
  const locale = useLocale();
  const { searches, remove, save, error, ready } = useSavedSearches();
  const [removed, setRemoved] = useState<SavedSearch | null>(null);
  const [undoFailed, setUndoFailed] = useState(false);
  const section = useRef<HTMLElement>(null);
  const scrolled = useRef(false);
  useEffect(() => {
    if (!ready || scrolled.current || window.location.hash !== "#saved-searches") return;
    section.current?.scrollIntoView({ block: "start" });
    scrolled.current = true;
  }, [ready]);
  const today = localDate(new Date());
  const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
  return <section ref={section} id="saved-searches" className="scroll-mt-20" aria-labelledby="saved-searches-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="saved-searches-title" className="flex items-center gap-2 text-xl font-semibold text-slate-950"><Bookmark aria-hidden className="h-5 w-5 text-sky-800" />{t("savedSearches")}</h2><Link href="/plan" className="inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline underline-offset-4">{t("newSearch")}</Link></div>
    <p className="mb-4 mt-2 text-sm leading-6 text-slate-500">{t("deviceOnly")} {t("noMonitoring")}</p>
    {!ready ? <p role="status">{t("loading")}</p> : searches.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600">{t("noSavedSearches")}</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{searches.map((search) => {
      const resolved = resolveSavedSearch(search, today);
      const shifted = !resolved ? resolveSavedSearch(search, today, true) : null;
      const launch = resolved ?? shifted;
      return <article key={search.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2"><h3 className="break-words font-semibold text-slate-950">{search.title}</h3><button type="button" aria-label={t("removeSearch", { name: search.title })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100" onClick={() => { if (remove(search.id)) { setRemoved(search); setUndoFailed(false); } }}><Trash2 aria-hidden className="h-4 w-4" /></button></div>
        <p className="text-sm leading-6 text-slate-600">{search.place || t("allSpots")} · {t(search.criteria.sport)}{search.criteria.lat !== undefined ? ` · ${search.criteria.radius} km` : ""}</p>
        <p className="mt-2 text-sm text-slate-600">{search.period === "weekend" ? t("everyWeekend") : `${date(search.criteria.startDate)} – ${date(search.criteria.endDate)}`}</p>
        {search.period === "weekend" && resolved && <p className="mt-1 text-xs text-slate-500">{date(resolved.startDate)} – {date(resolved.endDate)}</p>}
        {!resolved && <p className="mt-3 text-sm leading-6 text-amber-900">{t("expiredSearch")}{shifted && <> {t("replacementDates", { start: date(shifted.startDate), end: date(shifted.endDate) })}</>}</p>}
        {launch ? <Link className="mt-4 inline-flex min-h-11 items-center self-start rounded-xl bg-sky-800 px-4 text-sm font-semibold text-white" href={`/plan?${searchParams(launch, search.place)}`} onClick={() => trackEvent("saved_search_opened", { period: search.period, shifted: !resolved, sport: search.criteria.sport })}>{resolved ? t("runSearch") : t("runFromToday")}</Link> : <Link href="/plan" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline">{t("chooseDates")}</Link>}
      </article>;
    })}</div>}
    {(error || removed) && <div role="status" className={`mt-3 text-sm ${error ? "text-amber-900" : "text-slate-600"}`}>{error ? t("storageError") : removed && <>{t("searchRemoved", { name: removed.title })} <button type="button" className="min-h-11 px-2 font-semibold text-sky-800 underline" onClick={() => { if (save(removed)) setRemoved(null); else setUndoFailed(true); }}>{t("undo")}</button></>}{undoFailed && <p>{t("searchLimit", { count: MAX_SAVED_SEARCHES })}</p>}</div>}
  </section>;
}
