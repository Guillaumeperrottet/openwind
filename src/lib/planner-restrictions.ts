/** Inclusive calendar dates in the spot's timezone. Annual periods can cross
 * New Year. Absolute periods are never silently repeated the following year. */
export interface PlannerClosure {
  kind: "ANNUAL" | "DATED";
  start: string;
  end: string;
  reason: { fr: string; de: string; it: string; en: string };
  sourceUrl: string;
}

export function closureApplies(closure: PlannerClosure, date: string): boolean {
  const value = closure.kind === "ANNUAL" ? date.slice(5) : date;
  return closure.kind === "ANNUAL" && closure.start > closure.end
    ? value >= closure.start || value <= closure.end
    : value >= closure.start && value <= closure.end;
}

export function dateRestriction(
  profile: { closures?: PlannerClosure[]; months?: number[] },
  date: string,
): "closure" | "season" | undefined {
  if (profile.closures?.some((c) => closureApplies(c, date))) return "closure";
  if (
    profile.months?.length &&
    !profile.months.includes(Number(date.slice(5, 7)))
  )
    return "season";
}

const clocks = new Map<string, Intl.DateTimeFormat>();

/** The hourly sample is in UTC, but access hours are local wall-clock minutes.
 * Clipping each sample separately also handles timezone and DST changes. */
export function accessInterval(
  time: number,
  timezone: string,
  hours?: { from: number; to: number },
): { start: number; end: number } {
  if (!hours) return { start: time, end: time + 3600000 };
  let clock = clocks.get(timezone);
  if (!clock) {
    clock = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    // Bounded because forecasts can introduce new IANA zones over time.
    if (clocks.size >= 32) clocks.delete(clocks.keys().next().value!);
    clocks.set(timezone, clock);
  }
  const parts = clock.formatToParts(time);
  const minutes =
    Number(parts.find((p) => p.type === "hour")?.value) * 60 +
    Number(parts.find((p) => p.type === "minute")?.value);
  return {
    start: time + Math.max(0, hours.from - minutes) * 60000,
    end: time + Math.min(60, hours.to - minutes) * 60000,
  };
}
