"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth-errors";
import { watchPasswordRecovery } from "@/lib/auth-recovery";
import { RECOVERY_COPY } from "@/lib/auth-recovery-copy";
import type { SiteLocale } from "@/lib/site";
import { DocumentLanguage } from "@/components/ui/DocumentLanguage";

export function ResetPasswordClient({ locale }: { locale: SiteLocale }) {
  const c = RECOVERY_COPY[locale];
  const [state, setState] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    const stop = watchPasswordRecovery(createClient().auth, window.location.href, (next) => {
      if (!mounted) return;
      setState(next);
      // Remove exchanged or failed credentials from the address bar and history.
      window.history.replaceState(window.history.state, "", `/auth/reset-password?locale=${locale}`);
    });
    return () => { mounted = false; stop(); };
  }, [locale]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state === "ready" && password !== confirm) { setError(c.mismatch); return; }
    setBusy(true); setError("");
    try {
      if (state === "invalid") {
        const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password?locale=${locale}` });
        if (error) setError(authErrorMessage(error, locale)); else setSent(true);
      } else if (state === "ready") {
        const { error } = await createClient().auth.updateUser({ password });
        if (error) {
          setError(authErrorMessage(error, locale));
          if (["session_expired", "session_not_found", "otp_expired", "reauthentication_needed"].includes(error.code ?? "")) setState("invalid");
        } else { setPassword(""); setConfirm(""); setState("done"); }
      }
    } catch (error) { setError(authErrorMessage(error, locale)); }
    finally { setBusy(false); }
  }
  const field = "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-slate-500";
  return <><DocumentLanguage locale={locale} /><main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
    <section aria-labelledby="reset-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <Link href={`/${locale}?view=map`} className="mb-8 inline-flex min-h-11 items-center text-sm font-semibold tracking-wide">Openwind</Link>
      {state === "done" && <CheckCircle aria-hidden className="mb-3 h-9 w-9 text-emerald-700" />}
      <h1 id="reset-title" className="text-2xl font-semibold tracking-tight">{state === "done" ? c.done : c.title}</h1>
      <p role="status" className="mt-3 text-sm leading-6 text-slate-600">{state === "checking" ? c.checking : state === "invalid" ? c.invalid : state === "done" ? c.doneText : c.intro}</p>
      {(state === "ready" || state === "invalid") && <form onSubmit={submit} className="mt-6 space-y-4">
        {state === "invalid" ? sent ? <><p role="status" className="text-sm leading-6 text-slate-600">{c.sent}</p><button type="button" className="min-h-11 text-sm underline underline-offset-4" onClick={() => setSent(false)}>{c.retry}</button></> : <label className="block text-sm font-medium">{c.email}<input className={`${field} mt-2`} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} /></label> : <>
          <label className="block text-sm font-medium">{c.password}<input className={`${field} mt-2`} type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={busy} /></label>
          <label className="block text-sm font-medium">{c.confirm}<input className={`${field} mt-2`} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} disabled={busy} /></label>
          <button type="button" aria-pressed={show} className="flex min-h-11 items-center gap-2 text-sm" onClick={() => setShow(v => !v)}>{show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}{show ? c.hide : c.show}</button>
        </>}
        {error && <p role="alert" className="text-sm leading-6 text-red-700">{error}</p>}
        {!(state === "invalid" && sent) && <button disabled={busy} className="min-h-12 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{busy ? c.waiting : state === "invalid" ? c.renew : c.save}</button>}
      </form>}
      <Link href={`/${locale}/mon-openwind`} className="mt-6 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">{c.back}</Link>
    </section>
  </main></>;
}
