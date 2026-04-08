import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/forum/votes
 * Body: { topicId?: string, postId?: string, value: 1 | -1 }
 * Toggle: same value again removes the vote.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { topicId, postId, value } = body ?? {};

  if (value !== 1 && value !== -1) {
    return NextResponse.json(
      { error: "value doit être 1 ou -1" },
      { status: 400 },
    );
  }

  if (!topicId && !postId) {
    return NextResponse.json(
      { error: "topicId ou postId requis" },
      { status: 400 },
    );
  }

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

  if (topicId) {
    const existing = await prisma.forumVote.findUnique({
      where: { userId_topicId: { userId: user.id, topicId } },
    });

    if (existing) {
      if (existing.value === value) {
        // Toggle off
        await prisma.forumVote.delete({ where: { id: existing.id } });
        return NextResponse.json({ voted: null });
      }
      // Switch vote
      await prisma.forumVote.update({
        where: { id: existing.id },
        data: { value },
      });
      return NextResponse.json({ voted: value });
    }

    await prisma.forumVote.create({
      data: { value, userId: user.id, topicId },
    });
    return NextResponse.json({ voted: value });
  }

  if (postId) {
    const existing = await prisma.forumVote.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.forumVote.delete({ where: { id: existing.id } });
        return NextResponse.json({ voted: null });
      }
      await prisma.forumVote.update({
        where: { id: existing.id },
        data: { value },
      });
      return NextResponse.json({ voted: value });
    }

    await prisma.forumVote.create({
      data: { value, userId: user.id, postId },
    });
    return NextResponse.json({ voted: value });
  }

  return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
}
