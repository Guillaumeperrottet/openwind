-- Preserve the provenance and reuse terms of real spot photography.
ALTER TABLE "SpotImage"
ADD COLUMN "credit" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "license" TEXT,
ADD COLUMN "licenseUrl" TEXT;
