import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getLocalGuide,
  guideAlternates,
  isGuideLocale,
} from "@/lib/local-guides";
import { getGuideEditorial, loadLocalGuide } from "@/lib/local-guide-data";
import { HOME_SEO, localizedUrl } from "@/lib/site";
import { LocalGuideTemplate } from "@/components/carnet/LocalGuideTemplate";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getLocalGuide(slug);
  if (!guide || !isGuideLocale(locale) || !guide.translations[locale])
    return {};
  const translation = guide.translations[locale]!;
  const editorial = await getGuideEditorial(slug);
  const title =
    locale === "fr" && editorial?.seoTitle
      ? editorial.seoTitle
      : translation.title;
  const description =
    locale === "fr" && editorial?.seoDescription
      ? editorial.seoDescription
      : translation.description;
  const image = editorial?.coverImage || guide.coverImage;
  return {
    title,
    description,
    alternates: guideAlternates(guide, locale),
    openGraph: {
      title: `${title} — Openwind`,
      description,
      url: localizedUrl(locale, `/vent-en-direct/${slug}`),
      type: "article",
      locale: HOME_SEO[locale].openGraphLocale,
      images: [
        { url: image, width: 1200, height: 763, alt: translation.coverAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function LocalGuidePage({ params }: Props) {
  const { locale, slug } = await params;
  const guide = getLocalGuide(slug);
  if (!guide) notFound();
  if (!isGuideLocale(locale) || !guide.translations[locale])
    permanentRedirect(`/fr/vent-en-direct/${slug}`);
  return <LocalGuideTemplate data={await loadLocalGuide(guide, locale)} />;
}
