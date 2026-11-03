"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Map, Compass, Route, LayoutDashboard, Plus, User, LogOut, Star, Search, X, Mail, Info, Shield } from "lucide-react";
import { useFavContext } from "@/lib/FavContext";
import { SearchBar } from "./SearchBar";
import { PRIMARY_NAVIGATION, NAVIGATION_COPY, navigationSection } from "@/lib/navigation";
import { toSiteLocale } from "@/lib/site";

const ICONS = { map: Map, explore: Compass, plan: Route, personal: LayoutDashboard };

export function Navbar() {
  const t = useTranslations("Navbar");
  const params = useParams();
  const currentLocale = toSiteLocale((params?.locale as string) ?? "fr");
  const copy = NAVIGATION_COPY[currentLocale];
  const pathname = usePathname();
  const query = useSearchParams();
  const { user, favoriteSpotIds, favoriteStationIds, preferences, requestAuth, signOut } = useFavContext();
  const favoriteCount = favoriteSpotIds.size + favoriteStationIds.size;
  const activeSection = navigationSection(pathname, query.get("view"), preferences);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [adminRole, setAdminRole] = useState<{ userId: string; allowed: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const isAdmin = Boolean(user && adminRole?.userId === user.id && adminRole.allowed);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { isAdmin?: boolean }) => { if (!cancelled) setAdminRole({ userId: user.id, allowed: Boolean(data.isAdmin) }); })
      .catch(() => { if (!cancelled) setAdminRole({ userId: user.id, allowed: false }); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!menuOpen && !mobileSearch) return;
    const outside = (event: PointerEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
      if (mobileSearch) { setMobileSearch(false); searchButton.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [menuOpen, mobileSearch]);

  const closePanels = () => { setMenuOpen(false); setMobileSearch(false); };
  const label = (key: (typeof PRIMARY_NAVIGATION)[number]["label"]) => key === "explore" ? copy.explore : t(key);

  return <>
    <header className="ow-site-header">
      <Link href="/?view=map" className="ow-site-logo" onClick={closePanels} prefetch={false} aria-label="Openwind">
        <Image src="/logo_noback.png" alt="" width={90} height={26} className="ow-site-logo-image" priority />
      </Link>
      <div className="ow-site-search"><Suspense fallback={null}><SearchBar favoriteSpotIds={favoriteSpotIds} favoriteStationIds={favoriteStationIds} /></Suspense></div>
      <nav className="ow-primary-navigation" aria-label={copy.primary}>
        {PRIMARY_NAVIGATION.map(item => {
          const Icon = ICONS[item.id];
          return <Link key={item.id} href={item.href} prefetch={false} onClick={closePanels} aria-current={activeSection === item.id ? "page" : undefined}><Icon aria-hidden size={18} /><span>{label(item.label)}</span></Link>;
        })}
      </nav>
      <div className="ow-site-utilities">
        <button ref={searchButton} type="button" className="ow-mobile-search-toggle" onClick={() => { setMenuOpen(false); setMobileSearch(v => !v); }} aria-label={t("searchAriaLabel")} aria-expanded={mobileSearch} aria-controls="openwind-mobile-search"><Search aria-hidden size={19} /></button>
        <LanguageSwitcher currentLocale={currentLocale} />
        <div ref={menuRef} className="ow-account">
          <button ref={menuButton} type="button" className="ow-account-trigger" onClick={() => { setMobileSearch(false); setMenuOpen(v => !v); }} aria-label={copy.account} aria-expanded={menuOpen} aria-controls="openwind-account-menu">
            {user?.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt="" width={28} height={28} />
            ) : <User aria-hidden size={19} />}
          </button>
          {menuOpen && <div id="openwind-account-menu" className="ow-account-panel">
            {user ? <>
              <div className="ow-account-identity"><p>{user.user_metadata?.full_name ?? user.email}</p><span>{user.email}</span></div>
              <Link href="/mon-openwind" onClick={closePanels}><LayoutDashboard aria-hidden size={17} />{t("myOpenwind")}</Link>
              <Link href="/?view=map&openSearch=1" onClick={() => { setMenuOpen(false); setMobileSearch(window.matchMedia("(max-width: 1023px)").matches); }}><Star aria-hidden size={17} />{t("favorites", { count: favoriteCount })}</Link>
            </> : <button type="button" onClick={() => { closePanels(); requestAuth(); }}><User aria-hidden size={17} />{t("signIn")}</button>}
            <div className="ow-account-divider" />
            <Link href="/spots/new" prefetch={false} onClick={closePanels}><Plus aria-hidden size={17} />{t("addSpot")}</Link>
            <Link href="/about" onClick={closePanels}><Info aria-hidden size={17} />{t("about")}</Link>
            {isAdmin && <Link href="/admin" onClick={closePanels}><Shield aria-hidden size={17} />{t("admin")}</Link>}
            {user && <button type="button" onClick={() => { closePanels(); signOut(); }}><LogOut aria-hidden size={17} />{t("signOut")}</button>}
            <a href="mailto:hello@openwind.ch"><Mail aria-hidden size={17} />hello@openwind.ch</a>
          </div>}
        </div>
      </div>
    </header>
    <nav className="ow-bottom-navigation" aria-label={copy.primary}>
      {PRIMARY_NAVIGATION.map(item => {
        const Icon = ICONS[item.id];
        return <Link key={item.id} href={item.href} prefetch={false} onClick={closePanels} aria-current={activeSection === item.id ? "page" : undefined}>
          <span className="ow-bottom-icon"><Icon aria-hidden size={20} />{item.id === "personal" && favoriteCount > 0 && <span className="ow-favorite-count">{favoriteCount}</span>}</span><span className="ow-bottom-label">{label(item.label)}</span>
        </Link>;
      })}
    </nav>
    {mobileSearch && <div id="openwind-mobile-search" className="ow-mobile-search-panel">
      <div><Suspense fallback={null}><SearchBar favoriteSpotIds={favoriteSpotIds} favoriteStationIds={favoriteStationIds} autoFocus onNavigate={closePanels} /></Suspense></div>
      <button type="button" onClick={() => { setMobileSearch(false); searchButton.current?.focus(); }} aria-label={copy.closeSearch}><X aria-hidden size={19} /></button>
    </div>}
  </>;
}
