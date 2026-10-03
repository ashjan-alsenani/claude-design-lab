"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { isDemoMode } from "@/lib/env";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { COOKIE, clientInfo, cookieOptions, currentContext, licensing, licensingMode, safeNext } from "@/lib/licensing/server";

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

export async function passwordSignInAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  if (licensingMode() === "unavailable") redirect(`/${locale}/account`);
  if (await ipLimited("password", 10)) redirect(withNext(`/${locale}/account?mode=password&e=rate_limited`, next));
  const r = await licensing().engine.passwordSignIn({ email: str(fd, "email", 254), password: str(fd, "password", 200), client: await clientInfo(), locale });
  if (r.ok) {
    await setSessionCookies(r.sessionToken, r.deviceToken);
    redirect(next ?? `/${locale}/account/products`);
  }
  if (r.reason === "device_verification_required" && r.challengeId) {
    await setChallenge(r.challengeId);
    redirect(withNext(`/${locale}/account/verify?device=new`, next));
  }
  redirect(withNext(`/${locale}/account?mode=password&e=${r.reason}`, next));
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
  redirect(next ?? `/${locale}/account/products`);
}

export async function resendCodeAction(fd: FormData) {
  const locale = localeOf(fd);
  const next = safeNext(str(fd, "next"), locale);
  const id = (await cookies()).get(COOKIE.challenge)?.value;
  if (!id) redirect(`/${locale}/account`);
  if (await ipLimited("code", 10)) redirect(withNext(`/${locale}/account/verify?e=too_many_attempts`, next));
  const r = await licensing().engine.resendVerification(id, locale);
  if (!r.ok) redirect(withNext(`/${locale}/account/verify?e=${r.reason === "rate_limited" ? "too_many_attempts" : "expired"}`, next));
  await setChallenge(r.challengeId);
  redirect(withNext(`/${locale}/account/verify?resent=1`, next));
}

export async function startClaimAction(fd: FormData) {
  const locale = localeOf(fd);
  if (await ipLimited("code", 10)) redirect(`/${locale}/account?e=rate_limited`);
  const r = await licensing().engine.startClaim(str(fd, "token", 200), locale);
  if (!r.ok) redirect(`/${locale}/claim?e=${r.reason}`);
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

export async function setPasswordAction(fd: FormData) {
  const locale = localeOf(fd);
  const ctx = await requireCtx(locale);
  const r = await licensing().engine.setPassword(ctx, { current: str(fd, "current", 200) || undefined, next: str(fd, "password", 300) });
  redirect(`/${locale}/account/security?${r.ok ? "ok=password" : "pe=" + r.reason}`);
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
