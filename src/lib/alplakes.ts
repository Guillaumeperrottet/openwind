import "server-only";
import { ALPLAKES_GRUYERE, gruyereRequestRange, parseAlplakesTemperature, type LakeTemperature } from "@/lib/lake-temperature";

const API = "https://alplakes-api.eawag.ch";
const DAY_SECONDS = 86_400;
const HEADERS = { "User-Agent": "Openwind/1.0 (https://www.openwind.ch; hello@openwind.ch)" };
// Coalesce simultaneous requests. Next's data cache persists the public responses.
// The single entry also prevents repeated upstream calls after errors or HTTP 429.
let entry: { until: number; promise: Promise<LakeTemperature | null> } | undefined;

async function read(path: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(8000),
    next: { revalidate: DAY_SECONDS, tags: ["alplakes-gruyere"] },
  });
  if (!response.ok) {
    const retry = response.headers.get("Retry-After");
    const seconds = Number(retry);
    const until = retry && Number.isFinite(seconds) ? Date.now() + seconds * 1000 : retry ? Date.parse(retry) : 0;
    if (entry) entry.until = Math.max(entry.until, Math.min(Date.now() + DAY_SECONDS * 1000, until || 0));
    throw new Error(`Alplakes ${response.status}`);
  }
  return response.json();
}

export function getGruyereWaterTemperature(now = Date.now()): Promise<LakeTemperature | null> {
  if (entry && now < entry.until) return entry.promise;
  const nextEntry = {
    until: now + 5 * 60_000,
    promise: Promise.resolve(null) as Promise<LakeTemperature | null>,
  };
  entry = nextEntry;
  nextEntry.promise = (async () => {
    try {
      const metadata = await read(`/simulations/1d/metadata/${ALPLAKES_GRUYERE.model}/${ALPLAKES_GRUYERE.lake}`);
      const range = gruyereRequestRange(metadata, now);
      const raw = await read(`/simulations/1d/point/simstrat/gruyere/${range.start}/${range.end}/1?variables=T`);
      const series = parseAlplakesTemperature(raw, range);
      // A daily stable URL keeps refreshes aligned with the daily model cadence.
      nextEntry.until = Math.min(now + DAY_SECONDS * 1000, (Math.floor(now / 86_400_000) + 1) * 86_400_000);
      return series;
    } catch {
      // Water data must never make the wind page fail. Never replace absence by 0°C.
      return null;
    }
  })();
  return nextEntry.promise;
}
