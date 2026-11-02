export type FavoriteKind = "spot" | "station";

export const LOCAL_FAVORITES_KEY = "openwind-favorites:v1";
export const MAX_LOCAL_FAVORITES = 12;

export function favoritePayload(spotIds: Iterable<string>, stationIds: Iterable<string>) {
  return { spotIds: [...spotIds], stationIds: [...stationIds] };
}

export function readLocalFavorites() {
  try {
    const ids = parseFavoriteIds(JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) ?? "{}"));
    const spotIds = new Set([...ids.spotIds].filter((id) => id.length <= 200).slice(0, MAX_LOCAL_FAVORITES));
    return { spotIds, stationIds: new Set([...ids.stationIds].filter((id) => id.length <= 200).slice(0, MAX_LOCAL_FAVORITES - spotIds.size)) };
  } catch {
    return parseFavoriteIds(null);
  }
}

/** Remove only confirmed imports; a missing station can be retried later. */
export function remainingLocalFavorites(local: FavoriteIdSets, imported: FavoriteIdSets): FavoriteIdSets {
  return {
    spotIds: new Set([...local.spotIds].filter((id) => !imported.spotIds.has(id))),
    stationIds: new Set([...local.stationIds].filter((id) => !imported.stationIds.has(id))),
  };
}

export interface FavoriteIdSets {
  spotIds: Set<string>;
  stationIds: Set<string>;
}

/** Normalize the API payload while remaining compatible with older responses. */
export function parseFavoriteIds(value: unknown): FavoriteIdSets {
  const payload =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};

  return {
    spotIds: new Set(
      Array.isArray(payload.spotIds)
        ? payload.spotIds.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          )
        : [],
    ),
    stationIds: new Set(
      Array.isArray(payload.stationIds)
        ? payload.stationIds.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          )
        : [],
    ),
  };
}

/** Return a new Set with one favorite membership inverted. */
export function toggleFavoriteId(
  current: ReadonlySet<string>,
  id: string,
): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
