# Data model

Schema: `supabase/migrations/20261002000000_initial_schema.sql` (verified by applying it to
PostgreSQL 16 with a stub `auth` schema: 33 tables, triggers working). Not yet applied to a
Supabase project.

```
auth.users ─┬─ profiles (1:1)            user_roles (customer/admin/owner)
            ├─ orders ── order_items ── products
            │     └── payment_events (raw provider events, idempotent)
            ├─ entitlements ── products        (access source of truth)
            ├─ product_data (per user per product, RLS requires active entitlement)
            ├─ favorites, reviews (verified_purchase set by trigger)
            └─ download_events ── downloads (private bucket paths)

products ─┬─ product_prices (per currency, per license, time-boxed)
          ├─ product_categories ── categories (self-referencing parent for subcategories)
          ├─ product_tags ── tags
          ├─ product_versions, product_media, downloads
          └─ guides.related_product, social_posts, video_assets

custom_requests (statuses New → Closed), support_requests, newsletter_subscribers (consent text
+ time), campaigns ── social_posts, discounts, referral_codes, testimonials (must reference a real
review), faqs, announcements, business_settings (single row, editable tax config), audit_log.
```

Licensing (`supabase/migrations/20261003000000_licensing_engine.sql`, details in LICENSING.md):
`entitlements` (= `product_licenses`) gains status, purchase_email, activation/suspension/claim
dates and device_ids; `authorized_devices`, `user_sessions`, `email_verification_challenges`,
`license_claims`, `access_logs`, `licensing_policy`, `bundle_items`; per-product security columns
on `products`; `account_status`/`email_verified_at` on `profiles`; guest `purchase_email` on
`orders`.

Purchase flow: create `orders` (pending) + `order_items` → provider checkout → webhook →
`payment_events` → mark order paid → insert `entitlements` → emails → analytics `purchase`.
