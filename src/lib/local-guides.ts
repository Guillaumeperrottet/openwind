import { localizedUrl } from "@/lib/site";
import { SWISS_LAKE_GUIDES } from "@/lib/swiss-lake-guides";
import { SILVAPLANA_GUIDE } from "@/lib/guides/silvaplana";
import { URNERSEE_GUIDE } from "@/lib/guides/urnersee";
import { LAC_MAJEUR_GUIDE } from "@/lib/guides/lac-majeur";
import { LAC_DE_BIENNE_GUIDE } from "@/lib/guides/lac-de-bienne";

export const GUIDE_LOCALES = ["fr", "de", "it"] as const;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export interface GuideTranslation {
  title: string;
  description: string;
  place: string;
  coverAlt: string;
  content: string;
  faq: { question: string; answer: string }[];
}

/** Add a guide only when its place, station links and editorial content are ready. */
export interface LocalGuide {
  slug: string;
  region: string;
  coordinates: { lat: number; lng: number };
  coverImage: string;
  aliases?: string[];
  forecastPlace?: string;
  coverCredit?: {
    author: string;
    authorUrl?: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
  };
  publishedAt: string;
  updatedAt: string;
  stations: {
    id: string;
    name: string;
    source: "windball" | "meteoswiss" | "pioupiou";
    context?: Partial<Record<GuideLocale, string>>;
  }[];
  spotIds: string[];
  sources: { label: string; url: string }[];
  translations: { fr: GuideTranslation } & Partial<
    Record<GuideLocale, GuideTranslation>
  >;
}

export const GUIDE_COPY = {
  fr: {
    title: "Vent en direct en Suisse : balises et guides locaux",
    description:
      "Retrouvez les balises de vent, les prévisions et les guides locaux Openwind pour préparer vos sorties en Suisse.",
    guides: "Guides du vent en Suisse",
    live: "Le vent mesuré autour du lac",
    liveIntro:
      "Comparez la direction, les rafales et la date des mesures. Chaque balise décrit son emplacement : des écarts sont possibles entre les rives et le contexte régional.",
    now: "Voir le vent maintenant",
    stations: "Toutes les balises",
    forecast: "Prévisions de vent",
    forecastPoint: "Point de prévision",
    forecastScope: "Un point de calcul ne décrit pas toutes les rives du lac.",
    webcams: "Webcams autour de ce lieu",
    otherGuides: "Explorer d’autres lacs",
    localSpots: "Spots associés",
    openSpot: "Prévisions et informations du spot",
    sources: "Sources et informations locales",
    faq: "Questions fréquentes",
    updated: "Mis à jour le",
    by: "Par",
    plan: "Planifier une sortie",
    map: "Ouvrir la carte",
    observation: "Mesure observée",
    stale: "Mesure ancienne",
    unavailable: "Mesure momentanément indisponible",
    gusts: "Rafales",
    source: "Source",
    caution:
      "Les mesures et les prévisions aident à préparer une sortie. Confirmez les conditions sur place et consultez la signalisation et les avis officiels.",
    language: "Lire ce guide dans une autre langue",
    context: "Comprendre les conditions locales",
  },
  de: {
    title: "Wind in der Schweiz: Live-Messstationen und lokale Guides",
    description:
      "Windmessstationen, Prognosen und lokale Openwind-Guides für die Vorbereitung von Ausflügen in der Schweiz.",
    guides: "Wind-Guides für die Schweiz",
    live: "Gemessener Wind rund um den See",
    liveIntro:
      "Vergleiche Windrichtung, Böen und Zeitpunkt der Messungen. Jede Station beschreibt ihren Standort: Zwischen den Ufern und der regionalen Wetterlage sind Unterschiede möglich.",
    now: "Aktuelle Windmessungen",
    stations: "Alle Windstationen",
    forecast: "Windprognose",
    forecastPoint: "Prognosepunkt",
    forecastScope: "Ein Berechnungspunkt beschreibt nicht alle Ufer des Sees.",
    webcams: "Webcams in der Umgebung",
    otherGuides: "Weitere Seen entdecken",
    localSpots: "Spots in der Umgebung",
    openSpot: "Prognose und Spot-Informationen",
    sources: "Quellen und lokale Informationen",
    faq: "Häufige Fragen",
    updated: "Aktualisiert am",
    by: "Von",
    plan: "Ausflug planen",
    map: "Karte öffnen",
    observation: "Beobachteter Messwert",
    stale: "Älterer Messwert",
    unavailable: "Messung vorübergehend nicht verfügbar",
    gusts: "Böen",
    source: "Quelle",
    caution:
      "Messungen und Prognosen helfen bei der Vorbereitung. Prüfe die Bedingungen vor Ort und beachte die örtliche Beschilderung und offiziellen Hinweise.",
    language: "Diesen Guide in einer anderen Sprache lesen",
    context: "Lokale Bedingungen verstehen",
  },
  it: {
    title: "Vento in Svizzera: stazioni in diretta e guide locali",
    description:
      "Stazioni del vento, previsioni e guide locali Openwind per preparare le tue uscite in Svizzera.",
    guides: "Guide del vento in Svizzera",
    live: "Il vento misurato intorno al lago",
    liveIntro:
      "Confronta la direzione, le raffiche e la data delle misure. Ogni stazione descrive il proprio punto di rilevamento: tra le rive e la situazione regionale possono esserci differenze.",
    now: "Vedi il vento attuale",
    stations: "Tutte le stazioni",
    forecast: "Previsioni del vento",
    forecastPoint: "Punto di previsione",
    forecastScope: "Un punto di calcolo non descrive tutte le rive del lago.",
    webcams: "Webcam intorno a questo luogo",
    otherGuides: "Esplora altri laghi",
    localSpots: "Spot nei dintorni",
    openSpot: "Previsioni e informazioni sullo spot",
    sources: "Fonti e informazioni locali",
    faq: "Domande frequenti",
    updated: "Aggiornato il",
    by: "Di",
    plan: "Pianifica un’uscita",
    map: "Apri la mappa",
    observation: "Misura osservata",
    stale: "Misura non recente",
    unavailable: "Misura temporaneamente non disponibile",
    gusts: "Raffiche",
    source: "Fonte",
    caution:
      "Le misure e le previsioni aiutano a preparare un’uscita. Verifica le condizioni sul posto e consulta la segnaletica e gli avvisi ufficiali.",
    language: "Leggi questa guida in un’altra lingua",
    context: "Capire le condizioni locali",
  },
} as const;

export function isGuideLocale(locale: string): locale is GuideLocale {
  return GUIDE_LOCALES.includes(locale as GuideLocale);
}

export const LOCAL_GUIDES: LocalGuide[] = [
  {
    slug: "lac-de-la-gruyere",
    aliases: ["Gruyère", "Gruyere", "Greyerzersee", "Morlon"],
    region: "Fribourg / Freiburg",
    coordinates: { lat: 46.63, lng: 7.08 },
    coverImage:
      "https://fnndeoqzqfxpznhcundq.supabase.co/storage/v1/object/public/spot-images/cmnq613tx00it04kw1d0vraq4/1776010538678.jpeg",
    publishedAt: "2026-08-26T10:30:00Z",
    updatedAt: "2026-10-21T00:00:00Z",
    stations: [
      { id: "windball-wf-35", name: "Morlon Beach", source: "windball" },
      { id: "MAS", name: "Marsens", source: "meteoswiss" },
      { id: "piou-2153", name: "Camping du Lac", source: "pioupiou" },
    ],
    spotIds: ["cmnq613tx00it04kw1d0vraq4"],
    sources: [
      {
        label: "Fribourg Région / Region Freiburg",
        url: "https://fribourg.ch/fr/all/nature/lac-de-la-gruyere/",
      },
      {
        label: "État de Fribourg / Staat Freiburg",
        url: "https://www.fr.ch/dsjs/actualites/la-pratique-du-kitesurf-est-desormais-autorisee-sur-quatre-lacs-fribourgeois-moyennant-certaines-zones-dinterdiction-pour-preserver-lavifaune",
      },
      {
        label: "Règlement sur la navigation / Schifffahrtsreglement",
        url: "https://bdlf.fr.ch/app/fr/texts_of_law/785.21",
      },
    ],
    translations: {
      fr: {
        title: "Vent au lac de la Gruyère en direct : balises et prévisions",
        description:
          "Comparez le vent à Morlon Beach, Marsens et au Camping du Lac : mesures, rafales, prévisions et repères locaux pour le lac de la Gruyère.",
        place: "Lac de la Gruyère",
        coverAlt: "Le lac de la Gruyère et les Préalpes fribourgeoises",
        content: `## Lire le relief avant de lire le chiffre
Le lac de la Gruyère s’étire entre des rives découpées, des collines et les premiers reliefs des Préalpes fribourgeoises. Une mesure au bord du lac et une mesure régionale ne décrivent pas exactement les mêmes conditions.

## Comparer Morlon, Marsens et le Camping du Lac
Morlon Beach et le Camping du Lac donnent des repères au bord du lac. Marsens apporte un point de comparaison régional. Regardez ensemble la direction, les rafales et l’heure de chaque observation : une différence entre deux balises peut être locale ou liée à un décalage des mesures.

## Distinguer les mesures des prévisions
Les cartes de balises affichent des observations de stations identifiées. Le tableau de prévisions utilise le modèle Open-Meteo : il estime l’évolution du vent et ne constitue pas une mesure sur le lac. Une prévision régionale favorable ne garantit pas un vent homogène à Morlon.

## Préparer une sortie à Morlon Beach
Consultez la fiche du spot pour les informations d’accès et les particularités du départ. Comparez la tendance et les rafales, puis observez le plan d’eau sur place. Pour les zones autorisées ou exclues, référez-vous aux informations cantonales et à la signalisation locale, accessibles dans les sources de ce guide.`,
        faq: [
          {
            question: "Où consulter le vent en direct au lac de la Gruyère ?",
            answer:
              "Ce guide réunit les balises de Morlon Beach, Marsens et du Camping du Lac. Les mesures disponibles indiquent leur source, leur date et leurs rafales ; les fiches de stations donnent accès à leur historique.",
          },
          {
            question:
              "Pourquoi les balises affichent-elles des valeurs différentes ?",
            answer:
              "Le relief, la position sur la rive et l’heure des observations peuvent différer. Comparez les directions et les dates avant d’interpréter un écart de vitesse.",
          },
          {
            question: "Les prévisions sont-elles des mesures en direct ?",
            answer:
              "Non. Les balises fournissent des observations locales ; les prévisions Open-Meteo sont des estimations issues de modèles météo. Les deux sources sont présentées séparément.",
          },
          {
            question: "Où vérifier les règles de kitesurf sur le lac ?",
            answer:
              "Consultez les informations de l’État de Fribourg et le règlement cantonal cités dans les sources. La signalisation et les avis officiels sur place restent à vérifier avant la mise à l’eau.",
          },
        ],
      },
      de: {
        title: "Wind am Greyerzersee: Live-Messungen und Prognose",
        description:
          "Vergleiche Wind und Böen in Morlon Beach, Marsens und am Camping du Lac: Messstationen, Prognose und lokale Informationen zum Greyerzersee.",
        place: "Greyerzersee / Lac de la Gruyère",
        coverAlt: "Der Greyerzersee und die Freiburger Voralpen",
        content: `## Erst das Gelände, dann die Zahl
Der Greyerzersee liegt zwischen gegliederten Ufern, Hügeln und den Freiburger Voralpen. Eine Messung am Seeufer und eine regionale Messung beschreiben nicht genau dieselben Bedingungen.

## Morlon, Marsens und Camping du Lac vergleichen
Morlon Beach und Camping du Lac liefern Anhaltspunkte am Seeufer. Marsens dient als regionaler Vergleich. Betrachte Windrichtung, Böen und Zeitpunkt jeder Beobachtung gemeinsam. Unterschiede können örtliche Ursachen haben oder auf unterschiedliche Messzeitpunkte zurückgehen.

## Messwerte und Prognosen unterscheiden
Die Stationskarten zeigen Beobachtungen benannter Messstationen. Die Open-Meteo-Prognose schätzt die Entwicklung des Windes anhand von Wettermodellen. Sie ist keine Messung auf dem See. Eine günstige regionale Prognose garantiert keinen gleichmässigen Wind in Morlon.

## Einen Ausflug nach Morlon Beach vorbereiten
Die Spot-Seite enthält Informationen zum Zugang und zu den Besonderheiten des Startbereichs. Vergleiche Windverlauf und Böen und beobachte die Bedingungen vor Ort. Hinweise zu erlaubten und ausgeschlossenen Zonen findest du in den kantonalen Quellen dieses Guides. Beachte auch die örtliche Beschilderung.`,
        faq: [
          {
            question: "Wo finde ich Live-Wind am Greyerzersee?",
            answer:
              "Dieser Guide verbindet die Stationen Morlon Beach, Marsens und Camping du Lac. Verfügbare Messungen zeigen Quelle, Zeitpunkt und Böen. Die Stationsseiten bieten den Verlauf der Messwerte.",
          },
          {
            question: "Warum unterscheiden sich die Windmessungen?",
            answer:
              "Gelände, Lage am Ufer und Messzeitpunkt können unterschiedlich sein. Vergleiche Windrichtungen und Zeitangaben, bevor du Geschwindigkeitsunterschiede interpretierst.",
          },
          {
            question: "Ist die Prognose eine Live-Messung?",
            answer:
              "Nein. Stationen liefern lokale Beobachtungen. Open-Meteo-Prognosen sind Schätzungen aus Wettermodellen. Beide Quellen werden getrennt dargestellt.",
          },
          {
            question: "Wo kann ich die Regeln für Kitesurfen prüfen?",
            answer:
              "Beachte die Informationen des Kantons Freiburg und das Schifffahrtsreglement in den Quellen. Prüfe vor dem Start auch die örtliche Beschilderung und offiziellen Hinweise.",
          },
        ],
      },
      it: {
        title: "Vento al lago della Gruyère: misure in diretta e previsioni",
        description:
          "Confronta vento e raffiche a Morlon Beach, Marsens e al Camping du Lac: stazioni, previsioni e informazioni locali sul lago della Gruyère.",
        place: "Lago della Gruyère",
        coverAlt: "Il lago della Gruyère e le Prealpi friburghesi",
        content: `## Leggere il rilievo prima del numero
Il lago della Gruyère si estende tra rive articolate, colline e i primi rilievi delle Prealpi friburghesi. Una misura sulla riva e una misura regionale non descrivono esattamente le stesse condizioni.

## Confrontare Morlon, Marsens e il Camping du Lac
Morlon Beach e il Camping du Lac offrono punti di riferimento sulla riva. Marsens permette un confronto regionale. Considera insieme direzione, raffiche e ora di ogni osservazione. Le differenze possono dipendere dal luogo o dai diversi orari delle misure.

## Distinguere misure e previsioni
Le schede delle stazioni mostrano osservazioni di sensori identificati. Le previsioni Open-Meteo stimano l’evoluzione del vento attraverso modelli meteorologici: non sono misure sul lago. Una previsione regionale favorevole non garantisce vento uniforme a Morlon.

## Preparare un’uscita a Morlon Beach
Consulta la scheda dello spot per l’accesso e le particolarità della zona di partenza. Confronta la tendenza e le raffiche, poi osserva le condizioni sul posto. Per le zone consentite o escluse, consulta le fonti cantonali indicate in questa guida e la segnaletica locale.`,
        faq: [
          {
            question: "Dove vedere il vento in diretta al lago della Gruyère?",
            answer:
              "Questa guida riunisce le stazioni di Morlon Beach, Marsens e Camping du Lac. Le misure disponibili indicano fonte, data e raffiche. Le schede delle stazioni mostrano lo storico.",
          },
          {
            question: "Perché le stazioni mostrano valori diversi?",
            answer:
              "Il rilievo, la posizione sulla riva e l’ora delle osservazioni possono variare. Confronta direzioni e orari prima di interpretare una differenza di velocità.",
          },
          {
            question: "Le previsioni sono misure in diretta?",
            answer:
              "No. Le stazioni forniscono osservazioni locali; le previsioni Open-Meteo sono stime basate su modelli meteorologici. Le due fonti sono presentate separatamente.",
          },
          {
            question: "Dove verificare le regole del kitesurf sul lago?",
            answer:
              "Consulta le informazioni del Cantone di Friburgo e il regolamento sulla navigazione indicati nelle fonti. Prima dell’uscita verifica anche la segnaletica e gli avvisi ufficiali sul posto.",
          },
        ],
      },
    },
  },
  ...SWISS_LAKE_GUIDES,
  SILVAPLANA_GUIDE,
  URNERSEE_GUIDE,
  LAC_MAJEUR_GUIDE,
  LAC_DE_BIENNE_GUIDE,
];

/** Preserve the established featured order, then include every available guide. */
export function getHomeGuides(locale: GuideLocale): LocalGuide[] {
  const featured = ["lac-de-neuchatel", "lac-leman", "lac-de-la-gruyere"];
  return [
    ...featured.flatMap((slug) =>
      LOCAL_GUIDES.filter((guide) => guide.slug === slug),
    ),
    ...LOCAL_GUIDES.filter((guide) => !featured.includes(guide.slug)),
  ].filter((guide) => Boolean(guide.translations[locale]));
}

export function getLocalGuide(slug: string): LocalGuide | undefined {
  return LOCAL_GUIDES.find((guide) => guide.slug === slug);
}

export function guideLanguages(guide: LocalGuide): GuideLocale[] {
  return GUIDE_LOCALES.filter((locale) => Boolean(guide.translations[locale]));
}

export function guideAlternates(guide: LocalGuide, locale: GuideLocale) {
  const path = `/vent-en-direct/${guide.slug}`;
  return {
    canonical: localizedUrl(locale, path),
    languages: {
      "x-default": localizedUrl("fr", path),
      ...Object.fromEntries(
        guideLanguages(guide).map((language) => [
          language,
          localizedUrl(language, path),
        ]),
      ),
    },
  };
}
