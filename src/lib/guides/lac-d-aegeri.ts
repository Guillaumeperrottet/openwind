import type { LocalGuide } from "../local-guides";

export const LAC_D_AEGERI_GUIDE: LocalGuide = {
  slug: "lac-d-aegeri",
  region: "Zug · Ägerital · Morgarten",
  aliases: [
    "Ägeri",
    "Aegeri",
    "Ägerisee",
    "Aegerisee",
    "Lac d’Ägeri",
    "Lac d'Aegeri",
    "Lago di Ägeri",
    "Lago di Aegeri",
    "Lake Aegeri",
    "Oberägeri",
    "Oberaegeri",
    "Unterägeri",
    "Unteraegeri",
    "Morgarten",
  ],
  coordinates: { lat: 47.13363547475298, lng: 8.608204894918675 },
  forecastPlace: "Oberägeri",
  coverImage: "/images/guides/aegeri.jpg",
  coverCredit: {
    author: "Pakeha",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Morgarten_am_%C3%84gerisee_02.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T14:17:46Z",
  updatedAt: "2026-10-21T14:17:46Z",
  stations: [
    {
      id: "AEG",
      name: "Oberägeri",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Oberägeri, près de la partie nord du lac ; pas une mesure sur l’eau ni à Morgarten.",
        de: "Landstation in Oberägeri beim nördlichen Seeabschnitt; keine Messung auf dem Wasser oder in Morgarten.",
        it: "Stazione terrestre a Oberägeri, presso il settore nord del lago; non misura sull’acqua né a Morgarten.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Zug Tourismus — CHUCKSURF Windsurfschule Ägerisee",
      url: "https://www.zug-tourismus.ch/de/poi/kurs-seminaranbieter/chucksurf-windsurfschule-aegerisee/",
    },
    {
      label: "Kanton Zug — Drachensegeln, BGS 753.5",
      url: "https://bgs.zg.ch/app/de/texts_of_law/753.5",
    },
    {
      label: "Kanton Zug — Flachwassersperrzonen, Mitteilung 2024",
      url: "https://zg.ch/de/news/2024/May/neue-flachwassersperrzonen-auf-dem-aegeri-und-zugersee",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac d’Ägeri : balise, prévisions et windsurf à Oberägeri",
      description:
        "Consultez le vent mesuré à Oberägeri, les prévisions et les webcams autour de l’Ägerisee. Repères pour Unterägeri, Morgarten et les accès nautiques.",
      place: "Lac d’Ägeri / Ägerisee",
      coverAlt:
        "Le lac d’Ägeri vu depuis Morgarten vers Oberägeri, avec des prairies et des arbres au premier plan",
      content: `## Oberägeri, Unterägeri ou Morgarten
Le lac d’Ägeri se situe dans le canton de Zoug. Les noms Ägerisee et Aegerisee désignent le même lac ; les différentes écritures servent aussi à le retrouver dans la recherche. Avant de préparer une sortie, situez la rive d’Oberägeri, le secteur d’Unterägeri ou Morgarten. Une vue sur le lac depuis les collines ne montre pas nécessairement les conditions devant votre départ.

## Une observation terrestre à Oberägeri
La station MeteoSwiss AEG mesure à terre près de la partie nord du lac. La direction, les rafales et l’historique décrivent cet emplacement ; ils ne constituent pas une mesure sur l’eau ni à Morgarten. Comparez des horaires proches et vérifiez si le vent se renforce ou change de direction avant de rapprocher la balise d’une webcam.

## Prévision locale et comparaison avec Zoug
Le tableau est calculé aux coordonnées d’Oberägeri, au point terrestre de la station. Il présente une prévision de modèle séparée de la mesure observée. Pour comparer une autre destination, le [guide du lac de Zoug](/fr/vent-en-direct/lac-de-zoug) utilise Cham comme repère. Les deux lacs ont leurs propres rives et points de calcul ; la valeur de l’un ne se transpose pas à l’autre.

## Windsurf et organisation d’une sortie
Zoug Tourisme référence l’école CHUCKSURF sur l’Ägerisee. Vérifiez le lieu exact du cours, la saison, les disponibilités et les modalités de location auprès du prestataire. La présence d’une école ne transforme pas toutes les plages en accès pour toutes les activités. Pour une webcam, privilégiez une vue sur votre secteur et contrôlez la date de l’image.

## Navigation et zones de faible profondeur
Consultez le règlement cantonal sur le kite et les informations sur les secteurs protégés. La communication cantonale de 2024 décrit des protections de zones peu profondes sur les lacs de Zoug et d’Ägeri. Identifiez le lac et le secteur concernés, puis vérifiez les panneaux et les avis actuels avant votre départ.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac d’Ägeri ?",
          answer:
            "La balise Oberägeri présente l’observation MeteoSwiss disponible, avec son heure et sa source. Son emplacement est terrestre, près de la partie nord du lac.",
        },
        {
          question: "La prévision concerne-t-elle Morgarten ?",
          answer:
            "Le point de calcul est Oberägeri, aux coordonnées terrestres affichées dans le guide. Il ne représente pas toutes les rives de l’Ägerisee ni une prévision spécifique à Morgarten.",
        },
        {
          question: "Ägerisee et Aegerisee désignent-ils le même lac ?",
          answer:
            "Oui. Aegerisee est une écriture sans tréma du nom Ägerisee. Le lac d’Ägeri et le lac de Zoug restent deux lacs distincts, avec des guides et des observations séparés.",
        },
        {
          question: "Où trouver des cours de windsurf et les règles d’accès ?",
          answer:
            "Zoug Tourisme référence CHUCKSURF pour le windsurf. Consultez directement l’opérateur pour les cours, puis les sources cantonales et la signalisation pour les accès et zones protégées.",
        },
      ],
    },
    de: {
      title:
        "Wind am Ägerisee: Messstation, Prognose und Windsurfen in Oberägeri",
      description:
        "Windmessung in Oberägeri, Prognose und Webcams rund um den Ägerisee. Orientierung für Unterägeri, Morgarten und die örtlichen Wassersportzugänge.",
      place: "Ägerisee / Oberägeri",
      coverAlt:
        "Ägerisee von Morgarten in Richtung Oberägeri mit Wiesen und Bäumen im Vordergrund",
      content: `## Oberägeri, Unterägeri oder Morgarten
Der Ägerisee liegt im Kanton Zug. Ägerisee und Aegerisee bezeichnen dasselbe Gewässer; beide Schreibweisen helfen auch bei der Suche. Verorte vor einer Tour das Ufer bei Oberägeri, Unterägeri oder Morgarten. Ein Blick von den Hügeln auf den See zeigt nicht unbedingt die Bedingungen vor deinem Ausgangspunkt.

## Eine Landbeobachtung in Oberägeri
Die MeteoSwiss-Station AEG misst an Land beim nördlichen Seeabschnitt. Richtung, Böen und Verlauf beschreiben diesen Standort, keine Messung auf dem Wasser oder in Morgarten. Vergleiche zeitnahe Daten und prüfe, ob der Wind zunimmt oder die Richtung ändert, bevor du Station und Webcam gegenüberstellst.

## Lokale Prognose und Vergleich mit Zug
Die Tabelle wird für die Koordinaten von Oberägeri am Landstandort der Station berechnet. Sie zeigt eine Modellprognose getrennt vom beobachteten Messwert. Zum Vergleich eines anderen Ziels nutzt der [Zugersee-Guide](/de/vent-en-direct/lac-de-zoug) Cham als Bezugspunkt. Beide Seen haben eigene Ufer und Berechnungspunkte; ein Wert lässt sich nicht auf den anderen See übertragen.

## Windsurfen und eine Tour organisieren
Zug Tourismus nennt die Schule CHUCKSURF am Ägerisee. Kläre genauen Kursort, Saison, Verfügbarkeit und Mietbedingungen beim Anbieter. Eine Schule macht nicht jeden Strand zum Zugang für jede Sportart. Wähle für eine Webcam eine Ansicht deines Abschnitts und prüfe den Bildzeitpunkt.

## Schifffahrt und Flachwasserbereiche
Konsultiere die kantonale Kitesurfverordnung und Hinweise zu Schutzbereichen. Die kantonale Mitteilung von 2024 beschreibt Flachwasserschutz am Zuger- und Ägerisee. Ordne die Angaben dem richtigen Seeabschnitt zu und prüfe vor der Abfahrt örtliche Schilder sowie aktuelle Mitteilungen.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Ägerisee?",
          answer:
            "Die Station Oberägeri zeigt die verfügbare MeteoSwiss-Beobachtung mit Zeitpunkt und Quelle. Sie steht an Land beim nördlichen Seeabschnitt.",
        },
        {
          question: "Gilt die Prognose für Morgarten?",
          answer:
            "Berechnungspunkt ist Oberägeri an den im Guide genannten Landkoordinaten. Er beschreibt nicht jedes Ufer und ist keine eigene Prognose für Morgarten.",
        },
        {
          question: "Sind Ägerisee und Aegerisee derselbe See?",
          answer:
            "Ja. Aegerisee ist eine Schreibweise ohne Umlaut. Ägerisee und Zugersee bleiben dagegen zwei unterschiedliche Seen mit eigenen Guides und Beobachtungen.",
        },
        {
          question: "Wo finde ich Windsurfkurse und Zugangsvorgaben?",
          answer:
            "Zug Tourismus nennt CHUCKSURF für Windsurfen. Kläre Kurse direkt beim Anbieter und prüfe kantonale Quellen sowie Beschilderung für Zugänge und Schutzbereiche.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Ägeri: stazione, previsioni e windsurf a Oberägeri",
      description:
        "Consulta il vento misurato a Oberägeri, previsioni e webcam dell’Ägerisee. Riferimenti per Unterägeri, Morgarten e gli accessi nautici locali.",
      place: "Lago di Ägeri / Ägerisee",
      coverAlt:
        "Lago di Ägeri visto da Morgarten verso Oberägeri con prati e alberi in primo piano",
      content: `## Oberägeri, Unterägeri o Morgarten
Il lago di Ägeri si trova nel Canton Zugo. Ägerisee e Aegerisee indicano lo stesso lago; entrambe le grafie aiutano anche nella ricerca. Prima dell’uscita individua la riva di Oberägeri, il settore di Unterägeri o Morgarten. Una vista dalle colline non mostra necessariamente le condizioni davanti al tuo punto di partenza.

## Un’osservazione terrestre a Oberägeri
La stazione MeteoSwiss AEG misura sulla terraferma presso il settore nord del lago. Direzione, raffiche e storico descrivono quel luogo; non sono una misura sull’acqua né a Morgarten. Confronta orari vicini e verifica se il vento aumenta o cambia direzione prima di accostare stazione e webcam.

## Previsioni locali e confronto con Zugo
La tabella è calcolata alle coordinate di Oberägeri nel punto terrestre della stazione. Mostra una previsione del modello distinta dalla misura osservata. Per confrontare un’altra destinazione, la [guida del lago di Zugo](/it/vent-en-direct/lac-de-zoug) usa Cham come riferimento. I due laghi hanno rive e punti di calcolo propri; il valore dell’uno non si trasferisce all’altro.

## Windsurf e organizzazione dell’uscita
Zugo Turismo elenca la scuola CHUCKSURF sull’Ägerisee. Verifica luogo preciso del corso, stagione, disponibilità e condizioni di noleggio presso l’operatore. La presenza di una scuola non trasforma ogni spiaggia in un accesso per qualsiasi attività. Per una webcam scegli una vista del tuo settore e controlla la data dell’immagine.

## Navigazione e zone di acqua bassa
Consulta il regolamento cantonale sul kite e le informazioni sui settori protetti. La comunicazione cantonale del 2024 descrive protezioni delle acque basse sui laghi di Zugo e Ägeri. Individua il lago e il settore corretti, poi verifica cartelli e avvisi attuali prima della partenza.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Ägeri?",
          answer:
            "La stazione Oberägeri presenta l’osservazione MeteoSwiss disponibile con ora e fonte. Si trova sulla terraferma presso la parte settentrionale del lago.",
        },
        {
          question: "La previsione riguarda Morgarten?",
          answer:
            "Il punto di calcolo è Oberägeri, alle coordinate terrestri mostrate nella guida. Non rappresenta tutte le rive dell’Ägerisee né una previsione specifica per Morgarten.",
        },
        {
          question: "Ägerisee e Aegerisee indicano lo stesso lago?",
          answer:
            "Sì. Aegerisee è una grafia senza dieresi di Ägerisee. I laghi di Ägeri e Zugo restano distinti, con guide e osservazioni separate.",
        },
        {
          question: "Dove trovare corsi di windsurf e regole di accesso?",
          answer:
            "Zugo Turismo elenca CHUCKSURF per il windsurf. Consulta direttamente l’operatore per i corsi e le fonti cantonali e la segnaletica per accessi e zone protette.",
        },
      ],
    },
  },
};
