import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Openkite — Carte",
  description:
    "Carte interactive open source pour le vent et les spots de kitesurf et parapente. Vent en direct, prévisions, planification de voyages.",
  openGraph: {
    title: "Openkite",
    description:
      "La carte open source du vent et des spots de kitesurf et parapente. Vent en direct, prévisions, planification de voyages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
