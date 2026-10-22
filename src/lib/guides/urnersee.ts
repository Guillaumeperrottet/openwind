import type { LocalGuide } from "../local-guides";

export const URNERSEE_GUIDE: LocalGuide = {
  slug: "urnersee",
  region: "Uri · Zentralschweiz / Suisse centrale",
  aliases: [
    "Urnersee",
    "Lac d’Uri",
    "Lac d'Uri",
    "Lago di Uri",
    "Flüelen",
    "Fluelen",
    "Isleten",
    "Vierwaldstättersee",
    "Föhn",
    "Foehn",
  ],
  coordinates: { lat: 46.8871053801, lng: 8.6218480715 },
  forecastPlace: "Altdorf / Reusstal",
  coverImage: "/images/guides/urnersee.jpg",
  coverCredit: {
    author: "Badener",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Seelisberg_Urnersee_5120.jpg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  publishedAt: "2026-10-21T12:27:40Z",
  updatedAt: "2026-10-22T12:00:00Z",
  stations: [
    {
      id: "ALT",
      name: "Altdorf",
      source: "meteoswiss",
      context: {
        fr: "Station dans la vallée de la Reuss, à l’intérieur des terres ; pas une mesure à Flüelen ou sur le lac.",
        de: "Station im Reusstal im Landesinneren; keine Messung in Flüelen oder auf dem See.",
        it: "Stazione nell’entroterra della valle della Reuss; non è una misura a Flüelen o sul lago.",
      },
    },
    {
      id: "GES",
      name: "Gersau",
      source: "meteoswiss",
      context: {
        fr: "Comparaison dans un bassin voisin du lac des Quatre-Cantons, hors de l’Urnersee.",
        de: "Vergleich in einem benachbarten Becken des Vierwaldstättersees, ausserhalb des Urnersees.",
        it: "Confronto in un bacino vicino del lago dei Quattro Cantoni, fuori dall’Urnersee.",
      },
    },
  ],
  spotIds: ["swiss-kite-isleten"],
  sources: [
    {
      label: "Kanton Uri — périodes de navigation",
      url: "https://www.ur.ch/newsarchiv/77921",
    },
    {
      label: "Kanton Uri — Kitesurfen auf dem Urnersee",
      url: "https://www.ur.ch/publikationen/7719",
    },
    {
      label: "Windsurfing Urnersee — Föhnsturm",
      url: "https://windsurfing-urnersee.ch/wissen/foehnsturm",
    },
    {
      label: "Windsurfing Urnersee — Wetter und Webcam",
      url: "https://windsurfing-urnersee.ch/ueber-uns/wetter-und-webcam",
    },
  ],
  translations: {
    fr: {
      title: "Vent à l’Urnersee : balises, foehn et prévisions du lac d’Uri",
      description:
        "Préparez une sortie à l’Urnersee : vent observé à Altdorf et Gersau, prévisions régionales, webcams et sources locales pour Flüelen et Isleten.",
      place: "Urnersee / Lac d’Uri",
      coverAlt: "Vue de l’Urnersee et de ses versants depuis Seelisberg",
      content: `## Lire le bassin de l’Urnersee
L’Urnersee est le bras méridional du lac des Quatre-Cantons. Pour préparer une sortie à Flüelen ou Isleten, identifiez d’abord votre secteur : une observation dans un autre bassin ne décrit pas automatiquement votre rive. Ouvrez la carte et les webcams autour du lac, puis confrontez les informations à la configuration du lieu de départ.

## Foehn : surveiller l’évolution et les rafales
Le foehn est un sujet central de la pratique locale. Windsurfing Urnersee décrit des épisodes qui peuvent être forts, irréguliers et influencés par le relief. Une valeur moyenne ne suffit donc pas à lire la situation : comparez les rafales, la direction et leur évolution. La présence de vent ne constitue pas à elle seule un critère favorable pour votre sortie.

## Altdorf et Gersau : deux repères distincts
Altdorf mesure à l’intérieur de la vallée de la Reuss, pas sur une plage de Flüelen. Gersau se trouve dans un bassin voisin, hors de l’Urnersee. Ces stations donnent un contexte régional et leurs écarts peuvent être instructifs ; ne faites pas la moyenne des deux pour en déduire une mesure sur l’eau. Consultez les historiques et les horaires avant de les comparer.

## Une prévision régionale, pas une mesure à Isleten
Le tableau est calculé au point d’Altdorf, dans la vallée. Il aide à suivre la tendance régionale et ne représente ni toutes les rives ni une observation à Isleten. Pour compléter ce point, la page [météo et webcams de Windsurfing Urnersee](https://windsurfing-urnersee.ch/ueber-uns/wetter-und-webcam) fournit des repères locaux. Contrôlez la date des images.

## Le départ d’Isleten et ses fermetures
Le [profil documenté d’Isleten](https://www.openwind.ch/fr/spots/swiss-kite-isleten) concerne le départ de rive au nord du delta de l’Isenthalerbach. Ce départ est fermé du 15 juin au 31 août inclus. Le planificateur exclut aussi décembre et janvier pour la navigation kite ; une sortie accompagnée depuis un bateau relève d’un autre accès.

## Accès et zones de pratique
Avant de choisir votre mise à l’eau, consultez les informations du canton d’Uri et le plan auquel elles renvoient. Vérifiez les indications pour votre activité et la signalisation du jour. Les sources ci-dessous complètent la carte ; un lien vers un lieu ne vaut pas autorisation d’y naviguer.`,
      faq: [
        {
          question: "L’Urnersee est-il le lac des Quatre-Cantons ?",
          answer:
            "L’Urnersee, ou lac d’Uri, en est le bras méridional. Une mesure dans un autre bassin du lac des Quatre-Cantons ne décrit pas nécessairement les conditions de l’Urnersee.",
        },
        {
          question: "La balise d’Altdorf mesure-t-elle le vent à Flüelen ?",
          answer:
            "Non. Elle mesure à son emplacement dans la vallée de la Reuss. Consultez son historique comme contexte régional et complétez avec des observations locales.",
        },
        {
          question: "Où se trouve le point des prévisions ?",
          answer:
            "Le tableau est calculé à Altdorf / Reusstal. Il est distinct des mesures des stations et ne constitue pas une prévision pour chaque rive du lac.",
        },
        {
          question: "Où vérifier les zones de kitesurf de l’Urnersee ?",
          answer:
            "La publication du canton d’Uri renvoie aux informations et au plan des zones. Consultez cette source officielle et la signalisation locale avant votre sortie.",
        },
      ],
    },
    de: {
      title: "Wind am Urnersee: Messstationen, Föhn und Prognose",
      description:
        "Plane deinen Ausflug an den Urnersee: Windmessungen in Altdorf und Gersau, regionale Prognose, Webcams und lokale Quellen für Flüelen und Isleten.",
      place: "Urnersee",
      coverAlt: "Blick von Seelisberg auf den Urnersee und seine Berghänge",
      content: `## Das Becken des Urnersees einordnen
Der Urnersee ist der südliche Arm des Vierwaldstättersees. Für eine Ausfahrt ab Flüelen oder Isleten zählt zunächst der konkrete Seeabschnitt: Eine Beobachtung aus einem anderen Becken beschreibt dein Ufer nicht automatisch. Öffne die Karte und Webcams rund um den See und vergleiche die Informationen mit deinem vorgesehenen Startplatz.

## Föhn: Entwicklung und Böen beachten
Föhn prägt die örtliche Windbeurteilung. Windsurfing Urnersee beschreibt Episoden, die stark, unregelmässig und durch das Gelände beeinflusst sein können. Ein Mittelwert reicht deshalb nicht aus: Vergleiche Böen, Richtung und Verlauf. Vorhandener Wind allein ist noch kein günstiges Kriterium für deine Ausfahrt.

## Altdorf und Gersau als getrennte Vergleichspunkte
Altdorf misst im Reusstal im Landesinneren und nicht an einem Strand in Flüelen. Gersau liegt in einem benachbarten Becken ausserhalb des Urnersees. Beide Stationen liefern regionalen Kontext; Unterschiede können aufschlussreich sein. Aus ihrem Mittelwert entsteht jedoch keine Messung auf dem Wasser. Prüfe die Stationsverläufe und Messzeiten vor dem Vergleich.

## Regionale Prognose statt Messung in Isleten
Die Tabelle wird für Altdorf im Tal berechnet. Sie zeigt einen regionalen Trend, aber weder alle Ufer noch eine Beobachtung in Isleten. Die Seite [Wetter und Webcam von Windsurfing Urnersee](https://windsurfing-urnersee.ch/ueber-uns/wetter-und-webcam) ergänzt diesen Punkt durch örtliche Hinweise. Beachte das Aufnahmedatum der Bilder.

## Einstieg Isleten und Sperrzeiten
Das [dokumentierte Profil Isleten](https://www.openwind.ch/de/spots/swiss-kite-isleten) gilt für den Uferstart nördlich im Isenthalerbach-Delta. Dieser Start ist vom 15. Juni bis 31. August einschliesslich gesperrt. Der Planer schliesst auch Dezember und Januar für die Kitesurfnavigation aus; begleitete Bootssessions haben einen anderen Zugang.

## Zugänge und Nutzungszonen prüfen
Konsultiere vor der Wahl des Einstiegs die Informationen des Kantons Uri und den dort verlinkten Plan. Prüfe die Angaben für deine Sportart und die aktuelle Beschilderung. Die Quellen unten ergänzen die Karte; ein Verweis auf einen Ort ist keine Erlaubnis zur Nutzung.`,
      faq: [
        {
          question: "Gehört der Urnersee zum Vierwaldstättersee?",
          answer:
            "Ja, er bildet dessen südlichen Arm. Eine Messung aus einem anderen Becken des Vierwaldstättersees beschreibt die Bedingungen am Urnersee nicht unbedingt.",
        },
        {
          question: "Misst Altdorf den Wind in Flüelen?",
          answer:
            "Nein. Die Station misst an ihrem Standort im Reusstal. Nutze ihren Verlauf als regionalen Kontext und ergänze ihn durch örtliche Beobachtungen.",
        },
        {
          question: "Wo liegt der Prognosepunkt?",
          answer:
            "Die Tabelle wird für Altdorf / Reusstal berechnet. Sie ist von den Stationsmessungen getrennt und beschreibt nicht jedes Ufer des Sees.",
        },
        {
          question: "Wo finde ich die Kitesurf-Zonen am Urnersee?",
          answer:
            "Die Publikation des Kantons Uri verweist auf die Informationen und den Zonenplan. Prüfe diese offizielle Quelle und die Beschilderung vor deiner Ausfahrt.",
        },
      ],
    },
    it: {
      title:
        "Vento all’Urnersee: stazioni, favonio e previsioni del lago di Uri",
      description:
        "Prepara un’uscita all’Urnersee: vento osservato ad Altdorf e Gersau, previsioni regionali, webcam e fonti locali per Flüelen e Isleten.",
      place: "Urnersee / Lago di Uri",
      coverAlt:
        "Vista da Seelisberg sull’Urnersee e sui suoi versanti montuosi",
      content: `## Orientarsi nel bacino dell’Urnersee
L’Urnersee è il braccio meridionale del lago dei Quattro Cantoni. Per un’uscita da Flüelen o Isleten, individua prima il tuo settore: un’osservazione in un altro bacino non descrive automaticamente la tua riva. Apri la mappa e le webcam intorno al lago e confronta le informazioni con il punto di partenza previsto.

## Favonio: seguire evoluzione e raffiche
Il favonio è centrale nella lettura del vento locale. Windsurfing Urnersee descrive episodi che possono essere forti, irregolari e influenzati dal rilievo. Una media non basta: confronta raffiche, direzione ed evoluzione. La presenza di vento, da sola, non indica condizioni favorevoli per la tua uscita.

## Altdorf e Gersau: riferimenti distinti
Altdorf misura nell’entroterra della valle della Reuss, non su una spiaggia di Flüelen. Gersau si trova in un bacino vicino, fuori dall’Urnersee. Entrambe offrono contesto regionale e le differenze possono essere utili; la loro media non diventa però una misura sull’acqua. Consulta gli storici e gli orari prima del confronto.

## Previsioni regionali, non misure a Isleten
La tabella è calcolata per Altdorf, nella valle. Aiuta a seguire la tendenza regionale ma non rappresenta tutte le rive né un’osservazione a Isleten. La pagina [meteo e webcam di Windsurfing Urnersee](https://windsurfing-urnersee.ch/ueber-uns/wetter-und-webcam) offre ulteriori riferimenti locali. Controlla la data delle immagini.

## Accesso Isleten e chiusure
Il [profilo documentato Isleten](https://www.openwind.ch/it/spots/swiss-kite-isleten) riguarda la partenza da riva a nord del delta Isenthalerbach, chiusa dal 15 giugno al 31 agosto inclusi. Il pianificatore esclude anche dicembre e gennaio per la navigazione kite; le sessioni assistite da barca prevedono un accesso diverso.

## Verificare accessi e zone di pratica
Prima di scegliere l’ingresso in acqua, consulta le informazioni del Canton Uri e il piano collegato. Verifica le indicazioni per la tua attività e la segnaletica aggiornata. Le fonti sotto completano la mappa; un collegamento a un luogo non costituisce un’autorizzazione a utilizzarlo.`,
      faq: [
        {
          question: "L’Urnersee fa parte del lago dei Quattro Cantoni?",
          answer:
            "Sì, ne costituisce il braccio meridionale, chiamato anche lago di Uri. Una misura in un altro bacino non descrive necessariamente le condizioni dell’Urnersee.",
        },
        {
          question: "La stazione di Altdorf misura il vento a Flüelen?",
          answer:
            "No. Misura nel proprio punto nella valle della Reuss. Consulta lo storico come contesto regionale e completalo con osservazioni locali.",
        },
        {
          question: "Dove si trova il punto delle previsioni?",
          answer:
            "La tabella è calcolata per Altdorf / Reusstal. È distinta dalle misure delle stazioni e non descrive ogni riva del lago.",
        },
        {
          question: "Dove verificare le zone per il kitesurf all’Urnersee?",
          answer:
            "La pubblicazione del Canton Uri rimanda alle informazioni e al piano delle zone. Consulta questa fonte ufficiale e la segnaletica locale prima dell’uscita.",
        },
      ],
    },
  },
};
