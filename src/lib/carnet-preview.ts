import "server-only";
import { createHash } from "node:crypto";
import { carnetRevisions, revisedCarnetContent } from "./carnet-revision";

/** Pending data migration preview. Production always uses the editable database. */
export function previewCarnetRevision<T extends { slug: string; excerpt: string; title?: string; seoTitle?: string | null; content?: string; readTime?: number; seoDescription?: string | null; updatedAt?: Date }>(article: T): T {
  if (process.env.NODE_ENV !== "development") return article;
  const revision = carnetRevisions.find((item) => item.slug === article.slug);
  if (!revision || article.excerpt !== revision.previousExcerpt) return article;
  if (revision.previousTitle && article.title !== undefined && article.title !== revision.previousTitle) return article;
  const title = revision.title ? { title: revision.title, ...(article.seoTitle !== undefined ? { seoTitle: revision.seoTitle } : {}) } : {};
  if (article.content !== undefined) {
    // Never replace newer editorial changes with this pending revision.
    if (createHash("md5").update(article.content).digest("hex") !== revision.previousContentMd5) return article;
    return { ...article, ...title, content: revisedCarnetContent(revision, article.content),
      ...(revision.excerpt ? { excerpt: revision.excerpt, readTime: revision.readTime, seoDescription: revision.seoDescription } : {}),
      updatedAt: new Date("2026-11-02T12:00:00Z"),
    };
  }
  if (article.excerpt !== revision.previousExcerpt || !revision.excerpt) return article;
  return { ...article, ...title, excerpt: revision.excerpt, ...(article.readTime !== undefined ? { readTime: revision.readTime } : {}) };
}
