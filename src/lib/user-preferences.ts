export const DEFAULT_DASHBOARD_LAYOUT = [
  "FAVORITES",
  "FORECAST",
  "ARTICLES",
  "COMMUNITY",
  "QUICK_ACTIONS",
] as const;

export const DASHBOARD_MODULES = DEFAULT_DASHBOARD_LAYOUT;

export type DashboardModule = (typeof DASHBOARD_MODULES)[number];
export type DefaultView = "MAP" | "DASHBOARD";
export type SportFilter = "ALL" | "KITE" | "PARAGLIDE";

// Used only when an authenticated account has no preference row yet. It keeps
// the one-time onboarding exclusive to accounts created after the feature was
// introduced, even if two initial sync requests arrive concurrently.
const MON_OPENWIND_LAUNCH = Date.parse("2026-08-26T09:00:00Z");

export function shouldOnboardAccount(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const timestamp = Date.parse(createdAt);
  return Number.isFinite(timestamp) && timestamp >= MON_OPENWIND_LAUNCH;
}

export interface AccountPreferences {
  sportFilter: SportFilter;
  useKnots: boolean;
  defaultView: DefaultView;
  onboardingCompleted: boolean;
  dashboardLayout: DashboardModule[];
  mapView: {
    center: [number, number];
    zoom: number;
  } | null;
}

export const DEFAULT_PREFERENCES: AccountPreferences = {
  sportFilter: "ALL",
  useKnots: true,
  defaultView: "MAP",
  onboardingCompleted: true,
  dashboardLayout: [...DEFAULT_DASHBOARD_LAYOUT],
  mapView: null,
};

export type PreferencePatch = Partial<AccountPreferences>;

/** Only explicitly changed guest settings are imported into an account. */
export function parseLocalPreferences(value: unknown): PreferencePatch {
  if (!value || typeof value !== "object") return {};
  const input = value as Record<string, unknown>;
  const result: PreferencePatch = {};
  if (typeof input.useKnots === "boolean") result.useKnots = input.useKnots;
  if (["ALL", "KITE", "PARAGLIDE"].includes(String(input.sportFilter)))
    result.sportFilter = input.sportFilter as SportFilter;
  if (input.defaultView === "MAP" || input.defaultView === "DASHBOARD")
    result.defaultView = input.defaultView;
  return result;
}

export function normalizeDashboardLayout(value: unknown): DashboardModule[] {
  if (!Array.isArray(value)) return [...DEFAULT_DASHBOARD_LAYOUT];

  const allowed = new Set<string>(DASHBOARD_MODULES);
  const unique = value.filter(
    (item, index): item is DashboardModule =>
      typeof item === "string" &&
      allowed.has(item) &&
      value.indexOf(item) === index,
  );

  return unique.length > 0 ? unique : [...DEFAULT_DASHBOARD_LAYOUT];
}
