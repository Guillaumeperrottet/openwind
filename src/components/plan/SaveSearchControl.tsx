"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSavedSearches } from "@/lib/useSavedSearches";
import { MAX_SAVED_SEARCHES, type SearchPeriod } from "@/lib/saved-searches";
import type { PlannerCriteria } from "@/lib/planner";

const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700";
export function SaveSearchControl({ criteria, place }: { criteria: PlannerCriteria; place: string }) {
  const t = useTranslations("ReturnExperience");
  const { save, error, ready, searches } = useSavedSearches();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState<SearchPeriod>("fixed");
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const id = useId();
  const savedLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => { if (saved) savedLink.current?.focus(); }, [saved]);
  return <div className={`my-5 ${open ? "rounded-2xl border border-slate-200 bg-white p-4" : "border-y border-slate-200 py-3"}`}>
    {!open ? <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" className={`${button} text-sky-900`} disabled={!ready} aria-expanded={false} onClick={() => { setOpen(true); setSaved(false); setFailed(false); }}><Bookmark aria-hidden className="h-4 w-4" />{t("saveSearch")}</button>
      <span className="text-xs text-slate-500">{t("deviceOnly")}</span>
    </div> : <form onSubmit={(event) => {
      event.preventDefault();
      const ok = save({ id: crypto.randomUUID(), title: (title.trim() || place || t("allSpots")).slice(0, 80), place: place.slice(0, 120), period, criteria });
      setFailed(!ok);
      if (ok) { setOpen(false); setSaved(true); }
    }}>
      <h3 className="font-semibold text-slate-950">{t("saveSearch")}</h3>
      <label htmlFor={`${id}-title`} className="mt-3 block text-sm text-slate-700">{t("searchName")}</label>
      <input id={`${id}-title`} autoFocus maxLength={80} value={title} placeholder={place || t("allSpots")} onChange={(e) => setTitle(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-base" />
      <fieldset className="mt-4 space-y-3 text-sm text-slate-700"><legend className="mb-2 font-medium">{t("dateChoice")}</legend>
        <label className="flex min-h-11 items-center gap-3"><input type="radio" name={`${id}-period`} checked={period === "fixed"} onChange={() => setPeriod("fixed")} />{t("fixedDates")}</label>
        <label className="flex min-h-11 items-center gap-3"><input type="radio" name={`${id}-period`} checked={period === "weekend"} onChange={() => setPeriod("weekend")} />{t("everyWeekend")}</label>
      </fieldset>
      <p className="mt-2 text-xs leading-5 text-slate-500">{t("deviceOnly")} {t("noMonitoring")}</p>
      <div className="mt-4 flex flex-wrap gap-3"><button className={`${button} border-sky-800 bg-sky-800 text-white`} type="submit">{t("save")}</button><button className={button} type="button" onClick={() => setOpen(false)}>{t("cancel")}</button></div>
      {failed && <p role="status" className="mt-3 text-sm text-amber-900">{error ? t("storageError") : t("searchLimit", { count: MAX_SAVED_SEARCHES })}{searches.length >= MAX_SAVED_SEARCHES && <> <Link href="/mon-openwind#saved-searches" className="underline">{t("manageSearches")}</Link></>}</p>}
    </form>}
    {saved && <p role="status" className="mt-3 text-sm text-sky-900">{t("searchSaved")} <Link ref={savedLink} className="inline-flex min-h-11 items-center underline underline-offset-4" href="/mon-openwind#saved-searches">{t("manageSearches")}</Link></p>}
  </div>;
}
