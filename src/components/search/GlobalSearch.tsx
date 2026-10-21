"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Search,
  X,
  Waves,
  MapPin,
  RadioTower,
  Camera,
  BookOpen,
  ArrowUpRight,
  Star,
  LoaderCircle,
} from "lucide-react";
import {
  SEARCH_COPY,
  SEARCH_KINDS,
  type SearchKind,
  type SearchResponse,
  type SearchResult,
} from "@/lib/search";
import { toSiteLocale } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const ICONS = {
  lake: Waves,
  spot: MapPin,
  station: RadioTower,
  webcam: Camera,
  article: BookOpen,
};
const EMPTY_IDS = new Set<string>();
export interface GlobalSearchProps {
  variant?: "hero" | "compact";
  favoriteSpotIds?: Set<string>;
  favoriteStationIds?: Set<string>;
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export function GlobalSearch({
  variant = "compact",
  favoriteSpotIds = EMPTY_IDS,
  favoriteStationIds = EMPTY_IDS,
  autoFocus,
  onNavigate,
}: GlobalSearchProps) {
  const locale = toSiteLocale(useLocale());
  const copy = SEARCH_COPY[locale];
  const router = useRouter();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "">("");
  const [open, setOpen] = useState(Boolean(autoFocus));
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const [settled, setSettled] = useState<{
    key: string;
    data?: SearchResponse;
    error?: boolean;
  }>({ key: "" });
  const favorites = [...favoriteSpotIds]
    .slice(0, 12)
    .map((value) => `spot:${value}`)
    .concat(
      [...favoriteStationIds].slice(0, 12).map((value) => `station:${value}`),
    );
  const params = new URLSearchParams({ q: query.trim(), locale });
  if (kind) params.set("type", kind);
  if (!query.trim() && favorites.length)
    params.set("favorites", favorites.join(","));
  const key = `${params.toString()}&retry=${retry}`;
  const data = settled.key === key ? settled.data : undefined;
  const error = settled.key === key && settled.error;
  const loading = open && settled.key !== key;
  const results = SEARCH_KINDS.flatMap(
    (group) => data?.results.filter((result) => result.kind === group) ?? [],
  );
  const selected = results[active];

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        try {
          const response = await fetch(`/api/search?${key}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Search unavailable");
          const data: SearchResponse = await response.json();
          if (!controller.signal.aborted) setSettled({ key, data });
        } catch {
          if (!controller.signal.aborted) setSettled({ key, error: true });
        }
      },
      query.trim() ? 180 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, open, query]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  useEffect(() => {
    if (selected)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, id, selected]);

  function choose(result: SearchResult) {
    trackEvent("search_result_open", {
      result_type: result.kind,
      result_id: result.id,
      source: query.trim() ? "global_search" : "suggestions",
      locale,
    });
    setOpen(false);
    onNavigate?.();
  }
  return (
    <div
      ref={ref}
      className="relative min-w-0 flex-1 text-left"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <div
        className={`relative flex items-center border bg-white transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100 ${variant === "hero" ? "rounded-2xl border-slate-200 p-2 shadow-[0_12px_45px_-18px_rgba(15,23,42,0.28)]" : "rounded-full border-slate-200 bg-slate-50"}`}
      >
        <Search
          aria-hidden="true"
          className={`pointer-events-none shrink-0 text-sky-700 ${variant === "hero" ? "ml-3 h-6 w-6" : "ml-3 h-4 w-4"}`}
        />
        <label className="sr-only" htmlFor={`${id}-input`}>
          {copy.label}
        </label>
        <input
          id={`${id}-input`}
          ref={input}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? `${id}-results` : undefined}
          aria-activedescendant={
            open && selected ? `${id}-option-${active}` : undefined
          }
          aria-describedby={`${id}-status`}
          type="text"
          inputMode="search"
          autoComplete="off"
          maxLength={80}
          value={query}
          placeholder={variant === "hero" ? copy.placeholder : copy.short}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActive(-1);
              event.stopPropagation();
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActive((index) =>
                results.length
                  ? index < 0
                    ? event.key === "ArrowDown"
                      ? 0
                      : results.length - 1
                    : (index +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        results.length) %
                      results.length
                  : -1,
              );
            }
            if (event.key === "Enter" && results.length) {
              event.preventDefault();
              const result = selected ?? results[0];
              choose(result);
              router.push(result.href);
            }
          }}
          className={`min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500 ${variant === "hero" ? "px-3 py-3 sm:py-4" : "px-2 py-2 sm:text-sm"}`}
        />
        {query && (
          <button
            type="button"
            aria-label={copy.clear}
            onClick={() => {
              setQuery("");
              setActive(-1);
              input.current?.focus();
            }}
            className="mr-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
        {variant === "hero" && (
          <span
            aria-hidden="true"
            className="mr-2 hidden rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500 sm:block"
          >
            ↵
          </span>
        )}
      </div>
      <span
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {open
          ? loading
            ? copy.loading
            : error
              ? copy.error
              : `${results.length} ${copy.count}`
          : ""}
      </span>
      {open && (
        <div className="absolute inset-x-0 top-full z-[60] mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div
            aria-label={copy.label}
            className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2"
          >
            {["", ...SEARCH_KINDS].map((type) => (
              <button
                type="button"
                key={type}
                aria-pressed={kind === type}
                onClick={() => {
                  setKind(type as SearchKind | "");
                  setActive(-1);
                  input.current?.focus();
                }}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-sky-600 ${kind === type ? "bg-sky-100 text-sky-900" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {type ? copy.kinds[type as SearchKind] : copy.all}
              </button>
            ))}
          </div>
          <div
            id={`${id}-results`}
            role="listbox"
            aria-label={copy.label}
            aria-busy={loading}
            className="max-h-[min(55dvh,440px)] overflow-y-auto overscroll-contain p-2"
          >
            {loading && (
              <div
                role="presentation"
                className="flex items-center gap-2 p-4 text-sm text-slate-600"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 motion-safe:animate-spin"
                />
                {copy.loading}
              </div>
            )}
            {error && (
              <div role="presentation" className="p-4">
                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  className="text-sm text-sky-800 underline"
                >
                  {copy.error}
                </button>
              </div>
            )}
            {!loading && !error && results.length === 0 && (
              <p role="presentation" className="p-4 text-sm text-slate-600">
                {copy.empty}
              </p>
            )}
            {SEARCH_KINDS.map((group) => {
              const matches = results.filter((result) => result.kind === group);
              if (!matches.length) return null;
              return (
                <div
                  key={group}
                  role="group"
                  aria-labelledby={`${id}-${group}`}
                >
                  <p
                    id={`${id}-${group}`}
                    className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"
                  >
                    {copy.kinds[group]}
                  </p>
                  {matches.map((result) => {
                    const index = results.indexOf(result);
                    const Icon = ICONS[result.kind];
                    const favorite =
                      result.kind === "spot"
                        ? favoriteSpotIds.has(result.id)
                        : result.kind === "station" &&
                          favoriteStationIds.has(result.id);
                    return (
                      <Link
                        key={`${result.kind}-${result.id}`}
                        id={`${id}-option-${index}`}
                        href={result.href}
                        role="option"
                        aria-label={`${result.title} · ${result.subtitle}`}
                        aria-selected={active === index}
                        prefetch={false}
                        onClick={() => choose(result)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 focus-visible:outline-2 focus-visible:outline-sky-600 ${active === index ? "bg-sky-50" : "hover:bg-slate-50"}`}
                      >
                        <span className="rounded-xl bg-slate-100 p-2 text-sky-800">
                          <Icon aria-hidden="true" className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900">
                            {result.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {result.subtitle}
                          </span>
                        </span>
                        {favorite && (
                          <Star
                            aria-label={copy.favorites}
                            className="h-4 w-4 fill-amber-400 text-amber-500"
                          />
                        )}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 text-slate-400"
                        />
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {data?.partial && (
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-amber-800">
              {copy.partial}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
