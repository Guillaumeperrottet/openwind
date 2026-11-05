"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";
import { authErrorMessage } from "@/lib/auth-errors";
import { toSiteLocale } from "@/lib/site";
const COPY = {
  fr: { retry: "Se connecter", close: "Fermer" }, en: { retry: "Sign in", close: "Close" },
  de: { retry: "Anmelden", close: "Schließen" }, it: { retry: "Accedi", close: "Chiudi" },
};
export function AuthFeedback() {
  const query = useSearchParams(), pathname = usePathname(), router = useRouter();
  const locale = toSiteLocale(useLocale()), c = COPY[locale];
  const { requestAuth } = useFavContext();
  if (query.get("auth_error") !== "1") return null;
  const dismiss = () => {
    const next = new URLSearchParams(query.toString()); next.delete("auth_error");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}${window.location.hash}`, { scroll: false });
  };
  return <aside role="alert" className="fixed inset-x-3 top-16 z-[160] mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
    <div className="flex items-start gap-3"><p className="flex-1 text-sm leading-6 text-slate-700">{authErrorMessage({}, locale)}</p><button type="button" onClick={dismiss} aria-label={c.close} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"><X size={18} aria-hidden /></button></div>
    <button type="button" onClick={() => { dismiss(); requestAuth(); }} className="min-h-11 text-sm font-semibold underline underline-offset-4">{c.retry}</button>
  </aside>;
}
