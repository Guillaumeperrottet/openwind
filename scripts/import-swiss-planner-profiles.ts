/** pnpm planner:import:swiss [--apply]
 * Default: read-only preflight. Apply only with the matching code release.
 * All eight writes are atomic; changed catalogue/reviews abort the import.
 */
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prisma } from "../src/lib/prisma";
import {
  checkedSwissProfiles,
  catalogueImportAction,
} from "../src/lib/swiss-planner-profile-import";
import { REVIEW_PREFIX } from "../src/lib/planner-review";

async function main() {
  const apply = process.argv.includes("--apply");
  const profiles = checkedSwissProfiles();
  const ids = profiles.map((p) => p.spot.id);
  const names = profiles
    .filter((p) => !p.previousFingerprint)
    .map((p) => p.spot.name);
  const snapshot = {
    spots: await prisma.spot.findMany({
      where: { OR: [{ id: { in: ids } }, { name: { in: names } }] },
    }),
    reviews: await prisma.systemConfig.findMany({
      where: { key: { in: ids.map((id) => REVIEW_PREFIX + id) } },
    }),
  };
  for (const p of profiles) {
    const current = snapshot.spots.find((s) => s.id === p.spot.id) ?? null;
    const duplicate = snapshot.spots.find(
      (s) => s.id !== p.spot.id && s.name === p.spot.name,
    );
    if (duplicate)
      throw Error(
        `Existing namesake; merge instead of duplicating: ${p.spot.name}`,
      );
    const action = catalogueImportAction(current, p);
    const stored = snapshot.reviews.find(
      (r) => r.key === REVIEW_PREFIX + p.spot.id,
    );
    if (
      stored &&
      JSON.stringify(JSON.parse(stored.value)) !== JSON.stringify(p.review)
    )
      throw Error(
        `Administrative review already exists; reconcile first: ${p.spot.name}`,
      );
    console.log(`${action}: ${p.spot.name} · ${p.spot.id}`);
  }
  if (!apply) {
    console.log(
      "Preflight passed. No changes written. Use --apply with the matching release.",
    );
    return;
  }
  const backup = join(tmpdir(), `openwind-swiss-profiles-${Date.now()}.json`);
  await writeFile(backup, JSON.stringify(snapshot, null, 2), { mode: 0o600 });
  await prisma.$transaction(
    async (tx) => {
      for (const p of profiles) {
        const current = await tx.spot.findUnique({ where: { id: p.spot.id } });
        const action = catalogueImportAction(current, p);
        const key = REVIEW_PREFIX + p.spot.id;
        const stored = await tx.systemConfig.findUnique({ where: { key } });
        if (
          stored &&
          JSON.stringify(JSON.parse(stored.value)) !== JSON.stringify(p.review)
        )
          throw Error(
            `Administrative review changed during import: ${p.spot.name}`,
          );
        if (action === "create") await tx.spot.create({ data: p.spot });
        else if (action === "update")
          await tx.spot.update({ where: { id: p.spot.id }, data: p.spot });
        const value = JSON.stringify(p.review);
        await tx.systemConfig.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      }
    },
    { isolationLevel: "Serializable", timeout: 30000 },
  );
  console.log(`Eight sourced profiles imported. Backup: ${backup}`);
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
