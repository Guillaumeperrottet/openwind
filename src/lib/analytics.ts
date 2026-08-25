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

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, cleanParams);
    return;
  }

  // Fallback for the short interval before the Google tag is ready.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...cleanParams });
}
