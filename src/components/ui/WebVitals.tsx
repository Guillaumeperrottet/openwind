"use client";
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { vitalPayload, vitalsContext } from "@/lib/core-web-vitals";

let documentContext: ReturnType<typeof vitalsContext> | undefined;
const delivered = new Map<string, number>();
const report: Parameters<typeof useReportWebVitals>[0] = metric => {
  // Local timing is not a production score. Use the existing Google tag only.
  if (process.env.NODE_ENV !== "production" || typeof window === "undefined" || !["www.openwind.ch", "openwind.ch"].includes(window.location.hostname)) return;
  const payload = vitalPayload(metric, documentContext ?? null);
  if (!payload) return;
  const key = `${metric.id}:${metric.name}`;
  if (delivered.get(key) === payload.metric_value) return;
  delivered.set(key, payload.metric_value);
  if (delivered.size > 100) delivered.delete(delivered.keys().next().value!);
  try {
    if (typeof window.gtag === "function") window.gtag("event", "web_vital", payload);
    else { window.dataLayer = window.dataLayer ?? []; window.dataLayer.push({ event: "web_vital", ...payload }); }
  } catch { /* Analytics must never interrupt navigation. */ }
};

export function WebVitals() {
  useEffect(() => { if (documentContext === undefined) documentContext = vitalsContext(window.location.pathname, window.location.search); }, []);
  useReportWebVitals(report);
  return null;
}
