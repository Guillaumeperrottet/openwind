/**
 * fix-fr-spots.ts
 * Fixes spots whose description was originally in French (not English).
 * The initial translate-spots.ts assumed all descriptions were English,
 * but many were already French — so descriptionEn/De/It ended up in French too.
 *
 * Strategy:
 * 1. Use Azure Detect API to check the language of `descriptionEn`
 * 2. If it's French → re-translate `description` (FR) → EN, DE, IT
 * 3. Update descriptionEn, descriptionDe, descriptionIt
 *
 * Run: AZURE_TRANSLATOR_KEY=<key> npx tsx prisma/fix-fr-spots.ts
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

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Translate texts FROM a given source language to EN, DE, IT */
async function translateFrom(
  texts: string[],
  fromLang: string,
): Promise<{ en: string; de: string; it: string }[]> {
  if (texts.length === 0) return [];

  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLang}&to=en&to=de&to=it`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY_SAFE,
      "Ocp-Apim-Subscription-Region": AZURE_REGION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(texts.map((t) => ({ text: t }))),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure error ${res.status}: ${err}`);
  }

  const results: { translations: { to: string; text: string }[] }[] =
    await res.json();

  return results.map((r) => ({
    en: r.translations.find((t) => t.to === "en")?.text ?? "",
    de: r.translations.find((t) => t.to === "de")?.text ?? "",
    it: r.translations.find((t) => t.to === "it")?.text ?? "",
  }));
}

/** Simple heuristic: is this text French? */
function looksFrench(text: string): boolean {
  if (!text || text.trim().length < 10) return false;
  const lower = text.toLowerCase();
  // French-specific patterns
  const frPatterns = [
    /\b(le|la|les|du|des|un|une|et|en|au|aux|de|d'|l'|qu'|n'|c'est|est|sont|pour|avec|sur|dans|par|qui|que|où)\b/g,
  ];
  const matches = (lower.match(frPatterns[0]) ?? []).length;
  const words = lower.split(/\s+/).length;
  // If >25% of words are French function words → French
  return matches / words > 0.25;
}

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

  // Find spots where descriptionEn looks French
  const toFix = spots.filter((s) => {
    const enField = s.descriptionEn ?? "";
    return enField.length > 0 && looksFrench(enField);
  });

  console.log(
    `Found ${spots.length} spots total, ${toFix.length} need fixing.\n`,
  );

  if (toFix.length === 0) {
    console.log("✅ Nothing to fix!");
    return;
  }

  let fixed = 0;
  const BATCH = 10;

  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH);
    console.log(
      `\n📦 Batch ${Math.floor(i / BATCH) + 1}: fixing ${batch.length} spots...`,
    );

    // Collect texts to translate (description, hazards, access)
    const descTexts = batch.map((s) => s.description ?? "");
    const hazardTexts = batch.map((s) => s.hazards ?? "");
    const accessTexts = batch.map((s) => s.access ?? "");

    const allTexts = [...descTexts, ...hazardTexts, ...accessTexts];
    const nonEmptyIdx = allTexts
      .map((t, i) => (t.trim() ? i : -1))
      .filter((i) => i !== -1);
    const nonEmptyTexts = nonEmptyIdx.map((i) => allTexts[i]);

    const rawTrans = await translateFrom(nonEmptyTexts, "fr");

    const allTrans: { en: string; de: string; it: string }[] = allTexts.map(
      () => ({ en: "", de: "", it: "" }),
    );
    nonEmptyIdx.forEach((origIdx, j) => {
      allTrans[origIdx] = rawTrans[j];
    });

    const n = batch.length;
    const descTrans = allTrans.slice(0, n);
    const hazardTrans = allTrans.slice(n, 2 * n);
    const accessTrans = allTrans.slice(2 * n, 3 * n);

    for (let j = 0; j < batch.length; j++) {
      const spot = batch[j];
      const update: Record<string, string> = {};

      if (spot.description && descTrans[j].en) {
        update.descriptionEn = descTrans[j].en;
        update.descriptionDe = descTrans[j].de;
        update.descriptionIt = descTrans[j].it;
      }
      if (spot.hazards && hazardTrans[j].en) {
        update.hazardsEn = hazardTrans[j].en;
        update.hazardsDe = hazardTrans[j].de;
        update.hazardsIt = hazardTrans[j].it;
      }
      if (spot.access && accessTrans[j].en) {
        update.accessEn = accessTrans[j].en;
        update.accessDe = accessTrans[j].de;
        update.accessIt = accessTrans[j].it;
      }

      if (Object.keys(update).length > 0) {
        await prisma.spot.update({ where: { id: spot.id }, data: update });
        console.log(`  ✅ ${spot.name}`);
        fixed++;
      } else {
        console.log(`  ⏭  ${spot.name} (nothing to update)`);
      }
    }

    if (i + BATCH < toFix.length) await sleep(300);
  }

  console.log(`\n✅ Done. ${fixed} spots fixed.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
