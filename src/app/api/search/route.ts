import { NextResponse } from "next/server";
import { getSearchEntries } from "@/lib/search-data";
import { SEARCH_KINDS, searchEntries, type SearchKind } from "@/lib/search";
import { toSiteLocale } from "@/lib/site";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim();
  const kind = params.get("type");
  if (query.length > 80 || (kind && !SEARCH_KINDS.includes(kind as SearchKind)))
    return NextResponse.json(
      { error: "Invalid search parameters" },
      { status: 400 },
    );
  const favoriteIds = (params.get("favorites") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 24);
  const { entries, partial } = await getSearchEntries(
    toSiteLocale(params.get("locale") ?? "fr"),
  );
  return NextResponse.json(
    {
      results: searchEntries(
        entries,
        query,
        kind as SearchKind | undefined,
        favoriteIds,
      ),
      partial,
    },
    {
      headers: {
        "Cache-Control":
          partial || favoriteIds.length
            ? "private, no-store"
            : "public, max-age=0, s-maxage=60, stale-while-revalidate=60",
        "X-Robots-Tag": "noindex, follow",
      },
    },
  );
}
