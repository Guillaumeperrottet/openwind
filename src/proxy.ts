import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Proxy Supabase SSR — rafraîchit la session à chaque requête.
 * Sans ce fichier, l'access token (1h) expire et le serveur voit
 * l'utilisateur comme déconnecté même si le refresh token est valide.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip intl for API routes, auth callbacks, and static assets
  const isIntlRoute =
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/_vercel") &&
    !/\.(.+)$/.test(pathname);

  // Run next-intl middleware first (handles locale detection + redirect)
  let intlResponse: NextResponse | null = null;
  if (isIntlRoute) {
    intlResponse = intlMiddleware(request) as NextResponse;
    // If intl issued a redirect, return early (no auth refresh needed)
    if (intlResponse.headers.get("location")) {
      return intlResponse;
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Rafraîchit la session si le token a expiré — NE PAS supprimer cet appel.
  await supabase.auth.getUser();

  // Propagate next-intl headers (especially x-next-intl-locale) so the root
  // layout can read the locale to set <html lang="...">.
  if (intlResponse) {
    intlResponse.headers.forEach((value, key) => {
      supabaseResponse.headers.set(key, value);
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
