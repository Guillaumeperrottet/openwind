import type { SiteLocale } from "@/lib/site";

export const WATER_COPY: Record<SiteLocale, {
  title: string; subtitle: string; validAt: string; unavailable: string; stale: string;
  details: string; explanation: string; forecast: string; forecastNote: string;
  day: string; range: string; loading: string; rounded: string;
}> = {
  fr: {
    title: "Température de l’eau", subtitle: "Lac de la Gruyère · estimation à 1 m",
    validAt: "Estimation pour le", unavailable: "Estimation momentanément indisponible", stale: "Estimation ancienne",
    details: "Prévisions et source", explanation: "Le modèle Simstrat représente le lac par une colonne d’eau. La température au bord peut différer de cette estimation. Il ne s’agit pas d’une mesure à Morlon ; Openwind n’ajoute pas de correction locale.",
    forecast: "Les prochains jours", forecastNote: "Plage des estimations disponibles aux heures indiquées, à 1 m de profondeur.",
    day: "Jour et heures", range: "Eau estimée", loading: "Chargement de l’estimation de l’eau…", rounded: "Valeurs arrondies au dixième de degré.",
  },
  en: {
    title: "Water temperature", subtitle: "Lake Gruyère · estimate at 1 m",
    validAt: "Estimate for", unavailable: "Estimate temporarily unavailable", stale: "Outdated estimate",
    details: "Forecast and source", explanation: "The Simstrat model represents the lake as a water column. Shore temperatures may differ. This is not a measurement at Morlon; Openwind adds no local correction.",
    forecast: "The next few days", forecastNote: "Range of available estimates during the hours shown, at 1 m depth.",
    day: "Day and hours", range: "Estimated water", loading: "Loading the water temperature estimate…", rounded: "Values rounded to one decimal place.",
  },
  de: {
    title: "Wassertemperatur", subtitle: "Greyerzersee · Schätzung in 1 m Tiefe",
    validAt: "Schätzung für den", unavailable: "Schätzung vorübergehend nicht verfügbar", stale: "Veraltete Schätzung",
    details: "Prognose und Quelle", explanation: "Das Simstrat-Modell stellt den See als Wassersäule dar. Die Temperatur am Ufer kann abweichen. Dies ist keine Messung in Morlon; Openwind ergänzt keine lokale Korrektur.",
    forecast: "Die nächsten Tage", forecastNote: "Bereich der verfügbaren Schätzungen zu den angegebenen Zeiten in 1 m Tiefe.",
    day: "Tag und Uhrzeiten", range: "Geschätztes Wasser", loading: "Schätzung der Wassertemperatur wird geladen…", rounded: "Werte auf eine Nachkommastelle gerundet.",
  },
  it: {
    title: "Temperatura dell’acqua", subtitle: "Lago della Gruyère · stima a 1 m",
    validAt: "Stima per il", unavailable: "Stima temporaneamente non disponibile", stale: "Stima non recente",
    details: "Previsioni e fonte", explanation: "Il modello Simstrat rappresenta il lago come una colonna d’acqua. La temperatura a riva può differire. Non è una misura a Morlon; Openwind non aggiunge correzioni locali.",
    forecast: "I prossimi giorni", forecastNote: "Intervallo delle stime disponibili negli orari indicati, a 1 m di profondità.",
    day: "Giorno e orari", range: "Acqua stimata", loading: "Caricamento della stima dell’acqua…", rounded: "Valori arrotondati al decimo di grado.",
  },
};
