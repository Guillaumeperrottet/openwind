import type { LocalGuide } from "../local-guides";

export const SIHLSEE_GUIDE: LocalGuide = {
  slug: "sihlsee",
  region: "Schwyz · Einsiedeln · Ybrig",
  aliases: [
    "Sihlsee",
    "Lac de Sihl",
    "Lac de la Sihl",
    "Lago della Sihl",
    "Lago di Sihl",
    "Lake Sihl",
    "Einsiedeln",
    "Willerzell",
    "Euthal",
    "Steinbachviadukt",
    "Steinbach",
  ],
  coordinates: { lat: 47.13304097172493, lng: 8.756563044630788 },
  forecastPlace: "Einsiedeln",
  coverImage: "/images/guides/sihlsee.jpg",
  coverCredit: {
    author: "Jane kurko",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Sihlsee_lake_of_Switzerland.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T14:17:46Z",
  updatedAt: "2026-10-21T14:17:46Z",
  stations: [
    {
      id: "EIN",
      name: "Einsiedeln",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Einsiedeln, à l’ouest du Sihlsee ; pas une mesure sur l’eau ni à Willerzell ou Euthal.",
        de: "Landstation in Einsiedeln westlich des Sihlsees; keine Messung auf dem Wasser oder in Willerzell und Euthal.",
        it: "Stazione terrestre a Einsiedeln, a ovest del Sihlsee; non misura sull’acqua né a Willerzell o Euthal.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Einsiedeln-Ybrig-Zürichsee Tourismus — Activités sur l’eau",
      url: "https://www.eyz.swiss/de/auf-dem-wasser-unterwegs",
    },
    {
      label: "Einsiedeln-Ybrig-Zürichsee Tourismus — Surfen auf dem Sihlsee",
      url: "https://www.eyz.swiss/de/besuchen/natur/surfen-auf-dem-sihlsee",
    },
    {
      label:
        "Einsiedeln-Ybrig-Zürichsee Tourismus — Kitesurfen auf dem Sihlsee",
      url: "https://www.eyz.swiss/de/besuchen/natur/kitesurfen-auf-dem-sihlsee",
    },
    {
      label: "Kanton Schwyz — Kitesurf, SRSZ 784.331",
      url: "https://www.sz.ch/public/upload/assets/6402/784_331.pdf?fp=2",
    },
  ],
  translations: {
    fr: {
      title: "Vent au Sihlsee : balise, prévisions et repères à Einsiedeln",
      description:
        "Préparez votre sortie au Sihlsee : vent mesuré à Einsiedeln, prévisions locales, webcams et sources pour le surf, la voile et les secteurs de kite.",
      place: "Sihlsee / Lac de Sihl",
      coverAlt:
        "Le Sihlsee et ses rives avec des reliefs enneigés et leurs reflets dans l’eau",
      content: `## Willerzell, Euthal ou le nord du Sihlsee
Le Sihlsee est un lac de retenue près d’Einsiedeln, dans le canton de Schwyz. Repérez votre secteur avant de préparer une sortie : la baie de Willerzell, le sud vers Euthal et la partie nord ne correspondent pas au même point d’observation. Les viaducs constituent des repères pour lire la carte ; leur présence ne désigne pas une mise à l’eau.

## Une mesure terrestre à Einsiedeln
La balise MeteoSwiss EIN est située à terre à l’ouest du lac. Elle affiche une direction, des rafales et une heure d’observation propres à son emplacement. Elle ne mesure ni à Willerzell ni à Euthal. Comparez son historique avec une image datée de votre rive et les conditions sur place, sans transformer une valeur du village en mesure au milieu du lac.

## Prévision à Einsiedeln et évolution du vent
Le tableau utilise les coordonnées terrestres d’Einsiedeln. Il donne l’évolution prévue à ce point, distincte de l’observation. Les informations touristiques décrivent l’intérêt du vent venant de l’Ybrig pour les activités locales ; sa présence et sa force se vérifient le jour de la sortie. Un horaire habituel ne garantit pas un créneau sur votre rive.

## Surf, voile et secteurs de kite
L’office de tourisme référence le surf, la voile et le kite avec des informations propres à chaque activité. Pour le kite, consultez le règlement cantonal et les consignes d’accès : le secteur au sud du Steinbachviadukt est une zone d’exclusion. L’existence d’une activité dans le bassin voisin ne vaut pas autorisation à votre point de départ.

## Webcams et comparaison régionale
Cherchez une webcam tournée vers le bon bassin et vérifiez son horodatage. Pour comparer avec un autre lac de la région touristique, consultez le [guide du lac de Zurich](/fr/vent-en-direct/lac-de-zurich), qui utilise d’autres observations et un autre point de prévision. Vérifiez enfin le lieu de rendez-vous, la saison et les modalités auprès du prestataire choisi.`,
      faq: [
        {
          question: "Où voir le vent en direct au Sihlsee ?",
          answer:
            "La carte Einsiedeln affiche l’observation MeteoSwiss disponible avec son heure et sa source. La balise est terrestre, à l’ouest du lac ; elle ne mesure pas à Willerzell ou Euthal.",
        },
        {
          question: "La prévision correspond-elle au milieu du lac de Sihl ?",
          answer:
            "Le point de calcul est Einsiedeln, aux coordonnées terrestres indiquées sous les observations. Il ne représente pas la moyenne des différents bassins du Sihlsee.",
        },
        {
          question: "Le kite est-il possible sur tout le Sihlsee ?",
          answer:
            "Le règlement cantonal exclut le secteur au sud du Steinbachviadukt. Consultez le texte, les consignes locales et les accès de l’activité avant de choisir votre départ.",
        },
        {
          question: "Le vent venant de l’Ybrig est-il garanti ?",
          answer:
            "Il constitue un repère local décrit par les sources touristiques. Vérifiez les observations, la prévision et votre secteur le jour de la sortie ; l’heure et la force ne sont pas garanties.",
        },
      ],
    },
    de: {
      title:
        "Wind am Sihlsee: Messstation, Prognose und Orientierung bei Einsiedeln",
      description:
        "Plane deine Tour am Sihlsee: Windmessung in Einsiedeln, lokale Prognose, Webcams und Quellen zum Surfen, Segeln und zu Kitesurfbereichen.",
      place: "Sihlsee / Einsiedeln",
      coverAlt:
        "Sihlsee und seine Ufer mit schneebedeckten Bergen und deren Spiegelung im Wasser",
      content: `## Willerzell, Euthal oder der nördliche Sihlsee
Der Sihlsee ist ein Stausee bei Einsiedeln im Kanton Schwyz. Verorte vor einem Ausflug deinen Abschnitt: Die Bucht von Willerzell, der Süden bei Euthal und der nördliche Bereich gehören nicht zum selben Beobachtungspunkt. Die Viadukte helfen bei der Orientierung auf der Karte; sie kennzeichnen keinen Einstieg ins Wasser.

## Eine Landmessung in Einsiedeln
Die MeteoSwiss-Station EIN liegt an Land westlich des Sees. Richtung, Böen und Messzeitpunkt beziehen sich auf diesen Standort. Sie misst weder in Willerzell noch in Euthal. Vergleiche ihren Verlauf mit einem datierten Bild deines Ufers und den Bedingungen vor Ort, ohne einen Dorfwert als Messung in der Seemitte zu betrachten.

## Prognose Einsiedeln und Windentwicklung
Die Tabelle nutzt die Landkoordinaten von Einsiedeln. Sie zeigt die erwartete Entwicklung an diesem Punkt getrennt von der Beobachtung. Touristische Informationen beschreiben die Bedeutung des Windes aus dem Ybrig für örtliche Aktivitäten; Auftreten und Stärke sind am Ausflugstag zu prüfen. Eine übliche Tageszeit garantiert kein Zeitfenster an deinem Ufer.

## Surfen, Segeln und Kitesurfbereiche
Das Tourismusbüro nennt Surfen, Segeln und Kiten mit eigenen Informationen zu jeder Sportart. Konsultiere für Kitesurfen die kantonale Verordnung und Zugangshinweise: Der Bereich südlich des Steinbachviadukts ist eine Sperrzone. Eine Aktivität im Nachbarbecken bedeutet keine Freigabe für deinen Ausgangspunkt.

## Webcams und regionaler Vergleich
Suche eine Webcam mit Blick auf das richtige Becken und prüfe den Zeitstempel. Zum Vergleich mit einem anderen See der Tourismusregion gibt es den [Zürichsee-Guide](/de/vent-en-direct/lac-de-zurich) mit eigenen Beobachtungen und einem anderen Prognosepunkt. Kläre schliesslich Treffpunkt, Saison und Bedingungen direkt beim gewählten Anbieter.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Sihlsee?",
          answer:
            "Die Karte Einsiedeln zeigt die verfügbare MeteoSwiss-Beobachtung mit Zeitpunkt und Quelle. Die Station liegt an Land westlich des Sees und misst nicht in Willerzell oder Euthal.",
        },
        {
          question: "Gilt die Prognose für die Mitte des Sihlsees?",
          answer:
            "Berechnungspunkt ist Einsiedeln an den unter den Beobachtungen genannten Landkoordinaten. Er beschreibt keinen Mittelwert der unterschiedlichen Seebecken.",
        },
        {
          question: "Ist Kitesurfen auf dem ganzen Sihlsee möglich?",
          answer:
            "Die kantonale Verordnung schliesst den Bereich südlich des Steinbachviadukts aus. Prüfe den Erlass, örtliche Vorgaben und Zugänge für deine Sportart vor der Wahl des Ausgangspunkts.",
        },
        {
          question: "Ist der Wind aus dem Ybrig garantiert?",
          answer:
            "Er ist ein in den touristischen Quellen beschriebener örtlicher Bezugspunkt. Prüfe Messungen, Prognose und deinen Abschnitt am Ausflugstag; Uhrzeit und Stärke sind nicht garantiert.",
        },
      ],
    },
    it: {
      title:
        "Vento al Sihlsee: stazione, previsioni e riferimenti a Einsiedeln",
      description:
        "Prepara l’uscita al Sihlsee: vento misurato a Einsiedeln, previsioni locali, webcam e fonti per surf, vela e settori di kitesurf.",
      place: "Lago della Sihl / Sihlsee",
      coverAlt:
        "Sihlsee e le sue rive con montagne innevate e i loro riflessi nell’acqua",
      content: `## Willerzell, Euthal o il nord del Sihlsee
Il Sihlsee è un lago artificiale vicino a Einsiedeln, nel Canton Svitto. Individua il settore prima dell’uscita: la baia di Willerzell, il sud verso Euthal e la parte settentrionale non corrispondono allo stesso punto di osservazione. I viadotti aiutano a leggere la mappa; non indicano un ingresso in acqua.

## Una misura terrestre a Einsiedeln
La stazione MeteoSwiss EIN si trova sulla terraferma a ovest del lago. Direzione, raffiche e orario si riferiscono alla sua posizione. Non misura a Willerzell né a Euthal. Confronta lo storico con un’immagine datata della tua riva e le condizioni sul posto, senza trasformare un valore del villaggio in una misura al centro del lago.

## Previsioni a Einsiedeln ed evoluzione del vento
La tabella usa le coordinate terrestri di Einsiedeln. Indica l’evoluzione prevista in quel punto, distinta dall’osservazione. Le informazioni turistiche descrivono l’interesse del vento proveniente dall’Ybrig per le attività locali; presenza e forza vanno verificate il giorno dell’uscita. Un orario abituale non garantisce una fascia utile sulla tua riva.

## Surf, vela e settori di kite
L’ufficio turistico elenca surf, vela e kite con informazioni specifiche per ogni attività. Per il kite consulta il regolamento cantonale e le indicazioni di accesso: il settore a sud dello Steinbachviadukt è una zona esclusa. Un’attività nel bacino vicino non autorizza la pratica nel tuo punto di partenza.

## Webcam e confronto regionale
Cerca una webcam rivolta verso il bacino giusto e controlla l’orario dell’immagine. Per confrontare un altro lago della regione turistica consulta la [guida del lago di Zurigo](/it/vent-en-direct/lac-de-zurich), con osservazioni e punto di previsione distinti. Verifica infine ritrovo, stagione e condizioni presso l’operatore scelto.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al Sihlsee?",
          answer:
            "La scheda Einsiedeln mostra l’osservazione MeteoSwiss disponibile con ora e fonte. La stazione è terrestre, a ovest del lago; non misura a Willerzell o Euthal.",
        },
        {
          question: "La previsione corrisponde al centro del lago della Sihl?",
          answer:
            "Il punto di calcolo è Einsiedeln, alle coordinate terrestri indicate sotto le osservazioni. Non rappresenta la media dei diversi bacini del Sihlsee.",
        },
        {
          question: "Il kite è possibile su tutto il Sihlsee?",
          answer:
            "Il regolamento cantonale esclude il settore a sud dello Steinbachviadukt. Consulta il testo, le indicazioni locali e gli accessi per l’attività prima di scegliere la partenza.",
        },
        {
          question: "Il vento proveniente dall’Ybrig è garantito?",
          answer:
            "È un riferimento locale descritto dalle fonti turistiche. Verifica osservazioni, previsioni e settore il giorno dell’uscita; orario e forza non sono garantiti.",
        },
      ],
    },
  },
};
