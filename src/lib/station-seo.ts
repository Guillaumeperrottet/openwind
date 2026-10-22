import { NETWORK_LABELS } from "@/lib/stationConstants";
import { localizedUrl, toSiteLocale } from "@/lib/site";
import type { WindStation } from "@/lib/stations";

type StationIdentity = Pick<WindStation, "id" | "name" | "source">;

/** Describe the station, never a transient or possibly stale wind reading. */
export function stationSeo(station: StationIdentity, locale: string) {
  const name = station.name.replace(/\s+/g, " ").trim();
  const network = NETWORK_LABELS[station.source];
  const copy = {
    fr: {
      title: `Vent à ${name} : balise ${network} et prévisions`,
      description: `${name} : vent et rafales de la balise ${network}, historique sur 48 h et prévisions à 7 jours. Consultez la source et l’heure des mesures.`,
      lead: `Cette page réunit les observations de la balise ${network} ${name}, leur historique sur 48 h et les prévisions à 7 jours. Les mesures décrivent la station ; les prévisions sont calculées par un modèle météo.`,
      home: "Accueil",
      stations: "Balises de vent",
    },
    de: {
      title: `Wind ${name}: ${network}-Station und Prognose`,
      description: `${name}: Wind und Böen der ${network}-Station, 48-Stunden-Verlauf und 7-Tage-Prognose. Prüfe Quelle und Zeitpunkt der Messwerte.`,
      lead: `Hier findest du Beobachtungen der ${network}-Station ${name}, den 48-Stunden-Verlauf und die 7-Tage-Prognose. Messwerte beschreiben den Stationsstandort; Prognosen stammen aus einem Wettermodell.`,
      home: "Startseite",
      stations: "Windstationen",
    },
    it: {
      title: `Vento a ${name}: stazione ${network} e previsioni`,
      description: `${name}: vento e raffiche della stazione ${network}, storico di 48 ore e previsioni a 7 giorni. Verifica fonte e ora delle misure.`,
      lead: `Qui trovi le osservazioni della stazione ${network} ${name}, lo storico di 48 ore e le previsioni a 7 giorni. Le misure descrivono la stazione; le previsioni sono calcolate da un modello meteorologico.`,
      home: "Home",
      stations: "Stazioni del vento",
    },
    en: {
      title: `Wind at ${name}: ${network} station and forecast`,
      description: `${name}: wind and gusts from the ${network} station, 48-hour history and 7-day forecast. Check the source and time of each measurement.`,
      lead: `This page brings together observations from the ${network} station ${name}, a 48-hour history and a 7-day forecast. Measurements describe the station location; forecasts come from a weather model.`,
      home: "Home",
      stations: "Wind stations",
    },
  };
  return copy[toSiteLocale(locale)];
}

export function stationSchema(
  station: StationIdentity & Pick<WindStation, "lat" | "lng">,
  locale: string,
) {
  const language = toSiteLocale(locale);
  const copy = stationSeo(station, language);
  const url = localizedUrl(
    language,
    `/stations/${encodeURIComponent(station.id)}`,
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: copy.title,
        description: copy.description,
        inLanguage: language,
        about: {
          "@type": "Place",
          name: station.name,
          geo: {
            "@type": "GeoCoordinates",
            latitude: station.lat,
            longitude: station.lng,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: copy.home,
            item: localizedUrl(language),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.stations,
            item: localizedUrl(language, "/balises"),
          },
          { "@type": "ListItem", position: 3, name: station.name, item: url },
        ],
      },
    ],
  };
}
