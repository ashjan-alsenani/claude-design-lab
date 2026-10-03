import "server-only";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { currentContext, licensingMode } from "./server";

/** For customer pages: the signed-in context, or a redirect to sign in that returns here. */
export async function requireAccount(locale: Locale, here: string) {
  const ctx = await currentContext();
  if (!ctx) redirect(`/${locale}/account?next=${encodeURIComponent(`/${locale}${here}`)}`);
  return { ctx, sandbox: licensingMode() === "sandbox" };
}

export function formatDate(iso: string, locale: Locale, withTime = false) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-OM" : "en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(iso));
}
