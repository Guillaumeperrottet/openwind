-- Editable reading summaries and the current trip-planner walkthrough.
-- Apply only to the reviewed content snapshot; preserve newer admin edits and publication status.

UPDATE "Article"
SET "content" = '## À retenir

- Choisis ton activité, tes dates et un périmètre pour comparer les lieux.
- Lis les critères du créneau, puis vérifie le spot et ses balises.
- Garde ta recherche dans Mon Openwind pour la relancer sur cet appareil.

[Ouvrir le planificateur](/fr/plan)

Openwind aide à comparer les lieux et les dates avant une sortie. Commence par les créneaux expliqués, puis vérifie les prévisions détaillées et les balises. Un résultat reste une piste à examiner sur le terrain.

## 1. Choisir son activité et son périmètre

Sélectionne **Kitesurf** ou **Parapente**. Le choix est partagé avec tes préférences Openwind. Les spots de snowkite gardent leurs fiches et restent sur la carte, mais ne font pas partie des résultats du planificateur nautique.

La ville est facultative. Recherche une ville ou un code postal et sélectionne une suggestion, ou utilise **Ma position** si tu souhaites autoriser la localisation. Sans ville, la recherche porte sur le catalogue de l’activité choisie.

Avec une ville, ajuste le **rayon à vol d’oiseau** : 50 km pour rester près de chez toi, 100 ou 150 km pour comparer plusieurs lieux. Ce rayon ne représente pas un temps de trajet.

## 2. Choisir ses dates

Les raccourcis **Aujourd’hui**, **Demain**, **Ce week-end** et **7 jours** remplissent les dates. Tu peux aussi définir une période de quatorze jours maximum, jusqu’à trois mois à l’avance.

La nature du résultat dépend de l’échéance :

- si toute la période reste dans les seize premiers jours, Openwind utilise des prévisions météo et peut chercher des créneaux ;
- au-delà de cette échéance, il affiche des statistiques saisonnières issues des archives, sans inventer de créneau futur.

Les statistiques décrivent des saisons passées. Elles ne prédisent pas le vent d’une journée précise.

## 3. Comprendre les créneaux expliqués

Lance la recherche avec **Trouver ma prochaine sortie**. Openwind peut mettre en avant jusqu’à trois pistes dans des secteurs distincts, plutôt que plusieurs spots voisins présentant la même situation.

Un créneau est une plage continue d’au moins une heure, pendant la journée. Pour le retenir, le planificateur vérifie notamment :

- le vent moyen et les rafales par rapport aux seuils retenus pour l’activité et le spot ;
- l’orientation par rapport aux secteurs documentés ;
- les restrictions et horaires d’accès présents dans la fiche de référence ;
- les données de pluie pour le parapente.

Les informations manquantes ne sont pas interprétées comme des conditions favorables. Une fiche insuffisamment documentée peut présenter des prévisions, sans recevoir de créneau recommandé.

Ouvre **Pourquoi ce créneau ?** pour lire les critères et les sources. Les horaires suivent le fuseau du spot. Le détail peut également afficher un indice sur 100 : il aide au classement, sans garantir la sécurité ni remplacer les explications du créneau.

## 4. Comparer les résultats et vérifier le spot

Les vues **Liste** et **Carte** permettent de retrouver les mêmes lieux. Le champ de recherche dans les résultats aide à repérer un spot précis. Les unités **kts** et **km/h** suivent ta préférence sur le site.

Chaque résultat distingue les créneaux retenus, les prévisions météo et l’état de documentation de la fiche. Les maxima de vent et de rafales ne sont pas nécessairement atteints à la même heure : ils ne constituent pas, à eux seuls, un créneau.

Depuis le résultat, ouvre la fiche du spot. Tu y retrouves les conditions actuelles et leur source, l’historique, les prévisions détaillées, les balises proches et les informations de terrain. L’étoile permet de garder ce lieu dans **Mon Openwind**, même sans compte. Un compte gratuit permet ensuite de synchroniser les favoris entre appareils.

## 5. Quand aucun créneau n’est retenu

**Aucun créneau retenu** ne signifie pas forcément qu’il n’y aura pas de vent. Les seuils peuvent ne pas être réunis, une restriction peut s’appliquer ou les données peuvent être insuffisantes.

Les alternatives proposées conservent l’activité et les critères de la recherche. Selon les dates et le périmètre, tu peux :

- décaler la recherche d’un jour ;
- comparer le week-end ;
- élargir le rayon ;
- modifier directement les critères.

Les prévisions des autres spots restent consultables lorsqu’elles sont disponibles. N’assouplis pas tes exigences de sécurité simplement pour obtenir un résultat.

## 6. Garder ou partager une recherche

Avec **Garder cette recherche**, donne un nom à ta recherche et choisis entre des dates précises ou **Ce week-end, recalculé à chaque ouverture**. Tu la retrouves dans [Mon Openwind](/fr/mon-openwind#saved-searches).

Les recherches sont enregistrées sur cet appareil, y compris sans compte. Elles se relancent manuellement : elles ne surveillent pas la météo et n’envoient pas de notification. Des dates passées sont signalées avant une éventuelle relance avec de nouvelles dates.

Le bouton **Copier le lien** conserve la ville, les dates, le rayon et l’activité. Tes amis peuvent ouvrir cette recherche et consulter les prévisions disponibles au moment de leur visite.

## Préparer le prochain week-end

Pour une sortie depuis Fribourg :

1. choisis **Kitesurf** ou **Parapente** et sélectionne **Fribourg** ;
2. choisis **Ce week-end** et un rayon de **150 km** ;
3. compare les créneaux et ouvre leurs explications ;
4. vérifie les fiches des lieux et leurs balises ;
5. garde la recherche si tu souhaites la retrouver lors d’une prochaine visite.

Avant de partir, consulte aussi les avis météo officiels, les règles locales et les mesures récentes. Le relief, les rafales et les conditions réelles peuvent différer du modèle.

[Préparer ma prochaine sortie](/fr/plan)',
    "updatedAt" = CURRENT_TIMESTAMP,
    "title" = 'Planifier une sortie avec Openwind',
    "seoTitle" = 'Planifier une sortie kite ou parapente',
    "excerpt" = 'Choisis tes dates, compare les créneaux expliqués et garde tes recherches dans Mon Openwind pour préparer ta prochaine sortie.',
    "seoDescription" = 'Apprends à comparer les créneaux de kitesurf ou de parapente, vérifier les critères et les sources, puis enregistrer ou partager ta recherche Openwind.',
    "readTime" = 5
WHERE "slug" = 'planifier-sortie-kite-parapente-openwind'
  AND "kind" = 'EDITORIAL'
  AND "title" = 'Planifier une sortie avec Openwind : trouver le bon spot au bon moment'
  AND "excerpt" = 'Destination, dates, rayon, sport et score météo : voici comment utiliser le planificateur Openwind pour comparer les spots et préparer une sortie sans multiplier les onglets.'
  AND md5("content") = 'bd742fb336b45eac0e65b779c11de935';

UPDATE "Article"
SET "content" = '## À retenir

- Bise, foehn et joran ont des mécanismes et des effets locaux différents.
- Compare le vent, les rafales, la direction et leur évolution.
- Le nom d’un vent ne remplace ni les avis météo ni l’observation sur place.

' || ltrim("content", E'\n\r '),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'bise-foehn-joran-vents-suisse-romande'
  AND "kind" = 'EDITORIAL'
  AND "excerpt" = 'Trois noms familiers, trois mécanismes très différents. Voici comment les reconnaître, lire les balises sans surinterpréter et repérer les situations qui exigent le plus de prudence.'
  AND md5("content") = '2f3e7f230bd19f9e67da36838c2372d8';

UPDATE "Article"
SET "content" = '## À retenir

- Une balise mesure localement ; les modèles estiment et prévoient le vent.
- Compare toujours la source et l’heure des données.
- Le code est ouvert ; chaque fournisseur garde ses conditions d’utilisation.

' || ltrim("content", E'\n\r '),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'open-source-vent-en-direct-balises-openwind'
  AND "kind" = 'EDITORIAL'
  AND "excerpt" = 'D’où viennent les mesures, que montrent vraiment les particules sur la carte et comment Openwind rassemble balises, modèles météo et logiciel libre sans mélanger observations et prévisions.'
  AND md5("content") = 'c23e9a8ab0dacfd1d9e01fd9d126ca9f';

UPDATE "Article"
SET "content" = '## À retenir

- Vérifie les règles du lac et du secteur où tu souhaites pratiquer.
- Consulte les sources officielles datées et les panneaux sur place.
- L’autorisation ne garantit ni l’accès à la rive ni des conditions adaptées.

' || ltrim("content", E'\n\r '),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit'
  AND "kind" = 'EDITORIAL'
  AND "excerpt" = 'Un guide vérifié pour distinguer les lacs autorisés, les secteurs réglementés et les interdictions de kitesurf en Suisse.'
  AND md5("content") = '727239e58e5ba3e20fe16b580f6b1362';
