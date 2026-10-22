import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  preference: vi.fn(),
  spots: vi.fn(),
  cache: vi.fn(),
  articles: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.auth } }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userPreference: { findUnique: mocks.preference },
    spot: { findMany: mocks.spots },
    systemConfig: { findUnique: mocks.cache },
    article: { findMany: mocks.articles },
  },
}));
vi.mock("@/components/map/KiteMapLazy", () => ({ KiteMapLazy: () => null }));
vi.mock("@/components/home/HomeLanding", () => ({ HomeLanding: () => null }));
vi.mock("@/components/seo/HomeDiscovery", () => ({
  HomeDiscovery: () => null,
}));
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
import HomePage from "../page";
import { HomeLanding } from "@/components/home/HomeLanding";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ data: { user: null } });
  mocks.preference.mockResolvedValue(null);
  mocks.articles.mockResolvedValue([]);
  mocks.spots.mockResolvedValue([]);
  mocks.cache.mockResolvedValue(null);
});
const props = (view?: string) => ({
  params: Promise.resolve({ locale: "de" }),
  searchParams: Promise.resolve({ view }),
});
describe("home data loading and saved launch views", () => {
  it("does not load map datasets on the public home", async () => {
    expect((await HomePage(props())).type).toBe(HomeLanding);
    expect(mocks.spots).toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, name: true } }),
    );
    expect(mocks.spots.mock.calls[0][0]).not.toHaveProperty("include");
    expect(mocks.cache).not.toHaveBeenCalled();
  });
  it("opens explicit map and home links without applying an account redirect", async () => {
    expect((await HomePage(props("home"))).type).toBe(HomeLanding);
    await HomePage(props("map"));
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.spots).toHaveBeenCalledTimes(2);
  });
  it("retains the map as the root view for an onboarded account that chose MAP", async () => {
    mocks.auth.mockResolvedValue({ data: { user: { id: "user" } } });
    mocks.preference.mockResolvedValue({
      onboardingCompleted: true,
      defaultView: "MAP",
    });
    const result = await HomePage(props());
    expect(result.type).not.toBe(HomeLanding);
    expect(mocks.spots).toHaveBeenCalledTimes(1);
    expect(mocks.articles).not.toHaveBeenCalled();
  });
  it("keeps the dashboard redirect for an onboarded account that chose DASHBOARD", async () => {
    mocks.auth.mockResolvedValue({ data: { user: { id: "user" } } });
    mocks.preference.mockResolvedValue({
      onboardingCompleted: true,
      defaultView: "DASHBOARD",
    });
    await expect(HomePage(props())).rejects.toThrow(
      "redirect:/de/mon-openwind",
    );
    expect(mocks.spots).not.toHaveBeenCalled();
    expect(mocks.articles).not.toHaveBeenCalled();
  });
});
