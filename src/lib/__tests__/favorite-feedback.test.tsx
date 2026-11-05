import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ path: "/fr/explorer" }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/i18n/navigation", () => ({ usePathname: () => mocks.path, Link: (props: Record<string, unknown>) => createElement("a", props) }));
vi.mock("@/lib/FavContext", () => ({ useFavContext: () => ({ user: null, requestSignup: vi.fn(), retryFavorites: vi.fn() }) }));
import { FavoriteFeedback } from "@/components/account/FavoriteFeedback";
const render = (notice: "savedLocally" | "storageError", preferencesError = false) => renderToStaticMarkup(<FavoriteFeedback notice={notice} preferencesError={preferencesError} onDismiss={vi.fn()} onRetryPreferences={vi.fn()} />);
beforeEach(() => { mocks.path = "/mon-openwind"; });
describe("favorite feedback during navigation", () => {
  it("does not cover the dashboard after a successful local save", () => expect(render("savedLocally")).toBe(""));
  it("retains errors and recovery actions on the dashboard", () => {
    expect(render("storageError")).toContain("storageError");
    const html = render("savedLocally", true);
    expect(html).toContain("preferencesError"); expect(html).toContain("retry"); expect(html).not.toContain("seeFavorites");
  });
  it("offers a shortcut to the dashboard before leaving the current page", () => {
    mocks.path = "/spots/morlon"; expect(render("savedLocally")).toContain('href="/mon-openwind"');
  });
});
