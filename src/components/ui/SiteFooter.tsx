"use client";

import { ArrowUpRight, Mail, MapPin, Wind } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const linkClass =
  "group inline-flex w-fit items-center gap-1.5 text-sm text-slate-300 transition hover:text-white";

export function SiteFooter() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Footer");

  // The wind map is a full-screen tool, and the admin has its own shell.
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white" aria-labelledby="site-footer-heading">
      <div
        className="relative h-16 overflow-hidden sm:h-20"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M0 58c135-20 213-17 326 1 113 17 208 13 318-8 135-26 232-22 352 3 123 26 242 22 444-10v36H0Z"
            fill="#e0f2fe"
          />
          <path
            d="M0 68c127-4 207-20 313-13 116 8 183 25 309 18 121-6 192-26 320-17 116 8 213 27 329 18 62-5 112-13 169-15v21H0Z"
            fill="#0f172a"
          />
        </svg>

        <svg
          viewBox="0 0 72 54"
          className="absolute left-[10%] top-0 h-12 w-16 -rotate-3 sm:left-[18%] sm:h-14 sm:w-[4.5rem]"
          fill="none"
          stroke="#0f172a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        >
          <path
            d="M5 16C16 1 52 0 67 16c-19-7-43-7-62 0Z"
            fill="#bae6fd"
          />
          <path d="M18 11c5-2 10-3 17-3m19 3c-5-2-10-3-17-3" opacity=".45" />
          <path d="m7 16 25 22M22 12l11 26m34-22L40 38m10-26L39 38" />
          <path d="M32 38c2 3 6 4 9 1" />
          <circle cx="36.5" cy="36" r="2.1" fill="#0f172a" stroke="none" />
          <path d="m36 39 2 7m0-2 6 3m-7-4-4 5" strokeWidth="1.7" />
          <path d="M31 47c4 3 9 3 13 0" strokeWidth="2" />
        </svg>

        <svg
          viewBox="0 0 72 54"
          className="absolute left-[50%] top-0 hidden h-12 w-16 rotate-2 sm:block"
          fill="none"
          stroke="#0f172a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        >
          <path
            d="M6 16C19 3 50 2 66 17c-18-7-42-7-60-1Z"
            fill="#e0f2fe"
          />
          <path d="M20 11c5-2 10-2 16-2m17 3c-5-2-10-3-16-3" opacity=".4" />
          <path d="m8 16 24 21m14-25L39 37m26-20L40 37M23 12l10 25" />
          <path d="M32 37c2 3 6 4 9 1" />
          <circle cx="36.5" cy="35" r="2" fill="#0f172a" stroke="none" />
          <path d="m36 38 2 7m0-2 6 3m-7-3-4 5" strokeWidth="1.7" />
          <path d="M31 47c4 3 9 3 13 0" strokeWidth="2" />
        </svg>

        <svg
          viewBox="0 0 92 58"
          className="absolute right-[5%] top-0 h-14 w-[5.5rem] sm:right-[13%] sm:h-16 sm:w-24"
          fill="none"
          stroke="#0f172a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        >
          <path
            d="M48 8C62 1 79 5 88 17c-11-5-21-5-30-1-4 2-7 4-10 7 1-6 1-10 0-15Z"
            fill="#7dd3fc"
          />
          <path d="M57 16c8-3 17-3 25-1" opacity=".45" />
          <path d="M50 22 42 40m37-25L44 40" strokeWidth=".9" />
          <path d="M40 40h6" strokeWidth="2" />
          <circle cx="39" cy="39" r="2.2" fill="#0f172a" stroke="none" />
          <path d="m38 42-2 7m1-5 7-3m-7 7-7 5m7-5 8 4" strokeWidth="1.9" />
          <path d="M27 54c8 2 17 2 25-1" strokeWidth="2.5" />
          <path d="M20 57c6-2 11-2 17 0m19-1c5-2 10-2 15 0" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div>
              <Link
                href="/?view=map"
                className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-sm transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
                aria-label="Openwind — carte du vent"
              >
                <Image
                  src="/logo_noback.png"
                  alt=""
                  width={2000}
                  height={300}
                  className="h-auto w-40 sm:w-44"
                />
              </Link>
              <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                <Wind className="h-4 w-4" />
                {t("eyebrow")}
              </p>
              <h2
                id="site-footer-heading"
                className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl"
              >
                {t("headline")}
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-400">
                {t("description")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
              <nav aria-label={t("explore")}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("explore")}
                </h3>
                <div className="mt-5 flex flex-col gap-3.5">
                  <Link href="/?view=map" className={linkClass}>
                    {t("map")}
                  </Link>
                  <Link href="/balises" className={linkClass}>
                    {t("stations")}
                  </Link>
                  <Link href="/plan" className={linkClass}>
                    {t("plan")}
                  </Link>
                  <Link href="/webcams" className={linkClass}>
                    {t("webcams")}
                  </Link>
                  {locale === "fr" && (
                    <Link href="/carnet" className={linkClass}>
                      {t("carnet")}
                    </Link>
                  )}
                </div>
              </nav>

              <nav aria-label={t("community")}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("community")}
                </h3>
                <div className="mt-5 flex flex-col gap-3.5">
                  <Link href="/forum" className={linkClass}>
                    {t("forum")}
                  </Link>
                  <Link href="/spots/new" className={linkClass}>
                    {t("addSpot")}
                  </Link>
                  <Link href="/about" className={linkClass}>
                    {t("about")}
                  </Link>
                  <a
                    href="https://github.com/Guillaumeperrottet/openwind"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    GitHub
                    <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </nav>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("contact")}
                </h3>
                <div className="mt-5 flex flex-col gap-4 text-sm text-slate-300">
                  <a
                    href="mailto:hello@openwind.ch"
                    className="group inline-flex items-center gap-2 transition hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-sky-300" />
                    hello@openwind.ch
                  </a>
                  <p className="flex items-start gap-2 leading-5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                    {t("region")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Openwind</p>
            <p>{t("openSource")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
