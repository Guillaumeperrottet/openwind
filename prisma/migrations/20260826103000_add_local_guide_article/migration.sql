CREATE TYPE "ArticleKind" AS ENUM ('EDITORIAL', 'LOCAL_GUIDE');

ALTER TABLE "Article"
ADD COLUMN "kind" "ArticleKind" NOT NULL DEFAULT 'EDITORIAL';

INSERT INTO "Article" (
  "id",
  "kind",
  "slug",
  "title",
  "excerpt",
  "content",
  "coverImage",
  "coverAlt",
  "category",
  "location",
  "readTime",
  "status",
  "seoTitle",
  "seoDescription",
  "sources",
  "authorName",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
VALUES (
  'article-guide-gruyere-2026',
  'LOCAL_GUIDE',
  'lac-de-la-gruyere',
  'Vent en direct au lac de la Gruyère',
  'Les mesures de Morlon Beach et Marsens, le spot local, les directions à surveiller et les informations essentielles avant d’aller sur l’eau.',
  $article$
## Lire le relief avant de lire le chiffre

Le lac de la Gruyère s’étire entre des rives découpées, des collines et les premiers reliefs des Préalpes fribourgeoises. Cette géographie peut canaliser une direction générale, abriter une baie ou créer un écart sensible entre deux points pourtant proches sur la carte.

Une prévision régionale favorable ne signifie donc pas que le vent sera homogène à Morlon. La mesure locale, les rafales, les changements de direction et l’état réel du plan d’eau doivent être lus ensemble.

## Croiser Morlon et Marsens

La balise de Morlon Beach donne le repère le plus proche de la rive et du spot. La station de Marsens apporte un contexte régional utile. Lorsque les deux stations montrent une direction comparable, la tendance générale devient plus crédible. Lorsqu’elles divergent fortement, le relief ou une évolution locale peut être en train de jouer un rôle important.

> Une balise décrit son emplacement. Elle ne garantit ni le vent sur tout le lac, ni la sécurité d’une mise à l’eau.

## Morlon Beach, un spot qui demande de l’expérience

Morlon est le point de référence Openwind pour le kitesurf sur le lac. Les directions relevées se répartissent principalement du nord-est au nord-ouest, mais la configuration encaissée peut produire un vent irrégulier et des zones déventées.

- Observe les arbres, les risées et l’ensemble du plan d’eau avant de préparer le matériel.
- Accorde autant d’importance aux rafales qu’à la moyenne affichée.
- Garde une marge importante avec les arbres, les baigneurs et les autres usagers.
- Consulte les zones d’exclusion cantonales et la signalisation présente sur place.

## Trois contrôles avant une sortie

### Comparer les balises

Morlon décrit le bord du lac tandis que Marsens aide à comprendre la situation régionale. Une différence marquée mérite de ralentir la décision et de poursuivre l’observation.

### Regarder les rafales

Sur un site irrégulier, l’écart entre le vent moyen et les rafales est aussi important que la vitesse moyenne. Un écart qui augmente peut signaler une masse d’air plus turbulente.

### Observer le plan d’eau

Les lignes de vent, le clapot, les grains et le comportement des autres pratiquants donnent des informations qu’aucune application ne remplace.

## Sécurité et règles locales

La plage de Morlon est un espace public partagé. Le kitesurf est soumis aux zones d’exclusion cantonales et à la signalisation locale. Les règles peuvent évoluer : les informations officielles et les panneaux présents au bord de l’eau restent toujours prioritaires.
  $article$,
  'https://fnndeoqzqfxpznhcundq.supabase.co/storage/v1/object/public/spot-images/cmnq613tx00it04kw1d0vraq4/1776010538678.jpeg',
  'Vue aérienne du lac de la Gruyère et des Préalpes fribourgeoises',
  'Guide local',
  'Fribourg',
  6,
  'PUBLISHED',
  'Vent au lac de la Gruyère en direct',
  'Vent en direct au lac de la Gruyère : balise de Morlon Beach, rafales, direction, spot de kitesurf, accès et conseils de sécurité locaux.',
  '[{"label":"Lac de la Gruyère — Région de Fribourg","url":"https://fribourg.ch/fr/all/nature/lac-de-la-gruyere/"},{"label":"Kitesurf sur les lacs fribourgeois — État de Fribourg","url":"https://www.fr.ch/dsjs/actualites/la-pratique-du-kitesurf-est-desormais-autorisee-sur-quatre-lacs-fribourgeois-moyennant-certaines-zones-dinterdiction-pour-preserver-lavifaune"},{"label":"Règlement sur la navigation — État de Fribourg","url":"https://bdlf.fr.ch/app/fr/texts_of_law/785.21"}]'::jsonb,
  'Openwind',
  '2026-08-24 08:00:00+00',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
