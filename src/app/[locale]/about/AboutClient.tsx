"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Map as MapIcon,
  Compass,
  Calendar,
  Activity,
  MessageSquare,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useReveal } from "./useReveal";
import {
  NetworksGrid,
  Screenshot,
  OpenSourceCodeDemo,
  WindStreaks,
  SportConditionsDemo,
} from "./demos";

export default function AboutClient() {
  return (
    <div className="bg-white text-slate-900 antialiased selection:bg-blue-200/60">
      <Hero />
      <SectionMap />
      <SectionNetworks />
      <SectionForecast />
      <SectionPlanner />
      <SectionForum />
      <SectionSports />
      <SectionOpenSource />
      <Footer />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const t = useTranslations("AboutPage");
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      <WindStreaks />

      {/* Floating badge — top-left of the hero */}
      <Link
        href="/plan?quick=now"
        className="hero-badge group absolute top-24 sm:top-28 left-8 sm:left-24 lg:left-40 z-20 inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/80 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 -rotate-3 hover:rotate-0"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
        </span>
        <span className="text-[11px] font-semibold text-blue-800 tracking-wide">
          {t("heroBadge")}
        </span>
        <span className="text-[11px] text-slate-700 hidden sm:inline">
          {t("heroBadgeSubtitle")}
        </span>
        <ArrowRight className="h-3 w-3 text-blue-700 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="relative z-10 text-center max-w-4xl">
        <p className="text-sm font-medium text-blue-700/80 tracking-widest uppercase">
          {t("heroTagline")}
        </p>
        <h1 className="mt-8 flex justify-center">
          <span className="sr-only">Openwind</span>
          <Image
            src="/logo_noback.png"
            alt="Openwind"
            width={1200}
            height={400}
            priority
            className="w-[92vw] sm:w-2xl lg:w-240 h-auto"
          />
        </h1>
        <p className="mt-8 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t("heroDescLine1")}
          <br className="hidden sm:block" />
          {t("heroDescLine2")}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            {t("heroCtaExplore")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="https://github.com/Guillaumeperrottet/openwind"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <GithubIcon />
            {t("heroCtaSource")}
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-[11px] uppercase tracking-widest">
        <span>{t("scroll")}</span>
        <span className="block w-px h-8 bg-linear-to-b from-slate-300 to-transparent" />
      </div>
    </section>
  );
}

// ─── Generic section wrapper ──────────────────────────────────────────────────

function Section({
  eyebrow,
  title,
  description,
  children,
  reverse,
  icon,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  reverse?: boolean;
  icon?: React.ReactNode;
}) {
  const [leftRef, leftVisible] = useReveal();
  const [rightRef, rightVisible] = useReveal();

  return (
    <section className="px-6 py-28 sm:py-36 max-w-6xl mx-auto">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}
      >
        <div
          ref={leftRef}
          className={`transition-all duration-700 ease-out ${
            leftVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          } ${reverse ? "lg:order-2" : ""}`}
        >
          <div className="flex items-center gap-2 text-blue-700/80">
            {icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
            <span className="text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </span>
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-slate-900">
            {title}
          </h2>
          <div className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed space-y-4">
            {description}
          </div>
        </div>

        <div
          ref={rightRef}
          className={`transition-all duration-700 ease-out delay-100 ${
            rightVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          } ${reverse ? "lg:order-1" : ""}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionMap() {
  const t = useTranslations("AboutPage");
  return (
    <Section
      eyebrow={t("mapEyebrow")}
      icon={<MapIcon />}
      title={
        <>
          {t("mapTitleLine1")}
          <br />
          {t("mapTitleLine2")}
        </>
      }
      description={
        <>
          <p>{t("mapP1")}</p>
          <p className="text-sm text-slate-500">{t("mapP2")}</p>
        </>
      }
    >
      <Screenshot
        src="/capture/map.png"
        alt={t("mapP1").substring(0, 80)}
        width={797}
        height={609}
        caption={t("mapCaption")}
      />
    </Section>
  );
}

function SectionNetworks() {
  const t = useTranslations("AboutPage");
  return (
    <section className="bg-slate-50/60 px-6 py-28 sm:py-36 border-y border-black/4">
      <div className="max-w-6xl mx-auto">
        <RevealHeader
          eyebrow={t("networksEyebrow")}
          icon={<Activity />}
          title={
            <>
              {t("networksTitleLine1")}
              <br />
              <span className="text-blue-600">{t("networksTitleLine2")}</span>
            </>
          }
          description={t("networksDesc")}
        />
        <div className="mt-12">
          <NetworksGrid />
        </div>
      </div>
    </section>
  );
}

function SectionForecast() {
  const t = useTranslations("AboutPage");
  return (
    <Section
      reverse
      eyebrow={t("forecastEyebrow")}
      icon={<Calendar />}
      title={
        <>
          {t("forecastTitleLine1")}
          <br />
          {t("forecastTitleLine2")}
        </>
      }
      description={
        <>
          <p>
            {t.rich("forecastP1", {
              bold: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p className="text-sm text-slate-500">{t("forecastP2")}</p>
        </>
      }
    >
      <div className="space-y-6">
        <Screenshot
          src="/capture/previsions.png"
          alt={t("forecastCaption1")}
          width={1546}
          height={746}
          caption={t("forecastCaption1")}
        />
        <Screenshot
          src="/capture/archives.png"
          alt={t("forecastCaption2")}
          width={1524}
          height={319}
          caption={t("forecastCaption2")}
        />
      </div>
    </Section>
  );
}

function SectionPlanner() {
  const t = useTranslations("AboutPage");
  return (
    <Section
      eyebrow={t("plannerEyebrow")}
      icon={<Compass />}
      title={
        <>
          {t("plannerTitleLine1")}
          <br />
          {t("plannerTitleLine2")}
        </>
      }
      description={
        <>
          <p>{t("plannerP1")}</p>
          <p className="text-sm text-slate-500">{t("plannerP2")}</p>
        </>
      }
    >
      <Screenshot
        src="/capture/scoring.png"
        alt={t("plannerCaption")}
        width={489}
        height={259}
        caption={t("plannerCaption")}
      />
    </Section>
  );
}

function SectionForum() {
  const t = useTranslations("AboutPage");
  return (
    <Section
      eyebrow={t("forumEyebrow")}
      icon={<MessageSquare />}
      title={<>{t("forumTitle")}</>}
      description={
        <>
          <p>
            {t.rich("forumP1", { bold: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p>{t.rich("forumP2", { em: (chunks) => <em>{chunks}</em> })}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              {t("forumCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/Guillaumeperrottet/openwind/issues/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <GithubIcon />
              {t("forumGithubCta")}
            </a>
          </div>
        </>
      }
    >
      <OpenSourceCodeDemo />
    </Section>
  );
}

function SectionSports() {
  const t = useTranslations("AboutPage");
  return (
    <Section
      reverse
      eyebrow={t("sportsEyebrow")}
      icon={<Users />}
      title={
        <>
          {t("sportsTitleLine1")}
          <br />
          {t("sportsTitleLine2")}
        </>
      }
      description={
        <>
          <p>{t("sportsP1")}</p>
        </>
      }
    >
      <SportConditionsDemo />
    </Section>
  );
}

function SectionOpenSource() {
  const [ref, visible] = useReveal();
  const t = useTranslations("AboutPage");
  return (
    <section className="px-6 py-28 sm:py-36 bg-slate-900 text-slate-100">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <GithubIcon className="h-10 w-10 mx-auto text-slate-400" />
        <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight">
          {t("osTitle")}
        </h2>
        <p className="mt-6 text-slate-400 text-lg leading-relaxed">
          {t("osDesc")}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://github.com/Guillaumeperrottet/openwind"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <GithubIcon />
            {t("osGithubCta")}
          </a>
          <Link
            href="/spots/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            {t("osSpotCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const t = useTranslations("AboutPage");
  return (
    <footer className="px-6 py-10 border-t border-slate-200 text-center text-xs text-slate-400">
      <p>
        {t("footerText")}{" "}
        <Link
          href="/"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          {t("footerLink")}
        </Link>
      </p>
    </footer>
  );
}

// Inline GitHub mark — lucide-react doesn't ship a Github icon anymore.
function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17.92-.26 1.9-.39 2.88-.4.98 0 1.96.13 2.88.4 2.2-1.49 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.14v3.18c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

// ─── Reveal header (used in full-bleed sections) ──────────────────────────────

function RevealHeader({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  icon?: React.ReactNode;
}) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`max-w-2xl transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-center gap-2 text-blue-700/80">
        {icon && <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
        <span className="text-xs font-semibold tracking-widest uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-slate-900">
        {title}
      </h2>
      <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
