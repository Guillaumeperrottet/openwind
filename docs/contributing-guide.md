# Guide du contributeur — Guides pratiques

Comment ajouter des fonctionnalités courantes à Openwind.

---

## Ajouter une nouvelle source de stations vent

Exemple : ajouter un réseau "AEMET" (Espagne).

### 1. Créer le module fetch

Créer `src/lib/aemet.ts` :

```ts
import type { WindStation } from "./stations";

export async function fetchAemetStations(): Promise<WindStation[]> {
  const res = await fetch("https://api.aemet.es/...");
  if (!res.ok) return [];
  const data = await res.json();

  return data.map((s: AemetRaw) => ({
    id: `aemet-${s.id}`, // Préfixer l'ID pour éviter les conflits
    name: s.name,
    lat: s.latitude,
    lng: s.longitude,
    altitudeM: s.altitude ?? 0,
    windSpeedKmh: s.wind_speed, // Toujours en km/h
    windDirection: s.wind_dir, // Degrés 0-360
    updatedAt: s.timestamp,
    source: "aemet" as const, // Identifiant unique du réseau
  }));
}
```

Règles :

- **ID préfixé** (`aemet-xxx`) pour éviter les collisions entre réseaux
- **Vitesse toujours en km/h** — la conversion kts se fait côté UI
- **Direction en degrés** (0 = Nord, 90 = Est)
- **`source`** : identifiant unique utilisé pour le routage dans l'historique

### 2. Déclarer le réseau dans `stationConstants.ts`

Dans `src/lib/stationConstants.ts`, enregistrer le nouveau réseau comme source de vérité unique pour la fraîcheur et les labels :

```ts
// 1. Ajouter à l'union NetworkId
export type NetworkId =
  | "meteoswiss"
  | "pioupiou"
  | "netatmo"
  | "meteofrance"
  | "windball"
  | "fr-energy"
  | "aemet";

// 2. Fenêtre de fraîcheur (ms) — détermine isFresh dans WindLive
export const FRESHNESS_BY_NETWORK: Record<NetworkId, number> = {
  // ...existants...
  aemet: 60 * 60 * 1000, // 1 h
};

// 3. Label affiché dans l'UI
export const NETWORK_LABELS: Record<NetworkId | "openmeteo", string> = {
  // ...existants...
  aemet: "AEMET",
};

// 4. detectNetwork() — ajouter le cas préfixe
export function detectNetwork(id: string): NetworkId {
  if (id.startsWith("aemet-")) return "aemet";
  // ...
}
```

### 3. Intégrer dans le cron

Dans `src/app/api/cron/stations/route.ts`, ajouter le fetch dans le `Promise.allSettled()` :

```ts
const [meteo, piou, netatmo, aemet] = await Promise.allSettled([
  fetchMeteoSwissStations(),
  fetchPioupiouStations(),
  fetchNetatmoStations(),
  fetchMeteoFranceStations(), // Réseau Météo-France existant
  fetchAemetStations(), // Nouveau réseau
]);
```

Ajouter le résultat dans le tableau de mesures en aval.

### 4. Intégrer dans l'API stations

Dans `src/app/api/stations/route.ts`, ajouter le fetch dans le `Promise.allSettled()` existant.

### 5. Ajouter le routage historique

Dans `src/app/api/stations/[id]/history/route.ts`, ajouter un cas pour le préfixe :

```ts
if (id.startsWith("aemet-")) {
  // Logique spécifique AEMET (DB + API archive si disponible)
}
```

### 6. Tester

```bash
pnpm test                 # Vitest — vérifier que les tests existants passent
pnpm exec tsc --noEmit   # Vérifier le typage
pnpm dev                  # Vérifier que les stations s'affichent sur la carte
```

---

## Ajouter un nouveau type de sport

Exemple : ajouter le windsurf.

### 1. Migration Prisma

Ajouter la valeur dans l'enum `SportType` :

```prisma
enum SportType {
  KITE
  PARAGLIDE
  WINDSURF    // Nouveau
}
```

```bash
pnpm prisma migrate dev --name add_windsurf_sport
```

### 2. Scoring

Dans `src/lib/windScoring.ts`, ajouter un cas dans `scoreDayForecast()` :

```ts
case "WINDSURF": {
  // Seuils : 12-40 km/h, idéal 15-30
  const rideableHours = hours.filter(h => h.windSpeedKmh >= 12 && h.windSpeedKmh <= 40);
  // ... pondérations spécifiques
}
```

Et dans `analyzeMultiDay()` pour les scores synthétiques.

### 3. UI

- `src/components/plan/PlanFilters.tsx` — ajouter l'option dans le sélecteur sport
- `src/app/api/preferences/route.ts` — ajouter dans les valeurs valides

### 4. Types

Mettre à jour `src/types/index.ts` si nécessaire (le type `SportType` est importé de Prisma).

---

## Ajouter un composant de page spot

Exemple : ajouter un graphique de marées.

### 1. Créer le composant

```
src/components/spot/TideChart.tsx
```

- Utiliser `"use client"` si interactivité nécessaire
- Typer les props avec une interface explicite
- Utiliser les utilitaires existants (`cn()` pour les classes)

### 2. Intégrer dans la page spot

Modifier `src/app/spots/[id]/page.tsx` pour importer et afficher le composant.

### 3. Source de données

- Si les données viennent d'une API externe → créer un helper dans `src/lib/`
- Si les données nécessitent un endpoint serveur → créer `src/app/api/spots/[id]/tides/route.ts`
- Utiliser ISR avec `revalidate` approprié

---

## Ajouter une catégorie de forum

Les catégories sont gérées en DB. Utiliser l'API admin :

```bash
curl -X POST https://openwind.ch/api/forum/categories \
  -H "Cookie: [session cookie]" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Matériel", "description": "Discussion sur le matériel", "icon": "🎒", "order": 3 }'
```

L'utilisateur doit être dans `ADMIN_USER_IDS`.

---

## Conventions de code

### TypeScript

- `strict: true` — pas de `any`, utiliser `unknown` si nécessaire
- Vérifier avec `pnpm exec tsc --noEmit` avant chaque commit
- Types partagés dans `src/types/index.ts`

### Composants React

- **Server Components par défaut** — `"use client"` uniquement si hooks/interactivité
- Pas de librairie UI externe — Tailwind + composants maison
- Icônes : `lucide-react`

### API Routes

- `NextResponse.json()` avec codes HTTP appropriés (400, 401, 404, 503)
- Validation Zod sur les POST/PATCH
- Try/catch silencieux pour les erreurs non-critiques (pas de `console.log` en prod)

### Base de données

- Migrations via `prisma migrate dev` (jamais `db push`)
- Prisma CLI lit `.env` (pas `.env.local`). Garder `DATABASE_URL` et `DIRECT_URL` dans `.env`

### Carte

- **GL uniquement** — pas de DOM markers pour les stations/spots
- Source unique `combined-source` — ne pas créer de sources séparées
- Utiliser des refs (`useRef`) pour les données dans les handlers GL (pas le state React directement)

### Unités

- Vitesse vent toujours stockée en **km/h**
- Conversion kts : `Math.round(kmh / 1.852)`
- Affichage par défaut : kts, avec km/h secondaire
