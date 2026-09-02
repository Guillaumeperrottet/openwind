import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStationFromCache } from "@/lib/stationData";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

const toggleFavoriteSchema = z.union([
  z.object({ spotId: z.string().trim().min(1) }).strict(),
  z.object({ stationId: z.string().trim().min(1) }).strict(),
]);

async function ensureDatabaseUser(user: User) {
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
}

/**
 * GET /api/favorites — list current user's favorites
 * Returns spotIds[] and stationIds[] for quick lookup.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ spotIds: [], stationIds: [] });
  }

  const [favorites, stationFavorites] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id },
      select: { spotId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stationFavorite.findMany({
      where: { userId: user.id },
      select: { stationId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    spotIds: favorites.map((f: { spotId: string }) => f.spotId),
    stationIds: stationFavorites.map(
      (favorite: { stationId: string }) => favorite.stationId,
    ),
  });
}

/**
 * POST /api/favorites — toggle a favorite
 * Body: { spotId: string } or { stationId: string }
 * If already favorited → remove. If not → add.
 * Returns { favorited: boolean }.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = toggleFavoriteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Identifiant requis" },
      { status: 400 },
    );
  }

  if ("spotId" in parsed.data) {
    const { spotId } = parsed.data;
    const existing = await prisma.favorite.findUnique({
      where: { userId_spotId: { userId: user.id, spotId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false, kind: "spot" });
    }

    await ensureDatabaseUser(user);
    await prisma.favorite.create({
      data: { userId: user.id, spotId },
    });

    return NextResponse.json({ favorited: true, kind: "spot" });
  }

  const { stationId } = parsed.data;
  const existing = await prisma.stationFavorite.findUnique({
    where: { userId_stationId: { userId: user.id, stationId } },
  });

  if (existing) {
    await prisma.stationFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false, kind: "station" });
  }

  const station = await getStationFromCache(stationId);
  if (!station) {
    return NextResponse.json(
      { error: "Balise introuvable" },
      { status: 404 },
    );
  }

  await ensureDatabaseUser(user);

  await prisma.stationFavorite.create({
    data: {
      userId: user.id,
      stationId: station.id,
      stationName: station.name,
      source: station.source,
      latitude: station.lat,
      longitude: station.lng,
      altitudeM: station.altitudeM,
    },
  });

  return NextResponse.json({ favorited: true, kind: "station" });
}
