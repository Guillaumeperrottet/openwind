"use client";

import type { ReactNode } from "react";
import { MapPin, UserPlus, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFavContext } from "@/lib/FavContext";
import { Link } from "@/i18n/navigation";

export function SpotContributionGate({ children }: { children: ReactNode }) {
  const { user, authLoading, requestAuth, requestSignup } = useFavContext();
  const t = useTranslations("SpotContribution");
  if (authLoading) return <div role="status" className="px-5 py-20 text-center text-slate-600">{t("loading")}</div>;
  if (user) return children;

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-56px)] max-w-xl flex-col justify-center px-5 py-16 text-center">
      <MapPin aria-hidden="true" className="mx-auto mb-6 h-10 w-10 text-sky-800" />
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{t("title")}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{t("description")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={requestSignup} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-800 px-5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
          <UserPlus aria-hidden="true" className="h-5 w-5" />{t("signup")}
        </button>
        <button type="button" onClick={requestAuth} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700">
          <LogIn aria-hidden="true" className="h-5 w-5" />{t("login")}
        </button>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-500">{t("returnHere")}</p>
      <Link href="/?view=map" className="mx-auto mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-sky-800 underline underline-offset-4">{t("back")}</Link>
    </section>
  );
}
