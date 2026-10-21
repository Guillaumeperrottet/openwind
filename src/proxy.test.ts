import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/middleware", () => ({
  default: () => () =>
    NextResponse.next({
      headers: {
        link: "an automatic hreflang header",
        "x-next-intl-locale": "de",
      },
    }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));
import { proxy } from "./proxy";

describe("language redirects before streaming", () => {
  it.each(["/en/vent-en-direct", "/en/vent-en-direct/lac-de-la-gruyere"])(
    "returns a real permanent redirect for %s",
    async (path) => {
      const response = await proxy(
        new NextRequest(`https://www.openwind.ch${path}?from=guide`),
      );
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(
        `https://www.openwind.ch${path.replace("/en/", "/fr/")}?from=guide`,
      );
    },
  );

  it.each(["de", "it"])(
    "keeps the available %s guide and its explicit language metadata",
    async (locale) => {
      const response = await proxy(
        new NextRequest(
          `https://www.openwind.ch/${locale}/vent-en-direct/lac-de-la-gruyere`,
        ),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("link")).toBeNull();
    },
  );

  it("preserves the existing French-only Carnet redirect", async () => {
    const response = await proxy(
      new NextRequest("https://www.openwind.ch/de/carnet/comprendre-la-bise"),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.openwind.ch/fr/carnet/comprendre-la-bise",
    );
  });
});
