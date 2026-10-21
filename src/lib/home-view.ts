/** Explicit links always win over an account's saved launch preference. */
export function resolveHomeView(
  view: string | string[] | undefined,
  preference?: { onboardingCompleted: boolean; defaultView: string } | null,
): "home" | "map" | "dashboard" {
  if (view === "map" || view === "home") return view;
  if (preference?.onboardingCompleted)
    return preference.defaultView === "DASHBOARD" ? "dashboard" : "map";
  return "home";
}
