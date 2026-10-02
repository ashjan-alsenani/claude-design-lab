# Owner actions

Only things that genuinely need you. Everything else is handled by Claude.

## NOW (blocking the next phase)

**1. Approve creating free accounts for the database and hosting (Supabase + Vercel)**
- Why: customer accounts, purchases, the admin dashboard and saving custom requests need a real
  database; the site needs hosting to be visible online.
- What to do: reply "approved: Supabase + Vercel free plans". Then sign in to both with your GitHub
  account (supabase.com → "Start your project"; vercel.com → "Sign up" → "Continue with GitHub").
  Create a Supabase organization called "One Click". No card is needed for free plans.
- Send back: just tell me it's done. Supabase and Vercel are connected to this workspace, so I can
  create the project, apply the database schema and deploy a private preview myself.
- Cost: 0 OMR on free plans (limits in COSTS.md).
- Blocks: real accounts, admin saving, and an online preview. The site itself keeps progressing.

## LATER (before public launch)

**2. Choose the payment provider with your bank in Oman**
- Why: required to take payments. The site is already built to plug it in.
- What to do: ask your bank for an online payment gateway for a website selling digital products
  to Oman, GCC and international customers. Ask: supported cards (local debit, Visa/Mastercard,
  Apple Pay), settlement currency, fees, hosted payment page support, webhooks, refunds API,
  sandbox access, and whether digital products are allowed.
- Send back: the provider name, sandbox credentials (via a secure channel, never in chat/Git)
  and their API documentation link.
- Cost: per provider (usually setup + % per transaction).

**3. Business identity details**
- Why: shown in the footer, invoices and legal pages once confirmed; needed for compliance.
- Send back: company legal name, Commercial Registration number, licensed activity, VAT number
  (if registered), business address, support email, business phone.

**4. Domain and Instagram handle**
- Why: the brand needs a global-friendly domain and a matching handle.
- What to do: approve a domain purchase. Claude will check availability of candidates such as
  `oneclick.om` (Oman), `getoneclick.com`, `oneclick.life`, `oneclickhq.com` and the matching
  Instagram handles, and present a short list with prices before anything is bought.
- Cost: typically 10-40 OMR/year depending on extension.

**5. Legal review**
- Why: legal pages are professional drafts, not legal advice.
- What to do: share `/legal/*` pages and OMAN_LAUNCH_CHECKLIST.md with a lawyer/accountant in Oman.
- Cost: professional fees.

**6. Business email provider approval**
- Why: send order confirmations, password resets and request confirmations.
- What to do: approve a transactional email service (recommendation and prices in COSTS.md) and a
  sending domain email like `hello@yourdomain`.

**7. Approve final product names, prices and copy**
- Why: products are marked "Sample content" until you approve them.
- What to do: review the product pages; reply with changes or "approved".

## OPTIONAL

- Confirm Arabic digit style (currently Arabic-Indic ١٢٣ in Arabic pages; can switch to 123).
- Choose whether the Admin should also be available in Arabic.
- Decide refund policy option (7-day no-questions for interactive products is proposed).
- Connect a Meta Professional Instagram account when ready for scheduled publishing.
