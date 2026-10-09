# Changelog

## 0.13.0 — 2026-10-09 — «مفكّرة عروسة العُمر» (Bride of a Lifetime) in the One Click design
- New product name: «مفكّرة عروسة العُمر» / Bride of a Lifetime (formerly «رحلة العروس» / Bridal
  Journey). Addresses stay the same (/products/bride-planner, /app/bride-planner).
- Small phones: the header hides the English subtitle so the longer name never causes sideways scrolling.
- The bridal app now looks like the rest of One Click: Rubik, indigo text on the One Click base, the
  Bride pink with its deeper shade for text and buttons, white rounded cards, beige stat tiles and
  One Click's raised buttons.
- Home: a pink Clicky greets the bride by name next to the countdown and readiness tiles. The
  bride photograph, blossoms and frosted glass are gone; appointment and mood tiles use One Click hues.
- Header: Bride-pink heart tile with "رحلة العروس · Bridal Journey · One Click".
- Setup screens use Clicky instead of the photo.
- The public product page now uses the standard One Click product template (live demo, price,
  benefits, FAQ) with a link to the full sample app.
- Fix: verification-code cleanup measured "two days" from the wall clock instead of the engine's clock.

## 0.12.0 — 2026-10-05 — Bridal Journey: sharper, faster, consistent
- New high-resolution bride photograph (3200 px, generated to match the approved composition) replaces the
  enlarged crop that looked blurry; served as AVIF/WebP at higher quality.
- Faster first screen: content is visible as soon as the page arrives (entrance animations are CSS, not
  waiting for the app script). The app script is about 72% smaller (sections load on their own, the data
  checks use the light build of the validation library).
- Moving between sections is instant with a short fade (no wait for the old page to leave).
- Every section page has the same blush header band with the blossom, and warm pearl cards instead of
  plain white boxes.

## 0.11.0 — 2026-10-05 — Bridal Journey: the approved photo design in the real product
- Dashboard hero: the bride photograph fades into the page (edge to edge on computers), with the title,
  frosted countdown and readiness cards beside it; the six summary cards overlap the photo.
- Upcoming appointments show photos (dress, flowers, table) where they fit.
- New wheat brand mark in the app header.
- Public product page and the first-time setup screen use the same photograph instead of the drawn bride.
- Removed the old drawn bride, terrace scene and their animations.

## 0.10.0 — 2026-10-05 — Site scan and a complete admin
- Live scan: all 92 sitemap pages and 136 internal links work; no script errors, broken images or
  sideways scrolling on computer or phone.
- Admin home shows real numbers (revenue and paid orders in 30 days, customers, open requests);
  test orders never count as revenue.
- New admin tabs: Orders (search, status filter, test orders labelled, resend access email) and Customers
  (search, products, orders, devices, last seen).
- Inbox (/admin/inbox): contact messages and custom requests with full details, status, reply by email.
  The owner gets an email for every new one (OWNER_NOTIFICATION_EMAIL or the owner email).
- Newsletter and "notify me" sign-ups are now saved with consent proof; Subscribers page with CSV export
  and unsubscribe. Database migration 20261005000000_subscribers.sql (applied).
- Content-Security-Policy on every page (production); favicon.ico; Arabic page titles end in «ون كليك».

## 0.9.2 — 2026-10-04 — Owner test purchases on the live site
- Admin → "Test the customer journey": creates a signed link valid for 2 hours. Opened in any browser (e.g. a
  private window), it lets that browser simulate payment at checkout; the order, license, email, code, account
  and product are all real. Orders are marked SANDBOX. Without the link the checkout is unchanged.

## 0.9.1 — 2026-10-04 — Same protection for every product
- Every product screen goes through one guard (`openProduct`) and every read or save of customer product data
  through `productDataFor` (src/lib/licensing/guard.ts). Pages check ownership themselves, not via their layout.
- Catalog-wide tests: every product, including future ones, is run through the ownership rules (unit and browser).
- Guard-rail tests block unguarded product pages, direct product-data access, unreviewed API routes and files
  in the public folder.

## 0.9.0 — 2026-10-04 — Ownership review and direct-to-product
- Security review of ownership and access before changes: docs/SECURITY_REVIEW_2026-10-04.md.
- After payment, one email to the purchase address: confirmation (product, order, amount, date) with an
  "Open My Product" button. Verifying the code opens the product directly; a signed-in owner skips the code.
- The profile form is no longer required before a product (optional hint in My Products).
- Licenses record when they were last opened; devices record their most recent session.
- 3 trusted devices by default; at most 5 new devices per 7 days, then new devices pause (logged as suspicious).
- Denial page: "Access Denied — You do not own this product." Admin shows payment status, purchase date and last access.

## 0.8.0 — 2026-10-04 — Email code only
- Sign-in and sign-up are one flow: enter your email, receive a code, enter it. A new email
  creates the account; a known email signs in. Purchases made with that email are attached to it.
- Removed the password option and the Google / Apple sign-in work (never switched on), so the
  emailed code is the only way in.
- Profile: the sign-in email is shown (read-only, changed from Security); "Language" label.

## 0.7.0 — 2026-10-04 — Profiles and sign-in fixes
- First sign-in opens a short welcome form: name, profile picture, country, email language,
  optional mobile number and an optional newsletter opt-in. Account pages wait until it's saved.
- Profile picture: initials on one of six colors by default (one letter for Arabic names), or an
  uploaded photo. The browser crops it to a 256 px square (dropping location data); the server
  accepts only real JPEG, PNG or WebP bytes and serves it only to its owner and admins.
- "My profile" page in the account menu; the menu shows the picture and name.
- Sign-in codes are one unbroken run of digits (a spaced code was reversed in Arabic mail apps).
- A code whose email could not be sent is withdrawn and doesn't count toward the hourly limit.
- Checkout says plainly that no account is needed: buy with an email.

## 0.6.0 — 2026-10-04 — Database and email
- Supabase-backed storage for accounts, sessions, devices, orders, licenses (atomic compare-and-swap writes),
  activity history, product data and form submissions. Server-only access; anon key denied (tested).
- Resend email adapter: sign-in codes, purchase and security emails.
- Production mode switches on with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and LICENSING_SECRET; stays locked otherwise.
- Private pages always render per request. Development mailbox is append-only (no lost messages).
- Owner setup guide in Arabic: docs/SETUP_DATABASE_EMAIL.md. Integration test: tests/db-integration/run.sh.

## 0.5.3 — 2026-10-03 — Owner account
- `ONECLICK_OWNER_EMAILS`: signing in with the owner's email gives the admin panel and opens
  every product without buying it; an "Owner account" panel lists them in My Products.

## 0.5.2 — 2026-10-03 — Bridal Journey "Soft Modern"
- Redesign from the owner's reference: top menu bar, terrace hero with the bride seen from
  behind, glass countdown and readiness cards, quick cards, focus / appointments / budget cards.
- Alexandria font, nude and charcoal palette, shimmer, sparkles, swaying veil, moving icons.
- One Click logo beside the brand and in the footer; language switch added to "More".

## 0.5.1 — 2026-10-03 — Bridal Journey "Pearl & Rose"
- Luxury wedding redesign: blush and pearl, wine and rose gold, calligraphic headings,
  roses-and-pearls artwork, falling petals on milestones, warmer bridal copy.
- One Click logo kept in the app header and sidebar.

## 0.5.0 — 2026-10-03 — Bridal Journey, the first product
- Full bilingual bridal planning app (Arabic first): onboarding, smart dashboard, ~210-task
  checklist with dependencies, budget and payments, vendors, calendar, guests and seating,
  bride preparation, trousseau, bridal closet, new home, honeymoon, wedding-day timeline and
  SOS kit, inspiration board, documents, search, notifications, settings.
- Runs as a licensed product (`/app/bride-planner`): server-authorized, saved per account.
- Public demo with a fictional sample wedding (`/demo/bride-planner`), nothing saved.
- New editorial landing page; product renamed "Bridal Journey / رحلة العروس".
- Colorful, joyful One Click design (teal, sunshine, coral, lilac, Rubik, Clicky mascot,
  confetti celebrations). Tests: 72 unit, 42 browser.

## 0.4.0 — 2026-10-03 — Licensing, delivery & access engine
- Reusable licensing engine: licenses bound to verified accounts, central
  `canUserAccessProduct()`, statuses pending/active/suspended/revoked/expired, bundles.
- Purchase flow with signed SANDBOX payments (no real money), guest purchases with
  "Claim / open my product" email, verification codes, My Products, My Purchases, My Devices,
  Security & settings (password, email change, activity).
- Trusted devices (default 2), new-device flow, sessions, sign out everywhere, alerts.
- Protected product route `/app/{slug}` with friendly denied page; secure, personalized,
  session-bound downloads.
- Admin licensing: licenses, customers, product security settings, rules, activity, audit log.
- Database migration with RLS and column privileges (verified on PostgreSQL 16).
- Tests: 57 unit, 36 browser.

## 0.3.0 — 2026-10-02 — One Click, Clicky v3, pricing, more products
- Brand name simplified to **One Click**.
- Clicky v3: cuter mascot/logo with big shiny eyes, rosy cheeks and a twinkling sparkle; all logo,
  icon, Instagram and social assets regenerated.
- Per-product prices (4-18 OMR, free checklist, 12 OMR bundle) with rationale in docs/PRICING.md.
- 11 new product ideas with illustrations: Ramadan, Meals, Baby, Home, Kids, Events, Gifts,
  Habits, Business, Umrah, Life Starter Bundle. New categories: Family & Kids, Work & Business.
- Homepage: rotating headline word, colorful product parade, confetti when tasks are completed,
  animated illustrations.

## 0.2.0 — 2026-10-02 — Friendly redesign
- Clicky logo + mascot, colorful palette, Rubik font, product illustrations, playful homepage.

## 0.1.1 — 2026-10-02 — Brand renamed
- Brand renamed to **One Click** across site, content, emails, SEO and docs.
- New two-line lockup ("One Click" / "DIGITAL HUB"), OCDH monogram, regenerated social/OG assets.
- Products renamed to the "One Click + Product" pattern.

## 0.1.0 — 2026-10-02 — Foundation

### Added
- One Click brand identity: "closing loop" logo system (primary, stacked, wordmark, mark; light,
  dark, mono), favicon, app icons, Instagram avatar and highlight covers, Open Graph image.
- Design tokens (light/dark), Geist + IBM Plex Sans Arabic, reusable UI components.
- Next.js 16 app with Arabic (RTL) and English (LTR) routes and locale detection.
- Pages: home, products, collections, 8 product pages, checkout placeholder, custom solution
  request, contact, help center, about, guides (3), legal (7), favorites, account, dashboard
  (demo), admin command center (demo), branded 404 and error pages.
- Live product demos: Bride, Grocery, Planner, Fit, Weekly Reset (free).
- One Click Product Framework primitives.
- Provider-independent payments, orders, entitlements, discounts; email templates; analytics
  dictionary with consent; lead store; rate limiting; security headers.
- Supabase schema with RLS (verified on Postgres 16).
- SEO: metadata, canonical, hreflang, sitemap, robots, manifest, JSON-LD.
- Tests: 33 unit, 20 browser (desktop + mobile).
- Documentation set (brief, status, decisions, owner actions, checklists, security, deployment,
  brand, costs, product strategy, marketing packages, Instagram, video, analytics, data model,
  backups, customer journey).
