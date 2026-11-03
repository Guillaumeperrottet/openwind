import { unified } from "unified";
import remarkParse from "remark-parse";
import { indexArticleHeadings, markdownText, type MarkdownNode } from "./article-headings";

const parser = unified().use(remarkParse);

/** An editable opening Markdown list supplies the summary; no facts are inferred. */
export function articleReading(markdown: string) {
  const tree = parser.parse(markdown);
  const [heading, list] = tree.children;
  let summary: string[] = [];
  let content = markdown;
  if (heading?.type === "heading" && heading.depth === 2 && /^(à retenir|en bref)$/i.test(markdownText(heading)) && list?.type === "list" && list.children.length === 3) {
    const points = list.children.map((item) => markdownText(item).trim());
    if (points.every(Boolean) && list.position?.end.offset !== undefined) {
      summary = points;
      content = markdown.slice(list.position.end.offset).trimStart();
    }
  }
  const headings = indexArticleHeadings(parser.parse(content) as MarkdownNode);
  // Main sections only: a lake-by-lake guide must not become a wall of subheadings.
  const sections = headings.filter((h) => h.depth === 2);
  return { summary, content, outline: sections.length ? sections : headings };
}
