# Decisions log

Format: decision, why, alternatives considered, how to reverse. Newest first.

## 2026-10-03 — Bridal Journey

**D24. First product = Bridal Journey (رحلة العروس), slug kept as `bride-planner`** so links and
the license stay stable. Arabic is the primary experience.

**D25. "Pearl & Rose" bridal luxury inside the product, with the One Click logo kept**
(owner's third and current choice, after a quiet ivory version and a colorful one): blush and
pearl backgrounds, wine and rose-gold accents, calligraphic Aref Ruqaa / Playfair headings,
roses and pearls artwork. The One Click logo stays at the top of the app because the product
lives inside the One Click store.

**D26. One private document per bride, validated operations, optimistic UI.** Fast on phones,
simple to move to Postgres (`product_data` with license-checked RLS). Checklist templates live
in code so improvements reach every bride.

**D27. Public demo with fictional data, never saved**, so anyone can try before buying without
weakening the license.

## 2026-10-03 — Licensing & access engine

**D18. One engine for all paid products.** Licenses bound to verified accounts; one central
`canUserAccessProduct()`; per-product behaviour is data editable in Admin. No per-product code.

**D19. Passwordless first, password optional.** Email one-time codes for first access, claims,
new devices and recovery; 30-day sessions on trusted devices; optional password for returning
customers on trusted devices. Fewer support issues than password-only, no code every visit.

**D20. Device limit default 2, no fingerprinting.** A device is a random HttpOnly cookie. Above the
limit the customer removes an old device themselves (no support ticket). Concurrent use is
logged, not punished.

**D21. Refund = revoke, chargeback = suspend for review, cancel = revoke** (configurable in Admin).

**D22. Fail closed in production until the database exists**; a clearly labeled local SANDBOX
(signed simulated payments + development mailbox) is used to build and test the full flow.

**D23. Existing `entitlements` table is the license table** (with `product_licenses` view) to keep
one source of truth for RLS, reviews and product data.

## 2026-10-02 — Name "One Click", Clicky v3, real prices, more products

**D17.** Owner instruction: brand name is simply **One Click** (Arabic: ون كليك); "Digital Hub"
and "OCDH" are dropped. Logo/mascot upgraded to **Clicky v3** (soft rounded body, big shiny
eyes, rosy cheeks, check-mark smile, sunshine sparkle) to be more lovable. Per-product prices
replace the flat 15 OMR (docs/PRICING.md). 11 new product ideas added as "coming soon" with prices
and illustrations; new categories Family & Kids and Work & Business. Homepage gets a rotating
headline word, a product parade band and confetti celebrations.

## 2026-10-02 — Friendly redesign (v2)

**D16.** Owner asked for a friendlier, colorful, animated look with art, icons and characters, and a
special, simple logo. Owner chose logo concept **D "Clicky"** from 4 options. Changes: Rubik for both
languages (replaces Geist + IBM Plex Sans Arabic), bright palette (Clicky teal, sunshine, coral,
lilac, sky on warm off-white / deep indigo), Clicky mascot system, original product illustrations,
3D buttons, playful hero and sections. Supersedes the D8 visual identity (name and slogan unchanged).

## 2026-10-02 — Brand renamed to One Click

**D15.** Owner instruction: the brand is **One Click**, short form **OCDH**
(Arabic: ون كليك). Products keep the family pattern "One Click + Product" so they stay
short and clearly connected (Bride Planner, Grocery List, Weekly Planner, Fitness Tracker).
The "closing loop" mark is unchanged. Lockup: mark + "One Click" with "DIGITAL HUB" set beneath;
an "OCDH" monogram wordmark exists for tight spaces. Code folder name `oneclick/` and asset file
names are technical identifiers and were left unchanged.

## 2026-10-02 — Foundation decisions

**D1. Stack: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Motion.**
Why: one codebase for marketing site, customer dashboard, admin and interactive products; static
pre-rendering for speed/SEO; server actions for forms; first-class on Vercel; large talent pool if
the owner hires help later. Alternatives: Astro (weaker for app-like products), Remix (smaller
ecosystem), separate SPA + API (more moving parts).

**D2. Database/auth/storage target: Supabase (Postgres + Auth + Storage + RLS).**
Why: one service covers accounts, database, private file storage and row-level security; generous
free tier; SQL migrations kept in the repo; no lock-in on data (plain Postgres). Status: schema
written and verified on Postgres 16; project not created (needs owner account). Alternative:
Neon + Auth.js + S3 (more pieces to manage).

**D3. Hosting target: Vercel.** Why: zero-config Next.js, previews per branch, free tier for
launch. Alternative: Netlify / self-host (Node) remain possible; nothing Vercel-specific is used.

**D4. Payments: provider-independent interface only** (`src/lib/payments`). Owner will choose an
Oman bank/gateway. Checkout shows "PAYMENT PROVIDER NOT YET CONNECTED". Orders are fulfilled only
from verified webhooks. No card data ever touches One Click.

**D5. Internationalization: own lightweight dictionaries + `[locale]` routes (`/en`, `/ar`).**
Why: two languages with full type-checking, no runtime dependency, RTL via `dir` on `<html>` and
logical CSS properties. Language detected from cookie then `Accept-Language`. Adding a language =
config entry + dictionary + content strings. Alternative: next-intl (fine, unnecessary today).

**D6. Content as typed data files behind repositories** (`src/content`, `src/lib/data`). No CMS
yet. Pages read via `catalog` repository so the source can switch to Supabase tables without
touching components. Revisit a CMS only if non-technical editors need rich layout editing.

**D7. Money in integer minor units with explicit per-currency prices.** OMR (3 decimals) is base.
No currency conversion code; each currency price is entered explicitly or by the payment provider.

**D8. Brand: "closing loop" mark, Oasis teal + Saffron accent + collection hues; Geist +
IBM Plex Sans Arabic.** See BRAND_GUIDELINES.md. Slogan: "Less effort. More life." /
"جهد أقل. حياة أكثر."

**D9. Arabic digits:** Arabic UI uses Arabic-Indic digits consistently via `Intl` (`ar-OM`),
including prices. Easy to flip globally in `num()`/`formatMoney()` if the owner prefers Latin digits.

**D10. Launch product set (wave 1): Bride Planner, Grocery List, Weekly Planner, Fitness Tracker
+ free Weekly Reset Checklist (lead magnet).** Wave 2: Budget, Study, Travel. Reasoning in
docs/PRODUCT_STRATEGY.md.

**D11. Analytics: consent-first, provider-independent** event dictionary; nothing is sent until
consent AND a provider is connected. Recommended provider when ready: a cookieless,
privacy-friendly tool (see COSTS.md).

**D12. Demo mode** (development only) shows sample customer + admin dashboards so they can be
designed and tested before Supabase exists. Hard-disabled in production builds.

**D13. Icons: Phosphor; Motion for animation; Zod for server validation; Vitest + Playwright for
tests.** Chosen for quality, size and maintenance.

**D14. Admin is English-first** (business tool); Arabic admin can be added via the same
dictionaries if the owner prefers.
