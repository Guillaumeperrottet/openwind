"use client";

import { useEffect, useId, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { windPaletteGradient, windPaletteLegend } from "@/lib/windPalette";

interface MapLegendProps {
  useKnots: boolean;
  setUseKnots: (v: boolean) => void;
  legendOpen: boolean;
  setLegendOpen: (v: boolean) => void;
  pickMode: boolean;
  windOverlayActive?: boolean;
}

export function MapLegend({ useKnots, setUseKnots, legendOpen, setLegendOpen, pickMode, windOverlayActive = false }: MapLegendProps) {
  const tCommon = useTranslations("Common");
  const app = useTranslations("AppDesign");
  const entries = windPaletteLegend(useKnots);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!legendOpen) {
      if (wasOpen.current && document.activeElement === document.body) trigger.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setLegendOpen(false);
      trigger.current?.focus();
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setLegendOpen(false);
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", escape); document.removeEventListener("pointerdown", outside); };
  }, [legendOpen, setLegendOpen]);

  return <div ref={root} className={`ow-legend ${pickMode ? "hidden lg:block" : ""}`}>
    {legendOpen && <div id={id} className="ow-legend-panel" role="group" aria-label={app("legend")}>
      <div className="ow-legend-heading"><strong>{tCommon("wind")}</strong><button type="button" className="ow-icon-button" aria-label={app("closeLegend")} onClick={() => setLegendOpen(false)}><X aria-hidden className="h-4 w-4" /></button></div>
      <div className="ow-unit-control" role="group" aria-label={app("units")}>
        <button type="button" aria-pressed={!useKnots} onClick={() => setUseKnots(false)}>km/h</button>
        <button type="button" aria-pressed={useKnots} onClick={() => setUseKnots(true)}>kts</button>
      </div>
      {windOverlayActive ? <div className="mt-4">
        <div className="h-3 rounded" style={{ background: windPaletteGradient() }} />
        <div className="mt-2 flex justify-between tabular-nums">{[0, 10, 20, 30, 40, 50].map((knots) => <span key={knots}>{useKnots ? knots : Math.round(knots * 1.852)}</span>)}</div>
        <p className="mt-3 leading-relaxed">{tCommon("windOverlayLegendHint")}</p>
      </div> : <div className="mt-3">{entries.map(({ range, color }, i) => <div key={i} className="ow-legend-range"><span aria-hidden className="ow-legend-swatch" style={{ background: color }} />{range}</div>)}</div>}
    </div>}
    <button ref={trigger} type="button" onClick={() => setLegendOpen(!legendOpen)} className="ow-legend-toggle" aria-label={app("openLegend")} aria-expanded={legendOpen} aria-controls={id}>
      <span>{tCommon("wind")} ({useKnots ? "kts" : "km/h"})</span><ChevronDown aria-hidden className={`h-4 w-4 ${legendOpen ? "rotate-180" : ""}`} />
    </button>
  </div>;
}
