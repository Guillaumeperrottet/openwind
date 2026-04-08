"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";

interface NewTopicFormProps {
  categorySlug: string;
  onCancel: () => void;
}

export function NewTopicForm({ categorySlug, onCancel }: NewTopicFormProps) {
  const { user, requestAuth } = useFavContext();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requestAuth();
      return;
    }
    if (!title.trim() || !body.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          categorySlug,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }

      const topic = await res.json();
      router.push(`/forum/${categorySlug}/${topic.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Nouveau sujet</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du sujet"
        maxLength={200}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none mb-3"
        autoFocus
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Exprimez-vous…"
        rows={5}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-y min-h-[120px] mb-3"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || !body.trim() || loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {loading ? "Publication…" : "Publier"}
        </button>
      </div>
    </form>
  );
}
