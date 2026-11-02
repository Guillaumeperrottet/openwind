"use client";

import {
  useEffect,
  useState,
  useRef,
} from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

interface BannerConfig {
  text: string;
  url: string;
  active: boolean;
  speedSec: number;
  paused: boolean;
}

function getDestinationHost(url: string | undefined) {
  if (!url) return "unknown";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function AdBanner() {
  const app = useTranslations("AppDesign");
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    fetch("/api/admin/banner")
      .then((r) => r.json())
      .then((data: BannerConfig) => {
        if (data.active && data.text) setBanner(data);
      })
      .catch(() => {});
  }, []);

  const destinationHost = getDestinationHost(banner?.url);

  useEffect(() => {
    if (!banner || viewTrackedRef.current || !containerRef.current) return;

    const recordView = () => {
      if (viewTrackedRef.current) return;
      viewTrackedRef.current = true;
      trackEvent("sponsor_view", {
        sponsor: destinationHost,
        placement: "map_bottom",
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      recordView();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          recordView();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [banner, destinationHost]);

  if (!banner) return null;

  return (
    <div ref={containerRef} className="ow-partner">
      <span className="ow-partner-label">{app("partner")}</span>
      <a href={banner.url} target="_blank" rel="noopener noreferrer sponsored" title={banner.text}
        onClick={() =>
          trackEvent("sponsor_click", {
            sponsor: destinationHost,
            placement: "map_bottom",
          })
        }>
        <span className="ow-partner-copy">{banner.text}</span>
      </a>
    </div>
  );
}
