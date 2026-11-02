import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStationFromCache } from "@/lib/stationData";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { MAX_LOCAL_FAVORITES } from "@/lib/favorites";

const importFavoritesSchema = z.object({
  spotIds: z.array(z.string().trim().min(1).max(200)).max(MAX_LOCAL_FAVORITES).default([]),
  stationIds: z.array(z.string().trim().min(1).max(200)).max(MAX_LOCAL_FAVORITES).default([]),
}).strict().refine((v) => v.spotIds.length + v.stationIds.length <= MAX_LOCAL_FAVORITES);

const toggleFavoriteSchema = z.union([
  z.object({ spotId: z.string().trim().min(1) }).strict(),
  z.object({ stationId: z.string().trim().min(1) }).strict(),
]);

const dashboardFavoriteSchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("spot"), id: z.string().trim().min(1) })
    .strict(),
  z
    .object({ kind: z.literal("station"), id: z.string().trim().min(1) })
    .strict(),
]);

const favoriteAlertSchema = z
  .object({
    kind: z.enum(["spot", "station"]),
    id: z.string().trim().min(1),
    enabled: z.boolean(),
    minWindKmh: z.number().min(0).max(200),
    maxWindKmh: z.number().min(0).max(200),
  })
  .strict()
  .refine((value) => value.minWindKmh <= value.maxWindKmh, {
    message: "La vitesse minimale doit précéder la vitesse maximale",
  });

const reorderFavoritesSchema = z
  .object({
    spotIds: z.array(z.string().trim().min(1)).max(50).optional(),
    stationIds: z.array(z.string().trim().min(1)).max(50).optional(),
    dashboardFavorites: z.array(dashboardFavoriteSchema).max(3).optional(),
    favoriteAlerts: z.array(favoriteAlertSchema).max(3).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.spotIds !== undefined ||
      value.stationIds !== undefined ||
      value.dashboardFavorites !== undefined ||
      value.favoriteAlerts !== undefined,
    {
      message: "Une modification de favoris est requise",
    },
  )
  .refine(
    (value) =>
      !value.dashboardFavorites ||
      new Set(
        value.dashboardFavorites.map((favorite) =>
          `${favorite.kind}:${favorite.id}`,
        ),
      ).size === value.dashboardFavorites.length,
    {
      message: "Un favori de tableau de bord ne peut apparaître qu’une fois",
    },
  )
  .refine((value) => value.dashboardFavorites?.length !== 0, {
    message: "Sélectionne au moins un favori pour le tableau de bord",
  })
  .refine(
    (value) =>
      !value.favoriteAlerts ||
      new Set(
        value.favoriteAlerts.map((favorite) =>
          `${favorite.kind}:${favorite.id}`,
        ),
      ).size === value.favoriteAlerts.length,
    { message: "Une alerte ne peut apparaître qu’une fois" },
  )
  .refine(
    (value) =>
      (!value.spotIds || new Set(value.spotIds).size === value.spotIds.length) &&
      (!value.stationIds ||
        new Set(value.stationIds).size === value.stationIds.length),
    { message: "Un favori ne peut apparaître qu’une fois" },
  );

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
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.stationFavorite.findMany({
      where: { userId: user.id },
      select: { stationId: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
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
    const [selectedSpotCount, selectedStationCount] = await Promise.all([
      prisma.favorite.count({
        where: { userId: user.id, dashboardSelected: true },
      }),
      prisma.stationFavorite.count({
        where: { userId: user.id, dashboardSelected: true },
      }),
    ]);
    const dashboardSelected = selectedSpotCount + selectedStationCount < 3;
    const dashboardOrder = selectedSpotCount + selectedStationCount;
    await prisma.$transaction([
      prisma.favorite.updateMany({
        where: { userId: user.id },
        data: { sortOrder: { increment: 1 } },
      }),
      prisma.favorite.create({
        data: {
          userId: user.id,
          spotId,
          sortOrder: 0,
          dashboardSelected,
          dashboardOrder: dashboardSelected ? dashboardOrder : 0,
        },
      }),
    ]);

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
  const [selectedSpotCount, selectedStationCount] = await Promise.all([
    prisma.favorite.count({
      where: { userId: user.id, dashboardSelected: true },
    }),
    prisma.stationFavorite.count({
      where: { userId: user.id, dashboardSelected: true },
    }),
  ]);
  const dashboardSelected = selectedSpotCount + selectedStationCount < 3;
  const dashboardOrder = selectedSpotCount + selectedStationCount;

  await prisma.$transaction([
    prisma.stationFavorite.updateMany({
      where: { userId: user.id },
      data: { sortOrder: { increment: 1 } },
    }),
    prisma.stationFavorite.create({
      data: {
        userId: user.id,
        stationId: station.id,
        stationName: station.name,
        source: station.source,
        latitude: station.lat,
        longitude: station.lng,
        altitudeM: station.altitudeM,
        sortOrder: 0,
        dashboardSelected,
        dashboardOrder: dashboardSelected ? dashboardOrder : 0,
      },
    }),
  ]);

  return NextResponse.json({ favorited: true, kind: "station" });
}

/** Idempotent import: existing favorites, order and alert settings stay intact. */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const parsed = importFavoritesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Favoris invalides" }, { status: 400 });
  const spotIds = [...new Set(parsed.data.spotIds)];
  const stationIds = [...new Set(parsed.data.stationIds)];
  const [spots, stationResults] = await Promise.all([
    prisma.spot.findMany({ where: { id: { in: spotIds } }, select: { id: true } }),
    Promise.all(stationIds.map((id) => getStationFromCache(id))),
  ]);
  const stations = stationResults.filter((station) => station !== null);
  await ensureDatabaseUser(user);
  const imported = await prisma.$transaction(async (tx) => {
    const [existingSpots, existingStations] = await Promise.all([
      tx.favorite.findMany({ where: { userId: user.id } }),
      tx.stationFavorite.findMany({ where: { userId: user.id } }),
    ]);
    let selected = [...existingSpots, ...existingStations].filter((f) => f.dashboardSelected).length;
    let spotOrder = Math.max(-1, ...existingSpots.map((f) => f.sortOrder)) + 1;
    let stationOrder = Math.max(-1, ...existingStations.map((f) => f.sortOrder)) + 1;
    for (const spotId of spotIds.filter((id) => spots.some((spot) => spot.id === id))) {
      const spot = { id: spotId };
      if (existingSpots.some((f) => f.spotId === spot.id)) continue;
      const dashboardSelected = selected < 3;
      await tx.favorite.upsert({
        where: { userId_spotId: { userId: user.id, spotId: spot.id } }, update: {},
        create: { userId: user.id, spotId: spot.id, sortOrder: spotOrder++, dashboardSelected, dashboardOrder: dashboardSelected ? selected++ : 0 },
      });
    }
    for (const station of stations) {
      if (existingStations.some((f) => f.stationId === station.id)) continue;
      const dashboardSelected = selected < 3;
      await tx.stationFavorite.upsert({
        where: { userId_stationId: { userId: user.id, stationId: station.id } }, update: {},
        create: {
          userId: user.id, stationId: station.id, stationName: station.name, source: station.source,
          latitude: station.lat, longitude: station.lng, altitudeM: station.altitudeM,
          sortOrder: stationOrder++, dashboardSelected, dashboardOrder: dashboardSelected ? selected++ : 0,
        },
      });
    }
    return {
      spotIds: spots.map((s) => s.id),
      stationIds: [...new Set([
        ...stations.map((s) => s.id),
        ...existingStations.filter((s) => stationIds.includes(s.stationId)).map((s) => s.stationId),
      ])],
    };
  });
  return NextResponse.json(imported);
}

/**
 * PATCH /api/favorites — persist the visible order from Mon Openwind.
 * Every id is checked against the authenticated user's own favorites.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = reorderFavoritesSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ordre invalide" },
      { status: 400 },
    );
  }

  const dashboardSpotIds =
    parsed.data.dashboardFavorites
      ?.filter((favorite) => favorite.kind === "spot")
      .map((favorite) => favorite.id) ?? [];
  const dashboardStationIds =
    parsed.data.dashboardFavorites
      ?.filter((favorite) => favorite.kind === "station")
      .map((favorite) => favorite.id) ?? [];
  const dashboardOrders = new Map(
    parsed.data.dashboardFavorites?.map((favorite, index) => [
      `${favorite.kind}:${favorite.id}`,
      index,
    ]) ?? [],
  );
  const alertSpotIds =
    parsed.data.favoriteAlerts
      ?.filter((favorite) => favorite.kind === "spot")
      .map((favorite) => favorite.id) ?? [];
  const alertStationIds =
    parsed.data.favoriteAlerts
      ?.filter((favorite) => favorite.kind === "station")
      .map((favorite) => favorite.id) ?? [];
  const requestedSpotIds = [
    ...new Set([
      ...(parsed.data.spotIds ?? []),
      ...dashboardSpotIds,
      ...alertSpotIds,
    ]),
  ];
  const requestedStationIds = [
    ...new Set([
      ...(parsed.data.stationIds ?? []),
      ...dashboardStationIds,
      ...alertStationIds,
    ]),
  ];

  const [ownedSpots, ownedStations] = await Promise.all([
    requestedSpotIds.length > 0
      ? prisma.favorite.findMany({
          where: { userId: user.id, spotId: { in: requestedSpotIds } },
          select: { spotId: true },
        })
      : [],
    requestedStationIds.length > 0
      ? prisma.stationFavorite.findMany({
          where: {
            userId: user.id,
            stationId: { in: requestedStationIds },
          },
          select: { stationId: true },
        })
      : [],
  ]);

  const ownedSpotIds = new Set(ownedSpots.map((favorite) => favorite.spotId));
  const ownedStationIds = new Set(
    ownedStations.map((favorite) => favorite.stationId),
  );
  const ownsEveryFavorite =
    requestedSpotIds.every((id) => ownedSpotIds.has(id)) &&
    requestedStationIds.every((id) => ownedStationIds.has(id));

  if (!ownsEveryFavorite) {
    return NextResponse.json(
      { error: "Un favori n’appartient pas à ce compte" },
      { status: 403 },
    );
  }

  const updates = [
    ...(parsed.data.spotIds ?? []).map((spotId, sortOrder) =>
      prisma.favorite.update({
        where: { userId_spotId: { userId: user.id, spotId } },
        data: { sortOrder },
      }),
    ),
    ...(parsed.data.stationIds ?? []).map((stationId, sortOrder) =>
      prisma.stationFavorite.update({
        where: { userId_stationId: { userId: user.id, stationId } },
        data: { sortOrder },
      }),
    ),
    ...(parsed.data.dashboardFavorites
      ? [
          prisma.favorite.updateMany({
            where: { userId: user.id },
            data: { dashboardSelected: false },
          }),
          prisma.stationFavorite.updateMany({
            where: { userId: user.id },
            data: { dashboardSelected: false },
          }),
          ...dashboardSpotIds.map((spotId) =>
            prisma.favorite.update({
              where: { userId_spotId: { userId: user.id, spotId } },
              data: {
                dashboardSelected: true,
                dashboardOrder: dashboardOrders.get(`spot:${spotId}`) ?? 0,
              },
            }),
          ),
          ...dashboardStationIds.map((stationId) =>
            prisma.stationFavorite.update({
              where: {
                userId_stationId: { userId: user.id, stationId },
              },
              data: {
                dashboardSelected: true,
                dashboardOrder:
                  dashboardOrders.get(`station:${stationId}`) ?? 0,
              },
            }),
          ),
        ]
      : []),
    ...(parsed.data.favoriteAlerts
      ? [
          prisma.favorite.updateMany({
            where: { userId: user.id },
            data: { windAlertEnabled: false },
          }),
          prisma.stationFavorite.updateMany({
            where: { userId: user.id },
            data: { windAlertEnabled: false },
          }),
          ...parsed.data.favoriteAlerts.map((alert) => {
            const data = {
              windAlertEnabled: alert.enabled,
              windAlertMinKmh: alert.minWindKmh,
              windAlertMaxKmh: alert.maxWindKmh,
            };
            return alert.kind === "spot"
              ? prisma.favorite.update({
                  where: {
                    userId_spotId: { userId: user.id, spotId: alert.id },
                  },
                  data,
                })
              : prisma.stationFavorite.update({
                  where: {
                    userId_stationId: {
                      userId: user.id,
                      stationId: alert.id,
                    },
                  },
                  data,
                });
          }),
        ]
      : []),
  ];

  if (updates.length > 0) await prisma.$transaction(updates);

  return NextResponse.json({ reordered: true });
}
