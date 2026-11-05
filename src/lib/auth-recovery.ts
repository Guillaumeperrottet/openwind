/** Only a recovery event proves that the current link authorizes a password change. */
export type RecoveryAuth = {
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => { data: { subscription: { unsubscribe(): void } } };
  getSession: () => Promise<{ error: unknown }>;
};
export function watchPasswordRecovery(auth: RecoveryAuth, href: string, update: (state: "ready" | "invalid") => void) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const hasLink = !!url.searchParams.get("code") || (hash.get("type") === "recovery" && !!hash.get("access_token") && !!hash.get("refresh_token"));
  let active = true;
  let unsubscribe: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const finish = (state: "ready" | "invalid") => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    // SDK callbacks can run while its session lock is held.
    queueMicrotask(() => { unsubscribe?.(); update(state); });
  };
  if (!hasLink || url.searchParams.has("error") || hash.has("error")) {
    queueMicrotask(() => finish("invalid"));
  } else {
    const { data } = auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) finish("ready");
      else if (event === "SIGNED_OUT") finish("invalid");
    });
    unsubscribe = () => data.subscription.unsubscribe();
    timer = setTimeout(() => finish("invalid"), 12_000);
    void auth.getSession().then(({ error }) => { if (error) finish("invalid"); }).catch(() => finish("invalid"));
  }
  return () => { active = false; clearTimeout(timer); unsubscribe?.(); };
}
