import type { ArticleHeading } from "@/lib/article-headings";

export function ArticleSummary({ points }: { points: string[] }) {
  if (!points.length) return null;
  return <section aria-labelledby="article-summary-title" className="mb-6 border-l-2 border-sky-700 pl-5">
    <h2 id="article-summary-title" className="text-lg font-semibold text-slate-950">En bref</h2>
    <ul className="mt-3 list-disc space-y-2 pl-4 text-base leading-7 text-slate-700">{points.map((point) => <li key={point}>{point}</li>)}</ul>
  </section>;
}

export function ArticleOutline({ headings, collapsible = false }: { headings: ArticleHeading[]; collapsible?: boolean }) {
  if (headings.length < 2) return null;
  const links = <nav aria-label="Sommaire de l’article"><ol className="divide-y divide-slate-100">{headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`} className="flex min-h-11 items-center py-2 text-sm leading-6 text-slate-700 underline-offset-4 hover:text-sky-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">{heading.title}</a></li>)}</ol></nav>;
  if (collapsible) return <details className="mb-6 border-y border-slate-200 lg:hidden"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-slate-950">Dans cet article <span className="ml-2 font-normal text-slate-500">{headings.length} rubriques</span></summary><div className="pb-3">{links}</div></details>;
  return <div className="mb-7 hidden lg:block"><h2 className="mb-3 text-sm font-semibold text-slate-950">Dans cet article</h2><div className="max-h-[55dvh] overflow-y-auto pr-2">{links}</div></div>;
}
