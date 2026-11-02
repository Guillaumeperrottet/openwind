import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { SpotContributionGate } from "@/components/spot/SpotContributionGate";

const session = vi.hoisted(() => ({ user: null as null | { id: string }, authLoading: false }));
vi.mock("@/lib/FavContext", () => ({ useFavContext: () => ({ ...session, requestAuth: vi.fn(), requestSignup: vi.fn() }) }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/i18n/navigation", () => ({ Link: (props: ComponentProps<"a">) => <a {...props} /> }));

describe("account required before creating a spot", () => {
  it("offers signup and login without rendering the contribution form for a guest", () => {
    session.user = null;
    session.authLoading = false;
    const html = renderToStaticMarkup(<SpotContributionGate><form id="spot-form" /></SpotContributionGate>);
    expect(html).toContain("signup");
    expect(html).toContain("login");
    expect(html).not.toContain("spot-form");
  });
  it("shows the form once an account is signed in", () => {
    session.user = { id: "member" };
    session.authLoading = false;
    expect(renderToStaticMarkup(<SpotContributionGate><form id="spot-form" /></SpotContributionGate>)).toContain("spot-form");
  });
  it("waits for the session check without flashing the form", () => {
    session.user = null;
    session.authLoading = true;
    const html = renderToStaticMarkup(<SpotContributionGate><form id="spot-form" /></SpotContributionGate>);
    expect(html).toContain('role="status"');
    expect(html).not.toContain("spot-form");
  });
});
