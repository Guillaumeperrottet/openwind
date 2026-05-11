import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "de", "it"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];
