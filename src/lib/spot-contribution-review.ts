import { spotFingerprint, type ReviewableSpot } from "./planner-spot-fingerprint";
import { reviewSchema } from "./planner-review";
import { COMPASS_DIRECTIONS } from "./spot-completeness";
import type { NewSpotInput } from "./spot-contribution";
import { addDays } from "./planner";
/** Preserve a contributor's sources for editorial review; never approve them automatically. */
export function submittedSpotReview(spot: ReviewableSpot, input: NewSpotInput, today: string) {
  const sources: { title: string; url: string; covers: ("discipline" | "directions" | "season" | "access")[] }[] = [];
  for (const topic of ["discipline", "directions", "season", "access"] as const) {
    const url = input.sources![topic], existing = sources.find(source => source.url === url);
    if (existing) existing.covers.push(topic); else sources.push({ title: "Source de contribution — " + topic, url, covers: [topic] });
  }
  const selected = COMPASS_DIRECTIONS.map(d => input.bestWindDirections.includes(d));
  const begin = (selected.indexOf(false) + 1) % 16, sectors: { from: number; to: number }[] = [];
  let start: number | null = null;
  for (let step = 0; step <= 16; step++) {
    const index = (begin + step) % 16;
    if (step < 16 && selected[index]) { start ??= index; }
    else if (start !== null) {
      sectors.push({ from: (start * 22.5 - 11.25 + 360) % 360, to: (((index + 15) % 16) * 22.5 + 11.25) % 360 });
      start = null;
    }
  }
  const original = input.seasonDetails ? `\n${input.seasonDetails}` : "";
  return reviewSchema.parse({
    version: 1, status: "NEEDS_REVIEW", discipline: input.discipline,
    fingerprint: spotFingerprint(spot), reviewedAt: today, expiresAt: addDays(today, 90),
    sectors, season: input.seasonMode, months: input.seasonMode === "MONTHS" ? input.bestMonths.map(Number) : [], access: "CONDITIONAL", sources,
    notes: {
      fr: "Informations et sources fournies par un contributeur, à vérifier par Openwind avant toute recommandation." + original,
      en: "Contributor information and sources. Openwind must verify them before any recommendation. Original season note:" + original,
      de: "Angaben und Quellen eines Mitwirkenden. Vor Empfehlungen durch Openwind zu prüfen. Saisonhinweis im Original:" + original,
      it: "Informazioni e fonti di un contributore, da verificare prima di ogni suggerimento. Nota stagionale originale:" + original,
    },
  });
}
