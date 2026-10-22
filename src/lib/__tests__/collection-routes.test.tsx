import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import GuidesPage, {
  generateMetadata as guideMetadata,
} from "@/app/[locale]/vent-en-direct/page";
import CarnetPage, {
  generateMetadata as carnetMetadata,
} from "@/app/[locale]/carnet/page";
import sitemap from "@/app/sitemap";
import { GUIDE_LOCALES, LOCAL_GUIDES } from "../local-guides";
vi.mock("server-only", () => ({}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    locale = "fr",
    ...props
  }: ComponentProps<"a"> & { locale?: string }) => (
    <a {...props} href={`/${locale}${props.href}`} />
  ),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  permanentRedirect: () => {
    throw new Error("REDIRECT");
  },
}));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      findMany: async () => [
        {
          id: "published",
          kind: "EDITORIAL",
          slug: "vent",
          title: "Comprendre le vent",
          excerpt: "Les vents locaux",
          coverImage: null,
          coverAlt: null,
          category: "Météo",
          location: null,
          readTime: 4,
          publishedAt: new Date("2026-10-01"),
          createdAt: new Date("2026-10-01"),
          updatedAt: new Date("2026-10-01"),
        },
      ],
    },
    spot: { findMany: async () => [] },
    forumCategory: { findMany: async () => [] },
    forumTopic: { findMany: async () => [] },
  },
}));
vi.mock("@/lib/station-catalog", () => ({ getStationCatalog: async () => [] }));

function schema(html: string) {
  return JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1],
  );
}

describe("crawlable collection routes", () => {
  it.each(GUIDE_LOCALES)(
    "exposes all 23 guides across linked server pages in %s",
    async (locale) => {
      const seen: string[] = [];
      for (let page = 1; page <= 4; page++) {
        const props = {
          params: Promise.resolve({ locale }),
          searchParams: Promise.resolve({ page: String(page) }),
        };
        const html = renderToStaticMarkup(await GuidesPage(props));
        const items = schema(html).mainEntity.itemListElement;
        seen.push(...items.map((item: { url: string }) => item.url));
        expect(items).toHaveLength(page === 4 ? 5 : 6);
        expect(items[0].position).toBe((page - 1) * 6 + 1);
        const metadata = await guideMetadata(props);
        expect(metadata.alternates?.canonical).toBe(
          `https://www.openwind.ch/${locale}/vent-en-direct${page > 1 ? `?page=${page}` : ""}`,
        );
        expect(metadata.robots).toEqual({ index: true, follow: true });
        expect(html).toContain('aria-current="page"');
        if (page < 4)
          expect(html).toContain(`?page=${page + 1}#collection-results`);
      }
      expect(new Set(seen).size).toBe(LOCAL_GUIDES.length);
      for (const guide of LOCAL_GUIDES)
        expect(seen).toContain(
          `https://www.openwind.ch/${locale}/vent-en-direct/${guide.slug}`,
        );
    },
  );
  it("serves search results in HTML with noindex, follow and real empty states", async () => {
    const props = {
      params: Promise.resolve({ locale: "de" }),
      searchParams: Promise.resolve({ q: "Aegerisee" }),
    };
    const html = renderToStaticMarkup(await GuidesPage(props));
    expect(schema(html).mainEntity.itemListElement).toHaveLength(1);
    expect(html).toContain("/vent-en-direct/lac-d-aegeri");
    expect((await guideMetadata(props)).robots).toEqual({
      index: false,
      follow: true,
    });
    const empty = renderToStaticMarkup(
      await GuidesPage({
        ...props,
        searchParams: Promise.resolve({ q: "zzzzzz" }),
      }),
    );
    expect(empty).toContain("Keine Guides gefunden");
    expect(schema(empty).mainEntity.itemListElement).toHaveLength(0);
    await expect(
      GuidesPage({ ...props, searchParams: Promise.resolve({ page: "5" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
  it("includes the registry in the Carnet with paginated schema and filtered results", async () => {
    const params = Promise.resolve({ locale: "fr" });
    const props = { params, searchParams: Promise.resolve({ page: "2" }) };
    const html = renderToStaticMarkup(await CarnetPage(props));
    expect(schema(html)["@graph"][0].mainEntity.itemListElement).toHaveLength(
      9,
    );
    expect(
      schema(html)["@graph"][0].mainEntity.itemListElement[0].position,
    ).toBe(10);
    expect((await carnetMetadata(props)).alternates?.canonical).toBe(
      "https://www.openwind.ch/fr/carnet?page=2",
    );
    const search = {
      params,
      searchParams: Promise.resolve({ q: "Sarnersee", kind: "guides" }),
    };
    const filtered = renderToStaticMarkup(await CarnetPage(search));
    expect(
      schema(filtered)["@graph"][0].mainEntity.itemListElement,
    ).toHaveLength(1);
    expect(filtered).toContain("/vent-en-direct/lac-de-sarnen");
    expect((await carnetMetadata(search)).robots).toEqual({
      index: false,
      follow: true,
    });
    await expect(
      CarnetPage({ params, searchParams: Promise.resolve({ page: "4" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
  it("lists paginated collection URLs and all translated guides without duplicates or search variants", async () => {
    const urls = await sitemap();
    const paths = urls.map((entry) => entry.url);
    expect(new Set(paths).size).toBe(paths.length);
    for (const locale of GUIDE_LOCALES) {
      for (let page = 1; page <= 4; page++)
        expect(paths).toContain(
          `https://www.openwind.ch/${locale}/vent-en-direct${page > 1 ? `?page=${page}` : ""}`,
        );
      for (const guide of LOCAL_GUIDES)
        expect(paths).toContain(
          `https://www.openwind.ch/${locale}/vent-en-direct/${guide.slug}`,
        );
    }
    expect(paths).toContain("https://www.openwind.ch/fr/carnet?page=3");
    expect(
      paths.some((path) => path.includes("q=") || path.includes("kind=")),
    ).toBe(false);
  });
});
