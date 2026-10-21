import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  spots: vi.fn(),
  articles: vi.fn(),
  stations: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    spot: { findMany: mocks.spots },
    article: { findMany: mocks.articles },
  },
}));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: mocks.stations }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.spots.mockResolvedValue([
    {
      id: "cmnpsruyx0001haf6x0f0m7v2",
      name: "Boiron",
      country: "Suisse",
      region: "Vaud",
      latitude: 46.49,
      longitude: 6.48,
      sportType: "KITE",
    },
  ]);
  mocks.stations.mockResolvedValue([
    { id: "PRE", name: "St-Prex", source: "meteoswiss" },
  ]);
  mocks.articles.mockResolvedValue([
    {
      id: "article",
      slug: "bise",
      title: "La bise",
      excerpt: "Lire le vent",
      location: "Suisse",
    },
  ]);
});
describe("public search index boundaries", () => {
  it("queries only published editorial metadata and never article bodies or users", async () => {
    const { getSearchEntries } = await import("../search-data");
    const data = await getSearchEntries("it");
    expect(data.partial).toBe(false);
    expect(mocks.articles).toHaveBeenCalledWith({
      where: { status: "PUBLISHED", kind: "EDITORIAL" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        location: true,
      },
    });
    expect(data.entries.find((x) => x.kind === "article")?.href).toBe(
      "/fr/carnet/bise",
    );
    expect(data.entries.find((x) => x.kind === "article")?.subtitle).toContain(
      "Français",
    );
  });
  it("finds associated spots and stations using another language's lake name", async () => {
    const { getSearchEntries } = await import("../search-data");
    const { searchEntries } = await import("../search");
    const { entries } = await getSearchEntries("it");
    const results = searchEntries(entries, "Genfersee");
    expect(results.some((x) => x.kind === "spot" && x.title === "Boiron")).toBe(
      true,
    );
    expect(
      results.some((x) => x.kind === "station" && x.title === "St-Prex"),
    ).toBe(true);
  });
  it("shares one public load across concurrent locale searches", async () => {
    const { getSearchEntries } = await import("../search-data");
    await Promise.all([
      getSearchEntries("de"),
      getSearchEntries("fr"),
      getSearchEntries("it"),
    ]);
    expect(mocks.spots).toHaveBeenCalledTimes(1);
    expect(mocks.stations).toHaveBeenCalledTimes(1);
  });
  it("keeps static guides available on failure and retries the database on the next request", async () => {
    mocks.spots.mockRejectedValueOnce(new Error("offline"));
    const { getSearchEntries } = await import("../search-data");
    const first = await getSearchEntries("de");
    expect(first.partial).toBe(true);
    expect(
      first.entries.some((x) => x.href === "/de/vent-en-direct/lac-leman"),
    ).toBe(true);
    expect((await getSearchEntries("de")).partial).toBe(false);
    expect(mocks.spots).toHaveBeenCalledTimes(2);
  });
});
