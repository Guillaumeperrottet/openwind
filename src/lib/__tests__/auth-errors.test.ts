import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/auth-errors";

describe("actionable authentication errors", () => {
  it.each([
    ["invalid_credentials", "mot de passe est incorrect"],
    ["email_not_confirmed", "Confirmez votre adresse"],
    ["email_address_invalid", "Vérifiez votre adresse"],
    ["weak_password", "trop faible"],
    ["user_already_exists", "compte existe déjà"],
    ["over_email_send_rate_limit", "Trop de tentatives"],
    ["provider_disabled", "méthode de connexion est indisponible"],
    ["otp_expired", "a expiré"],
    ["same_password", "différent du précédent"],
  ])("gives a recovery action for %s", (code, fragment) => {
    expect(authErrorMessage({ code, message: "Raw server details" }, "fr")).toContain(fragment);
  });
  it("handles rate limits even without a recognized provider code", () => {
    expect(authErrorMessage({ status: 429 })).toContain("Trop de tentatives");
  });
  it("retains compatibility with older login responses", () => {
    expect(authErrorMessage({ message: "Invalid login credentials" })).toBe(authErrorMessage({ code: "invalid_credentials" }));
  });
  it.each(["fr", "en", "de", "it"] as const)("localizes all errors and never displays arbitrary provider details in %s", locale => {
    const raw = "Internal failure: account person@example.com, token=private";
    for (const code of ["invalid_credentials", "email_not_confirmed", "weak_password", "provider_disabled", "over_request_rate_limit", "future_error", "toString"]) {
      const message = authErrorMessage({ code, message: raw }, locale);
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(20);
      expect(message).not.toContain(raw);
      expect(message).not.toContain("person@example.com");
    }
    expect(authErrorMessage(new TypeError("Failed to fetch"), locale)).toBe(authErrorMessage(null, locale));
  });
  it("uses the chosen language rather than the provider language", () => {
    expect(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" }, "de")).toContain("E-Mail-Adresse");
    expect(authErrorMessage({ code: "email_not_confirmed" }, "it")).toContain("Conferma");
    expect(authErrorMessage({ code: "session_expired" }, "en")).toContain("expired");
  });
  it.each([undefined, null, "server error", 500, {}, { code: ["invalid_credentials"] }])("handles unexpected failure %j", error => {
    expect(authErrorMessage(error)).toBe(authErrorMessage(null));
  });
});
