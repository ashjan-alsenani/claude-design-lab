# Security

## Reporting
Report vulnerabilities privately to the owner (security contact to be added once the business
email exists). Do not open public issues for security problems.

## Implemented (BUILT LOCALLY + TESTED)
- **Secrets**: none in the repository. `.env*` files are git-ignored except `.env.example`.
  Server-only modules import `server-only` so they cannot be bundled into browser code.
- **Server-side validation**: every form is re-validated on the server with Zod
  (`src/lib/forms/schemas.ts`): enums, length caps, email normalization.
- **Spam protection**: hidden honeypot field + per-IP rate limiting on form actions
  (`src/lib/security/rate-limit.ts`; 5 per 10 min in production).
- **CSRF**: Next.js Server Actions only accept POST from the same origin (Origin/Host check).
  No custom API routes accept cookies-based mutations yet.
- **Output safety**: React escapes all text; JSON-LD is serialized with `<` escaped; content
  renderer (`RichText`) renders text only, never HTML.
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`; `X-Powered-By` removed (`next.config.ts`).
- **Authorization**: admin page returns 404 without an admin role (server-side check);
  dashboard redirects without a session. Demo sessions are impossible in production builds
  (`isDemoMode()` requires `NODE_ENV !== "production"`).
- **Payments**: no card data is collected; the placeholder provider rejects all webhooks.
- **Customer-safe errors**: error boundary shows a friendly message; details go to logs.

## Required when Supabase is connected (PLANNED, schema ready)
- Auth via `@supabase/ssr` with HTTP-only, `Secure`, `SameSite=Lax` cookies.
- Row Level Security on all tables (written in `supabase/migrations`, verified on Postgres 16).
- Admin writes only through server actions using the service role key after `has_role('admin')`.
- Paid files in a **private** bucket; downloads via short-lived signed URLs after `canAccess()`.
- `verified_purchase` set by a database trigger, never by the client.
- Webhooks: verify provider signature, store raw event in `payment_events` (idempotent by
  provider event id), then fulfil.
- Move rate limiting to a shared store (database/KV) for multi-instance hosting.
- Add a Content-Security-Policy with nonces once third-party scripts (analytics/payment) are known.

## Dependency hygiene
- `npm audit` on every change (0 known vulnerabilities at 2026-10-02).
- Enable GitHub Dependabot alerts on the repository (owner setting).

## Secret management
- Production secrets live only in the hosting provider's encrypted environment variables.
- Rotate keys if ever exposed; never paste keys into chat, issues or commits.
