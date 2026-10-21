import type { LocalGuide } from "../local-guides";

export const WALENSEE_GUIDE: LocalGuide = {
  slug: "walensee",
  region: "St. Gallen · Glarus · Heidiland",
  aliases: [
    "Walensee",
    "Walenstadt",
    "Lac de Walenstadt",
    "Lago di Walenstadt",
    "Lago di Walen",
    "Lake Walen",
    "Quinten",
    "Weesen",
    "Murg",
    "Unterterzen",
  ],
  coordinates: { lat: 47.12873933264039, lng: 9.216051444046451 },
  forecastPlace: "Quinten",
  coverImage: "/images/guides/walensee.jpg",
  coverCredit: {
    author: "Agnes Monkelbaan",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Walensee_(Walenmeer)_(actm)_02.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:18:15Z",
  updatedAt: "2026-10-21T13:18:15Z",
  stations: [
    {
      id: "QUI",
      name: "Quinten",
      source: "meteoswiss",
      context: {
        fr: "Station à terre près de la rive nord, à Quinten ; pas une mesure au milieu du lac ni à Weesen.",
        de: "Landstation bei Quinten am Nordufer; keine Messung in der Seemitte oder in Weesen.",
        it: "Stazione terrestre presso la riva nord a Quinten; non misura al centro del lago né a Weesen.",
      },
    },
    {
      id: "piou-2027",
      name: "LP Walenstadt",
      source: "pioupiou",
      context: {
        fr: "Capteur près d’un terrain d’atterrissage de parapente à Walenstadt ; pas une mesure sur l’eau ni un accès nautique.",
        de: "Sensor neben einem Gleitschirm-Landeplatz in Walenstadt; keine Messung auf dem Wasser und kein Wassersportzugang.",
        it: "Sensore vicino a un atterraggio di parapendio a Walenstadt; non è una misura sull’acqua né un accesso nautico.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Heidiland — Walensee en été",
      url: "https://fr.heidiland.com/region/walensee/sommer.html",
    },
    {
      label: "Kanton St. Gallen — Seepolizei und Sturmwarndienst",
      url: "https://www.sg.ch/verkehr/schifffahrt/seepolizei--seerettung---sturmwarndienst.html",
    },
    {
      label:
        "Interkantonale Vereinbarung über die Schifffahrt auf dem Zürichsee und Walensee, 714.51",
      url: "https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/714.51",
    },
    {
      label: "Kanton St. Gallen — Kitesurfen Walensee, Karte vom 10.02.2016",
      url: "https://www.sg.ch/content/dam/sgch/verkehr/schifffahrt/bewilligungen-verf%C3%BCgungen-verkehrsbeschr%C3%A4nkungen/Kitesurfen%20auf%20dem%20Walensee%20%28SG%29%20Karte%2010.02.2016.pdf",
    },
  ],
  translations: {
    fr: {
      title: "Vent au Walensee : balises de Quinten et Walenstadt, prévisions",
      description:
        "Préparez une sortie au Walensee : observations à Quinten et Walenstadt, prévision sur la rive nord, webcams et sources pour vérifier les accès nautiques.",
      place: "Walensee / Lac de Walenstadt",
      coverAlt:
        "Voiliers sur le Walensee au pied de versants rocheux, avec un chalet et de la végétation au premier plan",
      content: `## Situer Weesen, Quinten et Walenstadt
Le Walensee, aussi appelé lac de Walenstadt, relie les paysages de Saint-Gall et de Glaris. Repérez les deux extrémités, Weesen à l’ouest et Walenstadt à l’est, puis la rive de votre sortie. Quinten sur la rive nord et Murg ou Unterterzen au sud ne se lisent pas depuis le même point de vue. Une image prise à une extrémité ne montre pas toutes les portions du lac.

## Deux capteurs, deux contextes locaux
La station MeteoSwiss Quinten mesure à terre près de la rive nord. Le capteur LP Walenstadt est installé près d’un terrain d’atterrissage de parapente, selon sa description de fournisseur. Il apporte un contexte terrestre à Walenstadt : ce n’est ni une mesure sur l’eau ni une indication de mise à l’eau. Comparez des horaires proches et regardez les rafales avant de rapprocher les deux observations.

## Une prévision à Quinten
Le point du tableau se situe aux coordonnées de Quinten. Il ne représente pas une moyenne du lac et ne remplace pas une prévision dédiée à Weesen ou Walenstadt. Suivez l’évolution prévue à ce point puis confrontez-la aux mesures récentes, à une webcam pertinente et à l’observation de votre rive.

## Préparer son trajet et sa vue du lac
Heidiland présente les activités estivales autour du Walensee. Vérifiez l’itinéraire et les accès auprès des informations locales, particulièrement si votre visite concerne la rive nord. La carte des webcams peut aider à chercher un angle utile : contrôlez l’horodatage et la portion d’eau visible, sans assimiler une photographie au vent actuel.

## Navigation, zones et avertissements
La police du lac de Saint-Gall publie des informations sur les avertissements et le comportement sur l’eau. Consultez aussi les dispositions intercantonales et la carte officielle de kitesurf, datée dans les sources. Vérifiez les avis actuels et la signalisation du secteur : la présence d’un capteur, d’un port ou d’une plage ne suffit pas à autoriser une activité.`,
      faq: [
        {
          question: "Où voir le vent en direct au Walensee ?",
          answer:
            "Les cartes présentent les observations disponibles de Quinten et LP Walenstadt avec source et heure. Les deux capteurs sont terrestres et décrivent des emplacements différents.",
        },
        {
          question: "LP Walenstadt est-il un spot nautique ?",
          answer:
            "Le fournisseur décrit un capteur près d’un terrain d’atterrissage de parapente à Walenstadt. Son marqueur météo n’indique pas un accès nautique et sa mesure n’est pas prise sur l’eau.",
        },
        {
          question: "La prévision vaut-elle pour Weesen et Walenstadt ?",
          answer:
            "La table correspond au point de Quinten sur la rive nord. Elle ne représente pas chaque rive ni les deux extrémités du lac ; vérifiez les conditions du secteur choisi.",
        },
        {
          question:
            "Où vérifier les restrictions et avertissements du Walensee ?",
          answer:
            "Consultez les informations de la police du lac de Saint-Gall, les dispositions intercantonales, la carte officielle citée et les avis actuels. Vérifiez également la signalisation de votre secteur.",
        },
      ],
    },
    de: {
      title: "Wind am Walensee: Messstationen Quinten und Walenstadt, Prognose",
      description:
        "Plane einen Ausflug an den Walensee: Messungen in Quinten und Walenstadt, Prognose am Nordufer, Webcams und Quellen zu Wassersportzugängen.",
      place: "Walensee",
      coverAlt:
        "Segelboote auf dem Walensee unter steilen Felswänden mit einem Chalet und Pflanzen im Vordergrund",
      content: `## Weesen, Quinten und Walenstadt verorten
Der Walensee verbindet die Landschaften von St. Gallen und Glarus. Verorte zunächst Weesen am westlichen und Walenstadt am östlichen Ende, dann das Ufer deines Ausflugs. Quinten am Nordufer und Murg oder Unterterzen im Süden lassen sich nicht aus derselben Perspektive beurteilen. Ein Bild von einem Seeende zeigt nicht sämtliche Abschnitte.

## Zwei Sensoren mit unterschiedlichem Kontext
Die MeteoSwiss-Station Quinten misst an Land nahe dem Nordufer. LP Walenstadt steht laut Anbieterbeschreibung neben einem Gleitschirm-Landeplatz. Der Sensor liefert Landbeobachtungen bei Walenstadt; er misst weder auf dem Wasser noch kennzeichnet er einen Wassersportzugang. Vergleiche zeitnahe Werte und prüfe die Böen, bevor du beide Beobachtungen gegenüberstellst.

## Ein Prognosepunkt in Quinten
Die Tabelle wird für die Koordinaten von Quinten berechnet. Sie ist kein Mittelwert für den See und ersetzt keine ortsbezogene Prognose für Weesen oder Walenstadt. Verfolge die erwartete Entwicklung an diesem Punkt und vergleiche sie mit aktuellen Messungen, einer passenden Webcam und der Beobachtung an deinem Ufer.

## Anreise und Blick auf den See vorbereiten
Heidiland stellt Sommeraktivitäten rund um den Walensee vor. Prüfe Route und Zugänge anhand örtlicher Informationen, besonders für einen Besuch am Nordufer. Die Webcam-Karte hilft bei der Suche nach einem passenden Blickwinkel. Achte auf den Bildzeitpunkt und die sichtbare Wasserfläche; ein Foto ist keine aktuelle Windmessung.

## Schifffahrt, Bereiche und Warnungen
Die St. Galler Seepolizei veröffentlicht Informationen zum Sturmwarndienst und zum Verhalten auf dem Wasser. Konsultiere auch die interkantonalen Vorschriften und die in den Quellen datierte offizielle Kitesurfkarte. Prüfe aktuelle Mitteilungen und örtliche Beschilderung: Ein Sensor, Hafen oder Strand allein erlaubt noch keine bestimmte Sportart.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Walensee?",
          answer:
            "Die Karten zeigen verfügbare Beobachtungen von Quinten und LP Walenstadt mit Quelle und Zeitpunkt. Beide Sensoren messen an Land und beschreiben unterschiedliche Standorte.",
        },
        {
          question: "Ist LP Walenstadt ein Wassersportspot?",
          answer:
            "Der Anbieter beschreibt einen Sensor neben einem Gleitschirm-Landeplatz in Walenstadt. Der Wettermarker bezeichnet keinen Wassersportzugang und die Messung stammt nicht vom Wasser.",
        },
        {
          question: "Gilt die Prognose auch für Weesen und Walenstadt?",
          answer:
            "Die Tabelle gehört zum Punkt Quinten am Nordufer. Sie beschreibt weder jedes Ufer noch beide Seeenden; prüfe die Bedingungen im gewählten Abschnitt.",
        },
        {
          question: "Wo prüfe ich Einschränkungen und Warnungen am Walensee?",
          answer:
            "Konsultiere die St. Galler Seepolizei, die interkantonalen Vorschriften, die verlinkte offizielle Karte und aktuelle Mitteilungen. Beachte auch die Beschilderung vor Ort.",
        },
      ],
    },
    it: {
      title: "Vento sul Walensee: stazioni di Quinten e Walenstadt, previsioni",
      description:
        "Prepara un’uscita sul Walensee: osservazioni a Quinten e Walenstadt, previsioni sulla riva nord, webcam e fonti per verificare gli accessi nautici.",
      place: "Walensee / Lago di Walenstadt",
      coverAlt:
        "Barche a vela sul Walensee sotto ripidi versanti rocciosi, con uno chalet e vegetazione in primo piano",
      content: `## Individuare Weesen, Quinten e Walenstadt
Il Walensee, chiamato anche lago di Walenstadt, unisce i paesaggi di San Gallo e Glarona. Individua le due estremità, Weesen a ovest e Walenstadt a est, poi la riva della tua uscita. Quinten sulla sponda nord e Murg o Unterterzen a sud non si osservano dallo stesso punto di vista. Un’immagine da un’estremità non mostra tutti i tratti del lago.

## Due sensori, due contesti locali
La stazione MeteoSwiss Quinten misura sulla terraferma vicino alla riva nord. LP Walenstadt è installato presso un atterraggio di parapendio, secondo la descrizione del fornitore. Offre un contesto terrestre a Walenstadt: non è una misura sull’acqua né un’indicazione di ingresso in acqua. Confronta orari vicini e controlla le raffiche prima di accostare le due osservazioni.

## Un punto di previsione a Quinten
La tabella corrisponde alle coordinate di Quinten. Non rappresenta una media del lago e non sostituisce una previsione specifica per Weesen o Walenstadt. Segui l’evoluzione prevista in quel punto, poi confrontala con misure recenti, una webcam pertinente e l’osservazione della tua riva.

## Preparare il percorso e la vista sul lago
Heidiland presenta le attività estive intorno al Walensee. Verifica itinerario e accessi tramite le informazioni locali, soprattutto per una visita alla riva nord. La mappa delle webcam aiuta a cercare un’angolazione utile: controlla l’orario dell’immagine e la porzione d’acqua visibile, senza considerare una foto una misura del vento attuale.

## Navigazione, zone e avvertimenti
La polizia lacuale di San Gallo pubblica informazioni sugli avvisi di tempesta e sul comportamento in acqua. Consulta anche le disposizioni intercantonali e la mappa ufficiale di kitesurf, datata nelle fonti. Controlla gli avvisi attuali e la segnaletica del settore: un sensore, un porto o una spiaggia non autorizzano da soli un’attività.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta sul Walensee?",
          answer:
            "Le schede presentano le osservazioni disponibili di Quinten e LP Walenstadt con fonte e ora. Entrambi i sensori sono terrestri e descrivono posizioni diverse.",
        },
        {
          question: "LP Walenstadt è uno spot nautico?",
          answer:
            "Il fornitore descrive un sensore vicino a un atterraggio di parapendio a Walenstadt. Il suo indicatore meteo non segnala un accesso nautico e non misura sull’acqua.",
        },
        {
          question: "La previsione vale per Weesen e Walenstadt?",
          answer:
            "La tabella corrisponde al punto di Quinten sulla riva nord. Non rappresenta ogni riva né entrambe le estremità del lago; verifica le condizioni del settore scelto.",
        },
        {
          question: "Dove verificare restrizioni e avvisi del Walensee?",
          answer:
            "Consulta le informazioni della polizia lacuale di San Gallo, le disposizioni intercantonali, la mappa ufficiale citata e gli avvisi attuali. Controlla anche la segnaletica del settore.",
        },
      ],
    },
  },
};
