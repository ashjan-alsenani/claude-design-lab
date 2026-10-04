# Digital Product Licensing, Delivery & Access Engine

Status: **BUILT LOCALLY + TESTED in SANDBOX.** In production the engine **fails closed** (nobody
can sign in, every protected product is denied) until the database is connected. Payments are
**NOT CONNECTED**; the sandbox simulates them and labels every screen, email and order "SANDBOX".

## The rule
**The product belongs to the customer account, not the URL.** Ownership is a server-side license
record bound to a verified account. These prove nothing on their own: a URL, a link in an email,
query parameters, browser storage or a cookie. Every protected request is authorized on the
server by one function, `canUserAccessProduct()` (`src/lib/licensing/engine.ts`).

## How a purchase becomes access
```
Checkout (purchase email, normalized)  ->  Order (pending) + order items
  -> VERIFIED payment event (provider signature checked; idempotent per event id; amount,
     currency, provider and order must match)
  -> Licenses: active (paid) / pending (payment pending) / none (failed or invalid)
     bundles create one license per included product
  -> ONE email to the purchase address: purchase confirmation (product, order, amount, date)
     with an "Open My Product" button
       - existing verified account with that email: the button opens /{locale}/app/{slug}
       - guest: the button opens the claim page, which sends a one-time code TO THE PURCHASE EMAIL
         (already signed in with that email? straight to the product, no second code)
  -> Code verified -> account created or signed in -> licenses bound to it
  -> Straight into the product (/{locale}/app/{slug}, authorized on every request).
     No password and no profile form; the profile is optional and can be filled in later.
```
A forwarded email or copied link gives nothing: the code always goes to the purchase address,
and the product route checks the signed-in account's license.

## canUserAccessProduct(userId, productId)
This function runs the checks below in order, and the first failure decides the result:

1. The product exists.
2. Per-product settings: custom services and paused products cannot be opened.
3. Free products (`PUBLIC_FREE`) are open to everyone.
4. The access type supports the request: an interactive "open", or a download.
5. The visitor is signed in.
6. The account is active and its email is verified.
7. The session is live and belongs to the account, and this device is authorized.
8. A license exists for this account and this product.
9. The license status is active and the license has not expired.
10. The per-product device limit (if any) and download limit (if any) are respected.

Denials show a friendly page: "This product isn't available in your account", with Explore
product, Go to My Products and Contact support. The page never reveals who owns a product.

## Product access types (set per product in Admin, no code)
| Type | Opens | Downloads |
|---|---|---|
| INTERACTIVE_PRIVATE | `/app/{slug}` | – |
| SECURE_DOWNLOAD | – | signed links |
| HYBRID | `/app/{slug}` | signed links |
| PUBLIC_FREE | everyone | if enabled |
| CUSTOM_SERVICE | delivered personally | – |

Defaults come from the product data (`src/lib/licensing/policy.ts`). Bride Planner and Weekly
Planner default to HYBRID. Admin can override for any product:

- access type
- device limit: global default, or a custom number
- license type: personal, commercial or team
- downloads on or off
- download limit
- watermark
- license duration
- active or paused

## Accounts, codes, devices, sessions
- **Verification codes:**
  - 6 digits, valid for 10 minutes and usable once.
  - Locked after 5 wrong tries; at most 5 codes per email per hour, plus a per-IP limit.
  - Stored only as an HMAC; never logged and never sent to the browser.
  - Only the newest code for an email and purpose works. Arabic-Indic and Persian digits are accepted.
- **Sign-in is the emailed code only** (no passwords, no Google/Apple). The same flow signs up:
  a new email creates the account when its code is verified; purchases made with that email attach to it.
- **Returning customers:** a 30-day HttpOnly session cookie, so opening products never asks for a code.
- **Devices:**
  - 3 trusted devices per customer by default (configurable).
  - A device is a random HttpOnly cookie, stored as an HMAC. The record holds only a friendly name ("Chrome on iPhone"), the platform, when it was first verified, when it was last used, its most recent session, and its status.
  - Unusually many new devices: after 5 new devices in 7 days (including replacements), further new devices are not trusted until the week passes or support helps. Devices already in use keep working, and the event is logged as suspicious.
  - No fingerprinting, location or IP tracking.
  - A new device beyond the limit goes through: verify email, show devices, remove an old one, authorize this device.
  - The customer gets an alert email when a new device is added.
- **Sessions:**
  - At most 5 active sessions; beyond that the oldest is signed out and the event is logged.
  - Customers can sign out of other sessions or everywhere.
  - Removing a device ends its sessions.
  - Suspending an account ends all its sessions.
- **Concurrent use** of one license on several devices within two minutes is logged as suspicious. It is not blocked.
- **Repeated denied attempts** (10 in 10 minutes) are logged as suspicious.
- **Email change:**
  - A code is sent to the new address, and the old address gets a notice.
  - The change is audit-logged.
  - The original purchase email stays on every order and license.
  - The response looks identical when the new address is already in use, so other customers' emails are not revealed.
- **Emails are normalized:** trimmed and lower-cased.

## Downloads
1. **My Products → Download** creates a signed link. The link:
   - lasts 120 seconds;
   - is bound to the user **and the session**.
2. `/api/download/{token}` then checks that:
   - the signature is valid;
   - the link has not expired;
   - the same user and session are making the request;
   - the license is still valid.
3. If all checks pass, it:
   - counts the download against the limit (if any);
   - logs it;
   - sends the file with `Cache-Control: private, no-store`.
4. Files are personalized:
   - The sandbox generates a sample PDF with a visible watermark showing the account email, order number and license ID.
   - In production, files live in a **private** storage bucket.
5. Limits of the watermark:
   - It discourages sharing and identifies the licensee.
   - It does **not** prevent copying, and we never claim it does.

## Refunds, chargebacks, cancellations (configurable rules)
- Refund: **revoke** (default)
- Chargeback: **suspend** for review (default)
- Cancelled after payment: **revoke** (default)
- Failed or cancelled before payment: no access, and pending licenses are revoked
- Bundles: the included products follow the bundle

## Admin: `/{locale}/admin/licensing`
The server checks the admin role on every request; anyone without it gets a 404.

- **Licenses:**
  - Search by email, order, license ID or product, and filter by status.
  - Suspend, reactivate or revoke. Each action needs a reason and a confirmation tick, and is audit-logged.
  - Grant a license, for support, gifts or recovery.
- **Customer page:**
  - Licenses, devices with [Remove], sessions with [Sign out everywhere].
  - Suspend or reactivate the account.
  - Send a recovery code, which goes only to the account email.
  - Orders with [Resend access email].
  - Access history.
- **Product security:** the per-product settings above.
- **Activity & alerts:** the access log, an alerts-only view and the audit log.
- **Rules:**
  - Device limit, sessions, how long a sign-in lasts.
  - Code lifetime, tries and rate limit; claim-link and download-link lifetimes.
  - What happens on a refund, chargeback or cancellation.

## Logging
- **`access_logs`:** opens, downloads, sign-ins, devices, verification, payment events, suspicious events.
- **`audit_log`:** every admin and system change, with a reason.
- **Never logged:** codes, tokens, passwords or hashes. Keys matching these are stripped automatically, and a unit test checks this.

## Database (Supabase target)
The schema is in `supabase/migrations/20261003000000_licensing_engine.sql`. It was verified on PostgreSQL 16.

- **New tables:**
  - `authorized_devices`
  - `user_sessions`
  - `email_verification_challenges`
  - `license_claims`
  - `access_logs`
  - `licensing_policy`
  - `bundle_items`
- **Licenses:** stored in `entitlements`, with `status`, `purchase_email`, `activated_at`, `suspended_at`, `revoked_at`, `expires_at`, `claimed_at` and `device_ids`. `product_licenses` is a view over it.
- **Product security:** the per-product settings are columns on `products`.
- **Accounts:** `account_status`, `email_verified_at` and email history on `profiles`.
- **Guest orders:** `orders` has `purchase_email`, `external_payment_reference` and `is_sandbox`.

RLS results from the local test:

- A customer reads only their own licenses, orders, devices, sessions and logs.
- Customers cannot insert or update licenses, orders or payment events.
- Customers can never read token or code hashes (column grants).
- Customers have no access at all to challenges or claim links.
- `has_active_license()` controls `product_data` and download metadata. A revoked license loses access immediately.

## Files
| File | Role |
|---|---|
| `src/lib/licensing/engine.ts` | The engine: rules, flows, admin operations |
| `src/lib/licensing/types.ts` / `policy.ts` | Model, defaults, per-product settings |
| `src/lib/licensing/crypto.ts` | Tokens, HMAC, codes, scrypt passwords, signed links |
| `src/lib/licensing/store.ts` | Memory (tests) / file (sandbox) / unavailable (production) |
| `src/lib/licensing/server.ts` | Cookies, mode, wiring |
| `src/lib/payments/sandbox.ts` | Signed SANDBOX provider (dev only) |
| `src/app/[locale]/account/*` | Sign in, verify, My Products, Purchases, Devices, Security |
| `src/app/[locale]/app/[slug]` | Protected product route |
| `src/app/[locale]/claim` | Claim page |
| `src/app/api/download/[token]` | Secure downloads |
| `src/app/api/payments/webhook/[provider]` | Verified payment events |
| `src/app/[locale]/admin/licensing/*` | Admin |
| `tests/unit/licensing.test.ts`, `tests/e2e/licensing.spec.ts` | Tests |

## Adding a new product
Add it to the catalog with a price. It is licensed automatically, opens at `/app/{slug}`, and
shows up in My Products after purchase. You can adjust its security settings in Admin. No
licensing code is written per product.

## To go live (needs owner approval)
1. Create the Supabase project, apply both migrations, and implement `SupabaseLicensingStore` (same engine, SQL storage).
2. Set `LICENSING_SECRET` (32+ random characters) and `ONECLICK_OWNER_EMAILS` (the owner's
   sign-in email) in the hosting secrets. Optional: `ONECLICK_ADMIN_EMAILS` for staff.
   - Owner: admin panel, plus every product opens without a purchase (role `owner`). Sign-in,
     email verification and trusted devices still apply; downloads still need a license.
   - Admin: admin panel only. Neither address is ever written in the code.
3. Connect the email provider. Codes and claim emails are already written in Arabic and English.
4. Connect the payment provider through `PaymentProvider`. Its webhook calls `handlePaymentEvent`.
5. Move rate limits to a shared store, and put download files in a private storage bucket.


## Production storage (2026-10-04)
- `SupabaseLicensingStore` (`src/lib/licensing/store.ts`) keeps the engine's record set in `oc_licensing_state`
  and commits each change with a compare-and-swap on `version` (retries on a clash), so writes are atomic across
  serverless instances. New access/audit entries are also appended to `oc_licensing_events` (full history); the
  working record keeps the latest 1000 of each.
- Product data (`oc_product_data`) and form submissions (`oc_leads`) use the same server-only REST client
  (`src/lib/supabase/rest.ts`). RLS is on with no policies and all grants are revoked from `anon`/`authenticated`.
- Mode is chosen at runtime: demo mode → sandbox; `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `LICENSING_SECRET`
  → database; otherwise unavailable (fails closed). Private routes are forced dynamic so they never use a copy
  rendered at build time.
- Email: Resend adapter in `src/lib/email/index.ts`. Bodies are never logged.
- Verified by `tests/db-integration/run.sh`: PostgreSQL 16 + PostgREST + mock Resend against a production build
  (owner sign-in by emailed code, admin, planner save, custom request; anon key denied).
