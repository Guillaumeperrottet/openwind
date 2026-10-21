"use client";

import { useEffect } from "react";
import type { SiteLocale } from "@/lib/site";

/** The root layout persists when navigating between localized routes. */
export function DocumentLanguage({ locale }: { locale: SiteLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
