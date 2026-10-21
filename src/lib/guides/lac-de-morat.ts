import type { LocalGuide } from "../local-guides";

export const LAC_DE_MORAT_GUIDE: LocalGuide = {
  slug: "lac-de-morat",
  region: "Fribourg / Freiburg · Vaud · Vully",
  aliases: [
    "Morat",
    "Murten",
    "Murtensee",
    "Lac de Morat",
    "Lago di Morat",
    "Lago di Murten",
    "Lake Murten",
    "Murtenstrand",
    "Faoug",
    "Vully",
    "Muntelier",
    "Sugiez",
    "Bise Noire",
  ],
  coordinates: { lat: 46.929, lng: 7.107 },
  forecastPlace: "Morat / Murtenstrand",
  coverImage: "/images/guides/morat.jpg",
  coverCredit: {
    author: "Carsten Steger",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_image_of_Lake_Murten_(view_from_the_northeast).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T12:57:29Z",
  updatedAt: "2026-10-21T12:57:29Z",
  stations: [
    {
      id: "PAY",
      name: "Payerne",
      source: "meteoswiss",
      context: {
        fr: "Station régionale dans la plaine de la Broye, hors du lac de Morat ; pas une mesure à Murtenstrand.",
        de: "Regionale Station in der Broye-Ebene ausserhalb des Murtensees; keine Messung am Murtenstrand.",
        it: "Stazione regionale nella pianura della Broye, fuori dal lago di Morat; non misura a Murtenstrand.",
      },
    },
    {
      id: "CRM",
      name: "Cressier",
      source: "meteoswiss",
      context: {
        fr: "Cressier dans le canton de Neuchâtel, dans l’Entre-deux-Lacs ; à distinguer de Cressier FR et des rives de Morat.",
        de: "Cressier im Kanton Neuenburg zwischen den Seen; nicht Cressier FR und keine Messung am Murtenseeufer.",
        it: "Cressier nel Canton Neuchâtel, nell’Entre-deux-Lacs; da distinguere da Cressier FR e dalle rive del lago di Morat.",
      },
    },
  ],
  spotIds: ["cmnr32jo00009ijf6k6kjqgsp"],
  sources: [
    {
      label: "Fribourg Région — Surfcenter La Bise Noire",
      url: "https://fribourg.ch/fr/regionlacdemorat/activites-en-plein-air/surfcenter-la-bise-noire/",
    },
    {
      label: "Région Lac de Morat — Webcams",
      url: "https://fribourg.ch/fr/regionlacdemorat/webcams/",
    },
    {
      label: "Canton de Fribourg — Navigation sur certains lacs, RSF 785.21",
      url: "https://bdlf.fr.ch/app/fr/texts_of_law/785.21",
    },
    {
      label: "Association Romande de Kitesurf — Navigation et réserves",
      url: "https://www.kitesurf.ch/navigation",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Morat : balises, prévisions et spot Murtenstrand",
      description:
        "Préparez une sortie au lac de Morat : prévisions à Murtenstrand, observations régionales de Payerne et Cressier, webcams, spot et sources sur les accès.",
      place: "Lac de Morat / Murtensee",
      coverAlt:
        "Vue aérienne du lac de Morat depuis le nord-est, avec les rives du Vully et de Morat",
      content: `## Morat, Faoug ou le Vully : situer son départ
Le lac de Morat, appelé Murtensee en allemand, complète la région des Trois-Lacs avec Neuchâtel et Bienne. Ce guide prend pour point de départ la fiche Morat – Murtenstrand. Repérez votre rive avant de comparer les conditions : une webcam tournée vers Faoug ou le Vully ne décrit pas nécessairement la surface de l’eau devant votre départ.

## Des repères régionaux, pas des capteurs à Murtenstrand
Payerne mesure dans la plaine de la Broye, hors du lac. La station Cressier présentée ici se trouve dans le canton de Neuchâtel, dans l’Entre-deux-Lacs : il ne s’agit pas du village de Cressier FR près de Morat. Ces deux observations donnent un contexte régional. Ni leur valeur ni leur moyenne ne constituent une mesure à la plage de Morat.

## Prévision du spot et évolution des observations
Le tableau est calculé aux coordonnées de Morat / Murtenstrand, distinctes de celles des stations. Consultez les historiques pour voir si une direction s’établit ou change et comparez des horaires proches. La fiche du spot mentionne les directions NE et SW ; cela ne garantit ni leur présence le jour de la sortie ni une exposition identique sur tout le lac.

## Webcams et pratique locale
La Région Lac de Morat référence des webcams autour de Morat, Faoug et Sugiez. Choisissez une vue pertinente et vérifiez sa date plutôt que de supposer qu’une image est en direct. Pour les activités et services, la page du Surfcenter La Bise Noire présente l’offre locale. Les horaires, cours et disponibilités se vérifient auprès du prestataire.

## Vérifier l’accès et les réserves
Consultez le texte cantonal fribourgeois, ses annexes et les informations sur les réserves avant de choisir une mise à l’eau. Le lac comporte des secteurs relevant de Fribourg et de Vaud ; les indications d’une rive ne suffisent pas pour une autre. Une plage publique, une photographie ou une fiche de spot ne remplace pas la signalisation et les consignes applicables sur place.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac de Morat ?",
          answer:
            "Les cartes montrent les observations régionales disponibles de Payerne et Cressier avec leur source et leur heure. Elles complètent la prévision à Murtenstrand et les vérifications près de votre départ.",
        },
        {
          question: "La station Cressier est-elle située près de Morat ?",
          answer:
            "La balise CRM est à Cressier NE, dans l’Entre-deux-Lacs. Ce n’est pas Cressier FR. Elle fournit un contexte régional et ne mesure pas à Murtenstrand.",
        },
        {
          question: "Le tableau des prévisions correspond-il à Payerne ?",
          answer:
            "Non. Le point de calcul est Morat / Murtenstrand, à l’emplacement de la fiche du spot. Les observations de Payerne et de Cressier sont présentées séparément.",
        },
        {
          question: "Comment vérifier les accès au lac de Morat ?",
          answer:
            "Consultez les sources cantonales, les informations sur les réserves et la signalisation de votre secteur. Vérifiez aussi les consignes locales pour l’activité prévue et les zones de baignade.",
        },
      ],
    },
    de: {
      title: "Wind am Murtensee: Messstationen, Prognose und Spot Murtenstrand",
      description:
        "Plane einen Ausflug an den Murtensee: Prognose am Murtenstrand, regionale Messungen aus Payerne und Cressier, Webcams, Spot und Quellen zu Zugängen.",
      place: "Murtensee / Murten",
      coverAlt:
        "Luftaufnahme des Murtensees von Nordosten mit den Ufern von Vully und Murten",
      content: `## Murten, Faoug oder Vully: den Ausgangspunkt verorten
Der Murtensee ergänzt zusammen mit Neuenburgersee und Bielersee das Drei-Seen-Land. Ausgangspunkt dieses Guides ist die Spot-Seite Morat – Murtenstrand. Verorte vor dem Vergleich dein Ufer: Eine Webcam mit Blick nach Faoug oder Vully zeigt nicht unbedingt die Wasseroberfläche vor deinem Einstieg.

## Regionale Vergleichspunkte statt Sensoren am Murtenstrand
Payerne misst in der Broye-Ebene ausserhalb des Sees. Die hier angezeigte Station Cressier liegt im Kanton Neuenburg zwischen den Seen; gemeint ist nicht Cressier FR bei Murten. Beide Beobachtungen liefern regionalen Kontext. Weder ihr Einzelwert noch ihr Mittelwert ist eine Messung am Strand von Murten.

## Spot-Prognose und Messverläufe vergleichen
Die Tabelle wird für die Koordinaten von Murten / Murtenstrand berechnet, getrennt von den Stationsstandorten. Prüfe in den Verläufen, ob sich eine Richtung einstellt oder ändert, und vergleiche zeitnahe Daten. Die Spot-Seite nennt NE und SW als Richtungen; das garantiert weder ihr Auftreten am Ausflugstag noch gleiche Exposition am ganzen See.

## Webcams und örtliche Angebote
Die Region Murtensee verlinkt Webcams rund um Murten, Faoug und Sugiez. Wähle einen passenden Bildausschnitt und prüfe das Datum, statt eine Live-Aufnahme vorauszusetzen. Für Aktivitäten und Angebote stellt die Seite des Surfcenters La Bise Noire örtliche Möglichkeiten vor. Öffnungszeiten, Kurse und Verfügbarkeit klärst du beim Anbieter.

## Zugänge und Schutzbereiche prüfen
Konsultiere den Freiburger Erlass samt Anhängen und die Hinweise zu Schutzgebieten vor der Wahl des Einstiegs. Am See gibt es Bereiche der Kantone Freiburg und Waadt; Angaben zu einem Ufer gelten nicht automatisch am anderen. Ein öffentlicher Strand, ein Foto oder eine Spot-Seite ersetzt keine Beschilderung und örtlich geltenden Vorgaben.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind für den Murtensee?",
          answer:
            "Die Karten zeigen verfügbare regionale Beobachtungen aus Payerne und Cressier mit Quelle und Zeitpunkt. Sie ergänzen die Prognose am Murtenstrand und die Prüfung nahe deinem Einstieg.",
        },
        {
          question: "Liegt die Station Cressier bei Murten?",
          answer:
            "Die Station CRM liegt in Cressier NE zwischen den Seen, nicht in Cressier FR. Sie liefert regionalen Kontext und misst nicht am Murtenstrand.",
        },
        {
          question: "Gilt die Prognosetabelle für Payerne?",
          answer:
            "Nein. Der Berechnungspunkt ist Murten / Murtenstrand an den Koordinaten der Spot-Seite. Die Beobachtungen aus Payerne und Cressier werden getrennt angezeigt.",
        },
        {
          question: "Wie prüfe ich die Zugänge zum Murtensee?",
          answer:
            "Konsultiere kantonale Quellen, Hinweise zu Schutzgebieten und die Beschilderung deines Abschnitts. Prüfe auch örtliche Vorgaben für deine Sportart und die Badezonen.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Morat: stazioni, previsioni e spot Murtenstrand",
      description:
        "Prepara un’uscita al lago di Morat: previsioni a Murtenstrand, osservazioni regionali di Payerne e Cressier, webcam, spot e fonti sugli accessi.",
      place: "Lago di Morat / Murtensee",
      coverAlt:
        "Veduta aerea del lago di Morat da nord-est con le rive del Vully e di Morat",
      content: `## Morat, Faoug o Vully: individuare la partenza
Il lago di Morat, Murtensee in tedesco, completa la regione dei Tre Laghi con Neuchâtel e Bienne. Questa guida parte dalla scheda Morat – Murtenstrand. Individua la tua riva prima di confrontare le condizioni: una webcam rivolta verso Faoug o Vully non descrive necessariamente la superficie davanti al tuo punto di partenza.

## Riferimenti regionali, non sensori a Murtenstrand
Payerne misura nella pianura della Broye, fuori dal lago. La stazione Cressier qui mostrata si trova nel Canton Neuchâtel, nell’Entre-deux-Lacs: non è il villaggio di Cressier FR vicino a Morat. Entrambe offrono contesto regionale. Né i singoli valori né la loro media costituiscono una misura sulla spiaggia di Morat.

## Confrontare previsioni dello spot e osservazioni
La tabella è calcolata alle coordinate di Morat / Murtenstrand, distinte da quelle delle stazioni. Consulta gli storici per capire se una direzione si stabilizza o cambia e confronta orari vicini. La scheda dello spot indica NE e SW come direzioni: ciò non garantisce la loro presenza nel giorno dell’uscita né un’esposizione uguale in tutto il lago.

## Webcam e attività locali
La Regione Lago di Morat elenca webcam intorno a Morat, Faoug e Sugiez. Scegli un’inquadratura pertinente e controlla la data anziché presumere una ripresa in diretta. La pagina del Surfcenter La Bise Noire presenta attività e servizi locali. Orari, corsi e disponibilità vanno verificati presso l’operatore.

## Verificare accessi e riserve
Consulta il testo cantonale friburghese, gli allegati e le informazioni sulle riserve prima di scegliere l’ingresso in acqua. Il lago comprende settori di Friburgo e Vaud; le indicazioni di una riva non bastano per un’altra. Una spiaggia pubblica, una fotografia o una scheda spot non sostituisce la segnaletica e le disposizioni applicabili sul posto.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Morat?",
          answer:
            "Le schede mostrano le osservazioni regionali disponibili di Payerne e Cressier con fonte e ora. Completano le previsioni a Murtenstrand e le verifiche vicino alla partenza.",
        },
        {
          question: "La stazione Cressier è vicino a Morat?",
          answer:
            "La stazione CRM è a Cressier NE, nell’Entre-deux-Lacs, non a Cressier FR. Offre contesto regionale e non misura a Murtenstrand.",
        },
        {
          question: "La tabella delle previsioni corrisponde a Payerne?",
          answer:
            "No. Il punto di calcolo è Morat / Murtenstrand, alle coordinate della scheda dello spot. Le osservazioni di Payerne e Cressier sono mostrate separatamente.",
        },
        {
          question: "Come verificare gli accessi al lago di Morat?",
          answer:
            "Consulta fonti cantonali, informazioni sulle riserve e segnaletica del settore. Verifica anche le indicazioni locali per l’attività prevista e le zone di balneazione.",
        },
      ],
    },
  },
};
