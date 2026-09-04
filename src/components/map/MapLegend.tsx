"use client";

import { useTranslations } from "next-intl";
import { windPaletteGradient, windSpeedColor } from "@/lib/windField";

type WindCondKey =
  | "calm"
  | "light"
  | "gentle"
  | "good"
  | "strong"
  | "veryStrong";

type LegendEntry = {
  range: string;
  condKey: WindCondKey | null;
  color: string;
};

const LEGEND_KTS: LegendEntry[] = [
  { range: "< 4", condKey: null, color: colorCss(2) },
  { range: "4-8", condKey: "calm", color: colorCss(6) },
  { range: "8-12", condKey: "light", color: colorCss(10) },
  { range: "12-16", condKey: "gentle", color: colorCss(14) },
  { range: "16-21", condKey: "good", color: colorCss(18) },
  { range: "21-27", condKey: "strong", color: colorCss(24) },
  { range: "> 27", condKey: "veryStrong", color: colorCss(33) },
];

const LEGEND_KMH: LegendEntry[] = [
  { range: "< 8", condKey: null, color: colorCss(2) },
  { range: "8-15", condKey: "calm", color: colorCss(6) },
  { range: "15-22", condKey: "light", color: colorCss(10) },
  { range: "22-30", condKey: "gentle", color: colorCss(14) },
  { range: "30-38", condKey: "good", color: colorCss(18) },
  { range: "38-50", condKey: "strong", color: colorCss(24) },
  { range: "> 50", condKey: "veryStrong", color: colorCss(33) },
];

interface MapLegendProps {
  useKnots: boolean;
  setUseKnots: (v: boolean) => void;
  legendOpen: boolean;
  setLegendOpen: (v: boolean) => void;
  pickMode: boolean;
  windOverlayActive?: boolean;
}

function colorCss(knots: number): string {
  const [red, green, blue] = windSpeedColor(knots * 1.852);
  return `rgb(${red} ${green} ${blue})`;
}

export function MapLegend({
  useKnots,
  setUseKnots,
  legendOpen,
  setLegendOpen,
  pickMode,
  windOverlayActive = false,
}: MapLegendProps) {
  const tCond = useTranslations("WindConditions");
  const tCommon = useTranslations("Common");
  const entries = useKnots ? LEGEND_KTS : LEGEND_KMH;

  return (
    <div
      className={`absolute bottom-8 right-4 z-10 ${pickMode ? "hidden lg:block" : ""}`}
    >
      {legendOpen ? (
        <div className="rounded-xl bg-white/90 backdrop-blur p-3 border border-gray-200 text-xs text-gray-600 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="font-semibold text-gray-900">
              {tCommon("wind")}
            </span>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full overflow-hidden border border-gray-200 text-[10px]">
                <button
                  onClick={() => setUseKnots(false)}
                  className={`px-2 py-0.5 transition-colors ${
                    !useKnots
                      ? "bg-sky-600 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setUseKnots(true)}
                  className={`px-2 py-0.5 transition-colors ${
                    useKnots
                      ? "bg-sky-600 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  kts
                </button>
              </div>
              <button
                onClick={() => setLegendOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer la légende"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          {windOverlayActive ? (
            <div className="w-56">
              <div
                className="h-3.5 rounded-full border border-black/10 shadow-inner"
                style={{ background: windPaletteGradient() }}
              />
              <div className="mt-1 flex justify-between font-medium tabular-nums text-[9px] text-gray-600">
                {[0, 10, 20, 30, 40, 50].map((knots) => (
                  <span key={knots}>
                    {useKnots ? knots : Math.round(knots * 1.852)}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-snug text-gray-500">
                {tCommon("windOverlayLegendHint")}
              </p>
            </div>
          ) : (
            entries.map(({ range, condKey, color }, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-gray-200"
                  style={{ background: color }}
                />
                {range}
                {condKey ? ` – ${tCond(condKey)}` : " – -"}
              </div>
            ))
          )}
        </div>
      ) : (
        <button
          onClick={() => setLegendOpen(true)}
          className="rounded-xl bg-white/90 backdrop-blur px-3 py-2 border border-gray-200 text-xs text-gray-600 shadow-lg hover:bg-white transition-colors flex items-center gap-1.5"
          aria-label="Ouvrir la légende du vent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold text-gray-900">{tCommon("wind")}</span>
          <span className="text-gray-400">({useKnots ? "kts" : "km/h"})</span>
        </button>
      )}
    </div>
  );
}
