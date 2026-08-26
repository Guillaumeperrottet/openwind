ALTER TABLE "Article"
ADD COLUMN "linkedSpotIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "linkedStationIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "relatedArticleIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Article"
SET
  "linkedSpotIds" = ARRAY['cmnq613tx00it04kw1d0vraq4'],
  "linkedStationIds" = ARRAY['windball-wf-35', 'MAS'],
  "relatedArticleIds" = ARRAY['article-vents-regionaux-2026']
WHERE "id" = 'article-guide-gruyere-2026';

UPDATE "Article"
SET
  "linkedSpotIds" = ARRAY['cmnq613tx00it04kw1d0vraq4'],
  "linkedStationIds" = ARRAY['windball-wf-35', 'MAS'],
  "relatedArticleIds" = ARRAY['article-guide-gruyere-2026']
WHERE "id" = 'article-vents-regionaux-2026';
