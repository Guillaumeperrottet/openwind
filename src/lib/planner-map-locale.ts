import type { SiteLocale } from "./site";
const words: Record<SiteLocale, string[]> = {
  fr: [
    "Agrandir",
    "Réduire",
    "Afficher les attributions",
    "Carte des spots",
    "Utilisez deux doigts pour déplacer la carte",
    "Utilisez Ctrl + défilement pour agrandir la carte",
    "Utilisez ⌘ + défilement pour agrandir la carte",
  ],
  de: [
    "Vergrössern",
    "Verkleinern",
    "Quellen anzeigen",
    "Spot-Karte",
    "Die Karte mit zwei Fingern verschieben",
    "Mit Ctrl + Scrollen die Karte vergrössern",
    "Mit ⌘ + Scrollen die Karte vergrössern",
  ],
  it: [
    "Ingrandisci",
    "Riduci",
    "Mostra attribuzioni",
    "Mappa degli spot",
    "Usa due dita per spostare la mappa",
    "Usa Ctrl + scorrimento per ingrandire la mappa",
    "Usa ⌘ + scorrimento per ingrandire la mappa",
  ],
  en: [
    "Zoom in",
    "Zoom out",
    "Show attribution",
    "Spot map",
    "Use two fingers to move the map",
    "Use Ctrl + scroll to zoom the map",
    "Use ⌘ + scroll to zoom the map",
  ],
};
export function plannerMapLocale(locale: SiteLocale): Record<string, string> {
  return Object.fromEntries(
    [
      "NavigationControl.ZoomIn",
      "NavigationControl.ZoomOut",
      "AttributionControl.ToggleAttribution",
      "Map.Title",
      "CooperativeGesturesHandler.MobileHelpText",
      "CooperativeGesturesHandler.WindowsHelpText",
      "CooperativeGesturesHandler.MacHelpText",
    ].map((key, i) => [key, words[locale][i]]),
  );
}
