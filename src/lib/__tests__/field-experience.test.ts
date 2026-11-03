import { afterEach, describe, expect, it, vi } from "vitest";
import { mapSelectionFromStorage, mapViewFromStorage } from "@/lib/map-session";
import { windIsFresh } from "@/lib/useFreshWind";
import { fetchClientJson } from "@/lib/fetch-client-json";

afterEach(() => vi.unstubAllGlobals());

describe("returning to the same map", () => {
  const savedAt = Date.parse("2026-11-02T12:00:00Z");
  const selection = { kind: "station", id: "VEV", lat: 46.46, lng: 6.84, zoom: 11, savedAt };
  it("restores a recent selected station without changing its camera", () => {
    expect(mapSelectionFromStorage(JSON.stringify(selection), savedAt + 60_000)).toEqual({ kind: "station", id: "VEV", center: [6.84, 46.46], zoom: 11 });
    expect(mapViewFromStorage(JSON.stringify({ center: [6.9, 46.5], zoom: 10.5, bearing: 40, pitch: 20 }))).toEqual({ center: [6.9, 46.5], zoom: 10.5, bearing: 40, pitch: 20 });
  });
  it("does not reopen expired, future-dated, invalid or out-of-bounds selections", () => {
    for (const value of [null, "broken", "null", "{}", JSON.stringify({ ...selection, savedAt: savedAt - 7_200_001 }), JSON.stringify({ ...selection, savedAt: savedAt + 1 }), JSON.stringify({ ...selection, lng: 181 }), JSON.stringify({ ...selection, kind: "other" })]) {
      expect(mapSelectionFromStorage(value, savedAt)).toBeNull();
    }
  });
  it("accepts old saved cameras and ignores corrupt cameras", () => {
    expect(mapViewFromStorage('{"center":[8,47],"zoom":8}')).toEqual({ center: [8,47], zoom: 8, bearing: 0, pitch: 0 });
    for (const value of ["null", '{"center":[8,147],"zoom":8}', '{"center":[8,47],"zoom":-1}']) expect(mapViewFromStorage(value)).toBeNull();
  });
});

describe("age of a measurement while a page stays open", () => {
  const deadline = Date.parse("2026-11-02T12:30:00Z");
  const live = { isFresh: true, staleAt: new Date(deadline).toISOString() };
  it("expires at the actual measurement deadline even if a refresh still returns isFresh=true", () => {
    expect(windIsFresh(live, deadline - 1)).toBe(true);
    expect(windIsFresh(live, deadline)).toBe(false);
    expect(windIsFresh({ ...live, isFresh: true }, deadline + 60_000)).toBe(false);
  });
  it("does not rejuvenate a cached model whose API deadline was computed from its retrieval", () => {
    expect(windIsFresh({ ...live, source: "openmeteo", updatedAt: "2026-11-02T09:00:00Z" }, deadline - 1)).toBe(false);
  });
  it("preserves the server snapshot for hydration and rejects invalid deadlines afterwards", () => {
    expect(windIsFresh(live)).toBe(true);
    expect(windIsFresh({ isFresh: true, staleAt: "invalid" }, deadline)).toBe(false);
  });
});

describe("requests on an unreliable connection", () => {
  it("keeps a navigation abort attached until the body has finished", async () => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", vi.fn(async (_url, { signal }: { signal: AbortSignal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true })),
    })));
    const request = fetchClientJson("/api/example", controller.signal);
    await Promise.resolve();
    const result = expect(request).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await result;
  });
  it("bounds the response/body with a timeout", async () => {
    const timeout = new AbortController();
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout.signal);
    try {
      vi.stubGlobal("fetch", vi.fn((_url, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }))));
      const request = fetchClientJson("/api/example");
      const result = expect(request).rejects.toThrow("Timed out");
      timeout.abort(new Error("Timed out"));
      await result;
      expect(timeoutSpy).toHaveBeenCalledWith(12_000);
    } finally { timeoutSpy.mockRestore(); }
  });
  it("turns HTTP errors into retryable failures instead of empty data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    await expect(fetchClientJson("/api/example")).rejects.toThrow("503");
  });
});
