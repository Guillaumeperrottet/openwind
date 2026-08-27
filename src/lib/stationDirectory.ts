import type { WindStation } from "@/lib/stations";

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
