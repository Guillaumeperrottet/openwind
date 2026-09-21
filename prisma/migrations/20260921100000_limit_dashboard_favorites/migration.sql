-- Keep the complete favorite collection while selecting only three entries for
-- the personal dashboard. Existing accounts start with their three most recent
-- favorites across spots and stations.
ALTER TABLE "Favorite"
ADD COLUMN "dashboardSelected" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "StationFavorite"
ADD COLUMN "dashboardSelected" BOOLEAN NOT NULL DEFAULT false;

WITH combined AS (
  SELECT "id", "userId", "createdAt", 'spot' AS kind
  FROM "Favorite"
  UNION ALL
  SELECT "id", "userId", "createdAt", 'station' AS kind
  FROM "StationFavorite"
), ranked AS (
  SELECT
    "id",
    kind,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, "id" ASC
    ) AS position
  FROM combined
)
UPDATE "Favorite" AS favorite
SET "dashboardSelected" = true
FROM ranked
WHERE ranked.kind = 'spot'
  AND ranked.position <= 3
  AND favorite."id" = ranked."id";

WITH combined AS (
  SELECT "id", "userId", "createdAt", 'spot' AS kind
  FROM "Favorite"
  UNION ALL
  SELECT "id", "userId", "createdAt", 'station' AS kind
  FROM "StationFavorite"
), ranked AS (
  SELECT
    "id",
    kind,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, "id" ASC
    ) AS position
  FROM combined
)
UPDATE "StationFavorite" AS favorite
SET "dashboardSelected" = true
FROM ranked
WHERE ranked.kind = 'station'
  AND ranked.position <= 3
  AND favorite."id" = ranked."id";

CREATE INDEX "Favorite_userId_dashboardSelected_sortOrder_idx"
ON "Favorite"("userId", "dashboardSelected", "sortOrder");

CREATE INDEX "StationFavorite_userId_dashboardSelected_sortOrder_idx"
ON "StationFavorite"("userId", "dashboardSelected", "sortOrder");
