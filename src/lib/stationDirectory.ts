import type { WindStation } from "@/lib/stations";
import { NETWORK_LABELS, type NetworkId } from "@/lib/stationConstants";

export const STATION_PAGE_SIZE = 48;
export interface StationDirectoryQuery {
  page: number;
  query: string;
  source: NetworkId | "all";
  sort: "name" | "wind" | "latest";
}

export function parseDirectoryQuery(
  params: Record<string, string | string[] | undefined>,
): StationDirectoryQuery {
  const page =
    typeof params.page === "string" && /^\d+$/.test(params.page)
      ? Number(params.page)
      : 1;
  const source =
    typeof params.network === "string" &&
    params.network !== "openmeteo" &&
    Object.hasOwn(NETWORK_LABELS, params.network)
      ? (params.network as NetworkId)
      : "all";
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    query: typeof params.q === "string" ? params.q.trim().slice(0, 160) : "",
    source,
    sort:
      params.sort === "wind" || params.sort === "latest" ? params.sort : "name",
  };
}

export function directoryPagePath(
  query: StationDirectoryQuery,
  page: number,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query.query) params.set("q", query.query);
  if (query.source !== "all") params.set("network", query.source);
  if (query.sort !== "name") params.set("sort", query.sort);
  return `/balises${params.size ? `?${params}` : ""}`;
}

export function filterDirectoryStations(
  stations: WindStation[],
  query: StationDirectoryQuery,
  locale: string,
): WindStation[] {
  const search = normalizeStationSearch(query.query);
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return stations
    .filter((station) => {
      if (query.source !== "all" && station.source !== query.source)
        return false;
      return (
        !search ||
        normalizeStationSearch(
          `${station.name} ${station.id} ${station.description ?? ""} ${NETWORK_LABELS[station.source]}`,
        ).includes(search)
      );
    })
    .sort((a, b) => {
      const nameOrder =
        collator.compare(a.name, b.name) || a.id.localeCompare(b.id);
      if (query.sort === "wind")
        return b.windSpeedKmh - a.windSpeedKmh || nameOrder;
      if (query.sort === "latest")
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || nameOrder;
      return nameOrder;
    });
}

/**
 * Openwind's Swiss directory also keeps useful stations immediately across
 * the border. The wording on the page deliberately says “Suisse et régions
 * voisines” instead of pretending this rectangular filter is a country map.
 */
const DIRECTORY_BOUNDS = {
  south: 45.75,
  north: 47.9,
  west: 5.8,
  east: 10.6,
};

export function isInStationDirectory(station: WindStation): boolean {
  return (
    station.lat >= DIRECTORY_BOUNDS.south &&
    station.lat <= DIRECTORY_BOUNDS.north &&
    station.lng >= DIRECTORY_BOUNDS.west &&
    station.lng <= DIRECTORY_BOUNDS.east
  );
}

export function normalizeStationSearch(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
