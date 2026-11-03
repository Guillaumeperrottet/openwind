import type { LakeTemperature, WaterPoint } from "./lake-temperature";

const HOUR = 3_600_000;
/** Stable numeric range across Node/browser ICU versions; equal rounded bounds collapse. */
export function lakeDisplayRange(first: string, last: string) {
  return first === last ? first : [first, last].join(" – ");
}
export function lakeExplorerChart(series: LakeTemperature | null, now: number) {
  const points = series?.points.filter((p) => {
    const t = Date.parse(p.time);
    return t >= now - 24 * HOUR && t <= now + 72 * HOUR;
  }) ?? [];
  if (points.length < 2) return null;
  const start = Date.parse(points[0].time);
  const end = Date.parse(points.at(-1)!.time);
  if (start === end) return null;
  const low = Math.floor(Math.min(...points.map((p) => p.temperatureC))) - 0.5;
  const high = Math.max(low + 2, Math.ceil(Math.max(...points.map((p) => p.temperatureC))) + 0.5);
  const x = (time: string) => (Date.parse(time) - start) / (end - start) * 600;
  const y = (value: number) => 220 - (value - low) / (high - low) * 220;
  const segments: { future: boolean; points: WaterPoint[]; path: string }[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    // Do not join outages or imply a continuous series where samples are absent.
    if (Date.parse(b.time) - Date.parse(a.time) > 4 * HOUR) continue;
    const ta = Date.parse(a.time), tb = Date.parse(b.time);
    if (ta < now && tb > now) {
      // Split only the drawn line at now. The reading/table keep actual samples.
      const mx = (now - start) / (end - start) * 600;
      const my = y(a.temperatureC + (b.temperatureC - a.temperatureC) * (now - ta) / (tb - ta));
      segments.push({ future: false, points: [a, b], path: `M ${x(a.time)} ${y(a.temperatureC)} L ${mx} ${my}` });
      segments.push({ future: true, points: [a, b], path: `M ${mx} ${my} L ${x(b.time)} ${y(b.temperatureC)}` });
    } else {
      segments.push({ future: tb > now, points: [a, b], path: `M ${x(a.time)} ${y(a.temperatureC)} L ${x(b.time)} ${y(b.temperatureC)}` });
    }
  }
  return {
    points, low, high, segments,
    ticks: [high, (low + high) / 2, low],
    times: [0, 1 / 3, 2 / 3, 1].map((fraction) => new Date(start + (end - start) * fraction).toISOString()),
    nowX: now >= start && now <= end ? (now - start) / (end - start) * 600 : null,
  };
}
