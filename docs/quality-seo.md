# Contrôle qualité et référencement — 3 novembre 2026

Cette passe prépare la version locale pour publication. Elle ne confirme ni une indexation effective ni un classement Google ou une citation par un assistant IA.

## Indexation et contenu

- La page `/[locale]/lacs/gruyere` est publique par défaut, possède une adresse canonique et des alternatives FR/EN/DE/IT et figure dans le sitemap. `ALPLAKES_LAKE_PAGE_ENABLED=false` permet de la désactiver : la route répond alors 404, les liens vers le détail sont retirés et le sitemap l’omet.
- Les températures sont décrites comme des estimations Alplakes / Eawag, modèle Simstrat à 1 m, sans sonde locale. Le crédit et la licence concernent les données amont.
- Explorer et l’annuaire des températures ont leurs métadonnées de partage et leurs données structurées de collection. L’identité Organization / WebSite utilise des identifiants stables.
- Les discussions du Forum exposent le texte complet, les auteurs publics, les dates réelles et les réponses imbriquées. Les catégories décrivent les sujets effectivement affichés. Les données structurées n’ajoutent ni identifiants de comptes ni votes individuels. Le JSON est échappé avant insertion dans le HTML.
- Les pages de résultats de recherche restent `noindex, follow`. Les discussions non traduites conservent leur canonique française. Les robots publics restent autorisés à consulter les pages publiques.
- Les fiches de spots et balises conservent leur présentation et leurs fonctionnalités.

## Mesures de performances

`WebVitals` utilise `next/web-vitals` pour LCP, INP et CLS, et transmet un événement `web_vital` au Google tag déjà installé. Aucun nouveau service ni abonnement. La réception et l’exploitation de cet événement dépendent de la configuration du tag existant.

Seuls les domaines de production `www.openwind.ch` et `openwind.ch` émettent ces événements. Les environnements locaux et les aperçus ne le font pas. Le contexte envoyé contient uniquement la famille de la page et sa langue ; aucune URL, recherche, coordonnée, identité ou identifiant de spot. Les pages personnelles et administratives sont exclues. Le contexte correspond au document chargé, pas à chaque navigation interne. Une valeur mise à jour peut être émise avec le même identifiant de mesure : dédupliquer par identifiant et nom en conservant la dernière valeur pour une analyse externe.

Il faut des visites réelles après publication pour établir les performances de terrain. Les temps de réponse de l’audit local ne sont pas des Core Web Vitals.

## Vérifications reproductibles

```sh
npm test
npx tsc --noEmit
npm run build
python3 scripts/audit-public-seo.py --base-url http://127.0.0.1:3001 --output /tmp/openwind-seo-audit.json
```

Le script effectue uniquement des lectures HTTP et contrôle un échantillon de 14 pages : H1, indexation, canonique, langues, identité du site, données structurées et champs essentiels des discussions. Il ne remplace pas le validateur Google ni un audit exhaustif de toutes les URL.

Les URL inexistantes sont exclues de l’indexation. Next.js peut déjà avoir commencé à diffuser le HTML d’une route dynamique du Forum quand il découvre l’absence du sujet : la réponse est alors HTTP 200 avec une page introuvable et `noindex`, selon son fonctionnement documenté. Les routes non reconnues renvoient 404. Ces deux cas ont été contrôlés localement.

Après publication : soumettre ou relire le sitemap dans Search Console, inspecter les nouvelles pages, consulter les rapports d’indexation et de résultats enrichis, puis suivre les Core Web Vitals réels. Aucune garantie de résultat enrichi ou de citation IA : l’accès aux sources, le contenu lisible et la cohérence des informations sont les fondations vérifiables.
