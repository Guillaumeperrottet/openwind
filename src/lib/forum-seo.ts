import { unified } from "unified";
import remarkParse from "remark-parse";
import { localizedUrl, SITE_URL } from "./site";
import { breadcrumbSchema, ORGANIZATION_ID, WEBSITE_ID } from "./public-seo";

type TextNode = { type: string; value?: string; alt?: string; url?: string; children?: TextNode[] };
/** Match the readable Markdown content, without leaking Markdown URLs into summaries. */
export function forumText(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as TextNode;
  const read = (node: TextNode): string => node.type === "image" ? node.alt || "" : typeof node.value === "string" ? node.value : (node.children ?? []).map(read).join(["root", "list", "listItem", "blockquote"].includes(node.type) ? " " : "");
  return read(tree).replace(/\s+/g, " ").trim();
}
function postContent(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as TextNode, images: string[] = [];
  const visit = (node: TextNode) => {
    if (node.type === "image" && node.url) {
      try { const url = new URL(node.url, SITE_URL); if (["http:", "https:"].includes(url.protocol)) images.push(url.href); } catch { /* Invalid media remains absent. */ }
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return { text: forumText(markdown), ...(images.length ? { image: [...new Set(images)] } : {}) };
}
type PublicPost = { id: string; body: string; author: { name: string | null }; createdAt: string; children: PublicPost[] };
export function forumTopicSchema(topic: { id: string; title: string; body: string; author: { name: string | null }; category: { name: string; slug: string }; createdAt: string; posts: PublicPost[] }, updatedAt: string) {
  const path = `/forum/${encodeURIComponent(topic.category.slug)}/${encodeURIComponent(topic.id)}`, url = localizedUrl("fr", path);
  let count = 0;
  const comment = (post: PublicPost): Record<string, unknown> => {
    count++;
    return { "@type": "Comment", "@id": `${url}#post-${post.id}`, url: `${url}#post-${post.id}`, ...postContent(post.body), author: { "@type": "Person", name: post.author.name ?? "Anonyme" }, datePublished: post.createdAt,
      ...(post.children.length ? { comment: post.children.map(comment) } : {}),
    };
  };
  const comments = topic.posts.map(comment);
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "DiscussionForumPosting", "@id": `${url}#discussion`, url, mainEntityOfPage: url, headline: topic.title, ...postContent(topic.body), author: { "@type": "Person", name: topic.author.name ?? "Anonyme" }, datePublished: topic.createdAt, dateModified: updatedAt, publisher: { "@id": ORGANIZATION_ID }, commentCount: count, ...(comments.length ? { comment: comments } : {}) },
    breadcrumbSchema([{ name: "Explorer", url: localizedUrl("fr", "/explorer") }, { name: "Forum", url: localizedUrl("fr", "/forum") }, { name: topic.category.name, url: localizedUrl("fr", `/forum/${encodeURIComponent(topic.category.slug)}`) }, { name: topic.title, url }]),
  ] };
}

export function forumCategorySchema(category: { name: string; slug: string; description: string | null }, topics: { id: string; title: string }[]) {
  const path = `/forum/${encodeURIComponent(category.slug)}`, url = localizedUrl("fr", path);
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: category.name, description: category.description || `Discussions ${category.name} sur le forum Openwind.`, isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORGANIZATION_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: topics.length, itemListElement: topics.map((t, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "DiscussionForumPosting", headline: t.title, url: localizedUrl("fr", `${path}/${encodeURIComponent(t.id)}`) } })) },
    },
    breadcrumbSchema([{ name: "Explorer", url: localizedUrl("fr", "/explorer") }, { name: "Forum", url: localizedUrl("fr", "/forum") }, { name: category.name, url }]),
  ] };
}
