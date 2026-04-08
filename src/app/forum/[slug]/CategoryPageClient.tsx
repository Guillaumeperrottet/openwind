"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Lock,
  Plus,
  ChevronUp,
} from "lucide-react";
import { NewTopicForm } from "@/components/forum/NewTopicForm";
import { timeAgo } from "@/lib/forum";

interface TopicSummary {
  id: string;
  title: string;
  slug: string;
  pinned: boolean;
  locked: boolean;
  author: { id: string; name: string | null; avatarUrl: string | null };
  postCount: number;
  score: number;
  createdAt: string;
}

interface Props {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  topics: TopicSummary[];
}

export function CategoryPageClient({ category, topics }: Props) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-12">
      {/* Breadcrumb */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Forum
      </Link>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {category.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouveau sujet</span>
        </button>
      </div>

      {showNew && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-white">
          <NewTopicForm
            categorySlug={category.slug}
            onCancel={() => setShowNew(false)}
          />
        </div>
      )}

      {topics.length === 0 ? (
        <div className="border border-gray-200 rounded-md bg-white text-center py-12 text-gray-400">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun sujet pour le moment</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md divide-y divide-gray-100 bg-white">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/forum/${category.slug}/${topic.id}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors group"
            >
              {/* Votes inline */}
              <div className="flex items-center gap-0.5 shrink-0 text-gray-400">
                <ChevronUp className="h-4 w-4" />
                <span
                  className={`text-xs font-medium tabular-nums min-w-[1.5rem] text-center ${
                    topic.score > 0
                      ? "text-gray-700"
                      : topic.score < 0
                        ? "text-gray-400"
                        : "text-gray-400"
                  }`}
                >
                  {topic.score}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {topic.pinned && (
                    <Pin className="h-3 w-3 text-gray-400 shrink-0" />
                  )}
                  {topic.locked && (
                    <Lock className="h-3 w-3 text-gray-300 shrink-0" />
                  )}
                  <span className="text-sm text-gray-900 group-hover:underline truncate">
                    {topic.title}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  posté par {topic.author.name ?? "Anonyme"} ·{" "}
                  {timeAgo(topic.createdAt)}
                </div>
              </div>

              {/* Comments count */}
              <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
                <MessageSquare className="h-3.5 w-3.5" />
                {topic.postCount}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
