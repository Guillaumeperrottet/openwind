import { describe, expect, it } from "vitest";
import {
  parseCamera,
  plannerMapScope,
  readCamera,
  saveCamera,
} from "@/lib/planner-map-state";
const camera = {
  center: [7.2, 46.7] as [number, number],
  zoom: 12.75,
  bearing: 20,
  pitch: 15,
};
describe("planner camera persistence", () => {
  it("restores exact camera per geographic scope across list remounts and date changes", () => {
    const store = new Map<string, string>(),
      storage = {
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        getItem: (k: string) => store.get(k) ?? null,
      };
    const criteria = {
      lat: 46,
      lng: 7,
      radius: 150,
      sport: "KITE" as const,
      startDate: "2026-10-24",
      endDate: "2026-10-24",
    };
    const scope = plannerMapScope(criteria);
    saveCamera(storage, scope, camera);
    expect(
      readCamera(
        storage,
        plannerMapScope({ ...criteria, startDate: "2026-10-25" }),
      ),
    ).toEqual(camera);
    expect(
      readCamera(storage, plannerMapScope({ ...criteria, radius: 300 })),
    ).toBeNull();
    expect(
      readCamera(storage, plannerMapScope({ ...criteria, lat: 47 })),
    ).toBeNull();
  });
  it("rejects corrupt or unbounded storage and tolerates unavailable sessionStorage", () => {
    for (const value of [
      "bad",
      "{}",
      JSON.stringify({ ...camera, zoom: 50 }),
      JSON.stringify({ ...camera, center: [0, 90] }),
      JSON.stringify({ ...camera, pitch: -1 }),
    ])
      expect(parseCamera(value)).toBeNull();
    const storage = {
      getItem: () => {
        throw Error();
      },
      setItem: () => {
        throw Error();
      },
    };
    expect(readCamera(storage, "catalogue")).toBeNull();
    expect(() => saveCamera(storage, "catalogue", camera)).not.toThrow();
  });
});
