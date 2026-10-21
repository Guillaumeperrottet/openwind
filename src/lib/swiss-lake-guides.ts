import type { LocalGuide } from "./local-guides";

/** Versioned editorial content. Station and spot IDs were checked against the public catalog. */
export const SWISS_LAKE_GUIDES: LocalGuide[] = [
  {
    slug: "lac-de-neuchatel",
    region: "Neuchâtel · Vaud · Fribourg · Bern",
    aliases: [
      "Neuchâtel",
      "Neuchatel",
      "Neuenburgersee",
      "Lago di Neuchâtel",
      "Saint-Blaise",
      "Yvonand",
      "Portalban",
      "Estavayer",
    ],
    coordinates: { lat: 47.0001, lng: 6.9533 },
    forecastPlace: "Neuchâtel",
    coverImage: "/images/guides/neuchatel.jpg",
    coverCredit: {
      author: "Thomas Woodtli",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Port_de_Portalban_(43430186691).jpg",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    },
    publishedAt: "2026-10-21T11:07:43Z",
    updatedAt: "2026-10-21T11:07:43Z",
    stations: [
      {
        id: "NEU",
        name: "Neuchâtel",
        source: "meteoswiss",
        context: {
          fr: "Repère sur la rive nord, près de Neuchâtel.",
          de: "Vergleichspunkt am Nordufer bei Neuenburg.",
          it: "Punto di riferimento sulla riva nord, presso Neuchâtel.",
        },
      },
      {
        id: "PAY",
        name: "Payerne",
        source: "meteoswiss",
        context: {
          fr: "Contexte régional dans la plaine de la Broye, à l’intérieur des terres.",
          de: "Regionaler Vergleich in der Broye-Ebene, abseits des Seeufers.",
          it: "Contesto regionale nella pianura della Broye, nell’entroterra.",
        },
      },
      {
        id: "CRM",
        name: "Cressier",
        source: "meteoswiss",
        context: {
          fr: "Repère régional au nord-est du lac ; ce n’est pas une mesure sur l’eau.",
          de: "Regionaler Vergleich nordöstlich des Sees; keine Messung auf dem Wasser.",
          it: "Riferimento regionale a nord-est del lago; non è una misura sull’acqua.",
        },
      },
    ],
    spotIds: [
      "cmnr31n570007ijf6q33aez75",
      "cmnr312220004ijf6l2oobbhb",
      "cmnr30vtl0003ijf6ylndlqlf",
      "cmnr307uv0000ijf6j8zqjyis",
    ],
    sources: [
      {
        label: "Neuchâtel Tourisme — Saint-Blaise",
        url: "https://www.j3l.ch/fr/P88696/a-faire/sport-loisirs/activites-aquatiques/windsurf",
      },
      {
        label: "Grande Cariçaie — navigation et zones protégées",
        url: "https://grande-caricaie.ch/fr/visiter/navigateurs-et-baigneurs/",
      },
      {
        label: "Canton de Neuchâtel — navigation en kite-surf",
        url: "https://rsn.ne.ch/DATA/program/books/rsne/htm/766.393.htm",
      },
      {
        label: "MétéoSuisse — la bise",
        url: "https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/bise.html",
      },
    ],
    translations: {
      fr: {
        title: "Vent au lac de Neuchâtel : balises en direct et prévisions",
        description:
          "Comparez le vent à Neuchâtel, Payerne et Cressier, puis explorez Saint-Blaise, Yvonand et Portalban : mesures datées, prévisions et repères pour votre sortie.",
        place: "Lac de Neuchâtel",
        coverAlt: "Le port de Portalban et le lac de Neuchâtel",
        content: `## Un lac, plusieurs rives à comparer
Le lac de Neuchâtel se découvre aussi bien depuis Saint-Blaise et Neuchâtel que depuis Yvonand, Estavayer-le-Lac ou Portalban. Pour préparer une sortie, commencez par votre secteur de navigation. Une direction favorable sur une rive peut donner une exposition très différente sur la rive opposée.

## Quelles balises regarder ?
La station de Neuchâtel donne un repère proche de la rive nord. Payerne décrit la plaine de la Broye ; Cressier apporte un contexte au nord-est. Ces trois mesures ne constituent pas trois observations prises sur l’eau. Comparez d’abord leur heure et leur direction, puis ouvrez l’historique pour voir si la tendance se maintient.

## Bise, sud-ouest et changements de direction
La bise et les situations de sud-ouest n’exposent pas les mêmes rives de la même façon. Neuchâtel Tourisme cite notamment le sud-ouest pour Saint-Blaise. Cela ne suffit pas à choisir une mise à l’eau : regardez les rafales, les obstacles et la trajectoire de retour. Si les directions divergent entre les stations, vérifiez le ciel et le plan d’eau avant de décider.

## Choisir un point de départ
Les fiches de Saint-Blaise, Yvonand, Portalban et Estavayer rassemblent les informations disponibles dans Openwind. Consultez leurs accès et leurs particularités avant le déplacement. Le tableau météo de ce guide est calculé au point de Neuchâtel : il ne remplace pas une prévision pour Yvonand ou une observation sur la rive sud.

## Consulter les webcams et les règles locales
Une webcam peut compléter les mesures en montrant la visibilité et l’état apparent de l’eau ; contrôlez toujours l’heure de l’image. Les réserves de la Grande Cariçaie imposent des restrictions : consultez leur carte et les informations cantonales pour le secteur visé. Un spot présent sur la carte n’est pas une autorisation de pratiquer.`,
        faq: [
          {
            question: "Où voir le vent en direct au lac de Neuchâtel ?",
            answer:
              "Les cartes ci-dessus affichent les observations disponibles à Neuchâtel, Payerne et Cressier, avec leur source et leur date. Les fiches de stations permettent de consulter leur évolution.",
          },
          {
            question: "Quelle balise choisir pour Yvonand ou Portalban ?",
            answer:
              "Aucune des trois stations ne représente à elle seule ces deux spots. Croisez le contexte régional avec la prévision du spot, les images disponibles et vos observations sur place.",
          },
          {
            question: "Le tableau de prévisions couvre-t-il tout le lac ?",
            answer:
              "Non. Il correspond au point de Neuchâtel. Pour une autre rive, ouvrez la fiche du spot concerné afin de consulter sa prévision locale.",
          },
          {
            question: "Où vérifier les zones protégées ?",
            answer:
              "La Grande Cariçaie publie une carte des secteurs réglementés. Vérifiez aussi les règles du canton concerné et la signalisation sur place ; les liens officiels figurent dans les sources.",
          },
        ],
      },
      de: {
        title: "Wind am Neuenburgersee: Live-Messungen und Prognose",
        description:
          "Vergleiche Wind und Böen in Neuenburg, Payerne und Cressier. Entdecke Saint-Blaise, Yvonand und Portalban mit aktuellen Zeitangaben und lokalen Informationen.",
        place: "Neuenburgersee / Lac de Neuchâtel",
        coverAlt: "Der Hafen von Portalban am Neuenburgersee",
        content: `## Den See nach Uferabschnitten erkunden
Saint-Blaise und Neuenburg, Yvonand, Estavayer-le-Lac und Portalban bieten unterschiedliche Ausgangspunkte am Neuenburgersee. Wähle zunächst den Abschnitt, an dem du aufs Wasser möchtest. Dieselbe Windrichtung kann am gegenüberliegenden Ufer ganz andere Bedingungen erzeugen.

## Welche Messstation beschreibt welchen Ort?
Neuenburg liefert einen Vergleichspunkt nahe dem Nordufer. Payerne misst in der Broye-Ebene im Landesinneren; Cressier ergänzt die regionale Übersicht im Nordosten. Es sind keine drei Messungen auf dem See. Vergleiche zuerst die Zeitangaben und Richtungen und prüfe danach den Verlauf auf den Stationsseiten.

## Bise und Südwestwind einordnen
Bei Bise und bei Südwestwind sind die Ufer unterschiedlich ausgerichtet. Neuchâtel Tourisme nennt Südwestwind für den Spot Saint-Blaise. Eine Windrichtung allein reicht aber nicht zur Wahl eines Startplatzes. Berücksichtige Böen, Hindernisse und den Rückweg. Bei widersprüchlichen Messungen sind die Entwicklung am Himmel und der Zustand des Wassers besonders aufschlussreich.

## Einen passenden Ausgangspunkt finden
Die Spot-Seiten von Saint-Blaise, Yvonand, Portalban und Estavayer enthalten die verfügbaren Openwind-Informationen zu Zugang und örtlichen Besonderheiten. Die Prognosetabelle dieses Guides wird für Neuenburg berechnet. Sie beschreibt weder automatisch Yvonand noch die Bedingungen am Südufer. Öffne für einen anderen Ort die zugehörige Spot-Prognose.

## Webcams und Schutzgebiete prüfen
Webcams ergänzen die Messungen mit einem Eindruck von Sicht und Wasseroberfläche. Achte auf den Zeitpunkt der Aufnahme. Für die Schutzgebiete der Grande Cariçaie gelten Einschränkungen; nutze die offizielle Karte und die Informationen des jeweiligen Kantons. Ein Kartenpunkt in Openwind ist keine Erlaubnis zum Starten.`,
        faq: [
          {
            question: "Wo finde ich Live-Wind am Neuenburgersee?",
            answer:
              "Die Stationskarten zeigen verfügbare Beobachtungen in Neuenburg, Payerne und Cressier mit Quelle und Zeitpunkt. Auf den Stationsseiten findest du den Verlauf.",
          },
          {
            question: "Welche Station ist für Yvonand oder Portalban geeignet?",
            answer:
              "Keine der drei Stationen beschreibt diese Spots allein. Vergleiche den regionalen Verlauf mit der lokalen Spot-Prognose, verfügbaren Bildern und den Bedingungen vor Ort.",
          },
          {
            question: "Gilt die Prognose für den ganzen See?",
            answer:
              "Nein. Die Tabelle gilt für den Berechnungspunkt Neuenburg. Für andere Uferabschnitte öffnest du die jeweilige Spot-Seite.",
          },
          {
            question: "Wo finde ich die Schutzgebiete?",
            answer:
              "Die Grande Cariçaie veröffentlicht eine Karte der geregelten Bereiche. Prüfe zusätzlich die kantonalen Angaben und die örtliche Beschilderung. Die offiziellen Links stehen in den Quellen.",
          },
        ],
      },
      it: {
        title: "Vento al lago di Neuchâtel: misure in diretta e previsioni",
        description:
          "Confronta vento e raffiche a Neuchâtel, Payerne e Cressier. Esplora Saint-Blaise, Yvonand e Portalban con misure datate, previsioni e informazioni locali.",
        place: "Lago di Neuchâtel",
        coverAlt: "Il porto di Portalban sul lago di Neuchâtel",
        content: `## Confrontare le diverse rive
Saint-Blaise e Neuchâtel, Yvonand, Estavayer-le-Lac e Portalban sono punti di partenza diversi intorno al lago. Scegli prima il settore della tua uscita. La stessa direzione del vento può produrre condizioni molto differenti sulla riva opposta.

## Quali stazioni consultare?
Neuchâtel offre un riferimento vicino alla riva nord. Payerne descrive la pianura della Broye, nell’entroterra; Cressier aggiunge un confronto regionale a nord-est. Non si tratta di tre misure sull’acqua. Confronta prima orari e direzioni, poi apri lo storico delle stazioni per osservare l’evoluzione.

## Bise e vento da sud-ovest
Con la bise e con il sud-ovest le rive non hanno la stessa esposizione. Neuchâtel Tourisme indica il sud-ovest per Saint-Blaise. La sola direzione non basta però a scegliere il punto di entrata: considera raffiche, ostacoli e percorso di rientro. Se le direzioni delle stazioni divergono, controlla cielo e superficie del lago prima di decidere.

## Preparare il punto di partenza
Le schede di Saint-Blaise, Yvonand, Portalban ed Estavayer raccolgono le informazioni disponibili in Openwind sugli accessi e sulle particolarità locali. La tabella meteo di questa guida è calcolata per Neuchâtel: non sostituisce la previsione di Yvonand o un’osservazione sulla riva sud. Per un altro settore, consulta la scheda del relativo spot.

## Webcams e zone protette
Le webcam possono aggiungere informazioni sulla visibilità e sull’aspetto dell’acqua. Verifica l’ora dell’immagine. Nelle riserve della Grande Cariçaie esistono restrizioni: consulta la mappa ufficiale e le informazioni del cantone interessato. La presenza di uno spot sulla mappa non autorizza automaticamente la pratica.`,
        faq: [
          {
            question: "Dove vedere il vento in diretta al lago di Neuchâtel?",
            answer:
              "Le schede mostrano le osservazioni disponibili a Neuchâtel, Payerne e Cressier con fonte e data. Le pagine delle stazioni permettono di seguirne l’evoluzione.",
          },
          {
            question: "Quale stazione usare per Yvonand o Portalban?",
            answer:
              "Nessuna delle tre rappresenta da sola questi spot. Confronta il contesto regionale con le previsioni locali, le immagini disponibili e le condizioni sul posto.",
          },
          {
            question: "Le previsioni coprono tutto il lago?",
            answer:
              "No. La tabella corrisponde al punto di Neuchâtel. Apri la scheda dello spot per consultare le previsioni di un’altra zona.",
          },
          {
            question: "Dove verificare le zone protette?",
            answer:
              "La Grande Cariçaie pubblica una mappa dei settori regolamentati. Controlla anche le informazioni cantonali e la segnaletica locale; i collegamenti ufficiali sono nelle fonti.",
          },
        ],
      },
    },
  },
  {
    slug: "lac-leman",
    region: "Vaud · Genève · Valais · Haute-Savoie",
    aliases: [
      "Léman",
      "Leman",
      "Lac de Genève",
      "Genfersee",
      "Genfer See",
      "Lake Geneva",
      "Lago di Ginevra",
      "Lago Lemano",
      "Lausanne",
      "Morges",
      "Corseaux",
      "Nyon",
    ],
    coordinates: { lat: 46.5123, lng: 6.6675 },
    forecastPlace: "Pully / Lausanne",
    coverImage: "/images/guides/leman.jpg",
    coverCredit: {
      author: "Giles Laurent",
      authorUrl: "https://gileslaurent.com",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:044_Lake_Geneva_and_Swiss_Alps_Photo_by_Giles_Laurent.jpg",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    publishedAt: "2026-10-21T11:07:43Z",
    updatedAt: "2026-10-21T11:07:43Z",
    stations: [
      {
        id: "PRE",
        name: "St-Prex",
        source: "meteoswiss",
        context: {
          fr: "Repère de la rive vaudoise à l’ouest de Lausanne.",
          de: "Vergleichspunkt am Waadtländer Ufer westlich von Lausanne.",
          it: "Riferimento sulla riva vodese a ovest di Losanna.",
        },
      },
      {
        id: "PUY",
        name: "Pully",
        source: "meteoswiss",
        context: {
          fr: "Repère près de Lausanne ; exposition propre à la station.",
          de: "Vergleich bei Lausanne mit der örtlichen Exposition der Station.",
          it: "Riferimento presso Losanna, con l’esposizione propria della stazione.",
        },
      },
      {
        id: "BOU",
        name: "Bouveret",
        source: "meteoswiss",
        context: {
          fr: "Repère du Haut-Lac, à comparer avec votre rive.",
          de: "Vergleichspunkt am östlichen Seeende, dem Haut-Lac.",
          it: "Riferimento nell’Alto Lago, da confrontare con la propria riva.",
        },
      },
    ],
    spotIds: [
      "cmnpsruyx0001haf6x0f0m7v2",
      "cmnpsruzr0002haf63qwep8qj",
      "cmnpsrv0k0003haf6tfpg8h7y",
      "cmnpsruxz0000haf6cmrret15",
    ],
    sources: [
      {
        label: "MétéoSuisse — les vents du Léman",
        url: "https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/les-vents-du-leman.html",
      },
      {
        label: "Association pour la sauvegarde du Léman — les vents",
        url: "https://asleman.org/60_secondes/n12-les-vents-du-leman/",
      },
      {
        label: "État de Genève — activités nautiques",
        url: "https://www.ge.ch/naviguer-geneve/paddle-windsurf-wingfoil-parawing-kitesurf",
      },
      {
        label: "MétéoSuisse — dangers et alertes",
        url: "https://www.meteosuisse.admin.ch/meteo/dangers.html",
      },
    ],
    translations: {
      fr: {
        title: "Vent sur le Léman : balises en direct et prévisions locales",
        description:
          "Du Petit-Lac au Haut-Lac, comparez St-Prex, Pully et le Bouveret. Retrouvez les spots, les webcams autour de votre rive et les repères pour lire le vent sur le Léman.",
        place: "Lac Léman / lac de Genève",
        coverAlt:
          "Le lac Léman et les Alpes suisses photographiés depuis les hauteurs de la Riviera",
        content: `## Commencer par son secteur du Léman
Le lac Léman, aussi appelé lac de Genève, ne se résume pas à une seule valeur de vent. Avant de consulter une vitesse, situez votre sortie : Petit-Lac, rive vaudoise, rive française ou Haut-Lac. Les observations de St-Prex, Pully et du Bouveret servent à comparer plusieurs points du bassin ; aucune ne décrit à elle seule toute la surface du lac.

## Lire St-Prex, Pully et le Bouveret ensemble
St-Prex apporte un repère à l’ouest de Lausanne, Pully un point de comparaison près de la ville, et le Bouveret un regard sur le Haut-Lac. Vérifiez la date, la direction et les rafales avant de rapprocher leurs chiffres. Une mesure plus forte au Bouveret ne signifie pas que le même vent est déjà arrivé à Morges. Ouvrez les historiques pour distinguer une tendance d’une pointe isolée.

## Bise, vent de sud-ouest et effets locaux
La bise et le vent de sud-ouest font partie des régimes du Léman. Le relief et les brises locales peuvent modifier les conditions d’un secteur à l’autre. Pour approfondir leurs mécanismes, consultez les références de MétéoSuisse et de l’Association pour la sauvegarde du Léman. Sur Openwind, croisez la direction prévue avec les mesures récentes et observez la façon dont les rafales évoluent.

## De la prévision au spot
La table de ce guide correspond au point de Pully, près de Lausanne. Utilisez les fiches de Boiron, Corseaux, Promenthoux ou Excenevex pour consulter les informations et la prévision du lieu concerné. Une prévision favorable n’indique ni la qualité d’un accès, ni l’absence d’obstacles, ni une autorisation de mise à l’eau.

## Vérifier les images, les alertes et les accès
Les webcams autour du lieu choisi peuvent aider à lire la visibilité et l’aspect du plan d’eau. Leur image reste ponctuelle : contrôlez son heure. Consultez aussi les alertes météo officielles et les règles propres à la rive et à l’activité. Les informations de Genève concernent le secteur genevois et ne s’appliquent pas automatiquement à tout le Léman.`,
        faq: [
          {
            question: "Où voir le vent en direct sur le Léman ?",
            answer:
              "Ce guide compare les observations disponibles de St-Prex, Pully et du Bouveret. La carte Openwind permet d’explorer d’autres stations. Chaque valeur conserve son horodatage et sa source.",
          },
          {
            question:
              "Léman, lac de Genève et Genfersee désignent-ils le même lac ?",
            answer:
              "Oui. Ce sont des noms utilisés pour le même lac. La recherche Openwind reconnaît ces variantes et mène vers le guide dans la langue disponible.",
          },
          {
            question:
              "Pourquoi les mesures diffèrent-elles entre Lausanne et le Haut-Lac ?",
            answer:
              "Les stations sont à des endroits différents, avec leur propre exposition et parfois des horaires de mesure différents. Comparez les directions et les historiques avant d’en déduire une évolution sur l’ensemble du bassin.",
          },
          {
            question: "La prévision affichée vaut-elle pour Genève ?",
            answer:
              "Non. Le tableau est calculé au point de Pully. Utilisez une prévision centrée sur votre spot et consultez les alertes officielles pour votre secteur.",
          },
        ],
      },
      de: {
        title: "Wind am Genfersee: Live-Messungen und lokale Prognosen",
        description:
          "Vergleiche St-Prex, Pully und Bouveret am Genfersee. Finde Spots, Webcams in Ufernähe und lokale Informationen vom Petit-Lac bis zum Haut-Lac.",
        place: "Genfersee / Lac Léman",
        coverAlt:
          "Der Genfersee und die Schweizer Alpen von den Höhen der Riviera aus gesehen",
        content: `## Zuerst den Abschnitt am Genfersee wählen
Der Genfersee, auf Französisch Lac Léman, lässt sich nicht durch eine einzige Windgeschwindigkeit beschreiben. Bestimme zuerst dein Ziel: Petit-Lac, Waadtländer Ufer, französisches Ufer oder Haut-Lac. Die Stationen St-Prex, Pully und Bouveret bieten Vergleichspunkte im Seebecken. Keine von ihnen beschreibt allein die gesamte Wasserfläche.

## St-Prex, Pully und Bouveret vergleichen
St-Prex liegt westlich von Lausanne, Pully nahe der Stadt und Bouveret am östlichen Seeende. Prüfe Zeitpunkt, Richtung und Böen, bevor du die Werte vergleichst. Ein stärkerer Wind in Bouveret bedeutet nicht, dass er bereits Morges erreicht hat. Die Stationsverläufe helfen, eine anhaltende Entwicklung von einer einzelnen Spitze zu unterscheiden.

## Bise, Südwestwind und örtliche Einflüsse
Bise und Südwestwind gehören zu den Windlagen am Genfersee. Gelände und örtliche Brisen können die Bedingungen zwischen den Abschnitten verändern. Die Quellen von MeteoSchweiz und der Association pour la sauvegarde du Léman erklären die Mechanismen genauer. Vergleiche in Openwind die vorhergesagte Richtung mit aktuellen Beobachtungen und der Entwicklung der Böen.

## Von der Prognose zum Spot
Die Tabelle dieses Guides wird für Pully bei Lausanne berechnet. Auf den Spot-Seiten von Boiron, Corseaux, Promenthoux und Excenevex findest du die verfügbaren örtlichen Informationen und Prognosen. Eine günstige Modellprognose sagt nichts über Zugänglichkeit, Hindernisse oder eine Erlaubnis zum Starten aus.

## Bilder, Warnungen und örtliche Regeln prüfen
Webcams rund um deinen Zielort können Sicht und Wasseroberfläche zeigen. Prüfe die Aufnahmezeit. Beachte die offiziellen Wetterwarnungen und die Regeln für das jeweilige Ufer und deine Sportart. Die verlinkten Genfer Angaben gelten für den dortigen Abschnitt und sind keine Regelung für den gesamten See.`,
        faq: [
          {
            question: "Wo finde ich Live-Wind am Genfersee?",
            answer:
              "Dieser Guide vergleicht verfügbare Beobachtungen von St-Prex, Pully und Bouveret. Weitere Stationen findest du auf der Openwind-Karte. Jeder Wert zeigt Quelle und Zeitpunkt.",
          },
          {
            question: "Sind Genfersee und Lac Léman derselbe See?",
            answer:
              "Ja. Auch Lac de Genève und Lake Geneva bezeichnen denselben See. Die Openwind-Suche erkennt diese Namen und verlinkt den Guide in einer verfügbaren Sprache.",
          },
          {
            question: "Warum unterscheiden sich Lausanne und der Haut-Lac?",
            answer:
              "Die Stationen haben unterschiedliche Standorte und Expositionen; auch die Messzeitpunkte können abweichen. Vergleiche Richtungen und Verläufe, bevor du auf das gesamte Seebecken schliesst.",
          },
          {
            question: "Gilt die Tabelle auch für Genf?",
            answer:
              "Nein. Der Berechnungspunkt ist Pully. Nutze eine Prognose für deinen Spot und die offiziellen Warnungen für den jeweiligen Abschnitt.",
          },
        ],
      },
      it: {
        title: "Vento sul lago di Ginevra: misure in diretta e previsioni",
        description:
          "Confronta St-Prex, Pully e Bouveret sul Lemano. Trova spot, webcam vicino alla tua riva e informazioni locali dal Petit-Lac all’Alto Lago.",
        place: "Lago di Ginevra / Lemano",
        coverAlt:
          "Il lago di Ginevra e le Alpi svizzere visti dalle alture della Riviera",
        content: `## Scegliere prima il settore del Lemano
Il lago di Ginevra, chiamato anche Lemano o Lac Léman, non si riassume in un solo valore del vento. Individua prima il settore dell’uscita: Petit-Lac, riva vodese, riva francese o Alto Lago. St-Prex, Pully e Bouveret sono punti di confronto nel bacino; nessuna stazione descrive da sola tutta la superficie del lago.

## Leggere insieme St-Prex, Pully e Bouveret
St-Prex si trova a ovest di Losanna, Pully vicino alla città e Bouveret all’estremità orientale del lago. Controlla orario, direzione e raffiche prima di confrontare i numeri. Un vento più forte a Bouveret non significa che sia già arrivato a Morges. Consulta gli storici per distinguere una tendenza da un picco isolato.

## Bise, sud-ovest ed effetti locali
La bise e il vento da sud-ovest fanno parte dei regimi del Lemano. Il rilievo e le brezze locali possono modificare le condizioni da un settore all’altro. Le fonti di MeteoSvizzera e dell’Association pour la sauvegarde du Léman approfondiscono questi meccanismi. In Openwind, confronta la direzione prevista con le osservazioni recenti e con l’evoluzione delle raffiche.

## Dalle previsioni allo spot
La tabella della guida è calcolata per Pully, presso Losanna. Usa le schede di Boiron, Corseaux, Promenthoux o Excenevex per le informazioni e le previsioni del luogo interessato. Una previsione favorevole non conferma l’accessibilità, l’assenza di ostacoli o il permesso di entrare in acqua.

## Verificare immagini, allerte e accessi
Le webcam intorno al luogo scelto possono mostrare visibilità e aspetto dell’acqua. Controlla sempre l’ora dell’immagine. Consulta anche le allerte ufficiali e le regole specifiche della riva e dell’attività. Le informazioni di Ginevra riguardano quel settore e non si applicano automaticamente all’intero lago.`,
        faq: [
          {
            question: "Dove vedere il vento in diretta sul lago di Ginevra?",
            answer:
              "La guida confronta le osservazioni disponibili di St-Prex, Pully e Bouveret. La mappa Openwind permette di esplorare altre stazioni. Ogni valore indica fonte e ora della misura.",
          },
          {
            question:
              "Lemano, lago di Ginevra e Genfersee sono lo stesso lago?",
            answer:
              "Sì. Anche Lac Léman e Lake Geneva indicano lo stesso lago. La ricerca Openwind riconosce queste varianti e apre la guida nella lingua disponibile.",
          },
          {
            question: "Perché le misure cambiano tra Losanna e l’Alto Lago?",
            answer:
              "Le stazioni hanno posizioni ed esposizioni differenti e talvolta orari diversi. Confronta direzioni e storici prima di dedurre una tendenza per tutto il bacino.",
          },
          {
            question: "La tabella vale anche per Ginevra?",
            answer:
              "No. Il punto di calcolo è Pully. Consulta una previsione centrata sul tuo spot e le allerte ufficiali del settore.",
          },
        ],
      },
    },
  },
];
