import { NextResponse } from "next/server";

export interface WindyWebcam {
  webcamId: number;
  title: string;
  status: string;
  /** ISO 8601 — dernière mise à jour de l'image */
  lastUpdatedOn: string;
  location: {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  images: {
    current: {
      preview: string;
      thumbnail: string;
    };
  };
  /** URLs des players embed (string directe) */
  player: {
    live?: string;
    day?: string;
    month?: string;
  };
  urls?: {
    detail: string;
    provider?: string;
  };
}

/**
 * GET /api/webcams?lat=46&lng=7&radius=15
 * Proxy server-side vers l'API Windy Webcams v3.
 * La clé API n'est jamais exposée au client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") ?? "15";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat et lng requis" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const radiusNum = parseInt(radius, 10);

  if (
    isNaN(latNum) ||
    isNaN(lngNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lngNum < -180 ||
    lngNum > 180 ||
    isNaN(radiusNum) ||
    radiusNum < 1 ||
    radiusNum > 100
  ) {
    return NextResponse.json(
      { error: "Paramètres invalides" },
      { status: 400 },
    );
  }

  const apiKey = process.env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API Windy Webcams manquante" },
      { status: 503 },
    );
  }

  try {
    const url =
      `https://api.windy.com/webcams/api/v3/webcams` +
      `?nearby=${latNum},${lngNum},${radiusNum}` +
      `&include=location,images,player,urls` +
      `&limit=20` +
      `&orderby=distance`;

    const res = await fetch(url, {
      headers: { "x-windy-api-key": apiKey },
      next: { revalidate: 3600 }, // Cache 1h — les webcams bougent peu
    });

    if (!res.ok) {
      return NextResponse.json({ webcams: [] });
    }

    const data = (await res.json()) as { webcams?: WindyWebcam[] };
    return NextResponse.json({ webcams: data.webcams ?? [] });
  } catch {
    return NextResponse.json({ webcams: [] });
  }
}
