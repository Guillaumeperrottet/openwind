import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  spots: vi.fn(),
  articles: vi.fn(),
  categories: vi.fn(),
  topics: vi.fn(),
  catalog: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    spot: { findMany: mocks.spots },
    article: { findMany: mocks.articles },
    forumCategory: { findMany: mocks.categories },
    forumTopic: { findMany: mocks.topics },
  },
}));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: mocks.catalog }));
import sitemap from "./sitemap";

beforeEach(() => {
  mocks.spots.mockResolvedValue([
    { id: "spot", updatedAt: new Date("2026-10-20T10:00:00Z") },
  ]);
  mocks.articles.mockResolvedValue([
    {
      slug: "lac-de-la-gruyere",
      kind: "LOCAL_GUIDE",
      updatedAt: new Date("2026-10-22T10:00:00Z"),
    },
  ]);
  mocks.categories.mockResolvedValue([]);
  mocks.topics.mockResolvedValue([]);
  mocks.catalog.mockResolvedValue([{ id: "ntm-70:ee:50" }]);
});

describe("current, canonical sitemap", () => {
  it("includes known station identities and only published guide translations", async () => {
    const entries = await sitemap();
    const guide = entries.find(
      (entry) =>
        entry.url ===
        "https://www.openwind.ch/de/vent-en-direct/lac-de-la-gruyere",
    )!;
    expect(guide.alternates?.languages).not.toHaveProperty("en");
    expect(guide.lastModified).toEqual(new Date("2026-10-22T10:00:00Z"));
    expect(
      entries.some((entry) => entry.url.endsWith("/stations/ntm-70%3Aee%3A50")),
    ).toBe(true);
    expect(entries.some((entry) => entry.url.includes("/webcams"))).toBe(false);
    expect(
      entries.filter((entry) =>
        entry.url.endsWith("/carnet/lac-de-la-gruyere"),
      ),
    ).toHaveLength(0);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(
      entries.length,
    );
  });

  it("does not publish a successful truncated sitemap after a database error", async () => {
    mocks.spots.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(sitemap()).rejects.toThrow("database unavailable");
  });
});
