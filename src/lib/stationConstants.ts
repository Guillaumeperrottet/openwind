/**
 * Station network constants — client-safe (no server-only, no Prisma).
 *
 * Split from stationData.ts so that client components (KiteMap, etc.) can
 * import the freshness thresholds without pulling server-only code into the
 * browser bundle.
 */

import type { NetworkId } from "@/types";
export type { NetworkId };

/**
 * Maximum age of a station measurement before it is considered stale,
 * by network. This is the single source of truth — both server (stationData.ts)
 * and client (KiteMap pulse, etc.) must import from here.
 */
export const FRESHNESS_BY_NETWORK: Record<NetworkId, number> = {
  meteoswiss: 60 * 60 * 1000, // 1 h (10-min cycles but outages are common)
  pioupiou: 20 * 60 * 1000, // 20 min (push ~4 min)
  netatmo: 30 * 60 * 1000, // 30 min
  meteofrance: 4 * 60 * 60 * 1000, // 4 h (SYNOP every 3 h)
  windball: 30 * 60 * 1000, // 30 min
  "fr-energy": 30 * 60 * 1000, // 30 min
};

export const NETWORK_LABELS: Record<NetworkId | "openmeteo", string> = {
  meteoswiss: "MeteoSwiss",
  pioupiou: "Pioupiou",
  netatmo: "Netatmo",
  meteofrance: "Météo-France",
  windball: "Windball",
  "fr-energy": "FribourgÉnergie",
  openmeteo: "Open-Meteo",
};

/** Derive network identifier from station ID prefix. */
export function detectNetwork(stationId: string): NetworkId {
  if (stationId.startsWith("piou-")) return "pioupiou";
  if (stationId.startsWith("ntm-")) return "netatmo";
  if (stationId.startsWith("mf-")) return "meteofrance";
  if (stationId.startsWith("windball-")) return "windball";
  if (stationId.startsWith("fr-energy-")) return "fr-energy";
  return "meteoswiss";
}

/** True if the station measurement at `iso` is within the freshness window for its network. */
export function isNetworkFresh(
  stationId: string,
  iso: string | undefined | null,
): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const network = detectNetwork(stationId);
  return Date.now() - t < FRESHNESS_BY_NETWORK[network];
}
