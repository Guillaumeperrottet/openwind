import records from "@/data/neuchatel-spot-editorials.json";
import profilePatches from "@/data/neuchatel-seo-import.json";
import { isGuideLocale, type GuideLocale } from "@/lib/local-guides";

export function getSpotEditorial(id: string, locale: string) {
  if (!isGuideLocale(locale)) return null;
  const record = records.find((entry) => entry.id === id);
  if (!record) return null;
  return { ...record, locale, translation: record.translations[locale] };
}

export function spotEditorialTitle(name: string, locale: GuideLocale) {
  return {
    fr: `Kitesurf à ${name} : vent et accès`,
    de: `Kitesurfen ${name}: Wind und Einstieg`,
    it: `Kitesurf a ${name}: vento e accesso`,
  }[locale];
}

export function spotEditorialModified(
  id: string,
  locale: string,
  updatedAt: Date,
) {
  // Cudrefin's difficulty/directions also change the English spot page.
  const editorial =
    getSpotEditorial(id, locale) ??
    (profilePatches.some((patch) => patch.id === id)
      ? getSpotEditorial(id, "fr")
      : null);
  const reviewed = editorial
    ? new Date(`${editorial.reviewedAt}T00:00:00Z`)
    : null;
  return reviewed && reviewed > updatedAt ? reviewed : updatedAt;
}

export const NEUCHATEL_EDITORIAL_LINKS = records.map(({ id, name }) => ({
  id,
  name,
}));
