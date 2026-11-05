# Documentation des spots — travail local du 4 novembre 2026

## État et périmètre

Le contrôle en lecture seule porte sur les 181 fiches. 96 ont au moins un champ essentiel absent ou non sélectif ; 10 disposent actuellement d’un profil documentaire qualifié. Un champ rempli n’est pas une preuve d’accès autorisé. Les sources manquent sur une grande partie du catalogue importé : ne pas présenter l’ensemble comme vérifié.

36 compléments sont préparés dans `src/data/spot-completion-patches.json`, dont 24 en Suisse. Ils ne sont pas appliqués à la base. Chaque entrée garde ses sources, sa date, les valeurs précédentes et l’empreinte de la fiche. Les corrections de contenu existant ont un motif. Toute différence avec le catalogue actuel interrompt l’import au lieu d’écraser une édition récente, y compris une traduction.

- Suisse : Yvonand, Portalban, Cudrefin, Boiron, Nid-du-Crô, Niremont, Semsales, lac de Joux, Gletterens, Salavaux, Promenthoux, La Brévine, La Tène, Hauterive, Cheyres, Moléson, Brunni, Pilatus et Niesen.
- Pays-Bas : Makkum, Hindeloopen, Brouwersdam et Scheveningen.
- Royaume-Uni : Camber Sands et Hayling Island.
- France : Beauduc, Saint-Aygulf, Carteau, Napoléon et La Palme.
- Grèce : Mikri Vigla à Naxos.

Pour Nid-du-Crô, Niremont et Semsales, les observations de terrain viennent de Let’s Kite, ressource recommandée par l’association romande. Elles complètent les risques sans valider les autorisations ni les seuils météorologiques. Les statistiques calculées et les résumés automatiques du guide ne servent pas à déduire des restrictions.

Les trois profils documentaires proposés pour Makkum, Hindeloopen et Brouwersdam portent sur la discipline, les orientations, la saison et l’accès publiés par l’association nationale. Ils ne certifient pas la difficulté ou les seuils de vent déjà présents. Makkum est exclu de mai à septembre conformément à la période publiée. Le contrôle des marées manque encore pour Camber et Hayling : aucune recommandation automatique n’est activée pour ces spots. L’ouverture de la glace au lac de Joux ne prouve pas une autorisation de kite.

Les plans de Carteau et de Napoléon sont publiés par l’office de tourisme mais citent des arrêtés de 2012. Leurs risques sont utilisables comme éléments de recherche ; leurs règles actuelles et la correspondance des coordonnées restent à confirmer avant d’approuver un profil. Ne pas étendre leurs permissions à Olga, à La Gracieuse ou au Cavaou.

## Priorité suisse : sources et localisation

Les coordonnées publiques des 29 fiches suisses de kite ont été contrôlées avec le service officiel GeoAdmin `identify`, couche `ch.bafu.bundesinventare-vogelreservate`, en WGS84 et avec une tolérance nulle. Une absence d’intersection ne prouve pas qu’un départ est autorisé. Les fiches d’objet sont consultées pour les exceptions ; un simple nom de réserve ne suffit pas à conclure.

Les repères de Gletterens et Portalban intersectent la partie I de l’objet fédéral 5. Une vérification du départ exact est donc nécessaire. Le lot prépare une mise en attente de la revue de Portalban et conserve l’instantané de son approbation précédente. La base actuelle reste inchangée. Les coordonnées ne sont pas déplacées par approximation.

Les sources communales pour La Tène, Hauterive et Cheyres servent à documenter leurs accès et usages. Elles ne valent pas une confirmation de départ kite. La Brévine reste identifiée comme snowkite conditionné au terrain et à la glace, sans recommandation de kite sur l’eau. La disposition particulière de Promenthoux est distinguée des règles générales du Léman.

Les quatre sites de parapente s’appuient sur les clubs gestionnaires et les panneaux FSVL. Les corrections concernent notamment les orientations, les accès et le niveau du sommet du Moléson. Aucun de ces compléments n’active une approbation automatique. Une correction de difficulté invalide également une approbation antérieure tant qu’une nouvelle revue n’est pas fournie.

Les Alpettes, Le Brassus, Corseaux et Saint-Aubin restent notamment à préciser. Une fiche que sa source décrit comme générée automatiquement et non vérifiée n’est pas utilisée comme preuve de terrain.

## Présentation des fiches

À la demande de l’utilisateur, le bloc « Profil documenté / Détails et sources » est retiré des fiches, ainsi que son chargement de revue devenu inutile. La grille, les styles et les autres fonctionnalités sont conservés. Les contrôles d’éligibilité et le détail des sources restent dans le planificateur.

## Affichage des mois

`normalizeSpotMonths` reconnaît les noms complets français, anglais, allemands et italiens ainsi que les valeurs numériques de 1 à 12. Les valeurs reconnues sont dédupliquées, ordonnées et traduites par la fiche existante. Les tokens inconnus sont ignorés, sans inventer de saison. Le correctif de `SpotPageClient` ne modifie ni le JSX ni les styles. Il ne normalise pas la base.

## Vérification et poursuite

```sh
npm run spots:audit -- --output /tmp/openwind-spot-completeness.json
npm run spots:completions:check
python3 scripts/render-spot-inventory.py --input /tmp/openwind-spot-completeness.json --output /tmp/openwind-spot-inventory.html
```

Ces commandes sont en lecture seule pour la base. L’import est transactionnel, conserve un instantané avant écriture et invalide une approbation antérieure lors d’une modification substantielle sans nouvelle revue. **Ne pas lancer `--apply` avant validation explicite de la publication des données.** Aucun push ni déploiement n’est effectué dans cette passe.

`src/data/spot-research-notes.json` suit les dossiers non résolus : réserves naturelles suisses, départs non confirmés, homonymes, doublons de Monteynard, plans anciens et contraintes dynamiques. Poursuivre fiche par fiche, d’abord auprès de la commune, du gestionnaire, du club ou de l’école opérant sur place. Ne jamais remplir un champ par une supposition destinée à faire disparaître une lacune.

## Suite suisse du 4 novembre

Cinq fiches supplémentaires sont préparées en quatre langues : Rochers-de-Naye, Grindelwald–First, Flumserberg–Prodkamm Charmey–Vounetse et Locarno–Cardada. Sources : panneaux FSVL et club gestionnaire de la Gruyère. Altitudes, accès, orientations et dangers sont repris sans transférer les permissions d’un autre départ. Prodkamm passe de débutant à intermédiaire conformément au panneau. À Charmey, le repère existant est proche de l’atterrissage ; il ne devient pas un décollage qualifié. Aucun repère n’est déplacé. Les cas suisses sans preuve suffisante restent consignés dans les notes de recherche.

Le contrôle supplémentaire de Niederhorn et Oeschinen révèle des contradictions de directions ou de saison qui ne peuvent pas être résolues en choisissant un autre départ. Elles sont consignées avec les panneaux officiels. Le panneau Schwarzsee ne prouve pas davantage les caractéristiques de Kaiseregg. Aucun champ de ces trois fiches n’est rempli par supposition.
