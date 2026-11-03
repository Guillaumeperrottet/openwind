/** Public Alplakes model, independently verified against its metadata. */
export const MORLON_SPOT_ID = "cmnq613tx00it04kw1d0vraq4";
export const ALPLAKES_GRUYERE = {
  lake: "gruyere", model: "simstrat", depthM: 1,
  page: "https://www.alplakes.eawag.ch/gruyere",
  licence: "https://creativecommons.org/licenses/by/4.0/",
} as const;
export type WaterPoint = { time: string; temperatureC: number };
export type LakeTemperature = { depthM: number; points: WaterPoint[] };

const DAY = 86_400_000;
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid Alplakes response");
  return value as Record<string, unknown>;
}
function dateOnly(value: unknown): number {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid Alplakes date");
  const ms = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) throw new Error("Invalid Alplakes date");
  return ms;
}

/** Only request the advertised coverage; this lake has a 1D, not a 3D, model. */
export function gruyereRequestRange(raw: unknown, now: number) {
  const data = record(raw);
  const temperature = record(record(data.variables).T);
  if (data.name !== ALPLAKES_GRUYERE.lake || !Array.isArray(data.depth) || !data.depth.includes(1) || temperature.unit !== "degC") throw new Error("Unsupported Alplakes model");
  const day = Math.floor(now / DAY) * DAY;
  const end = Math.min(day + 3 * DAY, dateOnly(data.end_date));
  const start = Math.max(Math.min(day - DAY, end - DAY), dateOnly(data.start_date));
  if (end <= start || end < day - DAY) throw new Error("Alplakes coverage unavailable");
  const compact = (time: number) => new Date(time).toISOString().replace(/[-:T]/g, "").slice(0, 12);
  return { start: compact(start), end: compact(end), startMs: start, endMs: end };
}

export function parseAlplakesTemperature(raw: unknown, range: { startMs: number; endMs: number }): LakeTemperature {
  const data = record(raw);
  const depth = record(data.depth);
  const temperature = record(record(data.variables).T);
  if (depth.data !== 1 || depth.unit !== "m" || temperature.unit !== "degC" || data.resample !== null) throw new Error("Unexpected Alplakes depth or unit");
  const times = data.time;
  const values = temperature.data;
  if (!Array.isArray(times) || !Array.isArray(values) || times.length !== values.length || times.length > 1000) throw new Error("Invalid Alplakes series");
  const points = new Map<number, WaterPoint>();
  times.forEach((time, index) => {
    const value = values[index];
    if (typeof time !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(time)) return;
    const ms = Date.parse(time);
    if (!Number.isFinite(ms) || ms < range.startMs || ms > range.endMs || typeof value !== "number" || !Number.isFinite(value) || value < -2 || value > 45) return;
    points.set(ms, { time: new Date(ms).toISOString(), temperatureC: value });
  });
  if (!points.size) throw new Error("Alplakes temperature unavailable");
  return { depthM: 1, points: [...points.entries()].sort(([a], [b]) => a - b).map(([, point]) => point) };
}

export function waterTemperatureView(series: LakeTemperature | null, now: number) {
  const current = series?.points.filter((point) => Date.parse(point.time) <= now).at(-1) ?? null;
  const age = current ? now - Date.parse(current.time) : Infinity;
  const available = age <= DAY;
  const future = series?.points.filter((point) => Date.parse(point.time) > now && Date.parse(point.time) <= now + 3 * DAY) ?? [];
  const days = new Map<string, WaterPoint[]>();
  const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" });
  future.forEach((point) => {
    const key = dateFormat.format(new Date(point.time));
    days.set(key, [...(days.get(key) ?? []), point]);
  });
  return {
    current: available ? current : null,
    stale: available && age > 6 * 60 * 60_000,
    // These are the available model samples, not a guarantee of an entire day's extrema.
    days: [...days.entries()].slice(0, 3).map(([date, points]) => ({ date, first: points[0].time, last: points.at(-1)!.time, min: Math.min(...points.map((p) => p.temperatureC)), max: Math.max(...points.map((p) => p.temperatureC)) })),
  };
}
