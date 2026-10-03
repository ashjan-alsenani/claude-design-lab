# Changelog

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
