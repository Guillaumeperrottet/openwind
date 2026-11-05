import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";
beforeEach(() => { vi.stubEnv("WINDY_WEBCAMS_API_KEY", "test"); vi.stubGlobal("fetch", vi.fn()); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("webcam proxy", () => {
  it.each(["lat=46bad&lng=7", "lat=46&lng=Infinity", "lat=46&lng=7&radius=15junk", "lat=46&lng=7&radius=15.5", "lat=91&lng=7", "lat=%20&lng=7"])("rejects invalid coordinates and radius %s", async query => {
    expect((await GET(new Request(`https://openwind.ch/api/webcams?${query}`))).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["failed", "malformed", "offline"])("distinguishes %s provider responses from a genuinely empty gallery", async mode => {
    if (mode === "offline") vi.mocked(fetch).mockRejectedValue(new Error("network"));
    else vi.mocked(fetch).mockResolvedValue(Response.json(mode === "malformed" ? {} : {}, { status: mode === "failed" ? 429 : 200 }));
    expect((await GET(new Request("https://openwind.ch/api/webcams?lat=46&lng=7"))).status).toBe(502);
  });
  it("passes the place, radius and a cancellation deadline upstream, preserving empty success", async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ webcams: [] }));
    const result = await GET(new Request("https://openwind.ch/api/webcams?lat=46.5&lng=6.5&radius=25"));
    expect(result.status).toBe(200); expect(await result.json()).toEqual({ webcams: [] });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("nearby=46.5,6.5,25"), expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
});
