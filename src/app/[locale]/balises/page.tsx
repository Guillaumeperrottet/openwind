import type { Metadata } from "next";
import { getStationsFromCache } from "@/lib/stationData";
import { isInStationDirectory } from "@/lib/stationDirectory";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";
import { StationsDirectoryClient } from "./StationsDirectoryClient";

interface Props {
  params: Promise<{ locale: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[toSiteLocale(locale)];

  return {
    title: copy.title,
    description: copy.description,
    alternates: localizedAlternates(locale, "/balises"),
    openGraph: {
      title: `${copy.title} — Openwind`,
      description: copy.description,
      url: localizedUrl(locale, "/balises"),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function StationsDirectoryPage() {
  const stations = (await getStationsFromCache())
    .filter(isInStationDirectory)
    .sort((a, b) => a.name.localeCompare(b.name));

  return <StationsDirectoryClient initialStations={stations} />;
}
