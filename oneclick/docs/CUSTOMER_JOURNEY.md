# Customer journey

| Step | Today (built) | Friction / next |
|---|---|---|
| Instagram / search | UTM-linked plan; SEO metadata, sitemap, hreflang, structured data | Social landing variants per campaign |
| Landing page | Homepage + product pages, mobile-first, AR/EN | — |
| Discovery | Catalog, collections, favorites | Search when catalog > 12 products |
| Product page | Problem, benefits, features, specs, FAQ, related, license | Real screenshots/video per product |
| Demo | Live interactive demo on every launch product | Guided demo tour |
| Checkout | Honest placeholder + launch notification | Gateway integration (owner bank) |
| Payment → confirmation | Order/entitlement model + email templates | Webhook handler once gateway chosen |
| Access → dashboard | Demo dashboard with entitlements + `canAccess` | Supabase auth + real data |
| Onboarding → usage | Framework primitives | Per-product first-run tour, persistence |
| Support | Help center, contact form with order reference | Ticket replies by email |
| Review → related | Review schema with Verified Purchase + moderation | Review UI after first sales |

Principles: no account needed to try; one primary CTA per page; never ask for card details
outside the provider's secure page; Arabic and English parity at every step.
