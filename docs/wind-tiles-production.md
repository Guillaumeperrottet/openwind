# Publication des tuiles de vent

La couche ICON-EU peut être produite indépendamment d'Open-Meteo et publiée
dans un bucket compatible S3. Le chemin recommandé pour la production est un
bucket Cloudflare R2 relié au domaine dédié
`https://tiles.openwind.ch`.

## Garanties du pipeline

- chaque fichier DWD est identifié et contrôlé par SHA-256 ;
- chaque cellule OWW1 est relue par le générateur avant publication ;
- chaque tuile envoyée est relue depuis l'API S3 et depuis le domaine public ;
- le contrôle public vérifie aussi le CORS attendu par `www.openwind.ch` ;
- les tuiles et le manifeste du jeu sont immuables ;
- `latest.json` n'est remplacé qu'après toutes les vérifications ;
- douze jeux restent disponibles par défaut pour le diagnostic ou le rollback ;
- l'application conserve son repli automatique vers Open-Meteo.

## Préparer Cloudflare R2

1. Créer un bucket privé, par exemple `openwind-wind`.
2. Relier un domaine personnalisé au bucket. Le sous-domaine `r2.dev` est
   réservé aux essais et ne doit pas servir la production.
3. Activer une règle Cloudflare « Cache Everything » pour que les fichiers
   `.oww` utilisent bien leur en-tête `Cache-Control` immuable.
4. Appliquer la politique [wind-tiles-r2-cors.json](wind-tiles-r2-cors.json)
   dans **R2 > Bucket > Settings > CORS Policy**.
5. Créer un jeton R2 limité à ce bucket avec la permission
   **Object Read & Write**.

## Configurer GitHub

Ajouter les secrets du dépôt suivants :

- `WIND_TILE_S3_ENDPOINT` : `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `WIND_TILE_S3_BUCKET` : nom du bucket
- `WIND_TILE_S3_ACCESS_KEY_ID` : identifiant du jeton R2
- `WIND_TILE_S3_SECRET_ACCESS_KEY` : secret du jeton R2

Ajouter également la variable de dépôt :

- `WIND_TILE_PUBLIC_BASE_URL` : domaine public sans slash final,
  `https://tiles.openwind.ch`

Variables facultatives :

- `WIND_TILE_RETAIN_DATASETS` : nombre de jeux conservés, `12` par défaut ;
- `WIND_TILE_S3_REGION` : `auto` pour R2 ;
- `WIND_TILE_S3_PREFIX` : préfixe du bucket. S'il est utilisé, le même chemin
  doit terminer `WIND_TILE_PUBLIC_BASE_URL`.

Le workflow **Publish wind tiles** peut alors être lancé manuellement. Après
ce premier passage, vérifier :

```text
https://tiles.openwind.ch/dwd_icon_eu/latest.json
```

Il s'exécutera ensuite toutes les heures, à la minute 37, sans publier deux
jeux en parallèle.

## Activer progressivement l'application

Une fois le domaine public vérifié, définir dans l'environnement de
préproduction Vercel :

```text
OPENWIND_WIND_TILE_SOURCE=https://tiles.openwind.ch
```

Tester la carte européenne, les petits et grands écrans, puis appliquer la
même variable en production. Retirer cette variable désactive immédiatement
les tuiles indépendantes et remet le chemin Open-Meteo existant en service.

## Vérifications locales

```bash
python3 -m unittest scripts.test_publish_wind_tiles -v
WIND_TILE_PUBLIC_BASE_URL=https://tiles.openwind.ch \
  python3 scripts/publish_wind_tiles.py --validate-only
```

La publication complète utilise les mêmes variables que le workflow. L'option
`--skip-public-verification` ne doit servir qu'à tester un stockage S3 local :

```bash
python3 scripts/publish_wind_tiles.py --skip-public-verification
```

## Surveillance en production

Le workflow **Wind health** s’exécute chaque heure, indépendamment de la
publication. Il contrôle le manifeste public, sa fraîcheur, le décodage d’une
vraie tuile, le CORS et l’API de production. Un incident fait échouer le
workflow et déclenche les notifications GitHub configurées pour le dépôt.

Le même contrôle peut être lancé à la demande :

```bash
pnpm wind:health
```

Les administrateurs disposent aussi de la page `/admin/wind`, actualisée
automatiquement toutes les 60 secondes. Elle ne requiert aucune clé R2 dans le
navigateur et reste protégée par la liste `ADMIN_USER_IDS` existante.
