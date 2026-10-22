import {
  localDate,
  type PlannerForecast,
  type PlannerHour,
  type PlannerResult,
} from "@/lib/planner";
type ProviderData = {
  timezone?: string;
  hourly?: Record<string, unknown[]>;
  daily?: Record<string, unknown[]>;
};
const numeric = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
export function parsePlannerForecast(
  value: unknown,
  retrievedAt: string,
): PlannerForecast | null {
  if (!value || typeof value !== "object") return null;
  const data = value as ProviderData;
  if (
    !data.timezone ||
    !Array.isArray(data.hourly?.time) ||
    !data.hourly.time.length ||
    !Array.isArray(data.daily?.sunrise)
  )
    return null;
  try {
    localDate(new Date(), data.timezone);
  } catch {
    return null;
  }
  const hourly = data.hourly;
  const hours: PlannerHour[] = hourly.time.flatMap((time, i) => {
    if (numeric(time) === null) return [];
    const wind = numeric(hourly.wind_speed_10m?.[i]),
      gust = numeric(hourly.wind_gusts_10m?.[i]),
      direction = numeric(hourly.wind_direction_10m?.[i]),
      rain = numeric(hourly.precipitation?.[i]);
    return [
      {
        time: (time as number) * 1000,
        wind: wind !== null && wind >= 0 ? wind : null,
        gust: gust !== null && gust >= 0 ? gust : null,
        direction:
          direction !== null && direction >= 0 && direction <= 360
            ? direction
            : null,
        rain: rain !== null && rain >= 0 ? rain : null,
      },
    ];
  });
  const daylight = data.daily.sunrise.flatMap((rise, i) => {
    const sunrise = numeric(rise),
      sunset = numeric(data.daily?.sunset?.[i]);
    if (sunrise === null || sunset === null || sunset <= sunrise) return [];
    return [
      {
        date: localDate(new Date(sunrise * 1000), data.timezone),
        sunrise: sunrise * 1000,
        sunset: sunset * 1000,
      },
    ];
  });
  return hours.some(
    (h) => h.wind !== null && h.gust !== null && h.direction !== null,
  ) && daylight.length
    ? { timezone: data.timezone, retrievedAt, hours, daylight }
    : null;
}
/** All unique coordinates, in bounded parallel batches. No geographic sampling. */
async function fetchBatches<T>(
  coords: { latitude: number; longitude: number }[],
  endpoint: string,
  params: Record<string, string>,
  revalidate: number,
  parse: (value: unknown, at: string) => T | null,
): Promise<(T | null)[]> {
  const key = (c: (typeof coords)[number]) => `${c.latitude},${c.longitude}`;
  const unique = [...new Map(coords.map((c) => [key(c), c])).values()];
  const results = new Map<string, T | null>();
  let cursor = 0;
  const deadline = Date.now() + 40000;
  async function worker() {
    while (cursor < unique.length && Date.now() < deadline) {
      const batch = unique.slice(cursor, (cursor += 40));
      const url = new URL(endpoint);
      url.searchParams.set("latitude", batch.map((c) => c.latitude).join(","));
      url.searchParams.set(
        "longitude",
        batch.map((c) => c.longitude).join(","),
      );
      Object.entries(params).forEach(([name, value]) =>
        url.searchParams.set(name, value),
      );
      url.searchParams.set("wind_speed_unit", "kmh");
      url.searchParams.set("timezone", "auto");
      let response: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url.toString(), {
            signal: AbortSignal.timeout(
              Math.min(8000, Math.max(1, deadline - Date.now())),
            ),
            next: { revalidate },
          });
          if (!res.ok) {
            if (res.status !== 429 && res.status < 500) break;
            continue;
          }
          response = await res.json();
          break;
        } catch {
          /* Retry transient provider/network errors once. */
        }
      }
      const received = Array.isArray(response)
        ? response
        : batch.length === 1
          ? [response]
          : [];
      const at = new Date().toISOString();
      batch.forEach((c, i) => results.set(key(c), parse(received[i], at)));
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, unique.length) }, worker));
  return coords.map((c) => results.get(key(c)) ?? null);
}

export function fetchPlannerForecasts(
  coords: { latitude: number; longitude: number }[],
  start: string,
  end: string,
) {
  return fetchBatches(
    coords,
    "https://api.open-meteo.com/v1/forecast",
    {
      start_date: start,
      end_date: end,
      hourly: "wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation",
      daily: "sunrise,sunset",
      timeformat: "unixtime",
    },
    900,
    parsePlannerForecast,
  );
}
export function parsePlannerSeasonal(
  value: unknown,
  months: Set<number>,
  years: [number, number],
): PlannerResult["seasonal"] | null {
  if (!value || typeof value !== "object") return null;
  const data = (value as ProviderData).daily;
  if (!Array.isArray(data?.time)) return null;
  const valid = data.time.flatMap((date, i) => {
    if (typeof date !== "string" || !months.has(Number(date.slice(5, 7))))
      return [];
    const wind = numeric(data.wind_speed_10m_max?.[i]),
      gust = numeric(data.wind_gusts_10m_max?.[i]);
    return wind !== null && gust !== null && wind >= 0 && gust >= wind
      ? [{ wind, gust }]
      : [];
  });
  return valid.length
    ? {
        wind: valid.reduce((sum, d) => sum + d.wind, 0) / valid.length,
        gust: valid.reduce((sum, d) => sum + d.gust, 0) / valid.length,
        days: valid.length,
        years,
      }
    : null;
}
export function fetchPlannerSeasonal(
  coords: { latitude: number; longitude: number }[],
  months: Set<number>,
  currentYear: number,
) {
  const years: [number, number] = [currentYear - 5, currentYear - 1];
  return fetchBatches(
    coords,
    "https://archive-api.open-meteo.com/v1/archive",
    {
      start_date: `${years[0]}-01-01`,
      end_date: `${years[1]}-12-31`,
      daily: "wind_speed_10m_max,wind_gusts_10m_max",
    },
    604800,
    (value) => parsePlannerSeasonal(value, months, years),
  );
}
