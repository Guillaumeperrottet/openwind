# Contrôle qualité et référencement — 4 novembre 2026

Cette passe prépare la version locale pour publication. Elle ne confirme ni une indexation effective ni un classement Google ou une citation par un assistant IA.

## Indexation et contenu

- À la demande utilisateur du 4 novembre, les températures redeviennent visibles par défaut : pages, Explorer, recherche, guides, raccourcis, pied de page et sitemap. `ALPLAKES_LAKE_PAGE_ENABLED=false` retire les accès et rend les routes non indexables. Le même interrupteur commande le bloc Morlon ; l’ancienne variable `ALPLAKES_WATER_ENABLED` n’est plus nécessaire. Aucune configuration de production n’a été modifiée.
- Les températures sont décrites comme des estimations Alplakes / Eawag, modèle Simstrat à 1 m, sans sonde locale. Le crédit et la licence concernent les données amont.
- Explorer et l’annuaire des températures ont leurs métadonnées de partage et leurs données structurées de collection. L’identité Organization / WebSite utilise des identifiants stables.
- Les discussions du Forum exposent le texte complet, les auteurs publics, les dates réelles et les réponses imbriquées. Les catégories décrivent les sujets effectivement affichés. Les données structurées n’ajoutent ni identifiants de comptes ni votes individuels. Le JSON est échappé avant insertion dans le HTML.
- Les pages de résultats de recherche restent `noindex, follow`. Les discussions non traduites conservent leur canonique française. Les robots publics restent autorisés à consulter les pages publiques.
- Les fiches de spots et balises conservent leur présentation et leurs fonctionnalités.

## Mesures de performances

`WebVitals` utilise `next/web-vitals` pour LCP, INP et CLS, et transmet un événement `web_vital` au Google tag déjà installé. Aucun nouveau service ni abonnement. La réception et l’exploitation de cet événement dépendent de la configuration du tag existant.

Seuls les domaines de production `www.openwind.ch` et `openwind.ch` émettent ces événements. Les environnements locaux et les aperçus ne le font pas. Le contexte envoyé contient uniquement la famille de la page et sa langue ; aucune URL, recherche, coordonnée, identité ou identifiant de spot. Les pages personnelles et administratives sont exclues. Le contexte correspond au document chargé, pas à chaque navigation interne. Une valeur mise à jour peut être émise avec le même identifiant de mesure : dédupliquer par identifiant et nom en conservant la dernière valeur pour une analyse externe.

Il faut des visites réelles après publication pour établir les performances de terrain. Les temps de réponse de l’audit local ne sont pas des Core Web Vitals.

## Vérifications reproductibles

```sh
npm test
npx tsc --noEmit
npm run build
python3 scripts/audit-public-seo.py --water-enabled --base-url http://127.0.0.1:3001 --output /tmp/openwind-seo-audit.json
```

Le script effectue uniquement des lectures HTTP et contrôle un échantillon de pages publiques et privées : H1, indexation, canonique, langues, identité du site, données structurées et champs essentiels des discussions. Avec `--water-enabled`, il contrôle les températures publiables et les pages de récupération de compte privées. Sans cette option, il contrôle la configuration de secours masquée. Il ne remplace pas le validateur Google ni un audit exhaustif de toutes les URL.

Les URL inexistantes sont exclues de l’indexation. Next.js peut déjà avoir commencé à diffuser le HTML d’une route dynamique du Forum quand il découvre l’absence du sujet : la réponse est alors HTTP 200 avec une page introuvable et `noindex`, selon son fonctionnement documenté. Les routes non reconnues renvoient 404. Ces deux cas ont été contrôlés localement.

Après publication : soumettre ou relire le sitemap dans Search Console, inspecter les nouvelles pages, consulter les rapports d’indexation et de résultats enrichis, puis suivre les Core Web Vitals réels. Aucune garantie de résultat enrichi ou de citation IA : l’accès aux sources, le contenu lisible et la cohérence des informations sont les fondations vérifiables.

## Températures : lecture par Google et les moteurs IA

La page du lac présente un H1 localisé décrivant la température de l’eau, une valeur datée rendue côté serveur, la profondeur, les prévisions, la méthode et l’attribution. Les valeurs ne dépendent pas d’un graphique ou de JavaScript pour être lues. Le JSON-LD relie WebPage et Dataset : créateur Eawag, modèle Simstrat 1D, unité, profondeur, périmètre et licence des données. Aucune date de modification, sonde ou valeur courante n’est inventée dans les métadonnées. Les quatre langues ont des canoniques propres et des hreflang réciproques. Le fichier robots autorise les pages publiques, y compris OAI-SearchBot.

Références officielles : [Google, fonctionnalités IA](https://developers.google.com/search/docs/appearance/ai-features), [Google, Dataset](https://developers.google.com/search/docs/appearance/structured-data/dataset), [OpenAI, robots de recherche](https://developers.openai.com/api/docs/bots). Aucun fichier spécial ne garantit une citation IA. L’indexation reste à contrôler après publication dans Search Console.

Vérification finale locale du 4 novembre : compilation de production et 866 tests réussis ; 27 contrôles HTTP réussis. Les trois robots Googlebot, Bingbot et OAI-SearchBot reçoivent les pages des températures avec leurs métadonnées et la valeur datée en HTML. Les huit URL localisées sont présentes dans le sitemap et autorisées par robots.txt. Vérification visuelle de la page Gruyère et du bloc existant de Morlon. Aucune publication effectuée.

## Finitions mobiles du 5 novembre 2026

Les filtres de réseaux, unités, accès carte et favoris de l’annuaire des balises ont des cibles tactiles d’au moins 44 × 44 px. Le favori conserve son cercle visuel de 32 px et son icône de 16 px ; son centre et l’apparence des cartes restent inchangés. Les boutons d’effacement du planificateur et de la recherche des lacs atteignent aussi 44 px.

Sous 380 px, les en-têtes des pages d’accès utilisent un titre de 24 px et des espacements réduits. La page du lac réduit son espacement vertical avant la mesure. Contrôle dans le navigateur à 320 × 568 et 390 × 844 : pas de débordement horizontal sur les pages vérifiées, cibles mesurées à 44 px, température entièrement visible au-dessus de la navigation à 320 px (bas de la valeur à 442 px, début de navigation à 503 px). Les sources, dates, textes et fonctionnalités sont conservés. Les fichiers des fiches de spots et balises n’ont pas été modifiés par cette finition.

Compilation, 866 tests, quatre tests Python et lint sans erreur validés. Le lint conserve un avertissement préexistant sur une directive inutilisée dans la route administrative de bannière. Ce contrôle responsive ne remplace pas une vérification sur iPhone physique avec Safari, clavier, texte agrandi et VoiceOver. Les compléments de spots et la révision des articles restent des lots préparés : aucun import de contenu en base n’est lancé par le build ou cette publication.

## Tableau de prévisions et navigation mobile — 5 novembre

Sous 640 px, la colonne fixe des libellés des prévisions détaillées mesure 76 px (environ 118 px auparavant en français), avec retour à la ligne des unités. Les colonnes horaires passent de 46 à 34 px pour afficher davantage de créneaux. Les libellés complets, unités, couleurs, sources et préférences de vent restent présents. La grille conserve le défilement horizontal et les en-têtes de ligne accessibles. Les dimensions ordinateur sont conservées.

La barre de navigation mobile passe de 64 à 56 px par destination, avec la zone de sécurité et une réserve de contenu calculée sur la même hauteur. Le compteur de favoris est retiré de Mon Openwind dans la barre : il ne représentait pas des notifications à lire. Les favoris restent disponibles dans le compte et Mon Openwind.

Vérification dans le navigateur à 320 et 390 px : colonne à 76 px, heures à 34 px, libellés allemands sans débordement, colonne fixe pendant le défilement, barre à 57 px bordure comprise et réserve de contenu identique. Contrôle ordinateur à 1280 px : colonnes horaires à 46 px et navigation ordinateur conservée. Les 866 tests, la vérification TypeScript complète, le build et le lint sans erreur passent.

## Densité renforcée du tableau mobile — 5 novembre

À la demande utilisateur, la colonne fixe est ramenée de 76 à 48 px et les heures de 34 à 26 px sous 640 px. Les libellés mobiles utilisent des abréviations traduites en quatre langues et affichent les unités sur une ligne séparée. Le texte complet reste l’intitulé accessible de chaque en-tête de ligne ; le libellé visuel abrégé est masqué aux technologies d’assistance pour éviter une lecture en double. Les en-têtes complets restent visibles sur ordinateur.

Vérification navigateur : 11 créneaux entiers à 390 px, huit à 320 px, libellés allemands sans débordement, noms accessibles complets Vent/Rafales conservés ; sur ordinateur, données à 46 px et intitulés complets. Les 867 tests, dont la vérification des lignes de vagues et de leurs unités, le typage TypeScript complet, le build et le lint sans erreur sont validés.


## Carte mobile affinée et grille plus dense — 5 novembre

Sous 640 px, le sélecteur de carte passe de 272 × 52 à 225 × 44 px, avec un fond visible de 32 px de haut. Les commandes natives gardent leurs cibles de 44 px avec des surfaces visuelles réduites. Les boutons de légende et de planification passent à un texte de 12 px et à des fonds de 32 px, sans réduire leur zone tactile. Le bandeau partenaire occupe 45 px bordure comprise, avec son texte complet conservé dans le lien et son titre. Attribution cartographique, filtres, légende, accueil, zoom et géolocalisation restent disponibles.

La grille des prévisions passe à 42 px pour les libellés et 24 px par créneau : neuf créneaux entiers à 320 px, douze à 390 px. Les abréviations françaises et allemandes contrôlées ne débordent pas ; les unités et les intitulés accessibles sont conservés. Sur ordinateur, les heures restent à 46 px et les intitulés complets restent visibles.

Vérification locale navigateur à 320 et 390 px : pas de débordement horizontal sur la carte, commandes principales mesurées à au moins 44 × 44 px, filtres et ouverture/fermeture de légende fonctionnels. Les 867 tests, le typage TypeScript complet, la compilation et le lint sans erreur sont validés (un avertissement administratif préexistant). Aucun changement de données ni import en base.


## Retour à la navigation haute sur mobile — 5 novembre

À la demande utilisateur, la barre de navigation fixe du bas est retirée. Sur mobile et tablette, Carte, Explorer, Planifier et Mon Openwind sont accessibles dans le menu en haut à droite, pour les visiteurs connectés ou non. La recherche reste accessible dans l’en-tête. La destination active, les liens tenant compte du lieu, les accès au compte et la fermeture avec Échap sont conservés. La navigation ordinateur conserve ses quatre liens dans l’en-tête.

La réserve de 57 px au bas des pages est supprimée ; la carte occupe la hauteur de la fenêtre moins les 56 px de l’en-tête. Sa zone de sécurité inférieure est conservée. Vérification navigateur à 320 × 568, 390 × 844 et 1280 × 900 : menu sans débordement, liens de 44 px, passage vers Explorer, recherche et fermeture au clavier fonctionnels. À 390 × 844, la carte et son bandeau occupent 788 px, du bas de l’en-tête au bas de la fenêtre. Les 867 tests, le typage complet, le build et le lint sans erreur passent (avertissement administratif préexistant). Aucun changement des données.


## Sélecteur d’activité replié sur mobile — 5 novembre

Sous 640 px, le bandeau affiche seulement l’activité choisie dans un sélecteur natif (Tous, Kite ou Parapente), avec une flèche et le libellé court Para. Les options conservent leurs noms complets accessibles et le même réglage d’activité partagé. Vent et Accueil restent à côté. Le bandeau passe de 225 à 165 px de large, avec une cible de sélection de 76 × 44 px et un fond visible de 32 px de haut. Le champ natif utilise une police de 16 px derrière le libellé visuel compact. Sur ordinateur, les trois boutons précédents restent visibles.

Contrôle navigateur à 320, 390 et 1280 px : choix des trois activités, libellé réduit, conservation du choix après rechargement, absence de débordement et présentation ordinateur conservée. Les 867 tests, le typage TypeScript complet, la compilation et le lint sans erreur passent (un avertissement administratif préexistant). Aucun changement de données en base.


## Correction des fenêtres de carte après retrait de la barre — 5 novembre

Le retrait de la barre mobile avait laissé cinq références à son ancienne hauteur dans les composants : ancrages des fenêtres spot/balise, hauteur de la fenêtre balise, message des favoris et formulaire de création de spot. La variable n’existant plus, les déclarations CSS devenaient invalides. Ces références sont remplacées par la marge inférieure de 16 px et la zone de sécurité native ; le formulaire utilise la hauteur de fenêtre moins l’en-tête. La limite de hauteur des fenêtres tient aussi compte de la zone de sécurité. Aucune référence à l’ancienne variable ne reste dans src.

Contrôle réel dans le navigateur : ouverture du spot Charmey–Vounetse et de la balise Marsens par clic sur la carte. À 320 × 568, le spot est compris entre y=180 et y=552 ; la balise entre y=72 et y=552, avec un contenu défilable jusqu’au lien Toutes les données. À 390 × 844, les deux fenêtres se terminent à y=828, soit 16 px du bas. Contrôle balise en paysage 568 × 320 (y=72 à y=304) et sur ordinateur 1280 × 900 après stabilisation du graphique (y=169 à y=890). Les 867 tests, le typage complet, le build et le lint sans erreur sont validés (avertissement administratif préexistant). Aucun changement de données.


## Balises : mesure et historique dans une fenêtre compacte — 5 novembre

Sur la carte mobile, la fenêtre des balises resserre l’en-tête, la mesure, la provenance et le pied de fenêtre. Le graphique conserve ses 48 heures, ses heures/jours, les rafales et l’échelle ; sa hauteur passe de 272 à 134 px. Le sélecteur d’heure et la lecture persistante restent présents, avec des cibles de 44 px. Le deuxième rappel de l’heure de mise à jour est masqué sur mobile : la date et le fuseau complets restent affichés avec la provenance. La description conserve un aperçu sur une ligne. Les fiches complètes ne changent pas et le graphique ordinateur reste à 272 px.

La fermeture extérieure utilise pointerdown, pour distinguer un clic extérieur d’un bouton interne retiré par sa propre action : effacer une heure ne ferme plus la fenêtre. Vérification réelle sur Marsens à 390 × 844 et 320 × 568 : fenêtre de 466 px, contenu de 466 px, sans défilement interne, y=86 à y=552 sur le petit écran. Mesure actuelle, graphique, lecture d’une heure et lien Toutes les données sont simultanément visibles. Contrôle en kts et km/h, sélection au graphique et au clavier, effacement sans fermeture ; boutons, curseur et lien mesurés à 44 px de haut. Sur ordinateur 1280 × 900, graphique de 272 px et présentation complète conservée. Les fenêtres gardent leur défilement de secours si la hauteur disponible ou le texte agrandi l’exige.

Les 867 tests, le typage TypeScript complet, la compilation et le lint sans erreur sont validés (avertissement administratif préexistant). Aucun changement des données.


## Retour aux fenêtres de balises précédentes, sans curseur — 5 novembre

À la demande utilisateur, les espacements, la typographie et le graphique précédant la compaction des fenêtres de balises sont restaurés. Le graphique retrouve ses 272 px, avec lecture du détail au contact ou au survol, sans curseur manuel ni bloc de lecture séparé dans la fenêtre de carte. L’option est propre à cet aperçu : les graphiques des fiches complètes conservent leurs commandes. Le correctif des fenêtres hors écran, la marge inférieure de 16 px, la zone de sécurité, les favoris et les liens complets sont conservés.

Vérification locale sur Marsens : détail date/heure, vent, rafales et direction obtenu en cliquant le graphique ; aucun input range dans la fenêtre. À 390 × 844, fenêtre entre y=224 et y=828, graphique de 272 px. À 320 × 568, fenêtre limitée entre y=72 et y=552 avec défilement de secours ; le détail au graphique reste dans l’écran (y=205 à y=315). Les 867 tests, le typage complet, la compilation et le lint sans erreur sont validés (avertissement administratif préexistant). Aucun changement de données.
