import type { LocalGuide } from "../local-guides";

export const LAC_DE_BIENNE_GUIDE: LocalGuide = {
  slug: "lac-de-bienne",
  region: "Bern / Berne · Seeland",
  aliases: [
    "Lac de Bienne",
    "Bielersee",
    "Lago di Bienne",
    "Biel",
    "Bienne",
    "La Neuveville",
    "St-Joux",
    "Saint-Joux",
    "St. Petersinsel",
    "Île Saint-Pierre",
    "Seeland",
  ],
  coordinates: { lat: 47.067789, lng: 7.109966 },
  forecastPlace: "La Neuveville / Saint-Joux",
  coverImage: "/images/guides/bienne.jpg",
  coverCredit: {
    author: "W. Bulach",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:00_0370_St._Peterinsel_-_Bielersee.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T12:27:40Z",
  updatedAt: "2026-10-21T12:27:40Z",
  stations: [
    {
      id: "CRM",
      name: "Cressier",
      source: "meteoswiss",
      context: {
        fr: "Repère régional au sud-ouest du lac, dans l’Entre-deux-Lacs ; pas une mesure à Saint-Joux.",
        de: "Regionaler Vergleichspunkt südwestlich des Sees im Gebiet zwischen den Seen; keine Messung in Saint-Joux.",
        it: "Riferimento regionale a sud-ovest del lago, nell’Entre-deux-Lacs; non è una misura a Saint-Joux.",
      },
    },
    {
      id: "CHA",
      name: "Chasseral",
      source: "meteoswiss",
      context: {
        fr: "Station de sommet : contexte du relief, à ne pas interpréter comme le vent sur le lac.",
        de: "Gipfelstation: Kontext am Berg, nicht als Wind auf dem See zu interpretieren.",
        it: "Stazione di vetta: contesto montano, da non interpretare come vento sul lago.",
      },
    },
  ],
  spotIds: ["cmnvz0jc7025v04jvurt8d2ip"],
  sources: [
    {
      label: "Jura & Trois-Lacs — Plage Saint-Joux, La Neuveville",
      url: "https://www.j3l.ch/fr/P44080/a-faire/sport-loisirs/activites-aquatiques/plage-saint-joux-la-neuveville",
    },
    {
      label:
        "Police cantonale bernoise — Kitesurf, carte et informations FR/DE",
      url: "https://www.police.be.ch/content/dam/police/dokumente/police-be-ch/d/seepolizei/kite-surfen_de_fr.pdf",
    },
    {
      label: "Bielersee-Schifffahrts-Gesellschaft — St. Petersinsel",
      url: "https://www.bielersee.ch/freizeit-erleben/ausflugsziele/st-petersinsel",
    },
  ],
  translations: {
    fr: {
      title:
        "Vent au lac de Bienne : balises, prévisions et spot de Saint-Joux",
      description:
        "Préparez une sortie au lac de Bienne : repères de vent à Cressier et au Chasseral, prévisions à Saint-Joux, webcams et fiche du spot de La Neuveville.",
      place: "Lac de Bienne / La Neuveville",
      coverAlt: "Débarcadère de l’île Saint-Pierre au bord du lac de Bienne",
      content: `## Partir d’un lieu précis : La Neuveville et Saint-Joux
Le lac de Bienne, ou Bielersee, se découvre ici à partir de Saint-Joux à La Neuveville. La fiche du spot permet de situer ce point sur la carte ; l’office Jura & Trois-Lacs présente aussi la plage. Cette entrée locale donne un point de comparaison concret, sans représenter les conditions de toutes les rives jusqu’à Bienne ou autour de l’île Saint-Pierre.

## Cressier et Chasseral ne mesurent pas sur l’eau
Cressier est un repère régional au sud-ouest du lac, dans l’Entre-deux-Lacs. Chasseral est une station de sommet, exposée à un contexte de relief différent. Leur comparaison sert à observer la situation régionale, pas à produire une valeur de vent pour Saint-Joux. En particulier, une rafale au Chasseral ne doit pas être présentée comme une rafale au niveau du lac.

## La prévision est calculée à Saint-Joux
Le tableau correspond au point de La Neuveville / Saint-Joux, à l’emplacement de la fiche du spot. Les observations de Cressier et du Chasseral restent des données séparées, issues de leurs capteurs. Comparez les heures et l’évolution des directions plutôt qu’un seul chiffre ; une divergence appelle une vérification près de votre départ.

## Images, historique et choix de la rive
Ouvrez les historiques des balises pour distinguer une tendance d’une variation ponctuelle. Les webcams autour du lac peuvent compléter cette lecture si leur cadrage montre le secteur concerné et si leur image est récente. Pour une autre rive, déplacez votre recherche sur la carte : la proximité sur une vue d’ensemble ne suffit pas à confirmer une exposition identique.

## Plages, navigation et secteurs protégés
Consultez les informations de la Police cantonale bernoise sur le kitesurf et les zones indiquées sur sa carte, puis vérifiez les consignes locales en vigueur. La présence d’une plage ou d’un débarcadère n’autorise pas automatiquement la mise à l’eau pour chaque activité. La photographie de l’île Saint-Pierre illustre le lac ; elle ne désigne pas un départ de kitesurf.`,
      faq: [
        {
          question: "Où consulter le vent au lac de Bienne ?",
          answer:
            "Le guide présente les observations régionales de Cressier et du Chasseral, avec source et heure. Elles complètent la prévision au point de Saint-Joux et les vérifications sur votre rive.",
        },
        {
          question:
            "La station du Chasseral indique-t-elle le vent sur le lac ?",
          answer:
            "Non. C’est une station de sommet. Ses mesures donnent un contexte en altitude et ne doivent pas être assimilées aux conditions sur l’eau.",
        },
        {
          question: "Où se situe le spot relié à ce guide ?",
          answer:
            "La fiche La Neuveville | St-Joux est le point local associé au guide. Le tableau des prévisions est calculé à ses coordonnées, pas au Chasseral.",
        },
        {
          question: "Peut-on mettre son kite à l’eau sur toutes les plages ?",
          answer:
            "Ne le déduisez pas d’une carte ou d’une photographie. Consultez les informations de la Police cantonale bernoise, les zones de sa carte et la signalisation locale pour votre activité.",
        },
      ],
    },
    de: {
      title: "Wind am Bielersee: Messstationen, Prognose und Spot Saint-Joux",
      description:
        "Plane einen Ausflug an den Bielersee: Windmessungen in Cressier und auf dem Chasseral, Prognose für Saint-Joux, Webcams und Spot-Seite La Neuveville.",
      place: "Bielersee / La Neuveville",
      coverAlt: "Schiffsanlegestelle der St. Petersinsel am Bielersee",
      content: `## Mit einem konkreten Ort beginnen: Saint-Joux
Dieser Guide erschliesst den Bielersee vom Ausgangspunkt Saint-Joux in La Neuveville aus. Die Spot-Seite verortet den Punkt auf der Karte; Jura & Drei-Seen-Land stellt zudem den Strand vor. Dieser lokale Bezug beschreibt nicht automatisch sämtliche Ufer bis Biel oder die Umgebung der St. Petersinsel.

## Cressier und Chasseral messen nicht auf dem Wasser
Cressier liefert einen regionalen Vergleichspunkt südwestlich des Sees zwischen den Seen. Chasseral ist eine Gipfelstation mit einer anderen Geländeexposition. Ihr Vergleich hilft bei der regionalen Einordnung, erzeugt aber keinen Windmesswert für Saint-Joux. Insbesondere darf eine Böe auf dem Chasseral nicht als Böe auf Seehöhe dargestellt werden.

## Die Prognose wird für Saint-Joux berechnet
Die Tabelle entspricht dem Punkt La Neuveville / Saint-Joux an den Koordinaten der Spot-Seite. Die Beobachtungen aus Cressier und vom Chasseral bleiben davon getrennte Sensordaten. Vergleiche Messzeiten und Richtungsverläufe statt nur einer einzelnen Zahl; bei Abweichungen ist eine Prüfung nahe dem Einstieg sinnvoll.

## Bilder, Stationsverläufe und Uferwahl
Öffne die Stationsverläufe, um einen Trend von einer einzelnen Schwankung zu unterscheiden. Webcams rund um den See ergänzen die Einschätzung, sofern ihr Bildausschnitt den betreffenden Bereich zeigt und die Aufnahme aktuell ist. Für ein anderes Ufer verschiebst du die Suche auf der Karte: Räumliche Nähe in einer Übersicht bestätigt keine gleiche Exposition.

## Strände, Schifffahrt und Schutzbereiche
Konsultiere die Kitesurf-Informationen der Kantonspolizei Bern samt eingezeichneten Zonen und prüfe die aktuell geltenden örtlichen Hinweise. Ein Strand oder eine Anlegestelle erlaubt nicht automatisch den Einstieg für jede Sportart. Das Foto der St. Petersinsel illustriert den See und kennzeichnet keinen Kitesurf-Startplatz.`,
      faq: [
        {
          question: "Wo finde ich Windinformationen für den Bielersee?",
          answer:
            "Der Guide zeigt regionale Beobachtungen aus Cressier und vom Chasseral mit Quelle und Zeitpunkt. Sie ergänzen die Prognose für Saint-Joux und die Prüfung an deinem Ufer.",
        },
        {
          question: "Zeigt Chasseral den Wind auf dem See?",
          answer:
            "Nein. Es handelt sich um eine Gipfelstation. Ihre Werte beschreiben den Kontext in der Höhe und dürfen nicht mit den Bedingungen auf dem Wasser gleichgesetzt werden.",
        },
        {
          question: "Wo liegt der verlinkte Spot?",
          answer:
            "Die Spot-Seite La Neuveville | St-Joux ist der lokale Bezugspunkt dieses Guides. Die Prognosetabelle wird für dessen Koordinaten berechnet und nicht für den Chasseral.",
        },
        {
          question: "Darf man an jedem Strand mit dem Kite einsteigen?",
          answer:
            "Leite das nicht aus einer Karte oder einem Foto ab. Prüfe die Angaben der Kantonspolizei Bern, die Zonen ihrer Karte und die örtliche Beschilderung für deine Sportart.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Bienne: stazioni, previsioni e spot Saint-Joux",
      description:
        "Prepara un’uscita al lago di Bienne: riferimenti di vento a Cressier e sul Chasseral, previsioni a Saint-Joux, webcam e scheda spot di La Neuveville.",
      place: "Lago di Bienne / La Neuveville",
      coverAlt: "Approdo dell’isola di San Pietro sul lago di Bienne",
      content: `## Partire da un luogo preciso: Saint-Joux
Questa guida affronta il lago di Bienne, o Bielersee, a partire da Saint-Joux a La Neuveville. La scheda dello spot permette di situare il punto sulla mappa; Jura & Tre Laghi presenta anche la spiaggia. Questo riferimento locale non rappresenta automaticamente tutte le rive fino a Bienne o intorno all’isola di San Pietro.

## Cressier e Chasseral non misurano sull’acqua
Cressier è un riferimento regionale a sud-ovest del lago, nell’Entre-deux-Lacs. Chasseral è una stazione di vetta, esposta a un contesto montano diverso. Il confronto aiuta a osservare la situazione regionale, ma non produce una misura del vento a Saint-Joux. In particolare, una raffica sul Chasseral non va presentata come una raffica al livello del lago.

## Le previsioni sono calcolate a Saint-Joux
La tabella corrisponde al punto La Neuveville / Saint-Joux, alle coordinate della scheda dello spot. Le osservazioni di Cressier e Chasseral restano dati separati dei rispettivi sensori. Confronta orari ed evoluzione delle direzioni anziché un solo numero; una divergenza richiede una verifica vicino al punto di partenza.

## Immagini, storici e scelta della riva
Apri gli storici delle stazioni per distinguere una tendenza da una variazione isolata. Le webcam intorno al lago possono completare la lettura se inquadrano il settore interessato e se l’immagine è recente. Per un’altra riva, sposta la ricerca sulla mappa: la vicinanza in una panoramica non conferma un’esposizione identica.

## Spiagge, navigazione e aree protette
Consulta le informazioni della Polizia cantonale bernese sul kitesurf e le zone della sua mappa, poi verifica le indicazioni locali in vigore. La presenza di una spiaggia o di un approdo non autorizza automaticamente l’entrata in acqua per ogni attività. La foto dell’isola di San Pietro illustra il lago e non indica una partenza per il kitesurf.`,
      faq: [
        {
          question: "Dove consultare il vento al lago di Bienne?",
          answer:
            "La guida mostra le osservazioni regionali di Cressier e Chasseral con fonte e ora. Completano le previsioni nel punto di Saint-Joux e le verifiche sulla tua riva.",
        },
        {
          question: "La stazione del Chasseral indica il vento sul lago?",
          answer:
            "No. È una stazione di vetta. Le misure descrivono il contesto in quota e non vanno assimilate alle condizioni sull’acqua.",
        },
        {
          question: "Dove si trova lo spot collegato alla guida?",
          answer:
            "La scheda La Neuveville | St-Joux è il riferimento locale associato alla guida. La tabella delle previsioni è calcolata alle sue coordinate, non sul Chasseral.",
        },
        {
          question: "Si può entrare con il kite da tutte le spiagge?",
          answer:
            "Non dedurlo da una mappa o da una fotografia. Consulta le informazioni della Polizia cantonale bernese, le zone sulla sua mappa e la segnaletica locale per la tua attività.",
        },
      ],
    },
  },
};
