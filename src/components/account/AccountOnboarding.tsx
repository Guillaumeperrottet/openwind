"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Map, ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useFavContext } from "@/lib/FavContext";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import type { DefaultView } from "@/lib/user-preferences";

export function AccountOnboarding() {
  const t = useTranslations("MonOpenwind.onboarding");
  const router = useRouter();
  const {
    user,
    preferences,
    preferencesLoading,
    updatePreferences,
  } = useFavContext();
  const [selection, setSelection] = useState<DefaultView>("DASHBOARD");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const visible = Boolean(
    user &&
      !preferencesLoading &&
      preferences &&
      !preferences.onboardingCompleted,
  );

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  const confirm = async () => {
    if (saving) return;
    setSaveError(false);
    setSaving(true);
    const saved = await updatePreferences({
      defaultView: selection,
      onboardingCompleted: true,
    });
    setSaving(false);
    if (!saved) {
      setSaveError(true);
      return;
    }

    trackEvent("openwind_onboarding_completed", {
      default_view: selection.toLowerCase(),
    });
    router.replace(selection === "DASHBOARD" ? "/mon-openwind" : "/?view=map");
  };

  const options: Array<{
    value: DefaultView;
    icon: typeof Map;
    title: string;
    description: string;
  }> = [
    {
      value: "DASHBOARD",
      icon: LayoutDashboard,
      title: t("dashboardTitle"),
      description: t("dashboardDescription"),
    },
    {
      value: "MAP",
      icon: Map,
      title: t("mapTitle"),
      description: t("mapDescription"),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="openwind-onboarding-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <span className="text-lg font-black">OW</span>
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            {t("eyebrow")}
          </p>
          <h2
            id="openwind-onboarding-title"
            className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
          >
            {t("title")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-8 sm:py-6">
          {options.map(({ value, icon: Icon, title, description }) => {
            const selected = selection === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelection(value)}
                className={cn(
                  "relative min-h-36 rounded-2xl border p-5 text-left transition-all",
                  selected
                    ? "border-sky-500 bg-sky-50/70 shadow-[0_0_0_3px_rgba(14,165,233,0.10)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "mb-4 flex h-10 w-10 items-center justify-center rounded-xl",
                    selected
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-600",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block pr-8 text-base font-semibold text-slate-950">
                  {title}
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  {description}
                </span>
                {selected && (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className={saveError ? "text-xs text-red-600" : "text-xs text-slate-400"}>
            {saveError ? t("error") : t("changeLater")}
          </p>
          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? t("saving") : t("continue")}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
