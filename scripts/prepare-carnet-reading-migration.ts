/** Regenerates the pending SQL only. This script never connects to a database. */
import { writeFileSync } from "node:fs";
import { carnetRevisions } from "../src/lib/carnet-revision";

const sql = (value: string) => `'${value.replaceAll("'", "''")}'`;
const updates = carnetRevisions.map((revision) => {
  const summary = `## À retenir\n\n${revision.summary.map((point) => `- ${point}`).join("\n")}\n\n`;
  const content = revision.body ? sql(summary + revision.body) : `${sql(summary)} || ltrim("content", E'\\n\\r ')`;
  const fields = [`"content" = ${content}`, '"updatedAt" = CURRENT_TIMESTAMP'];
  if (revision.title) fields.push(`"title" = ${sql(revision.title)}`, `"seoTitle" = ${sql(revision.seoTitle!)}`);
  if (revision.excerpt) fields.push(`"excerpt" = ${sql(revision.excerpt)}`, `"seoDescription" = ${sql(revision.seoDescription!)}`, `"readTime" = ${revision.readTime}`);
  return `UPDATE "Article"\nSET ${fields.join(",\n    ")}\nWHERE "slug" = ${sql(revision.slug)}\n  AND "kind" = 'EDITORIAL'\n${revision.previousTitle ? `  AND "title" = ${sql(revision.previousTitle)}\n` : ""}  AND "excerpt" = ${sql(revision.previousExcerpt)}\n  AND md5("content") = ${sql(revision.previousContentMd5)};`;
});
writeFileSync(new URL("../prisma/migrations/20261102140000_improve_carnet_reading/migration.sql", import.meta.url), `-- Editable reading summaries and the current trip-planner walkthrough.\n-- Apply only to the reviewed content snapshot; preserve newer admin edits and publication status.\n\n${updates.join("\n\n")}\n`);
