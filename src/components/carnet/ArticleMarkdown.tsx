"use client";

import ReactMarkdown from "react-markdown";

interface ArticleMarkdownProps {
  children: string;
  compact?: boolean;
}

export function ArticleMarkdown({
  children,
  compact = false,
}: ArticleMarkdownProps) {
  return (
    <div
      className={
        compact
          ? "prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-slate-950 prose-a:text-sky-700 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:not-italic"
          : "prose prose-slate prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-[-0.02em] prose-h2:mt-14 prose-h2:text-3xl prose-h3:mt-9 prose-h3:text-2xl prose-p:leading-8 prose-a:font-medium prose-a:text-sky-700 prose-a:underline prose-a:decoration-sky-200 prose-a:underline-offset-4 hover:prose-a:decoration-sky-600 prose-blockquote:my-10 prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-slate-700 prose-li:my-2 prose-strong:text-slate-950"
      }
    >
      <ReactMarkdown
        components={{
          a: ({ href, children: linkChildren, ...props }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                {...props}
              >
                {linkChildren}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
