import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authReturnPath } from "@/lib/auth-return";

/**
 * GET /auth/callback
 * Exchanges the auth code for a session after magic link or OAuth redirect.
 * Supabase sends the user here with ?code=... in the URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = authReturnPath(searchParams.get("next"), origin);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Sync user to Prisma DB
        try {
          await fetch(`${origin}/api/auth/sync`, {
            method: "POST",
            headers: { cookie: request.headers.get("cookie") ?? "" },
            signal: AbortSignal.timeout(8000),
          });
        } catch {
          // Non-blocking
        }
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch { /* Return to a safe page with a recoverable sign-in message. */ }
  }

  const destination = new URL(next, origin);
  destination.searchParams.set("auth_error", "1");
  return NextResponse.redirect(destination);
}
