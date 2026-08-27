"use client";

import {
  ArrowRight,
  BookOpenText,
  Clock3,
  Compass,
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StationConnections as Connections } from "@/lib/station-connections";

interface Props {
  connections: Connections;
}

export function StationConnections({ connections }: Props) {
  const t = useTranslations("StationPage");
  const { spots, articles } = connections;

  if (spots.length === 0 && articles.length === 0) return null;

  return (
    <section
      className="mt-12 border-t border-slate-200 pt-8"
      aria-labelledby="station-connections-heading"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
        {t("connectedEyebrow")}
      </p>
      <h2
        id="station-connections-heading"
        className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
      >
        {t("connectedTitle")}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {t("connectedDescription")}
      </p>

      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        {spots.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <MapPin className="h-4 w-4 text-sky-600" />
              {t("connectedSpots")}
            </div>
            <div className="grid gap-3">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="group rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">
                        {spot.sportType === "KITE"
                          ? t("sportKite")
                          : t("sportParaglide")}
                      </p>
                      <h3 className="mt-1 truncate text-lg font-semibold">
                        {spot.name}
                      </h3>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-sky-300 transition group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    {(spot.region || spot.country) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {spot.region || spot.country}
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-2.5 py-1.5">
                      {t(`difficulty.${spot.difficulty.toLowerCase()}`)}
                    </span>
                    {spot.bestWindDirections.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
                        <Compass className="h-3.5 w-3.5" />
                        {spot.bestWindDirections.slice(0, 4).join(" · ")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <BookOpenText className="h-4 w-4 text-sky-600" />
              {t("connectedArticles")}
            </div>
            <div className="grid gap-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={
                    article.kind === "LOCAL_GUIDE"
                      ? `/vent-en-direct/${article.slug}`
                      : `/carnet/${article.slug}`
                  }
                  locale="fr"
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                      {article.category}
                    </p>
                    <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {article.excerpt}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {t("readTime", { count: article.readTime })}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-sky-600 transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
