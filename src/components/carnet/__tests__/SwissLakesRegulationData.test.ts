import { describe, expect, it } from "vitest";
import forbiddenZones from "@/components/carnet/swiss-lakes-forbidden.geojson.json";

describe("Swiss lakes regulation map data", () => {
  it("contains only fully forbidden lakes documented in the guide", () => {
    expect(
      forbiddenZones.features.map((feature) => feature.properties.lakeId),
    ).toEqual([
      "vernex",
      "greifensee",
      "pfaeffikersee",
      "tuerlersee",
      "lac-noir",
      "montsalvens",
      "lessoc",
      "lussy",
      "seedorf",
      "brenet",
      "bret",
      "hongrin",
    ]);
  });

  it("uses closed polygon rings with valid Swiss coordinates", () => {
    for (const feature of forbiddenZones.features) {
      expect(feature.geometry.type).toBe("Polygon");
      for (const ring of feature.geometry.coordinates) {
        expect(ring.length).toBeGreaterThan(3);
        expect(ring.at(-1)).toEqual(ring[0]);
        for (const [longitude, latitude] of ring) {
          expect(longitude).toBeGreaterThanOrEqual(5.9);
          expect(longitude).toBeLessThanOrEqual(10.6);
          expect(latitude).toBeGreaterThanOrEqual(45.7);
          expect(latitude).toBeLessThanOrEqual(47.9);
        }
      }
    }
  });
});
