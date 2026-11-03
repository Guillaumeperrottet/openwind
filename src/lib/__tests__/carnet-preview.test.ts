import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { previewCarnetRevision } from "../carnet-preview";
import { carnetRevisions, revisedCarnetContent } from "../carnet-revision";
import { articleReading } from "../article-reading";
vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllEnvs());

const planner = carnetRevisions.find((revision) => !!revision.body)!;
const metadata = { slug: planner.slug, excerpt: planner.previousExcerpt, readTime: 9 };

describe("pending Carnet revision", () => {
  it("previews updated planner metadata only in development, preserving the original object", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(previewCarnetRevision(metadata)).toMatchObject({ excerpt: planner.excerpt, readTime: planner.readTime });
    expect(metadata.excerpt).toBe(planner.previousExcerpt);
    expect(previewCarnetRevision({ ...metadata, excerpt: "Nouvelle édition de la rédaction" }).excerpt).toBe("Nouvelle édition de la rédaction");
    expect(previewCarnetRevision({ ...metadata, content: "Une nouvelle édition" }).content).toBe("Une nouvelle édition");
  });
  it("previews the reviewed planner body without changing its stored publication state", () => {
    vi.stubEnv("NODE_ENV", "development");
    const legacy = readFileSync("prisma/migrations/20260827103000_add_trip_planner_article/migration.sql", "utf8").split("$article$")[1];
    const original = { ...metadata, content: legacy, status: "PUBLISHED", updatedAt: new Date("2026-08-27") };
    const preview = previewCarnetRevision(original);
    expect(articleReading(preview.content).summary).toEqual(planner.summary);
    expect(preview.content).toContain("Garder cette recherche");
    expect(preview.status).toBe("PUBLISHED");
    expect(original.content).toBe(legacy);
  });
  it.each(["production", "test"])("always leaves editable database content intact in %s", (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    expect(previewCarnetRevision(metadata)).toBe(metadata);
  });
  it("supplies three explicit points for every reviewed article and a current planner walkthrough", () => {
    for (const revision of carnetRevisions) {
      const reading = articleReading(revisedCarnetContent(revision, "## Corps\n\nLe contenu d’origine."));
      expect(reading.summary).toEqual(revision.summary);
      if (!revision.body) expect(reading.content).toContain("Le contenu d’origine.");
    }
    const content = revisedCarnetContent(planner, "Ancienne version");
    expect(content).toContain("Garder cette recherche");
    expect(content).toContain("Pourquoi ce créneau ?");
    expect(content).toContain("ne surveillent pas la météo");
    expect(content).not.toContain("panneau coulissant");
    expect(content).not.toContain("Le choix **Tous**");
  });
  it("prepares a guarded content-only migration without publishing drafts or changing the schema", () => {
    const sql = readFileSync("prisma/migrations/20261102140000_improve_carnet_reading/migration.sql", "utf8");
    expect(sql.match(/UPDATE "Article"/g)).toHaveLength(4);
    for (const revision of carnetRevisions) expect(sql).toContain(`AND md5("content") = '${revision.previousContentMd5}'`);
    expect(sql).not.toMatch(/ALTER TABLE|INSERT INTO|"status"\s*=|"publishedAt"\s*=/);
  });
});
