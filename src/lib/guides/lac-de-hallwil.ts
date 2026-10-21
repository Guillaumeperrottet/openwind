import type { LocalGuide } from "../local-guides";

export const LAC_DE_HALLWIL_GUIDE: LocalGuide = {
  slug: "lac-de-hallwil",
  region: "Aargau · Luzern · Seetal",
  aliases: [
    "Hallwil",
    "Hallwilersee",
    "Hallwiler See",
    "Lac de Hallwil",
    "Lago di Hallwil",
    "Lake Hallwil",
    "Mosen",
    "Beinwil am See",
    "Meisterschwanden",
    "Tennwil",
    "Aesch",
    "Seetal",
  ],
  coordinates: { lat: 47.24384541737169, lng: 8.232828992949576 },
  forecastPlace: "Mosen",
  coverImage: "/images/guides/hallwil.jpg",
  coverCredit: {
    author: "Carsten Steger",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_image_of_Lake_Hallwil_(view_from_the_south).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T14:17:46Z",
  updatedAt: "2026-10-21T14:17:46Z",
  stations: [
    {
      id: "MOA",
      name: "Mosen",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Mosen, près de l’extrémité sud du Hallwilersee ; pas une mesure sur l’eau ni à Meisterschwanden.",
        de: "Landstation in Mosen beim südlichen Ende des Hallwilersees; keine Messung auf dem Wasser oder in Meisterschwanden.",
        it: "Stazione terrestre a Mosen, presso l’estremità sud del Hallwilersee; non misura sull’acqua né a Meisterschwanden.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Seetal Tourismus — Activités nautiques",
      url: "https://www.seetaltourismus.ch/de/erleben/aktivitaeten/wassererlebnisse",
    },
    {
      label: "Seetal Tourismus — Webcams",
      url: "https://www.seetaltourismus.ch/de/webcams",
    },
    {
      label: "Kanton Luzern — Hallwilersee / Zugersee, règles de kitesurf",
      url: "https://strassenverkehrsamt.lu.ch/schifffahrt/Kitesurfen/Hallwilersee_Zugersee",
    },
    {
      label:
        "Kanton Aargau — Navigation, modifications entrées en vigueur en 2024",
      url: "https://www.ag.ch/de/medien/medienmitteilungen?mm=aenderung-der-verordnung-ueber-die-schifffahrt-tritt-am-1-mai-2024-in-kraft-470c4eef-9f93-43a6-ac8e-c307e68f2ab7_de",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Hallwil : balise de Mosen, prévisions et webcams",
      description:
        "Préparez une sortie au Hallwilersee : vent observé à Mosen, prévisions locales, webcams, voile, SUP et sources pour les accès et les zones protégées.",
      place: "Lac de Hallwil / Hallwilersee",
      coverAlt:
        "Vue aérienne du lac de Hallwil depuis le sud, avec les villages, les champs et les rives du Seetal",
      content: `## Mosen, Beinwil ou Meisterschwanden : situer sa rive
Le lac de Hallwil, Hallwilersee en allemand, se trouve dans le Seetal entre Argovie et Lucerne. Commencez par situer votre sortie : Mosen au sud, Beinwil am See sur la rive ouest, Meisterschwanden ou Tennwil sur la rive est. Une webcam montrant une partie du lac ne décrit pas nécessairement les abords d’une plage située sur l’autre rive.

## Mosen mesure à terre au sud du lac
La balise MeteoSwiss MOA apporte un repère près de l’extrémité sud. Son emplacement est terrestre : elle ne mesure pas sur l’eau ni à Meisterschwanden. Regardez direction, rafales, historique et heure d’observation. Une valeur ponctuelle aide à comprendre le contexte local, mais ne constitue pas une moyenne mesurée sur tout le Hallwilersee.

## Une prévision au point de Mosen
Le tableau est calculé aux coordonnées de Mosen, séparément de la mesure observée. Il permet de comparer l’évolution attendue à ce point avant de vérifier votre secteur. Pour préparer une sortie sur un autre lac, le [guide de Sempach](/fr/vent-en-direct/lac-de-sempach) utilise une prévision à Nottwil et une autre balise régionale. Les deux pages proposent des repères distincts.

## Voile, SUP et accès selon l’activité
Seetal Tourismus référence des activités de voile, de SUP et de location autour du Hallwilersee. Vérifiez le point de rendez-vous, les conditions d’utilisation et les horaires auprès de l’opérateur. Le kitesurf est interdit sur le lac selon les informations cantonales citées. Une offre de location de bateau ou de SUP ne constitue pas une autorisation pour une autre pratique.

## Webcams et zones protégées
L’office de tourisme présente plusieurs vues depuis Beinwil am See. Choisissez l’orientation pertinente et vérifiez la date de l’image. Les sources cantonales renseignent les restrictions de navigation et les secteurs protégés ; consultez également les avis actuels et les panneaux. Un accès à une plage ou une vue aérienne ne suffit pas à désigner un départ adapté à votre activité.`,
      faq: [
        {
          question: "Où voir le vent en direct au Hallwilersee ?",
          answer:
            "La balise MeteoSwiss Mosen affiche l’observation disponible avec son heure et sa source. Elle se trouve à terre près de l’extrémité sud du lac.",
        },
        {
          question: "La prévision correspond-elle à Meisterschwanden ?",
          answer:
            "La table est calculée au point terrestre de Mosen. Elle ne représente pas une prévision spécifique à Meisterschwanden, Beinwil am See ou à toutes les rives.",
        },
        {
          question: "Peut-on pratiquer le kite au lac de Hallwil ?",
          answer:
            "Les informations cantonales citées indiquent que le kitesurf y est interdit. Ce guide présente des repères pour les activités locales documentées et les règles du lac.",
        },
        {
          question: "Où trouver une webcam pour préparer une sortie ?",
          answer:
            "Seetal Tourismus référence plusieurs vues depuis Beinwil am See. Vérifiez l’orientation, le secteur visible et la date de l’image avant de la comparer aux observations de Mosen.",
        },
      ],
    },
    de: {
      title: "Wind am Hallwilersee: Messstation Mosen, Prognose und Webcams",
      description:
        "Plane deine Tour am Hallwilersee: Windmessung in Mosen, lokale Prognose, Webcams, Segeln, SUP und Quellen zu Zugängen und Schutzbereichen.",
      place: "Hallwilersee / Mosen",
      coverAlt:
        "Luftaufnahme des Hallwilersees von Süden mit Dörfern, Feldern und den Ufern des Seetals",
      content: `## Mosen, Beinwil oder Meisterschwanden: das Ufer wählen
Der Hallwilersee liegt im Seetal zwischen Aargau und Luzern. Verorte zuerst deinen Ausflug: Mosen im Süden, Beinwil am See am Westufer, Meisterschwanden oder Tennwil am Ostufer. Eine Webcam mit Blick auf einen Teil des Sees beschreibt nicht unbedingt die Umgebung eines Strands am anderen Ufer.

## Mosen misst an Land im Süden
Die MeteoSwiss-Station MOA liefert einen Vergleichspunkt beim südlichen Seeende. Ihr Standort liegt an Land; sie misst weder auf dem Wasser noch in Meisterschwanden. Prüfe Richtung, Böen, Verlauf und Messzeitpunkt. Ein Einzelwert hilft beim Einordnen des örtlichen Kontexts, ist jedoch kein gemessener Mittelwert des gesamten Hallwilersees.

## Prognose für den Punkt Mosen
Die Tabelle wird für die Koordinaten von Mosen getrennt vom beobachteten Messwert berechnet. Vergleiche die erwartete Entwicklung an diesem Punkt und prüfe anschliessend deinen Abschnitt. Für eine andere Tour nutzt der [Sempachersee-Guide](/de/vent-en-direct/lac-de-sempach) eine Prognose für Nottwil und eine andere regionale Station. Beide Seiten bieten eigenständige Bezugspunkte.

## Segeln, SUP und sportbezogene Zugänge
Seetal Tourismus nennt Segel-, SUP- und Mietangebote rund um den Hallwilersee. Kläre Treffpunkt, Nutzungsbedingungen und Öffnungszeiten beim Anbieter. Nach den verlinkten kantonalen Angaben ist Kitesurfen auf dem See verboten. Ein Boots- oder SUP-Verleih erlaubt keine andere Sportart.

## Webcams und Schutzbereiche
Das Tourismusbüro zeigt mehrere Ansichten von Beinwil am See. Wähle die passende Ausrichtung und prüfe den Bildzeitpunkt. Kantonale Quellen informieren über Schifffahrtsbeschränkungen und Schutzbereiche; konsultiere auch aktuelle Mitteilungen und örtliche Schilder. Strandzugang und Luftbild allein bezeichnen keinen passenden Ausgangspunkt für deine Aktivität.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Hallwilersee?",
          answer:
            "Die MeteoSwiss-Station Mosen zeigt die verfügbare Beobachtung mit Zeitpunkt und Quelle. Sie steht an Land beim südlichen Ende des Sees.",
        },
        {
          question: "Gilt die Prognose für Meisterschwanden?",
          answer:
            "Die Tabelle wird für den Landpunkt Mosen berechnet. Sie ist keine eigene Prognose für Meisterschwanden, Beinwil am See oder sämtliche Ufer.",
        },
        {
          question: "Ist Kitesurfen auf dem Hallwilersee erlaubt?",
          answer:
            "Die verlinkten kantonalen Informationen nennen ein Kitesurfverbot. Dieser Guide bietet Orientierung zu dokumentierten örtlichen Aktivitäten und den Vorgaben am See.",
        },
        {
          question: "Wo finde ich eine Webcam für die Vorbereitung?",
          answer:
            "Seetal Tourismus nennt mehrere Ansichten aus Beinwil am See. Prüfe Ausrichtung, sichtbaren Abschnitt und Bildzeitpunkt vor dem Vergleich mit den Beobachtungen in Mosen.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Hallwil: stazione di Mosen, previsioni e webcam",
      description:
        "Prepara l’uscita sul lago di Hallwil: vento osservato a Mosen, previsioni locali, webcam, vela, SUP e fonti su accessi e zone protette.",
      place: "Lago di Hallwil / Hallwilersee",
      coverAlt:
        "Veduta aerea del lago di Hallwil da sud con villaggi, campi e rive del Seetal",
      content: `## Mosen, Beinwil o Meisterschwanden: individuare la riva
Il lago di Hallwil, Hallwilersee in tedesco, si trova nel Seetal tra Argovia e Lucerna. Individua prima l’uscita: Mosen a sud, Beinwil am See sulla riva ovest, Meisterschwanden o Tennwil sulla riva est. Una webcam che mostra parte del lago non descrive necessariamente i dintorni di una spiaggia sulla riva opposta.

## Mosen misura sulla terraferma a sud
La stazione MeteoSwiss MOA offre un riferimento presso l’estremità meridionale. È terrestre: non misura sull’acqua né a Meisterschwanden. Controlla direzione, raffiche, storico e ora dell’osservazione. Un singolo valore aiuta a capire il contesto locale, ma non costituisce una media misurata su tutto il lago.

## Previsioni nel punto di Mosen
La tabella è calcolata alle coordinate di Mosen, separatamente dalla misura osservata. Permette di confrontare l’evoluzione attesa in quel punto prima di verificare il tuo settore. Per un’uscita su un altro lago, la [guida di Sempach](/it/vent-en-direct/lac-de-sempach) usa previsioni a Nottwil e una diversa stazione regionale. Le pagine offrono riferimenti distinti.

## Vela, SUP e accessi secondo l’attività
Seetal Tourismus elenca attività di vela, SUP e noleggio intorno al lago di Hallwil. Verifica ritrovo, condizioni d’uso e orari presso l’operatore. Secondo le informazioni cantonali citate il kitesurf sul lago è vietato. Un noleggio di barche o SUP non autorizza un’altra pratica.

## Webcam e zone protette
L’ufficio turistico presenta diverse viste da Beinwil am See. Scegli l’orientamento pertinente e controlla la data dell’immagine. Le fonti cantonali informano su restrizioni di navigazione e settori protetti; consulta anche avvisi attuali e cartelli. L’accesso a una spiaggia o una foto aerea non bastano a indicare una partenza adatta alla tua attività.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta sul lago di Hallwil?",
          answer:
            "La stazione MeteoSwiss Mosen mostra l’osservazione disponibile con ora e fonte. Si trova sulla terraferma vicino all’estremità sud del lago.",
        },
        {
          question: "La previsione corrisponde a Meisterschwanden?",
          answer:
            "La tabella è calcolata nel punto terrestre di Mosen. Non è una previsione specifica per Meisterschwanden, Beinwil am See o tutte le rive.",
        },
        {
          question: "Si può praticare kite al lago di Hallwil?",
          answer:
            "Le informazioni cantonali citate indicano che il kitesurf è vietato. La guida offre riferimenti per le attività locali documentate e le disposizioni del lago.",
        },
        {
          question: "Dove trovare una webcam per preparare un’uscita?",
          answer:
            "Seetal Tourismus elenca diverse viste da Beinwil am See. Verifica orientamento, settore visibile e data dell’immagine prima di confrontarla con le osservazioni di Mosen.",
        },
      ],
    },
  },
};
