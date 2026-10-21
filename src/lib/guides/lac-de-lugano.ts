import type { LocalGuide } from "../local-guides";

export const LAC_DE_LUGANO_GUIDE: LocalGuide = {
  slug: "lac-de-lugano",
  region: "Ticino · Lugano · Ceresio",
  aliases: [
    "Lugano",
    "Lac de Lugano",
    "Luganersee",
    "Lago di Lugano",
    "Ceresio",
    "Lake Lugano",
    "Morcote",
    "Paradiso",
    "Gandria",
    "Caslano",
  ],
  coordinates: { lat: 46.00423002878211, lng: 8.960513686418501 },
  forecastPlace: "Lugano",
  coverImage: "/images/guides/lugano.jpg",
  coverCredit: {
    author: "JoachimKohler-HB",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Morcote,_Lago_di_Lugano_%26_Brusino_Asizio_(2017).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:18:15Z",
  updatedAt: "2026-10-21T13:18:15Z",
  stations: [
    {
      id: "LUG",
      name: "Lugano",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Lugano, au-dessus du niveau du lac ; pas une mesure sur l’eau ni à Morcote.",
        de: "Landstation in Lugano oberhalb des Seespiegels; keine Messung auf dem Wasser oder in Morcote.",
        it: "Stazione terrestre a Lugano, sopra il livello del lago; non misura sull’acqua né a Morcote.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Lugano Region — Windsurf",
      url: "https://www.luganoregion.com/de/erleben/sport-und-natur/wassersport/windsurf",
    },
    {
      label: "Lugano Region — Territorio e attività",
      url: "https://www.luganoregion.com/it/",
    },
    {
      label: "Cantone Ticino — Navigazione e turisti",
      url: "https://www4.ti.ch/di/sc/navigazione/turisti",
    },
    {
      label: "Cantone Ticino — Regolamento della navigazione, 781.110",
      url: "https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/1481",
    },
  ],
  translations: {
    fr: {
      title:
        "Vent au lac de Lugano : balise, prévisions et repères sur le Ceresio",
      description:
        "Consultez le vent mesuré à Lugano, la prévision locale et les repères pour Morcote, Paradiso et Gandria. Sources nautiques et accès sur les rives suisses.",
      place: "Lac de Lugano / Ceresio",
      coverAlt:
        "Toits de Morcote et lac de Lugano face à Brusino Arsizio, entre les collines",
      content: `## Lugano, Morcote ou Gandria : choisir sa rive
Le lac de Lugano porte aussi le nom de Ceresio. Ce guide se concentre sur les repères des rives suisses, de Lugano et Paradiso à Morcote, Gandria ou Caslano. Avant de comparer le vent, situez votre départ et le bassin concerné : une vue depuis la promenade de Lugano ne décrit pas toutes les anses ni les secteurs situés de l’autre côté d’un relief.

## Une observation terrestre à Lugano
La balise MeteoSwiss LUG mesure à terre, au-dessus du niveau du lac. Elle donne un repère local avec sa direction, ses rafales et son heure de mise à jour. Elle ne se trouve pas sur l’eau et ne mesure pas à Morcote. Consultez son historique pour voir l’évolution, puis confrontez-le à une observation de votre secteur. Une mesure ancienne reste signalée comme telle.

## La prévision correspond à un point précis
Le tableau est calculé aux coordonnées de la station terrestre de Lugano. Il présente une prévision, distincte de l’observation. Utilisez-le pour comparer les créneaux et l’évolution attendue à ce point ; un changement prévu à Lugano ne décrit pas automatiquement les conditions de chaque bras du Ceresio.

## Webcam, activité et prestataire local
La carte des webcams permet de chercher une vue proche du départ. Regardez la date, l’orientation et la portion d’eau visible. Lugano Region référence une offre de windsurf et d’autres activités : vérifiez directement le lieu du rendez-vous, les disponibilités et les conditions avec l’opérateur. Ce guide ne transforme pas les promenades ou plages photographiées en spots de mise à l’eau.

## Un lac partagé avec l’Italie
Consultez les informations de navigation du Tessin et le règlement applicable à votre activité. Les indications suisses ne valent pas automatiquement pour une rive italienne. Vérifiez les zones de baignade, ports, voies de navigation et consignes locales avant de retenir un accès.`,
      faq: [
        {
          question: "Où consulter le vent en direct au lac de Lugano ?",
          answer:
            "La balise MeteoSwiss Lugano affiche la mesure disponible avec son heure et sa source. Son emplacement est terrestre ; complétez ce repère par les conditions près du départ.",
        },
        {
          question: "La balise Lugano mesure-t-elle à Morcote ?",
          answer:
            "Elle mesure à Lugano, à terre et au-dessus du niveau du lac. Morcote et les autres rives peuvent présenter une exposition différente.",
        },
        {
          question: "Ceresio et lac de Lugano désignent-ils le même lac ?",
          answer:
            "Oui. Ceresio, Lago di Lugano et Luganersee désignent le lac de Lugano. La prévision du guide reste limitée au point terrestre de Lugano affiché sous le tableau.",
        },
        {
          question: "Où vérifier les règles et l’offre de windsurf ?",
          answer:
            "Lugano Region présente l’offre locale de windsurf. Pour les règles, consultez les sources de navigation du Tessin et l’autorité du secteur concerné, notamment si votre parcours touche une rive italienne.",
        },
      ],
    },
    de: {
      title:
        "Wind am Luganersee: Messstation, Prognose und Orientierung am Ceresio",
      description:
        "Aktuelle Windmessung in Lugano, lokale Prognose und Orientierung für Morcote, Paradiso und Gandria. Wassersportquellen und Zugänge am Schweizer Ufer.",
      place: "Luganersee / Ceresio",
      coverAlt:
        "Dächer von Morcote und der Luganersee mit Blick nach Brusino Arsizio zwischen Hügeln",
      content: `## Lugano, Morcote oder Gandria: das Ufer wählen
Der Luganersee heisst auch Ceresio. Dieser Guide konzentriert sich auf Orientierung an den Schweizer Ufern, von Lugano und Paradiso bis Morcote, Gandria oder Caslano. Verorte vor dem Windvergleich deinen Ausgangspunkt und das betreffende Becken: Ein Blick von der Promenade in Lugano beschreibt nicht jede Bucht und keinen hinter einem Bergrücken liegenden Abschnitt.

## Eine Landmessung in Lugano
Die MeteoSwiss-Station LUG misst an Land oberhalb des Seespiegels. Sie liefert einen lokalen Vergleichspunkt mit Richtung, Böen und Aktualisierungszeit. Sie steht weder auf dem Wasser noch in Morcote. Prüfe ihren Verlauf und vergleiche ihn mit einer Beobachtung deines Abschnitts. Ältere Messungen bleiben entsprechend gekennzeichnet.

## Die Prognose gehört zu einem bestimmten Punkt
Die Tabelle wird für die Koordinaten der Landstation Lugano berechnet. Sie zeigt eine Prognose getrennt von der Beobachtung. Vergleiche Zeitfenster und die erwartete Entwicklung an diesem Punkt; eine vorhergesagte Änderung in Lugano beschreibt nicht automatisch alle Seearme des Ceresio.

## Webcam, Aktivität und örtlicher Anbieter
Suche auf der Webcam-Karte nach einem Blick nahe deinem Ausgangspunkt. Prüfe Datum, Ausrichtung und sichtbare Wasserfläche. Lugano Region nennt Windsurfangebote und weitere Aktivitäten. Kläre Treffpunkt, Verfügbarkeit und Bedingungen direkt beim Anbieter. Promenaden und abgebildete Strände werden dadurch nicht zu ausgewiesenen Einstiegsstellen.

## Ein See an der Grenze zu Italien
Konsultiere die Tessiner Schifffahrtsinformationen und die Vorschriften für deine Sportart. Schweizer Angaben gelten nicht automatisch für ein italienisches Ufer. Prüfe Badezonen, Häfen, Schifffahrtswege und örtliche Vorgaben, bevor du einen Zugang auswählst.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind für den Luganersee?",
          answer:
            "Die MeteoSwiss-Station Lugano zeigt die verfügbare Messung samt Zeitpunkt und Quelle. Ihr Standort liegt an Land; ergänze diesen Vergleichspunkt durch die Bedingungen nahe deinem Ausgangspunkt.",
        },
        {
          question: "Misst die Station Lugano in Morcote?",
          answer:
            "Sie misst in Lugano an Land oberhalb des Seespiegels. Morcote und andere Ufer können anders exponiert sein.",
        },
        {
          question: "Sind Ceresio und Luganersee derselbe See?",
          answer:
            "Ja. Ceresio, Lago di Lugano und Luganersee bezeichnen denselben See. Die Prognose dieses Guides bleibt auf den unter der Tabelle genannten Landpunkt Lugano bezogen.",
        },
        {
          question: "Wo prüfe ich Regeln und Windsurfangebote?",
          answer:
            "Lugano Region stellt örtliche Windsurfangebote vor. Prüfe für die Regeln die Tessiner Schifffahrtsquellen und die zuständige Behörde deines Abschnitts, besonders bei einem italienischen Ufer.",
        },
      ],
    },
    it: {
      title:
        "Vento sul Lago di Lugano: stazione, previsioni e guida al Ceresio",
      description:
        "Consulta il vento misurato a Lugano, le previsioni locali e i riferimenti per Morcote, Paradiso e Gandria. Fonti nautiche e accessi sulle rive svizzere.",
      place: "Lago di Lugano / Ceresio",
      coverAlt:
        "Tetti di Morcote e Lago di Lugano verso Brusino Arsizio tra le colline",
      content: `## Lugano, Morcote o Gandria: scegliere la riva
Il Lago di Lugano è chiamato anche Ceresio. Questa guida si concentra sui riferimenti delle rive svizzere, da Lugano e Paradiso a Morcote, Gandria o Caslano. Prima di confrontare il vento individua la partenza e il bacino: una vista dal lungolago di Lugano non descrive ogni insenatura né i settori oltre un rilievo.

## Un’osservazione terrestre a Lugano
La stazione MeteoSwiss LUG misura sulla terraferma, sopra il livello del lago. Offre un riferimento locale con direzione, raffiche e ora di aggiornamento. Non si trova sull’acqua e non misura a Morcote. Consulta lo storico per seguire l’evoluzione, poi confrontalo con un’osservazione del tuo settore. Una misura vecchia resta segnalata come tale.

## La previsione corrisponde a un punto preciso
La tabella è calcolata alle coordinate della stazione terrestre di Lugano. Presenta una previsione distinta dall’osservazione. Usala per confrontare le fasce orarie e l’evoluzione attesa in quel punto; un cambiamento previsto a Lugano non descrive automaticamente le condizioni di ogni ramo del Ceresio.

## Webcam, attività e operatore locale
La mappa delle webcam permette di cercare una vista vicina alla partenza. Controlla data, orientamento e porzione d’acqua visibile. Lugano Region elenca un’offerta di windsurf e altre attività: verifica direttamente punto di ritrovo, disponibilità e condizioni con l’operatore. Le passeggiate e le spiagge fotografate non diventano per questo punti di ingresso in acqua.

## Un lago condiviso con l’Italia
Consulta le informazioni di navigazione del Ticino e le disposizioni applicabili alla tua attività. Le indicazioni svizzere non valgono automaticamente per una riva italiana. Verifica zone di balneazione, porti, vie di navigazione e prescrizioni locali prima di scegliere un accesso.`,
      faq: [
        {
          question: "Dove consultare il vento in diretta sul Lago di Lugano?",
          answer:
            "La stazione MeteoSwiss Lugano mostra la misura disponibile con ora e fonte. È un punto terrestre; completa questo riferimento con le condizioni vicino alla partenza.",
        },
        {
          question: "La stazione Lugano misura a Morcote?",
          answer:
            "Misura a Lugano, sulla terraferma e sopra il livello del lago. Morcote e le altre rive possono avere un’esposizione diversa.",
        },
        {
          question: "Ceresio e Lago di Lugano sono lo stesso lago?",
          answer:
            "Sì. Ceresio, Lago di Lugano e Luganersee indicano lo stesso lago. La previsione della guida resta riferita al punto terrestre di Lugano indicato sotto la tabella.",
        },
        {
          question: "Dove verificare regole e offerta di windsurf?",
          answer:
            "Lugano Region presenta l’offerta locale di windsurf. Per le regole consulta le fonti di navigazione del Ticino e l’autorità del settore interessato, soprattutto se il percorso tocca una riva italiana.",
        },
      ],
    },
  },
};
