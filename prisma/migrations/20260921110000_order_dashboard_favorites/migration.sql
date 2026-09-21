-- Give the three dashboard favorites one shared order across spots and
-- stations, so both kinds can be displayed in a single list.
ALTER TABLE "Favorite"
ADD COLUMN "dashboardOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "StationFavorite"
ADD COLUMN "dashboardOrder" INTEGER NOT NULL DEFAULT 0;

WITH combined AS (
  SELECT "id", "userId", "sortOrder", "createdAt", 'spot' AS kind
  FROM "Favorite"
  WHERE "dashboardSelected" = true
  UNION ALL
  SELECT "id", "userId", "sortOrder", "createdAt", 'station' AS kind
  FROM "StationFavorite"
  WHERE "dashboardSelected" = true
), ranked AS (
  SELECT
    "id",
    kind,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY CASE WHEN kind = 'spot' THEN 0 ELSE 1 END,
               "sortOrder" ASC,
               "createdAt" DESC,
               "id" ASC
    )::INTEGER - 1 AS position
  FROM combined
)
UPDATE "Favorite" AS favorite
SET "dashboardOrder" = ranked.position
FROM ranked
WHERE ranked.kind = 'spot'
  AND favorite."id" = ranked."id";

WITH combined AS (
  SELECT "id", "userId", "sortOrder", "createdAt", 'spot' AS kind
  FROM "Favorite"
  WHERE "dashboardSelected" = true
  UNION ALL
  SELECT "id", "userId", "sortOrder", "createdAt", 'station' AS kind
  FROM "StationFavorite"
  WHERE "dashboardSelected" = true
), ranked AS (
  SELECT
    "id",
    kind,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY CASE WHEN kind = 'spot' THEN 0 ELSE 1 END,
               "sortOrder" ASC,
               "createdAt" DESC,
               "id" ASC
    )::INTEGER - 1 AS position
  FROM combined
)
UPDATE "StationFavorite" AS favorite
SET "dashboardOrder" = ranked.position
FROM ranked
WHERE ranked.kind = 'station'
  AND favorite."id" = ranked."id";

DROP INDEX "Favorite_userId_dashboardSelected_sortOrder_idx";
DROP INDEX "StationFavorite_userId_dashboardSelected_sortOrder_idx";

CREATE INDEX "Favorite_userId_dashboardSelected_dashboardOrder_idx"
ON "Favorite"("userId", "dashboardSelected", "dashboardOrder");

CREATE INDEX "StationFavorite_userId_dashboardSelected_dashboardOrder_idx"
ON "StationFavorite"("userId", "dashboardSelected", "dashboardOrder");
