import { NextResponse } from "next/server";
import { resolvePlace } from "@/lib/place-data";
import { parsePlaceRef } from "@/lib/place";
import { toSiteLocale } from "@/lib/site";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams, ref = params.get("ref");
  if (!parsePlaceRef(ref)) return NextResponse.json({ place: null }, { status: 400 });
  try {
    const place = await resolvePlace(ref!, toSiteLocale(params.get("locale") ?? "fr"), params.get("name") ?? undefined);
    return NextResponse.json({ place }, { status: place ? 200 : 404, headers: { "Cache-Control": place ? "public, max-age=60, s-maxage=300" : "no-store", "X-Robots-Tag": "noindex" } });
  } catch { return NextResponse.json({ place: null }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
