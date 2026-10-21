import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Map,
  RadioTower,
  Camera,
  Route,
  Wind,
  Compass,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { GuideImageCredit } from "@/components/carnet/GuideImageCredit";
import { LOCAL_GUIDES, isGuideLocale } from "@/lib/local-guides";
import { HOME_COPY } from "@/lib/home-copy";
import { toSiteLocale } from "@/lib/site";

export interface HomeArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: string;
}
const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600";

export function HomeLanding({
  locale,
  articles,
}: {
  locale: string;
  articles: HomeArticle[];
}) {
  const language = toSiteLocale(locale);
  const guideLocale = isGuideLocale(language) ? language : "fr";
  const copy = HOME_COPY[language];
  const guides = ["lac-de-neuchatel", "lac-leman", "lac-de-la-gruyere"].flatMap(
    (slug) => {
      const guide = LOCAL_GUIDES.find((guide) => guide.slug === slug);
      return guide ? [guide] : [];
    },
  );
  const leman = guides.find((guide) => guide.slug === "lac-leman")!;
  return (
    <div className="bg-[#f8faf9] text-slate-950">
      <section className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pt-16 lg:pb-20">
        <div className="grid items-center gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-sky-800 sm:text-xs">
              <Wind aria-hidden="true" className="h-4 w-4" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 text-[clamp(2.6rem,5.1vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
              {copy.title}
              <span className="mt-1 block text-sky-800">{copy.accent}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.intro}
            </p>
            <div id="recherche" className="relative z-20 mt-8 scroll-mt-24">
              <GlobalSearch variant="hero" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
              <span>{copy.explore}</span>
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  locale={guideLocale}
                  href={`/vent-en-direct/${guide.slug}`}
                  className={`rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-sky-600 hover:text-sky-800 ${focusClass}`}
                >
                  {guide.translations[guideLocale]!.place.split(" / ")[0]}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/?view=map"
                prefetch={false}
                className={`inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-900 ${focusClass}`}
              >
                <Map aria-hidden="true" className="h-4 w-4" />
                {copy.map}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <p className="max-w-[220px] text-xs leading-5 text-slate-500">
                {copy.mapNote}
              </p>
            </div>
          </div>
          <figure className="relative lg:pl-2">
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-slate-200">
              <Image
                src={leman.coverImage}
                alt={copy.heroAlt}
                width={1280}
                height={854}
                sizes="(max-width: 1023px) 100vw, 45vw"
                preload
                className="h-[260px] w-full object-cover sm:h-[380px] lg:h-[510px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-xs font-medium text-white/80">
                  {copy.heroCaption}
                </p>
                <Link
                  href="/vent-en-direct/lac-leman"
                  locale={guideLocale}
                  className={`mt-3 inline-flex items-center gap-3 text-xl font-semibold text-white ${focusClass}`}
                >
                  {copy.heroLink}
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <figcaption className="px-3 pt-2 text-slate-500">
              <GuideImageCredit credit={leman.coverCredit} />
            </figcaption>
          </figure>
        </div>
      </section>
      <section
        aria-labelledby="home-lakes-title"
        className="border-y border-slate-200/70 bg-white py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
                Suisse / Schweiz / Svizzera
              </p>
              <h2
                id="home-lakes-title"
                className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              >
                {copy.lakesTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {copy.lakesIntro}
              </p>
            </div>
            <Link
              href="/vent-en-direct"
              locale={guideLocale}
              className={`inline-flex items-center gap-2 text-sm font-semibold text-sky-800 ${focusClass}`}
            >
              {copy.allGuides}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {guides.map((guide) => {
              const translation = guide.translations[guideLocale]!;
              return (
                <article key={guide.slug} className="group min-w-0">
                  <Link
                    href={`/vent-en-direct/${guide.slug}`}
                    locale={guideLocale}
                    className={`block rounded-2xl ${focusClass}`}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={guide.coverImage}
                        alt={translation.coverAlt}
                        width={720}
                        height={480}
                        sizes="(max-width: 767px) 100vw, 33vw"
                        className="aspect-[3/2] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-slate-800">
                        {copy.lakeLabel}
                      </span>
                    </div>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {guide.region}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {translation.place.split(" / ")[0]}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {translation.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
                      {copy.guide}
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </Link>
                  <GuideImageCredit
                    credit={guide.coverCredit}
                    className="mt-3 text-slate-500"
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[10px] font-bold tracking-[0.17em] text-sky-800">
          {copy.toolsEyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.toolsTitle}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {copy.tools.map((tool, index) => {
            const Icon = [RadioTower, Camera, Route][index];
            const href = ["/balises", "#recherche", "/plan"][index];
            return (
              <Link
                key={tool.title}
                href={href}
                className={`rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-sky-400 ${focusClass}`}
              >
                <Icon aria-hidden="true" className="h-6 w-6 text-sky-800" />
                <h3 className="mt-5 text-xl font-semibold">{tool.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {tool.text}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
                  {tool.action}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      {articles.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {copy.articlesTitle}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {copy.articlesIntro}
              </p>
            </div>
            <Link
              href="/carnet"
              locale="fr"
              className={`text-sm font-semibold text-sky-800 ${focusClass}`}
            >
              {copy.articlesAll} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id}>
                <Link
                  href={`/carnet/${article.slug}`}
                  locale="fr"
                  className={`block rounded-2xl ${focusClass}`}
                >
                  {article.coverImage && (
                    <Image
                      src={article.coverImage}
                      alt={article.coverAlt ?? ""}
                      width={640}
                      height={400}
                      sizes="(max-width: 767px) 100vw, 33vw"
                      className="aspect-[16/10] w-full rounded-2xl object-cover"
                      unoptimized={
                        !article.coverImage.includes(".supabase.co/") &&
                        !article.coverImage.startsWith("/")
                      }
                    />
                  )}
                  <p className="mt-4 text-xs text-sky-800">
                    {article.category}
                    {language !== "fr" ? " · FR" : ""}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                    {article.excerpt}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-sky-800">
                    {copy.read} →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
          <div className="max-w-2xl">
            <Compass aria-hidden="true" className="mb-4 h-7 w-7 text-sky-300" />
            <h2 className="text-xl font-semibold">{copy.method}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {copy.methodText}
            </p>
          </div>
          <Link
            href="/about"
            className={`inline-flex items-center gap-2 text-sm font-semibold text-sky-200 ${focusClass}`}
          >
            {copy.about}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
