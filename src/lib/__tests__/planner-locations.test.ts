import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/plan/locations/route";
afterEach(() => vi.unstubAllGlobals());
describe("planner city lookup", () => {
  it("does not contact the provider for unbounded or short input", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(
      (
        await GET(
          new NextRequest("https://www.openwind.ch/api/plan/locations?q=L"),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await GET(
          new NextRequest(
            `https://www.openwind.ch/api/plan/locations?q=${"x".repeat(121)}`,
          ),
        )
      ).status,
    ).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses a fixed provider, requested language and valid coordinates only", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        results: [
          {
            id: 1,
            name: "Lausanne",
            admin1: "Vaud",
            country: "Suisse",
            latitude: 46.52,
            longitude: 6.63,
          },
          { name: "Bad", latitude: 200, longitude: 0 },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    const body = await (
      await GET(
        new NextRequest(
          "https://www.openwind.ch/api/plan/locations?q=Lausanne&locale=it",
        ),
      )
    ).json();
    expect(body.locations).toEqual([
      { id: 1, name: "Lausanne, Vaud, Suisse", lat: 46.52, lng: 6.63 },
    ]);
    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.hostname).toBe("geocoding-api.open-meteo.com");
    expect(url.searchParams.get("language")).toBe("it");
  });
  it("distinguishes an empty lookup from a provider failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({})));
    const request = new NextRequest(
      "https://www.openwind.ch/api/plan/locations?q=Unknown",
    );
    expect(await (await GET(request)).json()).toEqual({ locations: [] });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect((await GET(request)).status).toBe(503);
  });
});
