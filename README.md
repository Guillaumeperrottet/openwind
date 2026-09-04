# OpenWind

**Carte open source des spots de kitesurf et parapente — vent en direct, prévisions, archives, planificateur de voyages.**

[openwind.ch](https://www.openwind.ch)

![Status](https://img.shields.io/badge/status-alpha-orange)
![License](https://img.shields.io/badge/license-AGPL--v3-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

---

## Fonctionnalités

- **Carte interactive** — spots et stations de vent sur une carte MapLibre GL (clustering WebGL)
- **Vent en direct** — 5 réseaux combinés : MeteoSwiss (154 stations), Pioupiou (~600 mondiales), Netatmo, Météo-France (~185 SYNOP), Windball (~15–25 LoRa en Suisse romande)
- **Prévisions 7 jours** — tableau Windguru-style avec scoring kite/parapente (Open-Meteo)
- **Archives 5 ans** — roses des vents mensuelles, fréquences et directions dominantes
- **Planificateur de voyage** — lieu + dates + sport → spots proches triés par score
- **Forum communautaire** — catégories, topics, réponses threadées, votes
- **Ajouter un spot** — formulaire avec photos, difficulté, type d'eau, directions idéales
- **Multi-sport** — kitesurf et parapente, scoring adapté par discipline
- **100 % gratuit** — 0 € d'infrastructure (free tiers uniquement)

## Stack technique

| Technologie                              | Usage                            | Coût              |
| ---------------------------------------- | -------------------------------- | ----------------- |
| [Next.js 16](https://nextjs.org)         | Framework fullstack (App Router) | Gratuit           |
| [TypeScript](https://typescriptlang.org) | Typage strict                    | —                 |
| [Tailwind v4](https://tailwindcss.com)   | Styles                           | —                 |
| [MapLibre GL 5](https://maplibre.org)    | Carte WebGL                      | Open source       |
| [OpenFreeMap](https://openfreemap.org)   | Tuiles de carte                  | Gratuit           |
| [Open-Meteo](https://open-meteo.com)     | Prévisions + archives vent       | Gratuit, sans clé |
| [Prisma 7](https://prisma.io)            | ORM PostgreSQL                   | Open source       |
| [Supabase](https://supabase.com)         | PostgreSQL + Auth + Storage      | Free tier         |
| [Vercel](https://vercel.com)             | Hosting + Cron                   | Free tier         |

## Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm
- Un compte [Supabase](https://supabase.com) (gratuit)

### Installation

```bash
git clone https://github.com/Guillaumeperrottet/openwind.git
cd openwind
pnpm install
```

### Configuration

```bash
cp .env.example .env
cp .env.example .env.local
```

Remplis les deux fichiers avec tes credentials :

1. Crée un projet sur [supabase.com](https://supabase.com)
2. **Settings > API** → `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. **Settings > Database** → `DATABASE_URL` (pooler) et `DIRECT_URL` (direct)
4. Crée un bucket `spot-images` dans **Storage** (Public bucket)

Voir [.env.example](.env.example) pour la liste complète des variables.

### Base de données

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

### Lancer en développement

```bash
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Valider la précision de la couche vent

```bash
pnpm wind:audit
```

Cet audit compare les cellules des grilles natives aux réponses ponctuelles du
même modèle Open-Meteo et de la même échéance. Il contrôle ICON-CH1 et GFS, les
rafales disponibles et, avec l'interpolation linéaire réellement affichée, les
raccords entre tuiles. Il conserve des tolérances strictes liées à l'arrondi de
l'API et réessaie brièvement si deux services Open-Meteo se synchronisent. Le
même contrôle est lancé quotidiennement par GitHub Actions afin de détecter une
dérive des modèles ou du format source avant qu'elle ne devienne une régression
visible.

### Prototype de tuiles ICON-EU indépendantes

Le générateur local télécharge directement les champs officiels U10, V10 et
rafales ICON-EU du DWD, puis produit le format binaire compact `OWW1` :

```bash
python3 -m venv .venv-wind
.venv-wind/bin/pip install -r scripts/requirements-wind.txt
.venv-wind/bin/python scripts/build-icon-eu-wind-tiles.py
```

Les fichiers générés dans `public/wind-data/` sont volontairement ignorés par
Git. Pour essayer ce fournisseur local sans supprimer le chemin Open-Meteo,
ajouter `OPENWIND_WIND_TILE_SOURCE=local` dans `.env.local`. Sans cette variable,
l'application conserve automatiquement le fournisseur existant.

La publication de production vers un stockage S3/Cloudflare R2 est atomique :
les tuiles sont relues depuis le stockage et son domaine public avant que
`latest.json` ne change. Le workflow horaire, les secrets nécessaires, le CORS,
la rétention et l'activation progressive sont détaillés dans
[docs/wind-tiles-production.md](docs/wind-tiles-production.md).

## Structure du projet

```
src/
  app/                        # Next.js App Router
    api/
      spots/                  # CRUD spots (Prisma + Supabase Storage)
      stations/               # MeteoSwiss + Pioupiou + Netatmo + Météo-France + Windball combinés
      wind/                   # Vent courant + grille batch
      plan/                   # Planificateur de voyages (scoring multi-sport)
      favorites/              # Toggle favoris spots et balises
      preferences/            # Préférences UI (sport, unités)
      forum/                  # Categories, topics, posts, votes
      auth/sync/              # Sync Supabase Auth → Prisma User
      cron/stations/          # Cron Vercel 10min → StationMeasurement
    spots/[id]/               # Détail spot (prévisions + boussole + archives)
    plan/                     # Trip planner
    forum/                    # Forum communautaire
    stations/[id]/            # Détail station + historique 48h
  components/
    map/                      # KiteMap (GL), SpotPopup, StationPopup, windgl/
    spot/                     # ForecastTable, WindChart, WindCompass, WindArchives
    plan/                     # TripPlanner, PlanFilters
    forum/                    # NewTopicForm, PostThread, ReplyForm, VoteButtons
    ui/                       # AuthModal, Badge, Button, Navbar, SearchBar
  lib/
    stations.ts               # MeteoSwiss SwissMetNet (LV95 → WGS84)
    pioupiou.ts               # Pioupiou OpenWindMap + WebSocket
    netatmo.ts                # Netatmo OAuth2 + token rotation
    meteofrance.ts            # Météo-France SYNOP (apikey header)
    forecast.ts               # Open-Meteo 7j (scoring kite/parapente)
    wind*.ts                  # Fetch, scoring, historique vent
    archives.ts               # Archives 5 ans (cache 7j)
    prisma.ts                 # Singleton PrismaClient
    supabase/                 # Client/Server Supabase
  types/                      # Types TypeScript partagés
prisma/
  schema.prisma               # 14 modèles + 5 enums
  migrations/                 # Historique migrations SQL
```

Pour plus de détails, voir la [documentation architecture](./docs/architecture.md).

## Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) — toute aide est la bienvenue !

## Licence

[AGPL v3](./LICENSE) — libre d'utiliser, modifier et héberger. Toute version modifiée hébergée publiquement doit publier son code source.
