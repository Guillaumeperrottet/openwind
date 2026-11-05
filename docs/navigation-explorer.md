# Navigation publique et Explorer

Les quatre entrées restent Carte, Explorer, Planifier et Mon Openwind.
Explorer rassemble les lieux, les balises, les températures, les webcams, les guides, le Carnet et le Forum.

## Cadre commun

`AccessFrame` fournit le fil d’Ariane et le retour contextuel. `AccessPageHeader` partage la hiérarchie des titres des pages d’accès.

- Répertoires : guides, Carnet, webcams et températures.
- Détails : guide local, article, lac, rubrique et discussion du Forum.
- Autres accès : À propos, Planifier, Mon Openwind et ajout de spot.
- Carte, répertoire des balises et fiches de spots/balises : présentation conservée. Les liens sortants peuvent enregistrer un retour sans modifier ces fiches.
- Administration et authentification : parcours propres conservés.

Les retours conservent la langue, les critères de recherche, la pagination et les ancres. Une visite directe utilise le parent du fil d’Ariane. Les liens de navigation principale et du fil d’Ariane réinitialisent le contexte de leur destination. Les liens de retour ne créent pas un nouveau retour dans le sens inverse.

Le contexte est limité aux 40 dernières destinations dans la session du navigateur. Il reste utilisable en mémoire si le stockage est indisponible. Seules les destinations publiques internes sont acceptées ; les paramètres de connexion sont retirés.

## Températures et webcams

`/temperatures` présente la couverture réelle : Gruyère, modèle Simstrat à 1 m, source Alplakes/Eawag et licence CC BY 4.0. Le chargement réutilise le cache Alplakes existant. Une absence ne devient jamais 0 °C. Les températures sont visibles par défaut à la demande utilisateur du 4 novembre, dans toutes les entrées existantes. `ALPLAKES_LAKE_PAGE_ENABLED=false` les retire des liens, de la recherche et du sitemap et désactive leurs routes. Le bloc Morlon utilise le même interrupteur.

`/webcams` sans coordonnées présente les lieux du catalogue des guides, avec recherche. Une sélection ouvre la galerie existante et permet de revenir à la liste filtrée. Les liens depuis une fiche de spot ou de balise conservent leur retour explicite. Les rayons et le lecteur existants sont conservés. Le répertoire peut être indexé ; ses recherches et galeries géographiques restent exclues de l’indexation.

## Prévisualisation

Serveur local : http://127.0.0.1:3001/fr/explorer
Aucun push, déploiement ni migration de données dans cette étape.

## Recherche et lieu consulté

Explorer présente la recherche globale et trois accès compacts aux conditions avant les guides. Les liens de découverte des lacs annoncent tous le guide du vent. Les accès en double aux conditions ont été retirés du bas de la page.

La recherche partagée couvre les guides, spots, balises, recherches de webcams, températures disponibles, articles publiés, fonctionnalités publiques, rubriques et titres des discussions. La page `/recherche` conserve la requête et le type dans l’URL et pagine tous les résultats par 20. Entrée ouvre les résultats complets ; les flèches puis Entrée ouvrent une suggestion précise. Les pages de recherche restent non indexables. Les fonctions d’administration et les données privées des comptes ne sont pas indexées. Le catalogue public est mis en cache 60 secondes ; seuls les titres et métadonnées publiques des discussions sont chargés.

Le lieu consulté est conservé dans la session du navigateur (8 heures maximum au rechargement), avec son nom, ses coordonnées et son éventuel guide associé. `/api/place` ne lit que des identités et coordonnées publiques. Il n’appelle aucun fournisseur météo et ne charge aucun rapport ou profil utilisateur. Le stockage reste facultatif. Les coordonnées du spot sont conservées pour les webcams ; les liens portent le contexte pour fonctionner aussi après rechargement. La sélection d’un spot ou d’une balise dans une fenêtre de la carte conserve aussi le lieu. Les mises à jour du vent ne relancent pas sa résolution. Une fiche de spot ou de balise peut sélectionner un lieu sans modifier son composant. Une réponse tardive annulée ne remplace pas le lieu d’une nouvelle navigation.

Le passage à l’eau indique la couverture réelle. Hors Gruyère, un message explique l’absence d’intégration pour le lieu consulté et présente séparément le lac disponible. Il n’y a aucune interpolation géographique ou attribution d’une température à un autre lac. Les mesures de vent et la température modélisée restent des sources distinctes.

## Finition des parcours — 3 novembre 2026

Les articles enregistrés passent après les favoris, recherches et modules du tableau de bord, avec ou sans compte. L’ordre choisi pour les modules reste conservé ; le lien direct `#saved-articles` reste disponible.

Le contexte des pages de conditions devient une rangée compacte sur mobile : lieu, changement de lieu et trois destinations restent accessibles. Explorer conserve sa présentation de découverte. Les précisions restent dans les noms accessibles et l’absence de couverture de l’eau reste visible. Les écrans de moins de 380 px privilégient les libellés aux icônes décoratives.

Les commandes de réorganisation et de sélection du tableau de bord, les alertes et les actions de connexion disposent de cibles de 44 px. Les erreurs d’authentification utilisent les codes du fournisseur pour donner un message explicatif en FR/EN/DE/IT ; une erreur inconnue reçoit un message générique. Les détails techniques du serveur ne sont jamais affichés dans ces messages. La page existante de renouvellement du mot de passe utilise aussi ce traitement en français et libère son état de chargement en cas d’erreur réseau.

La navigation Planifier conserve le lieu consulté (coordonnées et rayon initial de 50 km), sans lancer de recherche automatiquement. Une recherche enregistrée ou datée conserve ses propres critères.

## Qualité des informations des spots — 4 novembre 2026

La création exige désormais une description, un pays, les accès et restrictions, les risques connus, les orientations précises, la saison (mois ou conditions locales) et des sources HTTPS pour la discipline, les orientations, la saison et les accès. La validation est partagée entre formulaire et API. La fiche et son dossier documentaire sont créés dans la même transaction. Les sources d’un contributeur sont conservées avec le statut `NEEDS_REVIEW` : leur présence ne vaut pas approbation éditoriale et ne déclenche pas de recommandation automatique. La distinction kite sur l’eau / snowkite est explicite. Les écrans de consultation des spots et balises sont conservés.

`npm run spots:audit -- --output /tmp/openwind-spots.json` réalise un inventaire en lecture seule. Il reconnaît les mois historiques en toutes lettres pour distinguer un format ancien d’une vraie absence. Le 4 novembre : 181 spots, 96 avec au moins une lacune, 10 profils documentés actuels, 3 revues en attente et 168 sans dossier documentaire. Ces compteurs décrivent deux dimensions différentes (champs et vérification des sources).

Trois compléments de risques en FR/EN/DE/IT ont été préparés pour Yvonand, Portalban et Cudrefin à partir des pages des associations locales. `npm run spots:completions:check` vérifie leurs identités et empreintes sans écriture. L’application des données est distincte, avec `--apply`, sauvegarde et transaction ; elle n’a pas été exécutée. Un changement récent, une traduction existante ou une revue concurrente bloque l’import. Les statuts et dates documentaires ne sont pas renouvelés automatiquement.

Le remplissage exhaustif reste à faire source par source. Aucun profil manquant n’est déclaré documenté par défaut. Les points nécessitant une clarification (Salavaux, La Tène, Saint-Aubin-Sauges et les quatre fiches Monteynard) sont consignés dans `src/data/spot-research-notes.json`. Aucune fusion, suppression, modification de température ni publication ne fait partie de cette passe.
