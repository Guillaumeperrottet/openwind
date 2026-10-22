import { cache } from "react";
import { notFound } from "next/navigation";
import {
  getStationFromCache,
  getStationLive,
  getStationHistory,
} from "@/lib/stationData";
import { fetchFullForecast } from "@/lib/forecast";
import { getMeteoSwissStationWeather } from "@/lib/meteoswissWeather";
import { resolveStationConnections } from "@/lib/station-connections";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
} from "@/lib/site";
import { stationSeo, stationSchema } from "@/lib/station-seo";
import { StationPageClient } from "./StationPageClient";

// No force-dynamic — params already makes this route dynamic.
// Removing it lets internal fetch() calls use their ISR cache (revalidate settings).

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

const getStation = cache(getStationFromCache);

export async function generateMetadata({ params }: Props) {
  const { id, locale } = await params;
  const stationId = decodeURIComponent(id);
  const station = await getStation(stationId);
  if (!station) notFound();
  const copy = stationSeo(station, locale);
  const encodedId = encodeURIComponent(stationId);

  return {
    title: copy.title,
    description: copy.description,
    alternates: localizedAlternates(locale, `/stations/${encodedId}`),
    twitter: {
      card: "summary_large_image" as const,
      title: `${copy.title} — Openwind`,
      description: copy.description,
      images: [DEFAULT_OG_IMAGE],
    },
    openGraph: {
      title: `${copy.title} — Openwind`,
      description: copy.description,
      url: localizedUrl(locale, `/stations/${encodedId}`),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function StationPage({ params }: Props) {
  const { id, locale } = await params;
  const stationId = decodeURIComponent(id);

  // Look up station metadata from the 10-min cron snapshot — single DB query,
  // ~5× faster than re-fetching all 5 networks on every page hit.
  const station = await getStation(stationId);
  if (!station) notFound();

  // Fetch live wind, 48h history and 7-day forecast in parallel.
  // allowOpenMeteoFallback=false → show stale obs with isFresh=false badge
  // rather than an Open-Meteo estimate (page is dedicated to THIS station).
  const [
    liveResult,
    bundleResult,
    forecastResult,
    swissWeatherResult,
    connectionsResult,
  ] = await Promise.allSettled([
    getStationLive(stationId, {
      lat: station.lat,
      lng: station.lng,
      allowOpenMeteoFallback: false,
    }),
    getStationHistory(stationId, { lat: station.lat, lng: station.lng }),
    fetchFullForecast(station.lat, station.lng),
    station.source === "meteoswiss"
      ? getMeteoSwissStationWeather(stationId)
      : Promise.resolve(null),
    resolveStationConnections(stationId),
  ]);

  // StationPageClient still consumes a flat HistoryPoint[] — keep that contract
  // while Phase 4 hasn't migrated it to WindHistoryBundle.
  const bundle =
    bundleResult.status === "fulfilled" ? bundleResult.value : null;
  const history = bundle ? [...bundle.observations, ...bundle.forecast] : null;

  const live = liveResult.status === "fulfilled" ? liveResult.value : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(stationSchema(station, locale)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <StationPageClient
        station={station}
        live={live}
        forecast={
          forecastResult.status === "fulfilled" ? forecastResult.value : null
        }
        history={history}
        meteoswissWeather={
          swissWeatherResult.status === "fulfilled"
            ? swissWeatherResult.value
            : null
        }
        connections={
          connectionsResult.status === "fulfilled"
            ? connectionsResult.value
            : { spots: [], articles: [] }
        }
      />
    </>
  );
}
