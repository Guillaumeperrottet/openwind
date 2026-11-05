"use client";

import { useEffect } from "react";
import { X, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useFavContext } from "@/lib/FavContext";

export function FavoriteFeedback({ notice, preferencesError, onDismiss, onRetryPreferences }: {
  notice: "savedLocally" | "favoriteError" | "storageError" | "localLimit" | "syncError" | null;
  preferencesError: boolean;
  onDismiss: () => void;
  onRetryPreferences: () => unknown;
}) {
  const pathname = usePathname();
  const hideSuccess = notice === "savedLocally" && pathname === "/mon-openwind";
  const t = useTranslations("PersonalExperience");
  const { user, requestSignup, retryFavorites } = useFavContext();
  useEffect(() => {
    if (notice !== "savedLocally" || preferencesError) return;
    if (hideSuccess) { queueMicrotask(onDismiss); return; }
    const timer = setTimeout(onDismiss, 12000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss, hideSuccess, preferencesError]);
  if ((!notice || hideSuccess) && !preferencesError) return null;
  return (
    <aside className="fixed inset-x-3 z-[150] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-6" style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }} aria-label={t("feedback")}>
      <div className="flex items-start gap-3">
        <Star aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sky-800" />
        <p role="status" className="flex-1 text-sm leading-6 text-slate-800">{t(preferencesError ? "preferencesError" : notice ?? "preferencesError")}</p>
        <button type="button" aria-label={t("close")} onClick={onDismiss} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"><X aria-hidden className="h-4 w-4" /></button>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 pl-8 text-sm font-semibold text-sky-800">
        {notice === "savedLocally" && !preferencesError && <Link onClick={onDismiss} href="/mon-openwind" className="inline-flex min-h-11 items-center underline underline-offset-4">{t("seeFavorites")}</Link>}
        {notice === "localLimit" && !user && <button onClick={requestSignup} className="min-h-11">{t("sync")}</button>}
        {(preferencesError || ((notice === "syncError" || notice === "favoriteError") && user)) && <button onClick={() => {
          if (preferencesError) void onRetryPreferences();
          if (user && (notice === "syncError" || notice === "favoriteError")) retryFavorites();
        }} className="min-h-11">{t("retry")}</button>}
      </div>
    </aside>
  );
}
