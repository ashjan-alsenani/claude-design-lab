import "server-only";

/** Demo mode shows sample dashboards. It can never be enabled in production. */
export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.ONECLICK_DEMO_MODE !== "false";
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isEmailConfigured() {
  return Boolean(process.env.EMAIL_PROVIDER && process.env.EMAIL_PROVIDER !== "none");
}
