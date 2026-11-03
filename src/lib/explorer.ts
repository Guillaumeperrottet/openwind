import { getLocalGuide, isGuideLocale } from "./local-guides";
import type { SiteLocale } from "./site";

type ExplorerCopy = {
  title: string; intro: string; places: string; allGuides: string; guide: string;
  gruyere: string; water: string; gruyereWind: string; conditions: string;
  stations: string; stationsDetail: string; webcams: string; webcamsDetail: string;
  learn: string; carnet: string; carnetDetail: string; forum: string; forumDetail: string;
  contribute: string; contributeDetail: string; about: string; french: string;
  sections: string; placesShort: string; conditionsShort: string; learnShort: string;
};
export const EXPLORER_COPY: Record<SiteLocale, ExplorerCopy> = {
  fr: {
    sections: "Dans Explorer", placesShort: "Lacs et régions", conditionsShort: "Conditions", learnShort: "Carnet et Forum",
    title: "Explorer", intro: "Trouvez votre lieu et les conditions pour votre prochaine sortie.", places: "Lacs et régions", allGuides: "Tous les guides locaux", guide: "Guide du vent",
    gruyere: "Lac de la Gruyère", water: "Température estimée de l’eau, évolution et accès aux spots.", gruyereWind: "Vent, balises et repères pour découvrir les spots du lac.", conditions: "Observer les conditions",
    stations: "Balises en direct", stationsDetail: "Retrouvez une station, ses mesures et son historique.", webcams: "Webcams", webcamsDetail: "Regardez les conditions sur place avant de partir.",
    learn: "Comprendre et échanger", carnet: "Le Carnet", carnetDetail: "Conseils, récits et expériences pour mieux connaître le terrain.", forum: "Le Forum", forumDetail: "Posez vos questions et partagez vos retours de session.",
    contribute: "Ajouter un spot", contributeDetail: "Partagez un lieu avec la communauté depuis votre compte.", about: "À propos d’Openwind", french: "En français",
  },
  en: {
    sections: "In Explore", placesShort: "Places", conditionsShort: "Conditions", learnShort: "Journal and Forum",
    title: "Explore", intro: "Find your place and the conditions for your next outing.", places: "Lakes and regions", allGuides: "All local guides", guide: "Wind guide",
    gruyere: "Lake Gruyère", water: "Estimated water temperature, trends and access to spots.", gruyereWind: "Wind, stations and local knowledge about the lake’s spots.", conditions: "Check the conditions",
    stations: "Live stations", stationsDetail: "Find a station, its readings and history.", webcams: "Webcams", webcamsDetail: "See conditions on location before heading out.",
    learn: "Learn and exchange", carnet: "The Journal", carnetDetail: "Advice, stories and field experience to understand the terrain.", forum: "The Forum", forumDetail: "Ask questions and share feedback from your sessions.",
    contribute: "Add a spot", contributeDetail: "Share a place with the community through your account.", about: "About Openwind", french: "In French",
  },
  de: {
    sections: "In Entdecken", placesShort: "Seen und Regionen", conditionsShort: "Bedingungen", learnShort: "Journal und Forum",
    title: "Entdecken", intro: "Orte, Bedingungen und lokales Wissen für Ihren nächsten Ausflug.", places: "Seen und Regionen", allGuides: "Alle lokalen Guides", guide: "Windguide",
    gruyere: "Greyerzersee", water: "Geschätzte Wassertemperatur, Verlauf und Zugang zu den Spots.", gruyereWind: "Wind, Messstationen und lokale Hinweise zu den Spots am See.", conditions: "Bedingungen beobachten",
    stations: "Live-Messstationen", stationsDetail: "Finden Sie eine Station, ihre Messwerte und ihren Verlauf.", webcams: "Webcams", webcamsDetail: "Sehen Sie sich die Bedingungen vor Ort vor dem Aufbruch an.",
    learn: "Verstehen und austauschen", carnet: "Das Journal", carnetDetail: "Tipps, Geschichten und Erfahrungen aus dem Gelände.", forum: "Das Forum", forumDetail: "Stellen Sie Fragen und teilen Sie Ihre Erfahrungen.",
    contribute: "Spot hinzufügen", contributeDetail: "Teilen Sie über Ihr Konto einen Ort mit der Community.", about: "Über Openwind", french: "Auf Französisch",
  },
  it: {
    sections: "In Esplora", placesShort: "Laghi e regioni", conditionsShort: "Condizioni", learnShort: "Giornale e Forum",
    title: "Esplora", intro: "Luoghi, condizioni e conoscenze locali per preparare le tue uscite.", places: "Laghi e regioni", allGuides: "Tutte le guide locali", guide: "Guida del vento",
    gruyere: "Lago della Gruyère", water: "Temperatura stimata dell’acqua, andamento e accesso agli spot.", gruyereWind: "Vento, stazioni e indicazioni locali sugli spot del lago.", conditions: "Osserva le condizioni",
    stations: "Stazioni in diretta", stationsDetail: "Trova una stazione, le sue misure e lo storico.", webcams: "Webcam", webcamsDetail: "Guarda le condizioni sul posto prima di partire.",
    learn: "Capire e confrontarsi", carnet: "Il Giornale", carnetDetail: "Consigli, racconti ed esperienze per conoscere il territorio.", forum: "Il Forum", forumDetail: "Fai domande e condividi le tue esperienze delle uscite.",
    contribute: "Aggiungi uno spot", contributeDetail: "Condividi un luogo con la comunità dal tuo account.", about: "Informazioni su Openwind", french: "In francese",
  },
};

export function explorerPlaces(locale: SiteLocale) {
  return ["lac-de-la-gruyere", "lac-de-neuchatel", "lac-leman", "lac-de-zurich"].flatMap((slug) => {
    const guide = getLocalGuide(slug);
    if (!guide) return [];
    const language = isGuideLocale(locale) && guide.translations[locale] ? locale : "fr";
    return [{ slug, language, name: guide.translations[language]!.place, region: guide.region, image: guide.coverImage, alt: guide.translations[language]!.coverAlt }];
  });
}
