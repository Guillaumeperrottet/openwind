import { jsonLd, WEBSITE_ID, ORGANIZATION_ID } from "@/lib/public-seo";
import type { Metadata } from "next";
import Image from "next/image";
import { ChevronRight, BookOpen, MessagesSquare, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EXPLORER_COPY, explorerPlaces } from "@/lib/explorer";
import { DEFAULT_OG_IMAGE, HOME_SEO, localizedAlternates, localizedUrl, toSiteLocale } from "@/lib/site";
import { isGuideLocale } from "@/lib/local-guides";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { PlaceActions } from "@/components/navigation/PlaceActions";
import { PLACE_COPY } from "@/lib/place";

import { AccessPageHeader } from "@/components/ui/AccessPageHeader";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale), c = EXPLORER_COPY[locale];
  return { title: c.title, description: c.intro, alternates: localizedAlternates(locale, "/explorer"), openGraph: { title: c.title, description: c.intro, siteName: "Openwind", type: "website", locale: HOME_SEO[locale].openGraphLocale, images: [DEFAULT_OG_IMAGE], url: localizedUrl(locale, "/explorer") }, twitter: { card: "summary_large_image", title: c.title, description: c.intro, images: [DEFAULT_OG_IMAGE] } };
}

export default async function ExplorerPage({ params }: Props) {
  const locale = toSiteLocale((await params).locale), c = EXPLORER_COPY[locale];
  const places = explorerPlaces(locale), featured = places[0];
  const guideLocale = isGuideLocale(locale) ? locale : "fr";
  return <div className="ow-explorer">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "CollectionPage", url: localizedUrl(locale, "/explorer"), name: c.title, description: c.intro, inLanguage: locale, isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORGANIZATION_ID } }) }} />
    <AccessPageHeader title={c.title} description={c.intro} />
    <section className="ow-explorer-search" aria-label={PLACE_COPY[locale].search}><GlobalSearch variant="explorer" /><p>{PLACE_COPY[locale].searchHelp}</p></section>
    <PlaceActions id="explorer-conditions" />
    <nav className="ow-explorer-index" aria-label={c.sections}><a href="#explorer-places">{c.placesShort}</a><a href="#explorer-conditions">{c.conditionsShort}</a><a href="#explorer-learn">{c.learnShort}</a></nav>
    <section aria-labelledby="explorer-places">
      <div className="ow-explorer-section-head"><h2 id="explorer-places">{c.places}</h2><Link href="/vent-en-direct" locale={guideLocale}>{c.allGuides}{locale === "en" && <span className="ow-explorer-language">{c.french}</span>}</Link></div>
      <div className="ow-explorer-places">
        {featured && <Link href={`/vent-en-direct/${featured.slug}`} locale={featured.language} className="ow-explorer-feature" prefetch={false}>
          <div className="ow-explorer-photo"><Image src={featured.image} alt="" fill sizes="(min-width: 800px) 540px, 100vw" priority /></div>
          <div className="ow-explorer-feature-text"><h3>{c.gruyere}</h3><p>{c.gruyereWind}</p><span className="ow-explorer-destination">{PLACE_COPY[locale].guide}</span>{locale === "en" && <span className="ow-explorer-language">{c.french}</span>}<ChevronRight aria-hidden size={20} /></div>
        </Link>}
        <ul className="ow-explorer-place-list">{places.slice(1).map((p) => <li key={p.slug}><Link href={`/vent-en-direct/${p.slug}`} locale={p.language} prefetch={false}><div><h3>{p.name}</h3><p>{p.region}</p><span>{PLACE_COPY[locale].guide}{p.language !== locale ? ` (${c.french})` : ""}</span></div><ChevronRight aria-hidden size={20} /></Link></li>)}</ul>
      </div>
    </section>
    <div className="ow-explorer-sections">
      <section aria-labelledby="explorer-learn"><h2 id="explorer-learn">{c.learn}</h2><ul className="ow-explorer-actions">
        <li><Link href="/carnet" locale="fr" prefetch={false}><BookOpen aria-hidden /><div><h3>{c.carnet}{locale !== "fr" && <span className="ow-explorer-language">{c.french}</span>}</h3><p>{c.carnetDetail}</p></div><ChevronRight aria-hidden size={20} /></Link></li>
        <li><Link href="/forum" prefetch={false}><MessagesSquare aria-hidden /><div><h3>{c.forum}</h3><p>{c.forumDetail}</p></div><ChevronRight aria-hidden size={20} /></Link></li>
      </ul></section>
    </div>
    <aside className="ow-explorer-contribute"><Link href="/spots/new" prefetch={false}><Plus aria-hidden /><div><h2>{c.contribute}</h2><p>{c.contributeDetail}</p></div><ChevronRight aria-hidden size={20} /></Link></aside>
    <Link href="/about" className="ow-explorer-about">{c.about}</Link>
  </div>;
}
