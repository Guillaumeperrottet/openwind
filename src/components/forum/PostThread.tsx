"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reply, Trash2, Share2, Pencil, X, Check } from "lucide-react";
import { VoteButtons } from "./VoteButtons";
import { ReplyForm } from "./ReplyForm";
import { Markdown } from "./Markdown";
import { useFavContext } from "@/lib/FavContext";
import { timeAgo } from "@/lib/forum";

interface Author {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface PostVote {
  value: number;
  userId: string;
}

export interface PostNode {
  id: string;
  body: string;
  authorId: string;
  author: Author;
  parentId: string | null;
  createdAt: string;
  score: number;
  votes: PostVote[];
  children: PostNode[];
}

interface PostThreadProps {
  post: PostNode;
  topicId: string;
  depth?: number;
  userId?: string;
  isAdmin?: boolean;
  onPostCreated: () => void;
  onPostDeleted: (id: string) => void;
}

export function PostThread({
  post,
  topicId,
  depth = 0,
  userId,
  isAdmin,
  onPostCreated,
  onPostDeleted,
}: PostThreadProps) {
  const { user } = useFavContext();
  const t = useTranslations("ForumPage");
  const tCommon = useTranslations("Common");
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [saving, setSaving] = useState(false);

  const myVote = post.votes.find((v) => v.userId === userId)?.value ?? null;
  const maxDepth = 6;

  const handleDelete = async () => {
    const res = await fetch(`/api/forum/posts/${post.id}`, {
      method: "DELETE",
    });
    if (res.ok) onPostDeleted(post.id);
  };

  const handleEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/forum/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editBody }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      onPostCreated();
    }
  };

  const handleShare = () => {
    const url = `${window.location.href}#post-${post.id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div id={`post-${post.id}`} className="relative">
      <div className="flex">
        {/* Thread line column — clickable to collapse */}
        <div className="flex flex-col items-center shrink-0 w-6 mr-1">
          {/* Avatar dot */}
          {post.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatarUrl}
              alt=""
              className="h-5 w-5 rounded-full shrink-0"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-gray-300 shrink-0" />
          )}
          {/* Vertical thread line */}
          {!collapsed && (post.children.length > 0 || depth > 0) && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-full flex-1 flex justify-center group/line cursor-pointer"
              aria-label="Réduire"
            >
              <div className="w-0.5 h-full bg-gray-200 group-hover/line:bg-gray-400 transition-colors" />
            </button>
          )}
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0 pb-2">
          {/* Author + time */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="font-medium text-gray-600">
              {post.author.name ?? t("anonymous")}
            </span>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                {t("hidden", { count: countDescendants(post) + 1 })}
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Body */}
              {editing ? (
                <div className="mt-1">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-y"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={handleEdit}
                      disabled={saving}
                      className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      {saving ? "…" : tCommon("save")}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditBody(post.body);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-gray-500 text-xs rounded hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      {tCommon("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-0.5 text-sm text-gray-800">
                  <Markdown>{post.body}</Markdown>
                </div>
              )}

              {/* Actions — Reddit style inline */}
              <div className="flex items-center gap-0.5 mt-1 -ml-1.5">
                <VoteButtons
                  postId={post.id}
                  score={post.score}
                  userVote={myVote}
                  inline
                />

                <button
                  onClick={() => setShowReply(!showReply)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" />
                  {t("reply")}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {tCommon("share")}
                </button>

                {(user?.id === post.authorId || isAdmin) && !editing && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {tCommon("edit")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {tCommon("delete")}
                    </button>
                  </>
                )}
              </div>

              {/* Reply form */}
              {showReply && (
                <div className="mt-2 mb-1">
                  <ReplyForm
                    topicId={topicId}
                    parentId={
                      depth < maxDepth ? post.id : (post.parentId ?? undefined)
                    }
                    autoFocus
                    onCreated={() => {
                      setShowReply(false);
                      onPostCreated();
                    }}
                    onCancel={() => setShowReply(false)}
                  />
                </div>
              )}

              {/* Children — nested under the thread line */}
              {post.children.length > 0 && (
                <div className="mt-1">
                  {post.children.map((child) => (
                    <PostThread
                      key={child.id}
                      post={child}
                      topicId={topicId}
                      depth={Math.min(depth + 1, maxDepth)}
                      userId={userId}
                      isAdmin={isAdmin}
                      onPostCreated={onPostCreated}
                      onPostDeleted={onPostDeleted}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function countDescendants(post: PostNode): number {
  let count = post.children.length;
  for (const child of post.children) {
    count += countDescendants(child);
  }
  return count;
}
