"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Gauge,
  Loader2,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type {
  WindHealthCheck,
  WindHealthReport,
  WindHealthStatus,
} from "@/lib/windHealth";

const statusStyle: Record<
  WindHealthStatus,
  { label: string; className: string }
> = {
  operational: {
    label: "Opérationnel",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  degraded: {
    label: "À surveiller",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  outage: {
    label: "Incident",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

const checkStyle: Record<
  WindHealthCheck["status"],
  { className: string; icon: typeof CheckCircle2 }
> = {
  pass: { className: "text-emerald-600", icon: CheckCircle2 },
  warn: { className: "text-amber-600", icon: TriangleAlert },
  fail: { className: "text-red-600", icon: XCircle },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAge(minutes: number): string {
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0
    ? `il y a ${hours} h`
    : `il y a ${hours} h ${remainingMinutes} min`;
}

export function WindHealthClient() {
  const [report, setReport] = useState<WindHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/wind-health", {
        cache: "no-store",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error ?? `Contrôle impossible (${response.status})`,
        );
      }
      setReport((await response.json()) as WindHealthReport);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible de contrôler le service météo",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
    const interval = window.setInterval(() => void loadHealth(), 60_000);
    return () => window.clearInterval(interval);
  }, [loadHealth]);

  const presentation = report ? statusStyle[report.status] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l’administration
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-950">
                  Santé du vent en direct
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Contrôle réel du manifeste, de la fraîcheur, des tuiles et du
                  chargement navigateur.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadHealth()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!report && loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
          </div>
        ) : report && presentation ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    État global
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${presentation.className}`}
                    >
                      {presentation.label}
                    </span>
                    <span className="text-sm text-slate-500">
                      Contrôlé le {formatDate(report.checkedAt)}
                    </span>
                  </div>
                </div>
                {report.sourceUrl && (
                  <a
                    href={report.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800"
                  >
                    {report.sourceUrl.replace("https://", "")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Clock3}
                label="Dernière publication"
                value={
                  report.dataset
                    ? formatAge(report.dataset.ageMinutes)
                    : "Indisponible"
                }
                detail={
                  report.dataset
                    ? formatDate(report.dataset.updatedAt)
                    : undefined
                }
              />
              <MetricCard
                icon={Gauge}
                label="Échéance affichée"
                value={
                  report.dataset
                    ? formatDate(report.dataset.validAt)
                    : "Indisponible"
                }
                detail={
                  report.model
                    ? `${report.model.label} · ${report.model.resolutionKm} km`
                    : undefined
                }
              />
              <MetricCard
                icon={Database}
                label="Jeu de données"
                value={report.dataset?.runId ?? "Indisponible"}
                detail={report.dataset?.id}
              />
              <MetricCard
                icon={Activity}
                label="Tuile testée"
                value={report.tile ? `${report.tile.durationMs} ms` : "Indisponible"}
                detail={
                  report.tile
                    ? `${report.tile.x}/${report.tile.y} · ${Math.round(report.tile.bytes / 1024)} Ko`
                    : undefined
                }
              />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2 className="font-semibold text-slate-950">
                  Contrôles techniques
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ces tests sont également lancés automatiquement chaque heure.
                </p>
              </div>
              <div>
                {report.checks.map((check, index) => {
                  const style = checkStyle[check.status];
                  const Icon = style.icon;
                  return (
                    <div
                      key={check.id}
                      className={`flex gap-3 px-5 py-4 sm:px-6 ${
                        index > 0 ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${style.className}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {check.label}
                          </h3>
                          {typeof check.durationMs === "number" && (
                            <span className="text-xs tabular-nums text-slate-400">
                              {check.durationMs} ms
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-words text-sm text-slate-500">
                          {check.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="text-center text-xs text-slate-400">
              Actualisation automatique toutes les 60 secondes · Rétention des
              12 dernières générations dans R2
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-sky-600" />
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-base font-semibold text-slate-900">
        {value}
      </p>
      {detail && (
        <p className="mt-1 truncate text-xs text-slate-400" title={detail}>
          {detail}
        </p>
      )}
    </section>
  );
}
