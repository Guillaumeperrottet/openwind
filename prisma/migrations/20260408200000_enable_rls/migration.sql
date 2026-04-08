-- Enable Row-Level Security on ALL public tables.
-- Prisma connects as the `postgres` role which bypasses RLS,
-- so this won't affect the application.
-- This blocks unauthorized access via Supabase's PostgREST API (anon key).

ALTER TABLE "Spot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SpotImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WindReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StationMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumTopic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumVote" ENABLE ROW LEVEL SECURITY;

-- By default, RLS with no policies = deny all for non-superuser roles.
-- The `postgres` role (used by Prisma) bypasses RLS entirely.
-- The `anon` and `authenticated` Supabase roles will be blocked,
-- which is exactly what we want since all data access goes through
-- our Next.js API routes (server-side Prisma).
