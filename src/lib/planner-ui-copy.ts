import type { SiteLocale } from "./site";
import type { ReviewStatus } from "./planner-review";
type UI = {
  weatherResults: string;
  weatherIntro: string;
  forecastList: string;
  withForecast: string;
  noReviewedWindow: string;
  noDaylightForecast: string;
  weatherMaxima: string;
  windMax: string;
  gustMax: string;
  highGusts: string;
  highWind: string;
  preview: string;
  filterSpots: string;
  noFilterMatches: string;
  windPeak: string;
  gustPeak: string;

  edit: string;
  details: string;
  documented: string;
  pending: string;
  reviewed: string;
  until: string;
  sources: string;
  scope: string;
  missing: string;
  qualified: string;
  longest: string;
  closest: string;
  best: string;
  alternative: string;
  recenter: string;
  cluster: string;
  expand: string;
  members: string;
  mapLegend: string;
  status: Record<ReviewStatus, string>;
};
export const plannerUiCopy: Record<SiteLocale, UI> = {
  fr: {
    weatherResults: "Le vent autour de vous",
    weatherIntro:
      "Vent et rafales prévus sur tous les spots du périmètre, avec le statut documentaire de chaque fiche.",
    forecastList: "Spots et prévisions",
    withForecast: "avec prévisions en journée",
    noReviewedWindow:
      "Aucun créneau ne passe tous les filtres sur les profils documentés. Les prévisions des autres spots sont affichées ci-dessous.",
    noDaylightForecast:
      "Aucune donnée de vent exploitable en journée pour ces dates. Les fiches restent consultables.",
    weatherMaxima: "Maxima prévus en journée",
    windMax: "Vent max.",
    gustMax: "Rafales max.",
    highGusts: "Rafales pouvant dépasser les seuils du planificateur",
    highWind: "Vent pouvant dépasser les seuils du planificateur",
    preview: "Prévisions météo · aucun créneau retenu",
    filterSpots: "Rechercher un spot dans cette liste",
    noFilterMatches: "Aucun spot ne correspond à ce nom dans le périmètre.",
    windPeak: "Pic de vent prévu",
    gustPeak: "Pic de rafales prévu",

    edit: "Modifier",
    details: "Détails et sources",
    documented: "Profil documenté",
    pending: "À documenter",
    reviewed: "Revue documentaire",
    until: "valable jusqu’au",
    sources: "Sources locales",
    scope:
      "Discipline, orientations, saison et conditions d’accès documentées. Ce profil ne certifie ni la sécurité ni l’ensemble des informations de la fiche.",
    missing:
      "Les fiches non documentées restent consultables, mais ne participent pas aux recommandations. Aucune piste n’est inventée pour compléter le classement.",
    qualified: "profils documentés pour ces critères",
    longest: "Le créneau le plus long des spots documentés",
    closest:
      "Le plus proche à vol d’oiseau parmi les spots documentés avec un créneau",
    best: "Le meilleur indice météo des spots documentés",
    alternative: "Une autre option avec un créneau documenté",
    recenter: "Recentrer",
    cluster: "Groupe de",
    expand: "spots · agrandir",
    members: "Spots de ce groupe",
    mapLegend:
      "Bleu : recommandation · Gris : catalogue · Cercle blanc : nombre de spots",
    status: {
      DOCUMENTED: "Profil documenté",
      MISSING: "Profil à documenter",
      NEEDS_REVIEW: "Fiche à revoir",
      EXPIRED: "Revue expirée",
      CHANGED: "Fiche modifiée · revue nécessaire",
      OTHER_DISCIPLINE: "Autre discipline",
      OUT_OF_SEASON: "Hors saison documentée",
      CLOSED: "Accès fermé selon la source",
    },
  },
  de: {
    weatherResults: "Wind in deiner Nähe",
    weatherIntro:
      "Wind- und Böenprognosen für alle Spots im Umkreis, mit Dokumentationsstatus jedes Profils.",
    forecastList: "Spots und Prognosen",
    withForecast: "mit Tageslichtprognosen",
    noReviewedWindow:
      "Kein Zeitfenster der dokumentierten Profile erfüllt alle Filter. Die Prognosen der übrigen Spots findest du unten.",
    noDaylightForecast:
      "Keine nutzbaren Winddaten bei Tageslicht für diese Daten. Die Spots bleiben zugänglich.",
    weatherMaxima: "Prognostizierte Tageslichtmaxima",
    windMax: "Wind max.",
    gustMax: "Böen max.",
    highGusts: "Böen können die Grenzwerte des Planers überschreiten",
    highWind: "Wind kann die Grenzwerte des Planers überschreiten",
    preview: "Wetterprognose · kein Zeitfenster ausgewählt",
    filterSpots: "Spot in dieser Liste suchen",
    noFilterMatches: "Kein Spot mit diesem Namen im Umkreis.",
    windPeak: "Prognostiziertes Windmaximum",
    gustPeak: "Prognostiziertes Böenmaximum",

    edit: "Ändern",
    details: "Details und Quellen",
    documented: "Profil dokumentiert",
    pending: "Zu dokumentieren",
    reviewed: "Dokumentenprüfung",
    until: "gültig bis",
    sources: "Lokale Quellen",
    scope:
      "Disziplin, Windsektoren, Saison und Zugangsbedingungen dokumentiert. Das Profil bestätigt weder Sicherheit noch sämtliche Katalogangaben.",
    missing:
      "Nicht dokumentierte Spots bleiben zugänglich, erscheinen aber nicht in den Empfehlungen. Die Rangliste wird nicht mit unbelegten Vorschlägen ergänzt.",
    qualified: "dokumentierte Profile für diese Kriterien",
    longest: "Das längste Zeitfenster der dokumentierten Spots",
    closest: "Der nächste dokumentierte Spot mit Zeitfenster (Luftlinie)",
    best: "Der beste Wetterindex der dokumentierten Spots",
    alternative: "Eine weitere Option mit dokumentiertem Zeitfenster",
    recenter: "Zentrieren",
    cluster: "Gruppe mit",
    expand: "Spots · vergrössern",
    members: "Spots dieser Gruppe",
    mapLegend: "Blau: Empfehlung · Grau: Katalog · Weisser Kreis: Anzahl Spots",
    status: {
      DOCUMENTED: "Profil dokumentiert",
      MISSING: "Profil zu dokumentieren",
      NEEDS_REVIEW: "Spot überprüfen",
      EXPIRED: "Prüfung abgelaufen",
      CHANGED: "Spot geändert · erneut prüfen",
      OTHER_DISCIPLINE: "Andere Disziplin",
      OUT_OF_SEASON: "Ausserhalb dokumentierter Saison",
      CLOSED: "Zugang laut Quelle geschlossen",
    },
  },
  it: {
    weatherResults: "Il vento vicino a te",
    weatherIntro:
      "Vento e raffiche previsti per tutti gli spot nel raggio, con lo stato documentale di ogni scheda.",
    forecastList: "Spot e previsioni",
    withForecast: "con previsioni diurne",
    noReviewedWindow:
      "Nessuna finestra dei profili documentati supera tutti i filtri. Le previsioni degli altri spot sono disponibili qui sotto.",
    noDaylightForecast:
      "Nessun dato di vento diurno utilizzabile per queste date. Le schede restano consultabili.",
    weatherMaxima: "Massimi previsti di giorno",
    windMax: "Vento max.",
    gustMax: "Raffiche max.",
    highGusts: "Le raffiche possono superare le soglie del pianificatore",
    highWind: "Il vento può superare le soglie del pianificatore",
    preview: "Previsioni meteo · nessuna finestra selezionata",
    filterSpots: "Cerca uno spot in questa lista",
    noFilterMatches: "Nessuno spot con questo nome nel raggio.",
    windPeak: "Picco di vento previsto",
    gustPeak: "Picco di raffiche previsto",

    edit: "Modifica",
    details: "Dettagli e fonti",
    documented: "Profilo documentato",
    pending: "Da documentare",
    reviewed: "Verifica documentale",
    until: "valida fino al",
    sources: "Fonti locali",
    scope:
      "Disciplina, settori del vento, stagione e condizioni di accesso documentati. Il profilo non certifica la sicurezza né tutte le informazioni della scheda.",
    missing:
      "Le schede non documentate restano accessibili, ma non entrano nei consigli. La classifica non viene completata con proposte prive di riscontri.",
    qualified: "profili documentati per questi criteri",
    longest: "La finestra più lunga degli spot documentati",
    closest:
      "Il più vicino in linea d’aria tra gli spot documentati con una finestra",
    best: "Il miglior indice meteo degli spot documentati",
    alternative: "Un’altra opzione con una finestra documentata",
    recenter: "Ricentra",
    cluster: "Gruppo di",
    expand: "spot · ingrandisci",
    members: "Spot di questo gruppo",
    mapLegend:
      "Blu: consiglio · Grigio: catalogo · Cerchio bianco: numero di spot",
    status: {
      DOCUMENTED: "Profilo documentato",
      MISSING: "Profilo da documentare",
      NEEDS_REVIEW: "Scheda da verificare",
      EXPIRED: "Verifica scaduta",
      CHANGED: "Scheda modificata · da verificare",
      OTHER_DISCIPLINE: "Altra disciplina",
      OUT_OF_SEASON: "Fuori stagione documentata",
      CLOSED: "Accesso chiuso secondo la fonte",
    },
  },
  en: {
    weatherResults: "Wind near you",
    weatherIntro:
      "Wind and gust forecasts for every spot in the area, with each profile’s documentary status.",
    forecastList: "Spots and forecasts",
    withForecast: "with daylight forecasts",
    noReviewedWindow:
      "No window on the documented profiles meets every filter. Forecasts for the other spots are shown below.",
    noDaylightForecast:
      "No usable daylight wind data for these dates. Spot pages remain accessible.",
    weatherMaxima: "Forecast daylight maxima",
    windMax: "Max. wind",
    gustMax: "Max. gusts",
    highGusts: "Gusts may exceed the planner thresholds",
    highWind: "Wind may exceed the planner thresholds",
    preview: "Weather forecast · no selected window",
    filterSpots: "Find a spot in this list",
    noFilterMatches: "No spot with this name in the area.",
    windPeak: "Forecast wind peak",
    gustPeak: "Forecast gust peak",

    edit: "Edit",
    details: "Details and sources",
    documented: "Documented profile",
    pending: "To document",
    reviewed: "Documentary review",
    until: "valid until",
    sources: "Local sources",
    scope:
      "Discipline, wind sectors, season and access conditions documented. This profile certifies neither safety nor every catalogue detail.",
    missing:
      "Undocumented spots remain accessible but do not enter recommendations. The ranking is never padded with unsupported suggestions.",
    qualified: "documented profiles for these criteria",
    longest: "The longest window among documented spots",
    closest:
      "The closest documented spot with a window, by straight-line distance",
    best: "The highest weather index among documented spots",
    alternative: "Another option with a documented window",
    recenter: "Recenter",
    cluster: "Group of",
    expand: "spots · expand",
    members: "Spots in this group",
    mapLegend:
      "Blue: recommendation · Grey: catalogue · White circle: spot count",
    status: {
      DOCUMENTED: "Documented profile",
      MISSING: "Profile to document",
      NEEDS_REVIEW: "Spot needs review",
      EXPIRED: "Review expired",
      CHANGED: "Spot changed · review needed",
      OTHER_DISCIPLINE: "Other discipline",
      OUT_OF_SEASON: "Outside documented season",
      CLOSED: "Access closed according to source",
    },
  },
};
