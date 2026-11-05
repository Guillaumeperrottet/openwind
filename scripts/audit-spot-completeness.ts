/** Read-only catalogue audit. No writes to the database, no user/account data. */
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { prisma } from "../src/lib/prisma";
import { loadReviews, spotFingerprint } from "../src/lib/planner-review-store";
import { qualifyReview } from "../src/lib/planner-review";
import { spotInformationIssues } from "../src/lib/spot-completeness";
import { normalizeSpotMonths } from "../src/lib/spot-months";
import { localDate } from "../src/lib/planner";
async function main() {
  const spots = await prisma.spot.findMany({ orderBy: { name: "asc" }, select: {
    id: true, name: true, latitude: true, longitude: true, sportType: true, country: true, region: true,
    description: true, difficulty: true, waterType: true, minWindKmh: true, maxWindKmh: true,
    bestMonths: true, bestWindDirections: true, access: true, hazards: true,
  } });
  const reviews = await loadReviews(spots.map(s => s.id)), today = localDate(new Date());
  const rows = spots.map(spot => {
    const review = reviews.get(spot.id), qualification = qualifyReview(review ?? null, spotFingerprint(spot), spot.sportType, today, today, today, "fr");
    return { ...spot, fingerprint: spotFingerprint(spot), missing: spotInformationIssues(spot, review), normalizedMonths: normalizeSpotMonths(spot.bestMonths), reviewStatus: qualification.status, discipline: qualification.discipline, sources: qualification.sources, review: review ?? null };
  });
  const counts = <T extends string>(values: T[]) => values.reduce((acc, key) => ({ ...acc, [key]: (acc[key] ?? 0) + 1 }), {} as Record<T, number>);
  const summary = { total: rows.length, monthFormatsToNormalize: rows.filter(r => JSON.stringify(r.bestMonths) !== JSON.stringify(r.normalizedMonths)).length, withInformationIssues: rows.filter(r => r.missing.length).length, missingFields: counts(rows.flatMap(r => r.missing)), reviewStatuses: counts(rows.map(r => r.reviewStatus)), countries: counts(rows.map(r => r.country ?? "Unknown")) };
  const report = { date: today, readOnly: true, summary, spots: rows };
  const index = process.argv.indexOf("--output");
  if (index >= 0 && process.argv[index + 1]) await writeFile(process.argv[index + 1], JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify(summary, null, 2));
}
main().catch(() => { console.error("Catalogue audit failed; no database changes were made."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
