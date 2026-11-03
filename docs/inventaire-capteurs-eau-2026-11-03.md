# Capteurs de température d’eau pour Openwind

État du 3 novembre 2026. Périmètre : les 23 lacs et secteurs lacustres des guides Openwind, en commençant par la Gruyère. L’objectif est de trouver des mesures réelles, accessibles gratuitement et accompagnées de conditions de réutilisation, pour évaluer une correction des modèles Alplakes.

**La Gruyère ne dispose d’aucun flux public de température du lac confirmé dans cet inventaire. Huit autres lacs disposent de mesures candidates accessibles, avec une réserve de profondeur sur Ägeri.** Le Léman, Zurich et Lugano offrent plusieurs points de mesure, donc les meilleures bases pour étudier une correction spatiale. Une source candidate permet un pilote ; elle ne démontre pas encore un gain de précision.

## Lac de la Gruyère

Le catalogue Datalakes consulté contient 108 jeux de données et aucun jeu rattaché à la Gruyère. L’API Alplakes fournit bien le modèle 1D Simstrat, mais ces températures calculées ne peuvent pas servir de référence indépendante pour corriger ce même modèle. [Catalogue Datalakes](https://api.datalakes-eawag.ch/datasets), [métadonnées Alplakes de la Gruyère](https://alplakes-api.eawag.ch/simulations/1d/metadata/simstrat/gruyere).

Le Club de voile de la Gruyère affiche un iframe de lake.lindt.one. Il ne fournit donc pas, sur cette page, une seconde source de mesures réelles. Le canton signale un suivi des lacs de la Gruyère et de Schiffenen avec des prélèvements annuels : ce suivi peut fournir des références ponctuelles, mais pas un flux continu documenté pour une correction en direct. [CVG](https://www.cvgruyere.ch/), [surveillance cantonale](https://www.fr.ch/energie-agriculture-et-environnement/environnement/etat-de-lenvironnement-indicateurs/eaux-indicateurs).

La station OFEV de la Sarine à Broc est sur une rivière en amont du lac. La température mesurée à Gümmenen est plus loin en aval, après d’autres retenues. Ces points ne constituent pas des mesures de surface à Morlon. Aucun ne doit être utilisé comme correction locale automatique du lac. [API OFEV](https://data.bafu.admin.ch/fr/dataproduct-water-observations).

**Décision pour Morlon : conserver Alplakes seul.** Pour aller plus loin, les interlocuteurs utiles sont le Service de l’environnement de Fribourg, Groupe E et les acteurs nautiques locaux. Les questions à clarifier sont l’existence d’une sonde immergée récente, sa profondeur réelle malgré les variations du niveau du lac, la disponibilité de son historique et le droit de redistribuer les mesures. Aucun message n’a été envoyé et aucun capteur à acheter n’est proposé à ce stade.

## Mesures candidates accessibles

Les valeurs ci-dessous sont des contrôles d’accès datés du **3 novembre 2026**, pas des températures à reprendre comme valeurs actuelles dans Openwind. Horaires en **UTC** ; ajouter une heure pour l’heure suisse à cette date. Les profondeurs de premier capteur viennent du fichier récent et de la définition Datalakes « temperature of the top-most sensor ». Pour intégrer un profil à 1 m, sélectionner le niveau compatible plutôt que réutiliser systématiquement le champ de surface.

| Lac et emplacement | Source physique et accès | Profondeur du contrôle | Dernière mesure vérifiée | Licence déclarée | Usage possible |
| --- | --- | --- | --- | --- | --- |
| Léman, LéXPLORE | [Chaîne de thermistances 448](https://api.datalakes-eawag.ch/datasets/448), API sans clé | Premier capteur 0,25 m ; chaîne sur plusieurs profondeurs | 07:10, 11,66 °C | MIT dans le catalogue | Pilote près de la plateforme, niveau à adapter au modèle |
| Léman, Buchillon | [Station 597](https://api.datalakes-eawag.ch/datasets/597), variable `wt1`, API sans clé | 1 m indiqué par le canal `wt1`, à confirmer dans la documentation d’installation avant raccordement | 05:00, 13,00 °C | MIT dans le catalogue | Deuxième point spatial prometteur ; contrôler les indicateurs qualité |
| Morat | [Chaîne 956](https://api.datalakes-eawag.ch/datasets/956), API sans clé | Premier capteur 0,5 m | 07:00, 11,45 °C | MIT dans le catalogue | Pilote local et comparaison verticale |
| Hallwil | [Chaîne 1046](https://api.datalakes-eawag.ch/datasets/1046), API sans clé | Premier capteur 0,5 m | 07:20, 13,12 °C | MIT dans le catalogue | Pilote local et comparaison verticale |
| Ägeri | [Profileur Idronaut 1077](https://api.datalakes-eawag.ch/datasets/1077), API sans clé | Premier niveau du fichier récent 2 m | 06:19, 12,51 °C | MIT dans le catalogue | Comparer au modèle à 2 m ; ne pas présenter ce contrôle comme une mesure à 1 m |
| Quatre Cantons, Kastanienbaum | [Capteur 1264](https://api.datalakes-eawag.ch/datasets/1264), API sans clé | 0,5 m dans le fichier récent | 07:29, 13,00 °C | MIT dans le catalogue | Pilote à proximité ; ne couvre pas automatiquement l’Urnersee |
| Majeur, Porto Ronco | [Bouée 1333](https://api.datalakes-eawag.ch/datasets/1333), canal `Temp_1m` | 1 m explicite | 06:55, 15,21 °C | MIT dans le catalogue | Bon candidat pour un pilote à 1 m |
| Lugano, Castagnola | [Bouée 1334](https://api.datalakes-eawag.ch/datasets/1334), canal `Temp_1m` | 1 m explicite | 06:55, 16,33 °C | MIT dans le catalogue | Référence pour le bassin nord |
| Lugano, bassin sud | [Chaîne 1443](https://api.datalakes-eawag.ch/datasets/1443), API sans clé | Premier capteur 0,4 m | 07:00, 15,95 °C | **CC BY 4.0** | Comparaison verticale ; conserver la distinction entre bassins |
| Lugano, Figino | [Sonde 1399](https://api.datalakes-eawag.ch/datasets/1399), API sans clé | 1 m selon le titre du jeu | 06:05, 16,00 °C | MIT dans le catalogue | Référence ponctuelle dans le bassin sud |
| Lugano, Magliaso | [Sonde 1400](https://api.datalakes-eawag.ch/datasets/1400), API sans clé | 1 m selon le titre du jeu | 05:05, 16,06 °C | MIT dans le catalogue | Référence ponctuelle dans le bassin sud |
| Lugano, Riva San Vitale | [Sonde 1401](https://api.datalakes-eawag.ch/datasets/1401), API sans clé | 1 m selon le titre du jeu | 05:55, 16,02 °C | MIT dans le catalogue | Référence ponctuelle dans le bassin sud |
| Lugano, Vico Morcote | [Sonde 1402](https://api.datalakes-eawag.ch/datasets/1402), API sans clé | 1 m selon le titre du jeu | 06:05, 16,14 °C | MIT dans le catalogue | Référence ponctuelle dans le bassin sud |
| Zurich, Mythenquai | [Open Data Zürich](https://data.stadt-zuerich.ch/dataset/sid_wapo_wetterstationen), API Tecdottir et archives CSV | **1 m documenté par la ville** | 06:30, 13,10 °C, statut `ok` | **CC0** pour les données | Bon candidat à faible ambiguïté de profondeur et de licence |
| Zurich, Tiefenbrunnen | Même jeu de données, autre station | **1 m documenté par la ville** | 06:30, 13,80 °C, statut `ok` | **CC0** pour les données | Deuxième point pour un pilote spatial près de Zurich |

Les treize flux Datalakes ci-dessus et les deux stations de Zurich ont effectivement renvoyé une valeur numérique sans compte ni clé. Deux flux proches d’un même emplacement ne représentent pas nécessairement deux sites indépendants. La fréquence exacte de chaque sonde et la continuité de ses archives devront être mesurées avant tout usage automatique ; la fréquence d’un contrôle serveur n’est pas celle du capteur.

**Licences Datalakes :** le champ `licenses_id` rattache chaque jeu à une licence ; il ne faut pas appliquer globalement la CC BY d’Alplakes aux observations de tiers. La plupart des jeux ci-dessus déclarent MIT, et le jeu 1443 déclare CC BY 4.0. Le champ de citation demande de prendre contact pour la forme du crédit. Il faut conserver la licence, les notices applicables et une attribution explicite ; la citation exacte des jeux MIT reste à préciser avec leur propriétaire avant diffusion. [Licences du catalogue](https://api.datalakes-eawag.ch/selectiontables/licenses), [documentation de l’API](https://www.datalakes.eawag.ch/api).

**Zurich :** la licence MIT de Tecdottir concerne son logiciel ; les observations de la ville sont en CC0. Utiliser les paramètres documentés de date et d’ordre : un appel limité sans tri explicite a retourné une archive de 2007 pendant le contrôle. Le filtre `startDate=2026-11-03&sort=timestamp_utc%20desc&limit=1` a bien renvoyé les mesures du jour. [Documentation Tecdottir](https://tecdottir.metaodi.ch/docs/).

## Couverture des 23 lacs et secteurs Openwind

« Pilote » désigne une source de mesures candidate pour une comparaison locale, pas une correction déjà validée. « Non trouvé » se limite aux catalogues publics et sources examinés le 3 novembre 2026 ; cela ne signifie pas qu’aucune sonde privée ou cantonale n’existe.

| Lac ou secteur | Mesures disponibles et limite | Décision |
| --- | --- | --- |
| Gruyère | Aucun flux public du lac confirmé ; modèle Simstrat disponible | Garder le modèle ; rechercher un partenaire local |
| Léman | LéXPLORE et Buchillon récents | Pilote près des stations |
| Neuchâtel | [Profils CTD cantonaux 1339](https://api.datalakes-eawag.ch/datasets/1339), dernier profil annoncé le 11 décembre 2025 | Validation historique ; pas de correction en direct |
| Silvaplana | [Profils 637](https://api.datalakes-eawag.ch/datasets/637), dernier profil annoncé le 7 juillet 2020 | Historique uniquement |
| Urnersee | Capteur de Kastanienbaum dans un autre bassin des Quatre Cantons ; Reuss à Seedorf en rivière | Aucune référence locale confirmée ; garder le modèle |
| Majeur | Bouée de Porto Ronco à 1 m | Pilote à proximité de la bouée |
| Bienne | [Profils 1337](https://api.datalakes-eawag.ch/datasets/1337), dernier profil annoncé le 10 décembre 2025 ; Aar à Brügg en sortie | Historique ; exutoire à étudier séparément |
| Constance | [Bregenz 200337](https://vowis.vorarlberg.at/stationswrapper/bodensee), mesures publiées à 0,5 et 2,5 m ; accès web gratuit | API, historique automatisable et licence de redistribution à confirmer auprès de la source primaire |
| Zurich | Mythenquai et Tiefenbrunnen, 1 m, CC0 | Pilote prioritaire |
| Thoune | [Profils 1336](https://api.datalakes-eawag.ch/datasets/1336), dernier profil annoncé le 8 décembre 2025 ; Aar à Thoune en sortie | Historique ; pas de correction des plages avec la seule rivière |
| Morat | Chaîne récente 956 | Pilote près de la chaîne |
| Quatre Cantons | Kastanienbaum récent, 0,5 m | Pilote dans ce secteur ; compartimenter les bassins |
| Lugano | Castagnola, chaîne du bassin sud et quatre sondes à 1 m | Pilote prioritaire, avec séparation des bassins |
| Walensee | Aucune sonde lacustre récente trouvée dans Datalakes ; Linth à Weesen en sortie | Garder le modèle pour les plages ; étudier l’exutoire séparément |
| Joux | [Chaîne 643](https://api.datalakes-eawag.ch/datasets/643), dernier point vérifié le **7 novembre 2024**, licence Apache 2.0 déclarée | Archive utile ; pas un flux actuel. Vérifier une éventuelle reprise avec Eawag |
| Zoug | [Profils 1325](https://api.datalakes-eawag.ch/datasets/1325), dernier profil annoncé le 7 octobre 2026 ; autres profils 1369 ; piste Aquascope annoncée par Eawag | Comparaison ponctuelle ; flux Aquascope et licence à clarifier |
| Brienz | [Profils 1335](https://api.datalakes-eawag.ch/datasets/1335), dernier profil annoncé le 8 décembre 2025 ; Aar à Ringgenberg en sortie | Historique ; exutoire secondaire |
| Sempach | Aucun flux de température récent confirmé dans les catalogues examinés | Garder le modèle |
| Sils | [Profils 636](https://api.datalakes-eawag.ch/datasets/636), dernier profil annoncé le 7 juillet 2020 | Historique uniquement |
| Sihlsee | Pas de flux récent confirmé ; campagnes Eawag documentées en 2014–2016 | Garder le modèle ; données historiques possibles auprès des propriétaires |
| Ägeri | Profileur récent 1077 à partir de 2 m ; canal immergé de surface 1074 renvoyant `null` au contrôle | Pilote à 2 m ; ne pas substituer la température infrarouge de peau à celle de l’eau à 1 m |
| Hallwil | Chaîne récente 1046 | Pilote près de la chaîne |
| Sarnen | Aucun flux de température récent confirmé dans les catalogues examinés | Garder le modèle |

Une annonce officielle Eawag signale aussi un Aquascope au lac de Zoug avec des capteurs de température et d’oxygène. L’accès aux mesures et leur licence restent à clarifier ; cette annonce n’est pas comptée parmi les flux vérifiés. [Annonce Eawag](https://www.eawag.ch/de/info/portal/aktuelles/news/pdf/?cHash=e0849921f523fb150491e376bbc0be39&tx_news_pi1%5Bcontroller%5D=News&tx_news_pi1%5Bnews%5D=104661).

Les profils CTD historiques sont de véritables mesures d’eau, souvent précieuses pour vérifier une saison ou un biais de profondeur. Un profil mensuel ou ancien ne doit pas devenir une correction dite « en temps réel ».

## Références à ne pas confondre avec la température du lac

Le catalogue OFEV confirme des températures réelles récentes dans **l’Aar à Thoune 2030**, **l’Aar à Brügg 2029**, **l’Aar à Ringgenberg 2457**, **la Linth à Weesen 2104**, **la Reuss à Lucerne 2152** et **le Rhône à Genève 2606**. Ces mesures peuvent décrire l’exutoire, mais pas automatiquement un spot de rive ni l’ensemble du lac. Les affluents comme la Menthue à Yvonand, la Reuss à Seedorf ou le Rhône à Porte du Scex sont encore moins adaptés à une correction des plages.

La recherche OFEV a croisé **253 stations actives** avec un extrait contenant **78 stations ayant des valeurs `WT`** récentes. Les stations lacustres de niveau d’eau ne deviennent pas des capteurs de température parce qu’elles portent le nom du lac. [Description des observations OFEV](https://data.bafu.admin.ch/fr/dataproduct-water-observations).

L’API officielle OFEV est gratuite et autorise les usages commerciaux avec indication obligatoire de la source sur la nouvelle plateforme. L’API tierce Existenz annonce, elle, un usage public et non commercial : pour Openwind, privilégier l’accès officiel. [Licence de la plateforme OFEV](https://data.bafu.admin.ch/fr/lizenz-und-quelle), [conditions Existenz](https://api.existenz.ch/).

Les Bains des Pâquis publient une température d’eau, mais l’API, la profondeur et une licence de réutilisation n’ont pas été confirmées ici. Cette source reste un partenaire potentiel ; aucun prélèvement automatique n’est proposé sans clarification. [Bains des Pâquis](https://www.bains-des-paquis.ch/index.php).

## Ordre conseillé pour un pilote

1. **Zurich** : deux mesures à 1 m, profondeur et licence CC0 explicites, archives accessibles. Comparer les deux stations au modèle et réserver des périodes de validation.
2. **Léman** : LéXPLORE et Buchillon permettent une première étude spatiale. Adapter la profondeur, contrôler la qualité et limiter l’influence de chaque station à un secteur validé.
3. **Lugano** : réseau de plusieurs sondes à 1 m et de chaînes, en respectant la séparation entre bassins. Vérifier si la variante Alplakes retenue assimile déjà certaines de ces observations.
4. **Morat, Hallwil et Porto Ronco** : commencer par une correction au voisinage de la sonde, puis tester si elle améliore réellement les autres spots. Ägeri et Kastanienbaum demandent d’abord l’alignement des profondeurs.
5. **Gruyère** : aucune correction automatique tant qu’une référence lacustre réelle et réutilisable n’est pas identifiée.

Une mesure récente prouve l’accès à une donnée ; elle ne prouve ni la précision du capteur, ni son indépendance de la calibration scientifique Eawag, ni la validité d’une correction sur tout le lac. Les tests doivent utiliser des périodes ou des stations réservées, écarter les valeurs de mauvaise qualité et comparer l’erreur au modèle seul avant activation.

L’inventaire structuré associé conserve les identifiants, coordonnées disponibles, axes d’API, profondeurs, licences déclarées et contrôles d’accès. **Aucun raccordement supplémentaire, abonnement, envoi de message ou déploiement n’a été effectué.**
