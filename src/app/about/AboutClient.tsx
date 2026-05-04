"use client";

import Link from "next/link";
import {
  ArrowRight,
  Map as MapIcon,
  Compass,
  Calendar,
  Activity,
  MessageSquare,
  Users,
} from "lucide-react";
import { useReveal } from "./useReveal";
import {
  MiniMapDemo,
  MiniForecastDemo,
  NetworksGrid,
  MiniPlannerDemo,
  MiniArchivesDemo,
  MiniForumDemo,
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
      <SectionArchives />
      <SectionForum />
      <SectionSports />
      <SectionOpenSource />
      <Footer />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      <WindStreaks />
      <div className="relative z-10 text-center max-w-4xl">
        <p className="text-sm font-medium text-blue-700/80 tracking-widest uppercase">
          Open Source · Suisse & monde
        </p>
        <h1 className="mt-6 text-[14vw] sm:text-[8rem] lg:text-[10rem] leading-[0.9] font-semibold tracking-[-0.04em] text-slate-900">
          Open<span className="text-blue-600">wind</span>
        </h1>
        <p className="mt-8 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          La carte vivante du vent pour kitesurfeurs et parapentistes.
          <br className="hidden sm:block" />
          Six réseaux de stations, prévisions à 7 jours, archives sur 5 ans.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Explorer la carte
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="https://github.com/Guillaumeperrottet/openwind"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <GithubIcon />
            Source
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-[11px] uppercase tracking-widest">
        <span>scroll</span>
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
  return (
    <Section
      eyebrow="Carte"
      icon={<MapIcon />}
      title={
        <>
          Toutes les stations,
          <br />
          en un coup d&apos;œil.
        </>
      }
      description={
        <>
          <p>
            Une carte mondiale qui agrège six réseaux de stations
            météorologiques en temps réel. Les flèches indiquent la direction,
            la couleur la force, et un halo pulse quand ça souffle.
          </p>
          <p className="text-sm text-slate-500">
            Mises à jour toutes les minutes, accessible sans compte.
          </p>
        </>
      }
    >
      <MiniMapDemo />
    </Section>
  );
}

function SectionNetworks() {
  return (
    <section className="bg-slate-50/60 px-6 py-28 sm:py-36 border-y border-black/4">
      <div className="max-w-6xl mx-auto">
        <RevealHeader
          eyebrow="Sources"
          icon={<Activity />}
          title={
            <>
              Six réseaux,
              <br />
              <span className="text-blue-600">une seule interface.</span>
            </>
          }
          description="Pas besoin de jongler entre dix sites. Openwind unifie les principaux réseaux publics et communautaires."
        />
        <div className="mt-12">
          <NetworksGrid />
        </div>
      </div>
    </section>
  );
}

function SectionForecast() {
  return (
    <Section
      reverse
      eyebrow="Prévisions"
      icon={<Calendar />}
      title={
        <>
          Sept jours d&apos;avance,
          <br />
          deux modèles au choix.
        </>
      }
      description={
        <>
          <p>
            Open-Meteo en couverture mondiale, MeteoSwiss ICON-CH2-EPS pour une
            précision locale en Suisse. Un score visuel par tranche horaire dit
            en un clin d&apos;œil si la session vaut le déplacement.
          </p>
          <p className="text-sm text-slate-500">
            Vent, rafales, direction, température, pluie — tout est là.
          </p>
        </>
      }
    >
      <MiniForecastDemo />
    </Section>
  );
}

function SectionPlanner() {
  return (
    <Section
      eyebrow="Trip Planner"
      icon={<Compass />}
      title={
        <>
          Quand
          <br />
          partir où ?
        </>
      }
      description={
        <>
          <p>
            Indique tes dates, ton rayon et ton sport. Openwind classe les spots
            autour de toi par qualité de vent prévue, sur la base d&apos;un
            score multi-critères.
          </p>
          <p className="text-sm text-slate-500">
            Au-delà de 16 jours, on bascule sur les archives historiques pour
            les voyages lointains.
          </p>
        </>
      }
    >
      <MiniPlannerDemo />
    </Section>
  );
}

function SectionArchives() {
  return (
    <Section
      reverse
      eyebrow="Archives"
      icon={<Activity />}
      title={
        <>
          Cinq ans
          <br />
          de mémoire vent.
        </>
      }
      description={
        <>
          <p>
            Saisonnalité, tendances mensuelles, comparaison année par année. De
            quoi savoir si ce spot italien que tu vises est vraiment ventilé en
            septembre.
          </p>
        </>
      }
    >
      <MiniArchivesDemo />
    </Section>
  );
}

function SectionForum() {
  return (
    <Section
      eyebrow="Communauté"
      icon={<MessageSquare />}
      title={
        <>
          Le terrain
          <br />
          plutôt que les modèles.
        </>
      }
      description={
        <>
          <p>
            Un forum simple pour partager ses sessions, ses spots secrets, ses
            conseils matériel. Markdown, votes et threads — pas de bruit.
          </p>
        </>
      }
    >
      <MiniForumDemo />
    </Section>
  );
}

function SectionSports() {
  return (
    <Section
      reverse
      eyebrow="Multi-sport"
      icon={<Users />}
      title={
        <>
          Kite ou parapente,
          <br />
          chacun ses critères.
        </>
      }
      description={
        <>
          <p>
            Un kitesurfeur cherche du vent, un parapentiste fuit les rafales.
            Openwind ajuste son scoring et ses filtres au sport choisi.
          </p>
        </>
      }
    >
      <SportConditionsDemo />
    </Section>
  );
}

function SectionOpenSource() {
  const [ref, visible] = useReveal();
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
          100% open source.
        </h2>
        <p className="mt-6 text-slate-400 text-lg leading-relaxed">
          Code, données, modèles : tout est public. Tu peux contribuer un spot,
          un réseau de stations, un correctif — ou juste lire le code pour
          comprendre comment c&apos;est fait.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://github.com/Guillaumeperrottet/openwind"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <GithubIcon />
            Voir sur GitHub
          </a>
          <Link
            href="/spots/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Proposer un spot
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-slate-200 text-center text-xs text-slate-400">
      <p>
        Openwind · cartographie du vent open source.{" "}
        <Link
          href="/"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          Aller à la carte →
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
