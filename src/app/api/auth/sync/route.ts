import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ user: dbUser });
}
