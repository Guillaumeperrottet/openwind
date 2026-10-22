import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { REVIEW_PREFIX, reviewSchema } from "@/lib/planner-review";
import { loadReviews, spotFingerprint } from "@/lib/planner-review-store";
import { localDate } from "@/lib/planner";

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedAdmin()))
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  const q =
    new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) || "";
  const spots = await prisma.spot.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { id: q }] }
      : undefined,
    orderBy: { name: "asc" },
    take: 40,
  });
  const reviews = await loadReviews(spots.map((s) => s.id));
  return NextResponse.json(
    spots.map((s) => ({
      spot: {
        id: s.id,
        name: s.name,
        sportType: s.sportType,
        description: s.description,
        difficulty: s.difficulty,
        waterType: s.waterType,
        access: s.access,
        hazards: s.hazards,
        bestWindDirections: s.bestWindDirections,
        bestMonths: s.bestMonths,
      },
      fingerprint: spotFingerprint(s),
      review: reviews.get(s.id) ?? null,
    })),
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function PUT(request: NextRequest) {
  if (!(await getAuthenticatedAdmin()))
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(input?.review);
  if (typeof input?.spotId !== "string" || !parsed.success)
    return NextResponse.json(
      {
        error:
          "Revue invalide : notes FR/DE/IT/EN, secteurs précis et sources couvrant les quatre sujets requis pour documenter un profil.",
        details: parsed.success ? undefined : parsed.error.flatten(),
      },
      { status: 400 },
    );
  const spot = await prisma.spot.findUnique({ where: { id: input.spotId } });
  if (!spot)
    return NextResponse.json({ error: "Spot introuvable" }, { status: 404 });
  if (spotFingerprint(spot) !== parsed.data.fingerprint)
    return NextResponse.json(
      { error: "La fiche a changé. Rechargez-la avant de refaire la revue." },
      { status: 409 },
    );
  if (parsed.data.reviewedAt > localDate(new Date()))
    return NextResponse.json(
      { error: "La date de revue ne peut pas être dans le futur." },
      { status: 400 },
    );
  const key = REVIEW_PREFIX + spot.id,
    value = JSON.stringify(parsed.data);
  await prisma.systemConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  for (const locale of ["fr", "de", "it", "en"])
    revalidatePath(`/${locale}/spots/${spot.id}`);
  return NextResponse.json({ saved: true });
}
