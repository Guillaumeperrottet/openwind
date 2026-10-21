import type { LocalGuide } from "../local-guides";

export const LAC_DE_THOUNE_GUIDE: LocalGuide = {
  slug: "lac-de-thoune",
  region: "Bern / Berne · Berner Oberland",
  aliases: [
    "Thoune",
    "Thun",
    "Thunersee",
    "Thuner See",
    "Lac de Thoune",
    "Lago di Thun",
    "Lake Thun",
    "Gunten",
    "Spiez",
    "Hilterfingen",
    "Hafeneinfahrt Thun",
    "Thun Strandbad",
  ],
  coordinates: { lat: 46.74005, lng: 7.63602 },
  forecastPlace: "Thun / Hafeneinfahrt",
  coverImage: "/images/guides/thoune.jpg",
  coverCredit: {
    author: "Christian David",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Schloss_Spiez_und_Hafen_Spiez.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T12:57:29Z",
  updatedAt: "2026-10-21T12:57:29Z",
  stations: [
    {
      id: "piou-1723",
      name: "Thun Hafeneinfahrt",
      source: "pioupiou",
      context: {
        fr: "Capteur identifié à l’entrée du port de Thoune ; observation de ce secteur, pas de toutes les rives.",
        de: "Sensor an der Hafeneinfahrt Thun; Beobachtung dieses Abschnitts, nicht sämtlicher Ufer.",
        it: "Sensore identificato all’entrata del porto di Thun; osservazione del settore, non di tutte le rive.",
      },
    },
    {
      id: "THU",
      name: "Thun",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre dans le secteur de Thoune, distincte du capteur à l’entrée du port.",
        de: "Landstation im Raum Thun, getrennt vom Sensor an der Hafeneinfahrt.",
        it: "Stazione a terra nel settore di Thun, distinta dal sensore all’entrata del porto.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Thunersee Tourismus — Badhuus Gunten, sports nautiques",
      url: "https://www.thunersee.ch/en/experiences/poi/badhuus-gunten-water-sports-on-lake-thun",
    },
    {
      label: "Thunerwetter / Windsurfclub Thun — Webcam Strandbad",
      url: "https://www.thunerwetter.ch/cams.html",
    },
    {
      label: "Police cantonale bernoise — Police des lacs",
      url: "https://www.police.be.ch/de/start/themen/gewaesserpolizei.html",
    },
    {
      label: "Police cantonale bernoise — carte kitesurf FR/DE",
      url: "https://www.police.be.ch/content/dam/police/dokumente/police-be-ch/d/seepolizei/kite-surfen_de_fr.pdf",
    },
  ],
  translations: {
    fr: {
      title:
        "Vent au lac de Thoune : balises, prévisions et webcams du Thunersee",
      description:
        "Comparez Thun Hafeneinfahrt et la station MeteoSwiss de Thoune : vent observé, prévisions au port, webcams et sources locales pour préparer votre sortie.",
      place: "Lac de Thoune / Thunersee",
      coverAlt: "Le château et le port de Spiez au bord du lac de Thoune",
      content: `## Thoune, Gunten et Spiez : lire des secteurs différents
Le lac de Thoune, ou Thunersee, demande de situer sa sortie avant de comparer les chiffres. Une observation à l’entrée du port de Thoune ne décrit pas automatiquement Gunten, Spiez ou une autre rive. Repérez votre destination sur la carte et cherchez les observations et images qui donnent une vue pertinente de ce secteur.

## Distinguer Thun Hafeneinfahrt et la station THU
Thun Hafeneinfahrt est un capteur du réseau Pioupiou identifié à l’entrée du port. THU est une station MeteoSwiss à terre dans le secteur de Thoune. Les deux noms ne désignent donc pas le même emplacement ni le même réseau. Comparez l’heure, la direction et les rafales ; ouvrez les historiques pour distinguer une évolution durable d’un relevé ponctuel.

## La prévision du port reste une estimation de modèle
Le tableau est calculé au point Thun / Hafeneinfahrt. Même lorsque le point de calcul correspond aux coordonnées d’une balise, une prévision ne devient pas une mesure. Les cartes affichent les observations du capteur avec leur date, tandis que le tableau estime les prochains jours. Ce point ne décrit pas les différences d’exposition sur toutes les rives.

## Webcams et informations de pratique
La webcam du Strandbad référencée par Thunerwetter regarde vers le bassin inférieur du lac. Elle peut compléter les observations près de Thoune, à condition de contrôler l’heure de l’image. Pour les activités à Gunten, Thunersee Tourismus présente l’école du Badhuus. Un lieu proposant du windsurf ne doit pas être considéré automatiquement comme un départ autorisé pour le kitesurf.

## Préparer l’accès avec les sources bernoises
La Police cantonale bernoise publie des informations sur les lacs et une carte des secteurs de kitesurf. Consultez ces sources, les avertissements et la signalisation locale pour votre activité. Un marqueur météo à l’entrée d’un port n’est pas une recommandation d’y mettre son matériel à l’eau. Choisissez l’accès séparément de votre repère d’observation.`,
      faq: [
        {
          question: "Quelles balises donnent le vent autour de Thoune ?",
          answer:
            "Le guide présente Thun Hafeneinfahrt, du réseau Pioupiou, et Thun, du réseau MeteoSwiss. Leurs emplacements sont distincts et chaque observation conserve sa source et son heure.",
        },
        {
          question: "La prévision du port est-elle une mesure en direct ?",
          answer:
            "Non. Elle est calculée par un modèle au point Thun / Hafeneinfahrt. Les observations réelles sont présentées séparément dans les cartes des balises.",
        },
        {
          question: "La webcam de Thoune montre-t-elle tout le lac ?",
          answer:
            "Non. La vue du Strandbad mentionnée dans les sources montre le bassin inférieur. Pour Gunten, Spiez ou un autre secteur, recherchez une image adaptée et vérifiez sa date.",
        },
        {
          question: "Le marqueur du port indique-t-il un accès pour le kite ?",
          answer:
            "Non. Il identifie un point météo. Consultez la carte de la Police cantonale bernoise et les consignes locales pour choisir un accès correspondant à votre activité.",
        },
      ],
    },
    de: {
      title: "Wind am Thunersee: Messstationen, Prognose und Webcams",
      description:
        "Vergleiche Thun Hafeneinfahrt und die MeteoSwiss-Station Thun: beobachteter Wind, Prognose am Hafen, Webcams und lokale Quellen für deinen Ausflug.",
      place: "Thunersee / Thun",
      coverAlt: "Schloss und Hafen Spiez am Thunersee",
      content: `## Thun, Gunten und Spiez als unterschiedliche Abschnitte
Am Thunersee solltest du den Ausgangspunkt verorten, bevor du Zahlen vergleichst. Eine Beobachtung an der Hafeneinfahrt Thun beschreibt Gunten, Spiez oder ein anderes Ufer nicht automatisch. Suche dein Ziel auf der Karte und nutze Beobachtungen und Bilder mit einem passenden Blick auf diesen Abschnitt.

## Thun Hafeneinfahrt und THU unterscheiden
Thun Hafeneinfahrt ist ein Sensor des Pioupiou-Netzes an der Hafeneinfahrt. THU ist eine MeteoSwiss-Landstation im Raum Thun. Die Namen bezeichnen weder denselben Standort noch dasselbe Netzwerk. Vergleiche Zeitpunkt, Richtung und Böen und öffne die Verläufe, um eine anhaltende Entwicklung von einem Einzelwert zu unterscheiden.

## Die Hafenprognose bleibt eine Modellschätzung
Die Tabelle wird für den Punkt Thun / Hafeneinfahrt berechnet. Auch wenn ein Berechnungspunkt den Koordinaten einer Station entspricht, wird aus einer Prognose keine Messung. Die Karten zeigen datierte Sensorbeobachtungen, während die Tabelle die kommenden Tage schätzt. Dieser Punkt beschreibt nicht alle Expositionsunterschiede der Ufer.

## Webcams und Angaben zur Sportausübung
Die bei Thunerwetter verlinkte Strandbad-Webcam blickt auf das untere Seebecken. Sie ergänzt die Beobachtungen nahe Thun, sofern du die Aufnahmezeit prüfst. Für Aktivitäten in Gunten stellt Thunersee Tourismus die Schule im Badhuus vor. Ein Windsurf-Angebot kennzeichnet nicht automatisch einen erlaubten Kitesurf-Einstieg.

## Zugang mit Berner Quellen vorbereiten
Die Kantonspolizei Bern veröffentlicht Informationen zu den Gewässern und eine Karte der Kitesurf-Bereiche. Prüfe diese Quellen, Warnungen und die örtliche Beschilderung für deine Sportart. Ein Wettermarker an einer Hafeneinfahrt ist keine Empfehlung, dort Material einzuwassern. Wähle den Zugang getrennt vom Beobachtungspunkt.`,
      faq: [
        {
          question: "Welche Stationen zeigen den Wind rund um Thun?",
          answer:
            "Der Guide zeigt Thun Hafeneinfahrt aus dem Pioupiou-Netz und Thun von MeteoSwiss. Die Standorte sind getrennt; jede Beobachtung behält Quelle und Messzeit.",
        },
        {
          question: "Ist die Hafenprognose eine Live-Messung?",
          answer:
            "Nein. Sie wird von einem Modell für Thun / Hafeneinfahrt berechnet. Die tatsächlichen Beobachtungen stehen getrennt in den Stationskarten.",
        },
        {
          question: "Zeigt die Thuner Webcam den ganzen See?",
          answer:
            "Nein. Die in den Quellen genannte Strandbad-Ansicht zeigt das untere Becken. Suche für Gunten, Spiez oder andere Bereiche ein passendes Bild und prüfe dessen Zeitpunkt.",
        },
        {
          question: "Kennzeichnet der Hafenmarker einen Kite-Einstieg?",
          answer:
            "Nein. Er bezeichnet einen Wetterpunkt. Prüfe die Karte der Kantonspolizei Bern und örtliche Vorgaben für einen Zugang, der deiner Sportart entspricht.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Thun: stazioni, previsioni e webcam del Thunersee",
      description:
        "Confronta Thun Hafeneinfahrt e la stazione MeteoSwiss di Thun: vento osservato, previsioni al porto, webcam e fonti locali per preparare l’uscita.",
      place: "Lago di Thun / Thunersee",
      coverAlt: "Il castello e il porto di Spiez sul lago di Thun",
      content: `## Thun, Gunten e Spiez: leggere settori diversi
Al lago di Thun, o Thunersee, individua la tua uscita prima di confrontare i numeri. Un’osservazione all’entrata del porto di Thun non descrive automaticamente Gunten, Spiez o un’altra riva. Cerca la destinazione sulla mappa e scegli osservazioni e immagini che offrano una vista pertinente del settore.

## Distinguere Thun Hafeneinfahrt dalla stazione THU
Thun Hafeneinfahrt è un sensore della rete Pioupiou identificato all’entrata del porto. THU è una stazione MeteoSwiss a terra nel settore di Thun. I due nomi non indicano lo stesso luogo né la stessa rete. Confronta ora, direzione e raffiche e consulta gli storici per distinguere un’evoluzione duratura da un singolo rilevamento.

## Le previsioni al porto restano una stima di modello
La tabella è calcolata per il punto Thun / Hafeneinfahrt. Anche quando il punto coincide con le coordinate di una stazione, una previsione non diventa una misura. Le schede mostrano osservazioni datate del sensore, mentre la tabella stima i prossimi giorni. Questo punto non descrive tutte le differenze di esposizione delle rive.

## Webcam e informazioni sulle attività
La webcam dello Strandbad indicata da Thunerwetter guarda verso il bacino inferiore. Può completare le osservazioni vicino a Thun, controllando l’ora dell’immagine. Per le attività a Gunten, Thunersee Tourismus presenta la scuola del Badhuus. Un luogo che offre windsurf non è automaticamente una partenza autorizzata per il kitesurf.

## Preparare l’accesso con le fonti bernesi
La Polizia cantonale bernese pubblica informazioni sui laghi e una mappa dei settori di kitesurf. Consulta queste fonti, gli avvisi e la segnaletica locale per la tua attività. Un indicatore meteo all’entrata di un porto non raccomanda di entrare in acqua in quel punto. Scegli l’accesso separatamente dal riferimento di osservazione.`,
      faq: [
        {
          question: "Quali stazioni mostrano il vento intorno a Thun?",
          answer:
            "La guida presenta Thun Hafeneinfahrt della rete Pioupiou e Thun di MeteoSwiss. Le posizioni sono distinte e ogni osservazione mantiene fonte e ora.",
        },
        {
          question: "Le previsioni al porto sono una misura in diretta?",
          answer:
            "No. Sono calcolate da un modello per Thun / Hafeneinfahrt. Le osservazioni reali sono mostrate separatamente nelle schede delle stazioni.",
        },
        {
          question: "La webcam di Thun mostra tutto il lago?",
          answer:
            "No. La vista dello Strandbad citata nelle fonti mostra il bacino inferiore. Per Gunten, Spiez o un altro settore cerca un’immagine adatta e controllane la data.",
        },
        {
          question: "L’indicatore del porto segnala un accesso per il kite?",
          answer:
            "No. Identifica un punto meteo. Consulta la mappa della Polizia cantonale bernese e le indicazioni locali per scegliere un accesso adatto alla tua attività.",
        },
      ],
    },
  },
};
