import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ exchange: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
import { GET } from "../route";
beforeEach(() => { vi.clearAllMocks(); mocks.client.mockResolvedValue({ auth: { exchangeCodeForSession: mocks.exchange } }); mocks.exchange.mockResolvedValue({ error: null }); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}"))); });
afterEach(() => vi.unstubAllGlobals());
describe("auth callback", () => {
  it("cannot redirect outside Openwind after a valid code", async () => {
    const response = await GET(new Request("https://www.openwind.ch/auth/callback?code=x&next=%40evil.test%2F"));
    expect(response.headers.get("location")).toBe("https://www.openwind.ch/");
  });
  it("retains a filtered destination after success", async () => {
    const next = "/de/plan?radius=50#results";
    const response = await GET(new Request(`https://www.openwind.ch/auth/callback?code=x&next=${encodeURIComponent(next)}`));
    expect(response.headers.get("location")).toBe(`https://www.openwind.ch${next}`);
  });
  it.each(["returned", "thrown", "missing"])("provides a recoverable local failure for %s errors", async mode => {
    if (mode === "returned") mocks.exchange.mockResolvedValue({ error: { code: "expired" } });
    if (mode === "thrown") mocks.client.mockRejectedValue(new Error("offline"));
    const response = await GET(new Request(`https://www.openwind.ch/auth/callback?${mode !== "missing" ? "code=x&" : ""}next=%2Ffr%2Fmon-openwind`));
    expect(response.headers.get("location")).toBe("https://www.openwind.ch/fr/mon-openwind?auth_error=1"); expect(fetch).not.toHaveBeenCalled();
  });
});
