"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  FileText,
  ImageUp,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { ArticleMarkdown } from "@/components/carnet/ArticleMarkdown";
import { ArticleRelationPicker } from "@/components/admin/ArticleRelationPicker";
import {
  slugifyArticleTitle,
  type ArticleDto,
  type ArticleKindValue,
  type ArticleRelationOptions,
  type ArticleSource,
  type ArticleStatusValue,
} from "@/lib/articles";

interface EditableArticle {
  kind: ArticleKindValue;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  location: string;
  readTime: number;
  status: ArticleStatusValue;
  seoTitle: string;
  seoDescription: string;
  authorName: string;
  sources: ArticleSource[];
  linkedSpotIds: string[];
  linkedStationIds: string[];
  relatedArticleIds: string[];
}

const emptyArticle: EditableArticle = {
  kind: "EDITORIAL",
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverAlt: "",
  category: "Carnet Openwind",
  location: "Suisse romande",
  readTime: 8,
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
  authorName: "Openwind",
  sources: [],
  linkedSpotIds: [],
  linkedStationIds: [],
  relatedArticleIds: [],
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

function articleDtoToEditable(article: ArticleDto): EditableArticle {
  return {
    kind: article.kind,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImage: article.coverImage ?? "",
    coverAlt: article.coverAlt ?? "",
    category: article.category,
    location: article.location ?? "",
    readTime: article.readTime,
    status: article.status,
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
    authorName: article.authorName,
    sources: article.sources,
    linkedSpotIds: article.linkedSpotIds,
    linkedStationIds: article.linkedStationIds,
    relatedArticleIds: article.relatedArticleIds,
  };
}

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<EditableArticle>(emptyArticle);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [relationOptions, setRelationOptions] =
    useState<ArticleRelationOptions | null>(null);
  const [relationsLoading, setRelationsLoading] = useState(true);
  const [slugTouched, setSlugTouched] = useState(Boolean(articleId));
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!articleId) return;

    fetch(`/api/admin/articles/${articleId}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Article introuvable");
        return (await response.json()) as ArticleDto;
      })
      .then((data) => setArticle(articleDtoToEditable(data)))
      .catch((error: Error) =>
        setMessage({ type: "error", text: error.message }),
      )
      .finally(() => setLoading(false));
  }, [articleId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/articles/relations", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Relations indisponibles");
        return (await response.json()) as ArticleRelationOptions;
      })
      .then((data) => {
        if (!cancelled) setRelationOptions(data);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: "Les spots et balises associés n’ont pas pu être chargés.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setRelationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const previewTitle = article.title || "Titre de l’article";
  const isLocalGuide = article.kind === "LOCAL_GUIDE";
  const previewContent = useMemo(
    () => article.content || "Commence à rédiger pour afficher l’aperçu…",
    [article.content],
  );
  const spotOptions = useMemo(
    () =>
      (relationOptions?.spots ?? []).map((spot) => ({
        id: spot.id,
        label: spot.name,
        meta: [spot.region, spot.country, spot.sportType === "KITE" ? "Kite" : "Parapente"]
          .filter(Boolean)
          .join(" · "),
      })),
    [relationOptions],
  );
  const stationOptions = useMemo(
    () =>
      (relationOptions?.stations ?? []).map((station) => ({
        id: station.id,
        label: station.name,
        meta: `${station.source} · ${station.id}`,
      })),
    [relationOptions],
  );
  const relatedArticleOptions = useMemo(
    () =>
      (relationOptions?.articles ?? [])
        .filter((option) => option.id !== articleId)
        .map((option) => ({
          id: option.id,
          label: option.title,
          meta: `${option.kind === "LOCAL_GUIDE" ? "Guide local" : "Article"} · ${
            option.status === "PUBLISHED" ? "Publié" : "Non publié"
          }`,
        })),
    [articleId, relationOptions],
  );

  function setField<K extends keyof EditableArticle>(
    key: K,
    value: EditableArticle[K],
  ) {
    setArticle((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setArticle((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugifyArticleTitle(value),
    }));
  }

  function updateSource(
    index: number,
    key: keyof ArticleSource,
    value: string,
  ) {
    setArticle((current) => ({
      ...current,
      sources: current.sources.map((source, sourceIndex) =>
        sourceIndex === index ? { ...source, [key]: value } : source,
      ),
    }));
  }

  async function saveArticle(statusOverride?: ArticleStatusValue) {
    setSaving(true);
    setMessage(null);

    const payload = {
      ...article,
      status: statusOverride ?? article.status,
      sources: article.sources.filter(
        (source) => source.label.trim() && source.url.trim(),
      ),
    };

    try {
      const response = await fetch(
        articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles",
        {
          method: articleId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as ArticleDto & { error?: string };

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error ?? "Impossible d’enregistrer l’article",
        });
        return;
      }

      setArticle(articleDtoToEditable(data));
      setMessage({
        type: "ok",
        text:
          data.status === "PUBLISHED"
            ? data.kind === "LOCAL_GUIDE"
              ? "Guide local publié avec succès."
              : "Article publié avec succès."
            : "Brouillon enregistré.",
      });

      if (!articleId) {
        router.replace(`/admin/articles/${data.id}/edit`);
      }
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Erreur réseau" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverUpload(file: File | undefined) {
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/articles/images", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Envoi impossible");
      }

      setArticle((current) => ({
        ...current,
        coverImage: data.url!,
        coverAlt:
          current.coverAlt || file.name.replace(/\.[a-z0-9]+$/i, ""),
      }));
      setMessage({ type: "ok", text: "Image de couverture envoyée." });
    } catch (uploadError) {
      setMessage({
        type: "error",
        text:
          uploadError instanceof Error
            ? uploadError.message
            : "Envoi impossible",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/articles"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux articles
            </Link>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              {articleId
                ? isLocalGuide
                  ? "Modifier le guide local"
                  : "Modifier l’article"
                : "Nouvel article"}
            </h1>
            {isLocalGuide && (
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Ce contenu alimente la page publique du lac de la Gruyère. Les
                balises en direct et les modules locaux restent automatiquement
                intégrés autour de ton texte.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveArticle("DRAFT")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => saveArticle("PUBLISHED")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Publier
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Titre
                  </span>
                  <input
                    value={article.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    maxLength={180}
                    className={`${fieldClass} text-base font-semibold`}
                    placeholder="Comprendre le vent sur…"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Adresse de l’article
                  </span>
                  <div className="flex rounded-lg border border-slate-300 bg-slate-50 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                    <span className="hidden items-center border-r border-slate-200 px-3 text-xs text-slate-400 sm:flex">
                      {isLocalGuide ? "/fr/vent-en-direct/" : "/fr/carnet/"}
                    </span>
                    <input
                      value={article.slug}
                      disabled={isLocalGuide}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setField("slug", slugifyArticleTitle(event.target.value));
                      }}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      placeholder="mon-article"
                    />
                  </div>
                  {isLocalGuide && (
                    <span className="mt-1.5 block text-xs text-slate-400">
                      L’adresse du guide local est protégée pour préserver son
                      référencement.
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                    Résumé
                    <span className="font-normal text-slate-400">
                      {article.excerpt.length}/600
                    </span>
                  </span>
                  <textarea
                    value={article.excerpt}
                    onChange={(event) => setField("excerpt", event.target.value)}
                    maxLength={600}
                    rows={4}
                    className={fieldClass}
                    placeholder="Deux ou trois phrases visibles sur la page du Carnet et dans Google."
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-sky-600" />
                    Contenu complet
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {isLocalGuide
                      ? "Ce texte apparaît sous les balises en direct. Markdown : ## intertitre · **gras** · - liste · > encadré"
                      : "Markdown : ## intertitre · **gras** · - liste · > encadré"}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {article.content.length} caractères
                </span>
              </div>
              <textarea
                value={article.content}
                onChange={(event) => setField("content", event.target.value)}
                className="min-h-[620px] w-full resize-y bg-white px-5 py-5 font-mono text-[13px] leading-6 text-slate-800 outline-none sm:px-6"
                placeholder="## Premier intertitre&#10;&#10;Rédige ton article ici…"
              />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Publication</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statut
                  </span>
                  <select
                    value={article.status}
                    onChange={(event) =>
                      setField(
                        "status",
                        event.target.value as ArticleStatusValue,
                      )
                    }
                    className={fieldClass}
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                    <option value="ARCHIVED">Archivé</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Auteur
                  </span>
                  <input
                    value={article.authorName}
                    onChange={(event) =>
                      setField("authorName", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Présentation</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Catégorie
                  </span>
                  <input
                    value={article.category}
                    onChange={(event) =>
                      setField("category", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Région
                  </span>
                  <input
                    value={article.location}
                    onChange={(event) =>
                      setField("location", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Temps de lecture
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={article.readTime}
                      onChange={(event) =>
                        setField("readTime", Number(event.target.value))
                      }
                      className={fieldClass}
                    />
                    <span className="text-sm text-slate-500">min</span>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    URL de l’image
                  </span>
                  <input
                    type="url"
                    value={article.coverImage}
                    onChange={(event) =>
                      setField("coverImage", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="https://…"
                  />
                </label>
                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ou envoyer une image
                  </span>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageUp className="h-4 w-4" />
                    )}
                    {uploadingImage ? "Envoi en cours…" : "Choisir un fichier"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadingImage}
                      onChange={(event) =>
                        handleCoverUpload(event.target.files?.[0])
                      }
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-1.5 text-xs text-slate-400">
                    JPG, PNG ou WebP · 8 Mo maximum
                  </p>
                </div>
                {article.coverImage && (
                  <div className="aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
                    {/* Admin previews accept any validated HTTPS source. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={article.coverAlt || "Aperçu de la couverture"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Texte alternatif
                  </span>
                  <input
                    value={article.coverAlt}
                    onChange={(event) =>
                      setField("coverAlt", event.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Liens éditoriaux</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ces choix créent automatiquement les passerelles vers le
                terrain et les autres Carnets.
              </p>
              <div className="mt-5 space-y-6">
                {isLocalGuide ? (
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-800">
                    Les balises de Morlon et Marsens ainsi que la fiche du spot
                    sont déjà intégrées directement dans ce guide local.
                  </div>
                ) : (
                  <>
                    <ArticleRelationPicker
                      title="Spots associés"
                      description="Affiche les fiches terrain à consulter après la lecture."
                      options={spotOptions}
                      selectedIds={article.linkedSpotIds}
                      onChange={(ids) => setField("linkedSpotIds", ids)}
                      loading={relationsLoading}
                      emptyLabel="Aucun spot trouvé."
                    />
                    <ArticleRelationPicker
                      title="Balises associées"
                      description="Ajoute des accès directs aux mesures utiles pour l’article."
                      options={stationOptions}
                      selectedIds={article.linkedStationIds}
                      onChange={(ids) => setField("linkedStationIds", ids)}
                      loading={relationsLoading}
                      emptyLabel="Aucune balise trouvée."
                    />
                  </>
                )}
                <ArticleRelationPicker
                  title="Carnets recommandés"
                  description="Contrôle précisément le bloc « À lire aussi »."
                  options={relatedArticleOptions}
                  selectedIds={article.relatedArticleIds}
                  onChange={(ids) => setField("relatedArticleIds", ids)}
                  loading={relationsLoading}
                  emptyLabel="Aucun autre Carnet trouvé."
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Référencement</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Titre SEO
                    <span>{article.seoTitle.length}/70</span>
                  </span>
                  <input
                    value={article.seoTitle}
                    maxLength={70}
                    onChange={(event) =>
                      setField("seoTitle", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Le titre de l’article par défaut"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description SEO
                    <span>{article.seoDescription.length}/180</span>
                  </span>
                  <textarea
                    value={article.seoDescription}
                    maxLength={180}
                    rows={4}
                    onChange={(event) =>
                      setField("seoDescription", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Le résumé de l’article par défaut"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Sources</h2>
                <button
                  type="button"
                  onClick={() =>
                    setField("sources", [
                      ...article.sources,
                      { label: "", url: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {article.sources.length === 0 && (
                  <p className="text-xs leading-5 text-slate-500">
                    Ajoute les sources officielles utilisées dans l’article.
                  </p>
                )}
                {article.sources.map((source, index) => (
                  <div
                    key={`${index}-${source.url}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          value={source.label}
                          onChange={(event) =>
                            updateSource(index, "label", event.target.value)
                          }
                          className={fieldClass}
                          placeholder="Nom de la source"
                        />
                        <input
                          type="url"
                          value={source.url}
                          onChange={(event) =>
                            updateSource(index, "url", event.target.value)
                          }
                          className={fieldClass}
                          placeholder="https://…"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setField(
                            "sources",
                            article.sources.filter(
                              (_, sourceIndex) => sourceIndex !== index,
                            ),
                          )
                        }
                        className="rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer la source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 sm:px-8">
            <Eye className="h-4 w-4 text-sky-600" />
            <h2 className="font-semibold text-slate-900">
              {isLocalGuide ? "Aperçu du guide local" : "Aperçu de l’article"}
            </h2>
          </div>
          <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              {article.category || "Carnet Openwind"}
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-slate-950">
              {previewTitle}
            </h2>
            {article.excerpt && (
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {article.excerpt}
              </p>
            )}
            <div className="mt-10 border-t border-slate-200 pt-8">
              <ArticleMarkdown compact>{previewContent}</ArticleMarkdown>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
