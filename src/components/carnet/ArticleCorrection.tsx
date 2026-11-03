import type { ArticleHeading } from "@/lib/article-headings";

export function ArticleCorrection({ slug, headings }: { slug: string; headings: ArticleHeading[] }) {
  return <details className="mt-4 border-t border-slate-200 pt-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-sky-800">Signaler une correction</summary>
    <form action="/fr/forum" method="get" className="mt-2 space-y-3">
      <input type="hidden" name="article" value={slug} />
      <label className="block text-sm text-slate-700">Rubrique concernée<select name="section" className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">L’ensemble de l’article</option>{headings.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}</select></label>
      <p className="text-sm leading-6 text-slate-600">Le titre et la rubrique seront ajoutés au message. Tu pourras le compléter avant publication sur le forum.</p>
      <button type="submit" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-sky-800">Préparer le message</button>
    </form>
  </details>;
}
