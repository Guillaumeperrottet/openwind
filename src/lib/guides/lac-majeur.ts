import type { LocalGuide } from "../local-guides";

export const LAC_MAJEUR_GUIDE: LocalGuide = {
  slug: "lac-majeur",
  region: "Ticino / Tessin · Lago Maggiore",
  aliases: [
    "Lac Majeur",
    "Lago Maggiore",
    "Langensee",
    "Verbano",
    "Locarno",
    "Ascona",
    "Brissago",
    "Magadino",
    "Tenero",
  ],
  coordinates: { lat: 46.172532058, lng: 8.7873245489 },
  forecastPlace: "Locarno / Monti",
  coverImage: "/images/guides/maggiore.jpg",
  coverCredit: {
    author: "Ngbrx",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lago_Maggiore_from_Ascona.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T12:27:40Z",
  updatedAt: "2026-10-21T12:27:40Z",
  stations: [
    {
      id: "OTL",
      name: "Locarno / Monti",
      source: "meteoswiss",
      context: {
        fr: "Station sur les hauteurs de Locarno ; le vent peut différer de celui du rivage.",
        de: "Station oberhalb von Locarno; der Wind kann vom Ufer abweichen.",
        it: "Stazione sulle alture di Locarno; il vento può differire da quello sulla riva.",
      },
    },
    {
      id: "MAG",
      name: "Magadino / Cadenazzo",
      source: "meteoswiss",
      context: {
        fr: "Repère dans la plaine, à l’intérieur des terres ; pas une mesure sur le lac.",
        de: "Vergleichspunkt in der Ebene im Landesinneren; keine Messung auf dem See.",
        it: "Riferimento nella pianura, nell’entroterra; non è una misura sul lago.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Ascona-Locarno Turismo — Lago Maggiore",
      url: "https://www.ascona-locarno.com/it/attualita/lago-maggiore",
    },
    {
      label: "Ascona-Locarno Turismo — Sport acquatici",
      url: "https://www.ascona-locarno.com/it/attualita/storie/sport-acquatici",
    },
    {
      label:
        "Canton Ticino — Ordinanza sulla protezione delle Bolle di Magadino",
      url: "https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/554",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac Majeur : balises, prévisions et webcams au Tessin",
      description:
        "Consultez le vent autour de Locarno, Ascona et du lac Majeur suisse : mesures régionales, prévisions à Locarno / Monti, webcams et accès locaux.",
      place: "Lac Majeur / Locarno",
      coverAlt: "Le lac Majeur vu depuis Ascona, sur sa rive suisse",
      content: `## Choisir sa rive dans la partie suisse
Le lac Majeur, Lago Maggiore en italien et Langensee en allemand, s’étend entre la Suisse et l’Italie. Ce guide prend pour point de départ le secteur suisse autour de Locarno et Ascona. Une information valable dans cette zone ne décrit pas automatiquement Brissago ou la partie italienne du lac. Placez d’abord votre destination sur la carte.

## Deux stations, deux expositions
Locarno / Monti mesure sur les hauteurs de la ville. Magadino / Cadenazzo se trouve dans la plaine, à l’intérieur des terres. Aucune n’est une mesure au milieu du lac ou sur votre plage. Comparez leur direction et l’évolution des rafales pour comprendre le contexte régional, puis cherchez une confirmation près de votre lieu de départ. Un écart entre les capteurs ne signifie pas que l’un est erroné.

## Ce que couvre la prévision de Locarno / Monti
Le point de calcul est situé à Locarno / Monti, sur les hauteurs, et non au bord de toutes les plages. Le tableau donne une tendance pour ce point ; les cartes de balises donnent des observations à leurs propres emplacements. Gardez cette distinction lorsque vous comparez modèle et mesures ou lorsque vous préparez une sortie plus au sud.

## Compléter avec les webcams et les acteurs locaux
Les images autour du lieu peuvent aider à observer la surface de l’eau. Vérifiez leur heure, leur orientation et ce qu’elles montrent réellement. La page [sports aquatiques d’Ascona-Locarno](https://www.ascona-locarno.com/it/attualita/storie/sport-acquatici) permet aussi de repérer les activités et les prestataires locaux. Consultez leurs informations pour organiser votre accès plutôt que de partir d’une simple vue sur la carte.

## Distinguer loisirs et espaces protégés
Le secteur des Bolle di Magadino fait l’objet d’une ordonnance cantonale de protection. Consultez le texte officiel, les indications locales et la signalisation avant d’approcher cette zone. Les règles d’un secteur ne doivent pas être généralisées à l’ensemble du lac ni transposées d’une rive suisse à une rive italienne.`,
      faq: [
        {
          question: "Ce guide couvre-t-il tout le Lago Maggiore ?",
          answer:
            "Il se concentre sur la partie suisse autour de Locarno et Ascona. Pour une autre rive ou la partie italienne, consultez les observations, les prévisions et les informations locales correspondantes.",
        },
        {
          question: "Où sont les balises affichées pour le lac Majeur ?",
          answer:
            "Locarno / Monti est sur les hauteurs de Locarno et Magadino / Cadenazzo dans la plaine. Ce sont des repères régionaux, pas des mesures sur chaque plage.",
        },
        {
          question: "Les prévisions sont-elles calculées sur l’eau ?",
          answer:
            "Non. Le point du tableau est Locarno / Monti, sur les hauteurs. Il ne décrit pas toutes les rives du lac Majeur.",
        },
        {
          question: "Où vérifier les informations sur les Bolle di Magadino ?",
          answer:
            "L’ordonnance cantonale figure parmi les sources du guide. Consultez-la avec la signalisation et les informations locales avant de préparer un accès dans ce secteur.",
        },
      ],
    },
    de: {
      title: "Wind am Lago Maggiore: Messstationen, Prognose und Webcams",
      description:
        "Wind rund um Locarno, Ascona und den Schweizer Lago Maggiore: regionale Messungen, Prognose für Locarno / Monti, Webcams und lokale Informationen.",
      place: "Lago Maggiore / Langensee",
      coverAlt: "Blick von Ascona über den Lago Maggiore am Schweizer Ufer",
      content: `## Ein Ufer im Schweizer Teil wählen
Der Lago Maggiore, auch Langensee genannt, erstreckt sich über die Schweiz und Italien. Dieser Guide beginnt im Schweizer Abschnitt rund um Locarno und Ascona. Angaben aus diesem Bereich beschreiben Brissago oder den italienischen Teil nicht automatisch. Suche zuerst dein Ziel auf der Karte.

## Zwei Stationen mit unterschiedlicher Lage
Locarno / Monti misst oberhalb der Stadt. Magadino / Cadenazzo liegt in der Ebene im Landesinneren. Keine der beiden Stationen misst mitten auf dem See oder an deinem Strand. Vergleiche Richtung und Böenverlauf als regionalen Kontext und suche eine Bestätigung nahe deinem Startplatz. Unterschiedliche Werte bedeuten nicht automatisch, dass ein Sensor falsch misst.

## Was die Prognose für Locarno / Monti beschreibt
Der Berechnungspunkt liegt bei Locarno / Monti oberhalb der Stadt und nicht an sämtlichen Stränden. Die Tabelle zeigt einen Trend für diesen Punkt; die Stationskarten zeigen Beobachtungen an ihren jeweiligen Standorten. Behalte diese Trennung beim Vergleich von Modell und Messung sowie bei einer Ausfahrt weiter südlich im Blick.

## Webcams und örtliche Anbieter ergänzen
Bilder aus der Umgebung können den Eindruck von der Wasseroberfläche ergänzen. Prüfe Aufnahmezeit, Blickrichtung und tatsächlichen Bildausschnitt. Die Seite [Wassersport von Ascona-Locarno](https://www.ascona-locarno.com/it/attualita/storie/sport-acquatici) hilft zudem bei der Suche nach Aktivitäten und örtlichen Anbietern. Nutze deren Angaben zur Vorbereitung des Zugangs, statt allein vom Kartenbild auszugehen.

## Freizeit und Schutzgebiete unterscheiden
Für die Bolle di Magadino gilt eine kantonale Schutzverordnung. Prüfe den offiziellen Text sowie örtliche Angaben und Beschilderung, bevor du diesen Bereich ansteuerst. Regeln eines einzelnen Abschnitts gelten nicht automatisch auf dem ganzen See und lassen sich nicht von einem Schweizer auf ein italienisches Ufer übertragen.`,
      faq: [
        {
          question: "Deckt dieser Guide den ganzen Lago Maggiore ab?",
          answer:
            "Er konzentriert sich auf den Schweizer Teil rund um Locarno und Ascona. Für andere Ufer und den italienischen Teil brauchst du die dortigen Beobachtungen, Prognosen und lokalen Informationen.",
        },
        {
          question: "Wo stehen die angezeigten Windstationen?",
          answer:
            "Locarno / Monti liegt oberhalb von Locarno, Magadino / Cadenazzo in der Ebene. Beide sind regionale Vergleichspunkte und messen nicht an jedem Strand.",
        },
        {
          question: "Wird die Prognose auf dem Wasser berechnet?",
          answer:
            "Nein. Der Tabellenpunkt ist Locarno / Monti oberhalb der Stadt. Er beschreibt nicht sämtliche Ufer des Lago Maggiore.",
        },
        {
          question: "Wo finde ich Informationen zu den Bolle di Magadino?",
          answer:
            "Die kantonale Schutzverordnung ist in den Quellen verlinkt. Prüfe sie zusammen mit der Beschilderung und örtlichen Informationen vor der Zugangsplanung in diesem Bereich.",
        },
      ],
    },
    it: {
      title: "Vento sul Lago Maggiore: stazioni, previsioni e webcam in Ticino",
      description:
        "Consulta il vento intorno a Locarno, Ascona e al Lago Maggiore svizzero: misure regionali, previsioni a Locarno / Monti, webcam e informazioni locali.",
      place: "Lago Maggiore / Locarno",
      coverAlt: "Il Lago Maggiore visto da Ascona, sulla sponda svizzera",
      content: `## Scegliere la riva nella parte svizzera
Il Lago Maggiore, chiamato anche Verbano, si estende tra Svizzera e Italia. Questa guida parte dal settore svizzero intorno a Locarno e Ascona. Un’informazione valida in questa zona non descrive automaticamente Brissago o la parte italiana del lago. Individua prima la destinazione sulla mappa.

## Due stazioni, due esposizioni
Locarno / Monti misura sulle alture della città. Magadino / Cadenazzo si trova nella pianura, nell’entroterra. Nessuna delle due misura in mezzo al lago o sulla tua spiaggia. Confronta direzione ed evoluzione delle raffiche per leggere il contesto regionale, poi cerca una conferma vicino al punto di partenza. Una differenza tra i sensori non significa che uno sia errato.

## Che cosa coprono le previsioni di Locarno / Monti
Il punto di calcolo è a Locarno / Monti, sulle alture, e non lungo tutte le spiagge. La tabella fornisce una tendenza per quel punto; le schede delle stazioni riportano osservazioni nei rispettivi luoghi. Mantieni questa distinzione quando confronti modello e misure o prepari un’uscita più a sud.

## Integrare webcam e operatori locali
Le immagini nei dintorni possono aiutare a osservare la superficie dell’acqua. Controlla ora, orientamento e settore realmente inquadrato. La pagina [sport acquatici di Ascona-Locarno](https://www.ascona-locarno.com/it/attualita/storie/sport-acquatici) aiuta anche a trovare attività e operatori locali. Consulta le loro informazioni per organizzare l’accesso, senza basarti soltanto sulla mappa.

## Distinguere svago e aree protette
Le Bolle di Magadino sono soggette a un’ordinanza cantonale di protezione. Consulta il testo ufficiale, le indicazioni locali e la segnaletica prima di avvicinarti alla zona. Non estendere le regole di un settore a tutto il lago e non trasferirle automaticamente da una sponda svizzera a una italiana.`,
      faq: [
        {
          question: "Questa guida copre tutto il Lago Maggiore?",
          answer:
            "Si concentra sulla parte svizzera intorno a Locarno e Ascona. Per un’altra riva o la parte italiana consulta le osservazioni, le previsioni e le informazioni locali corrispondenti.",
        },
        {
          question: "Dove si trovano le stazioni mostrate?",
          answer:
            "Locarno / Monti è sulle alture di Locarno, Magadino / Cadenazzo nella pianura. Sono riferimenti regionali, non misure su ogni spiaggia.",
        },
        {
          question: "Le previsioni sono calcolate sull’acqua?",
          answer:
            "No. Il punto della tabella è Locarno / Monti, sulle alture. Non descrive tutte le rive del Lago Maggiore.",
        },
        {
          question: "Dove verificare le informazioni sulle Bolle di Magadino?",
          answer:
            "L’ordinanza cantonale è tra le fonti della guida. Consultala insieme alla segnaletica e alle informazioni locali prima di pianificare un accesso in questo settore.",
        },
      ],
    },
  },
};
