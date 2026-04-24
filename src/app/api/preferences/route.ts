import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SPORT_FILTERS = ["ALL", "KITE", "PARAGLIDE"] as const;

const updatePreferencesSchema = z.object({
  sportFilter: z.enum(SPORT_FILTERS).optional(),
  useKnots: z.boolean().optional(),
  mapView: z
    .object({
      center: z.tuple([z.number(), z.number()]),
      zoom: z.number().min(0).max(24),
    })
    .nullable()
    .optional(),
});

/**
 * GET /api/preferences — return current user's preferences
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      sportFilter: "ALL",
      useKnots: true,
      mapView: null,
    });
  }

  const pref = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  const mapView =
    pref?.mapCenterLng != null &&
    pref?.mapCenterLat != null &&
    pref?.mapZoom != null
      ? {
          center: [pref.mapCenterLng, pref.mapCenterLat] as [number, number],
          zoom: pref.mapZoom,
        }
      : null;

  return NextResponse.json({
    sportFilter: pref?.sportFilter ?? "ALL",
    useKnots: pref?.useKnots ?? true,
    mapView,
  });
}

/**
 * PATCH /api/preferences — update one or more preferences
 * Body: { sportFilter?: "ALL"|"KITE"|"PARAGLIDE", useKnots?: boolean }
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = updatePreferencesSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }
  const data: Record<string, unknown> = {};

  if (parsed.data.sportFilter !== undefined) {
    data.sportFilter = parsed.data.sportFilter;
  }
  if (parsed.data.useKnots !== undefined) {
    data.useKnots = parsed.data.useKnots;
  }
  if (parsed.data.mapView !== undefined) {
    if (parsed.data.mapView === null) {
      data.mapCenterLng = null;
      data.mapCenterLat = null;
      data.mapZoom = null;
    } else {
      const [lng, lat] = parsed.data.mapView.center;
      data.mapCenterLng = lng;
      data.mapCenterLat = lat;
      data.mapZoom = parsed.data.mapView.zoom;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Rien à mettre à jour" },
      { status: 400 },
    );
  }

  // Ensure user exists in DB (auto-sync from Supabase Auth)
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

  const pref = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  const mapView =
    pref.mapCenterLng != null &&
    pref.mapCenterLat != null &&
    pref.mapZoom != null
      ? {
          center: [pref.mapCenterLng, pref.mapCenterLat] as [number, number],
          zoom: pref.mapZoom,
        }
      : null;

  return NextResponse.json({
    sportFilter: pref.sportFilter,
    useKnots: pref.useKnots,
    mapView,
  });
}
