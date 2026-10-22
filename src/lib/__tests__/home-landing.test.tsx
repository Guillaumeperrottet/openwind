import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    locale,
    prefetch: _prefetch,
    ...props
  }: ComponentProps<"a"> & { locale?: string; prefetch?: boolean }) => {
    void _prefetch;
    return <a {...props} href={`/${locale ?? "fr"}${props.href}`} />;
  },
}));
vi.mock("@/components/search/GlobalSearch", () => ({
  GlobalSearch: () => <input aria-label="Global search" />,
}));
import { HomeLanding } from "@/components/home/HomeLanding";
import { getHomeGuides } from "@/lib/local-guides";
import { HOME_GUIDE_COUNT } from "@/lib/collections";

describe("server-rendered discovery home", () => {
  it.each(["fr", "de", "it", "en"])(
    "exposes guides and a direct map link in %s without browser interaction",
    (locale) => {
      const html = renderToStaticMarkup(
        <HomeLanding locale={locale} articles={[]} />,
      );
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
      const guides = getHomeGuides(
        locale === "de" || locale === "it" ? locale : "fr",
      );
      for (const guide of guides.slice(0, HOME_GUIDE_COUNT))
        expect(html).toContain(
          `/${locale === "en" ? "fr" : locale}/vent-en-direct/${guide.slug}`,
        );
      expect(html).not.toContain(
        `/vent-en-direct/${guides[HOME_GUIDE_COUNT].slug}`,
      );
      expect(html).toContain(
        `href="/${locale === "en" ? "fr" : locale}/vent-en-direct"`,
      );
      expect(html.match(/<article /g)).toHaveLength(HOME_GUIDE_COUNT);
      expect(html).toContain("23");
      expect(html).toContain("?view=map");
      expect(html).toContain("Global search");
      expect(html).toContain("Giles Laurent");
      expect(html).toContain("Thomas Woodtli");
      expect(html).not.toContain("maplibregl");
    },
  );
});
