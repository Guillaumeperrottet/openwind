-- Complete the guide with small Vaud lakes covered by the cantonal ban.
UPDATE "Article"
SET
  "content" = replace(
    "content",
    $before$### Lac de la Gruyère — 🟠 autorisé avec restrictions$before$,
    $after$### Lac Brenet, lac de Bret et lac de l’Hongrin — 🔴 interdits

Ces trois plans d’eau vaudois font partie des autres lacs et plans d’eau sur lesquels le kitesurf est interdit. Le lac Brenet, le lac de Bret et le lac de l’Hongrin sont donc fermés à la pratique, indépendamment de l’existence d’une zone de mise à l’eau. La même règle peut concerner d’autres petits plans d’eau vaudois qui ne sont pas encore représentés sur la carte.

### Lac de la Gruyère — 🟠 autorisé avec restrictions$after$
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit'
  AND "content" NOT LIKE '%### Lac Brenet, lac de Bret et lac de l’Hongrin — 🔴 interdits%';

-- Add the five Fribourg lakes explicitly listed as forbidden by the canton.
UPDATE "Article"
SET
  "content" = replace(
    "content",
    $before$### Lacs de Bienne, de Thoune et de Brienz — 🟠 autorisés avec zones interdites$before$,
    $after$### Lac Noir, Montsalvens, Lessoc, Lussy et Seedorf — 🔴 interdits

La documentation cantonale classe explicitement ces cinq lacs parmi les plans d’eau interdits au kitesurf, notamment en raison de leur taille et de leur défaut de navigabilité. Cette interdiction concerne le Lac Noir (Schwarzsee), le lac de Montsalvens, le lac de Lessoc (lac de Montbovon), le lac de Lussy et le lac de Seedorf.

### Lacs de Bienne, de Thoune et de Brienz — 🟠 autorisés avec zones interdites$after$
  ),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit'
  AND "content" NOT LIKE '%### Lac Noir, Montsalvens, Lessoc, Lussy et Seedorf — 🔴 interdits%';
