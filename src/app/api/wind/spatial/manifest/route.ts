import { NextRequest, NextResponse } from "next/server";
import {
  isWindModelId,
  OPEN_METEO_SPATIAL_BASE_URL,
  parseSpatialWindManifest,
  SPATIAL_WIND_MODELS,
  type OpenMeteoSpatialMetadata,
  type SpatialWindManifest,
} from "@/lib/windSpatial";

const MANIFEST_CACHE_TTL_MS = 90 * 1000;
const STALE_MANIFEST_TTL_MS = 12 * 60 * 60 * 1000;

type ManifestCacheEntry = {
  manifest: SpatialWindManifest;
  cachedAt: number;
};

const globalManifestCache = globalThis as typeof globalThis & {
  __openwindSpatialManifestCache?: Map<string, ManifestCacheEntry>;
};
const manifestCache =
  globalManifestCache.__openwindSpatialManifestCache ??
  new Map<string, ManifestCacheEntry>();
globalManifestCache.__openwindSpatialManifestCache = manifestCache;

export async function GET(request: NextRequest) {
  const modelId = request.nextUrl.searchParams.get("model");
  if (!isWindModelId(modelId)) {
    return NextResponse.json({ error: "Unsupported wind model" }, { status: 400 });
  }

  const cached = manifestCache.get(modelId);
  if (cached && Date.now() - cached.cachedAt < MANIFEST_CACHE_TTL_MS) {
    return manifestResponse(cached.manifest, "hit");
  }

  const domain = SPATIAL_WIND_MODELS[modelId].domain;
  const upstreamUrl = `${OPEN_METEO_SPATIAL_BASE_URL}/${domain}/latest.json`;

  try {
    const upstream = await fetch(upstreamUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) {
      throw new Error(`Spatial metadata returned ${upstream.status}`);
    }

    const raw = (await upstream.json()) as OpenMeteoSpatialMetadata;
    const manifest = parseSpatialWindManifest(modelId, raw);
    manifestCache.set(modelId, { manifest, cachedAt: Date.now() });
    return manifestResponse(manifest, "miss");
  } catch (error) {
    if (cached && Date.now() - cached.cachedAt < STALE_MANIFEST_TTL_MS) {
      return manifestResponse({ ...cached.manifest, stale: true }, "stale");
    }

    console.error(
      "[/api/wind/spatial/manifest]",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Spatial wind metadata unavailable" },
      { status: 502 },
    );
  }
}

function manifestResponse(
  manifest: SpatialWindManifest,
  cacheStatus: "hit" | "miss" | "stale",
) {
  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, s-maxage=90, stale-while-revalidate=3600",
      "X-Wind-Manifest-Cache": cacheStatus,
    },
  });
}
