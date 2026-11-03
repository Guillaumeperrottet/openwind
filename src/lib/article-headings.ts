/** Shared by the Markdown renderer and its table of contents. */
export interface MarkdownNode {
  type: string;
  value?: string;
  alt?: string | null;
  depth?: number;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
  position?: { start: { offset?: number }; end: { offset?: number } };
}

export interface ArticleHeading { id: string; title: string; depth: number }

export function markdownText(node: MarkdownNode): string {
  return node.value ?? node.alt ?? node.children?.map(markdownText).join("") ?? "";
}

export function indexArticleHeadings(tree: MarkdownNode): ArticleHeading[] {
  const used = new Set<string>();
  const headings: ArticleHeading[] = [];
  function walk(node: MarkdownNode) {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      const title = markdownText(node).trim();
      const base = title.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
      let id = base;
      for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`;
      used.add(id);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
      headings.push({ id, title, depth: node.depth });
    }
    node.children?.forEach(walk);
  }
  walk(tree);
  return headings;
}

export function articleHeadingPlugin() {
  return (tree: MarkdownNode) => { indexArticleHeadings(tree); };
}
