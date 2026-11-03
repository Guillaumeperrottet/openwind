import { toSiteLocale } from "./site";
import { withoutLocale } from "./access";

/** Classify the document, without storing a URL, search query or selected coordinates. */
export function vitalsContext(pathname: string, search = "") {
  const path = withoutLocale(pathname), locale = /^\/(fr|en|de|it)(?=\/|$)/.exec(pathname)?.[1];
  if (!locale) return null;
  let page: string | undefined;
  if (path === "/") page = new URLSearchParams(search).get("view") === "map" ? "map" : "home";
  else if (/^\/spots\/(?!new(?:\/|$))[^/]+$/.test(path)) page = "spot";
  else if (/^\/stations\/[^/]+$/.test(path)) page = "station";
  else if (path === "/explorer") page = "explorer";
  else if (path === "/temperatures" || path.startsWith("/lacs/")) page = "water";
  else if (path === "/webcams") page = "webcams";
  else if (path === "/recherche") page = "search";
  else if (path === "/plan") page = "plan";
  else if (path === "/about") page = "about";
  else if (path === "/balises") page = "stations";
  else if (path === "/vent-en-direct" || path.startsWith("/vent-en-direct/")) page = "guide";
  else if (path === "/carnet" || path.startsWith("/carnet/")) page = "journal";
  else if (path === "/forum" || path.startsWith("/forum/")) page = "forum";
  return page ? { page_type: page, page_language: toSiteLocale(locale) } : null;
}

export function vitalPayload(metric: { name: string; id: string; value: number; rating: string }, context: ReturnType<typeof vitalsContext>) {
  if (!context || !["LCP", "INP", "CLS"].includes(metric.name) || !Number.isFinite(metric.value) || metric.value < 0 || !["good", "needs-improvement", "poor"].includes(metric.rating)) return null;
  return { ...context, metric_name: metric.name, metric_id: metric.id, metric_value: Math.round(metric.value * (metric.name === "CLS" ? 10000 : 1)) / (metric.name === "CLS" ? 10000 : 1), metric_rating: metric.rating };
}
