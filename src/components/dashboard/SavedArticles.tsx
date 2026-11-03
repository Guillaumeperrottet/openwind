"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useReadingLibrary } from "@/lib/useReadingLibrary";
import { readingIdentity, type ReadingArticle } from "@/lib/reading-library";

interface ResolvedArticle extends ReadingArticle { href: string; locale: string }
export function SavedArticles({ className = "" }: { className?: string }) {
  const t = useTranslations("ReadingExperience");
  const locale = useLocale();
  const { saved, ready, remove, restore, error, scope } = useReadingLibrary();
  const [result, setResult] = useState<{ key: string; articles: ResolvedArticle[]; failed: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const [removed, setRemoved] = useState<{ scope: string; article: ReadingArticle } | null>(null);
  const [undoFailed, setUndoFailed] = useState(false);
  const section = useRef<HTMLElement>(null);
  const scrolled = useRef(false);
  const entries = saved.map(readingIdentity).join(",");
  const key = `${scope}:${locale}:${entries}`;
  useEffect(() => {
    if (!ready || !entries) return;
    const controller = new AbortController();
    fetch(`/api/carnet/reading?${new URLSearchParams({ entries, locale })}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Catalogue unavailable"); const data = await response.json(); if (!Array.isArray(data.articles)) throw new Error("Invalid catalogue"); return data; })
      .then((data) => { if (!controller.signal.aborted) setResult({ key, articles: data.articles, failed: false }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ key, articles: [], failed: true }); });
    return () => controller.abort();
  }, [key, entries, locale, ready, retry]);
  useEffect(() => {
    if (!ready || !saved.length || scrolled.current || window.location.hash !== "#saved-articles") return;
    section.current?.scrollIntoView({ block: "start" }); scrolled.current = true;
  }, [ready, saved.length]);
  const undo = removed?.scope === scope ? removed.article : null;
  if (!ready || (!saved.length && !undo && !error)) return null;
  const current = result?.key === key ? result : null;
  return <section id="saved-articles" ref={section} className={`scroll-mt-20 ${className}`} aria-labelledby="saved-articles-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="saved-articles-title" className="flex items-center gap-2 text-xl font-semibold text-slate-950"><Bookmark aria-hidden className="h-5 w-5 text-sky-800" />{t("myReading")}</h2><Link locale="fr" href="/carnet" className="inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline underline-offset-4">{t("explore")}</Link></div>
    <p className="mb-4 mt-2 text-sm text-slate-600">{t("deviceOnly")}</p>
    {saved.length > 0 && !current && <p role="status" className="text-sm text-slate-600">{t("loading")}</p>}
    {current?.failed && <p role="status" className="mb-4 text-sm text-amber-900">{t("catalogueError")} <button type="button" className="min-h-11 px-2 underline" onClick={() => setRetry((n) => n + 1)}>{t("retry")}</button></p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{saved.map((article) => {
      const resolved = current?.articles.find((item) => readingIdentity(item) === readingIdentity(article));
      return <article key={readingIdentity(article)} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-6 text-slate-950">{resolved?.title ?? article.title}</h3><button type="button" aria-label={t("removeNamed", { title: resolved?.title ?? article.title })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => { if (remove(article)) { setRemoved({ scope, article }); setUndoFailed(false); } }}><Trash2 aria-hidden className="h-4 w-4" /></button></div>
        <p className="mt-2 text-sm text-slate-600">{resolved?.readTime ?? article.readTime} min</p>
        {resolved ? <Link href={resolved.href} locale={resolved.locale} className="mt-4 inline-flex min-h-11 items-center self-start font-semibold text-sky-800 underline underline-offset-4">{t("read")}</Link> : current && !current.failed ? <p className="mt-3 text-sm text-slate-600">{t("unavailable")}</p> : null}
      </article>;
    })}</div>
    {(error || undo) && <div role="status" className="mt-3 text-sm text-slate-600">{error ? t("error") : undo && <>{t("removed")} <button type="button" className="min-h-11 px-2 text-sky-800 underline" onClick={() => { if (restore(undo)) setRemoved(null); else setUndoFailed(true); }}>{t("undo")}</button></>}{undoFailed && <p>{t("restoreError")}</p>}</div>}
  </section>;
}
