import type { LocalGuide } from "../local-guides";

export const LAC_DE_SARNEN_GUIDE: LocalGuide = {
  slug: "lac-de-sarnen",
  region: "Obwalden · Sarnen · Sachseln · Giswil",
  aliases: [
    "Sarnen",
    "Sarnersee",
    "Sarner See",
    "Lac de Sarnen",
    "Lago di Sarnen",
    "Lake Sarnen",
    "Sachseln",
    "Giswil",
    "Wilen",
    "Sarneraatal",
  ],
  coordinates: { lat: 46.84944835131759, lng: 8.190226030666828 },
  forecastPlace: "Giswil",
  coverImage: "/images/guides/sarnen.jpg",
  coverCredit: {
    author: "Carsten Steger",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_image_of_Lake_Sarnen_(view_from_the_southwest).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T14:17:46Z",
  updatedAt: "2026-10-21T14:17:46Z",
  stations: [
    {
      id: "GIH",
      name: "Giswil",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre dans la plaine de Giswil, au sud du Sarnersee ; pas une mesure sur l’eau ni au centre de Sarnen.",
        de: "Landstation in der Ebene von Giswil südlich des Sarnersees; keine Messung auf dem Wasser oder im Zentrum von Sarnen.",
        it: "Stazione terrestre nella pianura di Giswil, a sud del Sarnersee; non misura sull’acqua né nel centro di Sarnen.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Obwalden Tourismus — Activités sur l’eau",
      url: "https://www.obwalden-tourismus.ch/de/aktivitaeten/sommer/wasseraktivitaeten/",
    },
    {
      label: "MS Seestern — Fahrplan",
      url: "https://ms-seestern.ch/fahrplan/",
    },
    {
      label: "Kanton Obwalden — FAQ sur le lac et la prise d’eau de Sachseln",
      url: "https://hochwasserschutz.ow.ch/projekte/faq/",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Sarnen : balise de Giswil, prévisions et webcams",
      description:
        "Préparez une sortie au Sarnersee : observations à Giswil, prévisions locales, webcams et repères pour Sarnen, Sachseln, Wilen et les accès au lac.",
      place: "Lac de Sarnen / Sarnersee",
      coverAlt:
        "Vue aérienne du lac de Sarnen depuis le sud-ouest, avec les villages et les reliefs de la vallée",
      content: `## Choisir sa rive entre Sarnen et Giswil
Le lac de Sarnen, Sarnersee en allemand, se trouve dans le canton d’Obwald. Situez votre sortie entre Sarnen, Sachseln, Wilen et le secteur de Giswil au sud. Les pages d’Obwalden Tourismus présentent plusieurs accès de baignade et des activités autour du lac. Repérez le lieu exact avant de choisir une image ou un point de comparaison météo.

## Giswil fournit une mesure terrestre
La balise MeteoSwiss GIH se trouve dans la plaine de Giswil, au sud du lac. Elle ne mesure pas sur l’eau ni au centre de Sarnen. Sa direction, ses rafales et son historique aident à suivre le contexte local. Consultez l’heure de chaque observation, puis comparez-la à une vue datée et aux conditions de votre rive, sans étendre automatiquement un relevé de Giswil à Sachseln ou Wilen.

## Une prévision au point de Giswil
Le tableau est calculé aux coordonnées terrestres de la station de Giswil. Il montre une évolution prévue, séparée de la mesure observée, et ne constitue pas une moyenne du Sarnersee. Comparez les créneaux avant de décider du programme de la journée ; les observations et la prévision ne confirment pas l’ouverture d’une plage ou d’un service.

## Navigation et activités : identifier le bon lac
Le MS Seestern propose des trajets sur le Sarnersee ; vérifiez directement le programme et les disponibilités. La Surfstation Alpnach mentionnée dans les pages régionales se situe sur l’Alpnachersee, un bras du lac des Quatre-Cantons. Consultez le [guide des Quatre-Cantons](/fr/vent-en-direct/lac-des-quatre-cantons) pour cette autre destination. Les offres des deux lacs ne désignent pas les mêmes lieux de pratique.

## Webcam et signalisation à Sachseln
Choisissez une webcam orientée vers le Sarnersee et vérifiez l’heure ainsi que le secteur visible. La FAQ cantonale indique une zone interdite aux activités nautiques autour de la prise d’eau à Sachseln. Consultez les panneaux et les avis locaux avant de retenir un accès.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac de Sarnen ?",
          answer:
            "La balise Giswil affiche l’observation MeteoSwiss disponible avec son heure et sa source. Elle mesure à terre au sud du lac, pas au centre de Sarnen.",
        },
        {
          question: "À quel lieu correspond la prévision du Sarnersee ?",
          answer:
            "Le point de calcul est Giswil, aux coordonnées terrestres indiquées sous les observations. Il ne représente pas toutes les rives ni une moyenne du lac.",
        },
        {
          question:
            "La Surfstation Alpnach se trouve-t-elle au lac de Sarnen ?",
          answer:
            "Elle se situe sur l’Alpnachersee, qui appartient au lac des Quatre-Cantons. Vérifiez le lac et le rendez-vous auprès de l’opérateur avant de vous déplacer.",
        },
        {
          question: "Où vérifier les accès près de Sachseln ?",
          answer:
            "Consultez la FAQ cantonale et les panneaux de la prise d’eau à Sachseln, ainsi que les avis locaux.",
        },
      ],
    },
    de: {
      title: "Wind am Sarnersee: Messstation Giswil, Prognose und Webcams",
      description:
        "Plane deine Tour am Sarnersee: Beobachtungen in Giswil, lokale Prognose, Webcams und Orientierung für Sarnen, Sachseln, Wilen und Seezugänge.",
      place: "Sarnersee / Sarnen",
      coverAlt:
        "Luftaufnahme des Sarnersees von Südwesten mit Dörfern und den Berghängen des Tals",
      content: `## Das Ufer zwischen Sarnen und Giswil wählen
Der Sarnersee liegt im Kanton Obwalden. Verorte deine Tour zwischen Sarnen, Sachseln, Wilen und dem südlichen Abschnitt bei Giswil. Obwalden Tourismus stellt mehrere Badezugänge und Aktivitäten rund um den See vor. Bestimme den genauen Ort vor der Wahl eines Bilds oder eines Wettervergleichspunkts.

## Giswil liefert eine Landmessung
Die MeteoSwiss-Station GIH steht in der Ebene von Giswil südlich des Sees. Sie misst weder auf dem Wasser noch im Zentrum von Sarnen. Richtung, Böen und Verlauf helfen beim Einordnen des örtlichen Kontexts. Prüfe den Messzeitpunkt und vergleiche mit einem datierten Bild sowie den Bedingungen an deinem Ufer, ohne einen Wert aus Giswil automatisch auf Sachseln oder Wilen zu übertragen.

## Prognose für den Punkt Giswil
Die Tabelle wird für die Landkoordinaten der Station Giswil berechnet. Sie zeigt die erwartete Entwicklung getrennt von der Beobachtung und ist kein Mittelwert des Sarnersees. Vergleiche die Zeitfenster vor der Tagesplanung; weder Messungen noch Prognose bestätigen die Öffnung eines Strands oder Angebots.

## Schifffahrt und Aktivitäten dem richtigen See zuordnen
Die MS Seestern bietet Fahrten auf dem Sarnersee an; prüfe Programm und Verfügbarkeit direkt beim Betreiber. Die auf regionalen Seiten genannte Surfstation Alpnach liegt am Alpnachersee, einem Arm des Vierwaldstättersees. Nutze für dieses andere Ziel den [Vierwaldstättersee-Guide](/de/vent-en-direct/lac-des-quatre-cantons). Angebote an beiden Seen bezeichnen nicht dieselben Sportorte.

## Webcam und Beschilderung bei Sachseln
Wähle eine Webcam mit Blick auf den Sarnersee und prüfe Zeitpunkt und sichtbaren Abschnitt. Die kantonalen FAQ nennen ein Wassersportverbot rund um das Einlaufbauwerk in Sachseln. Konsultiere Schilder und örtliche Mitteilungen vor der Wahl eines Zugangs.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Sarnersee?",
          answer:
            "Die Station Giswil zeigt die verfügbare MeteoSwiss-Beobachtung mit Zeitpunkt und Quelle. Sie misst an Land südlich des Sees, nicht im Zentrum von Sarnen.",
        },
        {
          question: "Für welchen Ort gilt die Sarnersee-Prognose?",
          answer:
            "Berechnungspunkt ist Giswil an den unter den Beobachtungen genannten Landkoordinaten. Er beschreibt weder alle Ufer noch einen Seemittelwert.",
        },
        {
          question: "Liegt die Surfstation Alpnach am Sarnersee?",
          answer:
            "Sie liegt am Alpnachersee, der zum Vierwaldstättersee gehört. Kläre See und Treffpunkt beim Anbieter vor der Anreise.",
        },
        {
          question: "Wo prüfe ich Zugänge bei Sachseln?",
          answer:
            "Konsultiere die kantonalen FAQ, die Schilder am Einlaufbauwerk in Sachseln und aktuelle örtliche Mitteilungen.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Sarnen: stazione di Giswil, previsioni e webcam",
      description:
        "Prepara l’uscita sul Sarnersee: osservazioni a Giswil, previsioni locali, webcam e riferimenti per Sarnen, Sachseln, Wilen e gli accessi al lago.",
      place: "Lago di Sarnen / Sarnersee",
      coverAlt:
        "Veduta aerea del lago di Sarnen da sud-ovest con i villaggi e i rilievi della valle",
      content: `## Scegliere la riva tra Sarnen e Giswil
Il lago di Sarnen, Sarnersee in tedesco, si trova nel Canton Obvaldo. Individua l’uscita tra Sarnen, Sachseln, Wilen e il settore di Giswil a sud. Obwalden Tourismus presenta diversi accessi di balneazione e attività intorno al lago. Identifica il luogo preciso prima di scegliere un’immagine o un punto di confronto meteo.

## Giswil offre una misura terrestre
La stazione MeteoSwiss GIH si trova nella pianura di Giswil, a sud del lago. Non misura sull’acqua né nel centro di Sarnen. Direzione, raffiche e storico aiutano a seguire il contesto locale. Consulta l’ora delle osservazioni e confrontale con una vista datata e le condizioni della tua riva, senza trasferire automaticamente un valore di Giswil a Sachseln o Wilen.

## Previsioni nel punto di Giswil
La tabella è calcolata alle coordinate terrestri della stazione di Giswil. Mostra un’evoluzione prevista, separata dalla misura osservata, e non costituisce una media del Sarnersee. Confronta le fasce orarie prima di decidere il programma; osservazioni e previsioni non confermano l’apertura di una spiaggia o di un servizio.

## Navigazione e attività: identificare il lago
La MS Seestern offre tragitti sul Sarnersee; verifica direttamente programma e disponibilità. La Surfstation Alpnach citata nelle pagine regionali si trova sull’Alpnachersee, un ramo del Lago dei Quattro Cantoni. Per quell’altra destinazione consulta la [guida dei Quattro Cantoni](/it/vent-en-direct/lac-des-quatre-cantons). Le offerte dei due laghi non indicano gli stessi luoghi di pratica.

## Webcam e segnaletica a Sachseln
Scegli una webcam orientata verso il Sarnersee e controlla orario e settore visibile. Le FAQ cantonali indicano una zona vietata alle attività nautiche intorno alla presa d’acqua a Sachseln. Consulta cartelli e avvisi locali prima di scegliere un accesso.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Sarnen?",
          answer:
            "La stazione Giswil mostra l’osservazione MeteoSwiss disponibile con ora e fonte. Misura sulla terraferma a sud del lago, non nel centro di Sarnen.",
        },
        {
          question: "A quale luogo corrisponde la previsione del Sarnersee?",
          answer:
            "Il punto di calcolo è Giswil, alle coordinate terrestri indicate sotto le osservazioni. Non rappresenta tutte le rive né una media del lago.",
        },
        {
          question: "La Surfstation Alpnach è sul lago di Sarnen?",
          answer:
            "Si trova sull’Alpnachersee, che appartiene al Lago dei Quattro Cantoni. Verifica lago e ritrovo con l’operatore prima di partire.",
        },
        {
          question: "Dove verificare gli accessi presso Sachseln?",
          answer:
            "Consulta le FAQ cantonali, i cartelli della presa d’acqua a Sachseln e gli avvisi locali aggiornati.",
        },
      ],
    },
  },
};
