import { LAKE_SEO, lakeMetadata, lakeSchema } from "@/lib/lake-seo";
import { jsonLd } from "@/lib/public-seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccessPageHeader } from "@/components/ui/AccessPageHeader";
import { getGruyereWaterTemperature } from "@/lib/alplakes";
import { toSiteLocale } from "@/lib/site";
import { LAKE_PAGE_COPY } from "@/lib/lake-page-copy";
import { LakeTemperatureExplorer } from "@/components/lake/LakeTemperatureExplorer";
import { lakePageEnabled } from "@/lib/lake-page-enabled";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);
  return lakeMetadata(locale, lakePageEnabled());
}

export default async function GruyereLakePage({ params }: Props) {
  // The same switch controls indexing, the sitemap and internal links.
  if (!lakePageEnabled()) notFound();
  const locale = toSiteLocale((await params).locale);
  const c = LAKE_PAGE_COPY[locale];
  // Primary data is rendered with the page, including for readers without JS.
  const series = await getGruyereWaterTemperature();
  return <div className="ow-lake">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(lakeSchema(locale)) }} />
    <AccessPageHeader title={LAKE_SEO[locale].heading} description={c.intro} />
    <LakeTemperatureExplorer series={series} locale={locale} initialNow={new Date().getTime()} />
  </div>;
}
