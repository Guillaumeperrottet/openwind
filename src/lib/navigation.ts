import { resolveHomeView } from "./home-view";
import type { SiteLocale } from "./site";

export const PRIMARY_NAVIGATION = [
  { id: "map", href: "/?view=map", label: "map" },
  { id: "explore", href: "/explorer", label: "explore" },
  { id: "plan", href: "/plan", label: "plan" },
  { id: "personal", href: "/mon-openwind", label: "myOpenwind" },
] as const;
export type NavigationSection = (typeof PRIMARY_NAVIGATION)[number]["id"];

export function navigationSection(pathname: string, view?: string | null, preference?: { onboardingCompleted: boolean; defaultView: string } | null): NavigationSection | null {
  if (pathname === "/") {
    const home = resolveHomeView(view ?? undefined, preference);
    return home === "map" ? "map" : home === "dashboard" ? "personal" : "explore";
  }
  const within = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  if (within("/plan")) return "plan";
  if (within("/mon-openwind")) return "personal";
  if (pathname === "/spots/new") return "explore";
  if (within("/spots")) return "map";
  if (["/explorer", "/recherche", "/temperatures", "/lacs", "/vent-en-direct", "/balises", "/stations", "/webcams", "/carnet", "/forum", "/about"].some(within)) return "explore";
  return null;
}

export const NAVIGATION_COPY: Record<SiteLocale, { explore: string; primary: string; account: string; closeSearch: string }> = {
  fr: { explore: "Explorer", primary: "Navigation principale", account: "Compte et préférences", closeSearch: "Fermer la recherche" },
  en: { explore: "Explore", primary: "Main navigation", account: "Account and preferences", closeSearch: "Close search" },
  de: { explore: "Entdecken", primary: "Hauptnavigation", account: "Konto und Einstellungen", closeSearch: "Suche schließen" },
  it: { explore: "Esplora", primary: "Navigazione principale", account: "Account e preferenze", closeSearch: "Chiudi la ricerca" },
};
