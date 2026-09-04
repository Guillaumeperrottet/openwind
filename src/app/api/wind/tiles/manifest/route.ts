import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  parseOpenwindWindTileManifest,
  type OpenwindWindTileModelId,
} from "@/lib/windTiles";

export const runtime = "nodejs";

const MANIFEST_TIMEOUT_MS = 8_000;
const MAX_VALID_TIME_DISTANCE_MS = 6 * 60 * 60 * 1000;
const SUPPORTED_MODELS = new Set<OpenwindWindTileModelId>(["dwd_icon_eu"]);

function isSupportedModel(
  value: string | null,
): value is OpenwindWindTileModelId {
  return value !== null && SUPPORTED_MODELS.has(value as OpenwindWindTileModelId);
}

function withCurrentStaleness<T extends { validAt: string; stale: boolean }>(
  manifest: T,
): T {
  return {
    ...manifest,
    stale:
      manifest.stale ||
      Math.abs(Date.now() - new Date(manifest.validAt).getTime()) >
        MAX_VALID_TIME_DISTANCE_MS,
  };
}

async function readLocalManifest(model: OpenwindWindTileModelId) {
  const manifestPath = path.join(
    process.cwd(),
    "public",
    "wind-data",
    model,
    "latest.json",
  );
  return JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
}

async function readRemoteManifest(
  source: string,
  model: OpenwindWindTileModelId,
) {
  const sourceUrl = new URL(source);
  if (sourceUrl.protocol !== "https:")
    throw new Error("Wind tile source must use HTTPS");
  const base = source.replace(/\/$/, "");
  const response = await fetch(`${base}/${model}/latest.json`, {
    cache: "no-store",
    signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(`Wind tile manifest returned ${response.status}`);
  return (await response.json()) as unknown;
}

export async function GET(request: NextRequest) {
  const model = request.nextUrl.searchParams.get("model");
  if (!isSupportedModel(model)) {
    return NextResponse.json({ error: "Unsupported wind tile model" }, { status: 400 });
  }

  const source = process.env.OPENWIND_WIND_TILE_SOURCE?.trim();
  if (!source) {
    return NextResponse.json(
      { error: "Openwind wind tiles are disabled" },
      { status: 404 },
    );
  }

  try {
    const raw =
      source === "local"
        ? await readLocalManifest(model)
        : await readRemoteManifest(source, model);
    const manifest = withCurrentStaleness(
      parseOpenwindWindTileManifest(raw),
    );
    if (source !== "local") {
      const testUrl = manifest.tileUrlTemplate
        .replaceAll("{x}", "0")
        .replaceAll("{y}", "0");
      if (new URL(testUrl).protocol !== "https:") {
        throw new Error("Remote wind tile URLs must use HTTPS");
      }
    }
    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control":
          source === "local"
            ? "no-store"
            : "public, s-maxage=90, stale-while-revalidate=900",
        "X-Wind-Tile-Source": source === "local" ? "local" : "remote",
      },
    });
  } catch (error) {
    if (source !== "local") {
      console.error(
        "[/api/wind/tiles/manifest]",
        error instanceof Error ? error.message : error,
      );
    }
    return NextResponse.json(
      { error: "Openwind wind tile manifest unavailable" },
      { status: 502 },
    );
  }
}
