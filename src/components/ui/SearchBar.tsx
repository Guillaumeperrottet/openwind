"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  GlobalSearch,
  type GlobalSearchProps,
} from "@/components/search/GlobalSearch";

/** Shared search; retains the existing menu shortcut and favourite suggestions. */
export function SearchBar(props: GlobalSearchProps) {
  const params = useSearchParams();
  const requested = params.get("openSearch") === "1";
  useEffect(() => {
    if (!requested) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("openSearch");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [requested]);
  return <GlobalSearch {...props} autoFocus={props.autoFocus || requested} />;
}
