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

describe("server-rendered discovery home", () => {
  it.each(["fr", "de", "it", "en"])(
    "exposes guides and a direct map link in %s without browser interaction",
    (locale) => {
      const html = renderToStaticMarkup(
        <HomeLanding locale={locale} articles={[]} />,
      );
      expect(html.match(/<h1[ >]/g)).toHaveLength(1);
      for (const slug of ["lac-de-la-gruyere", "lac-de-neuchatel", "lac-leman"])
        expect(html).toContain(`/vent-en-direct/${slug}`);
      expect(html).toContain("?view=map");
      expect(html).toContain("Global search");
      expect(html).toContain("Giles Laurent");
      expect(html).toContain("Thomas Woodtli");
      expect(html).not.toContain("maplibregl");
    },
  );
});
