"use client";

import { journeyKey, safeReturnPath, type JourneyReturn } from "./access";
import type { SiteLocale } from "./site";

const KEY = "openwind-journeys-v1";
const listeners = new Set<() => void>();
let entries: Record<string, JourneyReturn> | undefined;

function read() {
  if (entries) return entries;
  entries = {};
  if (typeof window === "undefined") return entries;
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || "{}");
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw).slice(-40)) {
        const entry = value as JourneyReturn;
        const destination = safeReturnPath(key, "fr"), source = entry && safeReturnPath(entry.href, "fr");
        if (destination && source && typeof entry.title === "string") entries[journeyKey(destination)] = { href: source, title: entry.title.slice(0, 120) };
      }
    }
  } catch { /* Storage is optional, including in private browsing. */ }
  return entries;
}

export function journeyReturn(href: string): JourneyReturn | null { return read()[journeyKey(href)] ?? null; }
export function subscribeJourney(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }

export function rememberJourney(destination: string, source: JourneyReturn | null, locale: SiteLocale) {
  const to = safeReturnPath(destination, locale), from = source && safeReturnPath(source.href, locale);
  if (!to || (source && !from) || (from && journeyKey(to) === journeyKey(from))) return;
  const next = { ...read() };
  delete next[journeyKey(to)];
  if (source && from) next[journeyKey(to)] = { href: from, title: source.title.replace(/\s+/g, " ").trim().slice(0, 120) };
  entries = Object.fromEntries(Object.entries(next).slice(-40));
  try { sessionStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* In-memory navigation still works. */ }
  listeners.forEach(listener => listener());
}
