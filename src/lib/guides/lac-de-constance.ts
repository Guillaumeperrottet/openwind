import type { LocalGuide } from "../local-guides";

export const LAC_DE_CONSTANCE_GUIDE: LocalGuide = {
  slug: "lac-de-constance",
  region: "Thurgau · St. Gallen / Suisse orientale",
  aliases: [
    "Constance",
    "Bodensee",
    "Lac de Constance",
    "Lago di Costanza",
    "Lake Constance",
    "Obersee Bodensee",
    "Untersee",
    "Berlingen",
    "Eschlibach",
    "Güttingen",
    "Guettingen",
    "Altenrhein",
    "Steckborn",
    "Romanshorn",
    "Münsterlingen",
    "Muensterlingen",
    "Kreuzlingen",
  ],
  coordinates: { lat: 47.6017430854, lng: 9.2793998659 },
  forecastPlace: "Güttingen",
  coverImage: "/images/guides/constance.jpg",
  coverCredit: {
    author: "Gerd Eichmann",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Muensterlingen_to_Romanshorn-12-Bodensee-Zeppelin-2006-gje.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  publishedAt: "2026-10-21T12:57:29Z",
  updatedAt: "2026-10-22T12:00:00Z",
  stations: [
    {
      id: "GUT",
      name: "Güttingen",
      source: "meteoswiss",
      context: {
        fr: "Repère terrestre proche de la rive thurgovienne de l’Obersee ; pas une mesure au large.",
        de: "Landstation nahe dem Thurgauer Oberseeufer; keine Messung auf dem offenen See.",
        it: "Riferimento a terra vicino alla sponda turgoviese dell’Obersee; non misura al largo.",
      },
    },
    {
      id: "ARH",
      name: "Altenrhein",
      source: "meteoswiss",
      context: {
        fr: "Contexte du secteur oriental, à Altenrhein ; l’exposition diffère de celle de Güttingen.",
        de: "Vergleich im östlichen Bereich bei Altenrhein; andere Exposition als in Güttingen.",
        it: "Contesto del settore orientale ad Altenrhein; esposizione diversa da Güttingen.",
      },
    },
    {
      id: "STK",
      name: "Steckborn",
      source: "meteoswiss",
      context: {
        fr: "Station dans le secteur de l’Untersee, distinct de l’Obersee ; ne représente pas tout le Bodensee.",
        de: "Station am Untersee, einem anderen Becken als dem Obersee; nicht für den gesamten Bodensee repräsentativ.",
        it: "Stazione nel settore dell’Untersee, distinto dall’Obersee; non rappresenta tutto il lago di Costanza.",
      },
    },
  ],
  spotIds: ["swiss-kite-berlingen-eschlibach"],
  sources: [
    {
      label: "Kantonspolizei Thurgau — décision et carte de kitesurf",
      url: "https://kapo.tg.ch/public/upload/assets/95580/Merkblatt%20Kitesurfen%202020.pdf",
    },
    {
      label: "Bodensee Tourismus — rive suisse et sports nautiques",
      url: "https://www.bodensee.eu/presse/ibt/bmt2022/thurgau/mm_wasseroase-bodensee_medientage_2022.pdf",
    },
    {
      label: "Landratsamt Bodenseekreis — Kitesurfen, informations par pays",
      url: "https://www.bodenseekreis.de/verkehr-wirtschaft/schifffahrt/kitesurfen/",
    },
    {
      label: "Kanton Thurgau — Kantonspolizei et police du lac",
      url: "https://schalter.tg.ch/Alle-Dienstleistungen/Schutz---Rettung/Kantonspolizei",
    },
  ],
  translations: {
    fr: {
      title: "Vent au lac de Constance : balises et prévisions côté suisse",
      description:
        "Comparez Güttingen, Altenrhein et Steckborn pour préparer une sortie côté suisse du Bodensee : observations datées, prévisions, webcams et sources locales.",
      place: "Lac de Constance / Bodensee",
      coverAlt:
        "Vue du lac de Constance entre Münsterlingen et Romanshorn, avec un dirigeable au-dessus de l’eau",
      content: `## Choisir un secteur sur la rive suisse du Bodensee
Ce guide aborde le lac de Constance depuis ses rives suisses. Commencez par situer votre destination : les secteurs de Güttingen et Romanshorn sur l’Obersee, Altenrhein plus à l’est et Steckborn sur l’Untersee ne sont pas interchangeables. Pour préparer une sortie, une lecture par bassin est plus utile qu’une unique valeur intitulée « vent au Bodensee ».

## Trois stations pour comparer les secteurs
Güttingen est un repère terrestre proche de la rive thurgovienne. Altenrhein renseigne un autre secteur à l’est. Steckborn apporte une observation dans le bassin de l’Untersee. Consultez leur heure et leur historique avant de comparer les directions et les rafales. Un désaccord entre ces capteurs ne permet pas de choisir simplement la valeur la plus favorable : les lieux et les expositions diffèrent.

## La prévision affichée correspond à Güttingen
Le tableau est calculé aux coordonnées de Güttingen, à terre. Il ne constitue ni une mesure au large, ni une prévision pour toutes les rives du lac. Les cartes de balises présentent séparément les observations disponibles. Si votre départ se situe vers l’Untersee ou Altenrhein, ouvrez la carte pour examiner ce secteur avant de vous déplacer.

## Compléter la lecture avec les webcams
Cherchez une image proche de votre lieu de départ et vérifiez sa date ainsi que son orientation. Une vue générale de la rive opposée ne suffit pas à décrire votre zone de navigation. Comparez les images aux observations prises à une heure proche ; des captures d’heures différentes peuvent donner une impression trompeuse d’évolution du vent.

## Vérifier les règles du pays et du secteur
Le Bodensee est partagé entre plusieurs pays et autorités. Les informations du Landratsamt Bodenseekreis distinguent les situations nationales ; ne transposez pas une autorisation allemande à un départ suisse. Vérifiez les zones, les périodes et les accès applicables auprès des autorités et acteurs locaux. Le [profil Berlingen–Eschlibach](https://www.openwind.ch/fr/spots/swiss-kite-berlingen-eschlibach) décrit un départ précis de l’Untersee. La décision thurgovienne publiée ouvre les zones désignées du 15 mars au 15 novembre inclus ; la baie à l’ouest de Mannenbach reste exclue. Le planificateur applique la fermeture hivernale du 16 novembre au 14 mars.`,
      faq: [
        {
          question:
            "Quelles balises consulter côté suisse du lac de Constance ?",
          answer:
            "Le guide réunit Güttingen, Altenrhein et Steckborn avec leur réseau et l’heure de mesure. Elles représentent des secteurs différents ; Steckborn se trouve dans le bassin de l’Untersee.",
        },
        {
          question: "La prévision couvre-t-elle tout le Bodensee ?",
          answer:
            "Non. Le point du tableau est Güttingen, à terre. Pour une autre rive ou un autre bassin, examinez les données et images proches de votre destination.",
        },
        {
          question:
            "Les règles de kitesurf sont-elles identiques tout autour du lac ?",
          answer:
            "Ne le supposez pas. Les sources distinguent les pays et les zones. Vérifiez les informations de l’autorité compétente pour le secteur de départ et de navigation.",
        },
        {
          question: "Où trouver les webcams du lac de Constance ?",
          answer:
            "Le lien « Webcams autour de ce lieu » ouvre une recherche autour de Güttingen. Déplacez la recherche sur la carte pour une autre destination et contrôlez l’heure des images disponibles.",
        },
      ],
    },
    de: {
      title: "Wind am Bodensee: Messstationen und Prognose am Schweizer Ufer",
      description:
        "Vergleiche Güttingen, Altenrhein und Steckborn für einen Ausflug am Schweizer Bodenseeufer: datierte Messungen, Prognose, Webcams und lokale Quellen.",
      place: "Bodensee / Schweizer Ufer",
      coverAlt:
        "Blick auf den Bodensee zwischen Münsterlingen und Romanshorn mit einem Luftschiff über dem Wasser",
      content: `## Einen Abschnitt am Schweizer Bodenseeufer wählen
Dieser Guide betrachtet den Bodensee von seinen Schweizer Ufern aus. Verorte zuerst dein Ziel: Güttingen und Romanshorn am Obersee, Altenrhein weiter östlich und Steckborn am Untersee sind unterschiedliche Ausgangspunkte. Für die Planung ist ein Vergleich nach Becken hilfreicher als ein einzelner Wert mit der Bezeichnung «Wind am Bodensee».

## Drei Stationen für den regionalen Vergleich
Güttingen ist eine Landstation nahe dem Thurgauer Ufer. Altenrhein beschreibt einen anderen Bereich im Osten. Steckborn liefert eine Beobachtung im Unterseebecken. Prüfe Messzeit und Verlauf, bevor du Richtungen und Böen vergleichst. Bei Abweichungen einfach den günstigsten Wert auszuwählen, führt nicht weiter: Standorte und Exposition unterscheiden sich.

## Die angezeigte Prognose gilt für Güttingen
Die Tabelle wird für die Koordinaten von Güttingen an Land berechnet. Sie ist weder eine Messung auf dem offenen See noch eine Prognose für sämtliche Ufer. Die Stationskarten zeigen die verfügbaren Beobachtungen getrennt davon. Liegt dein Start am Untersee oder bei Altenrhein, öffne vor der Anreise die Karte für diesen Abschnitt.

## Webcams als ergänzende Beobachtung
Suche ein Bild nahe deinem Ausgangspunkt und prüfe Aufnahmezeit und Blickrichtung. Ein Überblick über das gegenüberliegende Ufer beschreibt deinen Fahrbereich nicht vollständig. Vergleiche Bilder mit zeitnahen Stationswerten; Aufnahmen zu unterschiedlichen Zeiten können einen irreführenden Eindruck der Windentwicklung vermitteln.

## Regeln nach Land und Abschnitt prüfen
Am Bodensee sind mehrere Länder und Behörden zuständig. Die Informationen des Landratsamts Bodenseekreis unterscheiden die nationalen Situationen; eine deutsche Bewilligung lässt sich nicht auf einen Schweizer Einstieg übertragen. Prüfe Zonen, Zeiträume und Zugänge bei den zuständigen Behörden und örtlichen Anbietern. Das [Profil Berlingen–Eschlibach](https://www.openwind.ch/de/spots/swiss-kite-berlingen-eschlibach) beschreibt einen konkreten Untersee-Einstieg. Der veröffentlichte Thurgauer Entscheid öffnet die bezeichneten Zonen vom 15. März bis 15. November einschliesslich; die Bucht westlich von Mannenbach bleibt ausgeschlossen. Der Planer berücksichtigt die Wintersperre vom 16. November bis 14. März.`,
      faq: [
        {
          question: "Welche Stationen helfen am Schweizer Bodenseeufer?",
          answer:
            "Der Guide zeigt Güttingen, Altenrhein und Steckborn mit Netzwerk und Messzeit. Sie beschreiben verschiedene Abschnitte; Steckborn liegt im Unterseebecken.",
        },
        {
          question: "Gilt die Prognose für den ganzen Bodensee?",
          answer:
            "Nein. Der Tabellenpunkt ist Güttingen an Land. Prüfe für ein anderes Ufer oder Becken die Daten und Bilder nahe deinem Ziel.",
        },
        {
          question: "Gelten rund um den See dieselben Kitesurf-Regeln?",
          answer:
            "Davon solltest du nicht ausgehen. Die Quellen unterscheiden Länder und Zonen. Prüfe die zuständige Behörde für deinen Einstiegs- und Fahrbereich.",
        },
        {
          question: "Wo finde ich Bodensee-Webcams?",
          answer:
            "Der Webcam-Link öffnet eine Suche rund um Güttingen. Verschiebe die Suche auf der Karte für ein anderes Ziel und beachte die Aufnahmezeit verfügbarer Bilder.",
        },
      ],
    },
    it: {
      title:
        "Vento al lago di Costanza: stazioni e previsioni sulla riva svizzera",
      description:
        "Confronta Güttingen, Altenrhein e Steckborn per un’uscita sul Bodensee svizzero: osservazioni datate, previsioni, webcam e fonti locali.",
      place: "Lago di Costanza / Riva svizzera",
      coverAlt:
        "Vista sul lago di Costanza tra Münsterlingen e Romanshorn con un dirigibile sopra l’acqua",
      content: `## Scegliere un settore sulla riva svizzera
Questa guida affronta il lago di Costanza, o Bodensee, dalle sue rive svizzere. Individua prima la destinazione: Güttingen e Romanshorn sull’Obersee, Altenrhein più a est e Steckborn sull’Untersee sono riferimenti diversi. Per preparare l’uscita, una lettura per bacino è più utile di un unico valore chiamato «vento sul Bodensee».

## Tre stazioni per confrontare i settori
Güttingen è un riferimento a terra vicino alla riva turgoviese. Altenrhein descrive un altro settore a est. Steckborn offre un’osservazione nel bacino dell’Untersee. Consulta orari e storici prima di confrontare direzioni e raffiche. Se i sensori divergono, non scegliere semplicemente il valore più favorevole: posizioni ed esposizioni sono differenti.

## Le previsioni mostrate corrispondono a Güttingen
La tabella è calcolata alle coordinate di Güttingen, a terra. Non è una misura al largo né una previsione per tutte le rive. Le schede delle stazioni mostrano separatamente le osservazioni disponibili. Se parti dall’Untersee o da Altenrhein, apri la mappa per esaminare quel settore prima di spostarti.

## Integrare la lettura con le webcam
Cerca un’immagine vicina al punto di partenza e controllane data e orientamento. Una panoramica della riva opposta non basta a descrivere la tua zona sull’acqua. Confronta immagini e misure rilevate in orari vicini: riprese di momenti diversi possono dare un’impressione ingannevole dell’evoluzione del vento.

## Verificare regole del paese e del settore
Il Bodensee è condiviso tra più paesi e autorità. Le informazioni del Landratsamt Bodenseekreis distinguono le situazioni nazionali; non trasferire un’autorizzazione tedesca a una partenza svizzera. Verifica zone, periodi e accessi applicabili presso autorità e operatori locali. Il [profilo Berlingen–Eschlibach](https://www.openwind.ch/it/spots/swiss-kite-berlingen-eschlibach) descrive un accesso preciso all’Untersee. La decisione turgoviese pubblicata apre le zone designate dal 15 marzo al 15 novembre inclusi; resta esclusa la baia a ovest di Mannenbach. Il pianificatore applica la chiusura invernale dal 16 novembre al 14 marzo.`,
      faq: [
        {
          question: "Quali stazioni consultare sul lago di Costanza svizzero?",
          answer:
            "La guida riunisce Güttingen, Altenrhein e Steckborn con rete e ora della misura. Rappresentano settori diversi; Steckborn si trova nel bacino dell’Untersee.",
        },
        {
          question: "Le previsioni coprono tutto il Bodensee?",
          answer:
            "No. Il punto della tabella è Güttingen, a terra. Per un’altra riva o un altro bacino consulta dati e immagini vicino alla destinazione.",
        },
        {
          question: "Le regole del kitesurf sono uguali lungo tutto il lago?",
          answer:
            "Non darlo per scontato. Le fonti distinguono paesi e zone. Verifica le informazioni dell’autorità competente per il punto di partenza e il settore di navigazione.",
        },
        {
          question: "Dove trovare le webcam del lago di Costanza?",
          answer:
            "Il collegamento alle webcam apre una ricerca intorno a Güttingen. Sposta la ricerca sulla mappa per un’altra destinazione e controlla l’ora delle immagini disponibili.",
        },
      ],
    },
  },
};
