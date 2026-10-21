import { Link } from "@/i18n/navigation";
import { GUIDE_COPY, LOCAL_GUIDES, isGuideLocale } from "@/lib/local-guides";

export function LocalGuideLinks({
  locale,
  spotId,
  stationId,
}: {
  locale: string;
  spotId?: string;
  stationId?: string;
}) {
  const language = isGuideLocale(locale) ? locale : "fr";
  const guides = LOCAL_GUIDES.filter(
    (guide) =>
      (spotId && guide.spotIds.includes(spotId)) ||
      (stationId && guide.stations.some((station) => station.id === stationId)),
  );
  if (!guides.length) return null;
  return (
    <aside className="my-8 border-y border-slate-200 py-5">
      <h2 className="text-lg font-semibold text-slate-950">
        {locale === "en"
          ? "Local guides (French)"
          : GUIDE_COPY[language].guides}
      </h2>
      <ul className="mt-3 space-y-3">
        {guides.map((guide) => {
          const availableLanguage = guide.translations[language]
            ? language
            : "fr";
          return (
            <li key={guide.slug}>
              <Link
                href={`/vent-en-direct/${guide.slug}`}
                locale={availableLanguage}
                className="text-sm font-semibold text-sky-700 underline underline-offset-4"
              >
                {guide.translations[availableLanguage]!.title} →
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
