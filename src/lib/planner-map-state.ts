import type { PlannerCriteria } from "./planner";
export interface PlannerCamera {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}
export function plannerMapScope(c?: PlannerCriteria): string {
  return c?.lat === undefined ? "catalogue" : `${c.lat}:${c.lng}:${c.radius}`;
}
export function parseCamera(value: string | null): PlannerCamera | null {
  try {
    const c = JSON.parse(value || "null");
    if (
      !c ||
      !Array.isArray(c.center) ||
      c.center.length !== 2 ||
      !c.center.every(Number.isFinite) ||
      Math.abs(c.center[0]) > 180 ||
      Math.abs(c.center[1]) > 85.051129 ||
      !Number.isFinite(c.zoom) ||
      c.zoom < 0 ||
      c.zoom > 24 ||
      !Number.isFinite(c.bearing) ||
      Math.abs(c.bearing) > 360 ||
      !Number.isFinite(c.pitch) ||
      c.pitch < 0 ||
      c.pitch > 85
    )
      return null;
    return {
      center: c.center,
      zoom: c.zoom,
      bearing: c.bearing,
      pitch: c.pitch,
    };
  } catch {
    return null;
  }
}
const key = "openwind:planner-camera:v1:";
export function readCamera(storage: Pick<Storage, "getItem">, scope: string) {
  try {
    return parseCamera(storage.getItem(key + scope));
  } catch {
    return null;
  }
}
export function saveCamera(
  storage: Pick<Storage, "setItem">,
  scope: string,
  camera: PlannerCamera,
) {
  try {
    storage.setItem(key + scope, JSON.stringify(camera));
  } catch {
    /* Private browsing / full storage: the list remains usable. */
  }
}
