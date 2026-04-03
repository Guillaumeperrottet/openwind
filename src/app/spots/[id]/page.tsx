import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchCurrentWind, fetchWindHistory } from "@/lib/wind";
import { fetchFullForecast } from "@/lib/forecast";
import { SpotPageClient } from "./SpotPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const spot = await prisma.spot.findUnique({ where: { id } });
    return { title: spot ? `Openkite - ${spot.name}` : "Openkite - Spot" };
  } catch {
    return { title: "Openkite - Spot" };
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params;

  let spot;
  try {
    spot = await prisma.spot.findUnique({
      where: { id },
      include: {
        images: true,
        reports: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  } catch {
    notFound();
  }

  if (!spot) notFound();

  // Fetch current wind + 7-day forecast + 48h history in parallel
  const [windResult, forecastResult, historyResult] = await Promise.allSettled([
    fetchCurrentWind(spot.latitude, spot.longitude),
    fetchFullForecast(spot.latitude, spot.longitude),
    fetchWindHistory(spot.latitude, spot.longitude),
  ]);

  return (
    <SpotPageClient
      spot={JSON.parse(JSON.stringify(spot))}
      wind={windResult.status === "fulfilled" ? windResult.value : null}
      forecast={
        forecastResult.status === "fulfilled" ? forecastResult.value : null
      }
      history={
        historyResult.status === "fulfilled" ? historyResult.value : null
      }
    />
  );
}
