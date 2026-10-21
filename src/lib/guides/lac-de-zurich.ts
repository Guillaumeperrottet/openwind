import type { LocalGuide } from "../local-guides";

export const LAC_DE_ZURICH_GUIDE: LocalGuide = {
  slug: "lac-de-zurich",
  region: "Zürich · St. Gallen · Schwyz",
  aliases: [
    "Zurich",
    "Zürich",
    "Zürichsee",
    "Zuerichsee",
    "Lac de Zurich",
    "Lago di Zurigo",
    "Lake Zurich",
    "Wädenswil",
    "Waedenswil",
    "Rapperswil",
    "Fluntern",
    "Tiefenbrunnen",
    "Mythenquai",
    "Seebecken Zürich",
    "Stäfa",
  ],
  coordinates: { lat: 47.2218055922, lng: 8.6769614303 },
  forecastPlace: "Wädenswil",
  coverImage: "/images/guides/zurich.jpg",
  coverCredit: {
    author: "Jakub Hałun",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lake_Zurich_at_Rapperswil,_20250330_0825_7818.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  publishedAt: "2026-10-21T12:57:29Z",
  updatedAt: "2026-10-21T12:57:29Z",
  stations: [
    {
      id: "WAE",
      name: "Wädenswil",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre au-dessus de la rive ; pas une mesure sur l’eau ou à chaque plage de Wädenswil.",
        de: "Landstation oberhalb des Ufers; keine Messung auf dem Wasser oder an jedem Strand von Wädenswil.",
        it: "Stazione a terra sopra la riva; non misura sull’acqua o su ogni spiaggia di Wädenswil.",
      },
    },
    {
      id: "SMA",
      name: "Zürich / Fluntern",
      source: "meteoswiss",
      context: {
        fr: "Repère sur les hauteurs de Zurich, distinct des stations municipales de Mythenquai et Tiefenbrunnen.",
        de: "Vergleichspunkt oberhalb der Stadt, getrennt von den städtischen Stationen Mythenquai und Tiefenbrunnen.",
        it: "Riferimento sulle alture di Zurigo, distinto dalle stazioni comunali di Mythenquai e Tiefenbrunnen.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Stadt Zürich — Wetter-, Gewässerdaten und Webcam",
      url: "https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/gewaesser/wetterstationen.html",
    },
    {
      label: "Stadt Zürich — Wind- und Kitesurfen",
      url: "https://www.stadt-zuerich.ch/de/stadtleben/sport-und-erholung/gewaesser/windsurfen-kitesurfen.html",
    },
    {
      label: "Stadt Zürich — carte cantonale des zones interdites au kitesurf",
      url: "https://www.stadt-zuerich.ch/content/dam/web/de/stadtleben/sport-und-erholung/dokumente/gewaesser/kitesurfverbot.pdf",
    },
    {
      label: "Zürich Tourismus — Rund um den Zürichsee",
      url: "https://www.zuerich.com/de/sightseeing-aktivitaeten/ausfluege-ab-zuerich/nahe-zuerich/zuerichsee",
    },
  ],
  translations: {
    fr: {
      title:
        "Vent au lac de Zurich : balises, prévisions et webcams du Zürichsee",
      description:
        "Comparez Wädenswil et Zürich / Fluntern, consultez les prévisions et les webcams du lac de Zurich, puis vérifiez les accès avec les sources officielles.",
      place: "Lac de Zurich / Zürichsee",
      coverAlt: "Le port et les bâtiments de Rapperswil au bord du lac de Zurich",
      content: `## Du bassin de Zurich à Rapperswil : choisir son secteur
Le Zürichsee se lit à l’échelle de la rive que vous comptez rejoindre. Le bassin urbain de Zurich, les environs de Wädenswil et le secteur de Rapperswil ne correspondent pas à un même point d’observation. Commencez par situer votre destination sur la carte ; le lieu le plus connu du lac n’est pas forcément le repère météo le plus proche de votre départ.

## Ce que mesurent Wädenswil et Zürich / Fluntern
Les cartes de ce guide présentent deux stations MeteoSwiss. Wädenswil est à terre au-dessus de la rive. Zürich / Fluntern se trouve sur les hauteurs de la ville. Ces expositions peuvent expliquer des écarts de direction et de rafales. Aucune de ces deux mesures ne doit être assimilée au vent sur toute la surface du lac ou à une observation sur chaque plage.

## Prévisions : un point à Wädenswil
Le tableau est calculé aux coordonnées de Wädenswil, distinctes d’un départ à Zurich ou à Rapperswil. Utilisez-le pour suivre une évolution au point indiqué, puis comparez les mesures récentes et leurs historiques. Une prévision et un capteur qui divergent ne se départagent pas simplement en choisissant le chiffre le plus élevé.

## Compléter avec les stations municipales et les webcams
La Ville de Zurich publie des données pour Tiefenbrunnen et Mythenquai, ainsi qu’un lien vers une webcam. Ces observations municipales sont consultables dans les sources ; elles ne sont pas les deux balises affichées ci-dessus. Pour une autre rive, cherchez une image proche du lieu, contrôlez son cadrage et vérifiez l’heure de prise de vue.

## Accès : vérifier le secteur et l’activité
La Ville documente des restrictions pour le windsurf et le kitesurf et fournit une carte cantonale des zones interdites au kite. Consultez ces documents pour le secteur zurichois et les informations des autorités compétentes ailleurs sur le lac. Un point météo ou une vue sur le port de Rapperswil ne désigne pas une mise à l’eau autorisée. Les règles d’une activité ne se transposent pas automatiquement à une autre.`,
      faq: [
        {
          question: "Où consulter le vent en direct au lac de Zurich ?",
          answer:
            "Le guide affiche les observations de Wädenswil et Zürich / Fluntern avec leur heure et leur source. La page de la Ville de Zurich propose en complément les stations municipales de Tiefenbrunnen et Mythenquai.",
        },
        {
          question: "Fluntern et Mythenquai sont-ils la même station ?",
          answer:
            "Non. Fluntern est le repère MeteoSwiss sur les hauteurs de Zurich. Les données municipales de Mythenquai sont accessibles via la source officielle de la Ville.",
        },
        {
          question: "La prévision correspond-elle au centre du lac ?",
          answer:
            "Non. Le point du tableau est Wädenswil, à terre. Il ne décrit pas toutes les rives ni tous les bassins du Zürichsee.",
        },
        {
          question: "Où vérifier les accès pour le kite et le windsurf ?",
          answer:
            "Les sources renvoient à la page officielle de la Ville et à la carte cantonale. Vérifiez le secteur concerné, les autorités compétentes et la signalisation locale pour votre activité.",
        },
      ],
    },
    de: {
      title: "Wind am Zürichsee: Messstationen, Prognose und Webcams",
      description:
        "Vergleiche Wädenswil und Zürich / Fluntern, prüfe Prognose und Webcams am Zürichsee und kläre die Zugänge anhand offizieller Quellen.",
      place: "Zürichsee / Zürich",
      coverAlt: "Hafen und Gebäude von Rapperswil am Zürichsee",
      content: `## Vom Zürcher Seebecken bis Rapperswil: den Abschnitt wählen
Am Zürichsee zählt das Ufer, das du tatsächlich erreichen möchtest. Das städtische Seebecken, die Umgebung von Wädenswil und der Bereich Rapperswil sind unterschiedliche Beobachtungspunkte. Suche zuerst dein Ziel auf der Karte; der bekannteste Ort am See ist nicht unbedingt der passende Wettervergleich für deinen Start.

## Was Wädenswil und Zürich / Fluntern messen
Die Karten dieses Guides zeigen zwei MeteoSwiss-Stationen. Wädenswil liegt an Land oberhalb des Ufers. Zürich / Fluntern befindet sich oberhalb der Stadt. Diese Expositionen können Unterschiede bei Richtung und Böen erklären. Keine der beiden Messungen beschreibt den Wind auf der gesamten Seefläche oder an jedem Strand.

## Prognose: ein Berechnungspunkt in Wädenswil
Die Tabelle wird für die Koordinaten von Wädenswil berechnet, getrennt von einem Start in Zürich oder Rapperswil. Nutze sie für die Entwicklung am angegebenen Punkt und vergleiche aktuelle Messungen samt Verläufen. Bei Abweichungen zwischen Prognose und Sensor einfach den höheren Wert zu wählen, hilft bei der Einordnung nicht weiter.

## Städtische Stationen und Webcams ergänzen
Die Stadt Zürich veröffentlicht Daten von Tiefenbrunnen und Mythenquai sowie einen Webcam-Link. Diese städtischen Beobachtungen findest du über die Quellen; es sind nicht die beiden oben angezeigten Stationen. Suche für ein anderes Ufer ein ortsnahes Bild und prüfe Bildausschnitt und Aufnahmezeit.

## Zugänge nach Abschnitt und Sportart prüfen
Die Stadt dokumentiert Einschränkungen für Wind- und Kitesurfen und verlinkt eine kantonale Karte der Kitesurf-Verbotszonen. Prüfe diese Unterlagen für den Zürcher Bereich und andernorts am See die zuständigen Behörden. Ein Wetterpunkt oder ein Foto des Hafens von Rapperswil kennzeichnet keinen erlaubten Einstieg. Regeln einer Sportart lassen sich nicht automatisch auf eine andere übertragen.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind für den Zürichsee?",
          answer:
            "Der Guide zeigt Wädenswil und Zürich / Fluntern mit Messzeit und Quelle. Ergänzend verlinkt die Stadt Zürich ihre städtischen Stationen Tiefenbrunnen und Mythenquai.",
        },
        {
          question: "Sind Fluntern und Mythenquai dieselbe Station?",
          answer:
            "Nein. Fluntern ist der MeteoSwiss-Vergleichspunkt oberhalb von Zürich. Die städtischen Mythenquai-Daten sind über die offizielle Quelle der Stadt erreichbar.",
        },
        {
          question: "Gilt die Prognose für die Seemitte?",
          answer:
            "Nein. Der Tabellenpunkt liegt in Wädenswil an Land. Er beschreibt nicht alle Ufer oder Becken des Zürichsees.",
        },
        {
          question: "Wo prüfe ich Einstiege für Kite- und Windsurfen?",
          answer:
            "Die Quellen verlinken die offizielle Seite der Stadt und die kantonale Karte. Prüfe den betreffenden Abschnitt, die zuständigen Behörden und die örtliche Beschilderung für deine Sportart.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Zurigo: stazioni, previsioni e webcam",
      description:
        "Confronta Wädenswil e Zürich / Fluntern, consulta previsioni e webcam del lago di Zurigo e verifica gli accessi tramite le fonti ufficiali.",
      place: "Lago di Zurigo / Zürichsee",
      coverAlt: "Il porto e gli edifici di Rapperswil sul lago di Zurigo",
      content: `## Dal bacino di Zurigo a Rapperswil: scegliere il settore
Il Zürichsee va letto alla scala della riva che vuoi raggiungere. Il bacino urbano di Zurigo, i dintorni di Wädenswil e il settore di Rapperswil non sono lo stesso punto di osservazione. Individua prima la destinazione sulla mappa: il luogo più conosciuto del lago non è necessariamente il riferimento meteo più vicino alla partenza.

## Che cosa misurano Wädenswil e Zürich / Fluntern
Le schede di questa guida mostrano due stazioni MeteoSwiss. Wädenswil è a terra sopra la riva. Zürich / Fluntern si trova sulle alture della città. Le esposizioni possono spiegare differenze di direzione e raffiche. Nessuna delle due misure descrive il vento su tutta la superficie del lago o su ogni spiaggia.

## Previsioni: un punto a Wädenswil
La tabella è calcolata alle coordinate di Wädenswil, distinte da una partenza a Zurigo o Rapperswil. Usala per seguire l’evoluzione nel punto indicato, poi confronta osservazioni recenti e storici. Se modello e sensore divergono, scegliere semplicemente il numero più alto non aiuta a interpretare la situazione.

## Integrare stazioni comunali e webcam
La Città di Zurigo pubblica dati di Tiefenbrunnen e Mythenquai e un collegamento a una webcam. Queste osservazioni comunali sono accessibili dalle fonti e non sono le due stazioni mostrate sopra. Per un’altra riva cerca un’immagine vicina al luogo, controlla l’inquadratura e verifica l’ora della ripresa.

## Verificare accessi per settore e attività
La Città documenta restrizioni per windsurf e kitesurf e fornisce una mappa cantonale delle zone vietate al kite. Consulta questi documenti per il settore zurighese e le autorità competenti altrove sul lago. Un punto meteo o una vista sul porto di Rapperswil non identifica un ingresso autorizzato. Le regole di un’attività non si trasferiscono automaticamente a un’altra.`,
      faq: [
        {
          question: "Dove consultare il vento in diretta al lago di Zurigo?",
          answer:
            "La guida mostra Wädenswil e Zürich / Fluntern con fonte e ora. La pagina della Città di Zurigo offre inoltre le stazioni comunali di Tiefenbrunnen e Mythenquai.",
        },
        {
          question: "Fluntern e Mythenquai sono la stessa stazione?",
          answer:
            "No. Fluntern è il riferimento MeteoSwiss sulle alture di Zurigo. I dati comunali di Mythenquai sono raggiungibili dalla fonte ufficiale della Città.",
        },
        {
          question: "Le previsioni corrispondono al centro del lago?",
          answer:
            "No. Il punto della tabella è Wädenswil, a terra. Non descrive tutte le rive o tutti i bacini del Zürichsee.",
        },
        {
          question: "Dove verificare gli accessi per kite e windsurf?",
          answer:
            "Le fonti rimandano alla pagina ufficiale della Città e alla mappa cantonale. Verifica settore, autorità competenti e segnaletica locale per la tua attività.",
        },
      ],
    },
  },
};
