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
      "Cudrefin",
      "St-Blaise",
    ],
    coordinates: {
      lat: 47.0001,
      lng: 6.9533,
    },
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
    updatedAt: "2026-10-26T00:00:00Z",
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
      "cmnr46jjd0000i5f6q521m974",
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
      {
        label: "Kitesurf Club Schweiz · Saint-Blaise et Estavayer-le-Lac",
        url: "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
      },
      {
        label: "Let’s Kite · Cudrefin · EN",
        url: "https://letskite.ch/en/spots/82/kitesurf/cudrefin",
      },
      {
        label: "État de Fribourg · arrêté 785.21 et cartes · FR",
        url: "https://bdlf.fr.ch/api/fr/versions/8441/pdf_file_with_annexes",
      },
    ],
    translations: {
      fr: {
        title: "Vent au lac de Neuchâtel : balises en direct et prévisions",
        description:
          "Comparez les balises régionales et les départs de Saint-Blaise, Cudrefin et Estavayer au lac de Neuchâtel : prévisions, accès et sources locales.",
        place: "Lac de Neuchâtel",
        coverAlt: "Le port de Portalban et le lac de Neuchâtel",
        content:
          "## Choisir sa rive avant de lire le vent\nLe lac de Neuchâtel ne se résume pas à une vitesse de vent. Saint-Blaise se situe au nord-est, Cudrefin près du port sur la rive sud-est, et Estavayer sur la rive sud. Les départs et le point de prévision diffèrent : choisissez d’abord votre lieu, puis comparez des données prises à des heures proches.\n\n## Quelles balises consulter ?\n[Neuchâtel](/fr/stations/NEU) fournit un repère proche de la rive nord. [Payerne](/fr/stations/PAY) mesure dans la plaine de la Broye, à l’intérieur des terres. [Cressier NE](/fr/stations/CRM) complète le contexte régional au nord-est. Aucune de ces trois stations ne mesure directement dans chacun des départs présentés.\n\nPour interpréter un écart, regardez la date, la direction, le vent moyen et les rafales. Ne faites pas la moyenne de plusieurs balises pour fabriquer une mesure sur le lac. Le tableau de ce guide est calculé au point de Neuchâtel : les fiches des spots donnent accès à leurs propres prévisions.\n\n## Saint-Blaise : préparer un départ par sud-ouest\nLa fiche de [Saint-Blaise](/fr/spots/cmnr31n570007ijf6q33aez75) rassemble le départ, la prévision et les informations documentées. Le secteur retenu est le sud-ouest. Une Bise ailleurs sur le lac ne valide pas ce départ. Comparez la tendance régionale, puis vérifiez le dégagement près du port.\n\n## Cudrefin : distinguer plage et départ\nLa fiche de [Cudrefin](/fr/spots/cmnr46jjd0000i5f6q521m974) distingue les repères d’arrivée du départ de kitesurf. La description locale signale un espace très contraint, destiné aux experts. Un marqueur Openwind ou une page touristique de plage ne constitue pas un plan de mise à l’eau. Vérifiez le panneau et le couloir avant d’installer les lignes.\n\n## Estavayer : ouvrir la prévision du bon point\nÀ [Estavayer-le-Lac](/fr/spots/cmnr307uv0000ijf6j8zqjyis), le profil documenté considère le nord-est et le sud-ouest. Consultez la prévision de cette fiche, distincte de celle de Neuchâtel. L’annexe cantonale contient une carte du secteur d’Estavayer : ouvrez-la pour situer les exclusions, puis contrôlez les indications locales.\n\n## Webcams et zones protégées\nUne webcam complète les chiffres seulement si son cadrage concerne votre rive et si son image est récente. La carte de la Grande Cariçaie aide à repérer les secteurs réglementés. Consultez les sources du canton concerné : Neuchâtel, Vaud et Fribourg ne se remplacent pas mutuellement. L’ouverture d’un accès et les conditions du jour restent à vérifier près du départ.",
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
        comparison: {
          title: "Trois départs, trois lectures du lac",
          intro:
            "Ces repères décrivent les fiches locales, pas les conditions du jour. Ouvrez chaque spot pour sa prévision et vérifiez le départ sur place.",
          items: [
            {
              spotId: "cmnr31n570007ijf6q33aez75",
              wind: "Sud-ouest documenté",
              access:
                "Départ étroit près du port ; bonne maîtrise de la remontée au vent nécessaire.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
            {
              spotId: "cmnr46jjd0000i5f6q521m974",
              wind: "Départ expert, accès à vérifier",
              access:
                "La plage de baignade ne se confond pas avec le départ près du port.",
              sourceUrl: "https://letskite.ch/en/spots/82/kitesurf/cudrefin",
            },
            {
              spotId: "cmnr307uv0000ijf6j8zqjyis",
              wind: "Bise (NE) et sud-ouest documentés",
              access:
                "Secteur portuaire et réserves voisines : consulter la carte cantonale d’Estavayer.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
          ],
        },
        spotsIntro:
          "Ouvrez la fiche de votre départ pour sa prévision, les repères d’accès et les sources. Les fiches de Saint-Blaise, Cudrefin et Estavayer se complètent sans représenter toutes les rives.",
      },
      de: {
        title: "Wind am Neuenburgersee: Live-Messungen und Prognose",
        description:
          "Vergleiche regionale Windstationen und die Einstiege Saint-Blaise, Cudrefin und Estavayer am Neuenburgersee: Prognosen, Zugang und lokale Quellen.",
        place: "Neuenburgersee / Lac de Neuchâtel",
        coverAlt: "Der Hafen von Portalban am Neuenburgersee",
        content:
          "## Erst das Ufer wählen, dann den Wind lesen\nDer Neuenburgersee lässt sich nicht mit einer einzigen Windgeschwindigkeit beschreiben. Saint-Blaise liegt im Nordosten, Cudrefin beim Hafen am südöstlichen Ufer und Estavayer am Südufer. Einstiege und Prognosepunkte sind verschieden. Wähle zunächst deinen Ort und vergleiche danach zeitnahe Daten.\n\n## Welche Windstationen vergleichen?\n[Neuenburg](/de/stations/NEU) liefert einen Vergleichspunkt nahe dem Nordufer. [Payerne](/de/stations/PAY) misst in der Broye-Ebene im Landesinneren. [Cressier NE](/de/stations/CRM) ergänzt den regionalen Kontext im Nordosten. Keine dieser Stationen misst direkt an allen hier beschriebenen Einstiegen.\n\nPrüfe Messzeit, Richtung, Mittelwind und Böen, bevor du Unterschiede deutest. Ein Mittelwert mehrerer Stationen ergibt keine Messung auf dem See. Die Tabelle dieses Guides wird für Neuenburg berechnet; auf den Spot-Seiten findest du die jeweilige Prognose.\n\n## Saint-Blaise: einen Einstieg bei Südwest vorbereiten\nDie Seite [Saint-Blaise](/de/spots/cmnr31n570007ijf6q33aez75) verbindet Einstieg, Prognose und dokumentierte Hinweise. Berücksichtigt wird Südwest. Bise an einem anderen Ufer bestätigt diesen Einstieg nicht. Vergleiche den regionalen Verlauf und prüfe anschliessend den freien Raum beim Hafen.\n\n## Cudrefin: Badestrand und Einstieg unterscheiden\nDie Seite [Cudrefin](/de/spots/cmnr46jjd0000i5f6q521m974) trennt Anreisehinweise vom Kite-Einstieg. Die lokale Beschreibung nennt einen stark begrenzten Bereich für Experten. Ein Openwind-Kartenpunkt oder eine touristische Strandseite ist kein Einstiegsplan. Prüfe Tafel und Korridor vor dem Auslegen der Leinen.\n\n## Estavayer: die Prognose für den richtigen Punkt öffnen\nDas dokumentierte Profil von [Estavayer-le-Lac](/de/spots/cmnr307uv0000ijf6j8zqjyis) berücksichtigt Nordost und Südwest. Öffne die eigene Spot-Prognose, getrennt von Neuenburg. Der kantonale Anhang enthält eine Karte des Abschnitts Estavayer. Prüfe dort Ausschlussbereiche und anschliessend die örtlichen Hinweise.\n\n## Webcams und Schutzgebiete\nEine Webcam ergänzt die Zahlen nur, wenn sie deinen Uferabschnitt zeigt und das Bild aktuell ist. Die Karte der Grande Cariçaie hilft bei den geregelten Bereichen. Nutze die Quellen des zuständigen Kantons: Angaben aus Neuenburg, Waadt und Freiburg sind nicht austauschbar. Zugang und Tagesbedingungen prüfst du vor Ort.",
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
        comparison: {
          title: "Drei Einstiege, drei Perspektiven auf den See",
          intro:
            "Diese Hinweise beschreiben die lokalen Spot-Seiten, nicht die Bedingungen des Tages. Öffne die jeweilige Prognose und prüfe den Einstieg vor Ort.",
          items: [
            {
              spotId: "cmnr31n570007ijf6q33aez75",
              wind: "Südwest dokumentiert",
              access:
                "Enger Start beim Hafen; sicheres Höhelaufen erforderlich.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
            {
              spotId: "cmnr46jjd0000i5f6q521m974",
              wind: "Experten-Einstieg, Zugang prüfen",
              access:
                "Der Badestrand ist vom Kite-Einstieg beim Hafen zu unterscheiden.",
              sourceUrl: "https://letskite.ch/en/spots/82/kitesurf/cudrefin",
            },
            {
              spotId: "cmnr307uv0000ijf6j8zqjyis",
              wind: "Bise (NE) und Südwest dokumentiert",
              access:
                "Hafenbereich und benachbarte Reservate: kantonale Karte für Estavayer prüfen.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
          ],
        },
        spotsIntro:
          "Öffne deinen Einstieg für Prognose, Zugangshinweise und Quellen. Saint-Blaise, Cudrefin und Estavayer ergänzen sich, ohne alle Ufer zu beschreiben.",
      },
      it: {
        title: "Vento al lago di Neuchâtel: misure in diretta e previsioni",
        description:
          "Confronta stazioni regionali e accessi di Saint-Blaise, Cudrefin ed Estavayer al lago di Neuchâtel: previsioni, indicazioni locali e fonti.",
        place: "Lago di Neuchâtel",
        coverAlt: "Il porto di Portalban sul lago di Neuchâtel",
        content:
          "## Scegliere la riva prima di leggere il vento\nIl lago di Neuchâtel non si riassume in una sola velocità del vento. Saint-Blaise è a nord-est, Cudrefin presso il porto sulla riva sud-est ed Estavayer sulla riva sud. Accessi e punti di previsione sono diversi: scegli prima il luogo, poi confronta dati rilevati a orari vicini.\n\n## Quali stazioni consultare?\n[Neuchâtel](/it/stations/NEU) offre un riferimento vicino alla riva nord. [Payerne](/it/stations/PAY) misura nella pianura della Broye, nell’entroterra. [Cressier NE](/it/stations/CRM) completa il contesto regionale a nord-est. Nessuna delle tre stazioni misura direttamente in tutti gli accessi descritti.\n\nPer interpretare una differenza, controlla ora, direzione, vento medio e raffiche. La media di più stazioni non crea una misura sul lago. La tabella di questa guida è calcolata per Neuchâtel; le schede degli spot mostrano le rispettive previsioni.\n\n## Saint-Blaise: preparare una partenza con sud-ovest\nLa scheda di [Saint-Blaise](/it/spots/cmnr31n570007ijf6q33aez75) riunisce accesso, previsione e indicazioni documentate. Il settore considerato è il sud-ovest. La Bise su un’altra riva non conferma questa partenza. Confronta l’andamento regionale e verifica lo spazio presso il porto.\n\n## Cudrefin: distinguere spiaggia e partenza\nLa scheda di [Cudrefin](/it/spots/cmnr46jjd0000i5f6q521m974) distingue i riferimenti per l’arrivo dall’accesso kitesurf. La descrizione locale segnala uno spazio molto limitato per esperti. Un punto Openwind o una pagina turistica di spiaggia non è un piano di accesso all’acqua. Controlla cartello e corridoio prima di stendere le linee.\n\n## Estavayer: aprire la previsione del punto giusto\nIl profilo documentato di [Estavayer-le-Lac](/it/spots/cmnr307uv0000ijf6j8zqjyis) considera nord-est e sud-ovest. Consulta la previsione della scheda, distinta da quella di Neuchâtel. L’allegato cantonale contiene una carta del settore di Estavayer: individua le esclusioni e controlla poi le indicazioni locali.\n\n## Webcam e zone protette\nUna webcam completa i numeri solo se inquadra la tua riva e mostra un’immagine recente. La carta della Grande Cariçaie aiuta a individuare i settori regolamentati. Consulta le fonti del cantone competente: Neuchâtel, Vaud e Friburgo non sono intercambiabili. Accesso e condizioni del giorno vanno verificati sul posto.",
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
        comparison: {
          title: "Tre accessi, tre modi di leggere il lago",
          intro:
            "Questi riferimenti descrivono le schede locali, non le condizioni del giorno. Apri la previsione di ogni spot e verifica l’accesso sul posto.",
          items: [
            {
              spotId: "cmnr31n570007ijf6q33aez75",
              wind: "Sud-ovest documentato",
              access:
                "Partenza stretta presso il porto; necessaria una buona risalita al vento.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
            {
              spotId: "cmnr46jjd0000i5f6q521m974",
              wind: "Accesso per esperti, da verificare",
              access:
                "La spiaggia per la balneazione va distinta dalla partenza presso il porto.",
              sourceUrl: "https://letskite.ch/en/spots/82/kitesurf/cudrefin",
            },
            {
              spotId: "cmnr307uv0000ijf6j8zqjyis",
              wind: "Bise (NE) e sud-ovest documentati",
              access:
                "Zona portuale e riserve vicine: consultare la carta cantonale di Estavayer.",
              sourceUrl:
                "https://www.kitesurfclub.ch/de/?option=com_spotfinder&tmpl=component&view=spotfinder",
            },
          ],
        },
        spotsIntro:
          "Apri la scheda del tuo accesso per previsione, indicazioni e fonti. Saint-Blaise, Cudrefin ed Estavayer si completano senza rappresentare tutte le rive.",
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
