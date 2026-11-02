import { describe, expect, it } from "vitest";
import { MAX_SAVED_SEARCHES, mergeSavedSearches, parseSavedSearches, resolveSavedSearch, savedSearchIdentity, searchParams, type SavedSearch } from "@/lib/saved-searches";
import { parsePlannerCriteria } from "@/lib/planner";

const search: SavedSearch = { id: "sample", title: "Lausanne", place: "Lausanne", period: "fixed", criteria: { startDate: "2026-10-22", endDate: "2026-10-24", sport: "PARAGLIDE", radius: 250, lat: 46.52, lng: 6.63 } };
describe("saved searches that preserve the user's actual criteria", () => {
  it("round-trips expired dates without discarding the search", () => {
    expect(parseSavedSearches(JSON.stringify([search]))).toEqual([search]);
    expect(resolveSavedSearch(search, "2026-11-02")).toBeNull();
  });
  it("moves an expired range only after an explicit request, keeping duration, place and sport", () => {
    const moved = resolveSavedSearch(search, "2026-11-02", true)!;
    expect(moved).toEqual({ ...search.criteria, startDate: "2026-11-02", endDate: "2026-11-04" });
    const params = searchParams(moved, search.place);
    expect(params.get("place")).toBe("Lausanne");
    expect(parsePlannerCriteria(params, "2026-11-02")).toEqual(moved);
  });
  it("recalculates a rolling weekend at opening, including a Sunday", () => {
    const rolling = { ...search, period: "weekend" as const };
    expect(resolveSavedSearch(rolling, "2026-11-02")).toEqual({ ...search.criteria, startDate: "2026-11-07", endDate: "2026-11-08" });
    expect(resolveSavedSearch(rolling, "2026-11-08")?.startDate).toBe("2026-11-08");
    expect(resolveSavedSearch(rolling, "2026-11-08")?.endDate).toBe("2026-11-08");
  });
  it("does not change valid fixed dates or silently exceed the planning horizon", () => {
    expect(resolveSavedSearch(search, "2026-10-20")).toEqual(search.criteria);
    expect(resolveSavedSearch(search, "2026-01-01")).toBeNull();
  });
  it("keeps date arithmetic correct across daylight saving time", () => {
    const moved = resolveSavedSearch({ ...search, criteria: { ...search.criteria, startDate: "2026-03-28", endDate: "2026-03-30" } }, "2026-11-02", true);
    expect(moved?.endDate).toBe("2026-11-04");
  });
  it("rejects corrupt entries, invalid coordinates, impossible dates and unsafe identifiers", () => {
    expect(parseSavedSearches("{broken")).toEqual([]);
    expect(parseSavedSearches(JSON.stringify([
      { ...search, id: "https://other.test" },
      { ...search, criteria: { ...search.criteria, lat: 200 } },
      { ...search, criteria: { ...search.criteria, startDate: "2026-02-30" } },
      { ...search, criteria: { ...search.criteria, endDate: "2027-10-01" } },
      search,
    ]))).toEqual([search]);
  });
  it("bounds and deduplicates stored entries", () => {
    const values = Array.from({ length: 20 }, (_, i) => ({ ...search, id: `id-${i}` }));
    expect(parseSavedSearches(JSON.stringify([search, search, ...values]))).toHaveLength(MAX_SAVED_SEARCHES);
  });
  it("merges guest searches without replacing account searches or losing overflow", () => {
    const account = Array.from({ length: 7 }, (_, i) => ({ ...search, id: `id-${i}`, criteria: { ...search.criteria, radius: 100 + i } }));
    const duplicate = { ...account[0], id: "guest-duplicate", title: "Another name" };
    const extra = { ...search, id: "extra", criteria: { ...search.criteria, radius: 800 } };
    const { merged, remaining } = mergeSavedSearches(account, [duplicate, search, extra]);
    expect(merged.slice(0, 7)).toEqual(account);
    expect(merged).toHaveLength(8);
    expect(remaining).toEqual([extra]);
  });
  it("distinguishes fixed dates from a rolling weekend but deduplicates equivalent rolling searches", () => {
    const rolling = { ...search, period: "weekend" as const };
    expect(savedSearchIdentity(rolling)).not.toBe(savedSearchIdentity(search));
    expect(savedSearchIdentity(rolling)).toBe(savedSearchIdentity({ ...rolling, criteria: { ...search.criteria, startDate: "2026-12-05", endDate: "2026-12-06" } }));
  });
});
