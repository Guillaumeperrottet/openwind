import { getTranslations } from "next-intl/server";
import type { WindyWebcam } from "@/app/api/webcams/route";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";
import { WebcamsClient } from "./WebcamsClient";
import { WebcamDirectory } from "@/components/ui/WebcamDirectory";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    name?: string;
    back?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  const { name: rawName, lat, lng, q } = await searchParams;
  const name = typeof rawName === "string" ? rawName : undefined;
  const t = await getTranslations({ locale, namespace: "WebcamsPage" });
  return {
    title: name ? t("metaTitleNear", { name }) : t("metaTitle"),
    description: name ? t("metaDescNear", { name }) : t("metaDesc"),
    alternates: localizedAlternates(locale, "/webcams"),
    // Coordinates and return URLs describe an internal search, not a stable guide.
    robots: { index: !(lat || lng || q || name), follow: true },
    openGraph: {
      title: name ? t("metaTitleNear", { name }) : t("metaTitle"),
      description: name ? t("metaDescNear", { name }) : t("metaDesc"),
      url: localizedUrl(locale, "/webcams"),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function WebcamsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { lat, lng, name, q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "WebcamsPage" });

  const latNum = typeof lat === "string" && lat.trim() ? Number(lat) : null;
  const lngNum = typeof lng === "string" && lng.trim() ? Number(lng) : null;
  const locationName = typeof name === "string" && name.trim() ? name.trim().slice(0, 150) : t("fallbackLocation");

  if (latNum === null || lngNum === null || !Number.isFinite(latNum) || !Number.isFinite(lngNum) || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) return <WebcamDirectory locale={toSiteLocale(locale)} query={typeof q === "string" ? q.slice(0, 100).trim() : ""} />;

  let webcams: WindyWebcam[] = [];
  let initialError = true;

  if (latNum !== null && lngNum !== null && !isNaN(latNum) && !isNaN(lngNum)) {
    try {
      const apiKey = process.env.WINDY_WEBCAMS_API_KEY;
      if (apiKey) {
        const url =
          `https://api.windy.com/webcams/api/v3/webcams` +
          `?nearby=${latNum},${lngNum},15` +
          `&include=location,images,player,urls` +
          `&limit=20` +
          `&orderby=distance`;

        const res = await fetch(url, {
          headers: { "x-windy-api-key": apiKey },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = (await res.json()) as { webcams?: WindyWebcam[] };
          if (!Array.isArray(data.webcams)) throw new Error("Invalid webcam response");
          webcams = data.webcams;
          initialError = false;
        }
      }
    } catch {
      /* The client offers a retry when the provider is unavailable. */
    }
  }

  return (
    <WebcamsClient
      key={`${latNum},${lngNum}`}
      initialError={initialError}
      webcams={webcams}
      locationName={locationName}
      lat={latNum}
      lng={lngNum}
    />
  );
}
