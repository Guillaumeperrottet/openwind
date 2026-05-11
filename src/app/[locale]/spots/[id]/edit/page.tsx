import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateSpotForm } from "@/components/spot/CreateSpotForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const spot = await prisma.spot.findUnique({ where: { id } });
    return {
      title: spot ? `Modifier ${spot.name}` : "Modifier le spot",
    };
  } catch {
    return { title: "Modifier le spot" };
  }
}

export default async function EditSpotPage({ params }: Props) {
  const { id } = await params;

  const spot = await prisma.spot
    .findUnique({ where: { id }, include: { images: true } })
    .catch(() => null);
  if (!spot) notFound();

  const initialData = {
    id: spot.id,
    name: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    country: spot.country,
    region: spot.region,
    sportType: spot.sportType as "KITE" | "PARAGLIDE",
    difficulty: spot.difficulty as
      | "BEGINNER"
      | "INTERMEDIATE"
      | "ADVANCED"
      | "EXPERT",
    waterType: spot.waterType as "FLAT" | "CHOP" | "WAVES" | "MIXED",
    minWindKmh: spot.minWindKmh ?? 15,
    maxWindKmh: spot.maxWindKmh ?? 35,
    bestMonths: spot.bestMonths,
    bestWindDirections: spot.bestWindDirections,
    hazards: spot.hazards,
    hazardsEn: spot.hazardsEn,
    hazardsDe: spot.hazardsDe,
    hazardsIt: spot.hazardsIt,
    access: spot.access,
    accessEn: spot.accessEn,
    accessDe: spot.accessDe,
    accessIt: spot.accessIt,
    description: spot.description,
    descriptionEn: spot.descriptionEn,
    descriptionDe: spot.descriptionDe,
    descriptionIt: spot.descriptionIt,
    nearestStationId: spot.nearestStationId,
    existingImages: spot.images.map((img: (typeof spot.images)[number]) => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
    })),
  };

  return <CreateSpotForm initialData={initialData} />;
}
