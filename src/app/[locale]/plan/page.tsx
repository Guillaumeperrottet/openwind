import type { Metadata } from "next";
import { TripPlanner } from "@/components/plan/TripPlanner";
import { localDate } from "@/lib/planner";
import { plannerCopy } from "@/lib/planner-copy";
import {
  DEFAULT_OG_IMAGE,
  localizedAlternates,
  localizedUrl,
  toSiteLocale,
} from "@/lib/site";

const PLAN_SEO = {
  fr: {
    title: "Planifier une sortie kitesurf ou parapente",
    description:
      "Trouvez les meilleurs spots de kitesurf et parapente selon vos dates et votre destination grâce aux prévisions de vent et aux archives.",
  },
  en: {
    title: "Plan a kitesurfing or paragliding trip",
    description:
      "Find the best kitesurfing and paragliding spots for your dates and destination using wind forecasts and historical data.",
  },
  de: {
    title: "Kitesurf- oder Gleitschirm-Ausflug planen",
    description:
      "Finde die besten Kitesurf- und Gleitschirm-Spots für dein Reiseziel und deine Daten mit Windprognosen und historischen Daten.",
  },
  it: {
    title: "Pianifica un'uscita kitesurf o parapendio",
    description:
      "Trova i migliori spot di kitesurf e parapendio per le tue date e destinazione con previsioni del vento e dati storici.",
  },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = PLAN_SEO[toSiteLocale(locale)];

  return {
    title: copy.title,
    description: copy.description,
    alternates: localizedAlternates(locale, "/plan"),
    openGraph: {
      title: `${copy.title} — Openwind`,
      description: copy.description,
      url: localizedUrl(locale, "/plan"),
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PlanPage({ params, searchParams }: Props) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  return (
    <TripPlanner
      searchParams={sp}
      locale={toSiteLocale(locale)}
      copy={plannerCopy[toSiteLocale(locale)]}
      today={localDate(new Date())}
    />
  );
}
