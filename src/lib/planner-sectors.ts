export interface WindSector {
  from: number;
  to: number;
}
export function inSector(direction: number, sectors: WindSector[]): boolean {
  if (!Number.isFinite(direction)) return false;
  const d = ((direction % 360) + 360) % 360;
  return sectors.some((s) =>
    s.from <= s.to ? d >= s.from && d <= s.to : d >= s.from || d <= s.to,
  );
}
/** A full compass does not document a selective launch orientation. */
export function coversCompass(sectors: WindSector[]): boolean {
  const spans = sectors
    .flatMap((s) =>
      s.from <= s.to
        ? [[s.from, s.to]]
        : [
            [s.from, 360],
            [0, s.to],
          ],
    )
    .sort((a, b) => a[0] - b[0]);
  let end = 0;
  for (const span of spans) {
    if (span[0] > end) return false;
    end = Math.max(end, span[1]);
  }
  return end >= 360;
}
