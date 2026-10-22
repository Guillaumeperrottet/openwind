import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const language = ["fr", "de", "it", "en"].includes(params.get("locale") ?? "")
    ? params.get("locale")!
    : "fr";
  if (q.length < 2 || q.length > 120)
    return NextResponse.json({ locations: [] }, { status: 400 });
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", language);
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("geocoding");
    const data = await response.json();
    const locations = (Array.isArray(data.results) ? data.results : [])
      .filter(
        (p: Record<string, unknown>) =>
          typeof p.name === "string" &&
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          Math.abs(p.latitude) <= 90 &&
          Math.abs(p.longitude) <= 180,
      )
      .map(
        (p: {
          id: number;
          name: string;
          admin1?: string;
          country?: string;
          latitude: number;
          longitude: number;
        }) => ({
          id: p.id,
          name: [p.name, p.admin1, p.country].filter(Boolean).join(", "),
          lat: p.latitude,
          lng: p.longitude,
        }),
      );
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json(
      { error: "GEOCODING_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
