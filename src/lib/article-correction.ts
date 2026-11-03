import { articleReading } from "./article-reading";
import { localizedUrl } from "./site";

export interface CorrectionDraft { title: string; body: string; articleTitle: string; href: string }
/** Resolve a public article and a real heading, never arbitrary message content from a URL. */
export function articleCorrectionDraft(article: { slug: string; title: string; content: string }, section: string): CorrectionDraft | null {
  const heading = section ? articleReading(article.content).outline.find((h) => h.id === section) : null;
  if (section && !heading) return null;
  const href = localizedUrl("fr", `/carnet/${article.slug}`) + (heading ? `#${heading.id}` : "");
  return { title: `Correction : ${article.title}`.slice(0, 200), body: `Article : ${article.title}\n${href}\n${heading ? `Rubrique : ${heading.title}\n` : ""}\nCorrection proposée :\n`, articleTitle: article.title, href };
}
