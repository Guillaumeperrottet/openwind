# Référence API

Tous les endpoints sont sous `/api/`. Les réponses sont en JSON.

Les visiteurs peuvent conserver jusqu'à 12 favoris sur leur appareil, sans
compte. Les préférences de sport et d'unité sont également locales avant la
connexion. La lecture des fiches et des conditions reste publique.

---

## Spots

La lecture des spots reste publique. La création et l'ajout de nouvelles photos
exigent un compte connecté (session Supabase vérifiée côté serveur). L'édition
des fiches et la suppression des spots ou photos sont réservées aux comptes
administrateurs configurés dans `ADMIN_USER_IDS`. Une session absente ou expirée
renvoie `401` ; un compte sans les droits administrateur reçoit `403`.

### `GET /api/spots`

Liste tous les spots. Optionnel : filtre par distance.

| Param    | Type   | Description                  |
| -------- | ------ | ---------------------------- |
| `lat`    | number | Latitude centre (optionnel)  |
| `lng`    | number | Longitude centre (optionnel) |
| `radius` | number | Rayon en km (optionnel)      |

**Réponse** : `Spot[]` avec `images[]`. Si filtre distance, ajoute `distanceKm`.

### `POST /api/spots`

Crée un spot. Validation Zod.

| Champ                | Type               | Requis |
| -------------------- | ------------------ | ------ |
| `name`               | string (min 2)     | Oui    |
| `latitude`           | number (-90..90)   | Oui    |
| `longitude`          | number (-180..180) | Oui    |
| `difficulty`         | Difficulty enum    | Oui    |
| `waterType`          | WaterType enum     | Oui    |
| `sportType`          | SportType enum     | Oui    |
| `minWindKmh`         | number (0..100)    | Oui    |
| `maxWindKmh`         | number (0..150)    | Oui    |
| `bestMonths`         | string[]           | Oui    |
| `bestWindDirections` | string[]           | Oui    |
| `hazards`            | string             | Non    |
| `access`             | string             | Non    |
| `nearestStationId`   | string             | Non    |

**Réponse** : `201` avec le spot créé.

### `GET /api/spots/[id]`

Détail d'un spot avec `images[]` et les 20 derniers `reports[]`.

### `PATCH /api/spots/[id]`

Met à jour un spot (administrateur). Tous les champs sont optionnels. Validation :
`maxWindKmh ≥ minWindKmh`, y compris lorsqu'une seule borne est modifiée.

### `DELETE /api/spots/[id]`

Supprime un spot. Réponse : `{ ok: true }`.

### `GET /api/spots/[id]/live`

Vent courant pour un spot. Résout automatiquement `nearestStationId` → station → Open-Meteo si stale ou absent.

| Param | Type | Requis | Description |
| --- | --- | --- | --- |
| `stationId` | string | Non | Override la station assignée au spot |

**Réponse** : `WindLive` (windSpeedKmh, windDirection, gustsKmh, updatedAt, source, isFresh, staleAt). Cache 60 s.

### `GET /api/spots/[id]/archives`

Archives vent 5 ans. Cache 7 jours (`s-maxage=604800`).

**Réponse** : `WindArchiveData` (stats mensuelles par année + combinées).

### `POST /api/spots/[id]/images`

Upload multipart/form-data. Champ `file` requis.

**Réponse** : `201` avec `SpotImage`.

### `DELETE /api/spots/[id]/images`

Suppression d'images (administrateur). Body : `{ imageIds: string[] }`, de 1 à 50
identifiants. Seules les images du spot demandé peuvent être supprimées.

---

## Stations

### `GET /api/stations`

Toutes les stations combinées (MeteoSwiss + Pioupiou + Netatmo + Météo-France + Windball). Cache 60 s.

**Réponse** : `WindStation[]`

```ts
{
  (id,
    name,
    lat,
    lng,
    altitudeM,
    windSpeedKmh,
    windDirection,
    updatedAt,
    source);
}
```

### `GET /api/stations/[id]/live`

Vent courant pour une station (dernière vraie mesure station : DB + overlay live Pioupiou/Windball, jamais NWP). Utile pour rafraîchir l'en-tête de la popup carte sans polluer le chart.

**Réponse** : `WindLive` (windSpeedKmh, windDirection, gustsKmh, updatedAt, source, isFresh, staleAt). Cache 60 s.

### `GET /api/stations/[id]/history`

Historique 48h + prévisions futures. Le préfixe de l'ID détermine la source :

- `piou-*` → Pioupiou (DB + Archive API)
- `ntm-*` → Netatmo (DB + Open-Meteo fallback)
- `mf-*` → Météo-France (DB + Open-Meteo fallback)
- `windball-*` → Windball (DB + API archive + Open-Meteo fallback)
- Autre → MeteoSwiss (DB + CSV OGD + Open-Meteo forecast)

**Réponse** : `HistoryPoint[]`. Cache 60 s.

---

## Vent

### `POST /api/wind/grid`

Batch vent pour une grille de coordonnées. Rate limité (80 appels/min).

**Body** : `{ lats: number[], lngs: number[] }`

**Réponse** : Array de données vent Open-Meteo. Erreur `429` si rate limité.

---

## Planificateur

### `GET /api/plan`

Spots triés par score vent pour une période donnée.

| Param       | Type           | Défaut | Description                           |
| ----------- | -------------- | ------ | ------------------------------------- |
| `lat`       | number         | —      | Centre recherche (optionnel → global) |
| `lng`       | number         | —      | Centre recherche                      |
| `startDate` | YYYY-MM-DD     | —      | Début période                         |
| `endDate`   | YYYY-MM-DD     | —      | Fin période                           |
| `radius`    | number         | 150    | Rayon en km                           |
| `sport`     | KITE/PARAGLIDE | —      | Type de sport                         |
| `spotIds`   | IDs séparés par une virgule | — | Restreint aux spots publics demandés (1 à 12 IDs, 200 caractères par ID). Utilisé par le résumé personnel. |

**Réponse** : `mode` (`forecast` ou `seasonal`), `spots[]` avec `qualification`, `windows[]`, `weather`, `unavailable`, et `meta`. Les créneaux respectent les orientations, les seuils de vent et de rafales, la lumière du jour et les restrictions documentées. Le score interne sert au classement ; ce n’est ni une probabilité ni une évaluation de sécurité.

- ≤ 16 jours : prévisions Open-Meteo temps réel
- \> 16 jours : archives historiques 5 ans

### Mon Openwind : résumé et recherches enregistrées

- Le résumé interroge le même planificateur sur les quatre prochains jours, pour les spots favoris sélectionnés (jusqu’à 12 pour les invités). Les créneaux sont présentés chronologiquement avec leurs critères et sources ; aucun ancien score journalier n’est utilisé.
- Les observations du résumé réutilisent les endpoints `/live`. Une évolution d’au moins 5 km/h est affichée seulement entre deux mesures fraîches de la même station et du même réseau, espacées de moins de 24 heures. Les estimations et changements de source ne produisent pas de fausse variation. La comparaison reste sur l’appareil.
- Jusqu’à huit recherches sont conservées dans le navigateur, sous `openwind-searches:v1:<userId|guest>`. Elles sont distinctes par compte sur cet appareil, sans synchronisation distante. À la connexion, les recherches invitées sont fusionnées sans écraser celles du compte ; les recherches dépassant la limite restent conservées côté invité.
- Une recherche conserve le sport, le lieu, les coordonnées, le rayon et soit des dates fixes, soit un week-end recalculé à l’ouverture. Les dates expirées ne sont jamais relancées silencieusement : la carte affiche les nouvelles dates et propose un bouton explicite pour repartir d’aujourd’hui en conservant la durée.
- La relance reste manuelle. Le retrait peut être annulé immédiatement. Aucun service de surveillance ou de notification n’est ajouté.

---

## Favoris

### `GET /api/favorites`

**Auth** : optionnelle (retourne `{ spotIds: [], stationIds: [] }` si non connecté).

**Réponse** : `{ spotIds: string[], stationIds: string[] }`.

### `POST /api/favorites`

**Auth** : requise.

**Body** : `{ spotId: string }` ou `{ stationId: string }`.

Toggle : ajoute si absent, supprime si présent. Les métadonnées d’une balise sont résolues côté serveur depuis le cache partagé. **Réponse** : `{ favorited: boolean, kind: "spot" | "station" }`.

### `PUT /api/favorites`

**Auth** : requise. Importe les favoris de l'appareil de façon idempotente.

**Body** : `{ spotIds?: string[], stationIds?: string[] }`, au plus 12 identifiants
au total. Le compte cible vient exclusivement de la session vérifiée. Les favoris
déjà enregistrés, leur ordre et leurs alertes sont conservés. Les nouveaux favoris
sont ajoutés à la suite ; seules les places libres des trois cartes principales
peuvent être sélectionnées automatiquement.

**Réponse** : `{ spotIds: string[], stationIds: string[] }`, les identifiants
confirmés dans le compte. Le client conserve les favoris non confirmés sur
l'appareil pour permettre une nouvelle tentative.

### `GET /api/favorites/preview`

**Auth** : aucune. Paramètres `spots` et `stations`, identifiants séparés par des
virgules (12 au total). Retourne uniquement des noms et métadonnées publiques
nécessaires aux favoris locaux. Aucun favori invité n'est écrit en base.

---

## Préférences

### `GET /api/preferences`

**Auth** : optionnelle (retourne défauts si non connecté).

**Réponse** : `{ sportFilter: "ALL"|"KITE"|"PARAGLIDE", useKnots: boolean }`

### `PATCH /api/preferences`

**Auth** : requise.

**Body** : `{ sportFilter?, useKnots? }`

L'interface applique immédiatement les préférences partagées aux fiches, à la
carte et aux prévisions. Les écritures d'un compte sont sérialisées. À la connexion,
seuls les choix explicitement modifiés par le visiteur sont importés ; les valeurs
par défaut locales ne remplacent pas les préférences déjà présentes dans le compte.

---

## Forum

### `GET /api/forum/categories`

Liste des catégories avec compteurs et dernier topic.

### `POST /api/forum/categories`

**Admin uniquement**. Body : `{ name, description, icon?, order? }`.

### `PATCH/DELETE /api/forum/categories/[id]`

**Admin uniquement**.

### `GET /api/forum/topics?category=slug&page=1`

Topics paginés (20/page) avec score, auteur, compteur posts.

### `POST /api/forum/topics`

**Auth requise**. Body : `{ title, body, categorySlug }`.

### `GET /api/forum/topics/[id]`

Topic avec arbre de posts threadés (construction serveur).

### `PATCH /api/forum/topics/[id]`

**Auteur ou admin**. Body : `{ title?, body? }`. Seul l'admin peut modifier `pinned`.

### `DELETE /api/forum/topics/[id]`

**Auteur ou admin**.

### `POST /api/forum/posts`

**Auth requise**. Body : `{ topicId, parentId?, body }`.

### `PATCH/DELETE /api/forum/posts/[id]`

**Auteur ou admin**.

### `POST /api/forum/votes`

**Auth requise**. Body : `{ topicId?, postId?, value: 1|-1 }`.

Toggle : même valeur = suppression, valeur différente = mise à jour.

**Réponse** : `{ voted: 1|-1|null }`.

---

## Auth

### `POST /api/auth/sync`

**Auth requise**. Synchronise l'utilisateur Supabase Auth → table Prisma `User`. Appelé automatiquement après chaque connexion.

---

## Cron

### `GET /api/cron/stations`

**Auth** : Bearer `CRON_SECRET`. Exécuté toutes les 10 min par Vercel Cron.

Fetch les 5 réseaux → insert batch en DB → prune > 3 jours.

**Réponse** : `{ ok, stations, inserted, pruned }`.
