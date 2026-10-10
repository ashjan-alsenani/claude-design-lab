/**
 * Pre-deploy check: runs before `next build`. On a Vercel PRODUCTION build it stops the deploy
 * when a setting the live site needs is missing, or when Resend rejects the API key, so a version
 * that cannot send sign-in codes never replaces a working one. Preview and local builds only warn.
 *
 * Output names settings, never values. The Resend check posts an empty message: Resend answers
 * 401/403 for a bad key and a validation error for a good one, so nothing is ever sent.
 * Emergency bypass (e.g. Resend itself is down and a fix must ship): SKIP_ENV_CHECK=1.
 */

export function checkEnv(env) {
  const errors = [];
  const warnings = [];
  if (env.EMAIL_PROVIDER !== "resend") errors.push("EMAIL_PROVIDER must be \"resend\"");
  if (!env.RESEND_API_KEY) errors.push("RESEND_API_KEY is missing");
  else if (!env.RESEND_API_KEY.startsWith("re_")) errors.push("RESEND_API_KEY does not look like a Resend key (re_…)");
  if (!/^.+@[^@\s>]+\.[^@\s>]+>?$/.test(env.EMAIL_FROM ?? "")) errors.push("EMAIL_FROM is missing or has no sender address");
  if (!(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL)) errors.push("SUPABASE_URL is missing");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) errors.push("SUPABASE_SERVICE_ROLE_KEY is missing");
  if ((env.LICENSING_SECRET ?? "").length < 32) errors.push("LICENSING_SECRET is missing or shorter than 32 characters");
  if (!env.OPS_ALERT_URL) warnings.push("OPS_ALERT_URL is not set: email failures will be logged but not pushed to the owner");
  else if (!env.OPS_ALERT_URL.startsWith("https://")) errors.push("OPS_ALERT_URL must start with https://");
  return { errors, warnings };
}

export async function checkResendKey(env, fetchImpl = fetch) {
  const base = (env.RESEND_API_URL || "https://api.resend.com").replace(/\/+$/, "");
  try {
    const res = await fetchImpl(`${base}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 401 || res.status === 403) return { error: `Resend rejected RESEND_API_KEY (HTTP ${res.status}): create a new key in Resend and update it in Vercel` };
    return {};
  } catch {
    return { warning: "Could not reach Resend to verify RESEND_API_KEY (network); continuing" };
  }
}

async function main() {
  const env = process.env;
  const production = env.VERCEL_ENV === "production";
  if (env.SKIP_ENV_CHECK === "1") {
    console.warn("env-check: skipped (SKIP_ENV_CHECK=1)");
    return;
  }
  if (!production) {
    console.log(`env-check: ${env.VERCEL_ENV ?? "local"} build, production settings not enforced`);
    return;
  }
  const { errors, warnings } = checkEnv(env);
  if (errors.length === 0) {
    const r = await checkResendKey(env);
    if (r.error) errors.push(r.error);
    if (r.warning) warnings.push(r.warning);
  }
  for (const w of warnings) console.warn(`env-check: warning: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`env-check: ${e}`);
    console.error("env-check: production deploy stopped; the current live version stays online. Fix the settings in Vercel → Settings → Environment Variables (Production), then redeploy.");
    process.exit(1);
  }
  console.log("env-check: production settings OK (email key accepted by Resend)");
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
