import "server-only";
import { currentContext, licensingMode } from "@/lib/licensing/server";
import type { Role } from "@/lib/licensing/types";

/**
 * Authentication & authorization.
 *
 * Accounts, sessions and devices are handled by the licensing & access engine
 * (src/lib/licensing): email verification codes, optional password for returning
 * customers, HttpOnly session cookies, trusted devices. Every protected page and
 * download is authorized server-side through canUserAccessProduct.
 *
 * STATUS: database NOT CONNECTED. Locally the engine runs in SANDBOX mode with
 * fictional data; in production it fails closed (nobody can sign in) until Supabase
 * is connected.
 */
export type { Role };
export type Session = { userId: string; sessionId: string; email: string; name: string; roles: Role[]; demo: boolean; deviceState: "trusted" | "pending" };

export async function getSession(): Promise<Session | null> {
  const ctx = await currentContext();
  if (!ctx) return null;
  return {
    userId: ctx.user.id,
    sessionId: ctx.session.id,
    email: ctx.user.email,
    name: ctx.user.name ?? ctx.user.email.split("@")[0],
    roles: ctx.roles,
    demo: licensingMode() === "sandbox",
    deviceState: ctx.session.deviceState,
  };
}

export function hasRole(session: Session | null, role: Role) {
  return !!session && (session.roles.includes(role) || session.roles.includes("owner"));
}

export function authStatus(): "connected" | "demo" | "not_connected" {
  const mode = licensingMode();
  return mode === "database" ? "connected" : mode === "sandbox" ? "demo" : "not_connected";
}
