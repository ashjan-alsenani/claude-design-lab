# Project status

Last updated: 2026-10-03. Labels: PLANNED · DESIGNED · BUILT LOCALLY · TESTED · MOCK CONNECTED ·
SANDBOX CONNECTED · PRODUCTION CONNECTION REQUIRES OWNER · LIVE. **Nothing is LIVE.**

| Area | Status | Notes |
|---|---|---|
| Brand identity (logo system, colors, type, slogan, voice) | TESTED | SVG + PNG assets generated and visually checked; BRAND_GUIDELINES.md |
| Design system tokens + components | BUILT LOCALLY | Light + dark, RTL + LTR |
| Homepage (hero story, live demos, collections, rail, how, custom, guides, FAQ, CTA) | TESTED | Desktop + mobile, EN + AR, dark mode |
| Catalog, collections (data-driven categories) | TESTED | |
| Product pages (8 products, 4 live demos + free product) | TESTED | Sample content, needs owner approval |
| Arabic/English, RTL/LTR, locale detection | TESTED | Automated tests both languages |
| Custom Digital Solution request (4-step brief) | TESTED | Saves to local dev store; DB + email pending |
| Contact / Help center / FAQ | BUILT LOCALLY | |
| About, Guides (3 real guides) | BUILT LOCALLY | |
| Legal framework (7 pages AR/EN) | DESIGNED | Drafts, lawyer review required |
| Favorites (guest, on device) | TESTED | Account sync planned |
| Licensing & access engine (licenses, claim, verification codes, devices, sessions, downloads) | TESTED (SANDBOX) | docs/LICENSING.md. Production fails closed until the database is connected |
| Accounts / auth (email code + optional password, HttpOnly sessions, trusted devices) | SANDBOX CONNECTED | Local file store; Supabase PRODUCTION CONNECTION REQUIRES OWNER |
| Customer area: My Products, My Purchases, My Devices, Security | TESTED (SANDBOX) | EN + AR, desktop + mobile |
| Bridal Journey (first product: full planner app, demo, landing) | TESTED (SANDBOX) | docs/BRIDAL_JOURNEY.md. Online: demo + landing; saving needs the database |
| Protected product route /app/{slug} + friendly denied page | TESTED | Shared URLs and forwarded links give no access |
| Admin licensing (licenses, customers, product security, rules, activity, audit) | TESTED (SANDBOX) | Every change audit-logged |
| Admin / Business command center | MOCK CONNECTED | Read-only preview; real alerts; saving needs DB |
| Payments | MOCK CONNECTED | Provider-independent interface; "PAYMENT PROVIDER NOT YET CONNECTED". Signed SANDBOX provider for local testing only |
| Orders, entitlements, discounts logic | TESTED | Unit tests |
| Database schema + RLS (incl. licensing migration) | TESTED | Both migrations applied on local Postgres 16; RLS checks pass; not on Supabase yet |
| Email templates (7, bilingual) | BUILT LOCALLY | Provider PRODUCTION CONNECTION REQUIRES OWNER |
| SEO (meta, canonical, hreflang, sitemap, robots, OG, JSON-LD) | TESTED | |
| Analytics + consent | BUILT LOCALLY | No provider connected |
| Instagram system + 30-day plan + highlight covers | DESIGNED | Publishing requires owner's Meta account |
| Video system | DESIGNED | Ready to produce on request |
| Security baseline | TESTED | Headers, validation, rate limit, honeypot, prod guards |
| Deployment | PLANNED | Needs hosting approval |

## Test results (2026-10-03)
- Unit (Vitest): 72/72 passing (24 licensing, 15 Bridal Journey).
- Browser (Playwright, desktop + Pixel 7, EN + AR): 42/42 passing (16 licensing, 6 Bridal Journey).
- Database: both migrations applied to PostgreSQL 16; RLS/privilege checks pass.
- Production build: passing; production guards verified (admin 404, dashboard redirect, no demo).
