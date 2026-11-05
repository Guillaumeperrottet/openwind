import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchPasswordRecovery, type RecoveryAuth } from "../auth-recovery";
let callback: (event: string, session: unknown) => void;
const unsubscribe = vi.fn(), update = vi.fn();
const auth = {
  onAuthStateChange: vi.fn((cb: typeof callback) => { callback = cb; return { data: { subscription: { unsubscribe } } }; }),
  getSession: vi.fn<RecoveryAuth["getSession"]>(),
};
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers(); auth.getSession.mockResolvedValue({ error: null }); });
afterEach(() => vi.useRealTimers());
describe("password recovery authorization and bounded waiting", () => {
  it.each(["https://openwind.ch/auth/reset-password", "https://openwind.ch/auth/reset-password?error=expired", "https://openwind.ch/auth/reset-password#access_token=x&type=recovery"]) ("offers renewal without waiting for an absent/invalid link %s", async href => {
    const cleanup = watchPasswordRecovery(auth, href, update); await flush();
    expect(update).toHaveBeenCalledWith("invalid"); expect(auth.onAuthStateChange).not.toHaveBeenCalled(); cleanup();
  });
  it("does not authorize a password change from an existing ordinary session", async () => {
    const cleanup = watchPasswordRecovery(auth, "https://openwind.ch/auth/reset-password?code=x", update);
    callback("INITIAL_SESSION", { user: { id: "existing" } }); callback("SIGNED_IN", { user: { id: "existing" } }); await flush();
    expect(update).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(12_000);
    expect(update).toHaveBeenCalledExactlyOnceWith("invalid"); expect(unsubscribe).toHaveBeenCalled(); cleanup();
  });
  it.each(["?code=x", "#type=recovery&access_token=x&refresh_token=y"])("only enables the form after a verified recovery event %s", async suffix => {
    const cleanup = watchPasswordRecovery(auth, `https://openwind.ch/auth/reset-password${suffix}`, update);
    callback("PASSWORD_RECOVERY", { user: { id: "recovery" } }); await flush(); await vi.advanceTimersByTimeAsync(20_000);
    expect(update).toHaveBeenCalledExactlyOnceWith("ready"); cleanup();
  });
  it("handles exchange errors and ignores late recovery events", async () => {
    auth.getSession.mockResolvedValueOnce({ error: new Error("expired") });
    const cleanup = watchPasswordRecovery(auth, "https://openwind.ch/auth/reset-password?code=x", update);
    await flush(); callback("PASSWORD_RECOVERY", {}); await flush();
    expect(update).toHaveBeenCalledExactlyOnceWith("invalid"); cleanup();
  });
  it("cancels a pending verification on leaving the page", async () => {
    const cleanup = watchPasswordRecovery(auth, "https://openwind.ch/auth/reset-password?code=x", update);
    cleanup(); callback("PASSWORD_RECOVERY", {}); await vi.advanceTimersByTimeAsync(20_000);
    expect(update).not.toHaveBeenCalled(); expect(unsubscribe).toHaveBeenCalled();
  });
});
