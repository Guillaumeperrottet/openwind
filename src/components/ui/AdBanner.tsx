"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";

interface BannerConfig {
  text: string;
  url: string;
  active: boolean;
  speedSec: number;
  paused: boolean;
}

export function AdBanner() {
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [copies, setCopies] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetch("/api/admin/banner")
      .then((r) => r.json())
      .then((data: BannerConfig) => {
        if (data.active && data.text) setBanner(data);
      })
      .catch(() => {});
  }, []);

  const calcCopies = useCallback(() => {
    if (!containerRef.current || !spanRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const spanW = spanRef.current.offsetWidth;
    if (spanW > 0) {
      // Need enough copies to fill 2x the screen (one set scrolling out, one scrolling in)
      setCopies(Math.ceil((containerW * 2) / spanW) + 1);
    }
  }, []);

  useEffect(() => {
    if (!banner) return;
    // Recalc after fonts load and on resize
    calcCopies();
    window.addEventListener("resize", calcCopies);
    return () => window.removeEventListener("resize", calcCopies);
  }, [banner, calcCopies]);

  if (!banner) return null;

  const marqueeStyle: CSSProperties = {
    animationDuration: `${banner.speedSec}s`,
    animationPlayState: banner.paused ? "paused" : "running",
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden bg-black/75 backdrop-blur-sm"
    >
      <a
        href={banner.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center h-7 whitespace-nowrap text-xs text-white/90 hover:text-white transition-colors"
      >
        {/* Hidden measuring span */}
        <span ref={spanRef} className="absolute invisible px-4">
          {banner.text} ·{" "}
        </span>
        {/* Two identical groups: one scrolls out, the other fills seamlessly */}
        <span className="inline-flex animate-marquee" style={marqueeStyle}>
          {Array.from({ length: copies }, (_, i) => (
            <span key={i} className="px-4">
              {banner.text} ·
            </span>
          ))}
        </span>
        <span
          className="inline-flex animate-marquee"
          style={marqueeStyle}
          aria-hidden
        >
          {Array.from({ length: copies }, (_, i) => (
            <span key={i} className="px-4">
              {banner.text} ·
            </span>
          ))}
        </span>
      </a>
    </div>
  );
}
