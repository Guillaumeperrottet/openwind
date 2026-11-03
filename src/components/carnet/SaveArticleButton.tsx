"use client";
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useReadingLibrary } from "@/lib/useReadingLibrary";
import { MAX_SAVED_ARTICLES, readingIdentity, type ReadingArticle } from "@/lib/reading-library";
import { Link } from "@/i18n/navigation";

export function SaveArticleButton({ article, compact = false }: { article: ReadingArticle; compact?: boolean }) {
  const t = useTranslations("ReadingExperience");
  const { saved, toggle, ready } = useReadingLibrary();
  const selected = saved.some((s) => readingIdentity(s) === readingIdentity(article));
  const [notice, setNotice] = useState<"saved" | "removed" | "limit" | "error" | null>(null);
  const Icon = selected ? BookmarkCheck : Bookmark;
  return <div className={compact ? "flex max-w-full flex-col items-end" : "flex flex-wrap items-center gap-x-4 gap-y-1"}>
    <button type="button" disabled={!ready} aria-pressed={selected} aria-label={t(selected ? "removeNamed" : "saveNamed", { title: article.title })} onClick={() => setNotice(toggle(article))} className={compact ? "flex h-11 w-11 items-center justify-center rounded-lg text-sky-800 hover:bg-sky-50 disabled:opacity-50" : "inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-sky-800 hover:bg-sky-50 disabled:opacity-50"}>
      <Icon aria-hidden className="h-4 w-4" />{!compact && t(selected ? "savedButton" : "saveButton")}
    </button>
    {!compact && selected && <Link href="/mon-openwind#saved-articles" className="inline-flex min-h-11 items-center text-sm text-sky-800 underline underline-offset-4">{t("myReading")}</Link>}
    {notice && <p role="status" className={compact && notice !== "error" && notice !== "limit" ? "sr-only" : "basis-full text-sm leading-6 text-slate-600"}>{t(notice, { count: MAX_SAVED_ARTICLES })}</p>}
  </div>;
}
