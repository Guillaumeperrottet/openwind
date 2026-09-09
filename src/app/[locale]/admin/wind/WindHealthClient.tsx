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
  GitCompareArrows,
  Loader2,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type {
  WindHealthCheck,
  WindHealthStatus,
} from "@/lib/windHealth";
import type { WindSystemHealthReport } from "@/lib/windSystemHealth";

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
  const [report, setReport] = useState<WindSystemHealthReport | null>(null);
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
      setReport((await response.json()) as WindSystemHealthReport);
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
                  Contrôle réel de la source Open-Meteo, du secours R2 et de la
                  cohérence de leurs valeurs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/wind/compare"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              <GitCompareArrows className="h-4 w-4" />
              Comparer les sources
            </Link>
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
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">Source active prévue</span>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {report.activeProvider === "openmeteo_spatial"
                      ? "Open-Meteo S3"
                      : report.activeProvider === "openwind_tiles"
                        ? "Secours Openwind R2"
                        : "Aucune source disponible"}
                  </p>
                </div>
              </div>
            </section>

            {report.fallbackReason && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Bascule automatique active : {report.fallbackReason}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <ProviderCard
                title="Open-Meteo S3"
                role="Source primaire"
                status={report.primary.status}
                sourceUrl={report.primary.sourceUrl}
                detail={
                  report.primary.dataset
                    ? `${report.primary.model.label} · ${formatDate(report.primary.dataset.validAt)}`
                    : "Manifeste indisponible"
                }
              />
              <ProviderCard
                title="Openwind R2"
                role="Secours indépendant"
                status={report.fallback.status}
                sourceUrl={report.fallback.sourceUrl}
                detail={
                  report.fallback.dataset
                    ? `${report.fallback.model?.label ?? "ICON-EU"} · ${formatDate(report.fallback.dataset.validAt)}`
                    : "Jeu de données indisponible"
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Clock3}
                label="Mise à jour Open-Meteo"
                value={
                  report.primary.dataset
                    ? formatAge(report.primary.dataset.ageMinutes)
                    : "Indisponible"
                }
                detail={
                  report.primary.dataset
                    ? formatDate(report.primary.dataset.updatedAt)
                    : undefined
                }
              />
              <MetricCard
                icon={Gauge}
                label="Fichier Open-Meteo"
                value={
                  report.primary.file
                    ? `${report.primary.file.durationMs} ms`
                    : "Indisponible"
                }
                detail={
                  report.primary.file?.bytes
                    ? `${Math.round(report.primary.file.bytes / 1024 / 1024)} Mo · lecture partielle`
                    : undefined
                }
              />
              <MetricCard
                icon={Database}
                label="Secours R2"
                value={report.fallbackReady ? "Prêt" : "Indisponible"}
                detail={report.fallback.dataset?.id}
              />
              <MetricCard
                icon={Activity}
                label="Cohérence des valeurs"
                value={
                  report.consistency.status === "pass"
                    ? "Conforme"
                    : report.consistency.status === "warn"
                      ? "À contrôler"
                      : "Écart anormal"
                }
                detail={
                  report.consistency.comparable
                    ? `${report.consistency.checkedPoints} points · max. ${report.consistency.maxVectorDifferenceMps?.toFixed(2)} m/s`
                    : report.consistency.message
                }
              />
            </div>

            <HealthChecksSection
              title="Source primaire Open-Meteo"
              subtitle="Manifeste officiel, fichier OM, variables, décodage réel et CORS."
              checks={report.primary.checks}
            />
            <HealthChecksSection
              title="Secours Openwind R2"
              subtitle="Manifeste, fraîcheur, tuile binaire réelle et accès navigateur."
              checks={report.fallback.checks}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                {(() => {
                  const style = checkStyle[report.consistency.status];
                  const Icon = style.icon;
                  return (
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.className}`} />
                  );
                })()}
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Comparaison numérique S3 ↔ R2
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.consistency.message}
                  </p>
                </div>
              </div>
            </section>

            <p className="text-center text-xs text-slate-400">
              Actualisation toutes les 60 secondes · Contrôle externe chaque
              heure · 12 générations conservées dans R2
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProviderCard({
  title,
  role,
  status,
  sourceUrl,
  detail,
}: {
  title: string;
  role: string;
  status: WindHealthStatus;
  sourceUrl: string | null;
  detail: string;
}) {
  const presentation = statusStyle[status];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {role}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${presentation.className}`}
        >
          {presentation.label}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          {sourceUrl.replace("https://", "")}
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </section>
  );
}

type TechnicalCheck = Pick<
  WindHealthCheck,
  "label" | "status" | "message" | "durationMs"
> & { id: string };

function HealthChecksSection({
  title,
  subtitle,
  checks,
}: {
  title: string;
  subtitle: string;
  checks: TechnicalCheck[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div>
        {checks.map((check, index) => {
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
