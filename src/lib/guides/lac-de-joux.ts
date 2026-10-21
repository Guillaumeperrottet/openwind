import type { LocalGuide } from "../local-guides";

export const LAC_DE_JOUX_GUIDE: LocalGuide = {
  slug: "lac-de-joux",
  region: "Vaud · Vallée de Joux · Jura",
  aliases: [
    "Joux",
    "Lac de Joux",
    "Lago di Joux",
    "Lake Joux",
    "Vallée de Joux",
    "Vallee de Joux",
    "Les Charbonnières",
    "Charbonnieres",
    "Le Pont",
    "L’Abbaye",
    "Les Bioux",
    "Le Rocheray",
  ],
  coordinates: { lat: 46.670149870817745, lng: 6.312428636620685 },
  forecastPlace: "Les Charbonnières",
  coverImage: "/images/guides/joux.jpg",
  coverCredit: {
    author: "Giles Laurent",
    authorUrl: "https://gileslaurent.com/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:040_Dent_de_Vaulion_and_Lac_de_Joux_at_Sunset_Photo_by_Giles_Laurent.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:18:15Z",
  updatedAt: "2026-10-21T13:18:15Z",
  stations: [
    {
      id: "CHB",
      name: "Les Charbonnières",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre aux Charbonnières, dans le nord de la vallée près du lac Brenet ; pas une mesure sur le lac de Joux ni au Brassus.",
        de: "Landstation in Les Charbonnières im nördlichen Tal nahe dem Lac Brenet; keine Messung auf dem Lac de Joux oder in Le Brassus.",
        it: "Stazione terrestre a Les Charbonnières, nel nord della valle vicino al lago Brenet; non misura sul lago di Joux né a Le Brassus.",
      },
    },
  ],
  spotIds: ["cmnpsrv4t0008haf6wb2u0lgc"],
  sources: [
    {
      label: "Vallée de Joux Tourisme — Activités nautiques",
      url: "https://www.myvalleedejoux.ch/fr/G1545/activites-nautiques-sur-le-lac-de-joux",
    },
    {
      label: "Vallée de Joux Tourisme — Plages et activités nautiques",
      url: "https://www.myvalleedejoux.ch/fr/Z14953/plages-activites-nautiques",
    },
    {
      label: "Vallée de Joux Tourisme — Bulletin neige et état du lac",
      url: "https://www.myvalleedejoux.ch/fr/Z14759/info-neige-etat-des-pistes",
    },
    {
      label: "Association Romande de Kitesurf — Navigation et réserves",
      url: "https://www.kitesurf.ch/navigation",
    },
    {
      label: "Canton de Vaud — Guichet cartographique cantonal",
      url: "https://www.vd.ch/territoire-et-construction/cadastre-et-geoinformation/guichets-cartographiques/guichet-cantonal",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Joux : balise, prévisions et repères été-hiver",
      description:
        "Consultez la balise des Charbonnières, les prévisions locales et les accès du lac de Joux. Activités nautiques, webcams et état du lac en hiver.",
      place: "Lac de Joux / Vallée de Joux",
      coverAlt:
        "Reliefs et forêts enneigés de la Dent de Vaulion, avec le lac de Joux à l’arrière-plan au coucher du soleil",
      spotsIntro:
        "La fiche Lac de Joux ci-dessous concerne une pratique hivernale. Elle ne désigne pas un accès nautique estival et ne confirme pas l’ouverture actuelle du lac gelé.",
      content: `## Le lac de Joux selon la saison
Le lac de Joux se trouve dans la vallée de Joux, dans le Jura vaudois. Pour une sortie estivale, situez votre rive autour du Pont, de L’Abbaye, des Bioux ou du Rocheray, puis consultez les informations locales sur les plages et activités nautiques. Le lac Brenet voisin constitue un autre lac : une information qui le concerne ne décrit pas automatiquement votre départ sur le lac de Joux.

## La balise des Charbonnières est à terre
La station MeteoSwiss CHB mesure aux Charbonnières, dans le nord de la vallée près du Brenet. Elle fournit un contexte régional horodaté, sans mesurer sur l’eau ni au Brassus. Comparez direction, rafales et évolution de l’historique ; l’exposition d’une plage du lac de Joux peut différer de celle du capteur.

## Prévision locale et observation restent distinctes
Le point de calcul du tableau correspond aux Charbonnières. La prévision décrit l’évolution attendue à ce point terrestre, pas la moyenne des plages. Une webcam orientée vers votre rive peut compléter la préparation si son image est datée et pertinente. Sur place, confrontez ces repères aux conditions réellement observées.

## Une fiche hivernale, pas une mise à l’eau estivale
La fiche associée Lac de Joux porte sur une pratique hivernale sur lac gelé. Elle ne fournit pas un accès nautique pour l’été. Le vent mesuré, la photographie de couverture ou une prévision de froid ne confirment ni la solidité de la glace ni l’ouverture du lac. Consultez le bulletin de Vallée de Joux Tourisme et les avis locaux du jour avant tout projet hivernal, puis respectez balisage et fermetures.

## Vérifier le secteur avant de partir
Pour l’été, les pages touristiques présentent l’offre nautique et les plages ; vérifiez les modalités auprès des opérateurs. Consultez aussi les sources de navigation, les cartes des secteurs protégés et la signalisation. Un lieu cité dans un guide ne constitue pas une autorisation de pratiquer toutes les activités.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac de Joux ?",
          answer:
            "La balise MeteoSwiss des Charbonnières affiche la mesure disponible avec sa source et son heure. Elle est située à terre près du Brenet et fournit un contexte régional, pas une mesure sur le lac de Joux.",
        },
        {
          question: "À quel lieu correspond la prévision du guide ?",
          answer:
            "Le tableau est calculé aux coordonnées des Charbonnières. Il ne représente pas toutes les plages du lac de Joux ni un point de mesure au Brassus.",
        },
        {
          question: "La fiche de spot associée est-elle un accès pour l’été ?",
          answer:
            "La fiche Lac de Joux concerne une pratique hivernale sur lac gelé. Pour l’été, consultez les informations sur les plages et activités nautiques ainsi que les consignes du secteur choisi.",
        },
        {
          question: "Comment savoir si le lac gelé est ouvert ?",
          answer:
            "Consultez l’état du lac publié par Vallée de Joux Tourisme et les avis locaux actualisés. Une mesure de vent, une image ou une prévision de température ne confirme ni l’ouverture ni la solidité de la glace.",
        },
      ],
    },
    de: {
      title:
        "Wind am Lac de Joux: Messstation, Prognose und Sommer-Winter-Guide",
      description:
        "Windmessung in Les Charbonnières, lokale Prognose und Orientierung am Lac de Joux. Wassersport, Webcams und Informationen zum Seezustand im Winter.",
      place: "Lac de Joux / Vallée de Joux",
      coverAlt:
        "Verschneite Hänge und Wälder der Dent de Vaulion mit dem Lac de Joux im Hintergrund bei Sonnenuntergang",
      spotsIntro:
        "Die unten verlinkte Spot-Seite Lac de Joux betrifft Wintersport. Sie bezeichnet keinen Wassersportzugang im Sommer und bestätigt keine aktuelle Freigabe des gefrorenen Sees.",
      content: `## Den Lac de Joux nach Jahreszeit einordnen
Der Lac de Joux liegt im Vallée de Joux im Waadtländer Jura. Verorte für einen Sommerausflug dein Ufer bei Le Pont, L’Abbaye, Les Bioux oder Le Rocheray und prüfe die örtlichen Informationen zu Stränden und Wassersport. Der benachbarte Lac Brenet ist ein eigener See: Eine Angabe dazu beschreibt nicht automatisch deinen Ausgangspunkt am Lac de Joux.

## Les Charbonnières misst an Land
Die MeteoSwiss-Station CHB steht in Les Charbonnières im nördlichen Tal nahe dem Brenet. Sie liefert zeitlich eingeordneten regionalen Kontext, misst jedoch weder auf dem Wasser noch in Le Brassus. Vergleiche Richtung, Böen und Verlauf; ein Strand am Lac de Joux kann anders exponiert sein als der Sensor.

## Lokale Prognose und Beobachtung trennen
Der Berechnungspunkt der Tabelle liegt in Les Charbonnières. Die Prognose beschreibt die erwartete Entwicklung an diesem Landpunkt und keinen Mittelwert der Strände. Eine passend ausgerichtete Webcam kann die Vorbereitung ergänzen, sofern Bildzeitpunkt und Ausschnitt stimmen. Vergleiche diese Hinweise vor Ort mit den tatsächlich beobachteten Bedingungen.

## Winter-Spot statt Sommerzugang
Die verlinkte Spot-Seite Lac de Joux betrifft Wintersport auf dem gefrorenen See. Sie bezeichnet keinen Wassersportzugang für den Sommer. Gemessener Wind, Titelbild und eine Kälteprognose bestätigen weder Tragfähigkeit des Eises noch Freigabe des Sees. Prüfe für Winterpläne den Zustandsbericht von Vallée de Joux Tourisme und die tagesaktuellen örtlichen Mitteilungen; beachte Markierungen und Sperrungen.

## Den Abschnitt vor der Abfahrt prüfen
Für den Sommer stellen Tourismusseiten Wassersportangebote und Strände vor; kläre Einzelheiten beim Anbieter. Konsultiere auch Schifffahrtsquellen, Karten der Schutzbereiche und örtliche Beschilderung. Die Nennung eines Ortes im Guide erlaubt nicht jede Aktivität.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Lac de Joux?",
          answer:
            "Die MeteoSwiss-Station Les Charbonnières zeigt die verfügbare Messung mit Quelle und Zeitpunkt. Sie steht an Land nahe dem Brenet und liefert regionalen Kontext, keine Messung auf dem Lac de Joux.",
        },
        {
          question: "Für welchen Ort gilt die Prognose?",
          answer:
            "Die Tabelle wird für die Koordinaten von Les Charbonnières berechnet. Sie beschreibt weder alle Strände des Lac de Joux noch einen Messpunkt in Le Brassus.",
        },
        {
          question: "Ist die verlinkte Spot-Seite ein Sommerzugang?",
          answer:
            "Die Seite Lac de Joux betrifft Wintersport auf dem gefrorenen See. Prüfe für den Sommer die Informationen zu Stränden und Wassersport sowie die Vorgaben im gewählten Abschnitt.",
        },
        {
          question: "Wie prüfe ich die Freigabe des gefrorenen Sees?",
          answer:
            "Konsultiere den Seezustandsbericht von Vallée de Joux Tourisme und aktuelle örtliche Mitteilungen. Windmessung, Bild und Temperaturprognose bestätigen weder Freigabe noch Tragfähigkeit des Eises.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Joux: stazione, previsioni e guida estate-inverno",
      description:
        "Consulta la stazione di Les Charbonnières, le previsioni locali e i riferimenti del lago di Joux. Attività nautiche, webcam e stato del lago in inverno.",
      place: "Lago di Joux / Vallée de Joux",
      coverAlt:
        "Rilievi e boschi innevati della Dent de Vaulion con il lago di Joux sullo sfondo al tramonto",
      spotsIntro:
        "La scheda Lac de Joux qui sotto riguarda una pratica invernale. Non indica un accesso nautico estivo e non conferma l’apertura attuale del lago ghiacciato.",
      content: `## Il lago di Joux secondo la stagione
Il lago di Joux si trova nella Vallée de Joux, nel Giura vodese. Per un’uscita estiva individua la riva intorno a Le Pont, L’Abbaye, Les Bioux o Le Rocheray, poi consulta le informazioni locali su spiagge e attività nautiche. Il vicino lago Brenet è un lago distinto: un’indicazione che lo riguarda non descrive automaticamente la tua partenza sul lago di Joux.

## La stazione di Les Charbonnières è terrestre
La stazione MeteoSwiss CHB misura a Les Charbonnières, nel nord della valle vicino al Brenet. Fornisce un contesto regionale con orario, senza misurare sull’acqua né a Le Brassus. Confronta direzione, raffiche e andamento dello storico; l’esposizione di una spiaggia può differire da quella del sensore.

## Previsione locale e osservazione restano distinte
Il punto di calcolo della tabella corrisponde a Les Charbonnières. La previsione descrive l’evoluzione attesa in quel punto terrestre, non la media delle spiagge. Una webcam orientata verso la tua riva può completare la preparazione se l’immagine è datata e pertinente. Sul posto confronta questi riferimenti con le condizioni effettivamente osservate.

## Una scheda invernale, non un accesso estivo
La scheda associata Lac de Joux riguarda una pratica invernale sul lago ghiacciato. Non fornisce un accesso nautico per l’estate. Il vento misurato, la foto di copertina o una previsione di freddo non confermano né la tenuta del ghiaccio né l’apertura del lago. Prima di un progetto invernale consulta il bollettino di Vallée de Joux Tourisme e gli avvisi locali del giorno, poi rispetta delimitazioni e chiusure.

## Verificare il settore prima di partire
Per l’estate le pagine turistiche presentano offerta nautica e spiagge; verifica i dettagli presso gli operatori. Consulta anche fonti di navigazione, mappe dei settori protetti e segnaletica. Un luogo citato nella guida non costituisce un’autorizzazione a praticare ogni attività.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Joux?",
          answer:
            "La stazione MeteoSwiss di Les Charbonnières mostra la misura disponibile con fonte e ora. È sulla terraferma vicino al Brenet e fornisce contesto regionale, non una misura sul lago di Joux.",
        },
        {
          question: "A quale luogo corrisponde la previsione della guida?",
          answer:
            "La tabella è calcolata alle coordinate di Les Charbonnières. Non rappresenta tutte le spiagge del lago di Joux né un punto di misura a Le Brassus.",
        },
        {
          question: "La scheda spot associata è un accesso per l’estate?",
          answer:
            "La scheda Lac de Joux riguarda una pratica invernale sul lago ghiacciato. Per l’estate consulta le informazioni su spiagge e attività nautiche e le indicazioni del settore scelto.",
        },
        {
          question: "Come sapere se il lago ghiacciato è aperto?",
          answer:
            "Consulta lo stato del lago pubblicato da Vallée de Joux Tourisme e gli avvisi locali aggiornati. Una misura del vento, un’immagine o una previsione di temperatura non confermano apertura o tenuta del ghiaccio.",
        },
      ],
    },
  },
};
