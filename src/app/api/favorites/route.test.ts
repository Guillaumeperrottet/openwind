import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  favoriteFindMany: vi.fn(),
  favoriteFindUnique: vi.fn(),
  favoriteDelete: vi.fn(),
  favoriteCreate: vi.fn(),
  stationFavoriteFindMany: vi.fn(),
  stationFavoriteFindUnique: vi.fn(),
  stationFavoriteDelete: vi.fn(),
  stationFavoriteCreate: vi.fn(),
  userUpsert: vi.fn(),
  getStationFromCache: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findMany: mocks.favoriteFindMany,
      findUnique: mocks.favoriteFindUnique,
      delete: mocks.favoriteDelete,
      create: mocks.favoriteCreate,
    },
    stationFavorite: {
      findMany: mocks.stationFavoriteFindMany,
      findUnique: mocks.stationFavoriteFindUnique,
      delete: mocks.stationFavoriteDelete,
      create: mocks.stationFavoriteCreate,
    },
    user: { upsert: mocks.userUpsert },
  },
}));

vi.mock("@/lib/stationData", () => ({
  getStationFromCache: mocks.getStationFromCache,
}));

import { GET, POST } from "./route";

const user = {
  id: "user-1",
  email: "wind@example.com",
  user_metadata: { full_name: "Wind User" },
};

function postRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user } });
  mocks.favoriteFindMany.mockResolvedValue([]);
  mocks.stationFavoriteFindMany.mockResolvedValue([]);
  mocks.favoriteFindUnique.mockResolvedValue(null);
  mocks.stationFavoriteFindUnique.mockResolvedValue(null);
});

describe("favorites API", () => {
  it("returns both empty collections for an anonymous visitor", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await GET();

    expect(await response.json()).toEqual({ spotIds: [], stationIds: [] });
  });

  it("lists spot and station favorites together", async () => {
    mocks.favoriteFindMany.mockResolvedValue([{ spotId: "spot-1" }]);
    mocks.stationFavoriteFindMany.mockResolvedValue([
      { stationId: "piou-2153" },
    ]);

    const response = await GET();

    expect(await response.json()).toEqual({
      spotIds: ["spot-1"],
      stationIds: ["piou-2153"],
    });
  });

  it("keeps the existing spot toggle payload compatible", async () => {
    const response = await POST(postRequest({ spotId: "spot-1" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      favorited: true,
      kind: "spot",
    });
    expect(mocks.favoriteCreate).toHaveBeenCalledWith({
      data: { userId: "user-1", spotId: "spot-1" },
    });
    expect(mocks.stationFavoriteCreate).not.toHaveBeenCalled();
  });

  it("removes a saved station without requiring a live cache entry", async () => {
    mocks.stationFavoriteFindUnique.mockResolvedValue({ id: "favorite-1" });

    const response = await POST(postRequest({ stationId: "VEV" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      favorited: false,
      kind: "station",
    });
    expect(mocks.stationFavoriteDelete).toHaveBeenCalledWith({
      where: { id: "favorite-1" },
    });
    expect(mocks.getStationFromCache).not.toHaveBeenCalled();
  });

  it("saves trusted station metadata from the server cache", async () => {
    mocks.getStationFromCache.mockResolvedValue({
      id: "windball-wf-35",
      name: "Moléson",
      source: "windball",
      lat: 46.548,
      lng: 7.017,
      altitudeM: 1970,
      windSpeedKmh: 28,
      gustsKmh: 40,
      windDirection: 220,
      updatedAt: "2026-09-02T09:00:00.000Z",
    });

    const response = await POST(
      postRequest({ stationId: "windball-wf-35" }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      favorited: true,
      kind: "station",
    });
    expect(mocks.stationFavoriteCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        stationId: "windball-wf-35",
        stationName: "Moléson",
        source: "windball",
        latitude: 46.548,
        longitude: 7.017,
        altitudeM: 1970,
      },
    });
  });
});
