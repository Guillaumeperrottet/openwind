import { describe, expect, it } from "vitest";
import { stationSchema, stationSeo } from "@/lib/station-seo";

const station = {
  id: "piou-982",
  name: "Azur Flying Club 06",
  source: "pioupiou" as const,
  lat: 43.823176,
  lng: 7.182426,
};

describe("station search presentation", () => {
  it.each(["fr", "de", "it", "en"])(
    "identifies the actual station and network in %s",
    (locale) => {
      const copy = stationSeo(station, locale);
      expect(copy.title).toContain(station.name);
      expect(copy.title).toContain("Pioupiou");
      expect(copy.description).toContain("Pioupiou");
      expect(copy.description).not.toContain(station.id);
      expect(copy.lead).toContain(station.name);
      const schema = stationSchema(station, locale);
      expect(schema["@graph"][0]).toMatchObject({
        "@type": "WebPage",
        inLanguage: locale,
        url: `https://www.openwind.ch/${locale}/stations/piou-982`,
        about: { geo: { latitude: station.lat, longitude: station.lng } },
      });
      expect(
        schema["@graph"][1].itemListElement?.map((item) => item.position),
      ).toEqual([1, 2, 3]);
      expect(JSON.stringify(schema)).not.toMatch(
        /windSpeed|dateModified|rating|Dataset/,
      );
    },
  );

  it("keeps names editable and escapes source IDs in canonical and breadcrumb URLs", () => {
    const renamed = {
      ...station,
      id: "ntm:70:ee",
      name: "Nouveau nom",
      source: "netatmo" as const,
    };
    expect(stationSeo(renamed, "fr").title).toContain("Nouveau nom");
    expect(stationSeo(renamed, "fr").description).toContain("Netatmo");
    expect(stationSchema(renamed, "fr")["@graph"][0].url).toMatch(
      /\/ntm%3A70%3Aee$/,
    );
  });
});
