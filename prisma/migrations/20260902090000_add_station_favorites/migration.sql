-- Persist favorites for externally sourced wind stations. The station metadata
-- is snapshotted because providers and the shared station cache can be transient.
CREATE TABLE "StationFavorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stationId" TEXT NOT NULL,
  "stationName" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "altitudeM" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StationFavorite_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StationFavorite_userId_idx"
ON "StationFavorite"("userId");

CREATE UNIQUE INDEX "StationFavorite_userId_stationId_key"
ON "StationFavorite"("userId", "stationId");

ALTER TABLE "StationFavorite"
ADD CONSTRAINT "StationFavorite_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StationFavorite" ENABLE ROW LEVEL SECURITY;
