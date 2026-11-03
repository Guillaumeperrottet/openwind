import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LOCAL_GUIDES, isGuideLocale } from "@/lib/local-guides";
import { ACCESS_COPY } from "@/lib/access";
import { normalizeSearch } from "@/lib/search";
import type { SiteLocale } from "@/lib/site";
import { AccessPageHeader } from "./AccessPageHeader";

export function WebcamDirectory({ locale, query }: { locale: SiteLocale; query: string }) {
  const c = ACCESS_COPY[locale], language = isGuideLocale(locale) ? locale : "fr";
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  const places = LOCAL_GUIDES.filter(g => words.every(word => normalizeSearch([g.region, ...(g.aliases ?? []), ...Object.values(g.translations).map(t => t?.place)].join(" ")).includes(word)));
  const directory = `/${locale}/webcams${query ? `?${new URLSearchParams({ q: query })}` : ""}`;
  return <div className="ow-access-content"><AccessPageHeader title={c.webcams} description={c.choose} />
    <form action={`/${locale}/webcams`} method="get" className="ow-access-search"><label>{c.searchPlaces}<input type="search" name="q" defaultValue={query} maxLength={100} /></label><button className="ow-primary" type="submit">{c.search}</button></form>
    <ul className="ow-access-list">{places.map(g => {
      const name = (g.translations[language] ?? g.translations.fr).place;
      const href = `/webcams?${new URLSearchParams({ lat: String(g.coordinates.lat), lng: String(g.coordinates.lng), name, back: directory })}`;
      return <li key={g.slug}><Link href={href} prefetch={false}><div><h2>{name}</h2><p>{g.region}</p></div><ChevronRight aria-hidden size={20} /></Link></li>;
    })}</ul>
    {places.length === 0 && <p className="ow-access-note" role="status">{c.empty}</p>}
    <Link href="/?view=map&openSearch=1" className="ow-access-link" prefetch={false}>{c.mapSearch}</Link>
  </div>;
}
