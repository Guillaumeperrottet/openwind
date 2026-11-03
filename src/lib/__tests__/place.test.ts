import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contextualHref, hasWater, parsePlaceRef, placeFeatureHref, placeRouteRef, validPlace, type Place } from "../place";
const mocks = vi.hoisted(() => ({ spot: vi.fn(), stations: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { spot: { findUnique: mocks.spot } } }));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: mocks.stations }));
const morlon: Place = { kind: "spot", id: "cmnq613tx00it04kw1d0vraq4", name: "Morlon", lat: 46.625, lng: 7.08, guideSlug: "lac-de-la-gruyere" };
beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("one precise place through wind, webcams and water", () => {
  it("keeps the exact spot coordinates and identity in contextual links", () => {
    const webcams = new URL(placeFeatureHref("webcams", morlon, "de"), "https://www.openwind.ch");
    expect(webcams.pathname).toBe("/de/webcams");
    expect(webcams.searchParams.get("lat")).toBe("46.625");
    expect(webcams.searchParams.get("place")).toBe(`spot:${morlon.id}`);
    expect(placeFeatureHref("wind", morlon, "de")).toBe(`/de/spots/${morlon.id}`);
    expect(placeFeatureHref("water", morlon, "fr")).toContain(`place=spot%3A${morlon.id}`);
  });
  it("does not label other lakes as having integrated water data", () => {
    expect(hasWater(morlon)).toBe(true);
    expect(hasWater({ ...morlon, guideSlug: "lac-leman" })).toBe(false);
    expect(hasWater({ ...morlon, guideSlug: undefined })).toBe(false);
  });
  it("preserves station identities with colons and uses the explicit French guide fallback", () => {
    expect(placeFeatureHref("wind", { ...morlon, kind: "station", id: "ntm-70:ee:50" }, "it")).toBe("/it/stations/ntm-70%3Aee%3A50");
    expect(placeFeatureHref("wind", { ...morlon, kind: "lake", id: "lac-de-la-gruyere" }, "en")).toContain("/fr/vent-en-direct/lac-de-la-gruyere?");
    expect(placeRouteRef("/de/stations/ntm-70%3Aee%3A50")).toBe("station:ntm-70:ee:50");
    expect(placeRouteRef("/fr/spots/new")).toBeNull();
    expect(placeRouteRef("/fr/spots/1/edit")).toBeNull();
  });
  it("only adapts general feature destinations, keeping explicit locations and external links", () => {
    expect(contextualHref("/fr/webcams", morlon, "fr")).toContain("lat=46.625");
    expect(contextualHref("/fr/webcams?lat=47&lng=8", morlon, "fr")).toBe("/fr/webcams?lat=47&lng=8");
    expect(contextualHref("https://example.com/webcams", morlon, "fr")).toBe("https://example.com/webcams");
    expect(contextualHref("/fr/balises", morlon, "fr")).toBe("/fr/balises");
  });
  it.each(["spot:../../private", "station:", "lake:bad/name", "area:91,7", "area:46,181", "area:NaN,7", "area:,7", "area:46,7,8", "https://evil.test"])("rejects invalid place reference %s", ref => expect(parsePlaceRef(ref)).toBeNull());
  it("accepts zero coordinates and rejects invalid stored objects", () => {
    expect(parsePlaceRef("area:0,0")).toEqual({ kind: "area", id: "0,0" });
    expect(validPlace(morlon)).toBe(true);
    expect(validPlace({ ...morlon, lat: null })).toBe(false);
    expect(validPlace({ ...morlon, lng: 999 })).toBe(false);
  });
});
describe("minimal public place resolution", () => {
  it("reads only the public spot name and coordinates", async () => {
    mocks.spot.mockResolvedValue({ id: morlon.id, name: morlon.name, latitude: morlon.lat, longitude: morlon.lng });
    const { resolvePlace } = await import("../place-data");
    expect(await resolvePlace(`spot:${morlon.id}`, "fr")).toEqual(morlon);
    expect(mocks.spot).toHaveBeenCalledWith({ where: { id: morlon.id }, select: { id: true, name: true, latitude: true, longitude: true } });
  });
  it("recognises a lake from its catalog coordinates without guessing from a nearby beach", async () => {
    const { resolvePlace } = await import("../place-data");
    expect(await resolvePlace("area:46.63,7.08", "de")).toMatchObject({ kind: "lake", guideSlug: "lac-de-la-gruyere" });
    const nearby = await resolvePlace("area:46.631,7.08", "fr", "Un autre lieu");
    expect(nearby?.kind).toBe("area"); expect(nearby?.guideSlug).toBeUndefined();
  });
  it("keeps an unknown or temporarily unavailable station from becoming another place", async () => {
    mocks.stations.mockResolvedValue([]);
    const { resolvePlace } = await import("../place-data");
    expect(await resolvePlace("station:unknown", "fr")).toBeNull();
    mocks.stations.mockRejectedValueOnce(Error("offline"));
    const { GET } = await import("@/app/api/place/route");
    expect((await GET(new Request("https://www.openwind.ch/api/place?ref=station:PRE"))).status).toBe(503);
    expect((await GET(new Request("https://www.openwind.ch/api/place?ref=admin:user"))).status).toBe(400);
  });
});
describe("place retained only for this browser visit", () => {
  it("restores a valid place on reload, clears it and expires older visits", async () => {
    const storage = new Map<string,string>();
    vi.stubGlobal("window", {}); vi.stubGlobal("sessionStorage", { getItem: (k: string) => storage.get(k), setItem: (k: string,v: string) => storage.set(k,v), removeItem: (k: string) => storage.delete(k) });
    vi.resetModules(); let store = await import("../place-store"); store.selectPlace(morlon);
    vi.resetModules(); store = await import("../place-store"); expect(store.selectedPlace()).toEqual(morlon);
    store.selectPlace(null); expect(store.selectedPlace()).toBeNull(); expect(storage.size).toBe(0);
    storage.set("openwind-place-v1", JSON.stringify({ place: morlon, time: Date.now() - 9 * 3600_000 }));
    vi.resetModules(); store = await import("../place-store"); expect(store.selectedPlace()).toBeNull();
  });
  it("does not let a late map lookup replace a subsequently selected place", async () => {
    vi.resetModules();
    let finish: (value: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(resolve => { finish = resolve; })));
    const store = await import("../place-store");
    const pending = store.rememberMapPlace(morlon, "fr");
    expect(store.selectedPlace()?.name).toBe("Morlon");
    const newer: Place = { kind: "station", id: "PRE", name: "St-Prex", lat: 46.48, lng: 6.44, guideSlug: "lac-leman" };
    store.selectPlace(newer);
    finish(new Response(JSON.stringify({ place: morlon })));
    await pending;
    expect(store.selectedPlace()).toEqual(newer);
  });
  it("works without browser storage", async () => {
    vi.resetModules(); vi.stubGlobal("window", {}); vi.stubGlobal("sessionStorage", { getItem: () => { throw Error(); }, setItem: () => { throw Error(); }, removeItem: () => { throw Error(); } });
    const store = await import("../place-store"); store.selectPlace(morlon); expect(store.selectedPlace()).toEqual(morlon); store.selectPlace(null); expect(store.selectedPlace()).toBeNull();
  });
});
