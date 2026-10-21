import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getLocalGuide, isGuideLocale } from "@/lib/local-guides";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Proxy Supabase SSR — rafraîchit la session à chaque requête.
 * Sans ce fichier, l'access token (1h) expire et le serveur voit
 * l'utilisateur comme déconnecté même si le refresh token est valide.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guideRoute = pathname.match(/^\/(fr|en|de|it)\/vent-en-direct(?:\/([^/]+))?\/?$/);
  if (guideRoute) {
    const [, locale, slug] = guideRoute;
    const guide = slug ? getLocalGuide(slug) : undefined;
    // Redirect before rendering starts, so unavailable translations return an
    // actual HTTP 308 rather than a streamed 200 with a client-side redirect.
    if ((!slug || guide) && (!isGuideLocale(locale) || (guide && !guide.translations[locale]))) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/fr/vent-en-direct${slug ? `/${slug}` : ""}`;
      return NextResponse.redirect(destination, 308);
    }
  }
  const frenchOnlyContent = pathname.match(
    /^\/(fr|en|de|it)(\/carnet(?:\/[^/]+)?)\/?$/,
  );
  const isFrenchOnlyContent = Boolean(frenchOnlyContent);

  if (frenchOnlyContent && frenchOnlyContent[1] !== "fr") {
    return NextResponse.redirect(
      new URL(`/fr${frenchOnlyContent[2]}`, request.url),
      308,
    );
  }

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
      // These routes declare their actual language availability in metadata.
      if ((isFrenchOnlyContent || /^\/(fr|en|de|it)\/vent-en-direct(?:\/|$)/.test(pathname)) && key === "link") return;
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
