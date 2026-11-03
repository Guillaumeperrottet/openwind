import { describe, expect, it } from "vitest";
import { isSnowkiteSpot, spotActivityLabel } from "../spot-activity";

describe("public spot discipline", () => {
  it.each(["Le Niremont", "Grimselpass", "La Brevine", "Le Brassus - Vallee de Joux", "France - col du lautaret (snowkite)"])("identifies the snowkite catalogue and explicit imported names: %s", (name) => {
    expect(isSnowkiteSpot({ name, sportType: "KITE" })).toBe(true);
    expect(spotActivityLabel({ name, sportType: "KITE" }, "fr")).toBe("Snowkite");
  });
  it.each(["Morlon", "Saint-Blaise", "Silvaplana", "Lac des Rousses", "Snow Beach"])("keeps water spots in Kitesurf: %s", (name) => {
    expect(isSnowkiteSpot({ name, sportType: "KITE" })).toBe(false);
    expect(spotActivityLabel({ name, sportType: "KITE" }, "fr")).toBe("Kitesurf");
  });
  it("does not reclassify a paragliding spot sharing a snowkite location", () => {
    expect(isSnowkiteSpot({ name: "Le Salève", sportType: "PARAGLIDE" })).toBe(false);
    expect(spotActivityLabel({ name: "Le Salève", sportType: "PARAGLIDE" }, "de")).toBe("Gleitschirmfliegen");
  });
});
