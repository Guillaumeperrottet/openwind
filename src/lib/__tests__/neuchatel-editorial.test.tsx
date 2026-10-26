import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SpotEditorial } from "@/components/spot/SpotEditorial";
import {
  editorialDisplayCopy,
  editorialImportAction,
  neuchatelSeoPatches,
} from "@/lib/neuchatel-seo-import";
import { getSpotEditorial, spotEditorialModified } from "@/lib/spot-editorials";
import { spotFingerprint } from "@/lib/planner-spot-fingerprint";
import { qualifyReview } from "@/lib/planner-review";
import { checkedSwissProfiles } from "@/lib/swiss-planner-profile-import";
import { getLocalGuide } from "@/lib/local-guides";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ locale, ...props }: ComponentProps<"a"> & { locale?: string }) => (
    <a {...props} href={`/${locale ?? "fr"}${props.href}`} />
  ),
}));

const patch = neuchatelSeoPatches[0];
const legacy = {
  id: patch.id,
  name: patch.expectedName,
  ...patch.expected,
  latitude: 46.953,
  longitude: 7.016,
  sportType: "KITE",
  waterType: "CHOP",
  minWindKmh: 18,
  maxWindKmh: 45,
  bestMonths: [
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
  ],
  access:
    "Parking au port de Cudrefin, respecter les zones de réserve naturelle.",
  hazards: null,
};

describe("sourced Neuchâtel editorial content", () => {
  it.each(["fr", "de", "it"])(
    "serves the three distinct %s spot texts, sources and internal links in initial HTML",
    (locale) => {
      const ids = [
        patch.id,
        "cmnr31n570007ijf6q33aez75",
        "cmnr307uv0000ijf6j8zqjyis",
      ];
      for (const id of ids) {
        const editorial = getSpotEditorial(id, locale)!;
        const html = renderToStaticMarkup(
          <SpotEditorial id={id} locale={locale} />,
        );
        expect(html).toContain(editorial.translation.intro);
        expect(html).not.toMatch(
          /<h1[ >]|hidden=|Drachenplatz|Sito di aquiloni/,
        );
        for (const section of editorial.translation.sections)
          expect(html).toContain(section.title);
        for (const source of editorial.sources)
          expect(html).toContain(
            `href="${source.url.replaceAll("&", "&amp;")}"`,
          );
        for (const peer of ids.filter((candidate) => candidate !== id))
          expect(html).toContain(`href="/${locale}/spots/${peer}"`);
        expect(html).toContain(
          `href="/${locale}/vent-en-direct/lac-de-neuchatel"`,
        );
        expect(html).toContain('dateTime="2026-10-26"');
      }
    },
  );

  it("does not pretend the new editorial has an English translation or alter an unrelated page", () => {
    expect(getSpotEditorial(patch.id, "en")).toBeNull();
    expect(getSpotEditorial("unknown", "fr")).toBeNull();
    const original = new Date("2026-10-22");
    expect(spotEditorialModified("unknown", "fr", original)).toBe(original);
    expect(spotEditorialModified(patch.id, "en", original)).toEqual(
      new Date("2026-10-26"),
    );
    const adminEdit = new Date("2026-10-27");
    expect(spotEditorialModified(patch.id, "de", adminEdit)).toBe(adminEdit);
  });

  it("updates legacy Cudrefin copy and difficulty without approving the spot or mutating stored data", () => {
    expect(spotFingerprint(legacy)).toBe(patch.expectedFingerprint);
    const display = editorialDisplayCopy(legacy);
    expect(display).toMatchObject(patch.changes);
    expect(legacy.difficulty).toBe("INTERMEDIATE");
    expect(display.difficulty).toBe("EXPERT");
    expect(display.bestWindDirections).toEqual(["SW", "NE"]);
    const staleApproval = {
      ...checkedSwissProfiles()[0].review,
      fingerprint: spotFingerprint(legacy),
    };
    expect(
      qualifyReview(
        staleApproval,
        spotFingerprint(display),
        "KITE",
        "2026-10-26",
        "2026-10-26",
        "2026-10-26",
        "fr",
      ),
    ).toMatchObject({ status: "CHANGED", eligible: false });
    const qualification = qualifyReview(
      null,
      spotFingerprint(display),
      "KITE",
      "2026-10-26",
      "2026-10-26",
      "2026-10-26",
      "fr",
    );
    expect(qualification).toMatchObject({ eligible: false, status: "MISSING" });
  });

  it("preserves the qualified Saint-Blaise and Estavayer profiles exactly", () => {
    for (const p of checkedSwissProfiles().filter((entry) =>
      ["cmnr31n570007ijf6q33aez75", "cmnr307uv0000ijf6j8zqjyis"].includes(
        entry.spot.id,
      ),
    )) {
      expect(editorialDisplayCopy(p.spot)).toBe(p.spot);
      expect(
        qualifyReview(
          p.review,
          spotFingerprint(p.spot),
          "KITE",
          "2026-10-26",
          "2026-10-26",
          "2026-10-26",
          "fr",
        ).eligible,
      ).toBe(true);
    }
  });

  it("keeps administrative edits authoritative and rejects a conflicting import", () => {
    const edited = {
      ...legacy,
      descriptionDe: "Von der lokalen Redaktion geänderter Text.",
    };
    expect(editorialDisplayCopy(edited)).toBe(edited);
    expect(() => editorialImportAction(edited, patch, false)).toThrow(
      "edited since research",
    );
    expect(() =>
      editorialImportAction({ ...legacy, latitude: 47 }, patch, false),
    ).toThrow("edited since research");
    expect(() => editorialImportAction(legacy, patch, true)).toThrow(
      "Reconcile planner review",
    );
  });

  it("allows the reviewed import once and recognises already imported data", () => {
    expect(editorialImportAction(legacy, patch, false)).toBe("update");
    const imported = { ...legacy, ...patch.changes };
    expect(editorialImportAction(imported, patch, true)).toBe("current");
    expect(editorialDisplayCopy(imported)).toBe(imported);
    expect(Object.keys(patch.changes).sort()).toEqual([
      "bestWindDirections",
      "description",
      "descriptionDe",
      "descriptionIt",
      "difficulty",
    ]);
  });

  it("aligns every displayed Morat name and the forecast point with Pantschau", () => {
    const guide = getLocalGuide("lac-de-morat")!;
    const profile = checkedSwissProfiles().find(
      (p) => p.spot.id === guide.spotIds[0],
    )!;
    expect(guide.coordinates).toEqual({
      lat: profile.spot.latitude,
      lng: profile.spot.longitude,
    });
    expect(guide.forecastPlace).toContain("Pantschau");
    for (const lang of ["fr", "de", "it"] as const) {
      const t = guide.translations[lang]!;
      expect(t.title).toContain("Pantschau");
      expect(JSON.stringify(t)).not.toContain("Murtenstrand");
      expect(t.content).toContain(`/${lang}/spots/${profile.spot.id}`);
      expect(t.content).toContain("15");
    }
    expect(
      guide.sources.some(
        (source) => source.url === "https://www.bisenoire.ch/kitespot/",
      ),
    ).toBe(true);
  });
});
