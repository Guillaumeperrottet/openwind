import "server-only";
import { prisma } from "./prisma";
import { getStationCatalog } from "./station-catalog";
import { getLocalGuide, LOCAL_GUIDES, isGuideLocale } from "./local-guides";
import { parsePlaceRef, validPlace, type Place } from "./place";
import type { SiteLocale } from "./site";

/** Public identity and coordinates only. Never load reports, users or measurements. */
export async function resolvePlace(ref: string, locale: SiteLocale, areaName?: string): Promise<Place | null> {
  const parsed = parsePlaceRef(ref);
  if (!parsed) return null;
  const { kind, id } = parsed;
  if (kind === "lake") {
    const g = getLocalGuide(id);
    if (!g) return null;
    const language = isGuideLocale(locale) ? locale : "fr";
    return { kind, id, name: (g.translations[language] ?? g.translations.fr).place, ...g.coordinates, guideSlug: g.slug };
  }
  if (kind === "area") {
    const [lat, lng] = id.split(",").map(Number);
    const guide = LOCAL_GUIDES.find(g => Math.abs(g.coordinates.lat - lat) < 0.00001 && Math.abs(g.coordinates.lng - lng) < 0.00001);
    if (guide) return resolvePlace(`lake:${guide.slug}`, locale);
    return { kind, id, name: areaName?.trim().slice(0, 150) || `${lat.toFixed(3)}, ${lng.toFixed(3)}`, lat, lng };
  }
  let p: Place | null = null;
  if (kind === "spot") {
    const spot = await prisma.spot.findUnique({ where: { id }, select: { id: true, name: true, latitude: true, longitude: true } });
    if (spot) p = { kind, id, name: spot.name, lat: spot.latitude, lng: spot.longitude, guideSlug: LOCAL_GUIDES.find(g => g.spotIds.includes(id))?.slug };
  } else {
    const station = (await getStationCatalog()).find(s => s.id === id);
    if (station) p = { kind, id, name: station.name, lat: station.lat, lng: station.lng, guideSlug: LOCAL_GUIDES.find(g => g.stations.some(s => s.id === id))?.slug };
  }
  return validPlace(p) ? p : null;
}
