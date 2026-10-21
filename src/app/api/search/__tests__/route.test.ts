import { beforeEach, describe, expect, it, vi } from "vitest";
const { getEntries } = vi.hoisted(() => ({ getEntries: vi.fn() }));
vi.mock("@/lib/search-data", () => ({ getSearchEntries: getEntries }));
import { GET } from "../route";
import { guideSearchEntries } from "@/lib/search";
beforeEach(() => {
  vi.clearAllMocks();
  getEntries.mockResolvedValue({
    entries: guideSearchEntries("fr"),
    partial: false,
  });
});
describe("public search API", () => {
  it("bounds inputs before loading the index", async () => {
    for (const query of [`q=${"x".repeat(81)}`, "type=private-user"])
      expect(
        (await GET(new Request(`https://www.openwind.ch/api/search?${query}`)))
          .status,
      ).toBe(400);
    expect(getEntries).not.toHaveBeenCalled();
  });
  it("returns only the chosen kind and prevents indexing search responses", async () => {
    const response = await GET(
      new Request(
        "https://www.openwind.ch/api/search?q=leman&type=lake&locale=fr",
      ),
    );
    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].kind).toBe("lake");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, follow");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");
  });
  it("never shares cached favourite responses or degraded results", async () => {
    const response = await GET(
      new Request("https://www.openwind.ch/api/search?favorites=station:NEU"),
    );
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    getEntries.mockResolvedValue({
      entries: guideSearchEntries("fr"),
      partial: true,
    });
    const degraded = await GET(
      new Request("https://www.openwind.ch/api/search?q=leman"),
    );
    expect((await degraded.json()).partial).toBe(true);
    expect(degraded.headers.get("Cache-Control")).toBe("private, no-store");
  });
});
