import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), spots: vi.fn(), station: vi.fn(), user: vi.fn(),
  favorites: vi.fn(), stations: vi.fn(), upsertSpot: vi.fn(), upsertStation: vi.fn(), transaction: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: mocks.auth } }) }));
vi.mock("@/lib/stationData", () => ({ getStationFromCache: mocks.station }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  spot: { findMany: mocks.spots }, user: { upsert: mocks.user }, $transaction: mocks.transaction,
} }));
import { PUT } from "@/app/api/favorites/route";

const req = (body: unknown) => new NextRequest("https://www.openwind.ch/api/favorites", {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const tx = { favorite: { findMany: mocks.favorites, upsert: mocks.upsertSpot }, stationFavorite: { findMany: mocks.stations, upsert: mocks.upsertStation } };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ data: { user: { id: "signed-in-user", email: "member@example.com" } }, error: null });
  mocks.spots.mockResolvedValue([{ id: "spot-1" }]);
  mocks.station.mockResolvedValue(null);
  mocks.favorites.mockResolvedValue([]);
  mocks.stations.mockResolvedValue([]);
  mocks.transaction.mockImplementation((work) => work(tx));
});
afterEach(() => vi.restoreAllMocks());

describe("idempotent device-to-account favorite import", () => {
  it("rejects missing or invalid sessions before any catalogue read or write", async () => {
    mocks.auth.mockResolvedValue({ data: { user: { id: "stale" } }, error: new Error("Expired") });
    expect((await PUT(req({ spotIds: ["spot-1"] }))).status).toBe(401);
    expect(mocks.spots).not.toHaveBeenCalled();
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("rejects a caller-supplied owner and oversized imports", async () => {
    expect((await PUT(req({ spotIds: ["spot-1"], userId: "victim" }))).status).toBe(400);
    expect((await PUT(req({ spotIds: Array.from({ length: 13 }, (_, i) => `s${i}`) }))).status).toBe(400);
    expect(mocks.spots).not.toHaveBeenCalled();
  });
  it("creates favorites for the verified user only, with idempotent upserts", async () => {
    const response = await PUT(req({ spotIds: ["spot-1", "spot-1"] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ spotIds: ["spot-1"], stationIds: [] });
    expect(mocks.upsertSpot).toHaveBeenCalledWith({
      where: { userId_spotId: { userId: "signed-in-user", spotId: "spot-1" } },
      update: {}, create: { userId: "signed-in-user", spotId: "spot-1", sortOrder: 0, dashboardSelected: true, dashboardOrder: 0 },
    });
  });
  it("never toggles or overwrites a favorite that is already in the account", async () => {
    mocks.favorites.mockResolvedValue([{ spotId: "spot-1", dashboardSelected: true, sortOrder: 2, windAlertEnabled: true }]);
    await PUT(req({ spotIds: ["spot-1"] }));
    await PUT(req({ spotIds: ["spot-1"] }));
    expect(mocks.upsertSpot).not.toHaveBeenCalled();
    expect(mocks.upsertStation).not.toHaveBeenCalled();
  });
  it("appends imported favorites without exceeding the three dashboard cards", async () => {
    mocks.favorites.mockResolvedValue(Array.from({ length: 3 }, (_, i) => ({ spotId: `existing-${i}`, dashboardSelected: true, sortOrder: i })));
    await PUT(req({ spotIds: ["spot-1"] }));
    expect(mocks.upsertSpot.mock.calls[0][0].create).toMatchObject({ sortOrder: 3, dashboardSelected: false });
  });
  it("acknowledges only available favorites so offline stations stay on the device", async () => {
    mocks.station.mockImplementation(async (id) => id === "VEV" ? { id, name: "Vevey", source: "meteoswiss", lat: 46.45, lng: 6.85, altitudeM: 380 } : null);
    const response = await PUT(req({ spotIds: ["spot-1", "deleted"], stationIds: ["VEV", "offline"] }));
    expect(await response.json()).toEqual({ spotIds: ["spot-1"], stationIds: ["VEV"] });
    expect(mocks.upsertStation.mock.calls[0][0]).toMatchObject({ update: {}, create: { userId: "signed-in-user", stationId: "VEV", dashboardOrder: 1 } });
  });
  it("acknowledges an existing station even when its provider is offline", async () => {
    mocks.spots.mockResolvedValue([]);
    mocks.stations.mockResolvedValue([{ stationId: "offline", dashboardSelected: true, sortOrder: 0 }]);
    const response = await PUT(req({ stationIds: ["offline"] }));
    expect(await response.json()).toEqual({ spotIds: [], stationIds: ["offline"] });
    expect(mocks.upsertStation).not.toHaveBeenCalled();
  });
});
