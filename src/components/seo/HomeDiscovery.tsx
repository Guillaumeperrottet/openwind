import { Link } from "@/i18n/navigation";
import { GUIDE_COPY, LOCAL_GUIDES, isGuideLocale } from "@/lib/local-guides";
import { toSiteLocale } from "@/lib/site";

const COPY = {
  fr: {
    title: "Le vent en Suisse, des balises aux spots",
    intro:
      "Comparez les mesures des balises, les prévisions et les informations locales pour préparer vos sorties de kitesurf et de parapente.",
    stations: "Balises météo et vent en direct",
    spots: "Spots en Suisse",
    plan: "Planifier une sortie",
    about: "Comprendre Openwind",
  },
  de: {
    title: "Wind in der Schweiz: von Messstationen zu Spots",
    intro:
      "Vergleiche Windmessungen, Prognosen und lokale Informationen, um deine Kite- und Gleitschirmausflüge vorzubereiten.",
    stations: "Live-Wetter- und Windstationen",
    spots: "Spots in der Schweiz",
    plan: "Ausflug planen",
    about: "Über Openwind",
  },
  it: {
    title: "Il vento in Svizzera, dalle stazioni agli spot",
    intro:
      "Confronta le misure delle stazioni, le previsioni e le informazioni locali per preparare le tue uscite di kitesurf e parapendio.",
    stations: "Stazioni meteo e vento in diretta",
    spots: "Spot in Svizzera",
    plan: "Pianifica un’uscita",
    about: "Scopri Openwind",
  },
  en: {
    title: "Wind in Switzerland, from stations to spots",
    intro:
      "Compare station observations, forecasts and local information to prepare your kitesurfing and paragliding trips.",
    stations: "Live weather and wind stations",
    spots: "Spots in Switzerland",
    plan: "Plan a trip",
    about: "About Openwind",
  },
};

export function HomeDiscovery({
  locale,
  spots,
}: {
  locale: string;
  spots: {
    id: string;
    name: string;
    country: string | null;
    sportType: string;
  }[];
}) {
  const copy = COPY[toSiteLocale(locale)];
  const swissSpots = spots
    .filter((spot) =>
      /^(ch|suisse|switzerland|schweiz|svizzera)$/i.test(
        spot.country?.trim() ?? "",
      ),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 12);
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {copy.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
        {copy.intro}
      </p>
      <nav className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-sky-700">
        <Link href="/balises">{copy.stations} →</Link>
        <Link href="/plan">{copy.plan} →</Link>
        <Link href="/about">{copy.about} →</Link>
      </nav>
      {isGuideLocale(locale) && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">
            <Link href="/vent-en-direct">{GUIDE_COPY[locale].guides}</Link>
          </h2>
          <ul className="mt-4 space-y-3">
            {LOCAL_GUIDES.filter((guide) => guide.translations[locale]).map(
              (guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/vent-en-direct/${guide.slug}`}
                    className="text-sky-700 underline underline-offset-4"
                  >
                    {guide.translations[locale]!.title}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
      {swissSpots.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">{copy.spots}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {swissSpots.map((spot) => (
              <li key={spot.id}>
                <Link
                  href={`/spots/${spot.id}`}
                  className="text-sm text-sky-700 underline underline-offset-4"
                >
                  {spot.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
