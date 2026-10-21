import type { LocalGuide } from "../local-guides";

export const LAC_DE_ZOUG_GUIDE: LocalGuide = {
  slug: "lac-de-zoug",
  region: "Zug · Schwyz · Luzern",
  aliases: [
    "Zoug",
    "Zug",
    "Zugersee",
    "Lac de Zoug",
    "Lago di Zugo",
    "Lake Zug",
    "Cham",
    "Risch",
    "Immensee",
    "Walchwil",
  ],
  coordinates: { lat: 47.18827683188062, lng: 8.464640938133495 },
  forecastPlace: "Cham",
  coverImage: "/images/guides/zoug.jpg",
  coverCredit: {
    author: "Zikai Liu",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Zugersee-2021-11-07.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:41:02Z",
  updatedAt: "2026-10-21T13:41:02Z",
  stations: [
    {
      id: "CHZ",
      name: "Cham",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Cham, en retrait de la rive nord du lac de Zoug ; pas une mesure sur l’eau ni à Walchwil.",
        de: "Landstation in Cham abseits des nördlichen Zugerseeufers; keine Messung auf dem Wasser oder in Walchwil.",
        it: "Stazione terrestre a Cham, arretrata rispetto alla riva nord del lago di Zugo; non misura sull’acqua né a Walchwil.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Zug Tourismus — Wind- und Kitesurfen",
      url: "https://www.zug-tourismus.ch/de/poi/sport-und-freizeitanlage/wind-kitesurfen-zug/",
    },
    {
      label: "Kanton Luzern — Hallwilersee / Zugersee, Kitesurfen",
      url: "https://strassenverkehrsamt.lu.ch/schifffahrt/Kitesurfen/Hallwilersee_Zugersee",
    },
    {
      label: "Kanton Zug — Flachwassersperrzonen, Mitteilung 2024",
      url: "https://zg.ch/de/news/2024/May/neue-flachwassersperrzonen-auf-dem-aegeri-und-zugersee",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Zoug : balise de Cham, prévisions et accès",
      description:
        "Préparez une sortie au lac de Zoug : vent mesuré à Cham, prévisions locales, webcams et repères pour distinguer les rives du Zugersee et leurs accès.",
      place: "Lac de Zoug / Zugersee",
      coverAlt:
        "Vue du lac de Zoug depuis les hauteurs, avec une ferme au premier plan et la presqu’île de Chiemen",
      content: `## Zoug, Cham ou la partie sud du lac
Le lac de Zoug, Zugersee en allemand et Lago di Zugo en italien, relie les paysages de Suisse centrale entre Zoug, Risch, Walchwil et Immensee. Commencez par situer votre rive : le secteur de Cham au nord et les rives plus au sud ne présentent pas les mêmes reliefs ni les mêmes vues sur l’eau. Une webcam tournée vers la ville de Zoug ne suffit pas pour juger un départ près d’Immensee.

## La balise de Cham donne un repère terrestre
La station MeteoSwiss CHZ est implantée à terre, en retrait de la rive nord. Sa direction, ses rafales et son historique aident à suivre l’évolution locale. Elle ne mesure pas au milieu du lac ni à Walchwil. Comparez l’heure des observations avec celle des images disponibles ; une valeur ancienne reste un repère daté et ne devient pas une mesure actuelle.

## Une prévision calculée à Cham
Le tableau utilise les coordonnées de la station de Cham. La prévision de modèle reste distincte de la mesure observée : elle sert à comparer l’évolution attendue et les créneaux à ce point terrestre. Pour une sortie dans la partie sud du lac, complétez ces informations par les conditions de votre secteur plutôt que d’étendre la valeur de Cham à toute la surface.

## Windsurf, kite et accès locaux
Zoug Tourisme présente les pratiques de windsurf et de kitesurf et renvoie aux entrées et sorties officielles du club. Consultez ces informations avant de choisir votre départ. Un quai, une promenade ou une plage visible sur une photographie ne désigne pas à lui seul un emplacement adapté à votre activité. Vérifiez aussi les horaires saisonniers des prestataires.

## Zones protégées et webcams
Le lac concerne plusieurs cantons : consultez les sources compétentes pour la rive choisie, ainsi que les avis et la signalisation des zones de faible profondeur. La source cantonale de 2024 documente ces protections ; les consignes sur place restent à vérifier le jour de la sortie. Sur la carte des webcams, choisissez un angle utile et contrôlez la date de l’image.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac de Zoug ?",
          answer:
            "La carte Cham présente l’observation MeteoSwiss disponible avec sa source et son heure. La station est terrestre, près du secteur nord du lac ; elle ne décrit pas à elle seule toutes les rives.",
        },
        {
          question: "La prévision correspond-elle à la ville de Zoug ?",
          answer:
            "Le point de calcul est Cham, aux coordonnées terrestres indiquées dans le guide. Il ne s’agit pas d’une prévision au centre de Zoug ni d’une moyenne du Zugersee.",
        },
        {
          question:
            "Cham renseigne-t-elle les conditions à Walchwil ou Immensee ?",
          answer:
            "Cham fournit un contexte local au nord du lac. Pour Walchwil et Immensee, vérifiez également une vue pertinente et les conditions du secteur : reliefs et exposition peuvent différer.",
        },
        {
          question: "Où vérifier les mises à l’eau et les restrictions ?",
          answer:
            "Zoug Tourisme renvoie aux accès officiels du club. Consultez aussi les informations cantonales, les avis actuels et la signalisation de la rive choisie, notamment près des zones protégées.",
        },
      ],
    },
    de: {
      title: "Wind am Zugersee: Messstation Cham, Prognose und Zugänge",
      description:
        "Plane einen Ausflug an den Zugersee: Windmessung in Cham, lokale Prognose, Webcams und Orientierung zu den verschiedenen Ufern und Zugängen.",
      place: "Zugersee / Zug",
      coverAlt:
        "Blick von einer Anhöhe auf den Zugersee mit einem Bauernhaus im Vordergrund und der Halbinsel Chiemen",
      content: `## Zug, Cham oder der südliche Seeabschnitt
Der Zugersee, französisch Lac de Zoug und italienisch Lago di Zugo, verbindet die Zentralschweizer Landschaften zwischen Zug, Risch, Walchwil und Immensee. Verorte zuerst dein Ufer: Cham im Norden und die südlicheren Abschnitte haben unterschiedliche Geländeformen und Blickrichtungen auf das Wasser. Eine Webcam zur Stadt Zug genügt nicht, um einen Ausgangspunkt bei Immensee zu beurteilen.

## Cham liefert eine Landbeobachtung
Die MeteoSwiss-Station CHZ liegt an Land abseits des nördlichen Seeufers. Richtung, Böen und Verlauf helfen beim Einordnen der lokalen Entwicklung. Die Station misst weder in der Seemitte noch in Walchwil. Vergleiche den Messzeitpunkt mit den verfügbaren Bildern; ein älterer Wert bleibt eine datierte Beobachtung und wird nicht zu einer aktuellen Messung.

## Prognose für den Punkt Cham
Die Tabelle nutzt die Koordinaten der Station Cham. Die Modellprognose bleibt von der Beobachtung getrennt: Sie hilft beim Vergleich von Zeitfenstern und der erwarteten Entwicklung an diesem Landpunkt. Ergänze für einen Ausflug in den südlichen Seeabschnitt die Bedingungen vor Ort, statt den Wert aus Cham auf die ganze Wasserfläche zu übertragen.

## Windsurfen, Kiten und örtliche Zugänge
Zug Tourismus beschreibt Wind- und Kitesurfen und verweist auf offizielle Ein- und Ausstiegsstellen des Clubs. Prüfe diese Angaben vor der Wahl des Ausgangspunkts. Ein Steg, eine Promenade oder ein abgebildeter Strand bezeichnet allein noch keinen geeigneten Zugang für deine Sportart. Kläre auch saisonale Öffnungszeiten bei den Anbietern.

## Schutzbereiche und Webcams
Mehrere Kantone sind am See beteiligt. Konsultiere die zuständigen Quellen für dein Ufer sowie Mitteilungen und Beschilderung zu Flachwasserbereichen. Die kantonale Mitteilung von 2024 dokumentiert solche Schutzmassnahmen; prüfe die örtlichen Vorgaben am Ausflugstag. Wähle auf der Webcam-Karte einen passenden Ausschnitt und kontrolliere den Bildzeitpunkt.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Zugersee?",
          answer:
            "Die Karte Cham zeigt die verfügbare MeteoSwiss-Beobachtung mit Quelle und Zeitpunkt. Die Station liegt an Land beim nördlichen Seeabschnitt und beschreibt nicht allein sämtliche Ufer.",
        },
        {
          question: "Gilt die Prognose für die Stadt Zug?",
          answer:
            "Berechnungspunkt ist Cham an den im Guide genannten Landkoordinaten. Es handelt sich weder um eine Prognose für das Zentrum von Zug noch um einen Mittelwert des Zugersees.",
        },
        {
          question:
            "Beschreibt Cham die Bedingungen in Walchwil oder Immensee?",
          answer:
            "Cham liefert lokalen Kontext im Norden. Prüfe für Walchwil und Immensee auch einen passenden Blick und die örtlichen Bedingungen; Gelände und Exposition können abweichen.",
        },
        {
          question: "Wo prüfe ich Einstiege und Einschränkungen?",
          answer:
            "Zug Tourismus verweist auf offizielle Club-Zugänge. Konsultiere ausserdem kantonale Informationen, aktuelle Mitteilungen und die Beschilderung am gewählten Ufer, insbesondere bei Schutzbereichen.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Zugo: stazione di Cham, previsioni e accessi",
      description:
        "Prepara un’uscita al lago di Zugo: vento misurato a Cham, previsioni locali, webcam e riferimenti per distinguere rive e accessi del Zugersee.",
      place: "Lago di Zugo / Zugersee",
      coverAlt:
        "Lago di Zugo visto dall’alto con una fattoria in primo piano e la penisola di Chiemen",
      content: `## Zugo, Cham o il settore meridionale
Il lago di Zugo, Zugersee in tedesco e Lac de Zoug in francese, collega i paesaggi della Svizzera centrale fra Zugo, Risch, Walchwil e Immensee. Individua prima la riva: il settore di Cham a nord e le rive più a sud non hanno gli stessi rilievi e punti di vista. Una webcam orientata verso la città di Zugo non basta per valutare una partenza vicino a Immensee.

## Cham offre un riferimento terrestre
La stazione MeteoSwiss CHZ si trova sulla terraferma, arretrata rispetto alla riva nord. Direzione, raffiche e storico aiutano a seguire l’evoluzione locale. Non misura al centro del lago né a Walchwil. Confronta l’ora delle osservazioni con quella delle immagini disponibili; un valore vecchio resta un riferimento datato, non una misura attuale.

## Previsioni calcolate a Cham
La tabella usa le coordinate della stazione di Cham. La previsione del modello resta distinta dalla misura osservata: permette di confrontare fasce orarie ed evoluzione attesa in quel punto terrestre. Per un’uscita nel settore meridionale completa queste informazioni con le condizioni del tuo tratto, senza estendere il valore di Cham a tutta la superficie.

## Windsurf, kite e accessi locali
Zugo Turismo presenta windsurf e kitesurf e rimanda ai punti ufficiali di ingresso e uscita del club. Consulta queste informazioni prima di scegliere la partenza. Un pontile, una passeggiata o una spiaggia fotografata non indicano da soli un accesso adatto alla tua attività. Verifica anche gli orari stagionali degli operatori.

## Zone protette e webcam
Il lago interessa diversi cantoni: consulta le fonti competenti per la riva scelta e gli avvisi e la segnaletica delle zone di acqua bassa. La comunicazione cantonale del 2024 documenta queste protezioni; verifica le indicazioni locali il giorno dell’uscita. Sulla mappa delle webcam scegli un’inquadratura utile e controlla la data dell’immagine.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Zugo?",
          answer:
            "La scheda Cham presenta l’osservazione MeteoSwiss disponibile con fonte e ora. La stazione è terrestre, presso il settore nord del lago; da sola non descrive tutte le rive.",
        },
        {
          question: "La previsione corrisponde alla città di Zugo?",
          answer:
            "Il punto di calcolo è Cham, alle coordinate terrestri indicate nella guida. Non è una previsione per il centro di Zugo né una media del Zugersee.",
        },
        {
          question: "Cham descrive le condizioni a Walchwil o Immensee?",
          answer:
            "Cham offre un contesto locale a nord del lago. Per Walchwil e Immensee verifica anche una vista pertinente e le condizioni del settore: rilievi ed esposizione possono differire.",
        },
        {
          question: "Dove verificare ingressi in acqua e restrizioni?",
          answer:
            "Zugo Turismo rimanda agli accessi ufficiali del club. Consulta anche informazioni cantonali, avvisi attuali e segnaletica della riva scelta, soprattutto presso le zone protette.",
        },
      ],
    },
  },
};
