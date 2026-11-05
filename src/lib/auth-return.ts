/** Only relative application paths can be used after authentication. */
export function authReturnPath(value: unknown, origin: string): string {
  if (typeof value !== "string" || value.length > 3000 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/";
  try {
    const base = new URL(origin), target = new URL(value, base);
    if (target.origin !== base.origin || target.username || target.password || /%2f|%5c/i.test(target.pathname)) return "/";
    if (/^\/(?:api|_next|_vercel|auth\/callback)(?:\/|$)/.test(target.pathname)) return "/";
    return target.pathname + target.search + target.hash;
  } catch { return "/"; }
}
