import type { LocalGuide } from "../local-guides";

export const LAC_DE_BRIENZ_GUIDE: LocalGuide = {
  slug: "lac-de-brienz",
  region: "Bern / Berne · Berner Oberland",
  aliases: [
    "Brienz",
    "Brienzersee",
    "Lac de Brienz",
    "Lago di Brienz",
    "Lake Brienz",
    "Bönigen",
    "Boenigen",
    "Iseltwald",
    "Ringgenberg",
    "Interlaken Ost",
  ],
  coordinates: { lat: 46.74072076749499, lng: 8.060863724161461 },
  forecastPlace: "Brienz",
  coverImage: "/images/guides/brienz.jpg",
  coverCredit: {
    author: "Carsten Steger",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_image_of_Lake_Brienz_(view_from_the_southwest).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T13:41:02Z",
  updatedAt: "2026-10-21T13:41:02Z",
  stations: [
    {
      id: "BRZ",
      name: "Brienz",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre à Brienz, vers l’extrémité est du lac ; pas une mesure sur l’eau ni à Iseltwald.",
        de: "Landstation in Brienz beim östlichen Seeende; keine Messung auf dem Wasser oder in Iseltwald.",
        it: "Stazione terrestre a Brienz, verso l’estremità orientale del lago; non misura sull’acqua né a Iseltwald.",
      },
    },
    {
      id: "INT",
      name: "Interlaken",
      source: "meteoswiss",
      context: {
        fr: "Station terrestre dans la plaine d’Interlaken, hors du lac de Brienz ; contexte régional à l’ouest, pas une mesure à la plage de Bönigen.",
        de: "Landstation in der Ebene von Interlaken ausserhalb des Brienzersees; regionaler Kontext im Westen, keine Messung am Strand von Bönigen.",
        it: "Stazione terrestre nella pianura di Interlaken, fuori dal lago di Brienz; contesto regionale a ovest, non una misura sulla spiaggia di Bönigen.",
      },
    },
  ],
  spotIds: [],
  sources: [
    {
      label: "Interlaken Tourismus — Brienzersee",
      url: "https://www.brienzersee.ch/erlebnisse/seen-wasserfaelle/brienzersee",
    },
    {
      label: "Interlaken Tourismus — Bönigen und Iseltwald",
      url: "https://www.brienzersee.ch/reiseziele/brienzersee/boenigen-iseltwald",
    },
    {
      label: "Kantonspolizei Bern — Verhalten auf Gewässern",
      url: "https://www.police.be.ch/de/start/themen/gewaesserpolizei/verhalten-auf-gewaessern.html",
    },
    {
      label: "Kantonspolizei Bern — Kitesurf, cartes des trois lacs",
      url: "https://www.police.be.ch/content/dam/police/dokumente/police-be-ch/d/seepolizei/kite-surfen_de_fr.pdf",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Brienz : balises, prévisions et webcams",
      description:
        "Comparez Brienz et Interlaken pour préparer votre sortie : observations datées, prévisions à Brienz, webcams et repères pour Bönigen et Iseltwald.",
      place: "Lac de Brienz / Brienzersee",
      coverAlt:
        "Vue aérienne du lac de Brienz depuis le sud-ouest, avec Bönigen et les montagnes entourant l’eau turquoise",
      content: `## Brienz, Bönigen ou Iseltwald : situer sa sortie
Le lac de Brienz s’étend entre les environs d’Interlaken et Brienz, dans l’Oberland bernois. Pour choisir vos repères, distinguez l’extrémité de Bönigen à l’ouest, le secteur de Brienz à l’est et les rives vers Iseltwald ou Ringgenberg. Les reliefs qui encadrent le lac limitent les vues et peuvent modifier l’exposition locale ; une image d’une baie ne montre pas la surface entière.

## Lire deux observations terrestres
La balise Brienz mesure à terre près de l’extrémité est. Interlaken apporte un contexte depuis la plaine à l’ouest, hors du lac. Ni l’une ni l’autre ne mesure à la plage de Bönigen ou sur l’eau devant Iseltwald. Comparez direction, rafales et heures proches avant de rapprocher les valeurs. Une différence entre stations aide à situer les contextes, sans donner une moyenne mesurée sur le lac.

## Prévision à Brienz et comparaison avec Thoune
Le tableau est calculé aux coordonnées terrestres de Brienz. Il suit l’évolution prévue à ce point et ne représente pas tous les secteurs du Brienzersee. Pour comparer les deux lacs de la région d’Interlaken, ouvrez aussi le [guide du lac de Thoune](/fr/vent-en-direct/lac-de-thoune) : ses stations et son point de prévision sont distincts. Une sortie prévue sur l’un ne décrit pas les conditions de l’autre.

## Webcams et activités autour du lac
Les pages d’Interlaken Tourisme présentent le lac, Bönigen et Iseltwald ainsi que des activités sur l’eau. Vérifiez le lieu exact, la saison et les disponibilités auprès de l’opérateur. Sur la carte des webcams, cherchez une vue proche de votre rive et contrôlez l’heure de l’image ; une belle couleur d’eau ne renseigne pas les rafales actuelles.

## Vérifier les secteurs de navigation
La Police cantonale bernoise publie les règles de comportement sur les eaux et une carte des secteurs de kitesurf pour les trois lacs. Sélectionnez bien le lac de Brienz dans le document. Vérifiez les zones de baignade, ports, espaces protégés et la signalisation avant de choisir un accès.`,
      faq: [
        {
          question: "Où voir le vent en direct au lac de Brienz ?",
          answer:
            "Les cartes Brienz et Interlaken affichent les observations disponibles avec leur source et leur heure. Les deux stations sont terrestres et représentent des contextes différents aux environs des deux extrémités.",
        },
        {
          question: "À quel lieu correspond la prévision du Brienzersee ?",
          answer:
            "La prévision du guide est calculée au point terrestre de Brienz, affiché sous les observations. Elle ne constitue pas une prévision propre à Bönigen, Iseltwald ou à toutes les rives.",
        },
        {
          question:
            "Les conditions d’Interlaken sont-elles celles du lac de Thoune ?",
          answer:
            "La station Interlaken fournit un contexte terrestre régional. Le lac de Brienz et celui de Thoune restent deux plans d’eau distincts ; leurs guides indiquent des points de prévision et des observations différents.",
        },
        {
          question: "Où vérifier les accès et secteurs de kitesurf ?",
          answer:
            "Consultez les informations de la Police cantonale bernoise et la carte officielle en choisissant le panneau du lac de Brienz. Complétez-les par les avis actuels et les indications sur place.",
        },
      ],
    },
    de: {
      title: "Wind am Brienzersee: Messstationen, Prognose und Webcams",
      description:
        "Vergleiche Brienz und Interlaken für deinen Ausflug: datierte Beobachtungen, Prognose für Brienz, Webcams und Orientierung für Bönigen und Iseltwald.",
      place: "Brienzersee / Brienz",
      coverAlt:
        "Luftaufnahme des Brienzersees von Südwesten mit Bönigen und den Bergen um das türkisfarbene Wasser",
      content: `## Brienz, Bönigen oder Iseltwald: den Abschnitt wählen
Der Brienzersee erstreckt sich zwischen der Umgebung von Interlaken und Brienz im Berner Oberland. Unterscheide für deine Orientierung Bönigen am westlichen Ende, Brienz im Osten und die Ufer bei Iseltwald oder Ringgenberg. Die umliegenden Berge begrenzen den Blick und können die lokale Exposition verändern; ein Bild einer Bucht zeigt nicht die gesamte Wasserfläche.

## Zwei Landbeobachtungen einordnen
Die Station Brienz misst an Land beim östlichen Seeende. Interlaken liefert Kontext aus der Ebene im Westen ausserhalb des Sees. Keine der beiden misst am Strand von Bönigen oder auf dem Wasser vor Iseltwald. Vergleiche Richtung, Böen und zeitnahe Werte. Unterschiede helfen beim Einordnen der Standorte, ergeben jedoch keinen gemessenen Seemittelwert.

## Prognose Brienz und Vergleich mit dem Thunersee
Die Tabelle wird für die Landkoordinaten von Brienz berechnet. Sie zeigt die erwartete Entwicklung an diesem Punkt und nicht für sämtliche Abschnitte. Öffne zum Vergleich der beiden Seen in der Region Interlaken auch den [Thunersee-Guide](/de/vent-en-direct/lac-de-thoune): Seine Stationen und sein Prognosepunkt sind eigenständig. Ein geplanter Ausflug auf einem See beschreibt nicht die Bedingungen auf dem anderen.

## Webcams und Aktivitäten rund um den See
Interlaken Tourismus stellt den See, Bönigen und Iseltwald sowie Aktivitäten auf dem Wasser vor. Kläre genauen Treffpunkt, Saison und Verfügbarkeit beim Anbieter. Suche auf der Webcam-Karte eine Ansicht nahe deinem Ufer und prüfe den Bildzeitpunkt; eine schöne Wasserfarbe sagt nichts über aktuelle Böen aus.

## Schifffahrtsbereiche prüfen
Die Kantonspolizei Bern veröffentlicht Verhaltensregeln auf Gewässern und eine Kitesurfkarte für die drei Seen. Wähle im Dokument den Brienzersee. Prüfe Badezonen, Häfen, Schutzbereiche und die örtliche Beschilderung, bevor du einen Zugang auswählst.`,
      faq: [
        {
          question: "Wo finde ich Live-Wind am Brienzersee?",
          answer:
            "Die Karten Brienz und Interlaken zeigen verfügbare Beobachtungen mit Quelle und Zeitpunkt. Beide Stationen liegen an Land und liefern unterschiedliche Kontexte nahe den beiden Seeenden.",
        },
        {
          question: "Für welchen Ort gilt die Brienzersee-Prognose?",
          answer:
            "Die Prognose wird für den unter den Beobachtungen genannten Landpunkt Brienz berechnet. Sie ist keine eigene Vorhersage für Bönigen, Iseltwald oder alle Ufer.",
        },
        {
          question: "Beschreibt Interlaken die Bedingungen am Thunersee?",
          answer:
            "Die Station Interlaken liefert regionalen Landkontext. Brienzersee und Thunersee bleiben unterschiedliche Gewässer; ihre Guides nennen eigene Prognosepunkte und Beobachtungen.",
        },
        {
          question: "Wo prüfe ich Zugänge und Kitesurfbereiche?",
          answer:
            "Konsultiere die Kantonspolizei Bern und wähle auf der offiziellen Karte den Brienzersee. Ergänze diese Informationen durch aktuelle Mitteilungen und die örtlichen Hinweise.",
        },
      ],
    },
    it: {
      title: "Vento al lago di Brienz: stazioni, previsioni e webcam",
      description:
        "Confronta Brienz e Interlaken per preparare l’uscita: osservazioni datate, previsioni a Brienz, webcam e riferimenti per Bönigen e Iseltwald.",
      place: "Lago di Brienz / Brienzersee",
      coverAlt:
        "Veduta aerea del lago di Brienz da sud-ovest con Bönigen e le montagne intorno all’acqua turchese",
      content: `## Brienz, Bönigen o Iseltwald: individuare il settore
Il lago di Brienz si estende fra i dintorni di Interlaken e Brienz, nell’Oberland bernese. Per scegliere i riferimenti distingui Bönigen all’estremità ovest, Brienz a est e le rive verso Iseltwald o Ringgenberg. I rilievi circostanti limitano la vista e possono modificare l’esposizione locale; l’immagine di una baia non mostra tutta la superficie.

## Leggere due osservazioni terrestri
La stazione Brienz misura sulla terraferma vicino all’estremità est. Interlaken offre un contesto dalla pianura a ovest, fuori dal lago. Nessuna delle due misura sulla spiaggia di Bönigen o sull’acqua davanti a Iseltwald. Confronta direzione, raffiche e orari vicini. Le differenze aiutano a inquadrare i luoghi, senza produrre una media misurata sul lago.

## Previsioni a Brienz e confronto con Thun
La tabella è calcolata alle coordinate terrestri di Brienz. Segue l’evoluzione prevista in quel punto, senza rappresentare ogni settore del Brienzersee. Per confrontare i due laghi della regione di Interlaken apri anche la [guida del lago di Thun](/it/vent-en-direct/lac-de-thoune): stazioni e punto di previsione sono distinti. Un’uscita prevista su un lago non descrive le condizioni dell’altro.

## Webcam e attività intorno al lago
Interlaken Turismo presenta il lago, Bönigen e Iseltwald e diverse attività sull’acqua. Verifica luogo preciso, stagione e disponibilità presso l’operatore. Sulla mappa delle webcam cerca una vista vicina alla tua riva e controlla l’ora dell’immagine; un bel colore dell’acqua non informa sulle raffiche attuali.

## Verificare i settori di navigazione
La Polizia cantonale bernese pubblica regole di comportamento sulle acque e una mappa dei settori di kitesurf per i tre laghi. Seleziona nel documento il lago di Brienz. Verifica zone di balneazione, porti, aree protette e segnaletica prima di scegliere un accesso.`,
      faq: [
        {
          question: "Dove vedere il vento in diretta al lago di Brienz?",
          answer:
            "Le schede Brienz e Interlaken mostrano le osservazioni disponibili con fonte e ora. Entrambe le stazioni sono terrestri e rappresentano contesti diversi vicino alle due estremità.",
        },
        {
          question: "A quale luogo corrisponde la previsione del Brienzersee?",
          answer:
            "La previsione è calcolata nel punto terrestre di Brienz indicato sotto le osservazioni. Non è una previsione specifica per Bönigen, Iseltwald o tutte le rive.",
        },
        {
          question: "Le condizioni di Interlaken sono quelle del lago di Thun?",
          answer:
            "La stazione Interlaken offre un contesto terrestre regionale. I laghi di Brienz e Thun restano distinti; le loro guide indicano punti di previsione e osservazioni diversi.",
        },
        {
          question: "Dove verificare accessi e settori di kitesurf?",
          answer:
            "Consulta la Polizia cantonale bernese e seleziona il lago di Brienz sulla mappa ufficiale. Completa queste informazioni con gli avvisi attuali e le indicazioni sul posto.",
        },
      ],
    },
  },
};
