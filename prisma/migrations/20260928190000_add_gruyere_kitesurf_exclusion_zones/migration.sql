-- Document the two official exclusion zones on the Lac de la Gruyère and
-- expose the current consolidated regulation with its cartographic annex.
UPDATE "Article"
SET
  "content" = replace(
    "content",
    $before$Le canton de Fribourg autorise le kitesurf sur de larges parties du lac. Certaines surfaces restent exclues pour protéger l’avifaune, notamment vers les réserves naturelles. Les communes peuvent aussi encadrer les zones de mise à l’eau et d’atterrissage.

[Voir le guide local du lac de la Gruyère](https://www.openwind.ch/fr/vent-en-direct/lac-de-la-gruyere)$before$,
    $after$Le canton de Fribourg autorise le kitesurf sur une grande partie du lac, mais **deux secteurs restent interdits** : une zone au nord, entre Pont-la-Ville et Rossens, et une zone au sud, dans le secteur de Broc et Botterens. Les contours rouges de la carte sont repris des géodonnées officielles de l’État de Fribourg. Les communes peuvent aussi encadrer les zones de mise à l’eau et d’atterrissage.

[Consulter l’arrêté 785.21 et son annexe cartographique officielle (PDF)](https://bdlf.fr.ch/api/fr/versions/8441/pdf_file_with_annexes)

[Voir le guide local du lac de la Gruyère](https://www.openwind.ch/fr/vent-en-direct/lac-de-la-gruyere)$after$
  ),
  "sources" = "sources"
    || CASE
      WHEN "sources" @> '[{"url":"https://bdlf.fr.ch/api/fr/versions/8441/pdf_file_with_annexes"}]'::jsonb
        THEN '[]'::jsonb
      ELSE '[{"label":"Arrêté 785.21 et zones interdites au kitesurf — État de Fribourg (PDF)","url":"https://bdlf.fr.ch/api/fr/versions/8441/pdf_file_with_annexes"}]'::jsonb
    END
    || CASE
      WHEN "sources" @> '[{"url":"https://map.geo.fr.ch/arcgis/rest/services/PortailCarto/Theme_nature_paysage/MapServer/36"}]'::jsonb
        THEN '[]'::jsonb
      ELSE '[{"label":"Zones interdites au kitesurfing — géodonnées de l’État de Fribourg","url":"https://map.geo.fr.ch/arcgis/rest/services/PortailCarto/Theme_nature_paysage/MapServer/36"}]'::jsonb
    END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'kitesurf-lacs-suisses-autorise-interdit';
