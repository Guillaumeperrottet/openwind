"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";

interface NewTopicFormProps {
  categorySlug: string;
  onCancel: () => void;
  initialTitle?: string;
  initialBody?: string;
}

export function NewTopicForm({ categorySlug, onCancel, initialTitle = "", initialBody = "" }: NewTopicFormProps) {
  const { user, requestAuth } = useFavContext();
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const id = useId();
  const [body, setBody] = useState(initialBody);
  const [spotId, setSpotId] = useState("");
  const [spots, setSpots] = useState<
    Array<{ id: string; name: string; region: string | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/spots")
      .then((response) => (response.ok ? response.json() : []))
      .then((items: Array<{ id: string; name: string; region: string | null }>) =>
        setSpots(
          items
            .map(({ id, name, region }) => ({ id, name, region }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      )
      .catch(() => setSpots([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      requestAuth();
      return;
    }
    if (!title.trim() || !body.trim() || loading || (initialBody && body.trim() === initialBody.trim())) return;
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
          spotId: spotId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }

      const topic = await res.json();
      router.push(`/forum/${categorySlug}/${topic.id}`);
    } catch {
      setError("Publication momentanément indisponible. Réessayez dans un instant.");
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
          aria-label="Fermer le formulaire"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <label htmlFor={`${id}-title`} className="mb-2 block text-sm font-medium text-slate-700">Titre du sujet</label>
      <input
        id={`${id}-title`}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du sujet"
        maxLength={200}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-base font-medium text-gray-900 sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none mb-3"
        autoFocus
      />

      <label htmlFor={`${id}-body`} className="mb-2 block text-sm font-medium text-slate-700">Message</label>
      <textarea
        id={`${id}-body`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Exprimez-vous…"
        rows={5}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-base text-gray-900 sm:text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none resize-y min-h-[120px] mb-3"
      />

      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs font-medium text-gray-600">
          Spot concerné <span className="font-normal text-gray-400">(optionnel)</span>
        </span>
        <select
          value={spotId}
          onChange={(event) => setSpotId(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Discussion générale</option>
          {spots.map((spot) => (
            <option key={spot.id} value={spot.id}>
              {spot.name}{spot.region ? ` · ${spot.region}` : ""}
            </option>
          ))}
        </select>
      </label>

      {initialBody && body.trim() === initialBody.trim() && <p className="mb-3 text-sm text-slate-600">Ajoute ta correction au message avant de publier.</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || !body.trim() || loading || (!!initialBody && body.trim() === initialBody.trim())}
          className="flex items-center gap-2 min-h-11 px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {loading ? "Publication…" : "Publier"}
        </button>
      </div>
    </form>
  );
}
