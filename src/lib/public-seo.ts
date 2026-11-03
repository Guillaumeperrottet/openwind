import { ACCESS_COPY } from "./access";
import { PRIMARY_NAVIGATION } from "./navigation";
import { HOME_SEO, SITE_URL, SITE_LOCALES, localizedUrl, type SiteLocale } from "./site";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Escape even public/user-authored text before placing JSON inside a script. */
export function jsonLd(data: unknown) { return JSON.stringify(data).replace(/</g, "\\u003c"); }

export function publicSiteSchema(locale: SiteLocale) {
  const c = ACCESS_COPY[locale];
  const names = { map: c.map, explore: c.explorer, plan: c.plan, personal: c.personal };
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": ORGANIZATION_ID, name: "Openwind", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo_noback.png` } },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: "Openwind", url: SITE_URL, description: HOME_SEO[locale].description, inLanguage: [...SITE_LOCALES], publisher: { "@id": ORGANIZATION_ID } },
    ...PRIMARY_NAVIGATION.map(item => ({ "@type": "SiteNavigationElement", name: names[item.id], url: localizedUrl(locale, item.href === "/?view=map" ? "?view=map" : item.href) })),
  ] };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return { "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) };
}
