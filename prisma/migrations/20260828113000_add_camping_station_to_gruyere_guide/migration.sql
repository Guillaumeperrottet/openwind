UPDATE "Article"
SET
  "linkedStationIds" = array_append("linkedStationIds", 'piou-2153'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE
  "id" = 'article-guide-gruyere-2026'
  AND NOT ('piou-2153' = ANY("linkedStationIds"));
