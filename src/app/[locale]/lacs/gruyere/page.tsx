import { lakeMetadata, lakeSchema } from "@/lib/lake-seo";
import { jsonLd } from "@/lib/public-seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AccessPageHeader } from "@/components/ui/AccessPageHeader";
import { getGruyereWaterTemperature } from "@/lib/alplakes";
import { toSiteLocale, type SiteLocale } from "@/lib/site";
import { LAKE_PAGE_COPY } from "@/lib/lake-page-copy";
import { LakeTemperatureExplorer, LakeTemperatureLoading } from "@/components/lake/LakeTemperatureExplorer";
import { lakePageEnabled } from "@/lib/lake-page-enabled";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);
  return lakeMetadata(locale, lakePageEnabled());
}

async function LakeData({ locale }: { locale: SiteLocale }) {
  const series = await getGruyereWaterTemperature();
  return <LakeTemperatureExplorer series={series} locale={locale} initialNow={new Date().getTime()} />;
}

export default async function GruyereLakePage({ params }: Props) {
  // The same switch controls indexing, the sitemap and internal links.
  if (!lakePageEnabled()) notFound();
  const locale = toSiteLocale((await params).locale);
  const c = LAKE_PAGE_COPY[locale];
  return <div className="ow-lake">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(lakeSchema(locale)) }} />
    <AccessPageHeader title={c.title} description={c.intro} />
    <Suspense fallback={<LakeTemperatureLoading locale={locale} />}><LakeData locale={locale} /></Suspense>
  </div>;
}
