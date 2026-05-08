import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMeteoSwissStations } from "@/lib/stations";
import type { WindStation } from "@/lib/stations";
import { fetchPioupiouStations } from "@/lib/pioupiou";
import { fetchNetatmoStations } from "@/lib/netatmo";
import { fetchMeteoFranceStations } from "@/lib/meteofrance";
import { fetchWindballStations } from "@/lib/windball";
import { fetchFribourgEnergieStations } from "@/lib/fribourgenergie";

export const dynamic = "force-dynamic";

/** Haversine distance in metres between two lat/lng points. */
function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Slightly offset non-MeteoSwiss stations that are within 150 m of a
 * MeteoSwiss station, so both icons remain visible on the map without
 * overlapping. The offset (~25 m east) is purely visual — the station data
 * and coordinates stored in the DB are not affected.
 */
function offsetCollocatedStations(stations: WindStation[]): WindStation[] {
  const ms = stations.filter((s) => s.source === "meteoswiss");
  // 0.00025° lng ≈ 20 m at Swiss latitudes
  const LNG_OFFSET = 0.00025;
  return stations.map((s) => {
    if (s.source === "meteoswiss") return s;
    const tooClose = ms.some((ref) => distanceM(ref, s) < 150);
    if (!tooClose) return s;
    return { ...s, lng: s.lng + LNG_OFFSET };
  });
}

/**
 * Overlay the latest `StationMeasurement` rows on top of a stations array.
 *
 * The snapshot cache (`stations_cache`) is rewritten by the cron every
 * ~10 min and may lag the live measurements by a few minutes. The
 * `StationMeasurement` table is updated by the same cron but is also the
 * source of truth used by the 48h history chart and by the spot page's
 * "Vent moyen / Rafales" cards.
 *
 * Overlaying the latest DB rows here guarantees that the popup on the
 * map and the cards on the spot page show *exactly* the same value
 * (no more "12 kts in popup, 11 kts on page" confusion).
 */
async function overlayLatestMeasurements(
  stations: WindStation[],
): Promise<WindStation[]> {
  if (stations.length === 0) return stations;
  try {
    const ids = stations.map((s) => s.id);
    // Look only at the last 30 min — anything older is staler than the
    // snapshot itself and shouldn't override it.
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const rows = await prisma.stationMeasurement.findMany({
      where: { stationId: { in: ids }, time: { gte: since } },
      orderBy: { time: "desc" },
      select: {
        stationId: true,
        time: true,
        windSpeedKmh: true,
        windDirection: true,
        gustsKmh: true,
      },
    });

    // Keep the most recent row per stationId (rows are already DESC).
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) {
      if (!latest.has(r.stationId)) latest.set(r.stationId, r);
    }

    return stations.map((s) => {
      const fresh = latest.get(s.id);
      if (!fresh) return s;
      // Only override if the DB row is strictly newer than the snapshot.
      const snapshotTime = new Date(s.updatedAt).getTime();
      const dbTime = fresh.time.getTime();
      if (dbTime <= snapshotTime) return s;
      return {
        ...s,
        windSpeedKmh: fresh.windSpeedKmh,
        windDirection: fresh.windDirection,
        gustsKmh: fresh.gustsKmh ?? s.gustsKmh,
        updatedAt: fresh.time.toISOString(),
      };
    });
  } catch {
    // DB unavailable — return snapshot as-is rather than failing the request.
    return stations;
  }
}

/**
 * Overlay fresh live data from networks that update faster than the cron
 * (Windball ~10 min, Pioupiou ~4 min). Both client functions use a 60 s
 * Next.js fetch cache, so this is essentially free on repeated requests
 * but guarantees the popup always shows the latest available trame
 * — not just what the 10-min cron last ingested.
 */
async function overlayLiveNetworks(
  stations: WindStation[],
): Promise<WindStation[]> {
  const withTimeout = <T>(p: Promise<T>, ms = 6000): Promise<T> =>
    Promise.race([
      p,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("timeout")), ms),
      ),
    ]);

  const [wbRes, ppRes] = await Promise.allSettled([
    withTimeout(fetchWindballStations()),
    withTimeout(fetchPioupiouStations()),
  ]);

  const fresh = new Map<string, WindStation>();
  if (wbRes.status === "fulfilled") {
    for (const s of wbRes.value) fresh.set(s.id, s);
  }
  if (ppRes.status === "fulfilled") {
    for (const s of ppRes.value) fresh.set(s.id, s);
  }
  if (fresh.size === 0) return stations;

  const out = stations.map((s) => {
    const f = fresh.get(s.id);
    if (!f) return s;
    // Keep the freshest of (snapshot/DB) vs (live API)
    const snapshotTime = new Date(s.updatedAt).getTime();
    const freshTime = new Date(f.updatedAt).getTime();
    return freshTime > snapshotTime ? f : s;
  });

  // Append any live stations that weren't in the snapshot at all yet
  const ids = new Set(stations.map((s) => s.id));
  for (const [id, s] of fresh) {
    if (!ids.has(id)) out.push(s);
  }
  return out;
}

/**
 * GET /api/stations
 *
 * Returns live wind measurements from all available station networks.
 *
 * **Fast path** (< 100ms): reads the cached JSON written by the cron job
 * every 10 minutes into `SystemConfig.stations_cache`, then overlays the
 * latest `StationMeasurement` rows + a fresh fetch of the high-frequency
 * networks (Windball, Pioupiou) so the popup always shows the same
 * trame as the spot page's 48h history chart.
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
        const snapshot = JSON.parse(cached.value) as WindStation[];
        // Two overlays: latest DB rows (cron 10min) + live API trames (60s cache)
        const withDb = await overlayLatestMeasurements(snapshot);
        const withLive = await overlayLiveNetworks(withDb);
        const stations = offsetCollocatedStations(withLive);
        return NextResponse.json(stations, {
          headers: {
            // CDN cache 60 s — matches the live overlay revalidate window
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
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
    withTimeout(fetchFribourgEnergieStations()),
  ]);

  const meteoSwiss = results[0].status === "fulfilled" ? results[0].value : [];
  const pioupiou = results[1].status === "fulfilled" ? results[1].value : [];
  const netatmo = results[2].status === "fulfilled" ? results[2].value : [];
  const meteoFrance = results[3].status === "fulfilled" ? results[3].value : [];
  const windball = results[4].status === "fulfilled" ? results[4].value : [];
  const fribourgEnergie =
    results[5].status === "fulfilled" ? results[5].value : [];

  const networkNames = [
    "MeteoSwiss",
    "Pioupiou",
    "Netatmo",
    "Météo-France",
    "Windball",
    "FribourgÉnergie",
  ];
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "rejected") {
      console.error(
        `[/api/stations] ${networkNames[i]} error:`,
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
    ...fribourgEnergie,
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

  // Overlay latest StationMeasurement rows for consistency with history chart
  const merged = offsetCollocatedStations(
    await overlayLatestMeasurements(stations),
  );

  return NextResponse.json(merged, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
    },
  });
}
