-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "WaterType" AS ENUM ('FLAT', 'CHOP', 'WAVES', 'MIXED');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('KITE', 'PARAGLIDE');

-- CreateTable
CREATE TABLE "Spot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'INTERMEDIATE',
    "waterType" "WaterType" NOT NULL DEFAULT 'CHOP',
    "minWindKmh" INTEGER NOT NULL DEFAULT 15,
    "maxWindKmh" INTEGER NOT NULL DEFAULT 35,
    "bestMonths" TEXT[],
    "bestWindDirections" TEXT[],
    "hazards" TEXT,
    "access" TEXT,
    "sportType" "SportType" NOT NULL DEFAULT 'KITE',
    "nearestStationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotImage" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WindReport" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windSpeedKmh" DOUBLE PRECISION NOT NULL,
    "windDirection" INTEGER NOT NULL,
    "gustsKmh" DOUBLE PRECISION,
    "isKitable" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WindReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationMeasurement" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "windSpeedKmh" DOUBLE PRECISION NOT NULL,
    "windDirection" DOUBLE PRECISION NOT NULL,
    "gustsKmh" DOUBLE PRECISION,
    "temperatureC" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'meteoswiss',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StationMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_spotId_key" ON "Favorite"("userId", "spotId");

-- CreateIndex
CREATE INDEX "StationMeasurement_stationId_time_idx" ON "StationMeasurement"("stationId", "time");

-- CreateIndex
CREATE UNIQUE INDEX "StationMeasurement_stationId_time_key" ON "StationMeasurement"("stationId", "time");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotImage" ADD CONSTRAINT "SpotImage_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WindReport" ADD CONSTRAINT "WindReport_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
