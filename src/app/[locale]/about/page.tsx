import { getTranslations } from "next-intl/server";
import AboutClient from "./AboutClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  const base = "https://openwind.ch";
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical: `${base}/${locale}/about`,
      languages: {
        "x-default": `${base}/fr/about`,
        fr: `${base}/fr/about`,
        en: `${base}/en/about`,
        de: `${base}/de/about`,
        it: `${base}/it/about`,
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDesc"),
      url: `${base}/${locale}/about`,
      type: "website",
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
