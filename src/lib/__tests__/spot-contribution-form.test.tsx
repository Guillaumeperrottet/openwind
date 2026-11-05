import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../messages/fr.json";
import { writeFileSync } from "node:fs";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("next/dynamic", () => ({ default: () => () => createElement("div", { className: "h-full flex items-center justify-center text-slate-500" }, "Carte du spot — aperçu statique") }));
vi.mock("next-intl", () => ({ useTranslations: (namespace: keyof typeof messages) => (key: string, values: Record<string, unknown> = {}) => {
  const text = key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? Reflect.get(value, part) : undefined, messages[namespace]) ?? key;
  return typeof text === "string" ? text.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match)) : key;
} }));
vi.mock("@/lib/useWindUnits", () => ({ useWindUnits: () => ({ useKnots: true, setUseKnots: vi.fn() }) }));
vi.mock("@/components/spot/useSpotImages", () => ({ useSpotImages: () => ({ images: [], imagePreviews: [], existingImages: [], deletedImageIds: [], handleImageChange: vi.fn(), removeNewImage: vi.fn(), removeExistingImage: vi.fn() }) }));
vi.mock("@/components/spot/useNearbyStations", () => ({ useNearbyStations: () => ({ nearbyStations: [], loadingStations: false, refresh: vi.fn() }) }));
import { CreateSpotForm } from "@/components/spot/CreateSpotForm";
describe("complete creation form", () => {
  it("explains the required information and provides a source field for each review topic", () => {
    const html = renderToStaticMarkup(<CreateSpotForm />);
    for (const topic of ["discipline", "directions", "season", "access"]) expect(html).toContain(`name="sources.${topic}"`);
    expect(html).toContain('value="CONDITIONAL"'); expect(html).toContain('value="SNOW_KITE"');
    expect(html).toContain("vérifiées par Openwind");
    expect(html).toContain("Juin"); expect(html).toContain("Juillet");
    expect(html).not.toContain("modifiables par tous");
    if (process.env.SPOT_FORM_PREVIEW) writeFileSync(process.env.SPOT_FORM_PREVIEW, '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex,nofollow"><title>Openwind — formulaire complet, aperçu statique</title><!--OPENWIND_CSS--><body><p style="font:14px/1.5 system-ui;margin:0;padding:14px 24px;background:#edf3f7;color:#334155">Aperçu statique du formulaire. La création réelle reste réservée aux comptes connectés sur Openwind.</p>'+html+'</body></html>');
  });
});
