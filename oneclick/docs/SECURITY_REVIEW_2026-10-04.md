# One Click security review — product ownership and access (4 Oct 2026)

Written **before** any change, from the code on branch `claude/brave-fermi-t1pa59` (commit `ced8760`),
the live Supabase project (`OneClick`), and requests made against https://www.oneclick.computer.

## How it was checked
- Code: the licensing engine (`src/lib/licensing/engine.ts`, the single `canUserAccessProduct` rule),
  every protected page (`/[locale]/app/[slug]`, `/[locale]/app/bride-planner/*`), every server action that
  reads or writes product data (`src/products/bridal/server/actions.ts`), every API route
  (`/api/download/[token]`, `/api/avatar/[userId]`, `/api/payments/webhook/[provider]`), sessions
  (`src/lib/licensing/server.ts`), the payment provider, and the HTTP cache headers (`next.config.ts`).
- Database (live): storage buckets and files, table privileges for the public API roles, row-level security,
  and record counts.
- Live site, signed out: protected pages, a fake download link, the avatar route, the developer mailbox,
  admin, and fake payment notifications.

## Answers

1. **Is product ownership checked server-side?** Yes. Every product page, every save of product data and every
   download calls the engine on the server, which checks: signed-in session (HttpOnly cookie, stored only as a
   hash) → verified, active account → an active license for that exact product → a trusted device. Nothing in
   the browser decides access.

2. **Are any product URLs or protected files public?** No protected files exist anywhere public. `public/`
   holds only brand images. Supabase has 0 storage buckets and 0 files. Product pages send
   `Cache-Control: private, no-store`. **However:** for every product except Bridal Journey, the "paid"
   screen inside the account is the same free demo shown on the public product page (or a "workspace coming
   soon" placeholder). There is nothing secret to leak, but there is also no real paid product yet.

3. **Can another person open a shared product URL?** No. Live: a signed-out visitor to
   `/ar/app/bride-planner` is sent to sign in. A different signed-in account sees "not available in your
   account" (covered by an automated browser test that forwards a link between two accounts).

4. **Are successful purchases stored as entitlements linked to the verified email?** Yes, in design: a license
   is created only from a verified payment notification (signature, amount and currency checked,
   duplicates ignored), recorded with the order, product and purchase email, and attached to an account only
   when that exact email is verified by code. Gaps: the license has no "last access date" (access is only in
   the activity log). The live database has 0 orders and 0 licenses because payments are not connected.

5. **Real authentication or UI checks?** Real authentication: random session token in an HttpOnly cookie,
   matched by hash on the server, expiring after 30 days, revocable. Hidden buttons are not relied on.

6. **Are protected files stored privately?** There are no stored product files yet. Downloads are generated
   per request after the check (a personalized PDF). When real files are added they must go in a private
   bucket.

7. **Temporary signed URLs?** Yes where used: download links are signed (HMAC), expire in 120 seconds, are bound
   to the account and the session, re-check the license when used, and are logged. No storage signed URLs are
   needed yet because nothing is stored.

8. **Is the code sign-in tied to the purchase email?** Yes. The code is always sent to the email on the order,
   never to an address typed by whoever holds the link, so a forwarded email transfers nothing. Signed-in
   purchases always use the account's verified email.

9. **Can someone open another account's product by changing the URL or product ID?** No. The URL only names a
   product; the engine then looks for a license for *that* product owned by *the signed-in account*. Download
   tokens are signed, so editing them invalidates them. Admin pages require the admin role; profile photos are
   served only to their owner and admins.

10. **What must change before selling safely?**
    - **Payments are not connected.** Real purchases are impossible until a payment provider is chosen and its
      webhook signature verification is added. This is the main blocker, and it needs the bank/provider.
    - **Only Bridal Journey is a real paid product.** The others show the public demo; build them (or stop
      selling them) first.
    - Flow gaps against the new rules:
      - A first-time buyer is forced through a name/picture form before the product.
      - The purchase email opens a claim page and then My Products, not the product itself.
      - Returning buyers' email says "Go to My Products" instead of opening the product.
      - Device limit is 2 (3 wanted), and nothing caps how often devices are swapped.
      - Licenses lack a last-access date.
      - The denial message is softer than "Access Denied — You do not own this product."
    - When real downloadable files exist: private storage with short-lived signed URLs, issued only after the
      check.

## Live probe results (signed out)
| Request | Result |
|---|---|
| `/ar/app/bride-planner`, `/ar/app/grocery-list`, `/ar/app/bride-planner/budget` | 307 → sign-in |
| `/api/download/abc.def` (fake link) | 403 |
| `/api/avatar/usr_x` | 404 |
| `/en/dev/mailbox` (test inbox) | 404 in production |
| `/en/admin` | 404 for non-admins |
| `POST /api/payments/webhook/sandbox` | rejected (`unknown_provider`) |
| `POST /api/payments/webhook/none` | rejected (`invalid_event`) |

## Database (live)
| Check | Result |
|---|---|
| Storage buckets / files | 0 / 0 |
| Privileges for `anon` / `authenticated` on `oc_*` tables | none |
| Row-level security | on for all `oc_*` tables, no policies (server only) |
| Records | 1 account (owner), 0 orders, 0 licenses |

## Changes made after this review (same day)
- **Direct to the product.**
  - The purchase email is now one message: a confirmation (product, order, amount, date) with an "Open My Product" button.
  - After the email code, the buyer lands in the product itself.
  - Someone already signed in with the purchase email skips the code.
  - The name/picture form is optional and never blocks a product.
- **Entitlement record.**
  - Each license holds: account, purchase email, product, order, status, purchase and activation dates.
  - New: the last time it was opened or downloaded.
  - The order holds the payment status.
  - Admin shows all of it.
- **Devices.**
  - 3 trusted devices by default.
  - Each device keeps its first use, last use and most recent session.
  - More than 5 new devices in 7 days pauses new devices; devices already in use keep working.
- **Wording.** Denials read "Access Denied — You do not own this product."
- **Unchanged and still required before selling:**
  - Connect a payment provider and verify its webhook signatures.
  - Build the paid experiences of products other than Bridal Journey.
  - Use a private bucket with short-lived signed links once real downloadable files exist.
