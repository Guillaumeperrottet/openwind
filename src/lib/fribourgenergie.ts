/**
 * FribourgÉnergie — Wind measurement masts in the canton of Fribourg.
 *
 * Data source : opendata.fr.ch (Opendatasoft API v2.1)
 * License     : Open Data Fribourg — CC BY 4.0
 * Frequency   : 10-min measurements, batch-published daily (~16h lag)
 * Coverage    : 3 active masts in Fribourg (Préalpes + Broye + Gibloux)
 *
 * Note: measurements are taken at mast height (60–100 m above ground),
 * so wind speeds are significantly higher than standard 10 m values.
 *
 * Glâney mast excluded (offline since March 2026).
 */

import type { WindStation } from "./stations";

const BASE_URL = "https://opendata.fr.ch/api/explore/v2.1/catalog/datasets";

// ─── Station definitions ──────────────────────────────────────────────────────

interface FEStation {
  id: string;
  datasetId: string;
  name: string;
  lat: number;
  lng: number;
  altitudeM: number;
  /** Measurement height above ground (m) */
  mastHeightM: number;
}

const FE_STATIONS: FEStation[] = [
  {
    id: "fr-energy-schwyberg",
    datasetId: "08_02_eolien_schwyberg",
    name: "Schwyberg",
    lat: 46.6503,
    lng: 7.2134,
    altitudeM: 1610,
    mastHeightM: 100,
  },
  {
    id: "fr-energy-surpierre",
    datasetId: "08_02_eolien_surpierre",
    name: "Surpierre-Cheiry",
    lat: 46.7736,
    lng: 6.8944,
    altitudeM: 680,
    mastHeightM: 80,
  },
  {
    id: "fr-energy-gibloux",
    datasetId: "08_02_eolien_gibloux",
    name: "Gibloux",
    lat: 46.7189,
    lng: 7.0022,
    altitudeM: 1228,
    mastHeightM: 100,
  },
];

// ─── Types from the Opendatasoft API ─────────────────────────────────────────

interface FERecord {
  timestamp: string; // ISO 8601
  ff_top_sonic_avg: number | null; // wind speed at mast top, m/s
  ff_top_sonic_max: number | null; // wind gust at mast top, m/s
  dd_top_sonic_avg: number | null; // wind direction at mast top, °
  ff_80_thies_avg: number | null; // wind speed at 80m, m/s (for reference)
  tt_99_avg: number | null; // temperature, °C
  location: string;
}

interface FEApiResponse {
  total_count: number;
  results: FERecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** m/s → km/h */
function msToKmh(ms: number): number {
  return Math.round(ms * 3.6 * 10) / 10;
}

/**
 * Returns true if the timestamp is within the last 36 hours.
 * FribourgÉnergie data is batched daily — accept up to 36h lag.
 */
function isAcceptablyRecent(isoDate: string): boolean {
  const diff = Date.now() - new Date(isoDate).getTime();
  return diff >= 0 && diff < 36 * 60 * 60 * 1000;
}

// ─── Main fetch ───────────────────────────────────────────────────────────────

/**
 * Fetch the latest measurement from each FribourgÉnergie mast.
 *
 * Data is published with a ~16h lag (daily batch).
 * Stations are displayed with a clear "last updated" indicator.
 *
 * Cached 60 s server-side (consistent with other live overlays).
 */
export async function fetchFribourgEnergieStations(): Promise<WindStation[]> {
  const results = await Promise.allSettled(
    FE_STATIONS.map(async (station): Promise<WindStation | null> => {
      try {
        const url = `${BASE_URL}/${station.datasetId}/records?order_by=timestamp+desc&limit=1`;
        const res = await fetch(url, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(8_000),
        });

        if (!res.ok) return null;

        const data: FEApiResponse = await res.json();
        if (!data.results || data.results.length === 0) return null;

        const record = data.results[0];
        if (!record.timestamp) return null;

        // Skip if data is too stale (>36h)
        if (!isAcceptablyRecent(record.timestamp)) return null;

        // Speed: prefer top-sonic, fallback to 80m Thies
        const speedMs =
          record.ff_top_sonic_avg ?? record.ff_80_thies_avg ?? null;
        const gustMs = record.ff_top_sonic_max ?? null;

        if (speedMs === null || record.dd_top_sonic_avg === null) return null;

        return {
          id: station.id,
          name: `${station.name} (${station.mastHeightM}m)`,
          lat: station.lat,
          lng: station.lng,
          altitudeM: station.altitudeM,
          windSpeedKmh: msToKmh(speedMs),
          gustsKmh: gustMs !== null ? msToKmh(gustMs) : null,
          windDirection: record.dd_top_sonic_avg,
          updatedAt: record.timestamp,
          source: "fr-energy" as const,
        };
      } catch {
        return null;
      }
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<WindStation> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);
}
