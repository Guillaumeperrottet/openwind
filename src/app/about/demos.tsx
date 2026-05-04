"use client";

/**
 * Tiny "live" UI demos for the /about page.
 *
 * Most demos are stripped-down visual mocks (no fetches, no Prisma) — except
 * `MiniMapDemo`, which embeds the *real* MapLibre map with live stations.
 */

import { useState } from "react";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Wind,
  CloudRain,
  Sun,
  Zap,
  MapPin,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

// ─── Mini map demo (real MapLibre + live /api/stations) ───────────────────────

const LiveMiniMap = dynamic(() => import("./LiveMiniMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-black/5 shadow-sm bg-linear-to-br from-slate-50 to-blue-50/40">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow text-xs text-slate-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          Chargement de la carte…
        </div>
      </div>
    </div>
  ),
});

export function MiniMapDemo() {
  return <LiveMiniMap />;
}

// ─── Mini forecast table ──────────────────────────────────────────────────────

const FORECAST_HOURS = [
  { h: "08", kt: 6, kmh: 11, gust: 14, dir: 200, t: 11, prec: 0, score: 0 },
  { h: "10", kt: 9, kmh: 17, gust: 22, dir: 215, t: 14, prec: 0, score: 0 },
  { h: "12", kt: 14, kmh: 26, gust: 32, dir: 225, t: 18, prec: 0, score: 1 },
  { h: "14", kt: 18, kmh: 33, gust: 41, dir: 230, t: 21, prec: 0, score: 3 },
  { h: "16", kt: 20, kmh: 37, gust: 45, dir: 235, t: 22, prec: 0, score: 3 },
  { h: "18", kt: 16, kmh: 30, gust: 39, dir: 240, t: 19, prec: 0.2, score: 2 },
  { h: "20", kt: 11, kmh: 20, gust: 28, dir: 250, t: 16, prec: 0.5, score: 1 },
];

export function MiniForecastDemo() {
  const scoreBg = (s: number) =>
    s === 3
      ? "bg-emerald-500/90"
      : s === 2
        ? "bg-emerald-300/70"
        : s === 1
          ? "bg-amber-300/60"
          : "bg-slate-100";

  const windColor = (kmh: number) =>
    kmh >= 38
      ? "#e07720"
      : kmh >= 30
        ? "#3a7fa8"
        : kmh >= 22
          ? "#6a9cbd"
          : kmh >= 15
            ? "#a8bdd4"
            : "#c8d4dc";

  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Vendredi 5 mai
          </div>
          <div className="text-[11px] text-slate-400">
            Modèle ICON-CH2-EPS · MeteoSwiss
          </div>
        </div>
        <div className="text-[10px] inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Zap className="h-3 w-3" /> session idéale 14h–16h
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] tabular-nums">
          <thead className="bg-slate-50/70 text-slate-500">
            <tr>
              <th className="text-left px-3 py-2 font-medium">h</th>
              <th className="text-right px-2 font-medium">vent</th>
              <th className="text-right px-2 font-medium">raf.</th>
              <th className="text-right px-2 font-medium">dir</th>
              <th className="text-right px-2 font-medium">temp</th>
              <th className="text-right px-2 font-medium">pluie</th>
              <th className="text-center px-3 font-medium">score</th>
            </tr>
          </thead>
          <tbody>
            {FORECAST_HOURS.map((r) => (
              <tr key={r.h} className="border-t border-black/4">
                <td className="px-3 py-1.5 font-medium text-slate-600">
                  {r.h}h
                </td>
                <td
                  className="px-2 text-right font-semibold"
                  style={{ color: windColor(r.kmh) }}
                >
                  {r.kt}
                  <span className="text-[9px] text-slate-400 ml-0.5">kt</span>
                </td>
                <td
                  className="px-2 text-right"
                  style={{ color: windColor(r.gust) }}
                >
                  {Math.round(r.gust / 1.852)}
                </td>
                <td className="px-2 text-right text-slate-500">
                  <span
                    className="inline-block"
                    style={{ transform: `rotate(${r.dir}deg)` }}
                  >
                    ↑
                  </span>{" "}
                  {r.dir}°
                </td>
                <td className="px-2 text-right text-slate-600">{r.t}°</td>
                <td className="px-2 text-right text-slate-400">
                  {r.prec > 0 ? `${r.prec}` : "—"}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={`block w-full h-2 rounded-full ${scoreBg(r.score)}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Networks pills ───────────────────────────────────────────────────────────

const NETWORKS = [
  {
    name: "MeteoSwiss",
    target: 154,
    suffix: "",
    region: "Suisse",
    color: "#dc2626",
  },
  {
    name: "Pioupiou",
    target: 600,
    suffix: "+",
    region: "Mondial",
    color: "#2563eb",
  },
  {
    name: "Netatmo",
    target: 80,
    prefix: "~",
    suffix: "",
    region: "CH + FR sud",
    color: "#7c3aed",
  },
  {
    name: "Météo-France",
    target: 185,
    suffix: "",
    region: "France",
    color: "#0ea5e9",
  },
  {
    name: "Windball",
    target: 20,
    suffix: "+",
    region: "Romandie",
    color: "#16a34a",
  },
  {
    name: "FribourgÉnergie",
    target: 3,
    suffix: "",
    region: "Fribourg",
    color: "#f59e0b",
  },
] as const;

function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1400,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(Math.round(eased * to));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

export function NetworksGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {NETWORKS.map((n) => (
        <div
          key={n.name}
          className="rounded-xl bg-white border border-black/5 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: n.color }}
            />
            <span className="text-sm font-semibold text-slate-800">
              {n.name}
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            <CountUp
              to={n.target}
              prefix={"prefix" in n ? n.prefix : ""}
              suffix={n.suffix}
            />
          </div>
          <div className="text-[11px] text-slate-500">{n.region}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Trip Planner mini ────────────────────────────────────────────────────────

const PLAN_DAYS = [
  { d: "lun", score: 1 },
  { d: "mar", score: 2 },
  { d: "mer", score: 3 },
  { d: "jeu", score: 3 },
  { d: "ven", score: 2 },
  { d: "sam", score: 0 },
  { d: "dim", score: 1 },
];

export function MiniPlannerDemo() {
  const ringColor = (s: number) =>
    s === 3 ? "#10b981" : s === 2 ? "#34d399" : s === 1 ? "#fbbf24" : "#cbd5e1";

  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-800">
            Léman · 50 km
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          Kite
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {PLAN_DAYS.map((d) => {
          const pct = (d.score / 3) * 100;
          return (
            <div key={d.d} className="flex flex-col items-center gap-1.5">
              <div className="relative w-9 h-9">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#f1f5f9"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke={ringColor(d.score)}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(pct * 94.2) / 100} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                {d.d}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700">
        <TrendingUp className="h-3 w-3" />2 jours idéaux cette semaine (mer–jeu)
      </div>
    </div>
  );
}

// ─── Archives sparkline ───────────────────────────────────────────────────────

export function MiniArchivesDemo() {
  // 12 monthly average wind speeds (kt) for a fictional spot, 2021–2025 averaged.
  const data = [9, 10, 13, 16, 18, 15, 12, 13, 14, 16, 13, 10];
  const max = Math.max(...data);
  const labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Vent moyen mensuel
          </div>
          <div className="text-[11px] text-slate-400">5 ans · 2021–2025</div>
        </div>
        <div className="text-xs text-slate-500">
          pic en <span className="font-semibold text-slate-700">mai</span>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-linear-to-t from-blue-500/80 to-sky-300"
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="text-[9px] text-slate-400 font-medium">
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forum thread mini ────────────────────────────────────────────────────────

const POSTS = [
  {
    user: "marin_91",
    avatar: "M",
    color: "bg-blue-500",
    time: "il y a 2h",
    text: "Session magique au Bouveret hier soir, vent thermique régulier 18kt 🪁",
    votes: 12,
  },
  {
    user: "kite-fribourg",
    avatar: "K",
    color: "bg-emerald-500",
    time: "il y a 4h",
    text: "Quelqu'un a testé la rampe nord de Schiffenen ? Curieux de la qualité de l'eau.",
    votes: 5,
  },
];

export function MiniForumDemo() {
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-800">
          Sessions de la semaine
        </span>
      </div>
      <ul className="divide-y divide-black/4">
        {POSTS.map((p) => (
          <li key={p.user} className="px-4 py-3 flex gap-3">
            <span
              className={`shrink-0 w-8 h-8 rounded-full ${p.color} text-white text-xs font-semibold flex items-center justify-center`}
            >
              {p.avatar}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-800">
                  {p.user}
                </span>
                <span className="text-[10px] text-slate-400">{p.time}</span>
              </div>
              <p className="text-[12px] text-slate-600 mt-0.5">{p.text}</p>
            </div>
            <div className="flex flex-col items-center text-[10px] text-slate-400 shrink-0">
              <span>▲</span>
              <span className="font-semibold text-slate-600">{p.votes}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Animated wind background (hero) ──────────────────────────────────────────

/** Slim animated wind streaks behind the hero title. */
export function WindStreaks() {
  // Static SVG paths animated via CSS @keyframes (defined inline below).
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.5]"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="streak" x1="0" x2="1">
            <stop offset="0%" stopColor="#3a7fa8" stopOpacity="0" />
            <stop offset="50%" stopColor="#3a7fa8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#3a7fa8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }).map((_, i) => {
          const y = 40 + i * 40 + Math.sin(i) * 12;
          const dur = 7 + (i % 5) * 1.3;
          const delay = (i * 0.4) % 3;
          return (
            <path
              key={i}
              d={`M -200 ${y} Q 300 ${y - 18} 600 ${y} T 1400 ${y}`}
              stroke="url(#streak)"
              strokeWidth={i % 3 === 0 ? 1.4 : 0.8}
              fill="none"
              style={{
                animation: `wind-flow ${dur}s linear ${delay}s infinite`,
              }}
            />
          );
        })}
      </svg>
      <style>{`
        @keyframes wind-flow {
          0%   { transform: translateX(-15%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(15%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Sport switch (kite vs paragliding) ───────────────────────────────────────

export function SportConditionsDemo() {
  const [sport, setSport] = useState<"kite" | "para">("kite");
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
      <div className="flex border-b border-black/5">
        {(["kite", "para"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
              sport === s
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {s === "kite" ? "🪁 Kite" : "🪂 Parapente"}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-3">
        {sport === "kite" ? (
          <>
            <Stat icon={<Wind />} label="Vent idéal" value="20–35 km/h" />
            <Stat icon={<Sun />} label="Direction" value="onshore / side" />
            <Stat
              icon={<CloudRain />}
              label="Conditions"
              value="rafales < 1.45×"
            />
          </>
        ) : (
          <>
            <Stat icon={<Wind />} label="Vent idéal" value="0–10 km/h" />
            <Stat icon={<Sun />} label="Ensoleillement" value="thermique +" />
            <Stat icon={<CloudRain />} label="Pluie" value="aucune" />
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        {label}
      </span>
      <span className="font-semibold text-slate-800 tabular-nums">{value}</span>
    </div>
  );
}

// ─── « Ça souffle ? » quick mode demo ─────────────────────────────────────────

const QUICK_SPOTS = [
  { name: "Estavayer-le-Lac", km: 4, kt: 18, dir: 230 },
  { name: "Cudrefin", km: 12, kt: 22, dir: 245 },
  { name: "Yvonand", km: 18, kt: 14, dir: 220 },
  { name: "Le Bouveret", km: 38, kt: 11, dir: 200 },
];

export function QuickWindDemo() {
  const [stage, setStage] = useState<"idle" | "locating" | "results">("idle");
  const [revealed, setRevealed] = useState(0);

  const start = () => {
    if (stage !== "idle") return;
    setStage("locating");
    setRevealed(0);
    setTimeout(() => {
      setStage("results");
      // Reveal results one by one
      QUICK_SPOTS.forEach((_, i) => {
        setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 120 * (i + 1));
      });
    }, 900);
  };

  const reset = () => {
    setStage("idle");
    setRevealed(0);
  };

  return (
    <div className="relative rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-6 sm:p-8 shadow-lg overflow-hidden min-h-[320px]">
      {/* subtle wind streaks */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 400 320"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d={`M -20 ${30 + i * 38} Q 200 ${10 + i * 38} 420 ${50 + i * 38}`}
            stroke="white"
            strokeWidth="0.6"
            fill="none"
          />
        ))}
      </svg>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-sky-300/80">
            <Zap className="h-3 w-3" />
            Mode rapide
          </div>
          {stage === "results" && (
            <button
              type="button"
              onClick={reset}
              className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Recommencer
            </button>
          )}
        </div>

        {stage === "idle" && (
          <div className="mt-10 flex flex-col items-center text-center">
            <p className="text-slate-300 text-sm max-w-xs">
              Un seul clic, géolocalisation, et la liste des spots ventés autour
              de toi. Pas de formulaire, pas d&apos;inscription.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-sky-500/30 transition-colors"
            >
              <Wind className="h-4 w-4" />
              Ça souffle&nbsp;?
            </button>
            <p className="mt-3 text-[10px] text-slate-500">≈ 2 secondes</p>
          </div>
        )}

        {stage === "locating" && (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 rounded-full bg-sky-500/30 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-sky-500" />
            </div>
            <p className="mt-5 text-slate-300 text-sm">Géolocalisation…</p>
          </div>
        )}

        {stage === "results" && (
          <div className="mt-5">
            <p className="text-[11px] text-slate-400">
              4 spots ventés à moins de 50 km
            </p>
            <ul className="mt-3 space-y-1.5">
              {QUICK_SPOTS.map((s, i) => (
                <li
                  key={s.name}
                  className={`flex items-center gap-3 rounded-lg bg-white/[0.04] backdrop-blur px-3 py-2 transition-all duration-300 ${
                    i < revealed
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 text-sky-300/80 shrink-0" />
                  <span className="flex-1 text-sm text-slate-100 truncate">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {s.km} km
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color:
                        s.kt >= 18
                          ? "#7dd3fc"
                          : s.kt >= 12
                            ? "#bae6fd"
                            : "#cbd5e1",
                    }}
                  >
                    {s.kt} kt
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Open source / forum → commit demo ────────────────────────────────────────

const COMMIT_LINES: {
  type: "issue" | "commit" | "deploy";
  text: string;
  meta?: string;
}[] = [
  {
    type: "issue",
    text: "feat: add Météo-France SYNOP network",
    meta: "#42 · ouvert par @marc-kite",
  },
  {
    type: "commit",
    text: "lib/meteofrance.ts  +185 stations",
    meta: "3 commits · @guiperrot",
  },
  {
    type: "commit",
    text: "merge: pull request #42",
    meta: "main ← feat/meteo-france",
  },
  { type: "deploy", text: "deployed to openwind.ch", meta: "build 2m18s" },
];

export function OpenSourceCodeDemo() {
  return (
    <div className="rounded-2xl bg-slate-950 border border-white/10 shadow-xl overflow-hidden font-mono text-[12px]">
      {/* macOS-style window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-slate-900/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-[11px] text-slate-400 font-sans">
          Guillaumeperrottet/openwind
        </span>
      </div>

      {/* Code-style log */}
      <div className="p-5 space-y-3 text-slate-300">
        {COMMIT_LINES.map((line, i) => {
          const accent =
            line.type === "issue"
              ? "text-emerald-400"
              : line.type === "commit"
                ? "text-sky-400"
                : "text-fuchsia-400";
          const prefix =
            line.type === "issue"
              ? "issue  "
              : line.type === "commit"
                ? "commit "
                : "deploy ";
          return (
            <div key={i} className="flex gap-3">
              <span className="text-slate-600 select-none shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`${accent} shrink-0`}>{prefix}</span>
                  <span className="text-slate-100">{line.text}</span>
                </div>
                {line.meta && (
                  <div className="text-[11px] text-slate-500 mt-0.5 ml-[64px] sm:ml-[68px]">
                    {line.meta}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Final blinking prompt */}
        <div className="flex gap-3 pt-2 border-t border-white/5">
          <span className="text-slate-600 select-none shrink-0">
            {String(COMMIT_LINES.length + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">$</span>
            <span className="text-slate-400">git checkout -b feat/</span>
            <span className="inline-block w-2 h-4 bg-emerald-400/80 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer mini-stats */}
      <div className="px-5 py-3 border-t border-white/5 bg-slate-900/40 flex items-center gap-4 text-[11px] text-slate-400 font-sans">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          TypeScript
        </span>
        <span>·</span>
        <span>MIT</span>
        <span>·</span>
        <span className="text-slate-300">100% open</span>
      </div>
    </div>
  );
}

// ─── Screenshot frame ─────────────────────────────────────────────────────────

export function Screenshot({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}) {
  return (
    <figure className="group">
      <div className="relative rounded-2xl overflow-hidden border border-black/8 bg-white shadow-[0_18px_50px_-15px_rgba(15,23,42,0.25)] transition-shadow group-hover:shadow-[0_24px_70px_-15px_rgba(15,23,42,0.35)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-black/5 bg-slate-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
          <span className="ml-3 px-2 py-0.5 rounded text-[10px] text-slate-400 bg-white border border-black/5 font-sans truncate">
            openwind.ch
          </span>
        </div>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto block"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-[11px] text-slate-500 text-center font-sans">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
