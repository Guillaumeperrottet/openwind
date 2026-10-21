import "server-only";

import { prisma } from "@/lib/prisma";
import type { WindStation } from "@/lib/stations";

export const STATION_CATALOG_KEY = "stations_catalog";

export function parseStationSnapshot(value: string | undefined): WindStation[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Invalid station snapshot");
  return parsed.filter((station): station is WindStation =>
    Boolean(
      station &&
        typeof station.id === "string" &&
        typeof station.name === "string" &&
        Number.isFinite(station.lat) &&
        Number.isFinite(station.lng),
    ),
  );
}

/** Retain station identities through provider outages, without changing observation times. */
export function mergeStationSnapshots(
  ...snapshots: WindStation[][]
): WindStation[] {
  const stations = new Map<string, WindStation>();
  for (const snapshot of snapshots) {
    for (const station of snapshot) stations.set(station.id, station);
  }
  return [...stations.values()];
}

/** A DB failure must propagate: an unavailable catalog is not an unknown station. */
export async function getStationCatalog(): Promise<WindStation[]> {
  const snapshots = await prisma.systemConfig.findMany({
    where: { key: { in: [STATION_CATALOG_KEY, "stations_cache"] } },
    select: { key: true, value: true },
  });
  const catalog = snapshots.find(
    (snapshot) => snapshot.key === STATION_CATALOG_KEY,
  );
  const current = snapshots.find(
    (snapshot) => snapshot.key === "stations_cache",
  );
  return mergeStationSnapshots(
    parseStationSnapshot(catalog?.value),
    parseStationSnapshot(current?.value),
  );
}
