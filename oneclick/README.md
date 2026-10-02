# One Click

**Less effort. More life. · جهد أقل. حياة أكثر.**

One Click is an international digital lifestyle brand from the Sultanate of Oman: interactive
planners, organizers, downloads and custom digital solutions, in Arabic and English.

This folder contains the One Click platform (website, product framework, admin foundation) and
all project documentation.

## Quick start
```bash
cd oneclick
npm install
npm run dev          # http://localhost:3000
```
Then open `/en` or `/ar`. In development, demo mode shows `/en/account/dashboard` and `/en/admin`
with sample data.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | TypeScript check |
| `npm test` | Unit tests |
| `npm run test:e2e` | Browser tests (desktop + mobile, EN + AR) |
| `npm run build` / `npm start` | Production build / server |
| `node scripts/build-brand.mjs` | Regenerate logo SVGs |
| `node scripts/render-brand-png.mjs` | Regenerate PNG icons, OG image, Instagram assets |

## Structure
```
src/app/[locale]/      pages (home, products, collections, custom, guides, help, legal, account, admin…)
src/components/        UI, layout, home sections, product, demos, forms
src/framework/         One Click Product Framework (shared product primitives)
src/content/           bilingual content: products, categories, guides, FAQs, legal, social plan
src/i18n/              locales + dictionaries (en, ar)
src/lib/               money, seo, payments, commerce, auth, email, analytics, data, security
supabase/migrations/   database schema + row level security
public/brand/          logo system and social assets
docs/                  strategy, marketing, Instagram, video, analytics, data model, backups
tests/                 unit (Vitest) and e2e (Playwright)
```

## Project documents
- [MASTER_PROJECT_BRIEF.md](MASTER_PROJECT_BRIEF.md) · [PROJECT_STATUS.md](PROJECT_STATUS.md) ·
  [OWNER_ACTIONS.md](OWNER_ACTIONS.md) · [DECISIONS.md](DECISIONS.md)
- [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) · [COSTS.md](COSTS.md) · [CHANGELOG.md](CHANGELOG.md)
- [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) · [OMAN_LAUNCH_CHECKLIST.md](OMAN_LAUNCH_CHECKLIST.md)
- [SECURITY.md](SECURITY.md) · [DEPLOYMENT.md](DEPLOYMENT.md)
- docs: [product strategy](docs/PRODUCT_STRATEGY.md), [marketing packages](docs/MARKETING_PACKAGES.md),
  [Instagram](docs/INSTAGRAM.md), [video](docs/VIDEO_SYSTEM.md), [analytics](docs/ANALYTICS_EVENTS.md),
  [data model](docs/DATA_MODEL.md), [backups](docs/BACKUPS.md), [customer journey](docs/CUSTOMER_JOURNEY.md)

## Honesty rules
No fake reviews, sales, downloads or customer counts. Payment is **not connected**. Sample content
is labeled. Nothing is marked LIVE until it is.

## Licenses
Fonts: Geist and IBM Plex Sans Arabic, SIL Open Font License 1.1. Icons: Phosphor (MIT).
