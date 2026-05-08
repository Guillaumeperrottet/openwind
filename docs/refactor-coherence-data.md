# Refactor — Cohérence des données vent (historique)

> **Ce document est l'historique du plan de refactor exécuté le 8 mai 2026.**
> **Le refactor est terminé.** Pour comprendre comment l'architecture fonctionne aujourd'hui, lire [architecture-donnees-vent.md](./architecture-donnees-vent.md).

---

## Archive du plan original

---

## 1. Contexte

L'application affiche le vent **courant** d'une station à 5+ endroits différents et l'historique 48 h à 3 endroits. Aujourd'hui, **chaque consommateur fait son propre fetch** avec sa propre logique de fraîcheur, son propre fallback et son propre cache. Conséquence : divergences observables (cf. bug VEV ci-dessous) et impossibilité de garantir la cohérence "popup carte ≡ cards page spot ≡ dernière barre chart 48 h" inscrite dans `CLAUDE.md`.

### 1.1 Bug récent qui a déclenché l'analyse (VEV — 8 mai 2026)

| Vue                          | Valeur affichée                   | Source réelle                          |
| ---------------------------- | --------------------------------- | -------------------------------------- |
| Popup station VEV (carte)    | `1 kts W 261° · 09:15`            | Open-Meteo NWP (passé du jour, ≤ now)  |
| Page station `/stations/VEV` | `2 kts S 164° · 09:00`            | Observation MeteoSwiss réelle          |
| Page spot Corseaux           | `1 kts · il y a 2 h · Open-Meteo` | Fallback Open-Meteo (station > 30 min) |

Trois valeurs différentes pour **la même station au même moment**. Causes :

1. `fetchWindForecast15min()` retournait toute la série `minutely_15` du jour (commence à 00:00 UTC) → des points NWP "passés mais postérieurs à la dernière obs" se mélangeaient à l'historique observation. Le picker `lastPast` du popup tombait dessus → 1 kts NWP au lieu de 2 kts station. **Patché** dans `lib/windHistory.ts` (filtre `> nowIso`).
2. Page spot SSR autorise 4 h de fraîcheur pour MeteoSwiss, page spot client coupe à 30 min → la même station passe "OK SSR" puis "stale → Open-Meteo" au premier poll client.
3. Popup station fait son propre re-pick depuis `/api/stations/[id]/history` (`lastPast`) plutôt que de partager l'état du popup carte.

Le fix #1 est en place mais ne résout que **un** symptôme. Les causes architecturales subsistent.

---

## 2. Cartographie de l'existant

### 2.1 Les 5 chemins parallèles vers "vent courant station"

| Consommateur              | Fichier                                                             | Source de données                                                                              | Cache                  | Seuil fraîcheur                                                                                                                                   | Fallback                        |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **KiteMap popup station** | `src/components/map/KiteMap.tsx` + `StationPopup.tsx`               | snapshot map (props GeoJSON) puis re-pick depuis `/api/stations/[id]/history` (lastPast ≤ now) | mémoire 60 s           | aucun (affiche tel quel)                                                                                                                          | aucun                           |
| **KiteMap popup spot**    | `src/components/map/KiteMap.tsx` (fetchWind + openMeteoPoll effect) | `/api/stations` (station assignée) ou `/api/wind`                                              | CDN 60 s               | `isStationFresh` 30 min ([utils.ts#L145](../src/lib/utils.ts#L145))                                                                               | Open-Meteo `/api/wind`          |
| **KiteMap pulse spot**    | `KiteMap.tsx` (windMap dans loadStations + useEffect spots)         | `stationsRef.current` (= `/api/stations`)                                                      | mémoire 60 s           | `isStationFresh` 30 min                                                                                                                           | aucun (pas de pulse)            |
| **Page station SSR**      | `src/app/stations/[id]/page.tsx`                                    | re-fetch direct des 5 réseaux (`fetchMeteoSwissStations()` etc.)                               | ISR par lib (variable) | aucun                                                                                                                                             | aucun                           |
| **Page spot SSR**         | `src/app/spots/[id]/page.tsx`                                       | Prisma `StationMeasurement` direct                                                             | aucun                  | par réseau : MeteoSwiss/Pioupiou/Netatmo/Windball 30 min, **Météo-France 4 h**, défaut 5 min ([page.tsx#L96](../src/app/spots/[id]/page.tsx#L96)) | aucun ("données indisponibles") |
| **Page spot client**      | `src/app/spots/[id]/SpotPageClient.tsx`                             | `/api/stations` poll 60 s (liveStation) + `/api/wind` poll 60 s (openMeteoLive)                | 60 s                   | `isStationFresh` 30 min ([SpotPageClient.tsx#L60](../src/app/spots/[id]/SpotPageClient.tsx#L60))                                                  | Open-Meteo                      |

**Observations** :

- **6 implémentations** du même besoin ("donne la valeur courante de la station X").
- **3 seuils de fraîcheur différents** sont en circulation (aucun, 30 min, 4 h selon réseau).
- Le snapshot map peut décider "fresh", la page spot SSR (4 h) peut afficher la même valeur, le client (30 min) bascule en Open-Meteo, et le popup station re-pick un point NWP. → 4 affichages différents possibles pour la même station, **simultanément**, sur le même écran.

### 2.2 Les 3 chemins parallèles vers "historique 48 h"

| Consommateur             | Fichier                                   | Composition                                                                                                                                          |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **StationPopup** (carte) | `src/components/map/StationPopup.tsx`     | `/api/stations/[id]/history` (= obs DB/CSV/API + `fetchWindForecast15min` filtrée par `> lastObs`) — points obs et NWP **dans le même tableau plat** |
| **Page station SSR**     | `src/app/stations/[id]/page.tsx`          | `fetchWindHistoryStation` + `fetchWindForecast15min` (concat manuelle, filtre `> lastObs`)                                                           |
| **Page spot**            | `src/app/api/spots/[id]/weather/route.ts` | idem (concat dans la route)                                                                                                                          |

**Problème central** : on **mélange obs et NWP dans un seul `HistoryPoint[]`**. Tous les consommateurs qui font ensuite `.find(p => p.time <= now)` (popup, hover chart, dernière barre…) peuvent toucher du NWP en croyant lire de l'obs.

Le fix du 8 mai (`fetchWindForecast15min` filtre `> nowIso`) bouche un trou mais ne supprime pas l'ambiguïté structurelle : tout point dans le tableau est traité comme équivalent.

### 2.3 Le cron + le cache snapshot

- `/api/cron/stations` (toutes les 10 min) appelle les 5 fetchers, écrit `SystemConfig.stations_cache` (snapshot JSON) + insère dans `StationMeasurement`.
- `/api/stations` lit ce snapshot puis applique `overlayLatestMeasurements` (DB ≤ 30 min) + `overlayLiveNetworks` (re-fetch live Windball + Pioupiou).
- Donc la "source de vérité" en DB existe déjà côté serveur (`StationMeasurement`), mais la page station SSR la **bypass** en re-fetchant directement les réseaux.

---

## 3. Architecture cible

### 3.1 Schéma

```
                       ┌──────────────────────────────────┐
                       │  src/lib/stationData.ts          │   ← UNIQUE point d'entrée
                       │  (server-only)                   │     pour toute donnée vent
                       │                                  │     temps réel + historique
                       │  ─ getStationLive(id) → Live     │
                       │  ─ getStationHistory(id) → Bundle│
                       │  ─ getSpotLive(spotId) → Live    │
                       │  ─ FRESHNESS_BY_NETWORK          │
                       │  ─ NETWORK_LABELS                │
                       └────────────┬─────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────────┐
        ▼                           ▼                               ▼
  /api/stations           /api/stations/[id]              /api/spots/[id]/weather
  (snapshot list,         (live + history bundle)         (live + history + forecast 7j)
   contrat inchangé)
        │                           │                               │
        └────────────────┬──────────┴──────────┬────────────────────┘
                         ▼                     ▼
            ┌────────────────────────┐ ┌────────────────────────┐
            │ src/lib/useStationLive │ │ src/lib/useSpotLive    │   ← UNIQUE point
            │ (SWR, key="station:X") │ │ (SWR, key="spot:Y")    │     côté client
            │ polling 60 s, dédupé   │ │ polling 60 s, dédupé   │
            └─────────┬──────────────┘ └─────────────┬──────────┘
                      │                              │
        ┌─────────────┼──────────┐         ┌─────────┴──────────┐
        ▼             ▼          ▼         ▼                    ▼
  KiteMap pulse  StationPopup  page station  KiteMap popup spot  page spot cards/chart
```

### 3.2 Types unifiés

```ts
// src/types/index.ts

/** Réponse unifiée pour "vent courant" — quelle que soit la source. */
export type WindLive = {
  /** Vent moyen (km/h, on convertit en kts à l'affichage). */
  windSpeedKmh: number;
  windDirection: number; // 0–360°
  gustsKmh: number;
  temperatureC?: number;
  /** ISO UTC. Toujours présent. */
  updatedAt: string;
  /** "station" = obs réelle. "openmeteo" = NWP fallback grille. */
  source: "station" | "openmeteo";
  /** Réseau si source==="station" (ex: "meteoswiss", "pioupiou"). */
  network?: NetworkId;
  /** Identifiant station si source==="station". */
  stationId?: string;
  /** ISO UTC. Au-delà → l'UI doit afficher "données anciennes". */
  staleAt: string;
  /** True si Date.now() < new Date(staleAt).getTime(). */
  isFresh: boolean;
};

/** Réponse unifiée pour l'historique 48 h. Obs et NWP STRICTEMENT séparés. */
export type WindHistoryBundle = {
  /** Points observés (passé). Triés par time croissant. */
  observations: HistoryPoint[];
  /** Points NWP futurs uniquement (time > now). Triés par time croissant. */
  forecast: HistoryPoint[];
  /** Métadonnées d'affichage. */
  meta: {
    stationId: string | null;
    network: NetworkId | "openmeteo";
    label: string; // "VEV · MeteoSwiss" ou "Vent estimé · Open-Meteo"
  };
};

export type NetworkId =
  | "meteoswiss"
  | "pioupiou"
  | "netatmo"
  | "meteofrance"
  | "windball"
  | "fr-energy";
```

### 3.3 Constantes centralisées

```ts
// src/lib/stationData.ts

/** Source unique de vérité pour la fraîcheur par réseau.
 *  Au-delà → on bascule sur Open-Meteo (côté spot) ou on grise (côté station). */
export const FRESHNESS_BY_NETWORK: Record<NetworkId, number> = {
  meteoswiss: 60 * 60 * 1000, // 1 h (cycles 10 min mais ratés fréquents)
  pioupiou: 20 * 60 * 1000, // 20 min (push ~4 min)
  netatmo: 30 * 60 * 1000, // 30 min
  meteofrance: 4 * 60 * 60 * 1000, // 4 h (SYNOP toutes les 3 h)
  windball: 30 * 60 * 1000,
  "fr-energy": 30 * 60 * 1000,
};

export const NETWORK_LABELS: Record<NetworkId | "openmeteo", string> = {
  meteoswiss: "MeteoSwiss",
  pioupiou: "Pioupiou",
  netatmo: "Netatmo",
  meteofrance: "Météo-France",
  windball: "Windball",
  "fr-energy": "FribourgÉnergie",
  openmeteo: "Open-Meteo",
};
```

### 3.4 API du nouveau module

```ts
// src/lib/stationData.ts (server-only — import { "server-only" })

/** Donne la mesure courante d'une station, fallback Open-Meteo si stale. */
export async function getStationLive(
  stationId: string,
  opts?: { lat?: number; lng?: number; allowOpenMeteoFallback?: boolean },
): Promise<WindLive>;

/** Donne l'historique 48 h + prévision 24 h, obs et NWP séparés. */
export async function getStationHistory(
  stationId: string,
): Promise<WindHistoryBundle>;

/** Donne la mesure courante affichable pour un spot.
 *  Logique : station assignée fraîche → station. Sinon → Open-Meteo aux coords du spot. */
export async function getSpotLive(spotId: string): Promise<WindLive>;
```

### 3.5 Hooks client unifiés (SWR)

```ts
// src/lib/useStationLive.ts
"use client";

export function useStationLive(stationId: string | null): {
  data: WindLive | null;
  isLoading: boolean;
};

// src/lib/useSpotLive.ts
export function useSpotLive(spotId: string | null): {
  data: WindLive | null;
  isLoading: boolean;
};
```

Avantages SWR :

- **Déduplication automatique** : 3 composants qui appellent `useStationLive("VEV")` → 1 seul fetch.
- **Polling unifié** : 1 seul `setInterval` pour toute l'app par clé.
- **Revalidation on focus** : retour onglet → refresh immédiat.
- **Cache partagé** : popup s'ouvre → valeur déjà disponible (instant), revalidée en arrière-plan.

---

## 4. Plan d'exécution (4 phases, ordre strict)

> **Règle d'or** : à la fin de chaque phase, l'application doit rendre **exactement la même chose** qu'avant. Ne pas mélanger refactor et changement de comportement.

### Phase 1 — Couche serveur (invisible utilisateur)

**Fichiers créés** :

- `src/lib/stationData.ts` — implémente les 3 fonctions + constantes.
- `src/lib/__tests__/stationData.test.ts` (optionnel mais recommandé).

**Fichiers modifiés** :

- `src/app/api/stations/[id]/route.ts` — utilise `getStationLive` + `getStationHistory` au lieu des 5 branches if/else actuelles.
- `src/app/api/spots/[id]/weather/route.ts` — utilise `getSpotLive`.
- **Contrat des routes** : ajouter `{ observations, forecast, meta }` en plus de l'historique plat (rétrocompatible : on garde le tableau plat sous `legacy_history` pendant la migration, à supprimer Phase 4).

**Tests manuels obligatoires** :

- Page station VEV identique à avant.
- Popup station VEV identique à avant (utilise encore l'ancien chemin).
- Page spot Corseaux identique.

### Phase 2 — Hooks client + migration progressive

**Dépendance ajoutée** : `pnpm add swr` (~5 ko gzippé).

**Fichiers créés** :

- `src/lib/useStationLive.ts`
- `src/lib/useSpotLive.ts`

**Migration consommateur par consommateur** (1 commit chacun, valider avant le suivant) :

1. `SpotPageClient.tsx` — remplace les `useState liveStation/openMeteoLive` + 2 polling effects par `useSpotLive(spot.id)`. Le `useMemo wind` lit directement `data`.
2. `KiteMap.tsx` popup spot — remplace `fetchWind` + `openMeteoPoll effect` + ré-derivation effect par un `useSpotLive(selectedSpot?.id ?? null)` (le hook s'abonne/désabonne tout seul).
3. `KiteMap.tsx` pulse spot — le `windMap` utilise les caches SWR (`mutate.cache`) ou un `getStationLive` côté serveur via `/api/stations` enrichi.
4. `StationPopup.tsx` — remplace l'override `lastPast` par `useStationLive(station.id)` + lit `bundle.observations.at(-1)` pour la dernière obs si besoin. **Le bug VEV devient impossible** car `forecast` n'est plus dans le même tableau.

### Phase 3 — Allègement du SSR

- `src/app/stations/[id]/page.tsx` : remplacer le re-fetch des 5 réseaux par `getStationLive(id)` + `getStationHistory(id)`. Gain : ~4 fetchs API supprimés par hit, render plus rapide.
- `src/app/spots/[id]/page.tsx` : remplacer le bloc Prisma + table FRESHNESS_MS par `getSpotLive(id)`.

### Phase 4 — Nettoyage

- Supprimer `/api/wind` (fonctionnalité absorbée par `getSpotLive`).
- Supprimer `isStationFresh`/`isStationRecent` côté client (la fraîcheur vient maintenant du serveur via `WindLive.isFresh`).
- Supprimer le `lastPast` picker dans `StationPopup`.
- Supprimer le filtrage `> nowIso` dans `fetchWindForecast15min` (devenu redondant : la séparation obs/forecast au niveau bundle suffit). **Garder un commentaire historique** rappelant le bug VEV.
- Mettre à jour `CLAUDE.md` section "Cohérence vent" avec la nouvelle architecture.
- Mettre à jour `docs/architecture.md`.

---

## 5. Pièges à éviter / décisions à prendre

### 5.1 Server-only strict

`stationData.ts` doit importer `"server-only"` (package npm `server-only`). Sinon un import accidentel côté client ferait fuiter Prisma + clés Netatmo dans le bundle.

### 5.2 Compatibilité du cache CDN actuel

`/api/stations` a `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. À conserver. Les nouveaux endpoints doivent garder le même comportement (60 s s-maxage).

### 5.3 SWR fetcher unique

Définir un fetcher partagé qui parse les erreurs proprement et timeout à 8 s. Sinon chaque hook va se réinventer le sien.

### 5.4 Ne pas casser `KiteMap` pulse pendant la migration

Le `windMap` du pulse est crucial visuellement et lu par GL (pas React). Migrer en dernier dans la Phase 2, ou laisser `stationsRef` intact et juste alimenter via SWR au lieu de fetch manuel.

### 5.5 Données anciennes vs Open-Meteo : politique claire

La Phase 1 doit trancher : quand une station est entre `FRESHNESS_BY_NETWORK[net]` et 24 h, **affiche-t-on l'obs vieillie ou Open-Meteo** ?

- **Recommandation** : Open-Meteo si > seuil. Plus honnête. C'est déjà ce que fait le client aujourd'hui.
- **Exception** : page **station** (`/stations/[id]`) — là on veut voir LA station, pas Open-Meteo. Donc afficher l'obs même vieille, avec un badge "données anciennes (X h)".

`getStationLive` doit donc accepter `{ allowOpenMeteoFallback: boolean }` :

- `true` (défaut, contexte spot) → Open-Meteo si stale.
- `false` (page station) → l'obs vieille avec `isFresh=false`.

### 5.6 Open-Meteo a besoin de `lat/lng`

Pour les spots, on a les coords directement. Pour `getStationLive(id, opts)`, le caller (route /api/stations/[id]) doit passer `lat`/`lng` quand il les a (généralement, via le snapshot ou le fetcher du réseau).

### 5.7 Tester le bug VEV

Avant/après chaque phase, ouvrir Vevey/VEV avec une station volontairement stale (modifier le seuil temporairement à 1 min) et vérifier :

- Popup carte → affiche Open-Meteo `source="openmeteo"`.
- Page spot Corseaux → affiche Open-Meteo `source="openmeteo"`.
- Page station VEV → affiche obs station avec badge "données anciennes".
- Chart 48 h dans les 3 vues → strictement identique (mêmes barres, même séparation obs/NWP).

---

## 6. Estimation effort

| Phase | Complexité      | Risque                                  | Notes                            |
| ----- | --------------- | --------------------------------------- | -------------------------------- |
| 1     | Moyenne (~3 h)  | Faible — additif, ne remplace rien      | Validation visuelle suffit       |
| 2     | Élevée (~4-6 h) | Moyen — touche KiteMap + SpotPageClient | Migrer un consommateur à la fois |
| 3     | Faible (~1 h)   | Faible                                  | SSR allégé, perf ↑               |
| 4     | Faible (~1 h)   | Faible — suppressions                   | Updater docs                     |

**Total** : une bonne demi-journée focus, en 2 sessions de préférence (Phase 1 d'un côté, Phases 2-3-4 ensemble).

---

## 7. Ce qui a déjà été fait (à ne pas refaire)

- ✅ `pollTick` counter dans `KiteMap.tsx` pour re-derivation fiable du popup.
- ✅ Suppression du background refetch dans `fetchWind` (causait flicker).
- ✅ Polling Open-Meteo quand popup spot ouvert en mode fallback.
- ✅ Alignement du `windMap` (pulse spot) sur "station assignée + fraîche uniquement".
- ✅ `revalidatePath('/spots/[id]')` après PATCH spot.
- ✅ Filtre `> nowIso` dans `fetchWindForecast15min` (fix VEV partiel).
- ✅ `WindLive.source` field + helpers `isStationFresh/Recent` dans `utils.ts`.

Ces patches restent valides après refactor mais certains seront supprimés en Phase 4 (devenus redondants).

---

## 8. Décisions à prendre avant de commencer

1. **OK pour ajouter SWR comme dépendance ?** (Alternative : TanStack Query plus lourd mais offre devtools.)
2. **Politique stale page station** : Open-Meteo ou obs vieillie + badge ? (recommandation : badge.)
3. **Phases en 1 PR ou plusieurs ?** (recommandation : 1 PR par phase, mergeable indépendamment.)
4. **Tests automatisés** : ajout `vitest` ou validation manuelle uniquement ? (le projet n'a pas de tests aujourd'hui.)

## infos pour claude:

"Lis intégralement refactor-coherence-data.md AVANT toute modification."
"Une phase à la fois. Stop net après chaque phase, je valide visuellement avant de continuer."
"Après chaque modification : pnpm exec tsc --noEmit ET pnpm dev puis ouvrir Vevey/VEV + Corseaux. Compare visuellement avant/après."
"Phase 2 : migrer un composant à la fois, dans cet ordre : SpotPageClient → KiteMap popup → KiteMap pulse → StationPopup. Commit entre chaque."
"Pour KiteMap : ne pas toucher aux \*Ref.current sans comprendre pourquoi ils existent (handlers GL)."
"En cas de doute sur GL, demander avant de modifier."
