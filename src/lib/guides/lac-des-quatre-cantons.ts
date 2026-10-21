import type { LocalGuide } from "../local-guides";

export const LAC_DES_QUATRE_CANTONS_GUIDE: LocalGuide = {
  slug: "lac-des-quatre-cantons",
  region: "Luzern · Nidwalden · Obwalden · Schwyz · Uri",
  aliases: [
    "Quatre-Cantons",
    "Lac des Quatre-Cantons",
    "Vierwaldstättersee",
    "Vierwaldstaettersee",
    "Lago dei Quattro Cantoni",
    "Lake Lucerne",
    "Luzern",
    "Lucerne",
    "Gersau",
    "Weggis",
    "Vitznau",
    "Brunnen",
  ],
  coordinates: { lat: 47.03523277710668, lng: 8.300015126465718 },
  forecastPlace: "Luzern",
  coverImage: "/images/guides/quatre-cantons.jpg",
  coverCredit: {
    author: "Daniel Reust",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Vierwaldst%C3%A4ttersee_von_Brunnen_aus.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:18:15Z",
  updatedAt: "2026-10-21T13:18:15Z",
  stations: [
    {
      id: "LUZ",
      name: "Luzern",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre sur les hauteurs de Lucerne ; repère régional, pas une mesure sur le lac.",
        de: "Landstation oberhalb von Luzern; regionaler Vergleichspunkt, keine Messung auf dem See.",
        it: "Stazione terrestre sopra Lucerna; riferimento regionale, non una misura sul lago.",
      },
    },
    {
      id: "GES",
      name: "Gersau",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Gersau, dans un autre bassin que Lucerne et l’Urnersee ; exposition locale distincte.",
        de: "Landstation in Gersau, in einem anderen Seebecken als Luzern und der Urnersee; eigene lokale Exposition.",
        it: "Stazione terrestre a Gersau, in un bacino diverso da Lucerna e dall’Urnersee; esposizione locale distinta.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Luzern Tourismus — See und Berge",
      url: "https://www.luzern.com/de/stadt/sehenswuerdigkeiten/see-berge",
    },
    {
      label: "Luzern Tourismus — Seen, Bäder und Wassersport",
      url: "https://www.luzern.com/de/erlebnisregion/sommer/seen-baeder/All",
    },
    {
      label: "Kanton Luzern — Kitesurfen auf dem Vierwaldstättersee",
      url: "https://strassenverkehrsamt.lu.ch/schifffahrt/Kitesurfen/Vierwaldstaettersee",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac des Quatre-Cantons : balises, prévisions et bassins",
      description:
        "Comparez le vent à Lucerne et Gersau, la prévision à Luzern et les différents bassins du lac des Quatre-Cantons. Accès, webcams et guide Urnersee.",
      place: "Lac des Quatre-Cantons / Vierwaldstättersee",
      coverAlt:
        "Lac des Quatre-Cantons au coucher du soleil depuis Brunnen, entre les silhouettes des montagnes",
      content: `## Un lac, plusieurs bassins à comparer
Le lac des Quatre-Cantons, Vierwaldstättersee en allemand, relie Lucerne aux paysages de Suisse centrale. Pour préparer une sortie, commencez par situer votre secteur : Lucerne, Weggis, Vitznau, Gersau ou Brunnen ne donnent pas sur une étendue d’eau uniforme. Les caps, les reliefs et l’orientation des bras du lac changent les repères disponibles depuis la rive.

## Lucerne et Gersau : deux observations terrestres
La station Luzern se trouve sur les hauteurs de Lucerne. Celle de Gersau renseigne un autre bassin. Comparez leurs directions, rafales et horaires pour comprendre le contexte régional, sans transposer automatiquement une valeur à votre départ. Deux mesures différentes ne sont pas à moyenner pour produire un vent supposé au milieu du lac.

## Une prévision à Luzern, un guide dédié à l’Urnersee
Le tableau est calculé aux coordonnées terrestres de Luzern. Il aide à suivre l’évolution prévue à ce point ; il ne couvre pas chaque rive. Pour le bras méridional vers Flüelen et la vallée de la Reuss, consultez le [guide spécialisé de l’Urnersee](/fr/vent-en-direct/urnersee), avec ses propres stations et son point de prévision à Altdorf. Cette vue d’ensemble sert à choisir un bassin avant d’approfondir ses conditions.

## Choisir une webcam et un accès adaptés
Ouvrez la carte des webcams autour du lac et cherchez une vue orientée vers votre secteur. Vérifiez la date de l’image et ce qui est réellement visible. Les pages de Luzern Tourismus présentent des lieux de baignade et des prestataires nautiques ; leur présence ne signifie pas que chaque activité est autorisée à chaque endroit.

## Consulter les règles du secteur choisi
Le lac s’étend sur plusieurs cantons. La page du canton de Lucerne précise ses règles de kitesurf et les exceptions dans ses eaux : ne les étendez pas à tout le lac. Vérifiez les indications de l’autorité compétente et la signalisation près du départ, notamment autour des ports et zones de baignade.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac des Quatre-Cantons ?",
          answer:
            "Les balises Luzern et Gersau affichent les observations disponibles avec leur source et leur heure. Ce sont des stations terrestres de deux secteurs distincts, à compléter par les conditions près de votre rive.",
        },
        {
          question:
            "La prévision représente-t-elle tout le Vierwaldstättersee ?",
          answer:
            "Le point de calcul est Luzern, à terre. La table ne représente ni tous les bassins ni l’ensemble des rives ; choisissez le secteur correspondant à votre sortie.",
        },
        {
          question: "Quel guide utiliser pour Flüelen et l’Urnersee ?",
          answer:
            "Le guide Urnersee détaille ce bras du lac avec Altdorf comme point de prévision et des observations contextualisées. Le présent guide donne la vue d’ensemble des Quatre-Cantons.",
        },
        {
          question: "Les règles de kitesurf sont-elles identiques partout ?",
          answer:
            "Les indications cantonales concernent les eaux et secteurs qu’elles décrivent. Consultez l’autorité de votre secteur, les restrictions et les consignes affichées avant de choisir votre accès.",
        },
      ],
    },
    de: {
      title:
        "Wind am Vierwaldstättersee: Messstationen, Prognose und Seebecken",
      description:
        "Vergleiche Windmessungen aus Luzern und Gersau, die Prognose für Luzern und die Seebecken des Vierwaldstättersees. Webcams, Zugänge und Urnersee-Guide.",
      place: "Vierwaldstättersee",
      coverAlt:
        "Vierwaldstättersee im Sonnenuntergang von Brunnen aus zwischen dunklen Bergsilhouetten",
      content: `## Verschiedene Seebecken gezielt vergleichen
Der Vierwaldstättersee verbindet Luzern mit den Landschaften der Zentralschweiz. Verorte vor einem Ausflug deinen Abschnitt: Luzern, Weggis, Vitznau, Gersau und Brunnen liegen nicht an einer einheitlichen Wasserfläche. Landzungen, Berge und die Ausrichtung der Seearme verändern die Orientierung vom jeweiligen Ufer aus.

## Luzern und Gersau: zwei Landstationen
Die Station Luzern liegt oberhalb der Stadt. Gersau liefert Beobachtungen aus einem anderen Seebecken. Vergleiche Richtung, Böen und Zeitpunkte für den regionalen Kontext, ohne einen Wert direkt auf deinen Einstieg zu übertragen. Aus zwei unterschiedlichen Landmessungen lässt sich durch Mittelwertbildung kein gemessener Wind in der Seemitte ableiten.

## Prognosepunkt Luzern und eigener Urnersee-Guide
Die Tabelle wird für die Landkoordinaten von Luzern berechnet. Sie zeigt die erwartete Entwicklung an diesem Punkt und deckt nicht jedes Ufer ab. Für den südlichen Seearm bei Flüelen und dem Reusstal gibt es den [eigenen Urnersee-Guide](/de/vent-en-direct/urnersee) mit passenden Stationshinweisen und dem Prognosepunkt Altdorf. Diese Übersicht hilft zunächst bei der Wahl eines Beckens.

## Passende Webcam und Zugang finden
Öffne die Webcam-Karte und suche eine Ansicht deines Seeabschnitts. Prüfe den Bildzeitpunkt und den tatsächlich sichtbaren Ausschnitt. Luzern Tourismus stellt Badeplätze und Wassersportanbieter vor. Ein vorhandenes Angebot bedeutet jedoch keine Freigabe für jede Sportart an jedem Ufer.

## Vorgaben im gewählten Abschnitt prüfen
Der See erstreckt sich über mehrere Kantone. Die Luzerner Behördenseite beschreibt Kitesurfregeln und Ausnahmen für ihre Gewässer; übertrage diese Angaben nicht auf den gesamten See. Prüfe die zuständige Behörde und die Beschilderung am Ausgangspunkt, insbesondere bei Häfen und Badezonen.`,
      faq: [
        {
          question:
            "Wo finde ich aktuelle Windmessungen für den Vierwaldstättersee?",
          answer:
            "Die Karten Luzern und Gersau zeigen verfügbare Beobachtungen mit Quelle und Zeitpunkt. Beide messen an Land in unterschiedlichen Abschnitten; ergänze sie durch die Bedingungen nahe deinem Ufer.",
        },
        {
          question: "Gilt die Prognose für den ganzen Vierwaldstättersee?",
          answer:
            "Berechnungspunkt ist Luzern an Land. Die Tabelle beschreibt weder sämtliche Becken noch alle Ufer; wähle den Abschnitt passend zu deinem Ausflug.",
        },
        {
          question: "Welcher Guide passt zu Flüelen und dem Urnersee?",
          answer:
            "Der eigene Urnersee-Guide beschreibt diesen Seearm mit dem Prognosepunkt Altdorf und eingeordneten Beobachtungen. Diese Seite bietet den Überblick über den Vierwaldstättersee.",
        },
        {
          question: "Gelten überall dieselben Kitesurfregeln?",
          answer:
            "Kantonale Hinweise beziehen sich auf die jeweils beschriebenen Gewässer und Abschnitte. Prüfe die zuständige Behörde, Einschränkungen und Beschilderung vor der Wahl deines Zugangs.",
        },
      ],
    },
    it: {
      title:
        "Vento sul Lago dei Quattro Cantoni: stazioni, previsioni e bacini",
      description:
        "Confronta il vento a Lucerna e Gersau, le previsioni a Luzern e i bacini del Lago dei Quattro Cantoni. Accessi, webcam e guida dedicata all’Urnersee.",
      place: "Lago dei Quattro Cantoni / Vierwaldstättersee",
      coverAlt:
        "Lago dei Quattro Cantoni al tramonto visto da Brunnen tra le sagome delle montagne",
      content: `## Confrontare i diversi bacini del lago
Il Lago dei Quattro Cantoni, Vierwaldstättersee in tedesco, collega Lucerna ai paesaggi della Svizzera centrale. Prima di partire individua il settore: Lucerna, Weggis, Vitznau, Gersau e Brunnen non si affacciano su una superficie d’acqua uniforme. Promontori, rilievi e orientamento dei rami cambiano i riferimenti disponibili dalla riva.

## Lucerna e Gersau: due osservazioni terrestri
La stazione Luzern si trova sulle alture di Lucerna. Quella di Gersau informa su un altro bacino. Confronta direzioni, raffiche e orari per capire il contesto regionale, senza trasferire automaticamente un valore alla tua partenza. La media fra due misure terrestri diverse non diventa una misura del vento al centro del lago.

## Previsioni a Luzern e guida dedicata all’Urnersee
La tabella è calcolata alle coordinate terrestri di Luzern. Aiuta a seguire l’evoluzione prevista in quel punto, senza coprire ogni riva. Per il ramo meridionale verso Flüelen e la valle della Reuss consulta la [guida specifica dell’Urnersee](/it/vent-en-direct/urnersee), con le proprie stazioni e il punto di previsione ad Altdorf. Questa panoramica serve a scegliere un bacino prima di approfondirne le condizioni.

## Scegliere una webcam e un accesso pertinenti
Apri la mappa delle webcam e cerca un’inquadratura del tuo settore. Controlla la data e ciò che l’immagine mostra davvero. Le pagine di Luzern Tourismus presentano luoghi di balneazione e operatori nautici. La loro presenza non significa che ogni attività sia consentita in qualsiasi punto.

## Verificare le disposizioni del settore
Il lago interessa diversi cantoni. La pagina del Canton Lucerna descrive le proprie regole di kitesurf e le eccezioni nelle sue acque: non estenderle a tutto il lago. Consulta l’autorità competente e la segnaletica vicino alla partenza, soprattutto presso porti e zone di balneazione.`,
      faq: [
        {
          question:
            "Dove vedere il vento in diretta sul Lago dei Quattro Cantoni?",
          answer:
            "Le schede Luzern e Gersau mostrano le osservazioni disponibili con fonte e ora. Sono stazioni terrestri di due settori diversi, da completare con le condizioni vicino alla tua riva.",
        },
        {
          question: "La previsione rappresenta tutto il Vierwaldstättersee?",
          answer:
            "Il punto di calcolo è Luzern, sulla terraferma. La tabella non rappresenta tutti i bacini e tutte le rive; scegli il settore corrispondente alla tua uscita.",
        },
        {
          question: "Quale guida usare per Flüelen e l’Urnersee?",
          answer:
            "La guida Urnersee approfondisce quel ramo con Altdorf come punto di previsione e osservazioni contestualizzate. Questa pagina offre la panoramica dei Quattro Cantoni.",
        },
        {
          question: "Le regole di kitesurf sono uguali in tutto il lago?",
          answer:
            "Le indicazioni cantonali riguardano le acque e i settori descritti. Consulta l’autorità competente, le restrizioni e le indicazioni locali prima di scegliere l’accesso.",
        },
      ],
    },
  },
};
