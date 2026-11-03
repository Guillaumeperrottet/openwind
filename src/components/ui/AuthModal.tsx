"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, Mail, Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { authErrorMessage } from "@/lib/auth-errors";
import { toSiteLocale } from "@/lib/site";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const t = useTranslations("AuthModal");
  const locale = toSiteLocale(useLocale());
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (signupDone || resetSent) dialogRef.current?.querySelector<HTMLElement>("h2")?.focus();
    else dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [mode, signupDone, resetSent, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`;
        const { error: authError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (authError) setError(authErrorMessage(authError, locale));
        else { trackEvent("sign_up", { method: "email" }); setSignupDone(true); }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) setError(authErrorMessage(authError, locale));
        else {
          trackEvent("login", { method: "email" });
          fetch("/api/auth/sync", { method: "POST" }).catch(() => {});
          onClose();
        }
      }
    } catch (error) { setError(authErrorMessage(error, locale)); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { error: authError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (authError) setError(authErrorMessage(authError, locale));
      else setResetSent(true);
    } catch (error) { setError(authErrorMessage(error, locale)); }
    finally { setLoading(false); }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true); setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`;
      trackEvent("auth_oauth_started", { method: provider });
      const { error: authError } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (authError) setError(authErrorMessage(authError, locale));
    } catch (error) { setError(authErrorMessage(error, locale)); }
    finally { setLoading(false); }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="ow-auth"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]')];
        const first = controls[0], last = controls.at(-1);
        if (e.shiftKey && (document.activeElement === first || !e.currentTarget.contains(document.activeElement))) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (e.target === e.currentTarget && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) onClose();
      }}
    >
      <div className="relative w-full bg-white rounded-2xl p-6">
        <button
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id={titleId} tabIndex={-1} className="pr-8 text-lg font-bold text-gray-900 mb-1">
          {mode === "login"
            ? t("loginTitle")
            : mode === "signup"
              ? t("signupTitle")
              : t("forgotTitle")}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {mode === "login"
            ? t("loginSubtitle")
            : mode === "signup"
              ? t("signupSubtitle")
              : t("forgotSubtitle")}
        </p>

        {resetSent ? (
          <div role="status" className="text-center py-4">
            <Mail className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <p className="text-sm text-gray-700 font-medium">
              {t("resetSentTitle")}{" "}
              <span className="text-sky-600">{email}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{t("resetSentBody")}</p>
          </div>
        ) : signupDone ? (
          <div role="status" className="text-center py-4">
            <Mail className="h-8 w-8 text-sky-500 mx-auto mb-2" />
            <p className="text-sm text-gray-700 font-medium">
              {t("signupDoneTitle")}{" "}
              <span className="text-sky-600">{email}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{t("signupDoneBody")}</p>
          </div>
        ) : mode === "forgot" ? (
          <>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <label htmlFor={emailId} className="block text-sm font-medium text-slate-700">{t("emailLabel")}</label>
              <input
                id={emailId}
                name="email"
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
              {error && <p id={errorId} role="alert" className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 min-h-11 w-full rounded-lg bg-sky-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                {t("sendLink")}
              </button>
            </form>
            <p className="text-xs text-center text-gray-500 mt-4">
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="inline-flex min-h-11 items-center text-sky-600 hover:underline font-medium"
              >
                {t("backToLogin")}
              </button>
            </p>
          </>
        ) : (
          <>
            {/* OAuth buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                disabled={loading}
                onClick={() => handleOAuth("google")}
                className="flex items-center justify-center gap-2 min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("loginWithGoogle")}
              </button>
              <button
                disabled={loading}
                onClick={() => handleOAuth("github")}
                className="flex items-center justify-center gap-2 min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t("loginWithGitHub")}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{t("orSeparator")}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email + Password form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor={emailId} className="block text-sm font-medium text-slate-700">{t("emailLabel")}</label>
              <input
                id={emailId}
                name="email"
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
              <label htmlFor={passwordId} className="block text-sm font-medium text-slate-700">{t("passwordLabel")}</label>
              <div className="relative">
                <input
                  id={passwordId}
                  name="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-14 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={t(showPassword ? "hidePassword" : "showPassword")}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && <p id={errorId} role="alert" className="text-sm text-red-700">{error}</p>}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                  }}
                  className="min-h-11 text-sm text-sky-700 hover:underline"
                >
                  {t("forgotLink")}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 min-h-11 w-full rounded-lg bg-sky-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                {mode === "login" ? t("loginButton") : t("signupButton")}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
              {mode === "login" ? (
                <>
                  {t("switchToSignupPrompt")}{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                    className="inline-flex min-h-11 items-center text-sky-600 hover:underline font-medium"
                  >
                    {t("switchToSignupAction")}
                  </button>
                </>
              ) : (
                <>
                  {t("switchToLoginPrompt")}{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="inline-flex min-h-11 items-center text-sky-600 hover:underline font-medium"
                  >
                    {t("switchToLoginAction")}
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </dialog>
  );
}
