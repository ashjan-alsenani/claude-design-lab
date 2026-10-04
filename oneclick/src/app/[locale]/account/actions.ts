"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { isDemoMode } from "@/lib/env";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { COOKIE, clientInfo, cookieOptions, currentContext, licensing, licensingMode, safeNext } from "@/lib/licensing/server";
import { deleteAvatarPhoto, saveAvatarPhoto } from "@/lib/licensing/avatar";

/**
 * Account, verification and device actions. Every action re-reads the session from the
 * HttpOnly cookie on the server; nothing from the form is trusted for identity.
 * Errors travel as short codes in the URL (never emails, codes or tokens).
 */
const str = (fd: FormData, k: string, max = 300) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.slice(0, max) : "";
};

function localeOf(fd: FormData): Locale {
  const l = str(fd, "locale", 5);
  return isLocale(l) ? l : "en";
}

async function ipLimited(bucket: string, limit: number) {
  const h = await headers();
  return !rateLimit(`${bucket}:${clientKey(h)}`, isDemoMode() ? limit * 20 : limit, 10 * 60 * 1000).ok;
}

const withNext = (path: string, next: string | null) => (next ? `${path}${path.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}` : path);

/** First sign-in goes through /account/welcome (name, picture, details), then on to where they were heading. */
async function afterSignIn(userId: string, locale: Locale, next: string | null) {
  const dest = next ?? `/${locale}/account/products`;
  return (await licensing().engine.profileComplete(userId)) ? dest : `/${locale}/account/welcome?next=${encodeURIComponent(dest)}`;
}

async function setChallenge(id: string) {
  (await cookies()).set(COOKIE.challenge, id, cookieOptions(15 * 60));
}

export async function requestCodeAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  if (licensingMode() === "unavailable") redirect(`/${locale}/account`);
  if (await ipLimited("code", 10)) redirect(withNext(`/${locale}/account?e=rate_limited`, next));
  const r = await licensing().engine.startVerification({ email: str(fd, "email", 254), purpose: "signin", locale });
  if (!r.ok) redirect(withNext(`/${locale}/account?e=${r.reason}`, next));
  await setChallenge(r.challengeId);
  redirect(withNext(`/${locale}/account/verify`, next));
}

async function setSessionCookies(sessionToken: string, deviceToken: string) {
  const c = await cookies();
  const days = (await licensing().engine.policy()).sessionDays;
  c.set(COOKIE.session, sessionToken, cookieOptions(days * 24 * 3600));
  c.set(COOKIE.device, deviceToken, cookieOptions(400 * 24 * 3600));
  c.delete(COOKIE.challenge);
}

export async function verifyCodeAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  const c = await cookies();
  const challengeId = c.get(COOKIE.challenge)?.value;
  if (!challengeId) redirect(`/${locale}/account?e=expired`);
  if (await ipLimited("verify", 30)) redirect(withNext(`/${locale}/account/verify?e=too_many_attempts`, next));
  const r = await licensing().engine.completeVerification({
    challengeId,
    code: str(fd, "code", 20),
    client: await clientInfo(),
    locale,
    sessionToken: c.get(COOKIE.session)?.value,
  });
  if (r.kind === "failed") redirect(withNext(`/${locale}/account/verify?e=${r.reason}`, next));
  if (r.kind === "email_changed") {
    c.delete(COOKIE.challenge);
    redirect(`/${locale}/account/security?ok=email`);
  }
  await setSessionCookies(r.sessionToken, r.deviceToken);
  if (r.deviceState === "pending") redirect(withNext(`/${locale}/account/devices?authorize=1`, next));
  redirect(await afterSignIn(r.userId, locale, next));
}

export async function resendCodeAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  const id = (await cookies()).get(COOKIE.challenge)?.value;
  if (!id) redirect(`/${locale}/account`);
  if (await ipLimited("code", 10)) redirect(withNext(`/${locale}/account/verify?e=too_many_attempts`, next));
  const r = await licensing().engine.resendVerification(id, locale);
  if (!r.ok) redirect(withNext(`/${locale}/account/verify?e=${r.reason === "rate_limited" ? "too_many_attempts" : r.reason === "email_failed" ? "email_failed" : "expired"}`, next));
  await setChallenge(r.challengeId);
  redirect(withNext(`/${locale}/account/verify?resent=1`, next));
}

export async function startClaimAction(fd: FormData) {
  const locale = localeOf(fd);
  const token = str(fd, "token", 200);
  // Keep the token on temporary failures so the page can still show the order and let them retry.
  const back = (reason: string) => `/${locale}/claim?t=${encodeURIComponent(token)}&e=${reason}`;
  if (await ipLimited("code", 10)) redirect(back("rate_limited"));
  const r = await licensing().engine.startClaim(token, locale);
  if (!r.ok) redirect(r.reason === "rate_limited" || r.reason === "email_failed" ? back(r.reason) : `/${locale}/claim?e=${r.reason}`);
  await setChallenge(r.challengeId);
  redirect(`/${locale}/account/verify`);
}

export async function signOutAction(fd: FormData) {
  const locale = localeOf(fd);
  const c = await cookies();
  await licensing().engine.signOut(c.get(COOKIE.session)?.value);
  c.delete(COOKIE.session);
  redirect(`/${locale}/account`);
}

async function requireCtx(locale: Locale) {
  const ctx = await currentContext();
  if (!ctx) redirect(`/${locale}/account`);
  return ctx;
}

export async function signOutEverywhereAction(fd: FormData) {
  const locale = localeOf(fd);
  const ctx = await requireCtx(locale);
  const keep = str(fd, "keep") === "1";
  await licensing().engine.signOutEverywhere(ctx, keep);
  if (!keep) {
    await licensing().engine.signOut((await cookies()).get(COOKIE.session)?.value);
    (await cookies()).delete(COOKIE.session);
    redirect(`/${locale}/account`);
  }
  redirect(`/${locale}/account/devices?ok=signed_out`);
}

export async function removeDeviceAction(fd: FormData) {
  const locale = localeOf(fd);
  const ctx = await requireCtx(locale);
  const r = await licensing().engine.removeDevice(ctx, str(fd, "deviceId", 80));
  redirect(`/${locale}/account/devices?${r.ok ? "ok=removed" : "e=" + r.reason}`);
}

export async function authorizeDeviceAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  const ctx = await requireCtx(locale);
  const r = await licensing().engine.authorizePendingDevice(ctx, str(fd, "removeDeviceId", 80) || null);
  if (!r.ok) redirect(withNext(`/${locale}/account/devices?authorize=1&e=${r.reason}`, next));
  redirect(next ?? `/${locale}/account/devices?ok=authorized`);
}

export async function requestEmailChangeAction(fd: FormData) {
  const locale = localeOf(fd);
  const ctx = await requireCtx(locale);
  if (await ipLimited("code", 10)) redirect(`/${locale}/account/security?ee=rate_limited`);
  const r = await licensing().engine.requestEmailChange(ctx, str(fd, "email", 254), locale);
  if (!r.ok) redirect(`/${locale}/account/security?ee=${r.reason}`);
  await setChallenge(r.challengeId);
  redirect(`/${locale}/account/verify?purpose=email`);
}

export async function downloadAction(fd: FormData) {
  const locale = localeOf(fd);
  const ctx = await requireCtx(locale);
  const r = await licensing().engine.createDownloadLink(ctx, str(fd, "productId", 60), str(fd, "fileId", 60));
  if (!r.ok) redirect(`/${locale}/account/products?e=${r.reason}`);
  redirect(r.url);
}

/**
 * Saves the profile from /account/welcome (first sign-in) and /account/profile.
 * A new photo is checked and stored first; choosing a color instead removes any old photo.
 */
export async function saveProfileAction(fd: FormData) {
  const locale = localeOf(fd);
  const from = str(fd, "from", 10) === "welcome" ? "welcome" : "profile";
  const next = safeNext(str(fd, "next"), locale);
  const ctx = await requireCtx(locale);
  const back = (e: string) => withNext(`/${locale}/account/${from}?e=${e}`, next);
  if (await ipLimited("profile", 30)) redirect(back("generic"));

  const photo = fd.get("photo");
  const choice = str(fd, "avatar", 20); // "photo" keeps/sets a photo, otherwise a color name
  const hasNewPhoto = photo instanceof File && photo.size > 0;
  if (hasNewPhoto) {
    const saved = await saveAvatarPhoto(ctx.user.id, photo);
    if (!saved.ok) redirect(back(saved.reason));
  }
  const keepPhoto = hasNewPhoto || (choice === "photo" && ctx.user.avatar?.kind === "photo");
  const r = await licensing().engine.updateProfile(ctx, {
    name: str(fd, "name", 200),
    country: str(fd, "country", 10),
    phone: str(fd, "phone", 40),
    locale: str(fd, "lang", 5) === "ar" ? "ar" : "en",
    marketingOptIn: fd.get("marketing") === "on",
    avatarColor: keepPhoto ? undefined : choice,
  });
  if (!r.ok) redirect(back(r.reason));
  if (hasNewPhoto) await licensing().engine.setAvatarPhoto(ctx);
  else if (!keepPhoto && ctx.user.avatar?.kind === "photo") await deleteAvatarPhoto(ctx.user.id);
  redirect(from === "welcome" ? (next ?? `/${locale}/account/products`) : `/${locale}/account/profile?ok=1`);
}
