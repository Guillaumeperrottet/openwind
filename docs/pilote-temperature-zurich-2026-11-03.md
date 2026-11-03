# Validation de la correction des températures du lac de Zurich

**La correction réduit l’erreur absolue moyenne de 0,92 à 0,15 °C sur les deux semaines de test réservées, soit un gain de 83,6 %.** Les deux stations s’améliorent et les critères fixés avant le téléchargement sont atteints. Le résultat justifie un suivi en conditions réelles ; il ne valide pas encore des prévisions corrigées sur tout le lac ou à plusieurs jours.

Les calculs, données et graphiques restent locaux. Aucune correction n’a été branchée sur les fiches de spots, aucun déploiement ni push n’a été effectué.

## Résultats du test réservé

Période du **20 octobre au 2 novembre 2026 inclus, en UTC**. La MAE est l’écart absolu moyen entre température calculée et mesure de la sonde. Chaque méthode est évaluée sur les mêmes points disponibles.

| Station | Comparaisons | Alplakes brut | Correction Openwind | Réduction de MAE | Couverture des 112 horaires attendus |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mythenquai | 90 | 0,864 °C | 0,152 °C | 82,4 % | 80,4 % |
| Tiefenbrunnen | 101 | 0,978 °C | 0,151 °C | 84,5 % | 90,2 % |
| Ensemble | 191 | 0,924 °C | 0,151 °C | 83,6 % | 85,3 % |

Le RMSE, qui pénalise les grosses erreurs, passe de **0,947 à 0,201 °C**. Le 90e percentile des erreurs absolues passe de **1,146 à 0,290 °C**. Le gain global de MAE est positif chaque jour du test, sur les observations disponibles.

Un rééchantillonnage par journées complètes donne un intervalle à 95 % du gain de MAE de **0,685 à 0,859 °C**. Cet intervalle est conditionnel à l’ajustement et à cette courte période ; les dépendances entre journées successives et les changements de saison restent à explorer.

Le modèle brut est systématiquement plus froid que les observations dans ce test. Après correction, le biais moyen reste de **+0,110 °C à Mythenquai** et **−0,104 °C à Tiefenbrunnen**. Ces écarts opposés se compensent dans la moyenne globale ; ils ne doivent pas être interprétés comme une absence de biais local. La plus grosse erreur corrigée atteint encore **0,933 °C**, à Tiefenbrunnen le 27 octobre à 15 h UTC, lors d’une variation rapide.

## Une correction dynamique apporte plus qu’un décalage constant

Un décalage constant propre à chaque station, égal à la médiane de ses résidus pendant l’ajustement, donne une MAE de **0,384 °C** sur le test. La correction dynamique donne **0,151 °C**, soit environ **60,5 % de moins** que cette solution simple. Le gain ne repose donc pas uniquement sur l’ajout d’une constante choisie à l’avance.

Le coefficient commun choisi sur la période d’ajustement est **alpha = 1** parmi les cinq valeurs fixées 0, 0,25, 0,5, 0,75 et 1. Les mesures de la période de test ne participent pas à ce choix.

## Comparaison sans utiliser la sonde évaluée comme entrée

Le modèle est **Alplakes MITgcm Zurich en 3D**, avec un pas de trois heures. Les deux sondes mesurent à **1 m**, profondeur documentée par la [Ville de Zurich](https://data.stadt-zuerich.ch/dataset/sid_wapo_wetterstationen). Les niveaux réellement retournés par Alplakes, **0,7575 et 1,2805 m**, sont interpolés verticalement à 1 m.

Les coordonnées publiées des stations, distantes d’environ **2,15 km**, sont utilisées sans recherche du point qui donnerait les meilleures erreurs. Les cellules de modèle retournées sont à **134,8 m de Mythenquai** et **177,4 m de Tiefenbrunnen**. Les coordonnées exactes des thermomètres immergés ne sont pas fournies séparément de celles des stations.

La correction de Mythenquai utilise uniquement le dernier écart entre **la mesure de Tiefenbrunnen et son propre modèle**, et réciproquement. Aucune mesure de la sonde évaluée n’entre dans sa propre correction dynamique sur le test. Les erreurs des deux stations pendant l’ajustement servent toutefois à choisir le coefficient commun.

La période d’ajustement couvre le **22 septembre au 19 octobre inclus** ; les quatorze jours suivants sont réservés au test. Le protocole local fixe les dates, le modèle, les candidats et les seuils avant le téléchargement historique.

Une marge minimale d’une heure est imposée entre la mesure source et l’heure évaluée. Avec la cadence de trois heures du modèle, les résidus effectivement utilisés sur le test ont **trois à six heures d’âge**. Ni mesure future ni interpolation temporelle du modèle ne sont utilisées.

## Retards et données manquantes

| Délai minimal simulé | Comparaisons | MAE brute sur ces points | MAE corrigée | Couverture Mythenquai et Tiefenbrunnen |
| --- | ---: | ---: | ---: | --- |
| 1 h | 191 | 0,924 °C | 0,151 °C | 80,4 % et 90,2 % |
| 3 h | 191 | 0,924 °C | 0,151 °C | 80,4 % et 90,2 % |
| 6 h | 164 | 0,919 °C | 0,156 °C | 73,2 % et 73,2 % |

Les scénarios conservent le même coefficient, sans réajustement. Un et trois heures sélectionnent ici les mêmes résidus. À six heures, la précision reste favorable sur les points disponibles, mais la couverture passe sous le seuil de 80 % : les résidus de plus de sept heures sont rejetés. Les populations diffèrent entre scénarios ; l’écart de MAE ne mesure donc pas uniquement l’effet du délai.

Le snapshot contient **5 236 mesures à Mythenquai et 5 538 à Tiefenbrunnen**, sur 6 048 horaires de dix minutes attendus pour chaque station. Les trous ne sont pas comblés. Pour le test principal, 22 mesures cibles de Mythenquai et 11 de Tiefenbrunnen manquent aux horaires du modèle. **Mythenquai ne dépasse le seuil de couverture que de 0,4 point** ; les horaires manquants limitent la représentativité des erreurs annoncées.

## Décision et prochaine validation

Les cinq conditions du pilote sont satisfaites : réduction globale de MAE supérieure à 10 %, intervalle du gain entièrement positif, amélioration dans chaque station, quatorze jours de test et couverture d’au moins 80 % par station.

La prochaine étape pertinente est de **collecter en parallèle, sans modifier les températures affichées**, les prévisions telles qu’elles sont émises et les mesures telles qu’elles arrivent. Cela permettra de vérifier les délais réels, les révisions du modèle, les pannes et les changements de régime thermique. Un repli vers le modèle brut sera nécessaire lorsque les références deviennent trop anciennes.

Les archives utilisées ne permettent pas de reconstituer les versions des prévisions réellement disponibles à chaque date passée. Le gain mesuré est donc **rétrospectif**, sans preuve d’un gain de prévision opérationnelle à plusieurs jours. L’indépendance du test vis-à-vis de notre ajustement ne garantit pas non plus que l’Eawag n’a jamais utilisé ces stations pour calibrer son modèle.

Deux stations proches valident un transfert de résidu entre ces deux sites. Elles ne valident pas une interpolation IDW entre plusieurs capteurs, les plages éloignées, l’été, la Gruyère ni une équivalence avec l’algorithme de lake.lindt.one.

## Fichiers et reproduction

- Méthode, commandes et tests : `scripts/water-temperature-pilot/README.md`.
- Protocole figé : `scripts/water-temperature-pilot/protocol.json`.
- Entrées normalisées, attribution, URL et empreintes des réponses : `docs/data/zurich-water-pilot-2026-11-03.json`.
- Résultats détaillés : `docs/data/zurich-water-pilot-results-2026-11-03.json`.
- Graphique : `docs/data/zurich-water-pilot-2026-11-03.png`.

Le recalcul hors ligne reproduit les résultats. Onze tests vérifient notamment les délais, l’exclusion de la sonde cible, l’absence d’influence du test sur le coefficient, les fuseaux horaires, les trous, les unités et l’interpolation verticale. Les MAE et la chronologie des entrées ont aussi été recalculées séparément.

## Sources et attribution

Observations **Wasserschutzpolizei / Stadt Zürich, CC0**, obtenues par [Tecdottir](https://tecdottir.metaodi.ch/docs/), l’API recommandée par la [Ville](https://data.stadt-zuerich.ch/dataset/sid_wapo_wetterstationen). Coordonnées publiées par Tecson pour [Mythenquai](https://www.tecson-data.ch/zurich/mythenquai/index.php) et [Tiefenbrunnen](https://www.tecson-data.ch/zurich/tiefenbrunnen/index.php).

Modèle **Alplakes / Eawag, CC BY 4.0**, [API publique](https://alplakes-api.eawag.ch/docs), [métadonnées MITgcm Zurich](https://alplakes-api.eawag.ch/simulations/metadata/mitgcm/zurich), [licence](https://creativecommons.org/licenses/by/4.0/). Transformations Openwind : sélection et alignement des observations, interpolation verticale à 1 m, correction et calcul des erreurs. Aucun accès à une API de lake.lindt.one, aucune clé payante.
