"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  placeholder?: string;
  onCreated: (post: unknown) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function ReplyForm({
  topicId,
  parentId,
  placeholder,
  onCreated,
  onCancel,
  autoFocus,
}: ReplyFormProps) {
  const t = useTranslations("ForumPage");
  const tCommon = useTranslations("Common");
  const { user, requestAuth } = useFavContext();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requestAuth();
      return;
    }
    if (!body.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, parentId, body: body.trim() }),
      });
      if (res.ok) {
        const post = await res.json();
        setBody("");
        onCreated(post);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? t("replyPlaceholder")}
        autoFocus={autoFocus}
        rows={3}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-y min-h-[72px]"
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {tCommon("cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={!body.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          {loading ? t("sending") : t("reply")}
        </button>
      </div>
    </form>
  );
}
