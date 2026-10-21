import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WindStation } from "@/lib/stations";
import { directoryPagePath, parseDirectoryQuery } from "@/lib/stationDirectory";

const mocks = vi.hoisted(() => ({ catalog: vi.fn() }));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: mocks.catalog }));
vi.mock("next-intl", () => ({
  useLocale: () => "fr",
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/i18n/navigation", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));
vi.mock("@/lib/FavContext", () => ({
  useFavContext: () => ({
    favoriteStationIds: new Set(),
    toggleStationFavorite: vi.fn(),
  }),
}));
import DirectoryPage, { generateMetadata } from "../page";

const stations: WindStation[] = Array.from({ length: 100 }, (_, index) => ({
  id: `station-${index}`,
  name: `Station ${String(index).padStart(3, "0")}`,
  lat: 46.6,
  lng: 7.1,
  altitudeM: 600,
  windSpeedKmh: index,
  gustsKmh: null,
  windDirection: 180,
  updatedAt: "2026-08-01T10:00:00Z",
  source: "meteoswiss",
}));

beforeEach(() => mocks.catalog.mockResolvedValue(stations));

describe("crawlable station directory", () => {
  it("renders the second page and its adjacent HTML links without clicking a button", async () => {
    const html = renderToStaticMarkup(
      await DirectoryPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ page: "2" }),
      }),
    );
    expect(html).toContain('href="/stations/station-48"');
    expect(html).not.toContain('href="/stations/station-0"');
    expect(html).not.toContain('href="/stations/station-96"');
    expect(html).toContain('href="/balises" rel="prev"');
    expect(html).toContain('href="/balises?page=3" rel="next"');
  });

  it("gives numbered pages self canonicals and keeps search filters out of the index", async () => {
    const params = Promise.resolve({ locale: "de" });
    const metadata = await generateMetadata({
      params,
      searchParams: Promise.resolve({ page: "2" }),
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://www.openwind.ch/de/balises?page=2",
    );
    expect(metadata.alternates?.languages?.it).toBe(
      "https://www.openwind.ch/it/balises?page=2",
    );
    const filtered = await generateMetadata({
      params,
      searchParams: Promise.resolve({ q: "Marsens", sort: "wind" }),
    });
    expect(filtered.robots).toEqual({ index: false, follow: true });
    expect(filtered.alternates?.canonical).toBe(
      "https://www.openwind.ch/de/balises",
    );
  });

  it("preserves filters in pagination URLs and normalizes invalid page numbers", () => {
    const query = parseDirectoryQuery({
      q: "  Morlon Beach ",
      network: "windball",
      sort: "wind",
      page: "NaN",
    });
    expect(query.page).toBe(1);
    expect(directoryPagePath(query, 2)).toBe(
      "/balises?page=2&q=Morlon+Beach&network=windball&sort=wind",
    );
    expect(
      parseDirectoryQuery({
        network: "__proto__",
        page: "9999999999999999999",
      }),
    ).toMatchObject({ source: "all", page: 1 });
  });

  it("does not serve duplicate empty pages beyond the end of the directory", async () => {
    await expect(
      DirectoryPage({
        params: Promise.resolve({ locale: "fr" }),
        searchParams: Promise.resolve({ page: "4" }),
      }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
