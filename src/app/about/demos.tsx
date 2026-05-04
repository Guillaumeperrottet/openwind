"use client";

/**
 * Tiny "live" UI demos for the /about page.
 *
 * These are intentionally NOT the real components — they're stripped-down
 * visual mocks that look like the app but render statically (no fetches,
 * no maps, no Prisma). The point is to give visitors a feel of the UI
 * without the cost (or maintenance burden) of screenshots.
 */

import { useEffect, useState } from "react";
import {
  Wind,
  CloudRain,
  Sun,
  Zap,
  MapPin,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

// ─── Mini map demo ────────────────────────────────────────────────────────────

/** Animated mock map with clustered station dots and a wind-arrow tail. */
export function MiniMapDemo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  // Stations pseudo-randomly placed but stable.
  const stations = [
    { x: 18, y: 32, kt: 12, dir: 220, pulse: false },
    { x: 28, y: 58, kt: 22, dir: 240, pulse: true },
    { x: 42, y: 24, kt: 8, dir: 180, pulse: false },
    { x: 52, y: 48, kt: 28, dir: 260, pulse: true },
    { x: 64, y: 36, kt: 15, dir: 200, pulse: false },
    { x: 74, y: 64, kt: 19, dir: 230, pulse: false },
    { x: 86, y: 28, kt: 25, dir: 210, pulse: true },
    { x: 38, y: 72, kt: 6, dir: 100, pulse: false },
    { x: 80, y: 80, kt: 11, dir: 190, pulse: false },
  ];

  return (
    <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-linear-to-br from-slate-50 to-blue-50/40 border border-black/5 shadow-sm">
      {/* Faux topographic background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.18]"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M 0 ${10 + i * 4} Q 25 ${6 + i * 4 + Math.sin(i) * 3} 50 ${
              12 + i * 4
            } T 100 ${10 + i * 4}`}
            stroke="#94a3b8"
            strokeWidth="0.15"
            fill="none"
          />
        ))}
      </svg>

      {/* Stations */}
      {stations.map((s, i) => {
        const pulseScale = s.pulse && Math.floor(tick / 8) % 2 === 0 ? 1.6 : 1;
        const color =
          s.kt >= 22
            ? "#3a7fa8"
            : s.kt >= 15
              ? "#6a9cbd"
              : s.kt >= 8
                ? "#a8bdd4"
                : "#c8d4dc";
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            {/* Pulse ring */}
            {s.pulse && (
              <span
                className="absolute inset-0 rounded-full transition-all duration-700"
                style={{
                  background: color,
                  opacity: 0.25,
                  width: 24,
                  height: 24,
                  marginLeft: -12,
                  marginTop: -12,
                  transform: `scale(${pulseScale})`,
                }}
              />
            )}
            {/* Dot */}
            <span
              className="block w-3 h-3 rounded-full ring-2 ring-white shadow"
              style={{ background: color }}
            />
            {/* Wind arrow tail */}
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              width="22"
              height="22"
              style={{ transform: `translate(-50%,-50%) rotate(${s.dir}deg)` }}
            >
              <path
                d="M 11 11 L 11 2 M 11 2 L 8 6 M 11 2 L 14 6"
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            {/* Speed label */}
            <span
              className="absolute left-1/2 -translate-x-1/2 mt-2 text-[9px] font-semibold tabular-nums"
              style={{ color, top: "100%" }}
            >
              {s.kt} kt
            </span>
          </div>
        );
      })}

      {/* Cluster bubble */}
      <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/85 text-white text-sm font-semibold ring-4 ring-white/70 shadow-lg">
        24
      </div>

      {/* Legend pill */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur shadow-sm border border-black/5 text-[10px] text-slate-600">
        <Wind className="h-3 w-3 text-slate-400" />
        Live · 5 réseaux
      </div>
    </div>
  );
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
  { name: "MeteoSwiss", count: "154", region: "Suisse", color: "#dc2626" },
  { name: "Pioupiou", count: "600+", region: "Mondial", color: "#2563eb" },
  { name: "Netatmo", count: "~80", region: "CH + FR sud", color: "#7c3aed" },
  { name: "Météo-France", count: "185", region: "France", color: "#0ea5e9" },
  { name: "Windball", count: "20+", region: "Romandie", color: "#16a34a" },
  { name: "FribourgÉnergie", count: "3", region: "Fribourg", color: "#f59e0b" },
];

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
            {n.count}
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
