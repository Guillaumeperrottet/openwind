import { TEMPERATURE_SEO, temperatureCollectionSchema } from "@/lib/lake-seo";
import { jsonLd } from "@/lib/public-seo";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { WaterCoverageNotice } from "@/components/navigation/PlaceActions";
import { AccessPageHeader } from "@/components/ui/AccessPageHeader";
import { TemperatureDirectoryReading } from "@/components/lake/TemperatureDirectoryReading";
import { getGruyereWaterTemperature } from "@/lib/alplakes";
import { ALPLAKES_GRUYERE } from "@/lib/lake-temperature";
import { lakePageEnabled } from "@/lib/lake-page-enabled";
import { ACCESS_COPY } from "@/lib/access";
import { DEFAULT_OG_IMAGE, HOME_SEO, localizedUrl, localizedAlternates, toSiteLocale } from "@/lib/site";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale), c = TEMPERATURE_SEO[locale];
  return { title: c.title, description: c.description, robots: { index: lakePageEnabled(), follow: true }, alternates: localizedAlternates(locale, "/temperatures"),
    openGraph: { title: c.title, description: c.description, siteName: "Openwind", url: localizedUrl(locale, "/temperatures"), locale: HOME_SEO[locale].openGraphLocale, type: "website", images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title: c.title, description: c.description, images: [DEFAULT_OG_IMAGE] },
  };
}
export default async function TemperaturesPage({ params }: Props) {
  if (!lakePageEnabled()) notFound();
  const locale = toSiteLocale((await params).locale), c = ACCESS_COPY[locale], enabled = lakePageEnabled();
  const series = await getGruyereWaterTemperature();
  return <div className="ow-access-content"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(temperatureCollectionSchema(locale, enabled)) }} /><AccessPageHeader title={c.temperatures} description={c.waterIntro} />
    <WaterCoverageNotice />
    <p className="ow-access-note">{c.waterCoverage}</p>
    <section className="ow-temperature-entry" aria-labelledby="gruyere-temperature"><h2 id="gruyere-temperature">{c.gruyere}</h2><p className="ow-access-note">{c.waterModel}</p>
      <TemperatureDirectoryReading series={series} locale={locale} initialNow={new Date().getTime()} />
      <p className="ow-access-note">{c.waterNote}</p>
      <div className="ow-temperature-source">{enabled ? <Link href="/lacs/gruyere" className="ow-primary" prefetch={false}>{c.waterOpen}</Link> : <a href={ALPLAKES_GRUYERE.page} className="ow-primary" target="_blank" rel="noopener noreferrer">{c.waterSource}</a>}
        <a href={ALPLAKES_GRUYERE.page} className="ow-access-link" target="_blank" rel="noopener noreferrer">Alplakes / Eawag</a><a href={ALPLAKES_GRUYERE.licence} className="ow-access-link" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></div>
    </section>
  </div>;
}
