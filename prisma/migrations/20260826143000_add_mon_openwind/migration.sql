-- Mon Openwind preferences. Existing users keep the map and are not shown
-- the post-signup choice retroactively; newly created preference rows are.
ALTER TABLE "UserPreference"
ADD COLUMN "defaultView" TEXT NOT NULL DEFAULT 'MAP',
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dashboardLayout" TEXT[] NOT NULL DEFAULT ARRAY['FAVORITES', 'FORECAST', 'ARTICLES', 'COMMUNITY', 'QUICK_ACTIONS']::TEXT[];

UPDATE "UserPreference"
SET "onboardingCompleted" = true;

-- Optional spot connection for local community discussions.
ALTER TABLE "ForumTopic" ADD COLUMN "spotId" TEXT;

CREATE INDEX "ForumTopic_spotId_createdAt_idx"
ON "ForumTopic"("spotId", "createdAt");

ALTER TABLE "ForumTopic"
ADD CONSTRAINT "ForumTopic_spotId_fkey"
FOREIGN KEY ("spotId") REFERENCES "Spot"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
