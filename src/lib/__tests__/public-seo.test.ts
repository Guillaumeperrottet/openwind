import { describe, expect, it } from "vitest";
import { jsonLd, ORGANIZATION_ID, publicSiteSchema, WEBSITE_ID } from "@/lib/public-seo";
import { lakeMetadata, lakeSchema, temperatureCollectionSchema } from "@/lib/lake-seo";
import { forumCategorySchema, forumText, forumTopicSchema } from "@/lib/forum-seo";
import { vitalPayload, vitalsContext } from "@/lib/core-web-vitals";
import { SITE_URL } from "@/lib/site";
import { LAKE_PAGE_COPY } from "@/lib/lake-page-copy";
import { ALPLAKES_GRUYERE } from "@/lib/lake-temperature";

describe("public identity and safe structured content", () => {
  it("escapes script boundaries without changing the content", () => {
    const content = { name: '</script><script>alert("x")</script>', text: "Été & vent" };
    expect(jsonLd(content)).not.toContain("<");
    expect(JSON.parse(jsonLd(content))).toEqual(content);
  });
  it("identifies the publisher consistently and links actual navigation", () => {
    const graph = publicSiteSchema("de")["@graph"];
    expect(graph[0]).toMatchObject({ "@type": "Organization", "@id": ORGANIZATION_ID, name: "Openwind" });
    expect(graph[1]).toMatchObject({ "@id": WEBSITE_ID, publisher: { "@id": ORGANIZATION_ID } });
    expect(graph.slice(2).map(item => item.url)).toEqual([`${SITE_URL}/de?view=map`, `${SITE_URL}/de/explorer`, `${SITE_URL}/de/plan`, `${SITE_URL}/de/mon-openwind`]);
    expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|sameAs|streetAddress/);
  });
});

describe("lake coverage is indexable and accurately attributed", () => {
  it.each(["fr", "en", "de", "it"] as const)("provides canonical and language alternatives in %s", locale => {
    const metadata = lakeMetadata(locale, true);
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/${locale}/lacs/gruyere`);
    expect(Object.keys(metadata.alternates?.languages ?? {})).toHaveLength(5);
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.description).toContain("1 m");
    expect(metadata.description).toContain("Alplakes");
    expect(lakeMetadata(locale, false).robots).toEqual({ index: false, follow: true });
  });
  it("attributes the upstream licence without licensing the whole page or inventing a reading", () => {
    const page = lakeSchema("fr")["@graph"][0];
    expect(page).toMatchObject({ "@type": "WebPage", isBasedOn: { name: "Alplakes / Eawag – Simstrat", license: expect.stringContaining("creativecommons.org") } });
    expect(page).not.toHaveProperty("license");
    expect(page).not.toHaveProperty("dateModified");
    expect(JSON.stringify(page)).not.toMatch(/Dataset|QuantitativeValue|measurementTechnique/);
  });
  it("describes only the available lake and follows the public page switch", () => {
    const open = temperatureCollectionSchema("fr", true)["@graph"][0];
    const closed = temperatureCollectionSchema("fr", false)["@graph"][0];
    expect(open).toMatchObject({ mainEntity: { numberOfItems: 1, itemListElement: [{ item: { url: `${SITE_URL}/fr/lacs/gruyere` } }] } });
    expect(closed).toMatchObject({ mainEntity: { itemListElement: [{ item: { url: "https://www.alplakes.eawag.ch/gruyere" } }] } });
  });
  it.each(["fr", "en", "de", "it"] as const)("describes the model dataset using the visible method and attribution in %s", locale => {
    const graph = lakeSchema(locale)["@graph"];
    const dataset = graph.find(node => node["@type"] === "Dataset");
    if (!dataset || !("variableMeasured" in dataset)) throw new Error("Expected a model Dataset");
    expect(dataset).toMatchObject({
      "@id": `${SITE_URL}/${locale}/lacs/gruyere#dataset`,
      license: ALPLAKES_GRUYERE.licence,
      creator: { name: "Eawag" }, measurementTechnique: "Simstrat (1D)",
      isBasedOn: { url: ALPLAKES_GRUYERE.page },
      variableMeasured: { unitText: "°C", description: LAKE_PAGE_COPY[locale].depth },
    });
    expect(dataset?.description).toContain(LAKE_PAGE_COPY[locale].explanation);
    expect(dataset?.description).toContain(LAKE_PAGE_COPY[locale].sourceNote);
    expect(dataset).not.toHaveProperty("dateModified");
    expect(dataset).not.toHaveProperty("measurement");
    expect(graph[0]).toMatchObject({ mainEntity: { "@id": dataset?.["@id"] } });
  });
});

describe("forum markup reflects complete public discussion", () => {
  const date = "2026-10-30T12:00:00.000Z";
  const topic = {
    id: "topic", title: "Vent & eau", body: "## Conditions\n\nLe **vent** [ici](https://example.com) est bon.\n\n![Lac](/lake.jpg)",
    author: { name: "Guillaume", id: "private-account-id" }, category: { name: "Lacs", slug: "lacs" }, createdAt: date,
    posts: [{ id: "reply", body: "Observation complète. ".repeat(60), author: { name: "Nicolas" }, createdAt: date, children: [{ id: "nested", body: "Merci !", author: { name: null }, createdAt: date, children: [] }] }],
  };
  it("uses readable full text instead of Markdown syntax and link targets", () => {
    expect(forumText(topic.body)).toBe("Conditions Le vent ici est bon. Lac");
    expect(forumText("`code`\n\n- un\n- deux")).toBe("code un deux");
  });
  it("retains nested replies, visible names, dates, images and full content", () => {
    const schema = forumTopicSchema(topic, date), graph = schema["@graph"];
    expect(graph[0]).toMatchObject({ "@type": "DiscussionForumPosting", datePublished: date, dateModified: date, author: { name: "Guillaume" }, commentCount: 2, image: [`${SITE_URL}/lake.jpg`], comment: [{ url: `${SITE_URL}/fr/forum/lacs/topic#post-reply`, text: topic.posts[0].body.trim(), comment: [{ author: { name: "Anonyme" } }] }] });
    expect(jsonLd(schema)).not.toContain("private-account-id");
    expect(jsonLd(schema)).not.toContain("userId");
  });
  it("omits unsafe media URLs and describes the displayed category topics only", () => {
    const schema = forumTopicSchema({ ...topic, body: "![Bad](javascript:alert)" }, date);
    expect(schema["@graph"][0]).not.toHaveProperty("image");
    expect(forumCategorySchema({ ...topic.category, description: "Conditions des lacs" }, [topic])["@graph"][0]).toMatchObject({ mainEntity: { numberOfItems: 1, itemListElement: [{ position: 1, item: { headline: topic.title, url: `${SITE_URL}/fr/forum/lacs/topic` } }] } });
  });
});

describe("performance measurements exclude personal context", () => {
  it.each(["/fr/admin", "/fr/mon-openwind", "/fr/spots/new", "/fr/spots/id/edit", "/fr/auth/callback", "/unknown"])("ignores private or unknown route %s", path => expect(vitalsContext(path)).toBeNull());
  it("keeps only page family and language, including with searches and coordinates", () => {
    expect(vitalsContext("/fr/recherche", "?q=secret&lat=46.5&lng=7.1")).toEqual({ page_type: "search", page_language: "fr" });
    expect(vitalsContext("/de", "?view=map&spot=private-id")).toEqual({ page_type: "map", page_language: "de" });
  });
  it("preserves CLS precision and reports durations in milliseconds", () => {
    const context = vitalsContext("/fr/explorer");
    expect(vitalPayload({ name: "CLS", id: "id", value: .012345, rating: "good" }, context)?.metric_value).toBe(.0123);
    expect(vitalPayload({ name: "LCP", id: "id", value: 2000.8, rating: "good" }, context)?.metric_value).toBe(2001);
    expect(vitalPayload({ name: "INP", id: "id", value: 123, rating: "good" }, context)?.metric_name).toBe("INP");
  });
  it("drops invalid or unrelated measurements", () => {
    const metric = { name: "LCP", id: "id", value: 2000, rating: "good" };
    for (const patch of [{ name: "custom" }, { value: NaN }, { value: -1 }, { value: Infinity }, { rating: "unknown" }]) expect(vitalPayload({ ...metric, ...patch }, vitalsContext("/fr"))).toBeNull();
    expect(vitalPayload(metric, null)).toBeNull();
  });
});
