import "server-only";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { currentContext, licensingMode } from "./server";
import type { User } from "./types";
import { COUNTRIES } from "@/lib/profile";

/**
 * For customer pages: the signed-in context, or a redirect to sign in that returns here.
 * The profile is optional: an empty profile never blocks a page or a purchased product.
 */
export async function requireAccount(locale: Locale, here: string) {
  const ctx = await currentContext();
  if (!ctx) redirect(`/${locale}/account?next=${encodeURIComponent(`/${locale}${here}`)}`);
  return { ctx, sandbox: licensingMode() === "sandbox" };
}

/** Only the fields the profile form shows; never hashes or history. */
export function profileUser(u: User) {
  return { id: u.id, email: u.email, name: u.name, avatar: u.avatar, country: u.country, phone: u.phone, locale: u.locale, marketingOptIn: u.marketingOptIn };
}

export function formatDate(iso: string, locale: Locale, withTime = false) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-OM" : "en-GB", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(iso));
}

/** Country choices for the profile form, named in the page language. */
export function countryOptions(locale: Locale, otherLabel: string) {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([locale], { type: "region" });
  } catch {}
  return COUNTRIES.map((code) => ({ code, name: code === "OTHER" ? otherLabel : (names?.of(code) ?? code) }));
}
