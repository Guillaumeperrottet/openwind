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

Lors d’un changement de langue sans rechargement complet, `DocumentLanguage`
synchronise aussi l’attribut `lang` du document avec la route. Le layout racine
conserve le bon attribut dans le HTML initial ; cette synchronisation couvre
les navigations côté client, pour lesquelles le layout racine reste monté.
Contrôler FR → IT → DE dans le navigateur, en plus des requêtes HTTP directes.

## Constance, Zurich, Thoune et Morat (lot 4)

Les fichiers `lac-de-constance.ts`, `lac-de-zurich.ts`, `lac-de-thoune.ts` et
`lac-de-morat.ts` dans `src/lib/guides/` ajoutent douze pages FR/DE/IT. Le registre
commun les intègre à l’accueil (onze lacs), à l’index, à la recherche globale,
aux liens des fiches associées et au sitemap (33 pages de guides).

Les catalogues publics ont été vérifiés le 21 octobre 2026. Morat est relié à
la fiche nautique Morat – Murtenstrand. Les trois autres guides ne créent pas
de fiche de spot ; ils fournissent les sources locales pertinentes.

Les points de prévision et les observations restent distincts :

- Constance : point terrestre Güttingen ; stations GUT, ARH et STK. Steckborn
  est explicitement situé dans le bassin de l’Untersee, distinct de l’Obersee.
- Zurich : point terrestre Wädenswil ; stations WAE et SMA (Fluntern sur les
  hauteurs). Les stations municipales Mythenquai et Tiefenbrunnen sont des
  sources externes, sans prétendre les avoir intégrées aux cartes du guide.
- Thoune : point Thun / Hafeneinfahrt ; capteur Pioupiou 1723 à l’entrée du port
  et station terrestre THU. Le marqueur météo ne désigne pas une mise à l’eau.
- Morat : point de la fiche Murtenstrand ; stations régionales PAY et CRM,
  hors du lac. CRM est Cressier NE, à distinguer de Cressier FR.

Les couvertures sont conservées dans `public/images/guides/` avec attribution
sur l’accueil, l’index et les guides : Gerd Eichmann, vue du Bodensee entre
Münsterlingen et Romanshorn (CC BY-SA 4.0) ; Jakub Hałun, « Lake Zurich at
Rapperswil, 20250330 0825 7818 » (CC BY 4.0) ; Christian David, « Schloss Spiez
und Hafen Spiez » (CC BY-SA 4.0) ; Carsten Steger, « Aerial image of Lake Murten
(view from the northeast) » (CC BY-SA 4.0). Les liens vers les fichiers Commons
et les licences figurent dans chaque définition.

Les tests de rendu, d’accueil, de sitemap et de redirection parcourent tout le
registre. Les recherches testent les variantes Bodensee / Lago di Costanza,
Zürichsee / Zuerichsee / Lago di Zurigo, Thunersee / Lago di Thun et Murtensee /
Lago di Morat, dans chacune des trois langues. À la livraison, contrôler les
douze réponses HTTP, les observations datées, les prévisions, les canoniques,
les langues disponibles, les images optimisées et la navigation sur mobile.

## Quatre-Cantons, Lugano, Walensee et Joux (lot 5)

Les définitions `lac-des-quatre-cantons.ts`, `lac-de-lugano.ts`, `walensee.ts`
et `lac-de-joux.ts` ajoutent douze pages FR/DE/IT. Le registre commun les
intègre à l’accueil (quinze lacs), à la recherche, à l’index et au sitemap
(45 URLs de guides). Les canoniques restent propres à chaque langue avec
alternatives FR/DE/IT et x-default. Aucun guide anglais n’est annoncé.

Les catalogues publics et les sources locales ont été contrôlés le
21 octobre 2026. Les contextes sont traduits et affichés près des valeurs :

- Quatre-Cantons : stations terrestres LUZ et GES dans des secteurs distincts,
  prévision au point terrestre de Luzern. L’article donne une vue des bassins
  et relie explicitement le guide spécialisé Urnersee dans chaque langue.
- Lugano : station terrestre LUG et prévision aux mêmes coordonnées. Une
  seule station pertinente, sans ajouter un sommet pour remplir la grille.
  Le guide distingue les rives suisses et les compétences italiennes.
- Walensee : QUI près de la rive nord et Pioupiou 2027 près d’un terrain
  d’atterrissage de parapente à Walenstadt. Ce marqueur météo ne désigne pas
  un accès nautique. Prévision au point de Quinten, pas pour tous les bassins.
- Joux : CHB aux Charbonnières, à terre près du Brenet ; point de prévision
  identique. La fiche existante `cmnpsrv4t0008haf6wb2u0lgc` concerne une
  pratique hivernale sur lac gelé. Le texte et un paragraphe traduit juste
  avant le lien précisent qu’il ne s’agit pas d’un accès nautique estival
  ni d’une confirmation d’ouverture de la glace. La fiche hivernale du
  Brassus et Saint-Joux au lac de Bienne ne sont pas associées à ce guide.

Les autres guides ne fabriquent pas de spot nautique. Le gabarit adapte la
grille aux guides à une seule balise et peut afficher `spotsIntro` près des
liens lorsque leur contexte saisonnier doit être précisé. Le bulletin local
de l’état du lac est cité pour Joux ; aucune épaisseur de glace n’est déduite
du vent ou d’une prévision de température.

Les quatre photos locales sont attribuées dans toutes les surfaces, sous
CC BY-SA 4.0 : Daniel Reust, « Vierwaldstättersee von Brunnen aus » ;
JoachimKohler-HB, « Morcote, Lago di Lugano & Brusino Asizio (2017) » ;
Agnes Monkelbaan, « Walensee (Walenmeer) (actm) 02 » ; Giles Laurent,
« 040 Dent de Vaulion and Lac de Joux at Sunset ». Les textes alternatifs
décrivent les images réelles, dont la vue hivernale de Joux et le coucher
de soleil depuis Brunnen. Les liens Commons et les licences sont conservés
dans les définitions.

Avant publication, contrôler les douze rendus HTML, leurs sources, leurs
observations datées, les alternatives et données structurées, les 45 URLs
de guides du sitemap, les alias multilingues dans la recherche, les liens
de l’accueil, l’accès carte et les images optimisées. Vérifier le changement
de langue côté client, les cartes à une balise sur mobile et le contexte
saisonnier affiché à côté du spot de Joux.

## Zoug, Brienz, Sempach et Sils (lot 6)

Les fichiers `lac-de-zoug.ts`, `lac-de-brienz.ts`, `lac-de-sempach.ts` et
`lac-de-sils.ts` ajoutent douze guides FR/DE/IT. Leur inscription au registre
commun alimente l’accueil (dix-neuf lacs), la recherche globale, l’index,
les liens des balises et le sitemap (57 URLs de guides). Les canoniques,
alternatives FR/DE/IT et x-default, métadonnées sociales et données structurées
du gabarit s’appliquent à chaque traduction.

Les catalogues publics et les sources ont été contrôlés le 21 octobre 2026.
Aucune fiche nautique correspondant à ces quatre lacs n’a été trouvée : les
guides ne réutilisent pas les fiches de parapente de la région de Brienz ni
la fiche de kite du lac voisin de Silvaplana. Les sources locales indiquent
les activités et les accès à vérifier.

Les observations et prévisions sont explicitement situées dans chaque langue :

- Zoug : CHZ à Cham, en retrait de la rive nord ; point de prévision aux
  mêmes coordonnées terrestres, distinct de la ville de Zoug et du sud du lac.
- Brienz : BRZ à terre vers l’extrémité est, INT dans la plaine d’Interlaken
  hors du lac ; prévision au point de Brienz. Un lien éditorial localisé
  renvoie au guide de Thoune pour comparer les deux lacs séparément.
- Sempach : EGO à Egolzwil, hors du bassin au nord-ouest ; prévision à Nottwil
  près de la Bahnhofstrasse, à un autre point que la mesure régionale.
  Les sources distinguent l’offre de windsurf et les secteurs de kitesurf.
  La webcam du prestataire reste une source externe, sans promesse d’image
  individuelle déjà intégrée aux fournisseurs de la carte Openwind.
- Sils : SIA à terre à Sils / Segl-Maria entre les deux lacs, prévision aux
  mêmes coordonnées. La « Windsurfing Station Sils » de l’office de tourisme
  est bien située sur le lac de Silvaplana ; le texte et la FAQ le précisent,
  avec un lien vers ce guide dans chaque langue. Aucun horaire ni force du
  vent du Maloja n’est garanti.

Les quatre photos locales sont sous CC BY-SA 4.0, attribuées sur l’accueil,
l’index et les guides : Zikai Liu, « Zugersee-2021-11-07 » ; Carsten Steger,
« Aerial image of Lake Brienz (view from the southwest) » ; Yves Knupp,
« Segelndes Boot auf dem Sempachersee » ; Ziegenberg, « Maloja mit Silsersee
und Maloja Palace ». Les définitions conservent les liens Commons et de
licence ; les textes alternatifs décrivent les photos inspectées.

Les tests parcourent le registre pour le rendu serveur, l’accueil, le sitemap
et les redirections. Les tests de recherche couvrent notamment Zugersee,
Lago di Zugo, Brienzersee, Bönigen / Boenigen, Sempachersee, Nottwil, Silsersee,
Lej da Segl et Plaun da Lej dans les trois langues. Avant publication, vérifier
les douze pages, les 57 URLs de guides du sitemap, les liens d’accueil et de
comparaison, les sources, les images optimisées, les observations horodatées,
les prévisions et le changement de langue sur mobile.

## Sihlsee, Ägeri, Hallwil et Sarnen (lot 7)

Les définitions `sihlsee.ts`, `lac-d-aegeri.ts`, `lac-de-hallwil.ts` et
`lac-de-sarnen.ts` ajoutent douze guides FR/DE/IT. Le registre commun les
intègre à l’accueil (23 lacs), à la recherche globale, à l’index et au sitemap
(69 URLs de guides). Chaque traduction utilise son propre titre, sa description,
son contenu, sa FAQ et son texte alternatif. Les canoniques, alternatives
FR/DE/IT et x-default et données structurées du gabarit restent appliqués.

Les catalogues publics et les sources ont été contrôlés le 21 octobre 2026.
Aucune fiche nautique correspondant à ces quatre lacs n’a été trouvée ; le
spot de parapente Stanserhorn n’est pas associé au guide du Sarnersee.
Chaque guide utilise une seule balise terrestre pertinente, explicitement
décrite dans les trois langues :

- Sihlsee : EIN à Einsiedeln, à l’ouest du lac ; prévision au même point
  terrestre. Les consignes du kite distinguent les secteurs du lac et
  l’exclusion au sud du Steinbachviadukt selon SRSZ 784.331.
- Ägeri : AEG à Oberägeri, près du nord du lac ; prévision au même point.
  CHUCKSURF est référencé par Zoug Tourisme. Les accès et zones protégées
  renvoient aux sources cantonales, dont BGS 753.5.
- Hallwil : MOA à Mosen, près de l’extrémité sud ; prévision au même point.
  Le contenu et la FAQ indiquent l’interdiction du kitesurf rapportée par les
  sources cantonales. Les activités de voile et SUP sont présentées séparément.
- Sarnen : GIH dans la plaine de Giswil au sud du lac ; prévision au même
  point, sans la présenter comme une mesure au centre de Sarnen. La FAQ
  cantonale signale l’interdiction des activités nautiques autour de la prise
  d’eau de Sachseln. La Surfstation Alpnach est située sur l’Alpnachersee,
  distinct du Sarnersee, et n’est pas présentée comme une offre sur ce lac.

Des liens éditoriaux localisés permettent de comparer Sihlsee / Zurich,
Ägeri / Zoug, Hallwil / Sempach et Sarnen / Quatre-Cantons. Les tests de
rendu vérifient ces liens dans les trois langues. Les tests de recherche
couvrent les noms FR/DE/IT, Aegerisee et Oberaegeri, ainsi que Willerzell,
Beinwil am See, Giswil et Sachseln. L’accueil et le sitemap sont testés sur
tout le registre ; les langues non disponibles ne sont pas annoncées.

Les quatre photos locales sous CC BY-SA 4.0 sont attribuées sur l’accueil,
l’index et les guides : Jane kurko, « Sihlsee lake of Switzerland » ; Pakeha,
« Morgarten am Ägerisee 02 » ; Carsten Steger, « Aerial image of Lake Hallwil
(view from the south) » et « Aerial image of Lake Sarnen (view from the
southwest) ». Les liens Commons et de licence sont conservés dans les
définitions et les textes alternatifs décrivent les photos inspectées.

Avant publication, contrôler les douze pages, les liens d’accueil et de
comparaison, les 69 URLs de guides du sitemap, les recherches par noms locaux,
les sources, les images optimisées, les observations datées, les prévisions,
les canoniques, les alternatives et la navigation multilingue sur mobile.

## Navigation du catalogue et du Carnet (22 octobre 2026)

L’accueil présente six guides et un lien visible vers le catalogue complet avec
le nombre de lacs. La recherche globale conserve tout le registre et le lien
direct vers la carte reste disponible. Le catalogue FR/DE/IT affiche six guides
par page, avec recherche par nom, alias, rive ou région. Les liens numérotés,
précédent et suivant sont rendus côté serveur : aucune interaction JavaScript
n’est nécessaire pour accéder aux pages suivantes.

Le Carnet français rassemble les articles publiés et les guides du registre,
sans doublon d’URL. Une édition française publiée dans l’administration reste
prioritaire sur la fiche du registre. Le dernier article éditorial ouvre la
collection ; les autres publications suivent leur date et leur URL pour un
ordre stable. Le Carnet affiche neuf publications par page et propose les
filtres Tout / Articles / Guides des lacs. La recherche et les filtres utilisent
un formulaire GET et des liens partageables, conservés lors du changement de
page. Une nouvelle recherche ou un changement de type repart de la première
page. Les photos Commons gardent leurs crédits sur les nouvelles cartes.

Les pages numérotées ont des URLs `?page=n` et un canonical propre (la première
page utilise l’URL sans `page`). Le JSON-LD ne liste que les cartes visibles,
avec leur position dans la collection. Les variantes de recherche et de filtre
reçoivent `noindex, follow` ; elles ne sont pas ajoutées au sitemap. Celui-ci
conserve toutes les URLs individuelles des guides et ajoute les pages non
filtrées du catalogue et du Carnet. Les redirections des langues du Carnet vers
le français conservent les paramètres de navigation.

Référence : [pagination et chargement incrémental, Google Search Central](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

Vérifier avant publication : parcours de toutes les pages sans doublon ni
omission, recherche d’un guide absent de la première page, filtres et retour
arrière, recherche vide, état sans résultat, pages hors limites, canonicals,
alternatives FR/DE/IT sur les pages non filtrées, sitemap et rendu mobile.
