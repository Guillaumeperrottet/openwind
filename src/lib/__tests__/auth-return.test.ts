import { describe, expect, it } from "vitest";
import { authReturnPath } from "../auth-return";
const origin = "https://www.openwind.ch";
describe("authentication return destinations", () => {
  it.each([null, "", "@evil.test/", "https://evil.test/", "//evil.test/", "/\\evil.test/", "/\nevil.test", "/%2f%2fevil.test", "/fr/%5c/evil.test", "/api/users", "/_next/static", "/auth/callback", "/fr/../auth/callback", "x".repeat(3001)])("rejects unsafe destination %j", value => {
    expect(authReturnPath(value, origin)).toBe("/");
  });
  it.each(["/fr/mon-openwind", "/de/admin/articles", "/it/spots/morlon?back=%2Fit%2Fwebcams#history", "/fr/plan?startDate=2026-11-05&sport=KITE", "/?view=map"]) ("preserves authorized internal returns %s", value => {
    expect(authReturnPath(value, origin)).toBe(value);
    expect(new URL(authReturnPath(value, origin), origin).origin).toBe(origin);
  });
});
