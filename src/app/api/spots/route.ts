import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { newSpotSchema } from "@/lib/spot-contribution";
import { submittedSpotReview } from "@/lib/spot-contribution-review";
import { REVIEW_PREFIX } from "@/lib/planner-review";
import { localDate } from "@/lib/planner";
import { requireSpotContributor } from "@/lib/spot-access";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = parseFloat(searchParams.get("radius") || "0");

  const spots = await prisma.spot.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  // If lat/lng/radius provided, filter by distance (haversine)
  if (lat && lng && radius > 0) {
    const lat0 = parseFloat(lat);
    const lng0 = parseFloat(lng);

    const nearby = spots
      .map((spot: (typeof spots)[number]) => {
        const dLat = toRad(spot.latitude - lat0);
        const dLng = toRad(spot.longitude - lng0);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat0)) *
            Math.cos(toRad(spot.latitude)) *
            Math.sin(dLng / 2) ** 2;
        const distanceKm =
          6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...spot, distanceKm };
      })
      .filter((s: { distanceKm: number }) => s.distanceKm <= radius)
      .sort(
        (a: { distanceKm: number }, b: { distanceKm: number }) =>
          a.distanceKm - b.distanceKm,
      );

    return NextResponse.json(nearby);
  }

  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  const access = await requireSpotContributor();
  if (access.error) return access.error;

  const body = await request.json().catch(() => null);
  const parsed = newSpotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { sources, discipline, seasonMode, seasonDetails, ...data } = parsed.data;
    const spot = await prisma.$transaction(async tx => {
      const created = await tx.spot.create({ data, include: { images: true } });
      const review = submittedSpotReview(created, { ...data, sources, discipline, seasonMode, seasonDetails }, localDate(new Date()));
      await tx.systemConfig.create({ data: { key: REVIEW_PREFIX + created.id, value: JSON.stringify(review) } });
      return created;
    });
    for (const locale of ["fr", "de", "it", "en"]) revalidatePath(`/${locale}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json(spot, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "P1001") {
      return NextResponse.json(
        { error: "Base de données injoignable — réessayez plus tard" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du spot" },
      { status: 500 },
    );
  }
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
