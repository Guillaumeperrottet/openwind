"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { withoutLocale, safeReturnPath } from "@/lib/access";
import { parsePlaceRef, placeRouteRef, placeRef, validPlace } from "@/lib/place";
import { selectPlace, selectedPlace } from "@/lib/place-store";
import { toSiteLocale } from "@/lib/site";

export function PlaceObserver() {
  const pathname = usePathname(), params = useSearchParams(), locale = toSiteLocale(useLocale());
  const query = params.toString();
  useEffect(() => {
    const q = new URLSearchParams(query), path = withoutLocale(pathname);
    const actual = placeRouteRef(pathname), explicit = q.get("place");
    let ref = actual?.startsWith("spot:") || actual?.startsWith("station:") ? actual : parsePlaceRef(explicit) ? explicit : actual;
    const prior = selectedPlace();
    if (actual?.startsWith("lake:") && !explicit && prior?.guideSlug === actual.slice(5)) ref = placeRef(prior);
    if (!ref && path === "/webcams" && q.has("lat") && q.has("lng")) {
      const lat = Number(q.get("lat")), lng = Number(q.get("lng")), previous = selectedPlace();
      if (previous && Math.abs(previous.lat - lat) < 0.00001 && Math.abs(previous.lng - lng) < 0.00001) return;
      const back = safeReturnPath(q.get("back"), locale);
      ref = back ? placeRouteRef(new URL(back, "https://www.openwind.ch").pathname) : null;
      ref ??= `area:${q.get("lat")},${q.get("lng")}`;
    }
    if (!ref || !parsePlaceRef(ref)) return;
    let cancelled = false;
    const controller = new AbortController();
    const load = async (reference: string) => {
      try {
        const response = await fetch(`/api/place?${new URLSearchParams({ ref: reference, locale, name: q.get("placeName") || q.get("name") || "" })}`, { signal: controller.signal });
        const data = await response.json();
        if (cancelled) return;
        // A shared link cannot apply a different lake's context to this guide.
        if (response.ok && validPlace(data.place) && actual?.startsWith("lake:") && data.place.guideSlug !== actual.slice(5) && reference !== actual) return load(actual);
        selectPlace(response.ok && validPlace(data.place) ? data.place : null);
      } catch { if (!cancelled) selectPlace(null); }
    };
    void load(ref);
    return () => { cancelled = true; controller.abort(); };
  }, [pathname, query, locale]);
  return null;
}
