"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { PlaceActions } from "@/components/navigation/PlaceActions";
import { withoutLocale } from "@/lib/access";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ACCESS_COPY, accessRoute, journeyKey, returnTitle, safeReturnPath } from "@/lib/access";
import { journeyReturn, rememberJourney, subscribeJourney } from "@/lib/journey-store";
import { toSiteLocale } from "@/lib/site";

export function AccessFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/", query = useSearchParams();
  const locale = toSiteLocale(useLocale()), c = ACCESS_COPY[locale];
  const current = pathname + (query.size ? `?${query.toString()}` : "");
  const route = accessRoute(pathname, locale);
  const conditions = [/^\/webcams$/, /^\/temperatures$/, /^\/lacs\//, /^\/vent-en-direct\//].some(pattern => pattern.test(withoutLocale(pathname)));
  const previous = useSyncExternalStore(subscribeJourney, () => journeyReturn(current), () => null);
  const explicit = safeReturnPath(query.get("back"), locale);
  const target = explicit && journeyKey(explicit) !== journeyKey(current)
    ? { href: explicit, title: previous?.href === explicit ? previous.title : returnTitle(explicit, locale, query.get("name") ?? undefined) }
    : previous ?? route.parent;

  useEffect(() => {
    const capture = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.defaultPrevented) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.hasAttribute("data-journey-back")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const to = safeReturnPath(url.pathname + url.search + url.hash, locale);
      const from = safeReturnPath(window.location.pathname + window.location.search + window.location.hash, locale);
      if (!to || !from || journeyKey(to) === journeyKey(from)) return;
      if (anchor.closest(".ow-primary-navigation,.ow-bottom-navigation,.ow-site-logo,[data-journey-breadcrumb]")) { rememberJourney(to, null, locale); return; }
      if (journeyReturn(from)?.href === to) return;
      const title = document.querySelector("main h1")?.textContent?.trim() || returnTitle(from, locale);
      rememberJourney(to, { href: from, title }, locale);
    };
    document.addEventListener("click", capture, true);
    return () => document.removeEventListener("click", capture, true);
  }, [locale]);

  if (!route.frame) return children;
  return <div className={`ow-access-frame${conditions ? " ow-access-frame-conditions" : ""}`}>
    <div className={`ow-access-navigation${target ? " ow-access-has-back" : ""}`}>
      <nav aria-label={c.breadcrumb} data-journey-breadcrumb><ol>{route.crumbs.map((crumb, index) => <li key={index}>
        {index > 0 && <ChevronRight aria-hidden size={14} />}
        {crumb.href ? <Link href={crumb.href} prefetch={false}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
      </li>)}</ol></nav>
      {target && <Link href={target.href} prefetch={false} className="ow-access-back" data-journey-back aria-label={`${c.back} : ${target.title}`}><ArrowLeft aria-hidden size={16} /><span>{target.title}</span></Link>}
    </div>
    {conditions && <div className="ow-access-place"><PlaceActions compact onlySelected /></div>}
    {children}
  </div>;
}
