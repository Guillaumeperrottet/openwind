# Déploiement

Guide de déploiement Openwind sur Vercel + Supabase.

---

## Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Projet [Supabase](https://supabase.com) (gratuit)
- Repository GitHub connecté à Vercel

## Supabase

### 1. Créer le projet

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Noter la région (choisir la plus proche de vos utilisateurs)

### 2. Configurer la base de données

```bash
# Depuis le repo local
cp .env.example .env
# Remplir DATABASE_URL (pooler) et DIRECT_URL (direct) depuis Supabase > Settings > Database
pnpm prisma migrate dev
```

### 3. Storage

1. Aller dans **Storage** > **New bucket**
2. Nom : `spot-images`
3. Cocher **Public bucket**

### 4. Authentification

- Email/password est activé par défaut
- Pour OAuth (Google, GitHub) : **Authentication > Providers** > configurer les credentials

## Vercel

### 1. Importer le projet

1. [vercel.com/new](https://vercel.com/new) > Import Git Repository
2. Framework : **Next.js** (détecté automatiquement)

### 2. Variables d'environnement

Configurer dans **Settings > Environment Variables** :

| Variable                                       | Description                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`                                 | Connection string Supabase (pooler/pgBouncer)                              |
| `DIRECT_URL`                                   | Connection string Supabase (direct, pour migrations)                       |
| `NEXT_PUBLIC_SUPABASE_URL`                     | URL du projet Supabase                                                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Clé publique Supabase                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`                    | Clé service role (secrète)                                                 |
| `NEXT_PUBLIC_STORAGE_BUCKET`                   | `spot-images`                                                              |
| `NEXT_PUBLIC_MAP_STYLE`                        | URL du style MapLibre (ex: `https://tiles.openfreemap.org/styles/liberty`) |
| `CRON_SECRET`                                  | Token aléatoire pour protéger le cron job                                  |
| `ADMIN_USER_IDS`                               | UUIDs Supabase des admins (virgule-séparé)                                 |

Optionnel (Netatmo) :

| Variable                | Description                               |
| ----------------------- | ----------------------------------------- |
| `NETATMO_CLIENT_ID`     | Client ID Netatmo app                     |
| `NETATMO_CLIENT_SECRET` | Client secret Netatmo app                 |
| `NETATMO_REFRESH_TOKEN` | Token initial (sera ensuite rotaté en DB) |

### 3. Cron Job

Le fichier `vercel.json` configure le cron :

```json
{
  "crons": [
    {
      "path": "/api/cron/stations",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Vercel injecte automatiquement le header `Authorization: Bearer {CRON_SECRET}`.

### 4. Build

Le build Vercel exécute automatiquement :

1. `pnpm install`
2. `prisma generate` (via `postinstall` ou `build` script)
3. `next build`

### 5. Domaine

- **Settings > Domains** > ajouter votre domaine personnalisé
- Configurer les DNS (CNAME vers `cname.vercel-dns.com`)

## Seeds (optionnel)

Pour peupler la base avec des spots mondiaux :

```bash
pnpm exec tsx prisma/seed.ts
```

Le fichier `prisma/worldwide-spots.json` contient des spots de départ.

## Mises à jour

```bash
git push origin main    # Vercel déploie automatiquement
```

Pour les migrations DB :

```bash
pnpm prisma migrate dev --name description_changement
git add prisma/migrations/
git push
```

La migration sera appliquée au prochain déploiement (ou manuellement via `prisma migrate deploy`).
