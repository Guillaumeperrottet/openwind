-- Publish an editable Carnet article introducing the Openwind trip planner.
INSERT INTO "Article" (
  "id",
  "kind",
  "slug",
  "title",
  "excerpt",
  "content",
  "coverImage",
  "coverAlt",
  "category",
  "location",
  "readTime",
  "status",
  "seoTitle",
  "seoDescription",
  "sources",
  "authorName",
  "linkedSpotIds",
  "linkedStationIds",
  "relatedArticleIds",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  'article-planifier-sortie-openwind-2026',
  'EDITORIAL',
  'planifier-sortie-kite-parapente-openwind',
  'Planifier une sortie avec Openwind : trouver le bon spot au bon moment',
  'Destination, dates, rayon, sport et score météo : voici comment utiliser le planificateur Openwind pour comparer les spots et préparer une sortie sans multiplier les onglets.',
  $article$
> **L’idée en une phrase :** tu indiques où et quand tu veux pratiquer, puis Openwind compare les spots et leurs conditions pour faire ressortir les créneaux les plus intéressants.

[Ouvrir le planificateur Openwind](https://www.openwind.ch/fr/plan)

Préparer une sortie de kite ou de parapente demande souvent de passer d’une carte à une prévision, puis d’une fiche de spot à une autre. Le planificateur Openwind réunit ces étapes dans une seule recherche. Il ne choisit pas à ta place : il réduit le champ des possibles et t’aide à savoir où regarder en premier.

## 1. Choisir une destination — ou partir sans destination

La destination est facultative. Tu peux rechercher une ville, utiliser ta position actuelle ou placer directement un point sur la carte.

Avec une destination, Openwind calcule la distance jusqu’aux spots et limite la recherche au rayon choisi. Sans destination, il propose une sélection de spots à comparer plus largement. C’est pratique lorsque la qualité des conditions compte davantage que le nombre de kilomètres.

### Quel rayon choisir ?

- **50 km** pour une sortie très locale.
- **100 à 150 km** pour garder plusieurs options réalistes sur une journée.
- **300 à 500 km** pour un week-end ou une recherche plus ouverte.

Le rayon est un filtre de découverte, pas une estimation du temps de trajet. Avant de partir, vérifie toujours l’itinéraire, l’accès au spot et les éventuelles restrictions locales.

## 2. Définir les dates qui comptent vraiment

Sélectionne un jour précis ou une période. Pour une recherche sur plusieurs jours, Openwind compare chaque journée et met en avant le meilleur créneau trouvé pour chaque spot.

La nature des données change selon l’échéance :

- **jusqu’à 16 jours**, le planificateur utilise des prévisions météorologiques ;
- **au-delà**, il affiche une tendance construite à partir d’archives mensuelles.

Cette distinction est essentielle. Une tendance historique indique qu’une période est habituellement plus ou moins favorable ; elle ne prédit pas les conditions d’un jour précis plusieurs semaines ou plusieurs mois à l’avance. La source utilisée est signalée dans les résultats.

## 3. Filtrer par sport

Kite et parapente ne recherchent pas la même masse d’air. Le filtre sport adapte donc les spots proposés et la manière dont les conditions sont évaluées.

Pour le kite, le score tient notamment compte du nombre d’heures exploitables, de la qualité et de la régularité du vent ainsi que des directions recommandées sur le spot. Pour le parapente, le calcul favorise davantage le calme, l’ensoleillement, des rafales contenues et l’absence de pluie.

Le choix **Tous** permet de conserver une vue plus large lorsque le programme reste ouvert.

## 4. Comprendre le score sur 100

Le score Openwind sert à classer les possibilités, pas à délivrer un feu vert. Un résultat élevé signifie simplement que plusieurs critères favorables se rencontrent dans les données disponibles.

Ouvre le détail du score pour comprendre pourquoi un spot ressort :

- **Heures** : durée estimée du créneau exploitable ;
- **Qualité du vent** : force adaptée à l’activité ;
- **Régularité** : relation entre vent moyen et rafales ;
- **Direction** : cohérence avec les orientations renseignées pour le spot ;
- pour le parapente, **calme, soleil, rafales et pluie** remplacent les critères propres au kite.

Deux scores proches ne rendent pas deux sites équivalents. Le niveau requis, la direction par rapport à la rive ou au relief, l’accès et les dangers locaux peuvent complètement changer la décision.

## 5. Lire une carte de résultat

Chaque résultat rassemble le nom du spot, sa région, son sport, sa distance lorsque tu as choisi une destination, son meilleur score et un résumé du vent. Sur une période de plusieurs jours, la frise permet de passer rapidement d’une journée à l’autre.

Sur ordinateur, tu peux développer le panneau pour comparer les spots tout en conservant la carte. Sur mobile, les résultats se consultent dans un panneau coulissant afin de garder le contexte géographique sans surcharger l’écran.

Trie ensuite la liste selon ton besoin :

- **Score** pour commencer par les conditions les plus prometteuses ;
- **Distance** pour privilégier le déplacement le plus raisonnable ;
- **Vent** pour comparer rapidement l’intensité prévue.

## 6. Partager un plan

Lorsque la recherche te convient, utilise le bouton de partage. La destination, les dates, le rayon et le sport sont conservés dans le lien. La personne qui l’ouvre retrouve donc la même recherche et peut la vérifier ou l’ajuster.

C’est particulièrement utile pour préparer une session à plusieurs : au lieu d’envoyer une capture d’écran qui vieillit, tu partages un plan que chacun peut rouvrir avec les paramètres d’origine.

## Un exemple concret pour le week-end

Imaginons un départ depuis Fribourg pour pratiquer le kite samedi ou dimanche :

1. recherche **Fribourg** ou utilise ta position ;
2. choisis les deux jours du week-end ;
3. commence avec un rayon de **150 km** ;
4. sélectionne **Kite** ;
5. lance la recherche et compare d’abord les scores ;
6. ouvre les meilleurs résultats pour contrôler la direction, les rafales, la fiche du spot et les mesures disponibles ;
7. partage le plan avec les autres pratiquants avant de prendre une décision commune.

Si rien de convaincant n’apparaît, élargir le rayon peut révéler une autre région. Mais un long déplacement ne rend jamais une prévision plus certaine : refais un contrôle à l’approche du départ.

## Ce que le planificateur ne remplace pas

Un modèle météo ne voit pas tout. Le relief, les effets thermiques, les grains, un obstacle proche de la balise ou un changement rapide peuvent produire une réalité différente de l’écran.

Avant toute sortie, complète la planification avec :

- les avis et alertes des services météorologiques officiels ;
- les mesures récentes des balises proches ;
- la fiche du spot, ses règles et ses zones interdites ;
- une observation attentive sur place ;
- une marge adaptée à ton niveau, à ton matériel et à la température.

> Openwind est un outil d’aide à la préparation. Le terrain, les règles locales et ta propre évaluation de sécurité restent toujours prioritaires.

## La méthode Openwind en trois temps

**Planifier** pour comparer les destinations et les dates. **Vérifier** avec les prévisions détaillées, les balises et les informations du spot. **Observer** une dernière fois sur place avant de s’engager.

[Planifier ma prochaine sortie](https://www.openwind.ch/fr/plan)
  $article$,
  '/capture/map.png',
  'Carte Openwind présentant un spot, ses conditions en direct et les balises à proximité',
  'Mode d’emploi',
  'Tous les spots Openwind',
  9,
  'PUBLISHED',
  'Planifier une sortie kite ou parapente | Openwind',
  'Destination, dates, rayon et score météo : apprenez à comparer les spots et à préparer une sortie kite ou parapente avec le planificateur Openwind.',
  $sources$[
    {"label":"Prévisions météorologiques — Open-Meteo","url":"https://open-meteo.com/en/docs"},
    {"label":"API d’archives historiques — Open-Meteo","url":"https://open-meteo.com/en/docs/historical-weather-api"},
    {"label":"Données cartographiques — OpenStreetMap","url":"https://www.openstreetmap.org/copyright"}
  ]$sources$::jsonb,
  'Openwind',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY['article-vents-regionaux-2026', 'article-guide-gruyere-2026'],
  '2026-08-27T08:00:00.000Z',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
