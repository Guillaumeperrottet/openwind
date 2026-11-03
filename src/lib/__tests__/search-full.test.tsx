import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appSearchEntries, rankSearchEntries, searchEntries, type SearchEntry } from "../search";
import SearchPage, { generateMetadata } from "@/app/[locale]/recherche/page";
const mocks = vi.hoisted(() => ({ entries: vi.fn() }));
vi.mock("@/lib/search-data", () => ({ getSearchEntries: mocks.entries }));
vi.mock("@/components/navigation/ContextDestination", () => ({ ContextDestination: (props: ComponentProps<"a">) => createElement("a", props) }));
const entries: SearchEntry[] = Array.from({ length: 45 }, (_, i) => ({ id: String(i), kind: "discussion", title: `Vent ${String(i).padStart(2, "0")}`, subtitle: "Forum", terms: "conditions", href: `/fr/forum/vent/${i}` }));
beforeEach(() => mocks.entries.mockResolvedValue({ entries, partial: false }));
describe("complete search beyond suggestions", () => {
  it("retains all matches for the results page while keeping suggestions bounded", () => {
    expect(rankSearchEntries(entries, "vent")).toHaveLength(45);
    expect(searchEntries(entries, "vent", "discussion")).toHaveLength(10);
    expect(rankSearchEntries(appSearchEntries("fr"), "", "page")).toHaveLength(11);
  });
  it.each(["fr", "en", "de", "it"] as const)("provides every public functionality in %s", locale => {
    const all = appSearchEntries(locale);
    for (const path of ["/explorer", "/webcams", "/temperatures", "/plan", "/mon-openwind", "/forum", "/spots/new", "/about"]) expect(all.some(e => e.href === `/${locale}${path}`)).toBe(true);
    expect(all).toHaveLength(11);
  });
  it("paginates all public results, retaining the query and chosen type", async () => {
    const html = renderToStaticMarkup(await SearchPage({ params: Promise.resolve({ locale: "fr" }), searchParams: Promise.resolve({ q: "vent", type: "discussion", page: "2" }) }));
    expect(html).toContain("21–40 / "); expect(html).toContain("45 résultats");
    expect(html).toContain("Vent 20"); expect(html).toContain("Vent 39"); expect(html).not.toContain("Vent 00");
    expect(html).toContain("q=vent&amp;type=discussion&amp;page=3#search-results");
    expect((await generateMetadata({ params: Promise.resolve({ locale: "fr" }), searchParams: Promise.resolve({}) })).robots).toMatchObject({ index: false });
  });
  it("clamps pagination and makes a partial result set explicit", async () => {
    mocks.entries.mockResolvedValue({ entries, partial: true });
    const html = renderToStaticMarkup(await SearchPage({ params: Promise.resolve({ locale: "fr" }), searchParams: Promise.resolve({ q: "vent", page: "9999" }) }));
    expect(html).toContain("41–45 / "); expect(html).toContain("Certains résultats sont momentanément indisponibles");
  });
});
