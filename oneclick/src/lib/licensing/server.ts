import "server-only";
import path from "node:path";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { products } from "@/content/products";
import { isDemoMode, isLicensingSecretSet, supabaseServerConfig } from "@/lib/env";
import { createRest } from "@/lib/supabase/rest";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/seo";
import { SandboxProvider } from "@/lib/payments/sandbox";
import { signPayload, verifySignedPayload } from "./crypto";
import { createLicensingEngine, type ClientInfo, type LicensingEngine, type SessionContext } from "./engine";
import { FileLicensingStore, SupabaseLicensingStore, UnavailableLicensingStore, type LicensingStore } from "./store";

/**
 * Server wiring for the licensing engine (never imported by client components).
 *
 * Modes:
 * - "sandbox": local development / demo. Data in .data/licensing.json, emails go to the
 *   development mailbox, payments are simulated by the clearly labeled SandboxProvider.
 * - "database": production. Supabase Postgres via the service role (server only). Needs
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and LICENSING_SECRET.
 * - "unavailable": any of those missing. Fails closed: no sign-in, every protected product and
 *   download is denied.
 */
export type LicensingMode = "sandbox" | "database" | "unavailable";

export function licensingMode(): LicensingMode {
  if (isDemoMode()) return "sandbox";
  if (supabaseServerConfig() && isLicensingSecretSet()) return "database";
  return "unavailable";
}

export const COOKIE = { session: "oc_session", device: "oc_device", challenge: "oc_challenge" } as const;

function secret() {
  const s = process.env.LICENSING_SECRET;
  if (s && s.length >= 32) return s;
  if (licensingMode() === "sandbox") return "sandbox-only-secret-not-for-production-use";
  throw new Error("LICENSING_SECRET (32+ characters) is required outside the sandbox.");
}

const g = globalThis as unknown as { __ocLicensing?: { engine: LicensingEngine; sandboxProvider: SandboxProvider | null; store: LicensingStore } };

function build() {
  const mode = licensingMode();
  const db = supabaseServerConfig();
  const store: LicensingStore =
    mode === "sandbox" ? new FileLicensingStore(path.join(process.cwd(), ".data", "licensing.json")) : mode === "database" && db ? new SupabaseLicensingStore(createRest(db)) : new UnavailableLicensingStore();
  const s = mode === "unavailable" ? "unavailable" : secret();
  const engine = createLicensingEngine({
    store,
    products,
    secret: s,
    baseUrl: siteUrl,
    mail: async (to, content, meta) => sendEmail(to, content, { kind: meta.kind }),
    adminEmails: (process.env.ONECLICK_ADMIN_EMAILS ?? "").split(",").map((x) => x.trim()).filter(Boolean),
    // The owner's real address lives only in the environment (Vercel settings), never in the code.
    ownerEmails: (process.env.ONECLICK_OWNER_EMAILS ?? (mode === "sandbox" ? "owner@example.com" : "")).split(",").map((x) => x.trim()).filter(Boolean),
  });
  return { engine, store, sandboxProvider: mode === "sandbox" ? new SandboxProvider(s) : null };
}

export function licensing() {
  g.__ocLicensing ??= build();
  return g.__ocLicensing;
}

export const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});

export async function clientInfo(): Promise<ClientInfo> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return { userAgent: h.get("user-agent"), deviceToken: c.get(COOKIE.device)?.value ?? null };
}

/** Current signed-in context, resolved from the HttpOnly session cookie (once per request). */
export const currentContext = cache(async (): Promise<SessionContext | null> => {
  if (licensingMode() === "unavailable") return null;
  const token = (await cookies()).get(COOKIE.session)?.value;
  return licensing().engine.getSessionContext(token);
});

/** Only same-site, same-locale relative paths are accepted as a post-sign-in destination. */
export function safeNext(next: unknown, locale: string) {
  if (typeof next !== "string") return null;
  return next.startsWith(`/${locale}/`) && !next.startsWith("//") && !next.includes("\\") && !/[\r\n]/.test(next) ? next : null;
}

/** Short-lived values the server hands to the browser and must get back untampered (e.g. sign-in state). */
export function sealValue(payload: Record<string, string | number>) {
  return signPayload(secret(), payload);
}
export function unsealValue<T>(token: string | undefined | null): T | null {
  return token ? verifySignedPayload<T>(secret(), token) : null;
}

/** Finishes any sign-in: session + device cookies, then the welcome form on first sign-in. */
export async function startSession(r: { userId: string; sessionToken: string; deviceToken: string }, locale: string, next: string | null) {
  const c = await cookies();
  const days = (await licensing().engine.policy()).sessionDays;
  c.set(COOKIE.session, r.sessionToken, cookieOptions(days * 24 * 3600));
  c.set(COOKIE.device, r.deviceToken, cookieOptions(400 * 24 * 3600));
  c.delete(COOKIE.challenge);
  const dest = next ?? `/${locale}/account/products`;
  return (await licensing().engine.profileComplete(r.userId)) ? dest : `/${locale}/account/welcome?next=${encodeURIComponent(dest)}`;
}
