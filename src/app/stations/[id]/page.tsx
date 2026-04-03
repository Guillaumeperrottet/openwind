import { notFound } from "next/navigation";
import { fetchMeteoSwissStations } from "@/lib/stations";
import {
  fetchCurrentWind,
  fetchWindHistory,
  fetchWindHistoryStation,
} from "@/lib/wind";
import { fetchFullForecast } from "@/lib/forecast";
import { StationPageClient } from "./StationPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Openkite - Station ${decodeURIComponent(id)}`,
  };
}

export default async function StationPage({ params }: Props) {
  const { id } = await params;
  const stationId = decodeURIComponent(id);

  const stations = await fetchMeteoSwissStations();
  const station = stations.find((s) => s.id === stationId);

  if (!station) notFound();

  // Fetch Open-Meteo gusts + full 7-day forecast + 48h history in parallel.
  // History: real MeteoSwiss 10-min measurements, falling back to Open-Meteo NWP.
  const [openMeteoResult, forecastResult, historyResult] =
    await Promise.allSettled([
      fetchCurrentWind(station.lat, station.lng),
      fetchFullForecast(station.lat, station.lng),
      fetchWindHistoryStation(station.id).catch(() =>
        fetchWindHistory(station.lat, station.lng),
      ),
    ]);

  const gustsKmh =
    openMeteoResult.status === "fulfilled"
      ? openMeteoResult.value.gustsKmh
      : null;

  const openMeteoUpdatedAt =
    openMeteoResult.status === "fulfilled"
      ? (openMeteoResult.value.updatedAt ?? null)
      : null;

  return (
    <StationPageClient
      station={station}
      gustsKmh={gustsKmh}
      openMeteoUpdatedAt={openMeteoUpdatedAt}
      forecast={
        forecastResult.status === "fulfilled" ? forecastResult.value : null
      }
      history={
        historyResult.status === "fulfilled" ? historyResult.value : null
      }
    />
  );
}
