-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverAlt" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Carnet Openwind',
    "location" TEXT,
    "readTime" INTEGER NOT NULL DEFAULT 8,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sources" JSONB NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT 'Openwind',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- Seed the first editable regional weather dossier.
INSERT INTO "Article" (
    "id",
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
) VALUES (
    'article-vents-regionaux-2026',
    'bise-foehn-joran-vents-suisse-romande',
    'Bise, foehn et joran : comprendre les vents de Suisse romande',
    'Trois noms familiers, trois mécanismes très différents. Voici comment les reconnaître, lire les balises sans surinterpréter et repérer les situations qui exigent le plus de prudence.',
    $article$
> **À retenir avant tout :** le nom d’un vent décrit une situation météorologique, pas la sécurité d’un spot. Le relief, l’exposition, les rafales, l’évolution du front et la signalisation locale restent déterminants.

En Suisse romande, trois mots reviennent souvent au bord de l’eau et sur les décollages : **bise**, **foehn** et **joran**. Ils ne sont pas interchangeables. La bise appartient à un courant de nord-est canalisé sur le Plateau, le foehn à un écoulement descendant, chaud, sec et souvent turbulent, tandis que le joran arrive du nord-ouest en descendant le Jura, parfois avec une grande soudaineté.

Ce guide relie les explications de MétéoSuisse à une lecture pratique des balises Openwind. Il ne remplace ni les avis de danger, ni une prévision locale, ni l’observation sur place.

## La bise : un nord-est canalisé sur le Plateau

MétéoSuisse définit la bise comme un vent de secteur nord-est soufflant sur le Plateau. La configuration classique associe des hautes pressions sur le nord de l’Europe et une dépression vers la Méditerranée. Le courant d’est à nord-est est alors guidé entre le Jura et les Alpes.

Le resserrement progressif de ces deux reliefs vers l’ouest canalise et accélère l’air. C’est pourquoi une même situation synoptique ne donne pas la même force partout : le bassin lémanique est souvent davantage exposé, tandis que des lacs, vallons ou rives plus abrités peuvent mesurer un vent sensiblement différent.

### Les signes utiles

- Une direction durable d’est à nord-est sur plusieurs stations du Plateau est plus parlante qu’une seule mesure locale.
- En saison froide, la bise peut soulever le brouillard en stratus. MétéoSuisse indique que plus elle est forte, plus le sommet de la couche de stratus tend à être élevé.
- La bise n’est pas toujours synonyme de ciel sec : une **bise noire** peut transporter de l’humidité et s’accompagner de pluie ou de neige.
- Une hausse rapide des rafales, même avec une moyenne modérée, signale une masse d’air moins régulière qu’un simple chiffre moyen ne le laisse penser.

### Bon à savoir pour le kite et le parapente

Pour le kite, la direction par rapport à la rive compte autant que la force. Une bise exploitable sur un secteur peut être déventée, rafaleuse ou orientée vers le large quelques kilomètres plus loin. Pour le parapente, le vent canalisé par le relief et le cisaillement sous une inversion peuvent dégrader fortement la masse d’air.

**Le bon réflexe Openwind :** comparer une balise proche du terrain à une balise régionale. Si les directions s’accordent mais que les forces divergent, le relief local est probablement en train de jouer un rôle important.

## Le foehn : chaud et sec, mais surtout turbulent

Le foehn du sud souffle au nord des Alpes lorsqu’un courant de sud traverse la chaîne. Le foehn du nord produit l’effet inverse au sud des Alpes. Dans les deux cas, l’air qui descend se comprime, se réchauffe et s’assèche. MétéoSuisse insiste aussi sur un caractère essentiel : le foehn est un vent turbulent, souvent marqué par des rafales.

Le schéma classique peut produire un mur nuageux près de la crête, une zone plus claire sous le vent appelée fenêtre de foehn, et parfois des nuages lenticulaires. Mais tous les épisodes ne présentent pas l’ensemble de ces signes. Un foehn de basses couches ou un effet local de descente peut se produire dans une configuration moins spectaculaire.

### Pourquoi une station ne suffit pas

Le foehn peut rester bloqué dans une vallée voisine, souffler en altitude sans atteindre le fond d’une vallée, ou au contraire déboucher soudainement. Une balise calme n’exclut donc pas un vent fort au-dessus, derrière une crête ou dans un autre couloir.

MétéoSuisse utilise un **index de foehn** calculé pour des stations déterminées. Pour le foehn du sud, la présence d’un vent du sud sur la crête principale des Alpes fait partie des conditions examinées. Cet index est un excellent repère, mais il ne transforme pas une station isolée en diagnostic universel pour toute la Suisse romande.

### Bon à savoir pour le kite et le parapente

- Un grand écart entre vent moyen et rafales doit être traité comme un signal de turbulence, pas comme une réserve de puissance agréable.
- Pour le parapente, les rotors, le cisaillement et les débordements de foehn peuvent concerner des zones où le vent au sol paraît encore faible.
- Pour le kite, une accélération irrégulière ou une orientation sous le vent du relief peut rendre le décollage et le retour à terre beaucoup plus délicats.
- L’absence de lenticulaires ou de mur de foehn ne suffit pas à écarter la situation.

## Le joran : le nord-ouest qui tombe du Jura

MétéoSuisse décrit le joran comme un vent de nord-ouest qui apparaît notamment lors du passage d’un front froid : l’air froid descend le long des versants vers le pied sud du Jura et peut provoquer de fortes rafales.

Sur le Léman, le joran est généralement plus rare et moins durable que la bise. Il peut toutefois s’étendre à tout le lac et être suivi d’un épisode de bise. Au printemps, certaines situations de nord-ouest peuvent entretenir un joran irrégulier pendant plusieurs jours, avec des accalmies nocturnes et des averses.

Sa difficulté pratique tient à sa variabilité. Le front, les cellules d’averse et le relief peuvent faire évoluer rapidement la direction et la force. MétéoSuisse associe explicitement le joran à de possibles turbulences de basses couches.

### Les indices à surveiller

- Un front froid ou des averses progressant depuis le nord-ouest.
- Un basculement rapide des stations du Jura et du Plateau vers le nord-ouest.
- Des rafales qui montent avant que le vent moyen ne s’établisse localement.
- Une différence nette entre une station sur le relief et une station au bord de l’eau.

**Le bon réflexe :** ne pas attendre que la balise du spot confirme seule le changement. L’évolution des stations situées en amont du flux aide à comprendre ce qui approche, sans permettre d’en déduire une heure d’arrivée exacte.

## Et au lac de la Gruyère ?

Le lac de la Gruyère est entouré d’un relief qui déforme et canalise les directions générales. Une prévision « bise » ou « nord-ouest » n’indique donc pas automatiquement une direction identique à Morlon, ni une force homogène sur tout le plan d’eau.

Pour préparer une sortie, il est plus robuste de croiser :

1. la situation générale et les avis de danger MétéoSuisse ;
2. les directions prévues à plusieurs niveaux, pas seulement une flèche horaire ;
3. une balise au bord du lac et un repère régional ;
4. l’écart entre vent moyen et rafales ;
5. l’état réel du plan d’eau, des nuages et des zones de mise à l’eau.

## Une lecture simple en cinq questions

Avant de décider, pose-toi ces cinq questions :

1. **Quel mécanisme domine ?** Bise durable, passage frontal avec joran, ou situation de foehn ?
2. **La direction est-elle cohérente entre les stations ?** Une station isolée peut être abritée ou accélérée.
3. **Les rafales racontent-elles une autre histoire que la moyenne ?** Plus l’écart est grand, moins le vent est régulier.
4. **La tendance se renforce-t-elle ?** Regarde l’évolution, pas uniquement la dernière valeur.
5. **Ce que tu vois sur place confirme-t-il les données ?** Si la réalité et l’écran divergent, le terrain a toujours le dernier mot.

## Ce que ce guide ne peut pas décider

Aucun article, modèle ou réseau de balises ne peut fixer une limite universelle de pratique. Le matériel, le niveau, la température de l’eau, l’orientation de la rive, les obstacles, les zones interdites et les possibilités de repli changent d’un site à l’autre.

En cas de doute, renoncer reste une décision météo à part entière. Consulte toujours les avis de danger officiels, les règles locales et les pratiquants expérimentés du site.
    $article$,
    'https://fnndeoqzqfxpznhcundq.supabase.co/storage/v1/object/public/spot-images/cmnq613tx00it04kw1d0vraq4/1776010538678.jpeg',
    'Lac de la Gruyère et relief des Préalpes fribourgeoises',
    'Comprendre le vent',
    'Suisse romande',
    11,
    'PUBLISHED',
    'Bise, foehn et joran en Suisse romande',
    'Comprendre la bise, le foehn et le joran avec les explications officielles de MétéoSuisse et des conseils de lecture des balises Openwind.',
    $sources$[
      {"label":"Bise — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/bise.html"},
      {"label":"Vent — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/vent.html"},
      {"label":"Foehn — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/foehn.html"},
      {"label":"Index de foehn — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/lindex-de-foehn.html"},
      {"label":"Turbulences — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/turbulences.html"},
      {"label":"Les vents du Léman — MétéoSuisse","url":"https://www.meteosuisse.admin.ch/meteo/meteo-et-climat-de-a-a-z/les-vents-du-leman.html"}
    ]$sources$::jsonb,
    'Openwind',
    '2026-08-26T07:00:00.000Z',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
