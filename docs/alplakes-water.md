# Température de l’eau — essai local sur Morlon

Vérification le 3 novembre 2026, directement sur l’API publique Alplakes / Eawag. Aucune requête à lake.lindt.one, aucun compte, abonnement ou clé payante.

## Couverture vérifiée

- Le catalogue 3D ne contient pas `gruyere`.
- Le catalogue 1D contient `gruyere`, modèle **Simstrat**, températures `T` en `degC`, profondeurs de 1 à 74 m. La couverture annoncée allait du 1er octobre 1989 au 6 novembre 2026 lors de la vérification.
- Une requête à **1 m** a renvoyé une série exploitable, avec des pas de trois heures. Par exemple : **15,009 °C pour le 3 novembre 2026 à 07:00:02 UTC**. Ce chiffre illustre la vérification ; il n’est jamais utilisé comme valeur de secours dans l’application.
- Il s’agit d’une colonne d’eau représentative du lac, sans coordonnées horizontales dans cet endpoint. Ce n’est ni une sonde à Morlon, ni une estimation 3D propre à la plage.

Endpoints vérifiés :

- [Documentation et conditions de l’API](https://alplakes-api.eawag.ch/docs)
- [Catalogue 3D](https://alplakes-api.eawag.ch/simulations/metadata)
- [Métadonnées Gruyère / Simstrat](https://alplakes-api.eawag.ch/simulations/1d/metadata/simstrat/gruyere)
- Série : `/simulations/1d/point/simstrat/gruyere/{start_UTC_YYYYmmddHHMM}/{end_UTC_YYYYmmddHHMM}/1?variables=T`

## Affichage et exploitation

Le bloc est actif par défaut **en développement**, uniquement sur l’identifiant de Morlon `cmnq613tx00it04kw1d0vraq4`, dans les quatre langues. Les anciens liens de maquette `?preview=water` continuent d’ouvrir la fiche, désormais connectée en local. En production, l’activation exige explicitement `ALPLAKES_WATER_ENABLED=true`. Aucune variable de production ni migration n’a été appliquée pour cet essai.

- Le serveur interroge l’API officielle avec un User-Agent Openwind et un contact public. Le navigateur ne sollicite jamais directement Alplakes.
- Cache Next des réponses pendant 24 h, déduplication des requêtes simultanées dans le processus, fenêtre de quelques jours seulement et bornée par les métadonnées. La fenêtre quotidienne fournit le point actuel et les prochains jours. L’actualisation suit la cadence quotidienne du modèle, sans polling par visiteur.
- Délai maximal de 8 s par requête. En cas d’échec, pause de 5 min au minimum ; `Retry-After` est respecté, avec une borne de 24 h. Pas de retry immédiat sur 429.
- Le bloc est chargé dans une frontière Suspense séparée : une panne Alplakes laisse fonctionner les mesures et prévisions de vent.
- La température affichée correspond au dernier pas de modèle **antérieur ou égal à l’heure présente**. Date de validité explicite en heure suisse, jamais présentée comme heure de mesure ou de lancement du modèle. Le temps courant est réévalué côté client, sans nouvelle requête au fournisseur.
- À partir de 6 h sans pas récent : « estimation ancienne ». Après 24 h : température masquée. Une absence ou un échec n’est jamais converti en 0 °C.
- Les prévisions indiquent les minima et maxima des **échantillons disponibles** aux heures affichées, par jour suisse. Il ne s’agit pas d’extrêmes garantis sur une journée entière. Valeurs affichées au dixième.
- Métadonnées, unités, profondeur et séries sont contrôlées ; valeurs nulles, horodatages ambigus et valeurs aberrantes sont rejetés.

## Attribution et calibration

Données Alplakes / Eawag, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le bloc donne accès à la plateforme, à la licence, au modèle et aux explications. Les valeurs sont arrondies pour l’affichage ; aucune correction locale n’est appliquée par Openwind.

Les modèles Eawag sont déjà calibrés scientifiquement. Une couche locale comparable à celle de Nicolas serait un travail supplémentaire : sources de mesures autorisées, profondeur et position compatibles, validation sur des données indépendantes et suivi de l’erreur. L’accès libre au modèle ne démontre pas que cette couche serait inutile ni que nous obtenons les mêmes résultats. Cet essai ne la reproduit pas.

Les fixtures de test viennent des réponses publiques réellement vérifiées. Les tests courants ne sollicitent pas l’API externe.

## Première page du lac en local

Une page dédiée est disponible à `/fr/lacs/gruyere`, avec les variantes `de`, `it` et `en`. Elle réutilise exactement la série à 1 m et le cache serveur du bloc de Morlon, sans requête supplémentaire par profondeur ou par visiteur. Le bloc de Morlon propose un lien vers cette page lorsqu’elle est activée.

La lecture principale garde le dernier pas de modèle antérieur à l’heure présente. Le graphique montre jusqu’à 24 h de passé modélisé et les points de prévision effectivement disponibles dans les 72 h suivantes. Le passé est en pointillés, les prévisions en trait continu, avec une frontière « Maintenant ». La ligne est interpolée graphiquement entre les échantillons ; la valeur principale et le tableau horaire restent les valeurs réelles des pas de modèle, sans nouvelle estimation à l’heure courante. Les trous de plus de quatre heures ne sont pas reliés. L’axe vertical agrandi est explicitement annoncé.

Les plages quotidiennes précisent les heures couvertes et ne sont pas affichées comme prévisions récentes si le dernier pas actuel a plus de six heures. Les explications rappellent qu’une colonne unique ne décrit pas les différences entre plages et qu’aucune correction locale ni sonde en direct n’est utilisée. Le pilote de Zurich n’est pas transposé à la Gruyère.

La passe qualité du 3 novembre prépare cette page à une publication indexable : elle est désormais activée par défaut, avec canonique, alternatives linguistiques et présence au sitemap. `ALPLAKES_LAKE_PAGE_ENABLED=false` reste un interrupteur pour désactiver la route et retirer ses liens d’accès ainsi que ses entrées du sitemap, indépendamment de `ALPLAKES_WATER_ENABLED`. Rien n’a été poussé ni configuré en production. Le lien source pointe vers la page officielle vérifiée `https://www.alplakes.eawag.ch/gruyere`. Voir `docs/quality-seo.md` pour les contrôles.
