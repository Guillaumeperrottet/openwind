"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Copy,
  List,
  LoaderCircle,
  LocateFixed,
  Map,
  MapPin,
  Search,
  Wind,
  X,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  addDays,
  parsePlannerCriteria,
  quickDates,
  selectRecommendations,
  type PlannerCriteria,
  type PlannerResponse,
  type PlannerResult,
  type PlannerWindow,
} from "@/lib/planner";
import type { PlannerCopy } from "@/lib/planner-copy";
import type { SiteLocale } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

const PlannerMap = dynamic(() => import("./PlannerMap"), { ssr: false });
type Place = { id?: number; name: string; lat: number; lng: number };
const fieldClass =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600";

export function TripPlanner({
  searchParams,
  locale,
  copy: c,
  today,
}: {
  searchParams: Record<string, string | undefined>;
  locale: SiteLocale;
  copy: PlannerCopy;
  today: string;
}) {
  const router = useRouter();
  const initialParams = new URLSearchParams(
    Object.entries(searchParams).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  const initial = parsePlannerCriteria(initialParams, today);
  const [startDate, setStartDate] = useState(initial?.startDate ?? today);
  const [endDate, setEndDate] = useState(initial?.endDate ?? today);
  const [sport, setSport] = useState<PlannerCriteria["sport"]>(
    initial?.sport ?? "KITE",
  );
  const [radius, setRadius] = useState(initial?.radius ?? 150);
  const [place, setPlace] = useState<Place | null>(
    initial?.lat !== undefined && initial.lng !== undefined
      ? {
          lat: initial.lat,
          lng: initial.lng,
          name:
            searchParams.place ||
            `${initial.lat.toFixed(3)}, ${initial.lng.toFixed(3)}`,
        }
      : null,
  );
  const [query, setQuery] = useState(place?.name ?? "");
  const [locations, setLocations] = useState<Place[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [activeOption, setActiveOption] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [response, setResponse] = useState<PlannerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [visible, setVisible] = useState(9);
  const [selected, setSelected] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  const locationRequest = useRef<AbortController | null>(null);
  const geoGeneration = useRef(0);
  const lastUrl = useRef("");
  const resultsRef = useRef<HTMLElement>(null);
  const scrollAfterSearch = useRef(false);
  const selectionRef = useRef<HTMLDivElement>(null);
  const urlKey = initialParams.toString();

  const runSearch = useCallback(
    async (criteria: PlannerCriteria, name: string, updateUrl: boolean) => {
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      setLoading(true);
      setError("");
      setResponse(null);
      setDirty(false);
      setVisible(9);
      setCopyStatus("");
      setSelected(null);
      setView("list");
      scrollAfterSearch.current = updateUrl;
      const params = new URLSearchParams({
        startDate: criteria.startDate,
        endDate: criteria.endDate,
        sport: criteria.sport,
        radius: String(criteria.radius),
      });
      if (criteria.lat !== undefined && criteria.lng !== undefined) {
        params.set("lat", String(criteria.lat));
        params.set("lng", String(criteria.lng));
        if (name) params.set("place", name);
      }
      if (updateUrl) {
        lastUrl.current = params.toString();
        router.replace(`/plan?${params}`, { scroll: false });
      }
      params.set("locale", locale);
      try {
        const res = await fetch(`/api/plan?${params}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (Array.isArray(data.spots)) {
          setResponse(data);
          if (updateUrl)
            trackEvent("plan_search", {
              search_mode: criteria.lat === undefined ? "catalogue" : "near_me",
              sport: criteria.sport.toLowerCase(),
              radius_km: criteria.radius,
              date_days:
                Math.round(
                  (Date.parse(criteria.endDate) -
                    Date.parse(criteria.startDate)) /
                    86400000,
                ) + 1,
              has_location: criteria.lat !== undefined,
              results_count: data.spots.length,
              recommended_count: data.meta.recommended,
              data_source: data.mode,
            });
          if (!res.ok) setError(c.error);
        } else setError(res.status === 400 ? c.invalid : c.error);
      } catch {
        if (!controller.signal.aborted) setError(c.error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [c.error, c.invalid, locale, router],
  );

  useEffect(() => {
    if (lastUrl.current === urlKey && !request.current?.signal.aborted) return;
    lastUrl.current = urlKey;
    const params = new URLSearchParams(urlKey),
      criteria = parsePlannerCriteria(params, today);
    if (!params.has("startDate")) return;
    if (!criteria) {
      setError(c.invalid);
      return;
    }
    const restored =
      criteria.lat !== undefined && criteria.lng !== undefined
        ? {
            lat: criteria.lat,
            lng: criteria.lng,
            name:
              params.get("place") ||
              `${criteria.lat.toFixed(3)}, ${criteria.lng.toFixed(3)}`,
          }
        : null;
    setStartDate(criteria.startDate);
    setEndDate(criteria.endDate);
    setSport(criteria.sport);
    setRadius(criteria.radius);
    setPlace(restored);
    setQuery(restored?.name || "");
    void runSearch(criteria, restored?.name || "", false);
  }, [urlKey, today, runSearch, c.invalid]);
  useEffect(
    () => () => {
      request.current?.abort();
      locationRequest.current?.abort();
      geoGeneration.current++;
    },
    [],
  );

  useEffect(() => {
    if (response && scrollAfterSearch.current) {
      scrollAfterSearch.current = false;
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [response]);

  useEffect(() => {
    locationRequest.current?.abort();
    if (place || query.trim().length < 2 || !locationOpen) {
      setLocations([]);
      setLocationStatus("");
      return;
    }
    const controller = new AbortController();
    locationRequest.current = controller;
    const timer = setTimeout(async () => {
      setLocationStatus(c.searchingCity);
      try {
        const res = await fetch(
          `/api/plan/locations?${new URLSearchParams({ q: query.trim(), locale })}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) throw new Error("geocoding");
        setLocations(data.locations);
        setActiveOption(-1);
        setLocationStatus(data.locations.length ? "" : c.noCity);
      } catch {
        if (!controller.signal.aborted) {
          setLocations([]);
          setLocationStatus(c.geoError);
        }
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    place,
    locale,
    locationOpen,
    c.searchingCity,
    c.noCity,
    c.geoError,
  ]);

  const choose = (value: Place) => {
    geoGeneration.current++;
    setLocating(false);
    setPlace(value);
    setQuery(value.name);
    setLocationOpen(false);
    setLocations([]);
    setDirty(true);
    setError("");
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setError(c.locationError);
      return;
    }
    const generation = ++geoGeneration.current;
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (generation !== geoGeneration.current) return;
        choose({
          name: c.locate,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        if (generation === geoGeneration.current) {
          setLocating(false);
          setError(c.locationError);
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim() && !place) {
      setError(c.chooseCity);
      document.getElementById("planner-city")?.focus();
      return;
    }
    const params = new URLSearchParams({
      startDate,
      endDate,
      radius: String(radius),
      sport,
    });
    if (place) {
      params.set("lat", String(place.lat));
      params.set("lng", String(place.lng));
    }
    const criteria = parsePlannerCriteria(params, today);
    if (!criteria) {
      setError(c.invalid);
      return;
    }
    void runSearch(criteria, place?.name ?? "", true);
  };
  const recommendations = useMemo(
    () => (response ? selectRecommendations(response.spots) : []),
    [response],
  );
  const others = useMemo(
    () =>
      response?.spots.filter(
        (s) => !recommendations.some((r) => r.id === s.id),
      ) ?? [],
    [response, recommendations],
  );
  const mapSpots = useMemo(
    () =>
      response?.mode === "seasonal"
        ? response.spots.filter((s) => !s.unavailable)
        : [
            ...recommendations,
            ...(response?.spots.filter(
              (s) =>
                s.windows.length && !recommendations.some((r) => r.id === s.id),
            ) ?? []),
          ],
    [response, recommendations],
  );
  const selectedSpot = mapSpots.find((s) => s.id === selected) ?? mapSpots[0];
  const selectSpot = useCallback((id: string) => {
    setSelected(id);
    selectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);
  const longRange = endDate > addDays(today, 15);

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-28 text-slate-900 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-14">
        <div className="mb-6 flex items-start justify-between gap-8 sm:mb-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-sky-700">
              {c.eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.1]">
              {c.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-lg">
              {c.intro}
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-teal-800">
              <Check size={15} aria-hidden />
              {c.free}
            </p>
          </div>
          <div
            aria-hidden
            className="hidden shrink-0 rounded-[2rem] border border-white bg-gradient-to-br from-sky-100 via-white to-teal-50 p-8 shadow-sm lg:block"
          >
            <Compass
              size={46}
              strokeWidth={1.25}
              className="mb-7 text-sky-700"
            />
            <div className="space-y-3 text-sm text-slate-600">
              {[c.datesStep, c.compareStep, c.goStep].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-sky-700 shadow-sm">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form
          onSubmit={submit}
          onChange={() => setDirty(true)}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_45px_-30px_#0f172a50] sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 sm:gap-4 sm:pb-5">
            <fieldset>
              <legend className="sr-only">{c.sport}</legend>
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {(["KITE", "PARAGLIDE"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={sport === s}
                    onClick={() => {
                      setSport(s);
                      setDirty(true);
                    }}
                    className={`${buttonClass} px-3 sm:px-4 ${sport === s ? "bg-white text-sky-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {s === "KITE" ? c.kite : c.para}
                  </button>
                ))}
              </div>
            </fieldset>
            <Link
              href="/?view=map"
              prefetch={false}
              aria-label={c.mapLink}
              className="flex min-h-11 items-center gap-2 text-sm font-medium text-sky-800 hover:underline"
            >
              <Map size={17} aria-hidden />
              <span className="sm:hidden">{c.map}</span>
              <span className="hidden sm:inline">{c.mapLink}</span>
              <ArrowRight size={15} aria-hidden className="hidden sm:block" />
            </Link>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative">
              <label
                htmlFor="planner-city"
                className="mb-2 block text-sm font-medium"
              >
                {c.where}
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-3 top-4 text-slate-400"
                  aria-hidden
                />
                <input
                  id="planner-city"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="planner-cities"
                  aria-expanded={locationOpen && locations.length > 0}
                  aria-activedescendant={
                    activeOption >= 0 && locations[activeOption]
                      ? `planner-city-${activeOption}`
                      : undefined
                  }
                  autoComplete="off"
                  placeholder={c.placeholder}
                  value={query}
                  className={`${fieldClass} pl-10 pr-11`}
                  onFocus={() => setLocationOpen(true)}
                  onBlur={() => setLocationOpen(false)}
                  onChange={(e) => {
                    geoGeneration.current++;
                    setLocating(false);
                    locationRequest.current?.abort();
                    setQuery(e.target.value);
                    setPlace(null);
                    setLocations([]);
                    setActiveOption(-1);
                    setLocationOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      setLocationOpen(true);
                      setActiveOption((i) =>
                        Math.max(
                          0,
                          Math.min(
                            locations.length - 1,
                            i + (e.key === "ArrowDown" ? 1 : -1),
                          ),
                        ),
                      );
                    } else if (e.key === "Escape") setLocationOpen(false);
                    else if (
                      e.key === "Enter" &&
                      locationOpen &&
                      activeOption >= 0 &&
                      locations[activeOption]
                    ) {
                      e.preventDefault();
                      choose(locations[activeOption]);
                    }
                  }}
                />
                {query && (
                  <button
                    type="button"
                    aria-label={c.clear}
                    onClick={() => {
                      geoGeneration.current++;
                      setLocating(false);
                      setQuery("");
                      setPlace(null);
                      setDirty(true);
                      document.getElementById("planner-city")?.focus();
                    }}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
              {locationOpen && locations.length > 0 && (
                <ul
                  id="planner-cities"
                  role="listbox"
                  className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
                >
                  {locations.map((p, i) => (
                    <li
                      key={p.id ?? p.name}
                      id={`planner-city-${i}`}
                      role="option"
                      aria-selected={activeOption === i}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => choose(p)}
                      className={`cursor-pointer rounded-lg px-3 py-3 text-sm ${activeOption === i ? "bg-sky-50 text-sky-900" : "hover:bg-slate-50"}`}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-xs text-slate-500">
                  {place
                    ? `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}`
                    : c.anywhere}
                </span>
                <button
                  type="button"
                  disabled={locating}
                  onClick={locate}
                  className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-sky-800"
                >
                  <LocateFixed size={14} aria-hidden />
                  {locating ? c.locating : c.locate}
                </button>
              </div>
              {locationStatus && (
                <p role="status" className="mt-1 text-xs text-slate-500">
                  {locationStatus}
                </p>
              )}
            </div>
            <div
              className={
                place
                  ? "flex items-center justify-between gap-3 md:block"
                  : "hidden md:block"
              }
            >
              <label
                htmlFor="planner-radius"
                className="text-xs font-medium md:mb-2 md:block md:text-sm"
              >
                {c.radius}
              </label>
              <select
                id="planner-radius"
                disabled={!place}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className={`${fieldClass} w-28 md:w-full`}
              >
                {[...new Set([50, 100, 150, 250, 500, 1000, radius])]
                  .sort((a, b) => a - b)
                  .map((r) => (
                    <option value={r} key={r}>
                      {r} km
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5 sm:flex sm:flex-wrap">
            {(["today", "tomorrow", "weekend", "week"] as const).map(
              (preset) => {
                const [a, b] = quickDates(today, preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={startDate === a && endDate === b}
                    onClick={() => {
                      setStartDate(a);
                      setEndDate(b);
                      setDirty(true);
                    }}
                    className={`min-h-11 rounded-xl border px-1 text-[11px] font-medium transition focus-visible:outline-2 focus-visible:outline-sky-600 sm:px-3 sm:text-sm ${startDate === a && endDate === b ? "border-sky-700 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {c[preset]}
                  </button>
                );
              },
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="planner-start"
                className="mb-2 block text-sm font-medium"
              >
                {c.from}
              </label>
              <input
                id="planner-start"
                type="date"
                value={startDate}
                min={today}
                max={addDays(today, 90)}
                required
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                className={`${fieldClass} min-w-0`}
              />
            </div>
            <div>
              <label
                htmlFor="planner-end"
                className="mb-2 block text-sm font-medium"
              >
                {c.until}
              </label>
              <input
                id="planner-end"
                type="date"
                value={endDate}
                min={startDate || today}
                max={
                  startDate
                    ? [addDays(startDate, 13), addDays(today, 90)].sort()[0]
                    : addDays(today, 90)
                }
                required
                onChange={(e) => setEndDate(e.target.value)}
                className={`${fieldClass} min-w-0`}
              />
            </div>
          </div>
          {longRange && (
            <p className="mt-3 text-sm text-amber-800">{c.seasonalHint}</p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-xs text-slate-500 sm:block">
              {c.allFree}
            </p>
            <button
              type="submit"
              disabled={loading && !dirty}
              className={`${buttonClass} min-h-12 bg-sky-800 px-6 text-white hover:bg-sky-900 disabled:opacity-60`}
            >
              {loading && !dirty ? (
                <LoaderCircle size={18} className="animate-spin" aria-hidden />
              ) : (
                <Search size={18} aria-hidden />
              )}
              {loading && !dirty ? c.loading : c.search}
            </button>
          </div>
        </form>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            {error}
          </p>
        )}
        <div
          role="status"
          aria-live="polite"
          className="mt-4 text-sm text-slate-600"
        >
          {loading
            ? c.loading
            : response
              ? `${response.meta.candidates} ${c.evaluated} · ${response.meta.recommended} ${c.matches}${response.meta.failed ? ` · ${response.meta.failed} ${c.failed}` : ""}`
              : ""}
        </div>
        {response && (
          <section
            ref={resultsRef}
            aria-busy={loading}
            className="mt-6 scroll-mt-20"
          >
            {dirty && (
              <p
                role="status"
                className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
              >
                {c.changed}
              </p>
            )}
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
                  {response.mode === "seasonal" ? c.seasonal : c.shortlist}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {response.mode === "seasonal" ? c.seasonal : c.results}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {response.mode === "seasonal"
                    ? c.seasonalText
                    : c.resultIntro}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div
                  className="flex rounded-xl border border-slate-200 bg-white p-1"
                  role="group"
                  aria-label={`${c.list} / ${c.map}`}
                >
                  {(["list", "map"] as const).map((v) => (
                    <button
                      type="button"
                      disabled={v === "map" && !mapSpots.length}
                      aria-pressed={view === v}
                      onClick={() => setView(v)}
                      key={v}
                      className={`${buttonClass} px-3 ${view === v ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 disabled:opacity-40"}`}
                    >
                      {v === "list" ? (
                        <List size={16} aria-hidden />
                      ) : (
                        <Map size={16} aria-hidden />
                      )}
                      {c[v]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`${buttonClass} border border-slate-200 bg-white text-slate-600`}
                  aria-label={c.share}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      trackEvent("share", {
                        method: "clipboard",
                        content_type: "trip_plan",
                      });
                      setCopyStatus(c.copied);
                    } catch {
                      setCopyStatus(c.copyError);
                    }
                  }}
                >
                  <Copy size={16} aria-hidden />
                </button>
              </div>
            </div>
            {copyStatus && (
              <p role="status" className="mb-3 text-sm text-sky-800">
                {copyStatus}
              </p>
            )}
            {response.meta.candidates === 0 ? (
              <Empty title={c.noSpots} text={c.emptyText} />
            ) : response.mode === "forecast" &&
              !recommendations.length &&
              response.meta.available > 0 ? (
              <Empty title={c.noMatch} text={c.noMatchText} />
            ) : null}
            {view === "map" && mapSpots.length > 0 ? (
              <div className="space-y-4">
                <PlannerMap
                  spots={mapSpots}
                  onSelect={selectSpot}
                  label={c.select}
                  errorText={c.mapError}
                />
                <div ref={selectionRef}>
                  {selectedSpot && (
                    <ResultCard
                      spot={selectedSpot}
                      rank={mapSpots.indexOf(selectedSpot) + 1}
                      c={c}
                      locale={locale}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid items-start gap-4 lg:grid-cols-3">
                  {recommendations.map((spot, i) => (
                    <ResultCard
                      key={spot.id}
                      spot={spot}
                      rank={i + 1}
                      c={c}
                      locale={locale}
                    />
                  ))}
                </div>
                {others.length > 0 && (
                  <details
                    className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"
                    open={
                      response.mode === "seasonal" || !recommendations.length
                    }
                  >
                    <summary className="cursor-pointer text-sm font-semibold">
                      {c.otherSpots}{" "}
                      <span className="font-normal text-slate-400">
                        ({others.length})
                      </span>
                    </summary>
                    <div className="mt-4 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {others.slice(0, visible).map((spot) => (
                        <ResultCard
                          key={spot.id}
                          spot={spot}
                          c={c}
                          locale={locale}
                        />
                      ))}
                    </div>
                    {others.length > visible && (
                      <button
                        type="button"
                        onClick={() => setVisible((v) => v + 9)}
                        className={`${buttonClass} mt-4 w-full bg-slate-100 hover:bg-slate-200`}
                      >
                        {c.more}
                        <ChevronDown size={16} aria-hidden />
                      </button>
                    )}
                  </details>
                )}
              </>
            )}
            <p className="mt-5 text-xs leading-relaxed text-slate-500">
              {c.note}
            </p>
          </section>
        )}
        <details className="mt-8 rounded-2xl border border-slate-200/80 p-5 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-800">
            {c.method}
          </summary>
          <div className="mt-4 space-y-3 leading-relaxed">
            <p>{c.methodText}</p>
            <p>{c.methodKite}</p>
            <p>{c.ranking}</p>
            <p>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-800 underline"
              >
                Open-Meteo
              </a>{" "}
              ·{" "}
              <a
                href="https://www.geonames.org/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-800 underline"
              >
                {c.attribution}
              </a>
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
      <Compass className="mx-auto mb-3 text-sky-700" size={28} aria-hidden />
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{text}</p>
    </div>
  );
}
function windowLabel(
  window: PlannerWindow,
  timezone: string,
  locale: SiteLocale,
) {
  const day = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(window.start);
  const time = (value: number) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(value);
  return `${day} · ${time(window.start)}–${time(window.end)}`;
}
function ResultCard({
  spot,
  rank,
  c,
  locale,
}: {
  spot: PlannerResult;
  rank?: number;
  c: PlannerCopy;
  locale: SiteLocale;
}) {
  const w = spot.windows[0];
  const divisor = spot.sportType === "KITE" ? 1.852 : 1,
    unit = spot.sportType === "KITE" ? "kts" : "km/h";
  const speed = (value: number) => Math.round(value / divisor);
  const number = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const direction = w
    ? [
        ...new Set(
          w.directions.map(
            (d) =>
              ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
                Math.round(d / 45) % 8
              ],
          ),
        ),
      ].join(" / ")
    : "";
  return (
    <article
      className={`min-w-0 overflow-hidden rounded-3xl border bg-white ${rank ? "border-sky-200 shadow-sm" : "border-slate-200"}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {rank && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-semibold text-sky-800">
              {String(rank).padStart(2, "0")}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug">
              <Link
                href={`/spots/${spot.id}`}
                onClick={() =>
                  trackEvent("plan_result_open", {
                    spot_id: spot.id,
                    sport: spot.sportType.toLowerCase(),
                    score: w?.score,
                    interaction: "navigate",
                  })
                }
                className="hover:text-sky-800 hover:underline"
              >
                {spot.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {[spot.region, spot.country].filter(Boolean).join(" · ")}
              {spot.distanceKm !== null
                ? ` · ${Math.round(spot.distanceKm)} km`
                : ""}
            </p>
          </div>
        </div>
        {w && (
          <>
            <div className="mt-5 rounded-2xl bg-sky-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-950">
                <CalendarDays size={16} className="shrink-0" aria-hidden />
                {windowLabel(w, spot.timezone!, locale)}
              </p>
              <p className="mt-2 text-xs text-sky-800">
                {c.localTime} · {spot.timezone}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-sky-800">{c.wind}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-sky-950">
                    {speed(w.windMin)}–{speed(w.windMax)}{" "}
                    <span className="text-xs font-normal">{unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-sky-800">{c.gust}</p>
                  <p className="mt-1 text-xl font-semibold text-sky-950">
                    {speed(w.gustMax)}{" "}
                    <span className="text-xs font-normal">{unit}</span>
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-3 mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
              {c.why}
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-2">
                <Check
                  size={15}
                  className="mt-0.5 shrink-0 text-teal-700"
                  aria-hidden
                />
                <span>
                  {number(w.hours)} h {c.continuous}
                </span>
              </li>
              <li className="flex gap-2">
                <Compass
                  size={15}
                  className="mt-0.5 shrink-0 text-teal-700"
                  aria-hidden
                />
                <span>
                  {c.direction} : {direction}
                  <span className="mt-1 block text-xs text-slate-500">
                    {c.preferred} : {spot.bestWindDirections.join(", ")}
                  </span>
                </span>
              </li>
              <li className="flex gap-2">
                <Wind
                  size={15}
                  className="mt-0.5 shrink-0 text-teal-700"
                  aria-hidden
                />
                <span>{c.gustMatch}</span>
              </li>
            </ul>
            {spot.windows.length > 1 && (
              <details className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <summary className="min-h-8 cursor-pointer">
                  {c.otherWindows} ({spot.windows.length - 1})
                </summary>
                <ul className="space-y-2">
                  {spot.windows.slice(1).map((slot) => (
                    <li key={slot.start}>
                      {windowLabel(slot, spot.timezone!, locale)} ·{" "}
                      {number(slot.hours)} h
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              {c.index} {w.score}/100 · {c.source}{" "}
              {new Intl.DateTimeFormat(locale, {
                timeZone: spot.timezone,
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(spot.retrievedAt!))}
            </p>
          </>
        )}
        {!w && !spot.seasonal && (
          <div className="mt-4 text-sm text-slate-600">
            <p className="font-medium">
              {spot.unavailable ? c.unavailable : c.noWindow}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              {Object.entries(spot.reasons)
                .filter(([reason]) => reason !== "daylight")
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([reason]) => (
                  <li key={reason}>
                    {c.reasons[reason as keyof typeof c.reasons]}
                  </li>
                ))}
            </ul>
          </div>
        )}
        {spot.seasonal && (
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              {c.historicalWind} :{" "}
              <strong>
                {speed(spot.seasonal.wind)} {unit}
              </strong>
            </p>
            <p>
              {c.historicalGust} : {speed(spot.seasonal.gust)} {unit}
            </p>
            <p className="text-xs text-slate-400">
              {spot.seasonal.years.join("–")} · {spot.seasonal.days}{" "}
              {c.observations}
            </p>
          </div>
        )}
        {(spot.access || spot.hazards) && (
          <details className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
            <summary className="min-h-8 cursor-pointer font-medium">
              {c.access}
            </summary>
            {spot.access && (
              <p className="whitespace-pre-line">{spot.access}</p>
            )}
            {spot.hazards && (
              <p className="mt-2 whitespace-pre-line">
                <strong>{c.hazards} : </strong>
                {spot.hazards}
              </p>
            )}
          </details>
        )}
      </div>
      <Link
        href={`/spots/${spot.id}`}
        onClick={() =>
          trackEvent("plan_result_open", {
            spot_id: spot.id,
            sport: spot.sportType.toLowerCase(),
            score: w?.score,
            interaction: "navigate",
          })
        }
        className="flex min-h-12 items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-sm font-medium text-sky-800 hover:bg-sky-50"
      >
        {c.open}
        <ArrowRight size={16} className="shrink-0" aria-hidden />
      </Link>
    </article>
  );
}
