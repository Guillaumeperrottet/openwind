import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "À propos — la carte vivante du vent",
  description:
    "Openwind agrège six réseaux de stations vent en temps réel, des prévisions à 7 jours et 5 ans d'archives pour kitesurfeurs et parapentistes. Open source.",
  alternates: { canonical: "https://openwind.ch/about" },
  openGraph: {
    title: "Openwind — la carte vivante du vent",
    description:
      "Six réseaux de stations, prévisions 7j, archives 5 ans. Open source.",
    url: "https://openwind.ch/about",
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
