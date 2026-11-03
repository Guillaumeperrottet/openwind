"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { ArticleHeading } from "@/lib/article-headings";
import { useReadingLibrary } from "@/lib/useReadingLibrary";
import { readingIdentity, type ReadingArticle, type ReadingPosition } from "@/lib/reading-library";

export function ArticleReadingProgress({ article, revision, headings, contentId = "article-content", endId = "article-reading-end" }: { article: ReadingArticle; revision: string; headings: ArticleHeading[]; contentId?: string; endId?: string }) {
  const { positions, ready, scope, savePosition } = useReadingLibrary();
  useEffect(() => {
    if (!ready || !headings.length) return;
    const content = document.getElementById(contentId);
    const nodes = headings.flatMap((heading) => { const node = document.getElementById(heading.id); return node && content?.contains(node) ? [{ node, heading }] : []; });
    let frame = 0, timer: ReturnType<typeof setTimeout> | undefined;
    let current: ReadingPosition | null | undefined;
    const flush = () => { if (current !== undefined) savePosition(current, article); };
    const measure = () => {
      frame = 0;
      const end = document.getElementById(endId);
      if (end && end.getBoundingClientRect().top < window.innerHeight - 80) current = null;
      else {
        const active = nodes.filter(({ node }) => node.getBoundingClientRect().top <= 130).at(-1);
        if (!active) return;
        current = { kind: article.kind, slug: article.slug, revision, heading: active.heading.id, title: active.heading.title };
      }
      clearTimeout(timer); timer = setTimeout(flush, 500);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    // No initial measurement: merely opening an article must not overwrite a previous reading.
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); flush(); window.removeEventListener("scroll", onScroll); window.removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", onVisibility); };
  }, [ready, savePosition, article.kind, article.slug, revision, headings, contentId, endId, article]);
  const previous = positions.find((p) => readingIdentity(p) === readingIdentity(article) && p.revision === revision && headings.some((h) => h.id === p.heading));
  return ready ? <ResumeReading key={`${scope}:${article.kind}:${article.slug}:${revision}`} initial={previous} /> : null;
}
function ResumeReading({ initial }: { initial?: ReadingPosition }) {
  const t = useTranslations("ReadingExperience");
  const [position, setPosition] = useState(initial);
  if (!position) return null;
  return <div className="mt-3 border-l-2 border-sky-700 pl-4 text-sm text-slate-700"><p>{t("lastReading", { section: position.title })}</p><a href={`#${position.heading}`} onClick={() => setPosition(undefined)} className="inline-flex min-h-11 items-center font-semibold text-sky-800 underline underline-offset-4">{t("resume")}</a></div>;
}
