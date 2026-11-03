# Pilote de correction des températures du lac de Zurich

Expérience locale sur les stations Mythenquai et Tiefenbrunnen, sans connexion à l’application ni activation en production. Les entrées normalisées, les URL des réponses brutes et leurs empreintes sont conservées pour permettre un recalcul hors ligne.

## Reproduire les calculs

Depuis la racine du dépôt, avec Python 3.11 ou plus récent :

```sh
python3 -m venv /tmp/openwind-zurich-venv
/tmp/openwind-zurich-venv/bin/pip install -r scripts/water-temperature-pilot/requirements.txt
/tmp/openwind-zurich-venv/bin/python -m unittest discover -s scripts/water-temperature-pilot -p 'test_*.py' -v
/tmp/openwind-zurich-venv/bin/python scripts/water-temperature-pilot/pilot.py --plot docs/data/zurich-water-pilot-2026-11-03.png
```

Le dernier appel utilise uniquement le snapshot dans `docs/data/`. Pour télécharger de nouveau les entrées publiques, ajouter explicitement `--fetch`. Les réponses brutes sont mises en cache compressées dans `/tmp/openwind-zurich-pilot-cache`, avec URL, heure de récupération et SHA-256. Une nouvelle récupération dans un autre cache peut retourner une version révisée des historiques ; conserver le snapshot initial pour comparer les résultats.

Les requêtes restent séquentielles, espacées et limitées à des fenêtres hebdomadaires côté Alplakes. Un 429 arrête le téléchargement et signale `Retry-After`. Aucun secret ni compte n’est nécessaire.

## Méthode

Le protocole `protocol.json` fixe le modèle MITgcm, les profondeurs, les dates, les délais, les candidats de correction et les critères de réussite avant le téléchargement historique. L’ajustement utilise le 22 septembre au 19 octobre 2026 inclus en UTC. Le test réservé couvre le 20 octobre au 2 novembre inclus. Aucune mesure du test ne choisit le coefficient.

Les coordonnées UTM publiées par Tecson sont converties en WGS84 avec PROJ. Elles localisent les stations ; une position distincte du thermomètre immergé n’est pas fournie. Le point de modèle retourné doit rester à moins de 500 m et identique entre les niveaux verticaux. Les deux températures aux niveaux encadrant 1 m sont interpolées avec les **profondeurs réellement renvoyées**, qui diffèrent légèrement du catalogue arrondi.

Les comparaisons suivent les pas de trois heures du modèle. Une mesure valide doit se trouver à moins de cinq minutes. Les températures nulles, états différents de `ok`, valeurs hors de 0–35 °C, doublons contradictoires et horodatages sans fuseau sont rejetés. Les trous ne sont pas comblés. Les heures sont calculées en UTC, y compris lors du changement d’heure.

Les filtres de date sans heure de Tecdottir sont élargis d’une journée de chaque côté ; le script applique ensuite lui-même les bornes UTC exactes. Cela évite de perdre les dernières mesures d’une journée lorsque le filtre distant s’appuie sur une date locale.

Pour chaque station évaluée, le résidu vient uniquement de l’autre station :

```text
résidu_source(s) = observation_source(s) − modèle_source(s)
correction_cible(t) = modèle_cible(t) + alpha × résidu_source(s)
```

L’observation source et la validité de son modèle doivent toutes deux précéder `t − délai`. Le délai principal est d’une heure ; la cadence du modèle rend le résidu généralement vieux de trois heures. Les scénarios de trois et six heures réutilisent le coefficient choisi, sans nouvel ajustement. Une mesure à trois heures et quelques minutes peut sélectionner un résidu plus ancien : son âge maximal reste borné à sept heures.

Un coefficient commun `alpha`, choisi parmi 0, 0,25, 0,5, 0,75 et 1, minimise l’erreur absolue sur la seule période d’ajustement. En cas d’égalité, le plus petit est retenu. Un coefficient nul permet de conclure que la correction n’apporte rien. Le test compare ensuite modèle brut, correction dynamique et simple décalage constant propre à chaque station, calculé sur l’ajustement seulement. Ce décalage est la médiane des résidus d’ajustement, optimale pour leur MAE.

La MAE est l’erreur absolue moyenne ; le RMSE pénalise davantage les grosses erreurs ; le biais est la moyenne de `prédiction − mesure`. Les métriques utilisent les **mêmes couples** pour chaque méthode. La couverture est comparée au nombre de pas attendus sur le calendrier, pas seulement aux points effectivement téléchargés.

L’incertitude du gain de MAE utilise 10 000 rééchantillonnages de journées UTC complètes, en conservant les deux stations ensemble et avec une graine fixe. Cet intervalle tient compte des dépendances à l’intérieur d’une journée ; il reste conditionnel au coefficient ajusté et ne modélise pas toute la dépendance entre journées successives.

## Interpréter les résultats

Le seuil fixé demande un gain global de MAE d’au moins 10 %, un intervalle de gain entièrement positif, aucune dégradation de MAE d’une station, au moins dix jours et 80 % de couverture dans chaque station. Le résultat et chaque condition sont dans le JSON de sortie. Passer ce seuil établit seulement un signal favorable sur ce test rétrospectif.

Les séries Alplakes historiques ne fournissent pas ici les dates originales d’émission des prévisions ni leurs versions successives. Les délais de publication des observations ne sont pas archivés non plus. Le pilote mesure donc la correction de séries historiques sous une hypothèse de disponibilité, sans établir un gain opérationnel de prévision à plusieurs jours. L’indépendance vis-à-vis de notre ajustement ne garantit pas que l’Eawag n’a jamais utilisé ces stations pour calibrer son propre modèle.

Deux stations distantes d’environ 2,15 km ne valident ni un champ IDW sur tout le lac, ni toutes les saisons. Avant une activation, collecter prospectivement les prévisions et mesures telles qu’elles arrivent, vérifier les délais réels, élargir les saisons et disposer d’au moins une troisième station pour tester une interpolation spatiale entre plusieurs capteurs.

## Sources et licences

- [Ville de Zurich et documentation des mesures à 1 m](https://data.stadt-zuerich.ch/dataset/sid_wapo_wetterstationen) : observations CC0, obtenues via l’API publique recommandée Tecdottir.
- [Documentation Tecdottir](https://tecdottir.metaodi.ch/docs/) : pagination et tri explicites.
- [Mythenquai](https://www.tecson-data.ch/zurich/mythenquai/index.php) et [Tiefenbrunnen](https://www.tecson-data.ch/zurich/tiefenbrunnen/index.php) : coordonnées des stations. Aucun historique de mesures n’est aspiré sur ces pages.
- [API Alplakes](https://alplakes-api.eawag.ch/docs) et [métadonnées MITgcm Zurich](https://alplakes-api.eawag.ch/simulations/metadata/mitgcm/zurich) : températures de modèle Alplakes / Eawag, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Transformations Openwind : interpolation verticale et correction des températures, avec conservation des valeurs brutes normalisées.
