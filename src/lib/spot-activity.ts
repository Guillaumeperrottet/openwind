import type { SportType } from "@/types";

type ActivitySpot = { name: string; sportType: SportType };

const normalize = (name: string) => name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[–—-]/g, " ").replace(/\s+/g, " ").trim();

// These entries are explicitly classified as snowkite in prisma/seed.ts.
// Do not infer the discipline from weather, altitude or a passing mention in a description.
const snowkiteCatalogue = new Set([
  "Les Rousses", "Le Brassus – Vallée de Joux", "Lac de Joux", "Semsales",
  "Le Niremont", "Les Alpettes", "La Brévine", "Jaunpass", "Grimselpass",
  "Le Salève", "Crozet Lelex",
].map(normalize));

export function isSnowkiteSpot(spot: ActivitySpot): boolean {
  return spot.sportType === "KITE" && (snowkiteCatalogue.has(normalize(spot.name)) || /\bsnow[\s-]?kit/i.test(spot.name));
}

export function spotActivityLabel(spot: ActivitySpot, locale: string = "fr"): string {
  if (isSnowkiteSpot(spot)) return locale === "de" ? "Snowkiten" : "Snowkite";
  const labels = {
    fr: { KITE: "Kitesurf", PARAGLIDE: "Parapente" },
    en: { KITE: "Kitesurfing", PARAGLIDE: "Paragliding" },
    de: { KITE: "Kitesurfen", PARAGLIDE: "Gleitschirmfliegen" },
    it: { KITE: "Kitesurf", PARAGLIDE: "Parapendio" },
  };
  return labels[locale as keyof typeof labels]?.[spot.sportType] ?? labels.fr[spot.sportType];
}
