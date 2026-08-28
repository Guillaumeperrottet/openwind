"use client";

import { track as trackVercelEvent } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean;

export type AnalyticsParams = Record<
  string,
  AnalyticsValue | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, AnalyticsValue>,
    ) => void;
  }
}

/**
 * Send a business event through the Google tag already loaded by GTM.
 * Undefined/null parameters are dropped and callers must never include PII.
 */
export function trackEvent(
  eventName: string,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined") return;

  const cleanParams: Record<string, AnalyticsValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) cleanParams[key] = value;
  }

  // Vercel powers the concise product/sponsor reporting in the project
  // dashboard. Analytics must never interrupt the user action that triggered it.
  try {
    trackVercelEvent(eventName, cleanParams);
  } catch {
    // Ignore analytics failures and continue with the Google fallback below.
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, cleanParams);
    return;
  }

  // Fallback for the short interval before the Google tag is ready.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...cleanParams });
}
