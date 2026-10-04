import "server-only";

/** Demo mode shows sample dashboards. It can never be enabled in production. */
export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.ONECLICK_DEMO_MODE !== "false";
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Server-side database access: project URL plus the service role key (never sent to the browser). */
export function supabaseServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function isLicensingSecretSet() {
  return (process.env.LICENSING_SECRET ?? "").length >= 32;
}

/** Transactional email: Resend, with an API key and a verified sender address. */
export function isEmailConfigured() {
  return process.env.EMAIL_PROVIDER === "resend" && Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
