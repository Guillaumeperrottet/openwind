/** Read-only by default. --apply is a separate, explicit publication operation. */
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prisma } from "../src/lib/prisma";
import { completionAction, reviewAfterCompletion, spotCompletionPatches } from "../src/lib/spot-completion-patches";
import { loadReviews, spotFingerprint } from "../src/lib/planner-review-store";
import { REVIEW_PREFIX } from "../src/lib/planner-review";
async function main() {
  const patches = spotCompletionPatches(), ids = patches.map(p => p.id);
  const spots = await prisma.spot.findMany({ where: { id: { in: ids } } });
  const reviews = await loadReviews(ids);
  const stored = await prisma.systemConfig.findMany({ where: { key: { in: ids.map(id => REVIEW_PREFIX + id) } } });
  for (const patch of patches) {
    const spot = spots.find(s => s.id === patch.id); if (!spot) throw Error(`Missing spot: ${patch.name}`);
    const action = completionAction(spot, patch), review = reviews.get(patch.id);
    if (patch.review && JSON.stringify(review ?? null) !== JSON.stringify(patch.previousReview) && JSON.stringify(review) !== JSON.stringify(patch.review)) throw Error(`Administrative review changed: ${patch.name}`);
    if (review && !patch.review && review.fingerprint !== spotFingerprint(spot)) throw Error(`Review must be reconciled: ${patch.name}`);
    console.log(`${action}: ${patch.name}`);
  }
  if (!process.argv.includes("--apply")) { console.log("Preflight passed. No database changes."); return; }
  const backup = join(tmpdir(), `openwind-spot-completions-${Date.now()}.json`);
  await writeFile(backup, JSON.stringify({ spots, stored }, null, 2), { mode: 0o600 });
  await prisma.$transaction(async tx => {
    for (const patch of patches) {
      const spot = await tx.spot.findUnique({ where: { id: patch.id } }); if (!spot) throw Error("Spot removed");
      const key = REVIEW_PREFIX + patch.id, current = await tx.systemConfig.findUnique({ where: { key } });
      if ((current?.value ?? null) !== (stored.find(row => row.key === key)?.value ?? null)) throw Error("Review changed during import");
      const action = completionAction(spot, patch);
      if (action === "current" && !patch.review) continue;
      const updated = action === "current" ? spot : await tx.spot.update({ where: { id: patch.id }, data: patch.fields });
      const review = reviewAfterCompletion(updated, patch, reviews.get(patch.id));
      if (review) {
        const value = JSON.stringify(review);
        await tx.systemConfig.upsert({ where: { key }, create: { key, value }, update: { value } });
      }
    }
  }, { isolationLevel: "Serializable" });
  console.log(`Completions applied. Backup: ${backup}`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Import failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
