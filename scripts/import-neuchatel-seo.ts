/** pnpm seo:import:neuchatel [--apply]. Default: read-only preflight. */
import "dotenv/config";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { prisma } from "../src/lib/prisma";
import { REVIEW_PREFIX } from "../src/lib/planner-review";
import {
  editorialImportAction,
  neuchatelSeoPatches,
} from "../src/lib/neuchatel-seo-import";

async function main() {
  const apply = process.argv.includes("--apply");
  const ids = neuchatelSeoPatches.map((patch) => patch.id);
  const [spots, reviews] = await Promise.all([
    prisma.spot.findMany({ where: { id: { in: ids } } }),
    prisma.systemConfig.findMany({
      where: { key: { in: ids.map((id) => REVIEW_PREFIX + id) } },
    }),
  ]);
  for (const patch of neuchatelSeoPatches) {
    const action = editorialImportAction(
      spots.find((spot) => spot.id === patch.id) ?? null,
      patch,
      reviews.some((review) => review.key === REVIEW_PREFIX + patch.id),
    );
    console.log(
      `${action}: ${patch.expectedName} · FR/DE/IT copy, expert level and NE/SW sectors`,
    );
  }
  if (!apply) {
    console.log(
      "Preflight passed. No writes. Apply with the matching code release.",
    );
    return;
  }
  const backup = join(tmpdir(), `openwind-neuchatel-seo-${Date.now()}.json`);
  await writeFile(backup, JSON.stringify({ spots, reviews }, null, 2), {
    mode: 0o600,
  });
  await prisma.$transaction(
    async (tx) => {
      for (const patch of neuchatelSeoPatches) {
        const current = await tx.spot.findUnique({ where: { id: patch.id } });
        const review = await tx.systemConfig.findUnique({
          where: { key: REVIEW_PREFIX + patch.id },
        });
        if (editorialImportAction(current, patch, Boolean(review)) === "update")
          await tx.spot.update({
            where: { id: patch.id },
            data: patch.changes,
          });
      }
    },
    { isolationLevel: "Serializable", timeout: 30000 },
  );
  console.log(
    `Sourced Cudrefin copy and profile imported. Planner reviews unchanged. Backup: ${backup}`,
  );
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
