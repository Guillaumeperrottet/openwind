import { describe, expect, it, vi } from "vitest";
import { windProtocolHandler } from "../windProtocol";

describe("MapLibre wind protocol", () => {
  it("preserves the tile bytes and cache metadata", async () => {
    const response = { data: new ArrayBuffer(4), cacheControl: "max-age=60" };
    await expect(windProtocolHandler(async () => response)({ url: "om://tile" }, new AbortController())).resolves.toEqual(response);
  });
  it("cancels an obsolete tile without aborting the shared range read", async () => {
    const controller = new AbortController();
    const read = vi.fn(async (_params: {url:string}, shared: AbortController) => {
      controller.abort(); expect(shared.signal.aborted).toBe(false);
      return { data: new ArrayBuffer(0) };
    });
    await expect(windProtocolHandler(read)({ url: "om://tile" }, controller)).rejects.toMatchObject({ name: "AbortError" });
    expect(read).toHaveBeenCalledOnce();
  });
  it("does not return a null payload or hide a genuine reader failure", async () => {
    await expect(windProtocolHandler(async () => ({ data: null }))({ url: "om://tile" }, new AbortController())).rejects.toMatchObject({ name: "AbortError" });
    const error = new Error("Reader unavailable");
    await expect(windProtocolHandler(async () => { throw error; })({ url: "om://tile" }, new AbortController())).rejects.toBe(error);
    const read = vi.fn(); const controller = new AbortController(); controller.abort();
    await expect(windProtocolHandler(read)({ url: "om://tile" }, controller)).rejects.toMatchObject({ name: "AbortError" });
    expect(read).not.toHaveBeenCalled();
  });
});
