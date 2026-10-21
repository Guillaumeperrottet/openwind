"use client";

import { useLocale } from "next-intl";
import { toSiteLocale } from "@/lib/site";

export default function PageLoading() {
  const label = {
    fr: "Chargement…",
    de: "Wird geladen…",
    it: "Caricamento…",
    en: "Loading…",
  }[toSiteLocale(useLocale())];
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60dvh] bg-[#f8faf9] px-5 py-16 sm:px-8"
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="mx-auto max-w-7xl motion-safe:animate-pulse"
      >
        <div className="h-3 w-56 rounded bg-slate-200" />
        <div className="mt-8 h-14 w-3/4 max-w-xl rounded-xl bg-slate-200" />
        <div className="mt-3 h-14 w-2/3 max-w-lg rounded-xl bg-slate-200" />
        <div className="mt-8 h-20 max-w-xl rounded-2xl bg-white" />
      </div>
    </div>
  );
}
