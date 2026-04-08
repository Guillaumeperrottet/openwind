"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  children: string;
  className?: string;
}

export function Markdown({ children, className = "" }: Props) {
  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-sky-300 prose-blockquote:text-gray-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-img:rounded-lg ${className}`}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
