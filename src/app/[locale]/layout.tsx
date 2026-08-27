import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/ui/Navbar";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { FavProvider } from "@/lib/FavContext";
import { routing } from "@/i18n/routing";
import {
  DEFAULT_OG_IMAGE,
  HOME_SEO,
  SITE_URL,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";
import { notFound } from "next/navigation";

const GTM_ID = "GTM-WQ58WR7M";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = HOME_SEO[toSiteLocale(locale)];

  return {
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    verification: {
      google: "IPK5LP6dD1gvar2XIppMLxIbce_yOzD3OfiPN1Cj1cU",
    },
    title: {
      default: copy.title,
      template: "%s — Openwind",
    },
    description: copy.description,
    keywords: [
      "balise vent",
      "balise vent direct",
      "kitesurf",
      "parapente",
      "vent en direct",
      "spots kitesurf",
      "spots parapente",
      "prévisions vent",
      "carte vent",
      "open source",
      "météo",
      "kite",
      "paragliding",
      "wind",
      "forecast",
    ],
    authors: [{ name: "Openwind" }],
    creator: "Openwind",
    openGraph: {
      title: copy.title,
      description: copy.socialDescription,
      siteName: "Openwind",
      locale: copy.openGraphLocale,
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.socialDescription,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const copy = HOME_SEO[toSiteLocale(locale)];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Openwind",
        url: SITE_URL,
        description: copy.description,
      },
      {
        "@type": "SiteNavigationElement",
        name: "Carte",
        url: localizedUrl(locale),
      },
      {
        "@type": "SiteNavigationElement",
        name: "Planification",
        url: localizedUrl(locale, "/plan"),
      },
      {
        "@type": "SiteNavigationElement",
        name: "Balises météo et vent",
        url: localizedUrl(locale, "/balises"),
      },
      {
        "@type": "SiteNavigationElement",
        name: "Forum",
        url: localizedUrl(locale, "/forum"),
      },
    ],
  };

  return (
    <>
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w.gtag=w.gtag||function(){w[l].push(arguments);};w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <FavProvider>
          <Navbar />
          <main className={`${inter.className} antialiased pt-14`}>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
            {children}
          </main>
          <SiteFooter />
        </FavProvider>
      </NextIntlClientProvider>
      <Analytics />
    </>
  );
}
