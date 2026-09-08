import { describe, expect, it, vi } from "vitest";
import { generateMetadata } from "../page";
import { buildSpotDescription, buildSpotTitle } from "@/lib/seo";
import { localizedAlternates, localizedUrl, SITE_URL } from "@/lib/site";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { spot: { findUnique: mocks.findUnique } } }));
vi.mock("@/lib/stationData", () => ({ getSpotLive: vi.fn() }));
vi.mock("../SpotPageClient", () => ({ SpotPageClient: () => null }));

describe("spot page metadata wiring", () => {
  it.each(["fr", "en", "de", "it"])("updates %s search and sharing metadata without changing URLs", async (locale) => {
    const spot = {
      id: "existing-spot-id",
      name: "Morlon beach",
      sportType: "KITE" as const,
      country: "Suisse",
      region: "Fribourg",
      description: "Une fiche modifiable par les membres.",
    };
    mocks.findUnique.mockResolvedValue(spot);
    const metadata = await generateMetadata({ params: Promise.resolve({ id: spot.id, locale }) });
    const title = buildSpotTitle(spot, locale);
    const description = buildSpotDescription(spot, locale);

    expect(mocks.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: spot.id } }));
    expect(metadata).toMatchObject({
      title,
      description,
      alternates: localizedAlternates(locale, `/spots/${spot.id}`),
      openGraph: {
        title: `${title} — Openwind`,
        description,
        url: localizedUrl(locale, `/spots/${spot.id}`),
        images: [{ url: `${SITE_URL}/api/og?id=${spot.id}` }],
      },
      twitter: { title: `${title} — Openwind`, description },
    });
  });
});
