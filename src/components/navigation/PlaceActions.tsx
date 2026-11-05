"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { withoutLocale } from "@/lib/access";
import { useLocale } from "next-intl";
import { Camera, RadioTower, Thermometer, X } from "lucide-react";
import { PLACE_COPY, hasWater, placeFeatureHref, type PlaceFeature } from "@/lib/place";
import { selectPlace, useSelectedPlace } from "@/lib/place-store";
import { toSiteLocale } from "@/lib/site";
import { MAP_FOCUS_EVENT, MAP_FOCUS_STORAGE_KEY } from "@/lib/mapFocus";
import { usePublicFeatures } from "@/lib/public-features";

export function PlaceActions({ compact = false, onlySelected = false, id }: { compact?: boolean; onlySelected?: boolean; id?: string }) {
  const place = useSelectedPlace(), locale = toSiteLocale(useLocale()), c = PLACE_COPY[locale];
  const { water } = usePublicFeatures();
  const path = withoutLocale(usePathname());
  const active = path === "/webcams" ? "webcams" : path === "/temperatures" || path.startsWith("/lacs/") ? "water" : path.startsWith("/vent-en-direct/") ? "wind" : null;
  if (!place && onlySelected) return null;
  const icons = { wind: RadioTower, webcams: Camera, water: Thermometer };
  const detail = { wind: !place ? c.allWind : place.kind === "spot" ? c.spot : place.kind === "station" ? c.station : place.guideSlug ? c.lakeWind : c.around, webcams: place ? c.around : c.allWebcams, water: place ? hasWater(place) ? c.waterYes : c.waterNo : c.allWater };
  return <section id={id} className={`ow-place-actions${compact ? " ow-place-actions-compact" : ""}`} aria-label={c.conditions}>
    <div className="ow-place-heading">{place ? <div><span>{c.current}</span><strong>{place.name}</strong></div> : <h2>{c.conditions}</h2>}
      {place && <div className="ow-place-change"><Link href={`/${locale}/recherche`}>{c.change}</Link><button type="button" onClick={() => selectPlace(null)} aria-label={c.clear}><X size={16} aria-hidden /></button></div>}
    </div>
    <div className={`ow-place-shortcuts${water ? "" : " ow-place-shortcuts-pair"}`}>{(["wind", "webcams", ...(water ? ["water"] : [])] as PlaceFeature[]).map(feature => { const Icon = icons[feature]; return <Link key={feature} className={feature === "water" && place && !hasWater(place) ? "ow-place-shortcut-unavailable" : undefined} aria-label={`${c[feature]} — ${detail[feature]}`} aria-current={active === feature ? "page" : undefined} href={placeFeatureHref(feature, place, locale)} prefetch={false} onClick={() => {
      if (feature === "wind" && place?.kind === "area") {
        const focus = { lat: place.lat, lng: place.lng, zoom: 10 };
        try { sessionStorage.setItem(MAP_FOCUS_STORAGE_KEY, JSON.stringify(focus)); } catch { /* Event still works on the mounted map. */ }
        window.dispatchEvent(new CustomEvent(MAP_FOCUS_EVENT, { detail: focus }));
      }
    }}><Icon size={18} aria-hidden /><span><strong>{c[feature]}</strong><small>{detail[feature]}</small></span></Link>; })}</div>
  </section>;
}

export function WaterCoverageNotice() {
  const place = useSelectedPlace(), locale = toSiteLocale(useLocale());
  return place && !hasWater(place) ? <p className="ow-place-coverage" role="status">{PLACE_COPY[locale].unavailable}</p> : null;
}
