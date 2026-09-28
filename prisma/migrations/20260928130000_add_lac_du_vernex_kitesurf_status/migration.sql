-- Add the Lac du Vernex status using the current Vaud rule restated by the
-- Federal Supreme Court in judgment 7B_1299/2024 of 7 April 2026.
UPDATE "Article"
SET
  "content" = replace(
    "content",
    $before$Les autres petits plans d’eau de la vallée ne doivent pas être assimilés automatiquement au lac de Joux.

### Lac de la Gruyère — 🟠 autorisé avec restrictions$before$,
    $after$Les autres petits plans d’eau de la vallée ne doivent pas être assimilés automatiquement au lac de Joux.

### Lac du Vernex (Rossinière) — 🔴 interdit

Le lac du Vernex est un lac artificiel situé à Rossinière, dans le canton de Vaud. La réglementation vaudoise autorise le kitesurf sur le Léman, le lac de Neuchâtel et, avec des limites précises, le lac de Joux. Elle interdit la pratique sur **tous les autres lacs et plans d’eau vaudois** : le lac du Vernex est donc fermé au kitesurf.

Cette interdiction ne dépend pas de la présence de bouées sur place. Un arrêt du Tribunal fédéral du 7 avril 2026 a confirmé que le canton de Vaud peut maintenir ce régime et que la signalisation locale n’est pas une condition nécessaire à sa validité.

### Lac de la Gruyère — 🟠 autorisé avec restrictions$after$
  ),
  "sources" = CASE
    WHEN "sources" @> '[{"url":"https://relevancy.bger.ch/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F07-04-2026-7B_1299-2024&lang=fr&type=show_document"}]'::jsonb
      THEN "sources"
    ELSE "sources" || '[{"label":"Interdictions vaudoises de kitesurf — Tribunal fédéral, arrêt 7B_1299/2024 du 7 avril 2026","url":"https://relevancy.bger.ch/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F07-04-2026-7B_1299-2024&lang=fr&type=show_document"}]'::jsonb
  END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit';
