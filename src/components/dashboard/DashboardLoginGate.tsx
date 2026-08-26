"use client";

import { LayoutDashboard, LogIn, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFavContext } from "@/lib/FavContext";
import { Link } from "@/i18n/navigation";

export function DashboardLoginGate() {
  const t = useTranslations("MonOpenwind.private");
  const { requestAuth } = useFavContext();

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
          <LayoutDashboard className="h-8 w-8" />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={requestAuth}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            <LogIn className="h-4 w-4" />
            {t("signIn")}
          </button>
          <Link
            href="/?view=map"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t("backToMap")}
          </Link>
        </div>
        <p className="mt-8 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("privacy")}
        </p>
      </div>
    </div>
  );
}
