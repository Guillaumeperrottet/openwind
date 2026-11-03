import type { SiteLocale } from "./site";

type Copy = {
  title: string; intro: string; back: string; reading: string; depth: string;
  next: string; evolution: string; past: string; future: string; now: string;
  scale: string; hourly: string; time: string; temperature: string; timezone: string;
  meaning: string; explanation: string; sources: string; sourceNote: string;
  around: string; morlon: string; wind: string; loading: string; empty: string;
  noCurve: string; staleForecast: string; retry: string; sampleRange: string;
};
export const LAKE_PAGE_COPY: Record<SiteLocale, Copy> = {
  fr: {
    title: "Lac de la Gruyère", intro: "La température de l’eau pour préparer votre prochaine sortie.", back: "Carte des spots",
    reading: "Température estimée de l’eau", depth: "À 1 m de profondeur", next: "Les prochains jours", evolution: "Évolution de l’eau",
    past: "Passé modélisé", future: "Prévisions", now: "Maintenant", scale: "Échelle verticale agrandie", hourly: "Voir les valeurs par heure",
    time: "Jour et heure", temperature: "Eau estimée", timezone: "Heures suisses. Points de modèle espacés d’environ 3 h.",
    meaning: "Comment lire cette estimation", explanation: "Simstrat représente le lac par une seule colonne d’eau. Il ne calcule pas les différences entre les plages. La température au bord peut donc être différente.",
    sources: "Données et source", sourceNote: "Estimation Alplakes / Eawag, sans correction locale Openwind. Aucune mesure de sonde en direct n’est utilisée pour cette page. Valeurs arrondies au dixième.",
    around: "Préparer votre sortie", morlon: "Voir le spot de Morlon", wind: "Vent et balises du lac", loading: "Chargement de la température du lac…",
    empty: "L’estimation de l’eau est momentanément indisponible. Vous pouvez consulter les conditions de vent ou la source Alplakes.", noCurve: "Pas assez de points disponibles pour tracer l’évolution.",
    staleForecast: "Les données disponibles sont anciennes. Consultez la source pour les dernières prévisions.", retry: "Actualiser la page", sampleRange: "Plages des points disponibles, sur les heures indiquées.",
  },
  en: {
    title: "Lake Gruyère", intro: "Water temperature to help plan your next outing.", back: "Spot map",
    reading: "Estimated water temperature", depth: "At 1 m depth", next: "The next few days", evolution: "Water temperature trend",
    past: "Modelled past", future: "Forecast", now: "Now", scale: "Expanded vertical scale", hourly: "See hourly values",
    time: "Day and time", temperature: "Estimated water", timezone: "Swiss local time. Model points roughly 3 hours apart.",
    meaning: "Understanding this estimate", explanation: "Simstrat represents the lake as a single water column. It does not calculate differences between beaches. Shore temperatures may therefore differ.",
    sources: "Data and source", sourceNote: "Alplakes / Eawag estimate, without an Openwind local correction. This page uses no live water sensor measurements. Values rounded to one decimal place.",
    around: "Plan your outing", morlon: "See the Morlon spot", wind: "Lake wind and stations (French)", loading: "Loading lake temperature…",
    empty: "The water estimate is temporarily unavailable. You can still check wind conditions or visit Alplakes.", noCurve: "Not enough available points to show a trend.",
    staleForecast: "Available data is outdated. Check the source for the latest forecast.", retry: "Refresh the page", sampleRange: "Ranges of available model points during the hours shown.",
  },
  de: {
    title: "Greyerzersee", intro: "Die Wassertemperatur zur Vorbereitung Ihres nächsten Ausflugs.", back: "Spotkarte",
    reading: "Geschätzte Wassertemperatur", depth: "In 1 m Tiefe", next: "Die nächsten Tage", evolution: "Temperaturverlauf",
    past: "Modellierte Vergangenheit", future: "Prognose", now: "Jetzt", scale: "Vergrößerte vertikale Skala", hourly: "Stündliche Werte anzeigen",
    time: "Tag und Uhrzeit", temperature: "Geschätztes Wasser", timezone: "Schweizer Ortszeit. Modellwerte im Abstand von etwa 3 Stunden.",
    meaning: "Diese Schätzung verstehen", explanation: "Simstrat stellt den See als eine einzige Wassersäule dar. Unterschiede zwischen Stränden werden nicht berechnet. Die Temperatur am Ufer kann deshalb abweichen.",
    sources: "Daten und Quelle", sourceNote: "Schätzung von Alplakes / Eawag ohne lokale Korrektur durch Openwind. Diese Seite verwendet keine Echtzeitmessungen von Wassersonden. Auf eine Nachkommastelle gerundet.",
    around: "Den Ausflug vorbereiten", morlon: "Spot Morlon ansehen", wind: "Wind und Messstationen am See", loading: "Wassertemperatur wird geladen…",
    empty: "Die Schätzung ist vorübergehend nicht verfügbar. Winddaten und Alplakes bleiben zugänglich.", noCurve: "Zu wenige verfügbare Werte für einen Temperaturverlauf.",
    staleForecast: "Die verfügbaren Daten sind veraltet. Die aktuelle Prognose finden Sie bei der Quelle.", retry: "Seite aktualisieren", sampleRange: "Bereiche der verfügbaren Modellwerte zu den angegebenen Zeiten.",
  },
  it: {
    title: "Lago della Gruyère", intro: "La temperatura dell’acqua per preparare la prossima uscita.", back: "Mappa degli spot",
    reading: "Temperatura stimata dell’acqua", depth: "A 1 m di profondità", next: "I prossimi giorni", evolution: "Andamento della temperatura",
    past: "Passato modellato", future: "Previsioni", now: "Adesso", scale: "Scala verticale ingrandita", hourly: "Vedi i valori orari",
    time: "Giorno e ora", temperature: "Acqua stimata", timezone: "Ora locale svizzera. Punti del modello a circa 3 ore di distanza.",
    meaning: "Come leggere questa stima", explanation: "Simstrat rappresenta il lago come un’unica colonna d’acqua. Non calcola le differenze fra le spiagge. La temperatura a riva può quindi essere diversa.",
    sources: "Dati e fonte", sourceNote: "Stima Alplakes / Eawag senza correzione locale Openwind. Questa pagina non utilizza misure in diretta di sonde d’acqua. Valori arrotondati al decimo.",
    around: "Prepara la tua uscita", morlon: "Vedi lo spot di Morlon", wind: "Vento e stazioni del lago", loading: "Caricamento della temperatura del lago…",
    empty: "La stima dell’acqua è temporaneamente indisponibile. Puoi consultare il vento o la fonte Alplakes.", noCurve: "Punti disponibili insufficienti per mostrare l’andamento.",
    staleForecast: "I dati disponibili non sono recenti. Consulta la fonte per le ultime previsioni.", retry: "Aggiorna la pagina", sampleRange: "Intervalli dei punti disponibili negli orari indicati.",
  },
};
