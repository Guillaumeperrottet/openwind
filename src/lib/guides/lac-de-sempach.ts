import type { LocalGuide } from "../local-guides";

export const LAC_DE_SEMPACH_GUIDE: LocalGuide = {
  slug: "lac-de-sempach",
  region: "Luzern · Nottwil · Sursee",
  aliases: [
    "Sempach",
    "Sempachersee",
    "Sempacher See",
    "Lac de Sempach",
    "Lago di Sempach",
    "Lake Sempach",
    "Nottwil",
    "Eich",
    "Sursee",
    "Oberkirch",
    "Egolzwil",
  ],
  coordinates: { lat: 47.139253, lng: 8.137825 },
  forecastPlace: "Nottwil",
  coverImage: "/images/guides/sempach.jpg",
  coverCredit: {
    author: "Yves Knupp",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Segelndes_Boot_auf_dem_Sempachersee.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:41:02Z",
  updatedAt: "2026-10-21T13:41:02Z",
  stations: [
    {
      id: "EGO",
      name: "Egolzwil",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Egolzwil, hors du bassin du lac de Sempach, au nord-ouest ; contexte régional, pas une mesure à Nottwil ou Eich.",
        de: "Landstation in Egolzwil nordwestlich ausserhalb des Sempachersee-Beckens; regionaler Kontext, keine Messung in Nottwil oder Eich.",
        it: "Stazione terrestre a Egolzwil, a nord-ovest fuori dal bacino del lago di Sempach; contesto regionale, non una misura a Nottwil o Eich.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Sempachersee Tourismus — Windsurfen und Stand-up-Paddling",
      url: "https://www.sempachersee-tourismus.ch/de/freizeit-und-erlebnisse/freizeit/wassererlebnisse/windsurfen-und-standup-paddling",
    },
    {
      label: "Caribbean Village — Windsurf, SUP et informations saisonnières",
      url: "https://www.caribbean-village.ch/",
    },
    {
      label: "Sempachersee Tourismus — Webcams",
      url: "https://www.sempachersee-tourismus.ch/de/webcams",
    },
    {
      label: "Kanton Luzern — Kitesurfen auf dem Sempachersee et carte",
      url: "https://strassenverkehrsamt.lu.ch/schifffahrt/Kitesurfen/Sempachersee",
    },
  ],
  translations: {
    fr: {
      title:
        "Vent au lac de Sempach : prévisions à Nottwil et balise régionale",
      description:
        "Préparez votre sortie au Sempachersee : prévisions à Nottwil, observation régionale d’Egolzwil, webcams, windsurf et sources sur les secteurs de navigation.",
      place: "Lac de Sempach / Sempachersee",
      coverAlt:
        "Voilier à voile blanche sur le lac de Sempach entre des rives boisées, sous un ciel bleu",
      content: `## Nottwil, Eich ou Sempach : choisir le bon repère
Le lac de Sempach se situe dans le canton de Lucerne. Ce guide utilise Nottwil comme point de prévision, sur la rive où Sempachersee Tourismus référence des cours de windsurf et de la location. Repérez également Eich sur l’autre rive et les secteurs vers Sempach ou Sursee. Une vue depuis Nottwil ne suffit pas pour juger chaque portion du lac, notamment derrière une avancée de rive.

## Egolzwil apporte un contexte régional
La balise MeteoSwiss EGO est située à terre, au nord-ouest et hors du bassin du Sempachersee. Elle n’est installée ni à Nottwil ni à Eich. Son historique donne un repère sur l’évolution régionale ; ne transposez pas directement sa vitesse au lieu de mise à l’eau. Vérifiez la direction, les rafales et l’heure des dernières données avant de les comparer à une image du lac.

## Une prévision à Nottwil, distincte de la balise
La table est calculée au point de Nottwil indiqué sous les observations, près du secteur de la Bahnhofstrasse. Ce point de modèle est différent de celui d’Egolzwil : les deux informations ne sont pas des mesures concurrentes prises au même endroit. Comparez les créneaux de prévision puis complétez-les par une vérification près de votre rive.

## Windsurf et webcams du Sempachersee
Les sources touristiques et Caribbean Village présentent les activités, cours et locations de Nottwil. Consultez les informations saisonnières actuelles auprès du prestataire avant de vous déplacer. L’office de tourisme référence notamment des webcams à Eich et Sempach ; choisissez l’angle qui montre votre secteur et contrôlez l’horodatage. La présence d’une caméra ne garantit pas qu’une image est récente.

## Un secteur de navigation n’est pas un accès
Le canton de Lucerne décrit les secteurs de kitesurf et publie une carte. Consultez les limites, zones protégées et consignes de départ : un secteur navigable ne crée pas automatiquement une mise à l’eau sur chaque plage. Les activités proposées à Nottwil et les conditions d’accès pour le kite se vérifient séparément auprès des sources compétentes.`,
      faq: [
        {
          question: "Y a-t-il une mesure de vent à Nottwil dans ce guide ?",
          answer:
            "La mesure affichée provient d’Egolzwil, station terrestre régionale hors du bassin. Nottwil est le point de prévision du modèle, pas l’emplacement de cette balise.",
        },
        {
          question:
            "À quel endroit la prévision du Sempachersee est-elle calculée ?",
          answer:
            "Elle est calculée à Nottwil, près du secteur de la Bahnhofstrasse. Elle ne représente pas toutes les rives et reste distincte de l’observation d’Egolzwil.",
        },
        {
          question: "Où trouver des webcams et du windsurf au lac de Sempach ?",
          answer:
            "Sempachersee Tourismus référence des webcams à Eich et Sempach et une offre de windsurf à Nottwil. Consultez aussi les informations saisonnières du prestataire et la date des images.",
        },
        {
          question:
            "La carte de kitesurf indique-t-elle une mise à l’eau partout ?",
          answer:
            "La carte cantonale décrit les secteurs et restrictions. Elle ne transforme pas chaque plage en point de départ ; vérifiez les accès convenus localement et la signalisation pour votre activité.",
        },
      ],
    },
    de: {
      title: "Wind am Sempachersee: Prognose Nottwil und regionale Messstation",
      description:
        "Plane deine Tour am Sempachersee: Prognose für Nottwil, regionale Beobachtung aus Egolzwil, Webcams, Windsurfen und Quellen zu Schifffahrtsbereichen.",
      place: "Sempachersee / Nottwil",
      coverAlt:
        "Boot mit weissem Segel auf dem Sempachersee zwischen bewaldeten Ufern unter blauem Himmel",
      content: `## Nottwil, Eich oder Sempach: passend vergleichen
Der Sempachersee liegt im Kanton Luzern. Dieser Guide nutzt Nottwil als Prognosepunkt, an jenem Ufer, an dem Sempachersee Tourismus Windsurfkurse und Vermietung nennt. Verorte auch Eich am gegenüberliegenden Ufer sowie die Abschnitte bei Sempach oder Sursee. Ein Blick von Nottwil reicht nicht zur Beurteilung sämtlicher Bereiche, insbesondere hinter einem Uferstück.

## Egolzwil liefert regionalen Kontext
Die MeteoSwiss-Station EGO liegt an Land im Nordwesten ausserhalb des Sempachersee-Beckens. Sie steht weder in Nottwil noch in Eich. Ihr Verlauf hilft beim Einordnen der regionalen Entwicklung; übertrage die Geschwindigkeit nicht direkt auf deinen Einstieg. Prüfe Richtung, Böen und den Zeitpunkt der letzten Daten vor dem Vergleich mit einem Seebild.

## Prognose Nottwil getrennt von der Messstation
Die Tabelle wird für den unter den Beobachtungen genannten Punkt Nottwil nahe der Bahnhofstrasse berechnet. Dieser Modellpunkt liegt nicht bei der Station Egolzwil: Die Angaben sind keine konkurrierenden Messungen am selben Ort. Vergleiche Prognose-Zeitfenster und ergänze eine Prüfung an deinem Ufer.

## Windsurfen und Webcams am Sempachersee
Die touristischen Quellen und Caribbean Village stellen Aktivitäten, Kurse und Vermietung in Nottwil vor. Prüfe aktuelle Saisoninformationen direkt beim Anbieter vor der Anreise. Das Tourismusbüro nennt unter anderem Webcams in Eich und Sempach. Wähle einen Blick auf deinen Abschnitt und kontrolliere den Zeitstempel; eine vorhandene Kamera garantiert kein aktuelles Bild.

## Fahrbereich und Einstieg unterscheiden
Der Kanton Luzern beschreibt Kitesurfbereiche und veröffentlicht eine Karte. Konsultiere Grenzen, Schutzbereiche und Vorgaben zum Start: Ein befahrbarer Abschnitt schafft nicht automatisch an jedem Strand einen Einstieg. Die Angebote in Nottwil und die Kitezugänge klärst du jeweils bei den zuständigen Quellen.`,
      faq: [
        {
          question: "Zeigt der Guide eine Windmessung in Nottwil?",
          answer:
            "Die angezeigte Messung stammt aus Egolzwil, einer regionalen Landstation ausserhalb des Seebeckens. Nottwil ist der Modell-Prognosepunkt und nicht der Standort dieser Station.",
        },
        {
          question: "Wo wird die Sempachersee-Prognose berechnet?",
          answer:
            "Der Berechnungspunkt liegt in Nottwil nahe der Bahnhofstrasse. Er beschreibt nicht alle Ufer und bleibt von der Beobachtung in Egolzwil getrennt.",
        },
        {
          question:
            "Wo finde ich Webcams und Windsurfangebote am Sempachersee?",
          answer:
            "Sempachersee Tourismus nennt Webcams in Eich und Sempach sowie Windsurfangebote in Nottwil. Prüfe auch die aktuellen Saisoninformationen beim Anbieter und den Bildzeitpunkt.",
        },
        {
          question: "Erlaubt die Kitesurfkarte einen Einstieg an jedem Ufer?",
          answer:
            "Die kantonale Karte beschreibt Bereiche und Einschränkungen. Sie macht nicht jeden Strand zum Startplatz; prüfe örtlich vereinbarte Zugänge und die Beschilderung für deine Sportart.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Sempach: previsioni a Nottwil e stazione regionale",
      description:
        "Prepara l’uscita sul Sempachersee: previsioni a Nottwil, osservazione regionale di Egolzwil, webcam, windsurf e fonti sui settori di navigazione.",
      place: "Lago di Sempach / Sempachersee",
      coverAlt:
        "Barca a vela bianca sul lago di Sempach tra rive boscose sotto un cielo azzurro",
      content: `## Nottwil, Eich o Sempach: scegliere il riferimento
Il lago di Sempach si trova nel Canton Lucerna. Questa guida usa Nottwil come punto di previsione, sulla riva dove Sempachersee Tourismus elenca corsi di windsurf e noleggio. Individua anche Eich sulla riva opposta e i settori verso Sempach o Sursee. Una vista da Nottwil non basta per valutare ogni tratto del lago, soprattutto dietro una sporgenza della riva.

## Egolzwil offre un contesto regionale
La stazione MeteoSwiss EGO si trova sulla terraferma, a nord-ovest fuori dal bacino del Sempachersee. Non è installata a Nottwil né a Eich. Lo storico aiuta a seguire l’evoluzione regionale; non trasferire direttamente la velocità al punto di ingresso in acqua. Verifica direzione, raffiche e orario degli ultimi dati prima di confrontarli con un’immagine del lago.

## Previsioni a Nottwil distinte dalla stazione
La tabella è calcolata nel punto di Nottwil indicato sotto le osservazioni, vicino al settore della Bahnhofstrasse. Il punto del modello è diverso da quello di Egolzwil: non sono misure concorrenti nello stesso luogo. Confronta le fasce orarie previste e completa le informazioni con una verifica vicino alla tua riva.

## Windsurf e webcam sul Sempachersee
Le fonti turistiche e Caribbean Village presentano attività, corsi e noleggi a Nottwil. Prima di partire consulta le informazioni stagionali attuali presso l’operatore. L’ufficio turistico elenca anche webcam a Eich e Sempach: scegli un’inquadratura del tuo settore e controlla l’orario. La presenza di una webcam non garantisce un’immagine recente.

## Settore di navigazione e accesso sono distinti
Il Canton Lucerna descrive i settori di kitesurf e pubblica una mappa. Consulta limiti, zone protette e indicazioni per la partenza: un tratto navigabile non crea automaticamente un accesso da ogni spiaggia. Verifica separatamente le attività offerte a Nottwil e gli accessi per il kite presso le fonti competenti.`,
      faq: [
        {
          question: "La guida mostra una misura del vento a Nottwil?",
          answer:
            "La misura mostrata proviene da Egolzwil, stazione terrestre regionale fuori dal bacino. Nottwil è il punto di previsione del modello, non la posizione di quella stazione.",
        },
        {
          question: "Dove è calcolata la previsione del Sempachersee?",
          answer:
            "È calcolata a Nottwil vicino al settore della Bahnhofstrasse. Non rappresenta tutte le rive e resta distinta dall’osservazione di Egolzwil.",
        },
        {
          question: "Dove trovare webcam e windsurf al lago di Sempach?",
          answer:
            "Sempachersee Tourismus elenca webcam a Eich e Sempach e un’offerta di windsurf a Nottwil. Consulta anche le informazioni stagionali dell’operatore e la data delle immagini.",
        },
        {
          question: "La mappa di kitesurf indica un ingresso in acqua ovunque?",
          answer:
            "La mappa cantonale descrive settori e restrizioni. Non trasforma ogni spiaggia in un punto di partenza; verifica gli accessi concordati localmente e la segnaletica per la tua attività.",
        },
      ],
    },
  },
};
