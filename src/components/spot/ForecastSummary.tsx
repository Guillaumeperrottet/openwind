import type { FullForecast } from "@/lib/forecast";
import { toKnots } from "@/lib/forecast";
import { toSiteLocale } from "@/lib/site";

const COPY = {
  fr: {
    title: "Vent prévu : les prochains jours",
    model: "Prévision de modèle Open-Meteo, distincte des mesures des balises.",
    day: "Jour",
    wind: "Vent",
    gusts: "Rafales max.",
    fetched: "Prévision chargée le",
  },
  de: {
    title: "Windprognose für die nächsten Tage",
    model:
      "Open-Meteo-Modellprognose, getrennt von den Messungen der Windstationen.",
    day: "Tag",
    wind: "Wind",
    gusts: "Max. Böen",
    fetched: "Prognose geladen am",
  },
  it: {
    title: "Vento previsto nei prossimi giorni",
    model:
      "Previsione del modello Open-Meteo, distinta dalle misure delle stazioni.",
    day: "Giorno",
    wind: "Vento",
    gusts: "Raffiche max.",
    fetched: "Previsione caricata il",
  },
  en: {
    title: "Wind forecast for the next few days",
    model: "Open-Meteo model forecast, separate from station observations.",
    day: "Day",
    wind: "Wind",
    gusts: "Max. gusts",
    fetched: "Forecast loaded on",
  },
};

export function summarizeForecast(forecast: FullForecast) {
  // Hourly times are local wall-clock timestamps in forecast.timezone.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: forecast.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(forecast.fetchedAt));
  const days = new Map<string, { min: number; max: number; gusts: number }>();
  for (const point of forecast.hourly) {
    const day = point.time.slice(0, 10);
    if (day < today || !Number.isFinite(point.windSpeedKmh)) continue;
    const current = days.get(day);
    days.set(day, {
      min: Math.min(current?.min ?? Infinity, point.windSpeedKmh),
      max: Math.max(current?.max ?? 0, point.windSpeedKmh),
      gusts: Math.max(current?.gusts ?? 0, point.gustsKmh ?? 0),
    });
  }
  return [...days].sort(([a], [b]) => a.localeCompare(b)).slice(0, 3);
}

/** Small semantic table shared by SSR pages; charts may still load lazily. */
export function ForecastSummary({
  forecast,
  locale,
}: {
  forecast: FullForecast;
  locale: string;
}) {
  const language = toSiteLocale(locale);
  const copy = COPY[language];
  const days = summarizeForecast(forecast);
  if (!days.length) return null;
  const format = new Intl.DateTimeFormat(language, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-semibold text-slate-950">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy.model}</p>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th scope="col" className="py-3 pr-4">
                {copy.day}
              </th>
              <th scope="col" className="py-3 pr-4">
                {copy.wind}
              </th>
              <th scope="col" className="py-3">
                {copy.gusts}
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map(([day, values]) => (
              <tr key={day} className="border-b border-slate-100 last:border-0">
                <th scope="row" className="py-3 pr-4 font-medium">
                  <time dateTime={day}>
                    {format.format(new Date(`${day}T12:00:00Z`))}
                  </time>
                </th>
                <td className="py-3 pr-4">
                  {toKnots(values.min)}–{toKnots(values.max)} kts{" "}
                  <span className="text-xs text-slate-500">
                    ({Math.round(values.min)}–{Math.round(values.max)} km/h)
                  </span>
                </td>
                <td className="py-3">{toKnots(values.gusts)} kts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {copy.fetched}{" "}
        <time dateTime={forecast.fetchedAt}>
          {new Intl.DateTimeFormat(language, {
            timeZone: forecast.timezone,
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(forecast.fetchedAt))}
        </time>
        {" · "}
        <a href="https://open-meteo.com/" className="underline">
          Open-Meteo
        </a>
      </p>
    </section>
  );
}
