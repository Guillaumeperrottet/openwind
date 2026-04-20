import type { WindyWebcam } from "@/app/api/webcams/route";
import { WebcamsClient } from "./WebcamsClient";

interface Props {
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    name?: string;
    back?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { name } = await searchParams;
  return {
    title: name ? `Webcams — ${name}` : "Webcams",
    description: name
      ? `Webcams en direct à proximité de ${name}.`
      : "Webcams en direct pour les spots de vent.",
  };
}

export default async function WebcamsPage({ searchParams }: Props) {
  const { lat, lng, name, back } = await searchParams;

  const latNum = lat ? parseFloat(lat) : null;
  const lngNum = lng ? parseFloat(lng) : null;
  const locationName = name ?? "ce lieu";
  const backUrl = back ?? "/";

  let webcams: WindyWebcam[] = [];

  if (latNum !== null && lngNum !== null && !isNaN(latNum) && !isNaN(lngNum)) {
    try {
      const apiKey = process.env.WINDY_WEBCAMS_API_KEY;
      if (apiKey) {
        const url =
          `https://api.windy.com/webcams/api/v3/webcams` +
          `?nearby=${latNum},${lngNum},15` +
          `&include=location,images,player` +
          `&limit=20` +
          `&orderby=distance`;

        const res = await fetch(url, {
          headers: { "x-windy-api-key": apiKey },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = (await res.json()) as { webcams?: WindyWebcam[] };
          webcams = data.webcams ?? [];
        }
      }
    } catch {
      /* Affiche la page vide plutôt que de planter */
    }
  }

  return (
    <WebcamsClient
      webcams={webcams}
      locationName={locationName}
      backUrl={backUrl}
      lat={latNum ?? 0}
      lng={lngNum ?? 0}
    />
  );
}
