import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStationCatalog } from "@/lib/station-catalog";
import {
  directoryPagePath,
  filterDirectoryStations,
  isInStationDirectory,
  parseDirectoryQuery,
  STATION_PAGE_SIZE,
} from "@/lib/stationDirectory";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";
import { StationsDirectoryClient } from "./StationsDirectoryClient";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const COPY = {
  fr: {
    title: "Balises météo et vent en direct en Suisse",
    description:
      "Consultez les balises de vent MétéoSuisse, Pioupiou, Windball et autres réseaux en Suisse : vent, rafales, direction et historique 48 h.",
  },
  en: {
    title: "Live weather and wind stations in Switzerland",
    description:
      "Browse MeteoSwiss, Pioupiou, Windball and other wind stations in Switzerland with live wind, gusts, direction and 48-hour history.",
  },
  de: {
    title: "Live-Wetter- und Windstationen in der Schweiz",
    description:
      "MeteoSchweiz-, Pioupiou-, Windball- und weitere Windstationen in der Schweiz mit Wind, Böen, Richtung und 48-Stunden-Verlauf.",
  },
  it: {
    title: "Stazioni meteo e vento in diretta in Svizzera",
    description:
      "Consulta le stazioni MeteoSvizzera, Pioupiou, Windball e altre reti in Svizzera con vento, raffiche, direzione e storico di 48 ore.",
  },
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = parseDirectoryQuery(await searchParams);
  const filtered = Boolean(
    query.query || query.source !== "all" || query.sort !== "name",
  );
  const path = filtered ? "/balises" : directoryPagePath(query, query.page);
  const copy = COPY[toSiteLocale(locale)];

  return {
    title: query.page > 1 ? `${copy.title} · ${query.page}` : copy.title,
    description: copy.description,
    alternates: localizedAlternates(locale, path),
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${copy.title} — Openwind`,
      description: copy.description,
      url: localizedUrl(locale, path),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function StationsDirectoryPage({
  params,
  searchParams,
}: Props) {
  const [{ locale }, rawQuery, catalog] = await Promise.all([
    params,
    searchParams,
    getStationCatalog(),
  ]);
  const query = parseDirectoryQuery(rawQuery);
  const stations = catalog.filter(isInStationDirectory);
  const total = filterDirectoryStations(stations, query, locale).length;
  if (query.page > Math.max(1, Math.ceil(total / STATION_PAGE_SIZE)))
    notFound();

  return (
    <StationsDirectoryClient
      key={JSON.stringify(query)}
      initialStations={stations}
      initialQuery={query}
    />
  );
}
