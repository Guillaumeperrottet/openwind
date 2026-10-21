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

## Accueil et recherche globale (lot 2)

L’accueil public présente les guides Gruyère, Neuchâtel et Léman avec des liens
HTML et une recherche commune à l’accueil et à la navigation. `?view=map` ouvre
immédiatement la carte, `?view=home` force l’accueil. Les comptes ayant terminé
l’onboarding conservent leur préférence MAP ou DASHBOARD à la racine. Le
changement de langue conserve ces paramètres.

Les deux nouveaux guides sont définis dans `src/lib/swiss-lake-guides.ts`, en
FR/DE/IT, avec leurs vrais identifiants de spots et de stations. Le point de
prévision est nommé (Neuchâtel ou Pully), et les cartes de stations expliquent
le rôle des repères régionaux. Le sitemap et les liens des fiches associées
utilisent automatiquement le registre commun.

`/api/search` renvoie au maximum 15 résultats de métadonnées publiques, groupés
par type. La recherche reconnaît les variantes linguistiques des lacs, les
accents et les lieux associés. Seuls les articles EDITORIAL publiés sont
sélectionnés ; leur corps et les informations de compte ne font pas partie de
l’index. Les articles restant francophones portent une destination `/fr/`.

Le serveur conserve un index public pendant 60 secondes et regroupe les
chargements simultanés. Un échec n’est pas mis en cache : les guides versionnés
restent proposés avec un avertissement de résultats partiels. Les suggestions
contenant des identifiants de favoris utilisent `private, no-store`. Les
réponses de recherche portent `X-Robots-Tag: noindex, follow`.

Les résultats « Webcams autour du lieu » ouvrent la recherche géographique
existante. Ce ne sont pas des caméras individuelles indexées : leur présence
et leur état dépendent du fournisseur. La recherche n’appelle pas l’API de
webcams à chaque frappe. Les événements analytiques de sélection contiennent
le type et l’identifiant du résultat, jamais le texte saisi.

Les couvertures Neuchâtel et Léman sont servies depuis `public/images/guides/`
et optimisées par Next Image. Les auteurs, sources et licences sont affichés
sur l’accueil, l’index des guides et les guides concernés. Sources : Thomas
Woodtli, « Port de Portalban », CC BY-SA 2.0 ; Giles Laurent,
« 044 Lake Geneva and Swiss Alps », CC BY-SA 4.0. Les liens vers les originaux
et les licences sont conservés dans les définitions des guides.

Vérifier aussi lors de la livraison : recherche dans chaque catégorie,
Neuchâtel sans accent, Genfersee et Lago di Ginevra, navigation clavier,
affichage étroit, raccourci des favoris, accès direct à la carte et maintien
de cette vue lors d’un changement de langue. Les six nouvelles pages de
guide doivent répondre en 200 et apparaître dans le sitemap avec FR/DE/IT.

## Silvaplana, Urnersee, lac Majeur et Bienne (lot 3)

Les quatre définitions de `src/lib/guides/` fournissent douze pages FR/DE/IT.
Le registre les expose automatiquement dans la recherche, le sitemap, l’index
et les liens associés des balises et spots. L’accueil utilise `getHomeGuides`
pour présenter tous les guides disponibles, en conservant les trois lacs
historiques en tête et trois raccourcis dans le bloc de recherche.

Les identifiants ont été contrôlés dans les catalogues publics du 21 octobre
2026 : Silvaplana et La Neuveville | St-Joux disposent d’une fiche nautique.
Aucune fiche nautique n’a été trouvée pour l’Urnersee et le lac Majeur ; ces
guides ne fabriquent pas de spot et renvoient aux sources locales.

Les observations sont des repères régionaux, explicitement qualifiés dans les
trois langues : Segl-Maria et Samedan pour Silvaplana ; Altdorf et Gersau
(bassin voisin) pour l’Urnersee ; Locarno / Monti (hauteurs) et Magadino /
Cadenazzo (plaine) pour le lac Majeur ; Cressier et Chasseral (sommet) pour
Bienne. Aucune mesure n’est présentée comme prise sur l’eau. Les points des
prévisions sont Silvaplana, Altdorf / Reusstal, Locarno / Monti et La Neuveville /
Saint-Joux. Leurs limites sont expliquées dans le contenu et les FAQ.

Les photographies sont locales et leurs crédits apparaissent sur chaque
surface : Hansueli Krapf, « 2011-08-01 13-29-34 Switzerland Silvaplana »,
CC BY-SA 3.0 ; Badener, « Seelisberg Urnersee 5120 », CC BY 3.0 ; Ngbrx,
« Lago Maggiore from Ascona », CC BY-SA 4.0 ; W. Bulach,
« 00 0370 St. Peterinsel - Bielersee », CC BY-SA 4.0. Les définitions
conservent les liens Wikimedia Commons et les licences. La vue de l’île
Saint-Pierre ne désigne pas un accès autorisé pour les sports nautiques.

À la livraison, contrôler les douze pages, leurs langues et canoniques, les
21 URLs de guides du sitemap, les liens de l’accueil et les recherches par
noms locaux (Silvaplanersee, Urnersee, Langensee, Verbano, Bielersee). Vérifier
les cartes de deux stations sur mobile et les redirections des langues non
disponibles avant toute publication.
