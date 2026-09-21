-- Keep each user's existing newest-first favorite order while making it
-- explicitly editable from Mon Openwind.
ALTER TABLE "Favorite"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "StationFavorite"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, "id" ASC
    )::INTEGER - 1 AS position
  FROM "Favorite"
)
UPDATE "Favorite" AS favorite
SET "sortOrder" = ranked.position
FROM ranked
WHERE favorite."id" = ranked."id";

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "createdAt" DESC, "id" ASC
    )::INTEGER - 1 AS position
  FROM "StationFavorite"
)
UPDATE "StationFavorite" AS favorite
SET "sortOrder" = ranked.position
FROM ranked
WHERE favorite."id" = ranked."id";

CREATE INDEX "Favorite_userId_sortOrder_idx"
ON "Favorite"("userId", "sortOrder");

CREATE INDEX "StationFavorite_userId_sortOrder_idx"
ON "StationFavorite"("userId", "sortOrder");
