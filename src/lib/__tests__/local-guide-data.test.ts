import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_GUIDES } from "@/lib/local-guides";

const mocks = vi.hoisted(() => ({
  editorial: vi.fn(),
  spots: vi.fn(),
  catalog: vi.fn(),
  forecast: vi.fn(),
  connections: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: { findFirst: mocks.editorial },
    spot: { findMany: mocks.spots },
  },
}));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: mocks.catalog }));
vi.mock("@/lib/forecast", () => ({ fetchFullForecast: mocks.forecast }));
vi.mock("@/lib/article-connections", () => ({
  resolveArticleConnections: mocks.connections,
}));
import { loadLocalGuide } from "@/lib/local-guide-data";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.editorial.mockResolvedValue(null);
  mocks.spots.mockResolvedValue([]);
  mocks.catalog.mockResolvedValue([]);
  mocks.forecast.mockRejectedValue(new Error("weather provider unavailable"));
  mocks.connections.mockResolvedValue({
    spots: [],
    stations: [],
    relatedArticles: [],
  });
});

describe("guide availability and observation provenance", () => {
  it("keeps localized editorial content readable during database and forecast outages", async () => {
    mocks.editorial.mockRejectedValue(new Error("database unavailable"));
    mocks.catalog.mockRejectedValue(new Error("database unavailable"));
    const result = await loadLocalGuide(LOCAL_GUIDES[0], "de");
    expect(result.content).toBe(LOCAL_GUIDES[0].translations.de!.content);
    expect(result.forecast).toBeNull();
    expect(result.stations).toHaveLength(3);
    expect(
      result.stations.every((station) => station.initialLive === null),
    ).toBe(true);
  });

  it("preserves a real snapshot's timestamp and missing gusts instead of inventing readings", async () => {
    mocks.catalog.mockResolvedValue([
      {
        id: "MAS",
        name: "Marsens",
        source: "meteoswiss",
        lat: 46.65,
        lng: 7.05,
        altitudeM: 700,
        windSpeedKmh: 12,
        windDirection: 180,
        gustsKmh: null,
        updatedAt: "2026-01-01T10:00:00Z",
      },
    ]);
    const result = await loadLocalGuide(LOCAL_GUIDES[0], "it");
    expect(
      result.stations.find((station) => station.id === "MAS")?.initialLive,
    ).toMatchObject({
      source: "station",
      gustsKmh: null,
      windSpeedKmh: 12,
      updatedAt: "2026-01-01T10:00:00Z",
      isFresh: false,
    });
  });

  it("retains French admin content without silently using it as a German translation", async () => {
    mocks.editorial.mockResolvedValue({
      content: "Texte français corrigé dans l’administration.",
      sources: [],
      linkedStationIds: [],
      authorName: "Équipe locale",
      updatedAt: new Date("2026-10-20T10:00:00Z"),
    });
    expect((await loadLocalGuide(LOCAL_GUIDES[0], "fr")).content).toBe(
      "Texte français corrigé dans l’administration.",
    );
    expect((await loadLocalGuide(LOCAL_GUIDES[0], "de")).content).toBe(
      LOCAL_GUIDES[0].translations.de!.content,
    );
  });
});
