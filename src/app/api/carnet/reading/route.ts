import { NextResponse } from "next/server";
import { getCarnetPublications } from "@/lib/carnet-data";
import { LOCAL_GUIDES } from "@/lib/local-guides";
import { MAX_SAVED_ARTICLES, type ReadingKind } from "@/lib/reading-library";

/** Public, published catalogue metadata only; never returns draft bodies or user data. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const entries = (params.get("entries") ?? "").split(",");
  if (!entries.length || entries.length > MAX_SAVED_ARTICLES || entries.some((entry) => !/^(EDITORIAL|LOCAL_GUIDE):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry) || entry.length > 172)) return NextResponse.json({ error: "INVALID_ENTRIES" }, { status: 400 });
  try {
    const publications = await getCarnetPublications();
    const locale = params.get("locale") ?? "fr";
    const articles = entries.flatMap((entry) => {
      const [kind, slug] = entry.split(":") as [ReadingKind, string];
      const item = publications.find((publication) => publication.kind === kind && publication.href === `${kind === "EDITORIAL" ? "/carnet/" : "/vent-en-direct/"}${slug}`);
      if (!item) return [];
      const definition = kind === "LOCAL_GUIDE" ? LOCAL_GUIDES.find((guide) => guide.slug === slug) : null;
      if (kind === "LOCAL_GUIDE" && !definition) return [];
      const guideLocale = definition && (locale === "de" || locale === "it") && definition.translations[locale] ? locale : "fr";
      return [{ kind, slug, title: guideLocale !== "fr" ? definition!.translations[guideLocale]!.title : item.title, readTime: item.readTime, href: item.href, locale: kind === "EDITORIAL" ? "fr" : guideLocale }];
    });
    return NextResponse.json({ articles }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch { return NextResponse.json({ error: "CATALOGUE_UNAVAILABLE" }, { status: 503 }); }
}
