import "server-only";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

/**
 * Authentication & authorization foundation.
 *
 * Target: Supabase Auth (email + password, magic link optional) with HTTP-only secure
 * cookies via @supabase/ssr, and role checks enforced server-side AND by Postgres
 * Row Level Security (see supabase/migrations). Paid content is never protected by
 * hidden URLs: every protected page/download calls requireCustomer()/canAccess().
 *
 * STATUS: Supabase NOT CONNECTED. In development, demo mode returns a clearly labeled
 * sample session so the dashboards can be designed and tested. Demo mode is forced
 * off in production (see isDemoMode), so production returns no session.
 */
export type Role = "customer" | "admin" | "owner";
export type Session = { userId: string; email: string; name: string; roles: Role[]; demo: boolean };

const demoSession: Session = { userId: "demo-user", email: "demo@example.com", name: "Demo", roles: ["customer", "admin"], demo: true };

export async function getSession(): Promise<Session | null> {
  if (isSupabaseConfigured()) {
    // TODO(supabase): read the session with createServerClient() from @supabase/ssr
    // and load roles from public.user_roles. Not implemented until the project exists.
    return null;
  }
  return isDemoMode() ? demoSession : null;
}

export function hasRole(session: Session | null, role: Role) {
  return !!session && (session.roles.includes(role) || session.roles.includes("owner"));
}

export function authStatus(): "connected" | "demo" | "not_connected" {
  if (isSupabaseConfigured()) return "connected";
  return isDemoMode() ? "demo" : "not_connected";
}
