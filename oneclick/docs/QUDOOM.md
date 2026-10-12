# «حكاية قدوم» / Hikayat Qudoom

كل تفاصيل تجهيز صغيرك واستقباله… في مكان واحد.

## Pages

| Page | URL |
| --- | --- |
| Sales page | `/ar/products/hikayat-qudoom` |
| The product (licensed) | `/ar/app/hikayat-qudoom/[section]` |
| Helper view (invited account) | `/ar/shared/hikayat-qudoom/[grant]` |
| Guest gift list | `/ar/q/g/[token]` (`?preview=1` for the mother's preview) |
| Guest visit booking | `/ar/q/v/[token]` |
| A guest's own reservation or request | `/ar/q/m/[token]` |
| Helper invite | `/ar/q/h/[token]` |

The app sections are: home, steps, looks, ideas, items, bag, nursery, mother, events, visits, hospitality, favors, registry, received, budget, calendar, memories, cards, share, settings and more.

## The mother's journey

1. Setup takes 4 short steps, and she can skip it. Only a name is needed.
2. The home screen shows:
   - an expected-date countdown;
   - progress counted only over what she marked as needed;
   - what's next, deliveries and the next visit;
   - quick-add buttons.
3. Preparation covers:
   - baby things;
   - a nursery (a room or a corner) with an inspiration board;
   - 4 hospital bags (provided vs packed), printable;
   - her own rest plan, set for any number of days, with no medical advice.
4. Welcome covers:
   - reception plans with their checklists;
   - visits, with her own hours, slot length and seats per slot;
   - a visit link where guests send requests and she approves;
   - a hospitality calculator (estimates);
   - favors.
5. Gifts covers:
   - a public gift list, where guests reserve or mark bought without an account and no money is collected;
   - received gifts, with a thank-you message she sends herself.
6. Budget and calendar:
   - The budget shows planned, committed, paid, still to pay and left over, in 6 Gulf currencies, with manual exchange rates only.
   - The calendar can be exported as an ICS file.
7. «وصل صغيرنا» mode, which only she switches on. Then memories and cards (PNG or print, no watermark).
8. Sharing and helpers:
   - Links can be paused, replaced, or given an end date.
   - Helpers use their own accounts and see only the sections she chooses, either view-only or with editing. She can revoke access anytime.
9. Settings: export her data as JSON, or delete her planner data. Her account stays.

## Security and data

- Plans are saved on the server in `oc_product_data`, with versioned compare-and-swap writes. The app shows saving, saved and error states, with retry.
- Shared data lives in the `oc_qd_*` tables. The "last gift" and "last visit seats" checks run inside PostgreSQL functions that lock the owner's row.
- Link tokens are random, stored only as an HMAC, plus an AES-GCM sealed copy so the mother can copy her link again.
- Guests see only a published projection. They never see guests' names, notes, budget, addresses or private photos.
- Private photos and PDFs:
  - checked by their bytes, with a 3 MB limit;
  - served only to the owner, or to a helper who can see that section;
  - never given public URLs.
- Nothing is ever sent in the mother's name. There is no SMS and no email to guests.
- Nothing about Qudoom content goes to analytics.

## Tests

- Unit tests (vitest): 148 pass, including the model, privacy projection and helper rights.
- E2E (Playwright) on desktop and mobile: `tests/e2e/qudoom.spec.ts` (4 journeys × 2 devices).
- Database race test: `bash tests/db-integration/qudoom-race.sh`. With 40 people at once, 1 gets the last gift and exactly 3 fill the remaining visit seats. Expiry and cancel work, and the public API roles are refused.

## Owner decisions (deliberately left open)

- **Price**: not set. The product shows «السعر يُعلن قريبًا» and checkout returns 404 until a price is added in `src/content/products.ts`. The `pricePending` flag keeps it from being treated as free.
- **Access length**: shown as «تُحدد مع فتح الشراء». It can be set per product in Admin when the price is set.
- **Payments**: use the existing system (Thawani, once it is connected). There is no fake payment.

## Not done yet (honest list)

- **Gift photos on the public list**: guests see the name, details and store link, not the mother's uploaded photo. This avoids making private files public.
- **Email**: helper invites are not emailed. The mother copies the link and sends it herself. This is deliberate, but an optional email could be added later.
- **Reminders**: in-app only. The header bell and the «لا تنسين» card cover appointments within 3 days, tasks that are late or due within 2 days, payments, visits today or tomorrow, new visit requests, deliveries, the hospital bag in the last 4 weeks, and thank-yous still to send. There are no push or SMS notifications, and nothing is sent in the mother's name.
- **Favor photos**: AI sample photos made with Canva, one per favor category, are approximate (not the exact item). Every idea in a category shows its category's photo. Categories without a photo yet keep their drawing. Canva's free quota allows only a few images per cooldown, and the copies we can download are 200 px, so they are used as small thumbnails only.
- **Data export**: the JSON export includes photo names and dates but not the photo files themselves.
- **Visit approval**: requests always need the mother's approval. Instant auto-confirm is not offered.
