import type { Metadata } from "next";
import { toSiteLocale } from "@/lib/site";
import { RECOVERY_COPY } from "@/lib/auth-recovery-copy";
import { ResetPasswordClient } from "./ResetPasswordClient";
type Props = { searchParams: Promise<{ locale?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = toSiteLocale((await searchParams).locale ?? "fr");
  return { title: `${RECOVERY_COPY[locale].title} — Openwind`, robots: { index: false, follow: false } };
}
export default async function ResetPasswordPage({ searchParams }: Props) {
  return <ResetPasswordClient locale={toSiteLocale((await searchParams).locale ?? "fr")} />;
}
