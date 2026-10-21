import type { LocalGuide } from "../local-guides";

export const LAC_DE_SILS_GUIDE: LocalGuide = {
  slug: "lac-de-sils",
  region: "Engadin · Bregaglia · Graubünden / Grisons",
  aliases: [
    "Sils",
    "Silsersee",
    "Silser See",
    "Lac de Sils",
    "Lago di Sils",
    "Lake Sils",
    "Lej da Segl",
    "Sils Maria",
    "Segl-Maria",
    "Sils Baselgia",
    "Maloja",
    "Malojawind",
    "Plaun da Lej",
    "Isola",
  ],
  coordinates: { lat: 46.431613689065315, lng: 9.76190553730818 },
  forecastPlace: "Sils / Segl-Maria",
  coverImage: "/images/guides/sils.jpg",
  coverCredit: {
    author: "Ziegenberg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Maloja_mit_Silsersee_und_Maloja_Palace.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:41:02Z",
  updatedAt: "2026-10-21T13:41:02Z",
  stations: [
    {
      id: "SIA",
      name: "Segl-Maria",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Sils / Segl-Maria, entre les lacs de Sils et Silvaplana ; pas une mesure sur le Silsersee ni à Maloja.",
        de: "Landstation in Sils / Segl-Maria zwischen Silsersee und Silvaplanersee; keine Messung auf dem Silsersee oder in Maloja.",
        it: "Stazione terrestre a Sils / Segl-Maria tra i laghi di Sils e Silvaplana; non misura sul Silsersee né a Maloja.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Bregaglia Engadin Turismo — Voile et windsurf sur le lac de Sils",
      url: "https://www.bregagliatourism.ch/de/sport-acquatici-sul-lago-di-sils",
    },
    {
      label: "Sils Tourismus — Wassersport",
      url: "https://www.sils.ch/de/guide/aktivitaeten/wassersport",
    },
    {
      label:
        "Sils Tourismus — Windsurfing Station Sils, sur le lac de Silvaplana",
      url: "https://www.sils.ch/de/guide/aktivitaeten/sport-dienstleister/windsurfing-silvaplana-station-sils",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Sils : balise, prévisions et repères vers Maloja",
      description:
        "Préparez une sortie au Silsersee : vent observé à Segl-Maria, prévisions à Sils, webcams et repères de voile et windsurf entre Sils et Maloja.",
      place: "Lac de Sils / Silsersee",
      coverAlt:
        "Maloja et le lac de Sils vus depuis la Torre Belvedere, avec le Maloja Palace au centre et les montagnes en arrière-plan",
      content: `## Le Silsersee, entre Sils et Maloja
Le lac de Sils, Silsersee en allemand, Lago di Sils en italien et Lej da Segl en romanche, est un lac distinct de celui de Silvaplana. Ce guide donne des repères pour Sils, Maloja et le secteur de Plaun da Lej. Avant de choisir une webcam ou un prestataire, vérifiez de quel lac il s’agit : un nom de village ne suffit pas toujours à identifier la rive concernée.

## Segl-Maria mesure au village
La balise MeteoSwiss SIA se trouve à terre à Sils / Segl-Maria, entre les deux lacs. Elle apporte une observation locale avec sa direction, ses rafales et son heure. Elle ne mesure pas au milieu du Silsersee ni à Maloja. Consultez l’historique et comparez les observations à des horaires proches pour comprendre une évolution plutôt que déduire le vent de toute la vallée d’une valeur isolée.

## Prévision à Sils et vent du Maloja
Le tableau est calculé aux coordonnées terrestres de Segl-Maria. Le vent du Maloja est un repère connu pour la pratique dans l’Engadine ; sa présence et son intensité se vérifient le jour de la sortie. La prévision à Sils n’est ni une mesure à Plaun da Lej ni une garantie d’horaire ou de force sur le lac. Vérifiez aussi les rafales et les changements annoncés.

## Voile, windsurf et noms d’écoles
Bregaglia Engadin Turismo présente une offre de voile et de windsurf sur le lac de Sils. En revanche, la « Windsurfing Station Sils » décrite par Sils Tourismus est sur la rive du lac de Silvaplana. Pour ce secteur et sa fiche de spot, ouvrez le [guide de Silvaplana](/fr/vent-en-direct/lac-de-silvaplana). Vérifiez directement le rendez-vous, l’activité et la saison auprès du prestataire choisi.

## Webcam et choix de la rive
Cherchez une vue tournée vers le Silsersee et contrôlez la date de l’image. Une vue de Silvaplana ou d’un sommet voisin ne décrit pas votre mise à l’eau. Consultez les informations locales sur les activités et les accès, puis la signalisation sur place ; une photo du lac ne confirme pas les conditions du moment ni l’ouverture d’un service.`,
      faq: [
        {
          question: "Le lac de Sils est-il le lac de Silvaplana ?",
          answer:
            "Ce sont deux lacs distincts. Silsersee, Lago di Sils et Lej da Segl désignent le lac de Sils. Le guide de Silvaplana traite le lac voisin et sa fiche de spot.",
        },
        {
          question: "Où la balise Segl-Maria mesure-t-elle le vent ?",
          answer:
            "La station SIA mesure à terre à Sils / Segl-Maria, entre les lacs. Elle ne mesure pas sur le Silsersee ni à Maloja ; son observation est présentée avec son heure et sa source.",
        },
        {
          question: "La prévision garantit-elle le vent du Maloja ?",
          answer:
            "La table est une prévision au point terrestre de Segl-Maria. Elle ne garantit ni l’heure d’établissement ni la force du vent sur toutes les rives. Complétez-la par les observations et les conditions locales.",
        },
        {
          question: "La Windsurfing Station Sils est-elle sur le lac de Sils ?",
          answer:
            "La station-école décrite par Sils Tourismus se trouve du côté de Sils sur le lac de Silvaplana. Vérifiez le lac et le lieu précis du rendez-vous avant de réserver ou de vous déplacer.",
        },
      ],
    },
    de: {
      title:
        "Wind am Silsersee: Messstation, Prognose und Orientierung bei Maloja",
      description:
        "Plane deine Tour am Silsersee: Windmessung in Segl-Maria, Prognose für Sils, Webcams und Hinweise zum Segeln und Windsurfen zwischen Sils und Maloja.",
      place: "Silsersee / Sils",
      coverAlt:
        "Maloja und Silsersee von der Torre Belvedere aus mit dem Maloja Palace in der Mitte und Bergen im Hintergrund",
      content: `## Der Silsersee zwischen Sils und Maloja
Der Silsersee heisst auf Französisch Lac de Sils, auf Italienisch Lago di Sils und auf Rätoromanisch Lej da Segl. Er ist ein anderer See als der Silvaplanersee. Dieser Guide bietet Orientierung für Sils, Maloja und Plaun da Lej. Prüfe vor der Wahl einer Webcam oder eines Anbieters das betreffende Gewässer: Ein Ortsname allein bezeichnet nicht immer das richtige Ufer.

## Segl-Maria misst im Dorf
Die MeteoSwiss-Station SIA liegt an Land in Sils / Segl-Maria zwischen den beiden Seen. Sie liefert eine lokale Beobachtung mit Richtung, Böen und Zeitpunkt. Sie misst weder mitten auf dem Silsersee noch in Maloja. Prüfe Verläufe und vergleiche zeitnahe Beobachtungen, statt aus einem Einzelwert den Wind im gesamten Tal abzuleiten.

## Prognose Sils und Malojawind
Die Tabelle wird für die Landkoordinaten von Segl-Maria berechnet. Der Malojawind ist ein bekannter Bezugspunkt für Wassersport im Engadin; sein Auftreten und seine Stärke sind am Ausflugstag zu prüfen. Die Prognose für Sils ist weder eine Messung in Plaun da Lej noch eine Zusage für Uhrzeit oder Windstärke auf dem See. Beachte auch Böen und angekündigte Änderungen.

## Segeln, Windsurfen und Namen von Schulen
Bregaglia Engadin Turismo stellt Segel- und Windsurfangebote auf dem Silsersee vor. Die von Sils Tourismus beschriebene «Windsurfing Station Sils» liegt hingegen am Silvaplanersee. Für diesen Abschnitt und seine Spot-Seite öffne den [Silvaplana-Guide](/de/vent-en-direct/lac-de-silvaplana). Kläre Treffpunkt, Sportart und Saison direkt beim gewählten Anbieter.

## Webcam und Uferwahl
Suche einen Blick auf den Silsersee und prüfe den Bildzeitpunkt. Eine Ansicht von Silvaplana oder einem nahen Gipfel beschreibt nicht deinen Einstieg. Konsultiere örtliche Informationen zu Aktivitäten und Zugängen sowie die Beschilderung vor Ort; ein Seefoto bestätigt weder aktuelle Bedingungen noch die Öffnung eines Angebots.`,
      faq: [
        {
          question: "Sind Silsersee und Silvaplanersee derselbe See?",
          answer:
            "Es sind zwei unterschiedliche Seen. Lac de Sils, Lago di Sils und Lej da Segl bezeichnen den Silsersee. Der Silvaplana-Guide behandelt den Nachbarsee und seine Spot-Seite.",
        },
        {
          question: "Wo misst die Station Segl-Maria?",
          answer:
            "SIA misst an Land in Sils / Segl-Maria zwischen den Seen. Sie misst weder auf dem Silsersee noch in Maloja; die Beobachtung wird mit Zeitpunkt und Quelle angezeigt.",
        },
        {
          question: "Garantiert die Prognose den Malojawind?",
          answer:
            "Die Tabelle ist eine Prognose für den Landpunkt Segl-Maria. Sie garantiert weder Einsetzen noch Stärke des Windes an allen Ufern. Ergänze sie durch Beobachtungen und örtliche Bedingungen.",
        },
        {
          question: "Liegt die Windsurfing Station Sils am Silsersee?",
          answer:
            "Die von Sils Tourismus beschriebene Schulstation liegt auf der Silser Seite des Silvaplanersees. Prüfe See und genauen Treffpunkt vor einer Buchung oder Anreise.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Sils: stazione, previsioni e riferimenti verso Maloja",
      description:
        "Prepara un’uscita sul Silsersee: vento osservato a Segl-Maria, previsioni a Sils, webcam e riferimenti per vela e windsurf tra Sils e Maloja.",
      place: "Lago di Sils / Silsersee",
      coverAlt:
        "Maloja e lago di Sils visti dalla Torre Belvedere, con il Maloja Palace al centro e le montagne sullo sfondo",
      content: `## Il lago di Sils tra Sils e Maloja
Il lago di Sils, Silsersee in tedesco, Lac de Sils in francese e Lej da Segl in romancio, è distinto dal lago di Silvaplana. Questa guida offre riferimenti per Sils, Maloja e il settore di Plaun da Lej. Prima di scegliere una webcam o un operatore verifica il lago interessato: il nome di un villaggio non identifica sempre la riva corretta.

## Segl-Maria misura nel villaggio
La stazione MeteoSwiss SIA si trova sulla terraferma a Sils / Segl-Maria, fra i due laghi. Offre un’osservazione locale con direzione, raffiche e ora. Non misura al centro del Silsersee né a Maloja. Consulta lo storico e confronta osservazioni a orari vicini per capire un’evoluzione, senza dedurre il vento di tutta la valle da un valore isolato.

## Previsioni a Sils e vento del Maloja
La tabella è calcolata alle coordinate terrestri di Segl-Maria. Il vento del Maloja è un riferimento noto per gli sport nell’Engadina; presenza e intensità vanno verificate il giorno dell’uscita. La previsione a Sils non è una misura a Plaun da Lej né una garanzia di orario o forza sul lago. Controlla anche raffiche e cambiamenti previsti.

## Vela, windsurf e nomi delle scuole
Bregaglia Engadin Turismo presenta un’offerta di vela e windsurf sul lago di Sils. La «Windsurfing Station Sils» descritta da Sils Turismo si trova invece sulla riva del lago di Silvaplana. Per quel settore e la sua scheda spot apri la [guida di Silvaplana](/it/vent-en-direct/lac-de-silvaplana). Verifica direttamente ritrovo, attività e stagione con l’operatore scelto.

## Webcam e scelta della riva
Cerca una vista orientata verso il Silsersee e controlla la data dell’immagine. Una vista di Silvaplana o di una cima vicina non descrive il tuo ingresso in acqua. Consulta le informazioni locali su attività e accessi e la segnaletica sul posto; una foto del lago non conferma condizioni attuali o apertura di un servizio.`,
      faq: [
        {
          question: "Il lago di Sils è il lago di Silvaplana?",
          answer:
            "Sono due laghi distinti. Silsersee, Lac de Sils e Lej da Segl indicano il lago di Sils. La guida di Silvaplana tratta il lago vicino e la sua scheda spot.",
        },
        {
          question: "Dove misura il vento la stazione Segl-Maria?",
          answer:
            "La stazione SIA misura sulla terraferma a Sils / Segl-Maria, fra i laghi. Non misura sul Silsersee né a Maloja; l’osservazione è mostrata con ora e fonte.",
        },
        {
          question: "La previsione garantisce il vento del Maloja?",
          answer:
            "La tabella è una previsione nel punto terrestre di Segl-Maria. Non garantisce orario di inizio o forza su tutte le rive. Completala con osservazioni e condizioni locali.",
        },
        {
          question: "La Windsurfing Station Sils è sul lago di Sils?",
          answer:
            "La scuola descritta da Sils Turismo si trova sul lato di Sils del lago di Silvaplana. Verifica lago e punto preciso del ritrovo prima di prenotare o spostarti.",
        },
      ],
    },
  },
};
