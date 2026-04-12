import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMeteoSwissStations } from "@/lib/stations";
import { fetchPioupiouStations } from "@/lib/pioupiou";
import { fetchNetatmoStations } from "@/lib/netatmo";
import { fetchMeteoFranceStations } from "@/lib/meteofrance";
import { fetchWindballStations } from "@/lib/windball";

export const dynamic = "force-dynamic";

/**
 * GET /api/stations
 *
 * Returns live wind measurements from all available station networks.
 *
 * **Fast path** (< 100ms): reads the cached JSON written by the cron job
 * every 10 minutes into `SystemConfig.stations_cache`. If the cache is
 * fresh (< 15 min old), it is served immediately.
 *
 * **Slow fallback**: if the cache is stale or missing, fetches live data
 * from all 5 networks (MeteoSwiss, Pioupiou, Netatmo, Météo-France,
 * Windball) with per-network timeouts, and refreshes the cache.
 */
export async function GET() {
  // ── Fast path: serve from DB cache ──────────────────────────────────────
  try {
    const cached = await prisma.systemConfig.findUnique({
      where: { key: "stations_cache" },
    });

    if (cached) {
      const age = Date.now() - cached.updatedAt.getTime();
      // Cache is fresh (< 15 min) — serve it instantly
      if (age < 15 * 60 * 1000) {
        const stations = JSON.parse(cached.value);
        return NextResponse.json(stations, {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        });
      }
    }
  } catch {
    // DB error — fall through to live fetch
  }

  // ── Slow fallback: live fetch from external APIs ────────────────────────
  const withTimeout = <T>(p: Promise<T>, ms = 8000): Promise<T> =>
    Promise.race([
      p,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), ms),
      ),
    ]);

  const results = await Promise.allSettled([
    withTimeout(fetchMeteoSwissStations()),
    withTimeout(fetchPioupiouStations()),
    withTimeout(fetchNetatmoStations(), 10_000),
    withTimeout(fetchMeteoFranceStations()),
    withTimeout(fetchWindballStations()),
  ]);

  const meteoSwiss = results[0].status === "fulfilled" ? results[0].value : [];
  const pioupiou = results[1].status === "fulfilled" ? results[1].value : [];
  const netatmo = results[2].status === "fulfilled" ? results[2].value : [];
  const meteoFrance = results[3].status === "fulfilled" ? results[3].value : [];
  const windball = results[4].status === "fulfilled" ? results[4].value : [];

  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "rejected") {
      const names = [
        "MeteoSwiss",
        "Pioupiou",
        "Netatmo",
        "Météo-France",
        "Windball",
      ];
      console.error(
        `[/api/stations] ${names[i]} error:`,
        (results[i] as PromiseRejectedResult).reason,
      );
    }
  }

  const stations = [
    ...meteoSwiss,
    ...pioupiou,
    ...netatmo,
    ...meteoFrance,
    ...windball,
  ];

  if (stations.length === 0) {
    return NextResponse.json(
      { error: "Station data temporarily unavailable" },
      { status: 503 },
    );
  }

  // Update the DB cache so the next request is instant
  try {
    await prisma.systemConfig.upsert({
      where: { key: "stations_cache" },
      update: { value: JSON.stringify(stations) },
      create: { key: "stations_cache", value: JSON.stringify(stations) },
    });
  } catch {
    // Non-critical — the data is still returned to the user
  }

  return NextResponse.json(stations, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
