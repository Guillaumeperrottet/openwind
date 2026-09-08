-- Publish an editable Carnet article explaining Openwind's open-source
-- architecture, live observations, forecast models and wind stations.
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
  'article-open-source-live-wind-2026',
  'EDITORIAL',
  'open-source-vent-en-direct-balises-openwind',
  'Open source, vent en direct et balises : comment fonctionne Openwind',
  'D’où viennent les mesures, que montrent vraiment les particules sur la carte et comment Openwind rassemble balises, modèles météo et logiciel libre sans mélanger observations et prévisions.',
  $article$
> **L’essentiel en une minute :** une balise mesure le vent à un endroit précis, alors que la couche animée et les prévisions proviennent de modèles météorologiques. Openwind réunit ces informations sur une carte, indique leur source et leur heure, puis laisse son code accessible publiquement pour que son fonctionnement puisse être vérifié et amélioré.

[Ouvrir la carte Openwind](https://www.openwind.ch/fr?view=map) · [Explorer les balises](https://www.openwind.ch/fr/balises) · [Voir le code source](https://github.com/Guillaumeperrottet/openwind)

## Pourquoi Openwind est open source

Openwind est publié sous licence **GNU AGPL v3**. Concrètement, le code de l’application peut être consulté, étudié, modifié et amélioré. Lorsqu’une version modifiée est mise à disposition du public par un service en ligne, son code correspondant doit également rester accessible selon les conditions de cette licence.

Cette ouverture apporte quelque chose de très concret : les choix techniques ne sont pas une boîte noire. Une personne peut vérifier comment une valeur est transformée, signaler une erreur ou proposer une amélioration.

**Open source ne veut toutefois pas dire que toutes les données appartiennent à Openwind.** Le code de l’application a sa licence ; les fonds de carte, mesures et prévisions conservent les licences et conditions de leurs fournisseurs. Les clés d’accès et autres secrets techniques ne sont évidemment jamais publiés.

## Trois informations qui se complètent sans se confondre

Sur une même carte, Openwind montre trois réalités différentes.

### 1. La balise : une mesure locale

Une balise ou une station météo observe ce qui se passe autour de son capteur. Elle indique notamment le vent moyen, les rafales, la direction et l’heure de la mesure.

C’est l’information la plus proche du terrain, mais elle ne décrit que son emplacement. Une station derrière des arbres, sur un toit, au fond d’une vallée ou en hauteur peut relever un vent très différent de celui présent quelques kilomètres plus loin.

### 2. La couche animée : une estimation sur toute la zone

Les lignes et particules animées représentent le champ de vent calculé par un **modèle météo**. Elles permettent de comprendre le mouvement général de la masse d’air, y compris entre les stations.

Ce ne sont pas des milliers de petites balises invisibles. Le modèle découpe le territoire en mailles, calcule le vent dans chacune d’elles, puis Openwind interpole ces valeurs pour obtenir une animation fluide.

### 3. La prévision : une estimation du futur

Les tableaux de prévisions montrent l’évolution attendue dans les prochaines heures et les prochains jours. Ils sont utiles pour planifier, tandis que les balises servent à confirmer ce qui se passe réellement à l’approche de la sortie.

> **La bonne méthode :** utiliser le modèle pour comprendre et anticiper, puis les balises et l’observation sur place pour vérifier.

## Plus de 1 600 stations rassemblées sur une carte

Au moment de publier cet article, Openwind réunit plus de **1 600 stations actives**. Ce nombre varie naturellement selon la disponibilité des réseaux et des capteurs.

- **MétéoSuisse / SwissMetNet** fournit des stations automatiques officielles, généralement actualisées toutes les dix minutes.
- **Pioupiou / OpenWindMap** regroupe des balises communautaires particulièrement utiles sur certains spots.
- **Netatmo** complète la couverture avec des modules vent partagés par leurs propriétaires.
- **Météo-France** apporte des observations de son réseau public pour les régions françaises.
- **Windball / Windfox** couvre plusieurs sites de Suisse romande avec des balises connectées par radio LoRa.
- **FribourgÉnergie** publie des mesures de mâts éoliens, notamment au Schwyberg. Leur hauteur de mesure et leur publication par lots doivent être prises en compte avant toute comparaison avec une station classique proche du sol.

Openwind convertit ces formats différents dans une structure commune. Cela permet d’afficher les réseaux ensemble tout en conservant le nom de la source, l’heure d’observation et l’identité de chaque station.

## « En direct » ne veut pas dire « à la seconde »

Entre le souffle sur le capteur et son affichage, plusieurs étapes ont lieu : la station mesure, le réseau transmet, le fournisseur publie, Openwind récupère la donnée, puis ton navigateur l’actualise.

Selon le réseau, ce trajet peut prendre quelques minutes ou davantage. Openwind contrôle donc l’âge de chaque observation. Une mesure trop ancienne reste identifiable comme telle ; elle ne doit pas être interprétée comme la situation présente.

Pour bien lire une balise, vérifie toujours :

1. **l’heure de la mesure** ;
2. **la source** et le type de station ;
3. **le vent moyen** ;
4. **les rafales** ;
5. **la direction** et la position exacte du capteur.

Un écart important entre la moyenne et les rafales signale souvent un vent irrégulier. La direction indique d’où vient le vent : 0° correspond au nord et 90° à l’est. Openwind normalise les calculs en kilomètres par heure et peut les afficher en nœuds selon la préférence choisie ; **1 nœud équivaut à 1,852 km/h**.

## Le trajet d’une mesure, expliqué simplement

Voici ce qui se passe en coulisses :

1. un fournisseur publie une nouvelle observation ;
2. le serveur Openwind interroge les différents réseaux et harmonise leurs formats ;
3. un instantané est mis en cache et les mesures sont enregistrées pour construire l’historique ;
4. la carte récupère les nouvelles valeurs à intervalles réguliers ;
5. l’application compare leur âge aux règles propres à chaque réseau ;
6. si une mesure n’est plus assez récente, Openwind le signale au lieu de la présenter comme fraîche.

Cette collecte s’exécute automatiquement environ toutes les dix minutes côté serveur. L’affichage peut se rafraîchir plus souvent, mais il ne peut évidemment pas inventer une donnée que le réseau d’origine n’a pas encore publiée.

## Pourquoi le graphique couvre 48 heures

La page d’une station permet de replacer la dernière valeur dans son contexte. Le graphique sur 48 heures aide à voir si le vent monte, baisse, devient rafaleux ou change de direction.

Openwind sépare volontairement :

- **le passé observé**, constitué de véritables mesures disponibles ;
- **le futur prévu**, calculé par un modèle météorologique.

Une prévision ne sert donc pas à remplir artificiellement un trou dans l’historique. Lorsque le réseau fournit des archives, Openwind les complète avec les observations déjà enregistrées, sans faire passer une estimation pour une mesure.

## Comment est fabriqué le vent animé

Openwind sélectionne un modèle adapté à la zone affichée :

- **ICON-CH1 de MétéoSuisse** sur la Suisse, avec une maille d’environ 1 km ;
- **ICON-EU du DWD** sur l’Europe, avec une maille d’environ 6,5 km ;
- **GFS de la NOAA** pour la couverture mondiale, avec une maille d’environ 13 km.

La résolution décrit la taille de la grille de calcul. Elle ne garantit pas que le vent soit exact au mètre près sur une plage, derrière une forêt ou près d’un décollage. Les reliefs fins, les thermiques et les obstacles locaux peuvent produire une situation différente.

Techniquement, les composantes du vent et les rafales sont transformées en fichiers compacts. Le navigateur les lit, interpole les valeurs entre les points de grille et anime les particules grâce au processeur graphique. La densité de l’animation s’adapte aux performances de l’appareil afin de rester fluide sur mobile.

## Fiabilité : prévoir aussi les pannes

Un service météo sérieux doit rester compréhensible lorsqu’une source ralentit ou tombe en panne. Openwind utilise plusieurs protections :

- contrôle de fraîcheur des mesures et des modèles ;
- validation des fichiers avant leur publication ;
- publication atomique, pour ne jamais exposer un jeu de données à moitié transféré ;
- conservation de versions précédentes afin de faciliter un retour en arrière ;
- source de secours lorsque le fournisseur principal de la couche de vent est indisponible ;
- contrôles automatisés qui comparent régulièrement les valeurs affichées aux grilles météo d’origine.

Ces mécanismes réduisent les erreurs silencieuses. Ils ne transforment pas pour autant une prévision en certitude.

## Les briques ouvertes utilisées par Openwind

Openwind ne reconstruit pas tout seul ce que la communauté sait déjà bien faire.

- **MapLibre GL JS** affiche la carte interactive avec WebGL.
- **OpenStreetMap** fournit les données géographiques qui servent de base à la carte, avec l’attribution requise par sa licence.
- **Open-Meteo** facilite l’accès à plusieurs modèles de prévision et aux archives météorologiques.
- **Next.js, TypeScript et PostgreSQL** structurent l’application, ses interfaces et ses données.

Le dépôt public contient aussi la documentation et les outils utilisés pour contrôler la couche de vent. C’est un moyen de rendre les choix visibles, mais également d’inviter d’autres passionnés à participer.

## Comment contribuer, même sans être développeur

L’open source ne se limite pas au code. Tu peux aider Openwind en :

- ajoutant ou corrigeant la fiche d’un spot ;
- signalant une balise mal placée ou une valeur étrange ;
- partageant une information locale vérifiable ;
- ouvrant un signalement ou une proposition sur GitHub ;
- testant l’application sur ton téléphone et en décrivant précisément un problème.

Une bonne correction de terrain peut être aussi utile qu’une modification technique.

## Cinq questions avant de décider d’une sortie

1. La mesure est-elle récente ?
2. La balise représente-t-elle vraiment mon spot ou seulement une zone voisine ?
3. Le vent moyen et les rafales sont-ils cohérents avec mon niveau et mon matériel ?
4. Le modèle, plusieurs balises et ce que j’observe racontent-ils la même histoire ?
5. Ai-je vérifié les alertes officielles, les règles locales et les dangers du site ?

> Openwind est un outil d’observation et d’aide à la préparation. Il ne remplace ni les avertissements officiels, ni les règles locales, ni l’évaluation personnelle des conditions sur le terrain.

[Consulter les balises en direct](https://www.openwind.ch/fr/balises) · [Planifier une sortie](https://www.openwind.ch/fr/plan) · [Contribuer au projet](https://github.com/Guillaumeperrottet/openwind)
  $article$,
  'https://www.openwind.ch/capture/map.png',
  'Carte Openwind affichant des spots, des balises et la couche de vent animée',
  'Dans les coulisses',
  'Suisse et régions voisines',
  12,
  'PUBLISHED',
  'Openwind : open source, balises et vent en direct',
  'Découvrez comment Openwind réunit balises météo, modèles ouverts et carte animée pour afficher le vent en direct avec un code source public et vérifiable.',
  $sources$[
    {"label":"Code source Openwind — GitHub","url":"https://github.com/Guillaumeperrottet/openwind"},
    {"label":"Licence GNU AGPL v3 — GNU","url":"https://www.gnu.org/licenses/agpl-3.0.fr.html"},
    {"label":"Réseau automatique SwissMetNet — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/weather/measurement-systems/land-based-stations/automatic-measurement-network.html"},
    {"label":"Données de prévision et archives — Open-Meteo","url":"https://open-meteo.com/en/docs"},
    {"label":"Licence des données — Open-Meteo","url":"https://open-meteo.com/en/license"},
    {"label":"Données ouvertes — Météo-France","url":"https://donneespubliques.meteofrance.fr/"},
    {"label":"Données et licence Pioupiou","url":"https://developers.pioupiou.fr/data-licensing/"},
    {"label":"Open Data — Deutscher Wetterdienst","url":"https://www.dwd.de/DE/leistungen/opendata/opendata.html"},
    {"label":"Mesures éoliennes du Schwyberg — État de Fribourg","url":"https://opendata.fr.ch/explore/dataset/08_02_eolien_schwyberg/"},
    {"label":"MapLibre GL JS","url":"https://maplibre.org/projects/gl-js/"},
    {"label":"Droit d’auteur et attribution — OpenStreetMap","url":"https://www.openstreetmap.org/copyright/attribution-guide/"}
  ]$sources$::jsonb,
  'Openwind',
  ARRAY[
    'cmnq613tx00it04kw1d0vraq4',
    'cmnpsrx57002nhaf6038tgdu4',
    'cmnpsruzr0002haf63qwep8qj'
  ]::TEXT[],
  ARRAY[
    'piou-2153',
    'windball-wf-35',
    'MAS',
    'VEV',
    'fr-energy-schwyberg'
  ]::TEXT[],
  ARRAY[
    'article-planifier-sortie-openwind-2026',
    'article-vents-regionaux-2026',
    'article-guide-gruyere-2026'
  ]::TEXT[],
  '2026-09-04T08:00:00.000Z',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

-- Surface the new explainer from the existing Carnet articles as well, while
-- preserving any relation choices already made by an administrator.
UPDATE "Article"
SET "relatedArticleIds" = array_append(
  "relatedArticleIds",
  'article-open-source-live-wind-2026'
)
WHERE
  "id" IN (
    'article-planifier-sortie-openwind-2026',
    'article-vents-regionaux-2026',
    'article-guide-gruyere-2026'
  )
  AND NOT (
    'article-open-source-live-wind-2026' = ANY("relatedArticleIds")
  );
