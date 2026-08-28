"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface ArticleReadTrackerProps {
  articleSlug: string;
  contentType: "carnet_article" | "local_guide";
}

/** Records one meaningful read when the visitor reaches the end of the article. */
export function ArticleReadTracker({
  articleSlug,
  contentType,
}: ArticleReadTrackerProps) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || trackedRef.current) return;
        trackedRef.current = true;
        trackEvent("article_read_complete", {
          article_slug: articleSlug,
          content_type: contentType,
        });
        observer.disconnect();
      },
      { threshold: 1 },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [articleSlug, contentType]);

  return <span ref={markerRef} aria-hidden className="block h-px w-full" />;
}
