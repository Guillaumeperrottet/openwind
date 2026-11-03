import { mapFocusRequestFromValue, type MapFocusRequest } from "@/lib/mapFocus";

export const MAP_SELECTION_STORAGE_KEY = "openwind-map-selection:v1";

/** Only restore a recent selection in this tab, with the original camera. */
export function mapSelectionFromStorage(raw: string | null, now = Date.now()): MapFocusRequest | null {
  if (!raw || raw.length > 2_000) return null;
  try {
    const saved = JSON.parse(raw);
    if (typeof saved.savedAt !== "number" || now < saved.savedAt || now - saved.savedAt > 2 * 60 * 60_000) return null;
    const request = mapFocusRequestFromValue(saved);
    if (!request?.id || request.id.length > 160 || !request.kind) return null;
    if (Math.abs(request.center[0]) > 180 || Math.abs(request.center[1]) > 90 || request.zoom < 0 || request.zoom > 24) return null;
    return request;
  } catch { return null; }
}

export function mapViewFromStorage(raw: string | null): { center: [number, number]; zoom: number; bearing: number; pitch: number } | null {
  if (!raw || raw.length > 2_000) return null;
  try {
    const view = JSON.parse(raw);
    if (!Array.isArray(view.center) || view.center.length !== 2 || !view.center.every(Number.isFinite) || Math.abs(view.center[0]) > 180 || Math.abs(view.center[1]) > 90 || !Number.isFinite(view.zoom) || view.zoom < 0 || view.zoom > 24) return null;
    return { center: view.center, zoom: view.zoom, bearing: Number.isFinite(view.bearing) ? view.bearing : 0, pitch: Number.isFinite(view.pitch) && view.pitch >= 0 && view.pitch <= 85 ? view.pitch : 0 };
  } catch { return null; }
}
