"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  Clock3,
  CloudRain,
  Droplets,
  ExternalLink,
  Gauge,
  Snowflake,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type {
  MeteoSwissStationWeather,
  MeteoSwissWeatherPoint,
} from "@/lib/meteoswissWeather";

interface Props {
  weather: MeteoSwissStationWeather;
}

type MetricKey =
  | "temperature"
  | "humidity"
  | "dewPoint"
  | "precipitation"
  | "pressure"
  | "radiation";

type MetricDefinition = {
  key: MetricKey;
  label: string;
  color: string;
  unit: string;
  value: (point: MeteoSwissWeatherPoint) => number | null;
};

type CurrentCard = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  detail?: string;
  icon: LucideIcon;
  iconClassName: string;
  iconBackground: string;
};

function pressureValue(point: MeteoSwissWeatherPoint) {
  return (
    point.pressureQnhHpa ??
    point.pressureSeaLevelHpa ??
    point.pressureStationHpa
  );
}

function sumAvailable(values: Array<number | null>) {
  const available = values.filter((value): value is number => value !== null);
  return available.length > 0
    ? available.reduce((sum, value) => sum + value, 0)
    : null;
}

function formatValue(
  value: number,
  maximumFractionDigits = 1,
  locale?: string,
) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
}

export function MeteoSwissDetailsPanel({ weather }: Props) {
  const t = useTranslations("StationPage");
  const locale = useLocale();
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("temperature");

  const current = weather.current;
  const newestHistoryPoint = weather.history.at(-1);
  const nowMs = Date.parse(current?.time ?? newestHistoryPoint?.time ?? "");
  const last24Hours = weather.history.filter(
    (point) => Date.parse(point.time) >= nowMs - 24 * 60 * 60 * 1000,
  );

  const dayKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zurich",
  });
  const todayKey = dayKeyFormatter.format(new Date(nowMs));
  const today = weather.history.filter(
    (point) => dayKeyFormatter.format(new Date(point.time)) === todayKey,
  );

  const temperatureValues = last24Hours
    .map((point) => point.temperatureC)
    .filter((value): value is number => value !== null);
  const temperatureRange =
    temperatureValues.length > 0
      ? `${formatValue(Math.min(...temperatureValues), 1, locale)}° / ${formatValue(Math.max(...temperatureValues), 1, locale)}°`
      : undefined;
  const rain24Hours = sumAvailable(
    last24Hours.map((point) => point.precipitation10MinMm),
  );
  const sunshineToday = sumAvailable(
    today.map((point) => point.sunshine10MinMinutes),
  );

  const currentCards: CurrentCard[] = current
    ? [
        {
          key: "temperature",
          label: t("temperature"),
          value: current.temperatureC,
          unit: "°C",
          detail: temperatureRange
            ? t("minimumMaximum", { range: temperatureRange })
            : undefined,
          icon: Thermometer,
          iconClassName: "text-rose-600",
          iconBackground: "bg-rose-50",
        },
        {
          key: "humidity",
          label: t("humidity"),
          value: current.humidityPct,
          unit: "%",
          icon: Droplets,
          iconClassName: "text-sky-600",
          iconBackground: "bg-sky-50",
        },
        {
          key: "dewPoint",
          label: t("dewPoint"),
          value: current.dewPointC,
          unit: "°C",
          icon: Droplets,
          iconClassName: "text-cyan-700",
          iconBackground: "bg-cyan-50",
        },
        {
          key: "rain24h",
          label: t("rain24h"),
          value: rain24Hours,
          unit: "mm",
          detail:
            current.precipitation10MinMm !== null
              ? t("lastTenMinutes", {
                  value: formatValue(current.precipitation10MinMm, 1, locale),
                })
              : undefined,
          icon: CloudRain,
          iconClassName: "text-blue-700",
          iconBackground: "bg-blue-50",
        },
        {
          key: "pressure",
          label: t("pressure"),
          value: pressureValue(current),
          unit: "hPa",
          detail: current.pressureQnhHpa !== null ? "QNH" : undefined,
          icon: Gauge,
          iconClassName: "text-violet-600",
          iconBackground: "bg-violet-50",
        },
        {
          key: "sunshine",
          label: t("sunshineToday"),
          value: sunshineToday,
          unit: "min",
          icon: Sun,
          iconClassName: "text-amber-600",
          iconBackground: "bg-amber-50",
        },
        {
          key: "radiation",
          label: t("globalRadiation"),
          value: current.globalRadiationWm2,
          unit: "W/m²",
          icon: Activity,
          iconClassName: "text-orange-600",
          iconBackground: "bg-orange-50",
        },
        {
          key: "snow",
          label: t("snowDepth"),
          value: current.snowDepthCm,
          unit: "cm",
          icon: Snowflake,
          iconClassName: "text-indigo-600",
          iconBackground: "bg-indigo-50",
        },
      ].filter((card) => card.value !== null)
    : [];

  const metrics = useMemo<MetricDefinition[]>(
    () =>
      [
        {
          key: "temperature" as const,
          label: t("temperature"),
          color: "#e11d48",
          unit: "°C",
          value: (point: MeteoSwissWeatherPoint) => point.temperatureC,
        },
        {
          key: "humidity" as const,
          label: t("humidity"),
          color: "#0284c7",
          unit: "%",
          value: (point: MeteoSwissWeatherPoint) => point.humidityPct,
        },
        {
          key: "dewPoint" as const,
          label: t("dewPoint"),
          color: "#0e7490",
          unit: "°C",
          value: (point: MeteoSwissWeatherPoint) => point.dewPointC,
        },
        {
          key: "precipitation" as const,
          label: t("precipitation"),
          color: "#2563eb",
          unit: "mm / 10 min",
          value: (point: MeteoSwissWeatherPoint) => point.precipitation10MinMm,
        },
        {
          key: "pressure" as const,
          label: t("pressure"),
          color: "#7c3aed",
          unit: "hPa",
          value: pressureValue,
        },
        {
          key: "radiation" as const,
          label: t("globalRadiation"),
          color: "#ea580c",
          unit: "W/m²",
          value: (point: MeteoSwissWeatherPoint) => point.globalRadiationWm2,
        },
      ].filter((metric) =>
        weather.history.some((point) => metric.value(point) !== null),
      ),
    [t, weather.history],
  );

  const activeMetric =
    metrics.find((metric) => metric.key === selectedMetric) ?? metrics[0];

  if (currentCards.length === 0 && metrics.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="meteoswiss-measures-title">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
            SwissMetNet
          </p>
          <h2
            id="meteoswiss-measures-title"
            className="text-lg font-semibold text-gray-950"
          >
            {t("otherMeasurements")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t("otherMeasurementsDescription")}
          </p>
        </div>
        {current && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            {t("measuredAt", {
              time: new Intl.DateTimeFormat(locale, {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                timeZone: "Europe/Zurich",
              }).format(new Date(current.time)),
            })}
          </div>
        )}
      </div>

      {currentCards.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {currentCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.key}
                className="min-w-0 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4"
              >
                <div
                  className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${card.iconBackground}`}
                >
                  <Icon className={`h-4 w-4 ${card.iconClassName}`} />
                </div>
                <p className="truncate text-xs font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="mt-1 flex items-baseline gap-1 text-gray-950">
                  <span className="text-2xl font-bold tabular-nums sm:text-3xl">
                    {formatValue(card.value!, 1, locale)}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {card.unit}
                  </span>
                </p>
                {card.detail && (
                  <p className="mt-1 truncate text-[10px] text-gray-400">
                    {card.detail}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {activeMetric && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {t("measuredEvolution48h")}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  {t("observationsOnly")}
                </p>
              </div>
              <div className="flex max-w-full gap-1 overflow-x-auto pb-1 lg:pb-0">
                {metrics.map((metric) => (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => setSelectedMetric(metric.key)}
                    aria-pressed={activeMetric.key === metric.key}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeMetric.key === metric.key
                        ? "bg-gray-950 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-3 py-4 sm:px-5">
            <WeatherMetricChart
              points={weather.history}
              metric={activeMetric}
              locale={locale}
            />
          </div>
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        {t("meteoswissAttribution")}{" "}
        <a
          href={weather.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-gray-500 hover:text-gray-700 hover:underline"
        >
          {t("officialDocumentation")}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </p>
    </section>
  );
}

function WeatherMetricChart({
  points,
  metric,
  locale,
}: {
  points: MeteoSwissWeatherPoint[];
  metric: MetricDefinition;
  locale: string;
}) {
  const values = points
    .map((point) => ({ time: point.time, value: metric.value(point) }))
    .filter(
      (point): point is { time: string; value: number } =>
        point.value !== null && Number.isFinite(point.value),
    );

  if (values.length < 2) return null;

  const width = 760;
  const height = 220;
  const left = 44;
  const right = 14;
  const top = 18;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const minimum = Math.min(...values.map((point) => point.value));
  const maximum = Math.max(...values.map((point) => point.value));
  const range = Math.max(maximum - minimum, 1);
  const paddedMinimum = minimum - range * 0.08;
  const paddedMaximum = maximum + range * 0.08;
  const paddedRange = paddedMaximum - paddedMinimum;

  const x = (index: number) =>
    left + (index / Math.max(values.length - 1, 1)) * chartWidth;
  const y = (value: number) =>
    top + ((paddedMaximum - value) / paddedRange) * chartHeight;
  const line = values
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${x(index).toFixed(2)},${y(point.value).toFixed(2)}`,
    )
    .join(" ");
  const area = `${line} L${x(values.length - 1)},${top + chartHeight} L${left},${top + chartHeight} Z`;
  const gradientId = `metric-${metric.key}`;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    timeZone: "Europe/Zurich",
  });

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800">{metric.label}</p>
        <p className="text-xs tabular-nums text-gray-500">
          {formatValue(minimum, 1, locale)} – {formatValue(maximum, 1, locale)}{" "}
          {metric.unit}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto min-h-44 w-full"
        role="img"
        aria-label={`${metric.label}, 48 h`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={metric.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((ratio) => {
          const gridY = top + ratio * chartHeight;
          const labelValue = paddedMaximum - ratio * paddedRange;
          return (
            <g key={ratio}>
              <line
                x1={left}
                x2={width - right}
                y1={gridY}
                y2={gridY}
                stroke="#e5e7eb"
                strokeDasharray="3 5"
              />
              <text
                x={left - 8}
                y={gridY + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9ca3af"
              >
                {formatValue(labelValue, 0, locale)}
              </text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={metric.color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <text x={left} y={height - 8} fontSize="10" fill="#9ca3af">
          {dateFormatter.format(new Date(values[0].time))}
        </text>
        <text
          x={width - right}
          y={height - 8}
          textAnchor="end"
          fontSize="10"
          fill="#9ca3af"
        >
          {dateFormatter.format(new Date(values.at(-1)!.time))}
        </text>
      </svg>
    </div>
  );
}
