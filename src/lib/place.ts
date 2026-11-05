import { withoutLocale } from "./access";
import type { SiteLocale } from "./site";

export type Place = { kind: "lake" | "spot" | "station" | "area"; id: string; name: string; lat: number; lng: number; guideSlug?: string };
export type PlaceFeature = "wind" | "webcams" | "water";
export function validPlace(value: unknown): value is Place {
  if (!value || typeof value !== "object") return false;
  const p = value as Place;
  return ["lake", "spot", "station", "area"].includes(p.kind) && typeof p.id === "string" && p.id.length > 0 && p.id.length <= 180 && typeof p.name === "string" && p.name.length > 0 && p.name.length <= 150 && Number.isFinite(p.lat) && Math.abs(p.lat) <= 90 && Number.isFinite(p.lng) && Math.abs(p.lng) <= 180 && (p.guideSlug === undefined || /^[a-z0-9-]{1,100}$/.test(p.guideSlug));
}
export function parsePlaceRef(ref: string | null): { kind: Place["kind"]; id: string } | null {
  if (!ref || ref.length > 190) return null;
  const match = /^(lake|spot|station|area):(.+)$/.exec(ref);
  if (!match) return null;
  const [, kind, id] = match;
  if (kind === "area") {
    const coords = id.split(",");
    if (coords.length !== 2 || coords.some(c => !c.trim() || !Number.isFinite(Number(c))) || Math.abs(Number(coords[0])) > 90 || Math.abs(Number(coords[1])) > 180) return null;
  } else if (!/^[a-zA-Z0-9_.:-]{1,160}$/.test(id)) return null;
  return { kind: kind as Place["kind"], id };
}
export const placeRef = (p: Place) => `${p.kind}:${p.id}`;
export const hasWater = (p: Place) => p.guideSlug === "lac-de-la-gruyere";
export function placePlannerPath(place: Place | null) {
  return place ? `/plan?${new URLSearchParams({ lat: String(place.lat), lng: String(place.lng), place: place.name, radius: "50" })}` : "/plan";
}
export function contextualHref(href: string, place: Place | null, locale: SiteLocale) {
  const path = withoutLocale(href);
  return path === "/plan" && place ? `/${locale}${placePlannerPath(place)}` : path === "/webcams" ? placeFeatureHref("webcams", place, locale) : path === "/temperatures" ? placeFeatureHref("water", place, locale) : href;
}
export function placeRouteRef(pathname: string) {
  const path = withoutLocale(pathname);
  const match = /^\/(spots|stations|vent-en-direct)\/([^/]+)$/.exec(path);
  if (match && match[2] !== "new") {
    try { return `${match[1] === "spots" ? "spot" : match[1] === "stations" ? "station" : "lake"}:${decodeURIComponent(match[2])}`; } catch { return null; }
  }
  return path === "/lacs/gruyere" ? "lake:lac-de-la-gruyere" : null;
}
export function placeFeatureHref(feature: PlaceFeature, place: Place | null, locale: SiteLocale) {
  if (!place) return `/${locale}/${feature === "wind" ? "balises" : feature === "water" ? "temperatures" : "webcams"}`;
  const context = new URLSearchParams({ place: placeRef(place) });
  if (place.kind === "area") context.set("placeName", place.name);
  if (feature === "webcams") {
    context.set("lat", String(place.lat)); context.set("lng", String(place.lng)); context.set("name", place.name);
    return `/${locale}/webcams?${context}`;
  }
  if (feature === "water") return `/${locale}/temperatures?${context}`;
  if (place.kind === "spot") return `/${locale}/spots/${encodeURIComponent(place.id)}`;
  if (place.kind === "station") return `/${locale}/stations/${encodeURIComponent(place.id)}`;
  if (place.guideSlug) return `/${locale === "en" ? "fr" : locale}/vent-en-direct/${place.guideSlug}?${context}#vent-direct`;
  return `/${locale}?view=map&${context}`;
}

export const PLACE_COPY = {
  fr: { current: "Lieu consulté", change: "Changer de lieu", clear: "Effacer le lieu sélectionné", wind: "Vent mesuré", webcams: "Webcams", water: "Eau", allWind: "Toutes les balises", allWebcams: "Choisir un lieu", allWater: "Lacs disponibles", spot: "Fiche du spot", station: "Fiche de la balise", lakeWind: "Balises du lac", around: "Autour du lieu", waterYes: "La Gruyère", waterNo: "Voir la couverture", unavailable: "La température de l’eau n’est pas encore intégrée pour ce lieu. Le lac de la Gruyère est disponible ci-dessous.", conditions: "Consulter les conditions", search: "Rechercher dans tout Openwind", searchHelp: "Lieux, conditions, articles, Forum et fonctionnalités.", guide: "Ouvrir le guide du vent", page: "Fonctionnalités", discussion: "Forum et discussions", waterKind: "Températures de l’eau", results: "Résultats de recherche", searchButton: "Rechercher", seeAll: "Voir tous les résultats", noQuery: "Recherchez un lieu, des conditions, un article ou une fonctionnalité.", previous: "Précédent", next: "Suivant", countOne: "résultat", count: "résultats", resultsEmpty: "Aucun résultat. Essayez un autre nom ou parcourez Explorer.", filters: "Types de résultats" },
  en: { current: "Selected place", change: "Change place", clear: "Clear selected place", wind: "Measured wind", webcams: "Webcams", water: "Water", allWind: "All stations", allWebcams: "Choose a place", allWater: "Available lakes", spot: "Spot details", station: "Station details", lakeWind: "Lake stations", around: "Around this place", waterYes: "Lake Gruyère", waterNo: "See coverage", unavailable: "Water temperature is not yet integrated for this place. Lake Gruyère is available below.", conditions: "Check conditions", search: "Search all of Openwind", searchHelp: "Places, conditions, articles, forum and features.", guide: "Open the wind guide", page: "Features", discussion: "Forum and discussions", waterKind: "Water temperatures", results: "Search results", searchButton: "Search", seeAll: "See all results", noQuery: "Find a place, conditions, an article or a feature.", previous: "Previous", next: "Next", countOne: "result", count: "results", resultsEmpty: "No results. Try another name or browse Explore.", filters: "Result types" },
  de: { current: "Ausgewählter Ort", change: "Ort wechseln", clear: "Ausgewählten Ort löschen", wind: "Gemessener Wind", webcams: "Webcams", water: "Wasser", allWind: "Alle Stationen", allWebcams: "Ort auswählen", allWater: "Verfügbare Seen", spot: "Spot ansehen", station: "Station ansehen", lakeWind: "Stationen am See", around: "In der Umgebung", waterYes: "Greyerzersee", waterNo: "Abdeckung ansehen", unavailable: "Für diesen Ort ist die Wassertemperatur noch nicht integriert. Der Greyerzersee ist unten verfügbar.", conditions: "Bedingungen ansehen", search: "Ganz Openwind durchsuchen", searchHelp: "Orte, Bedingungen, Artikel, Forum und Funktionen.", guide: "Windguide öffnen", page: "Funktionen", discussion: "Forum und Diskussionen", waterKind: "Wassertemperaturen", results: "Suchergebnisse", searchButton: "Suchen", seeAll: "Alle Ergebnisse ansehen", noQuery: "Orte, Bedingungen, Artikel oder Funktionen suchen.", previous: "Zurück", next: "Weiter", countOne: "Ergebnis", count: "Ergebnisse", resultsEmpty: "Keine Ergebnisse. Versuchen Sie einen anderen Namen oder öffnen Sie Entdecken.", filters: "Ergebnistypen" },
  it: { current: "Luogo selezionato", change: "Cambia luogo", clear: "Cancella il luogo selezionato", wind: "Vento misurato", webcams: "Webcam", water: "Acqua", allWind: "Tutte le stazioni", allWebcams: "Scegli un luogo", allWater: "Laghi disponibili", spot: "Scheda dello spot", station: "Scheda della stazione", lakeWind: "Stazioni del lago", around: "Vicino al luogo", waterYes: "La Gruyère", waterNo: "Vedi copertura", unavailable: "La temperatura dell’acqua non è ancora integrata per questo luogo. Il lago della Gruyère è disponibile qui sotto.", conditions: "Consulta le condizioni", search: "Cerca in tutto Openwind", searchHelp: "Luoghi, condizioni, articoli, forum e funzionalità.", guide: "Apri la guida del vento", page: "Funzionalità", discussion: "Forum e discussioni", waterKind: "Temperature dell’acqua", results: "Risultati di ricerca", searchButton: "Cerca", seeAll: "Vedi tutti i risultati", noQuery: "Cerca un luogo, le condizioni, un articolo o una funzionalità.", previous: "Precedente", next: "Successivo", countOne: "risultato", count: "risultati", resultsEmpty: "Nessun risultato. Prova un altro nome o visita Esplora.", filters: "Tipi di risultati" },
} as const;
