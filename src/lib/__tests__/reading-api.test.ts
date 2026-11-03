import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ catalogue: vi.fn() }));
vi.mock("@/lib/carnet-data", () => ({ getCarnetPublications: mocks.catalogue }));
import { GET } from "@/app/api/carnet/reading/route";
const request = (query: string) => GET(new Request(`https://www.openwind.ch/api/carnet/reading?${query}`));
beforeEach(() => { vi.clearAllMocks(); mocks.catalogue.mockResolvedValue([{ kind: "EDITORIAL", href: "/carnet/un-article", title: "Un article actualisé", readTime: 5, content: "Private extra property", authorEmail: "not-returned" }]); });
describe("public reading metadata endpoint", () => {
  it.each(["entries=", "entries=EDITORIAL:../private", "entries=DRAFT:secret", `entries=${Array.from({ length: 25 }, (_, i) => `EDITORIAL:article-${i}`).join(",")}`])("validates scopes before loading the catalogue (%s)", async (query) => {
    expect((await request(query)).status).toBe(400); expect(mocks.catalogue).not.toHaveBeenCalled();
  });
  it("returns only the requested public metadata, with unavailable entries omitted", async () => {
    const response = await request("entries=EDITORIAL:un-article,EDITORIAL:removed&locale=de");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ articles: [{ kind: "EDITORIAL", slug: "un-article", title: "Un article actualisé", readTime: 5, href: "/carnet/un-article", locale: "fr" }] });
  });
  it("returns a controlled error without database details when the catalogue fails", async () => {
    mocks.catalogue.mockRejectedValue(new Error("database details"));
    const response = await request("entries=EDITORIAL:un-article"); expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: "CATALOGUE_UNAVAILABLE" });
  });
});
