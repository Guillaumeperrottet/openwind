"use client";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { contextualHref, placeFeatureHref, type PlaceFeature } from "@/lib/place";
import { useSelectedPlace } from "@/lib/place-store";
import { toSiteLocale } from "@/lib/site";

export function ContextDestination({ href, feature, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string; feature?: PlaceFeature }) {
  const place = useSelectedPlace(), locale = toSiteLocale(useLocale());
  return <Link {...props} href={place && feature ? placeFeatureHref(feature, place, locale) : contextualHref(href, place, locale)} />;
}
