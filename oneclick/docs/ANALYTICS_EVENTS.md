# Analytics event dictionary

Source of truth: `src/lib/analytics/events.ts`. Nothing is sent until the visitor allows
analytics **and** a provider adapter is registered (none connected yet).

| Event | When | Properties | Where |
|---|---|---|---|
| `page_view` | Each page view | path, locale | provider default |
| `product_view` | Product page opened | product_id | ProductViewTracker |
| `demo_interaction` | First interaction with a demo per load | demo_id | useDemoTracker |
| `favorite_toggle` | Save/remove favorite | product_id, saved | FavoriteButton |
| `signup` | Account created | method | (auth, planned) |
| `checkout_start` | Checkout page opened | product_id | CheckoutTracker |
| `purchase` | Verified payment webhook | order_id, value_minor, currency | server only (planned) |
| `custom_request` | Custom request submitted | solution_type | CustomRequestForm |
| `newsletter_signup` | Newsletter form submitted | connected | NewsletterForm |
| `notify_me` | Launch notification requested | product_id | NotifyForm |
| `campaign_landing` | Visit with UTM params | utm_source, utm_medium, utm_campaign | (planned) |
| `product_usage` | Entitled customer opens a product | product_id | (planned) |

Rules: no names, emails, phone numbers or free text in event properties. Aggregate reporting only.
