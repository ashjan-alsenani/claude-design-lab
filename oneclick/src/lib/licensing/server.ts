import "server-only";
import path from "node:path";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { products } from "@/content/products";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/seo";
import { SandboxProvider } from "@/lib/payments/sandbox";
import { createLicensingEngine, type ClientInfo, type LicensingEngine, type SessionContext } from "./engine";
import { FileLicensingStore, UnavailableLicensingStore, type LicensingStore } from "./store";

/**
 * Server wiring for the licensing engine (never imported by client components).
 *
 * Modes:
 * - "sandbox": local development / demo. Data in .data/licensing.json, emails go to the
 *   development mailbox, payments are simulated by the clearly labeled SandboxProvider.
 * - "unavailable": production until the database is connected. Fails closed: no sign-in,
 *   every protected product and download is denied.
 * (Next step: a Supabase-backed store implementing the same engine; see DATA_MODEL.md.)
 */
export type LicensingMode = "sandbox" | "unavailable";

export function licensingMode(): LicensingMode {
  if (isDemoMode()) return "sandbox";
  // TODO(supabase): return "database" once SupabaseLicensingStore is implemented.
  void isSupabaseConfigured;
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
  const store: LicensingStore = mode === "sandbox" ? new FileLicensingStore(path.join(process.cwd(), ".data", "licensing.json")) : new UnavailableLicensingStore();
  const s = mode === "sandbox" ? secret() : "unavailable";
  const engine = createLicensingEngine({
    store,
    products,
    secret: s,
    baseUrl: siteUrl,
    mail: async (to, content, meta) => {
      await sendEmail(to, content, { kind: meta.kind });
    },
    adminEmails: (process.env.ONECLICK_ADMIN_EMAILS ?? (mode === "sandbox" ? "owner@example.com" : "")).split(",").filter(Boolean),
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
