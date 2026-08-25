import { getTranslations } from "next-intl/server";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
} from "@/lib/site";
import AboutClient from "./AboutClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates(locale, "/about"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDesc"),
      url: localizedUrl(locale, "/about"),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
