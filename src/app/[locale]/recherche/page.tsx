import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { ContextDestination } from "@/components/navigation/ContextDestination";
import { AccessPageHeader } from "@/components/ui/AccessPageHeader";
import { getSearchEntries } from "@/lib/search-data";
import { rankSearchEntries, SEARCH_COPY, SEARCH_KINDS, type SearchKind } from "@/lib/search";
import { PLACE_COPY } from "@/lib/place";
import { toSiteLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[]; type?: string | string[]; page?: string | string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return { title: PLACE_COPY[toSiteLocale((await params).locale)].results, robots: { index: false, follow: true } }; }
export default async function SearchPage({ params, searchParams }: Props) {
  const locale = toSiteLocale((await params).locale), q = await searchParams, c = PLACE_COPY[locale], copy = SEARCH_COPY[locale];
  const query = typeof q.q === "string" ? q.q.trim().slice(0, 80) : "";
  const kind = typeof q.type === "string" && SEARCH_KINDS.includes(q.type as SearchKind) ? q.type as SearchKind : undefined;
  const { entries, partial } = await getSearchEntries(locale), all = rankSearchEntries(entries, query, kind);
  const size = 20, pages = Math.max(1, Math.ceil(all.length / size));
  const requested = typeof q.page === "string" && /^\d{1,6}$/.test(q.page) ? Number(q.page) : 1, page = Math.max(1, Math.min(pages, requested));
  const href = (type?: SearchKind, number = 1) => `/${locale}/recherche?${new URLSearchParams({ q: query, ...(type ? { type } : {}), ...(number > 1 ? { page: String(number) } : {}) })}#search-results`;
  return <div className="ow-access-content ow-search-page"><AccessPageHeader title={c.results} description={c.noQuery} />
    <form role="search" action={`/${locale}/recherche`} method="get" className="ow-access-search"><label>{c.search}<input name="q" type="search" defaultValue={query} maxLength={80} /></label>{kind && <input type="hidden" name="type" value={kind} />}<button type="submit" className="ow-primary"><Search size={18} aria-hidden />{c.searchButton}</button></form>
    <nav className="ow-search-filters" aria-label={c.filters}><Link href={href()} aria-current={!kind ? "page" : undefined}>{copy.all}</Link>{SEARCH_KINDS.map(type => <Link key={type} href={href(type)} aria-current={kind === type ? "page" : undefined}>{copy.kinds[type]}</Link>)}</nav>
    {partial && <p role="status" className="ow-access-note">{copy.partial}</p>}
    <section id="search-results" className="scroll-mt-20" aria-label={c.results}><p role="status" className="ow-access-note">{all.length ? `${(page - 1) * size + 1}–${Math.min(page * size, all.length)} / ` : ""}{all.length} {all.length === 1 ? c.countOne : c.count}</p>
      {all.length === 0 ? <p className="ow-access-note">{c.resultsEmpty} <Link href={`/${locale}/explorer`} className="ow-access-link">{({fr:"Explorer",en:"Explore",de:"Entdecken",it:"Esplora"})[locale]}</Link></p> : <ul className="ow-search-results">{all.slice((page - 1) * size, page * size).map(result => <li key={`${result.kind}:${result.id}`}><ContextDestination href={result.href} prefetch={false}><div><span>{copy.kinds[result.kind]}</span><h2>{result.title}</h2><p>{result.subtitle}</p></div><ChevronRight size={18} aria-hidden /></ContextDestination></li>)}</ul>}
    </section>
    {pages > 1 && <nav className="ow-search-pagination" aria-label={c.results}>{page > 1 && <Link href={href(kind, page - 1)}>{c.previous}</Link>}<span>{page} / {pages}</span>{page < pages && <Link href={href(kind, page + 1)}>{c.next}</Link>}</nav>}
  </div>;
}
