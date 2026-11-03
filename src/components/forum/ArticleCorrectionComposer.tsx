"use client";
import { useState } from "react";
import type { CorrectionDraft } from "@/lib/article-correction";
import { NewTopicForm } from "./NewTopicForm";

export function ArticleCorrectionComposer({ draft, categories }: { draft: CorrectionDraft; categories: { slug: string; name: string }[] }) {
  const [category, setCategory] = useState(() => categories.find((item) => item.slug === "carnet")?.slug ?? "");
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return <section aria-labelledby="article-correction-title" className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="article-correction-title" className="text-lg font-semibold text-slate-950">Proposer une correction</h2><button type="button" className="min-h-11 px-3 text-sm text-slate-600 underline" onClick={() => setDismissed(true)}>Annuler</button></div>
    <p className="mt-2 text-sm leading-6 text-slate-600">Le message contient la référence à « {draft.articleTitle} ». Complète-le avant de le publier.</p>
    <label className="my-4 block text-sm font-medium text-slate-700">Catégorie du forum<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3"><option value="">Choisir une catégorie</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
    {category && <NewTopicForm categorySlug={category} initialTitle={draft.title} initialBody={draft.body} onCancel={() => setDismissed(true)} />}
  </section>;
}
