import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/ui/Navbar";
import { FavProvider } from "@/lib/FavContext";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const GTM_ID = "GTM-WQ58WR7M";

const inter = Inter({ subsets: ["latin"] });

const localeNames: Record<string, string> = {
  fr: "fr_CH",
  en: "en_US",
  de: "de_CH",
  it: "it_CH",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://openwind.ch"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "IPK5LP6dD1gvar2XIppMLxIbce_yOzD3OfiPN1Cj1cU",
  },
  title: {
    default: "Openwind — Balises vent en direct, spots kitesurf et parapente",
    template: "%s — Openwind",
  },
  description:
    "Balises vent en direct, carte interactive des spots de kitesurf et parapente. Stations météo temps réel, prévisions 7 jours, archives historiques et planificateur de voyages.",
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
    title: "Openwind — Balises vent en direct, spots kitesurf et parapente",
    description:
      "Balises vent en direct et carte interactive des spots de kitesurf et parapente. Stations météo temps réel, prévisions, planificateur de voyages.",
    url: "https://openwind.ch",
    siteName: "Openwind",
    locale: "fr_CH",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Openwind — Balises vent en direct, spots kitesurf et parapente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Openwind — Balises vent en direct, spots kite & parapente",
    description:
      "Balises vent en direct, prévisions 7 jours, archives historiques. Open source.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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

  return (
    <>
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                name: "Openwind",
                url: "https://openwind.ch",
                description:
                  "Balises vent en direct et carte interactive des spots de kitesurf et parapente.",
              },
              {
                "@type": "SiteNavigationElement",
                name: "Carte",
                url: "https://openwind.ch",
              },
              {
                "@type": "SiteNavigationElement",
                name: "Planification",
                url: "https://openwind.ch/plan",
              },
              {
                "@type": "SiteNavigationElement",
                name: "Forum",
                url: "https://openwind.ch/forum",
              },
            ],
          }),
        }}
      />
      {/* hreflang for SEO */}
      <link rel="alternate" hrefLang="fr" href="https://openwind.ch/fr" />
      <link rel="alternate" hrefLang="en" href="https://openwind.ch/en" />
      <link rel="alternate" hrefLang="de" href="https://openwind.ch/de" />
      <link rel="alternate" hrefLang="it" href="https://openwind.ch/it" />
      <link
        rel="alternate"
        hrefLang="x-default"
        href="https://openwind.ch/fr"
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
        </FavProvider>
      </NextIntlClientProvider>
      <Analytics />
    </>
  );
}
