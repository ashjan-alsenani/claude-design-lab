# Launch checklist (technical + business)

## Soft launch (private preview)
- [x] Brand identity and design system
- [x] Bilingual site with homepage, catalog, product pages, demos
- [x] Custom request, contact, help, legal drafts
- [x] Automated tests (unit + browser) passing
- [ ] Owner approves hosting/database accounts (OWNER_ACTIONS #1)
- [ ] Supabase project created, migrations applied, buckets created, catalog seeded
- [ ] Auth wired (sign up, sign in, reset, email verification)
- [ ] Custom requests + support saved to database; owner notification email
- [ ] Private preview deployment on Vercel
- [ ] Owner reviews product copy/prices (OWNER_ACTIONS #7)

## Commercial launch
- [ ] Payment gateway integrated in sandbox, then production (owner's bank)
- [ ] Webhook → order → entitlement → email flow tested end-to-end
- [ ] Interactive products persist data per user (`product_data`)
- [ ] Download delivery via signed URLs tested
- [ ] Transactional email live with verified domain (SPF/DKIM/DMARC)
- [ ] Domain connected, HTTPS, canonical URL env var set
- [ ] Analytics provider connected (consent-first)
- [ ] Legal pages reviewed and finalized; business identity displayed
- [ ] OMAN_LAUNCH_CHECKLIST.md complete
- [ ] Lighthouse ≥ 90 (performance, accessibility, SEO) on mobile, AR + EN
- [ ] Backups verified with a test restore
- [ ] Instagram profile set up; first 9 posts approved and scheduled

## After launch
- [ ] Weekly owner summary (revenue, orders, traffic, conversion, requests, alerts)
- [ ] Review moderation workflow live after first purchases
- [ ] Wave 2 products (Budget, Study, Travel)
