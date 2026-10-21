# Guides locaux et référencement

## Routes et traductions

Les guides utilisent le gabarit `src/components/carnet/LocalGuideTemplate.tsx`
et la route `/{locale}/vent-en-direct/{slug}`. L’URL historique du lac de la
Gruyère est conservée. L’index `/{locale}/vent-en-direct` et les liens depuis
l’accueil, les spots et les balises permettent de les découvrir sans manipuler
la carte.

Le registre `src/lib/local-guides.ts` définit les lieux, coordonnées, stations,
spots, sources et textes FR/DE/IT. Pour ajouter un guide :

1. Ajouter une entrée `LocalGuide` avec un slug stable et les identifiants réels
   des spots et stations concernés.
2. Renseigner une traduction française complète : titre, introduction,
   description d’image, contenu Markdown et questions utiles aux pratiquants.
3. Ajouter les versions allemandes et italiennes après relecture, avec les noms
   locaux du lieu. Les traductions absentes ne sont pas annoncées en `hreflang`
   ni dans le sitemap. Une visite dans une langue indisponible redirige vers FR.
4. Vérifier les sources et les informations locales, puis renseigner les dates
   de publication et de modification réelles. Ne pas ajouter de lieux fictifs
   ou de pages vides pour multiplier les mots-clés.
5. Lancer les tests et contrôler le rendu avec et sans JavaScript.

Le guide français existant reste administrable : son article `LOCAL_GUIDE`
publié fournit le corps, les sources, les associations, la couverture et
l’auteur. Les champs SEO renseignés dans l’administration restent prioritaires
pour ses métadonnées françaises. Les traductions DE/IT sont versionnées dans le
registre ; modifier l’article français ne traduit pas ces textes automatiquement.
Le registre fournit également un contenu de secours si la base est indisponible.

## Données météo

Les mesures des guides proviennent du dernier snapshot de stations chargé
côté serveur, puis sont rafraîchies par SWR avec les observations des capteurs.
Aucune estimation de modèle ne remplace une mesure dans ces cartes. Elles indiquent le
réseau et la date complète ; les observations anciennes sont signalées. Les
prévisions Open-Meteo sont présentées séparément sous forme de tableau HTML,
également disponible sur les fiches de spots. Une panne d’une source ne doit
pas empêcher la lecture du contenu éditorial.

## Catalogue des stations

Le cron existant conserve un catalogue durable dans la clé SystemConfig
`stations_catalog`, en complément de `stations_cache`. Aucune migration de
base ni nouveau secret n’est nécessaire. Le premier passage après déploiement
reprend aussi le snapshot précédent. Une station absente d’un réseau conserve
son identité et la date de sa dernière observation ; aucune mesure n’est
redatée. Une panne de base se propage comme erreur serveur au lieu d’être
interprétée comme une station inexistante.

Le sitemap utilise ce catalogue et les articles courants, sans dépendre de la
rétention de trois jours des mesures. Il est dynamique et échoue en cas de
panne de base plutôt que de publier silencieusement une liste amputée.

## Pagination et indexation

L’annuaire utilise `?page=2`, avec un tri alphabétique stable par défaut et de
vrais liens précédent/suivant. Chaque page non filtrée a sa propre URL canonique.
Les recherches `q`, filtres `network` et tris alternatifs restent utilisables,
mais portent `noindex, follow`. Les URLs de webcams sont également traitées
comme des recherches internes, en attendant d’éventuelles pages locales durables.

## Vérifications au déploiement

- Exécuter `pnpm test`, `pnpm exec tsc --noEmit` et `pnpm build`.
- Contrôler les guides `/fr/`, `/de/` et `/it/vent-en-direct/lac-de-la-gruyere` :
  une seule H1, contenu localisé, canonique propre et trois langues disponibles.
- Vérifier `/balises?page=2`, ses liens HTML et sa canonique.
- Vérifier `/sitemap.xml` et le passage normal du cron stations après déploiement.
- Dans Search Console, inspecter les trois guides et l’annuaire, puis contrôler
  les canoniques sélectionnées et les résultats par langue et par pays.
- Suivre les clics suisses hors marque ainsi que les inscriptions, favoris et
  usages du planificateur. La présence de code analytique ne garantit pas que
  les événements soient bien configurés comme conversions dans GA4.
