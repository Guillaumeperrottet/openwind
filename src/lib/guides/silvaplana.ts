import type { LocalGuide } from "../local-guides";

export const SILVAPLANA_GUIDE: LocalGuide = {
  slug: "lac-de-silvaplana",
  region: "Engadin · Graubünden / Grisons",
  aliases: [
    "Silvaplana",
    "Silvaplanersee",
    "Lej da Silvaplauna",
    "Lago di Silvaplana",
    "Surlej",
    "Sils-Maria",
    "Segl-Maria",
    "Malojawind",
    "Maloja",
  ],
  coordinates: { lat: 46.455, lng: 9.795 },
  forecastPlace: "Silvaplana",
  coverImage: "/images/guides/silvaplana.jpg",
  coverCredit: {
    author: "Hansueli Krapf",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:2011-08-01_13-29-34_Switzerland_Silvaplana.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  publishedAt: "2026-10-21T12:27:40Z",
  updatedAt: "2026-10-21T12:27:40Z",
  stations: [
    {
      id: "SIA",
      name: "Segl-Maria",
      source: "meteoswiss",
      context: {
        fr: "Repère de vallée à Sils-Maria, près de l’extrémité sud-ouest du lac ; pas une mesure sur l’eau.",
        de: "Talstation bei Sils-Maria nahe dem südwestlichen Seeende; keine Messung auf dem Wasser.",
        it: "Riferimento di valle a Sils-Maria, vicino all’estremità sud-occidentale del lago; non è una misura sull’acqua.",
      },
    },
    {
      id: "SAM",
      name: "Samedan",
      source: "meteoswiss",
      context: {
        fr: "Contexte régional dans un autre secteur de Haute-Engadine.",
        de: "Regionaler Vergleich in einem anderen Abschnitt des Oberengadins.",
        it: "Contesto regionale in un altro settore dell’Alta Engadina.",
      },
    },
  ],
  spotIds: ["cmnpsrv1j0004haf6wrq773k8"],
  sources: [
    {
      label: "Silvaplana Tourismus — Wassersport et plan des zones",
      url: "https://silvaplana.ch/wassersport",
    },
    {
      label: "Sils Tourismus — sports nautiques et vent de Maloja",
      url: "https://www.sils.ch/de/guide/aktivitaeten/wassersport",
    },
    {
      label: "Windsurfing Silvaplana — Zonenplan",
      url: "https://windsurfing-silvaplana.ch/en/more-information/zonenplan",
    },
  ],
  translations: {
    fr: {
      title: "Vent à Silvaplana : balises, Maloja et prévisions du lac",
      description:
        "Préparez une sortie au lac de Silvaplana : mesures régionales à Segl-Maria et Samedan, prévisions au point du spot, webcams et sources sur les accès.",
      place: "Lac de Silvaplana",
      coverAlt:
        "Kitesurf et windsurf sur le lac de Silvaplana, en Haute-Engadine",
      content: `## Situer sa sortie en Haute-Engadine
Le lac de Silvaplana, ou Silvaplanersee, demande une lecture à l’échelle du lieu de départ. Commencez par la fiche du spot Silvaplana, puis comparez la situation autour du lac. Ce guide concerne ce plan d’eau ; il ne faut pas transposer ses informations aux lacs voisins de Sils ou de Champfèr.

## Maloja : un mécanisme, pas un rendez-vous garanti
Les offices de tourisme présentent le vent de Maloja comme un élément central des sports nautiques locaux. Sa réputation ne remplace pas les mesures du jour. Consultez la direction, l’évolution des rafales et la prévision à Silvaplana plutôt que de supposer qu’un vent attendu sera déjà établi à votre arrivée.

## Ce que mesurent Segl-Maria et Samedan
Segl-Maria, à Sils-Maria, fournit un repère de vallée à proximité du sud-ouest du lac. Samedan donne un contexte dans un autre secteur de Haute-Engadine. Aucune de ces stations ne mesure le vent sur votre zone de navigation. Un écart entre leurs directions mérite une vérification locale ; une valeur forte dans la vallée n’est pas une confirmation des conditions sur toute la surface du lac.

## Lire la prévision du spot et les images
Le tableau ci-dessus correspond au point de Silvaplana, distinct des emplacements des deux capteurs. Ouvrez leurs historiques pour voir les tendances et les webcams autour du lieu pour compléter la lecture du terrain. Vérifiez l’heure de chaque image et de chaque observation avant de comparer les sources.

## Vérifier son accès avant le départ
Le plan officiel distingue des usages et des zones d’entrée. Consultez-le, ainsi que les informations des écoles pour votre activité et les services disponibles à la date de votre sortie. Un itinéraire vers le spot ne suffit pas à identifier une entrée autorisée. Les liens officiels figurent dans les sources.`,
      faq: [
        {
          question: "Où consulter le vent en direct à Silvaplana ?",
          answer:
            "Les cartes affichent les mesures disponibles de Segl-Maria et Samedan, avec leur source et leur heure. Ce sont des repères régionaux ; consultez également les historiques et observez votre secteur du lac.",
        },
        {
          question:
            "Le vent de Maloja souffle-t-il chaque jour à la même heure ?",
          answer:
            "Ne planifiez pas une sortie sur cette seule hypothèse. Comparez la prévision du jour aux observations récentes et aux informations locales avant le déplacement.",
        },
        {
          question: "La prévision est-elle calculée à Samedan ?",
          answer:
            "Non. Le tableau est calculé au point de Silvaplana. Samedan et Segl-Maria sont les emplacements des observations présentées séparément.",
        },
        {
          question: "Où trouver le plan des zones de sports nautiques ?",
          answer:
            "Les pages de Silvaplana Tourismus et de Windsurfing Silvaplana donnent accès au plan. Vérifiez les consignes correspondant à votre activité et les accès officiels avant de vous installer.",
        },
      ],
    },
    de: {
      title: "Wind am Silvaplanersee: Messstationen, Maloja und Prognose",
      description:
        "Plane deinen Ausflug nach Silvaplana: regionale Messungen in Segl-Maria und Samedan, Prognose am Spot, Webcams und Quellen zu den Zugängen.",
      place: "Silvaplanersee / Silvaplana",
      coverAlt: "Kite- und Windsurfer auf dem Silvaplanersee im Oberengadin",
      content: `## Den Ausgangspunkt im Oberengadin wählen
Am Silvaplanersee beginnt die Vorbereitung mit dem konkreten Startbereich. Öffne die Spot-Seite Silvaplana und vergleiche danach die Lage rund um den See. Dieser Guide betrifft den Silvaplanersee; seine Informationen gelten nicht automatisch für den Silsersee oder den Champfèrersee.

## Malojawind: ein Mechanismus, kein fester Termin
Die Tourismusorganisationen beschreiben den Malojawind als wichtigen Bestandteil des örtlichen Wassersports. Sein Ruf ersetzt die Tagesbeobachtungen nicht. Prüfe Richtung, Böenentwicklung und Prognose für Silvaplana, anstatt einen bereits etablierten Wind bei deiner Ankunft vorauszusetzen.

## Was Segl-Maria und Samedan tatsächlich messen
Segl-Maria bei Sils-Maria liefert einen Vergleichspunkt im Tal nahe dem südwestlichen Seeende. Samedan beschreibt einen anderen Abschnitt des Oberengadins. Keine dieser Stationen misst den Wind an deinem Bereich auf dem Wasser. Unterschiedliche Richtungen sind ein Anlass zur örtlichen Prüfung; ein hoher Talwert bestätigt keine einheitlichen Bedingungen auf dem See.

## Spot-Prognose und Bilder zusammen lesen
Die Tabelle wird für den Punkt Silvaplana berechnet, getrennt von den Standorten der beiden Sensoren. Die Stationsverläufe zeigen die Entwicklung; Webcams in der Umgebung ergänzen den Eindruck vom Gelände. Vergleiche nur mit Blick auf die jeweiligen Aufnahme- und Messzeiten.

## Den Zugang vor der Anreise prüfen
Der offizielle Zonenplan unterscheidet Nutzungen und Einstiege. Prüfe ihn und die Informationen der Schulen für deine Sportart sowie die am Ausflugstag verfügbaren Angebote. Eine Route zum Spot zeigt noch keinen erlaubten Einstieg. Die offiziellen Verweise findest du in den Quellen.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind für Silvaplana?",
          answer:
            "Die Karten zeigen verfügbare Messungen von Segl-Maria und Samedan mit Quelle und Zeitpunkt. Es sind regionale Vergleichspunkte. Prüfe auch die Verläufe und die Bedingungen an deinem Seeabschnitt.",
        },
        {
          question: "Kommt der Malojawind jeden Tag zur gleichen Zeit?",
          answer:
            "Verlasse dich bei der Planung nicht allein auf diese Annahme. Vergleiche die Tagesprognose mit aktuellen Beobachtungen und örtlichen Informationen.",
        },
        {
          question: "Wird die Prognose für Samedan berechnet?",
          answer:
            "Nein. Der Berechnungspunkt der Tabelle ist Silvaplana. Samedan und Segl-Maria sind die getrennt dargestellten Messstandorte.",
        },
        {
          question: "Wo steht der Zonenplan für den Wassersport?",
          answer:
            "Die Seiten von Silvaplana Tourismus und Windsurfing Silvaplana verlinken den Plan. Prüfe die Angaben für deine Sportart und die offiziellen Zugänge vor dem Aufbau.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Silvaplana: stazioni, Maloja e previsioni",
      description:
        "Prepara un’uscita a Silvaplana: misure regionali a Segl-Maria e Samedan, previsioni nel punto dello spot, webcam e fonti sugli accessi.",
      place: "Lago di Silvaplana",
      coverAlt: "Kitesurf e windsurf sul lago di Silvaplana, in Alta Engadina",
      content: `## Scegliere il punto di partenza in Alta Engadina
Al lago di Silvaplana, o Silvaplanersee, parti dalla zona in cui desideri entrare in acqua. Apri la scheda dello spot Silvaplana e confronta poi la situazione intorno al lago. Questa guida riguarda quel bacino: non trasferire automaticamente le informazioni ai laghi vicini di Sils o di Champfèr.

## Maloja: un meccanismo, non un appuntamento garantito
Gli enti turistici presentano il vento del Maloja come un elemento centrale degli sport acquatici locali. La sua reputazione non sostituisce le misure della giornata. Consulta direzione, evoluzione delle raffiche e previsioni a Silvaplana senza dare per scontato che il vento atteso sia già presente al tuo arrivo.

## Che cosa misurano Segl-Maria e Samedan
Segl-Maria, presso Sils-Maria, offre un riferimento di valle vicino all’estremità sud-occidentale del lago. Samedan descrive un altro settore dell’Alta Engadina. Nessuna delle due stazioni misura il vento nella tua zona sull’acqua. Direzioni differenti richiedono una verifica locale; un valore elevato nella valle non conferma condizioni uniformi sul lago.

## Leggere insieme previsioni e immagini
La tabella corrisponde al punto di Silvaplana, distinto dalle posizioni dei due sensori. Gli storici delle stazioni mostrano l’evoluzione; le webcam nei dintorni completano l’osservazione del territorio. Controlla l’ora di ogni immagine e misura prima del confronto.

## Verificare l’accesso prima di partire
Il piano ufficiale distingue usi e punti di entrata. Consultalo insieme alle informazioni delle scuole per la tua attività e ai servizi disponibili nella data dell’uscita. Un percorso verso lo spot non identifica da solo un accesso autorizzato. I collegamenti ufficiali sono nelle fonti.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta a Silvaplana?",
          answer:
            "Le schede mostrano le misure disponibili di Segl-Maria e Samedan con fonte e ora. Sono riferimenti regionali: consulta anche gli storici e osserva il settore del lago interessato.",
        },
        {
          question: "Il vento del Maloja arriva ogni giorno alla stessa ora?",
          answer:
            "Non basare l’uscita soltanto su questa ipotesi. Confronta le previsioni della giornata con osservazioni recenti e informazioni locali prima di partire.",
        },
        {
          question: "Le previsioni sono calcolate per Samedan?",
          answer:
            "No. Il punto di calcolo della tabella è Silvaplana. Samedan e Segl-Maria sono le posizioni delle osservazioni mostrate separatamente.",
        },
        {
          question: "Dove trovare il piano delle zone per gli sport acquatici?",
          answer:
            "Le pagine di Silvaplana Tourismus e Windsurfing Silvaplana rimandano al piano. Prima di preparare l’attrezzatura, verifica le indicazioni per la tua attività e gli accessi ufficiali.",
        },
      ],
    },
  },
};
