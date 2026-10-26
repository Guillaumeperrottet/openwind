import { Link } from "@/i18n/navigation";
import {
  getSpotEditorial,
  NEUCHATEL_EDITORIAL_LINKS,
} from "@/lib/spot-editorials";

const COPY = {
  fr: {
    title: "Préparer votre sortie",
    checked: "Sources consultées le",
    sources: "Sources locales",
    guide: "Comparer les rives du lac de Neuchâtel",
    others: "Explorer les autres départs",
    station: "Mesures régionales",
    stations:
      "Les balises décrivent leur emplacement, pas le vent au départ du spot.",
  },
  de: {
    title: "Deinen Ausflug vorbereiten",
    checked: "Quellen geprüft am",
    sources: "Lokale Quellen",
    guide: "Die Ufer des Neuenburgersees vergleichen",
    others: "Weitere Einstiege entdecken",
    station: "Regionale Messungen",
    stations:
      "Die Stationen beschreiben ihren Standort, nicht den Wind am Spot-Einstieg.",
  },
  it: {
    title: "Preparare la tua uscita",
    checked: "Fonti consultate il",
    sources: "Fonti locali",
    guide: "Confrontare le rive del lago di Neuchâtel",
    others: "Esplorare altri accessi",
    station: "Misure regionali",
    stations:
      "Le stazioni descrivono il proprio punto di misura, non il vento alla partenza dello spot.",
  },
};

/** Server-rendered prose remains readable without waiting for charts or hydration. */
export function SpotEditorial({ id, locale }: { id: string; locale: string }) {
  const editorial = getSpotEditorial(id, locale);
  if (!editorial) return null;
  const { translation, locale: language } = editorial;
  const copy = COPY[language];
  return (
    <section
      aria-labelledby="spot-local-guide"
      className="my-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <h2
        id="spot-local-guide"
        className="text-2xl font-semibold text-slate-950"
      >
        {copy.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        {translation.intro}
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {translation.sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {section.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-7 border-t border-slate-100 pt-5">
        <h3 className="font-semibold">{copy.station}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{copy.stations}</p>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-sky-800">
          {[
            ["NEU", "Neuchâtel"],
            ["PAY", "Payerne"],
            ["CRM", "Cressier NE"],
          ].map(([station, name]) => (
            <li key={station}>
              <Link
                locale={language}
                href={`/stations/${station}`}
                className="underline underline-offset-4"
              >
                {name} →
              </Link>
            </li>
          ))}
        </ul>
        <Link
          locale={language}
          href="/vent-en-direct/lac-de-neuchatel"
          className="mt-5 inline-block text-sm font-semibold text-sky-800 underline underline-offset-4"
        >
          {copy.guide} →
        </Link>
        <h3 className="mt-5 text-sm font-semibold">{copy.others}</h3>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm text-sky-800">
          {NEUCHATEL_EDITORIAL_LINKS.filter((spot) => spot.id !== id).map(
            (spot) => (
              <li key={spot.id}>
                <Link
                  locale={language}
                  href={`/spots/${spot.id}`}
                  className="underline underline-offset-4"
                >
                  {spot.name} →
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
      <footer className="mt-7 border-t border-slate-100 pt-5 text-sm text-slate-600">
        <p>
          {copy.checked}{" "}
          <time dateTime={editorial.reviewedAt}>
            {new Intl.DateTimeFormat(language, {
              dateStyle: "long",
              timeZone: "Europe/Zurich",
            }).format(new Date(`${editorial.reviewedAt}T00:00:00Z`))}
          </time>
          .
        </p>
        <h3 className="mt-3 font-semibold">{copy.sources}</h3>
        <ul className="mt-3 space-y-3">
          {editorial.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-800 underline underline-offset-4"
              >
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
