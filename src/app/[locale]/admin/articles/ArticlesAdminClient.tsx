"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  FilePlus2,
  Loader2,
  Trash2,
} from "lucide-react";
import type { ArticleDto, ArticleStatusValue } from "@/lib/articles";

const statusCopy: Record<
  ArticleStatusValue,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  PUBLISHED: {
    label: "Publié",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  ARCHIVED: {
    label: "Archivé",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

export function ArticlesAdminClient() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadArticles() {
    setLoading(true);
    fetch("/api/admin/articles", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Impossible de charger les articles");
        return (await response.json()) as ArticleDto[];
      })
      .then(setArticles)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadArticles, []);

  async function deleteArticle(article: ArticleDto) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${article.title} » ?`,
    );
    if (!confirmed) return;

    setDeletingId(article.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Suppression impossible");
      }
      setArticles((current) =>
        current.filter((item) => item.id !== article.id),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Suppression impossible",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l’administration
            </Link>
            <h1 className="text-3xl font-bold text-slate-950">
              Articles du Carnet
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Crée, prévisualise, publie ou archive les dossiers Openwind.
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <FilePlus2 className="h-4 w-4" />
            Nouvel article
          </Link>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FilePlus2 className="mx-auto h-9 w-9 text-slate-300" />
            <h2 className="mt-4 font-semibold text-slate-800">
              Aucun article pour le moment
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Commence par créer un brouillon.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {articles.map((article, index) => {
              const status = statusCopy[article.status];
              return (
                <article
                  key={article.id}
                  className={`grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6 ${
                    index > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {article.category} · {article.readTime} min
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-lg font-semibold text-slate-950">
                      {article.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {article.excerpt}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Modifié le{" "}
                      {new Intl.DateTimeFormat("fr-CH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(article.updatedAt))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {article.status === "PUBLISHED" && (
                      <a
                        href={`/${locale}/carnet/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        aria-label="Voir l’article publié"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteArticle(article)}
                      disabled={deletingId === article.id}
                      className="rounded-lg border border-slate-200 p-2.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Supprimer l’article"
                    >
                      {deletingId === article.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
