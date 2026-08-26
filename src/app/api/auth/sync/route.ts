import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { shouldOnboardAccount } from "@/lib/user-preferences";

/**
 * POST /api/auth/sync
 * Called after login to ensure the Supabase user exists in our Prisma User table.
 * Non-blocking — if it fails, the user can still browse; they just can't favorite.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

  const preferences = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      // Only genuinely new accounts see the one-time choice. Existing
      // accounts with no preference row retain the historical map default.
      onboardingCompleted: !shouldOnboardAccount(user.created_at),
    },
  });

  return NextResponse.json({
    user: dbUser,
    needsOnboarding: !preferences.onboardingCompleted,
    preferences,
  });
}
