export type FavoriteKind = "spot" | "station";

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
