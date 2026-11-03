"use client";

import { useTranslations } from "next-intl";

export function RequestFeedback({ error, pending = false, hasData = false, onRetry }: {
  error: boolean;
  pending?: boolean;
  hasData?: boolean;
  onRetry: () => void;
}) {
  const t = useTranslations("FieldExperience");
  if (!error) return null;
  return <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
    <p role="status" className="flex-1 basis-48">{t(hasData ? "refreshFailed" : "unavailable")}</p>
    <button type="button" disabled={pending} onClick={onRetry} className="min-h-11 rounded-lg px-3 font-semibold underline underline-offset-4 disabled:opacity-60">{t(pending ? "retrying" : "retry")}</button>
  </div>;
}
