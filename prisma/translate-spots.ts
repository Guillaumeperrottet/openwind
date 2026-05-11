/**
 * translate-spots.ts
 * Translates spot descriptions, hazards and access from English (current `description` field)
 * to FR, DE, IT using Azure Translator API, then stores:
 *   - description (FR)
 *   - descriptionEn (EN — moved from current `description`)
 *   - descriptionDe (DE)
 *   - descriptionIt (IT)
 *   Same pattern for hazards and access.
 *
 * Run: AZURE_TRANSLATOR_KEY=<key> npx tsx prisma/translate-spots.ts
 * Or:  set AZURE_TRANSLATOR_KEY in .env then: npx tsx prisma/translate-spots.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY;
if (!AZURE_KEY) {
  console.error("❌ Set AZURE_TRANSLATOR_KEY env var before running.");
  process.exit(1);
}
const AZURE_KEY_SAFE: string = AZURE_KEY;
const AZURE_REGION = "switzerlandnorth";
const AZURE_ENDPOINT =
  "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=fr&to=de&to=it";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ── Azure Translator ────────────────────────────────────────────────────────

interface AzureTranslation {
  to: string;
  text: string;
}
interface AzureResult {
  translations: AzureTranslation[];
}

/** Translate up to 100 texts in one API call. Returns [fr, de, it] per text. */
async function translateBatch(
  texts: string[],
): Promise<{ fr: string; de: string; it: string }[]> {
  if (texts.length === 0) return [];

  const body = texts.map((t) => ({ text: t }));

  const res = await fetch(AZURE_ENDPOINT, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY_SAFE,
      "Ocp-Apim-Subscription-Region": AZURE_REGION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure Translator error ${res.status}: ${err}`);
  }

  const results: AzureResult[] = await res.json();

  return results.map((r) => {
    const fr = r.translations.find((t) => t.to === "fr")?.text ?? "";
    const de = r.translations.find((t) => t.to === "de")?.text ?? "";
    const it = r.translations.find((t) => t.to === "it")?.text ?? "";
    return { fr, de, it };
  });
}

/** Sleep ms between batches to stay within rate limits */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📖 Reading spots from DB...");
  const spots = await prisma.spot.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      descriptionEn: true,
      hazards: true,
      hazardsEn: true,
      access: true,
      accessEn: true,
    },
  });

  console.log(`Found ${spots.length} spots.`);

  // Spots that already have descriptionEn set can be skipped for the
  // description migration (but we still translate hazards/access if missing).
  let translated = 0;
  let skipped = 0;

  // Process in batches of 10 — Azure limits ~50k chars/request
  const BATCH = 10;

  for (let i = 0; i < spots.length; i += BATCH) {
    const batch = spots.slice(i, i + BATCH);

    // Build texts to translate for each field (null → skip)
    const descTexts = batch.map((s) => s.description ?? "");
    const hazardTexts = batch.map((s) => s.hazards ?? "");
    const accessTexts = batch.map((s) => s.access ?? "");

    // Only call API for non-empty texts
    const allTexts = [...descTexts, ...hazardTexts, ...accessTexts];

    // Filter empty to avoid wasting chars, keep index mapping
    const nonEmptyIndexes = allTexts
      .map((t, idx) => (t.trim() ? idx : -1))
      .filter((idx) => idx !== -1);
    const nonEmptyTexts = nonEmptyIndexes.map((idx) => allTexts[idx]);

    console.log(
      `\n📦 Batch ${Math.floor(i / BATCH) + 1}: translating ${nonEmptyTexts.length} non-empty texts...`,
    );

    const rawTranslations = await translateBatch(nonEmptyTexts);

    // Reconstruct full translations array (empty → { fr:"", de:"", it:"" })
    const allTranslations: { fr: string; de: string; it: string }[] =
      allTexts.map(() => ({ fr: "", de: "", it: "" }));
    nonEmptyIndexes.forEach((origIdx, j) => {
      allTranslations[origIdx] = rawTranslations[j];
    });

    // Split back into per-field arrays
    const n = batch.length;
    const descTrans = allTranslations.slice(0, n);
    const hazardTrans = allTranslations.slice(n, 2 * n);
    const accessTrans = allTranslations.slice(2 * n, 3 * n);

    // Update each spot
    for (let j = 0; j < batch.length; j++) {
      const spot = batch[j];
      const update: Record<string, string | null> = {};

      // description: move current (EN) → descriptionEn, translate to FR/DE/IT
      if (spot.description) {
        // Only overwrite descriptionEn if not already set
        if (!spot.descriptionEn) {
          update.descriptionEn = spot.description;
        }
        if (descTrans[j].fr) update.description = descTrans[j].fr;
        if (descTrans[j].de) update.descriptionDe = descTrans[j].de;
        if (descTrans[j].it) update.descriptionIt = descTrans[j].it;
      }

      // hazards
      if (spot.hazards) {
        if (!spot.hazardsEn) update.hazardsEn = spot.hazards;
        if (hazardTrans[j].fr) update.hazards = hazardTrans[j].fr;
        if (hazardTrans[j].de) update.hazardsDe = hazardTrans[j].de;
        if (hazardTrans[j].it) update.hazardsIt = hazardTrans[j].it;
      }

      // access
      if (spot.access) {
        if (!spot.accessEn) update.accessEn = spot.access;
        if (accessTrans[j].fr) update.access = accessTrans[j].fr;
        if (accessTrans[j].de) update.accessDe = accessTrans[j].de;
        if (accessTrans[j].it) update.accessIt = accessTrans[j].it;
      }

      if (Object.keys(update).length > 0) {
        await prisma.spot.update({
          where: { id: spot.id },
          data: update,
        });
        console.log(`  ✅ ${spot.name}`);
        translated++;
      } else {
        console.log(`  ⏭  ${spot.name} (already translated)`);
        skipped++;
      }
    }

    // Rate-limit: 300ms between batches
    if (i + BATCH < spots.length) await sleep(300);
  }

  console.log(`\n✅ Done. ${translated} spots updated, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
