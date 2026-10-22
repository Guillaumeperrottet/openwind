import type { SiteLocale } from "./site";
import type { ReviewStatus } from "./planner-review";
type UI = {
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
