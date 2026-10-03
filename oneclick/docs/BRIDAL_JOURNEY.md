# Bridal Journey (رحلة العروس): first One Click product

Status: **BUILT LOCALLY + TESTED.** Runs inside the licensing engine (`docs/LICENSING.md`).
Payments are still **not connected**, so online the app is reachable only as the public demo
until the database and a payment provider are approved.

| Route | Who | What |
|---|---|---|
| `/{ar\|en}/products/bride-planner` | everyone | Editorial landing page (price, 8 modules, demo CTA) |
| `/{ar\|en}/demo/bride-planner/...` | everyone | Full app with Layan's fictional sample wedding. Nothing is saved (in-tab only) |
| `/{ar\|en}/app/bride-planner/...` | licensed customers | The real product: private, saved per account, authorized on every request |

## What the bride gets
- **Welcome and onboarding:** 8 steps:
  1. name
  2. wedding date
  3. country and city
  4. budget and currency (OMR, AED, SAR, QAR, KWD, BHD, USD)
  5. number of guests
  6. occasions (proposal, engagement, milka, henna, shower, wedding, sabahiya, other)
  7. new home and honeymoon
  8. style, who's helping plan, and how far along she is

  Then "Your bridal journey is ready".
- **Dashboard:**
  - Countdown and an animated readiness ring with a calm message.
  - "Needs your attention", shown only when needed: overdue or soon payments, overdue important tasks, appointments in the next 2 days, a passport that expires within 6 months of the honeymoon, unanswered RSVPs close to the date, unsigned contracts.
  - "Your focus this week": 3–5 tasks, never hundreds.
  - Next payment and next appointment.
  - Progress by area: bride, venue, vendors, guests, shopping, home, honeymoon.
  - Quick overview cards.
- **Smart checklist:**
  - About 210 bilingual tasks in 24 categories, dated relative to the wedding.
  - Grouped as overdue, today, this week, coming soon, later; can also be viewed by category.
  - Dependencies: for example, "Waiting on: Second fitting".
  - Custom tasks the bride can add, edit and delete, clearly marked as hers.
  - Reschedule, notes, priority, and "not needed".
  - Late starts: if planning begins with less time left, the earlier tasks are squeezed into the remaining weeks while keeping their order, and the last month stays as it is.
  - Onboarding progress marks finished steps as done.
  - Progress is weighted by priority.
- **Budget:**
  - Total, paid, committed and remaining.
  - Per-category allocation: automatic, or set by the bride.
  - Expenses linked to vendors.
  - Payment schedule with paid, partially paid, overdue, due soon and not-yet-due states, plus one-tap "mark paid".
- **Vendors:**
  - 15 categories and 7 statuses.
  - Prices, deposit and remaining amount, contract flag, call and Instagram buttons.
- **Calendar:** month view and agenda showing appointments, payments, task due dates (optional) and occasions; tap a day to see its items.
- **Guests:**
  - Search, filters and bulk RSVP updates.
  - Adults and children counts.
  - Seating: tables, seats left, assigning guests.
- **Bride section:** dress, look, beauty (with her own appointments; reminders only, never medical advice), jewellery, accessories; optional groom section.
- **Lists:**
  - Trousseau shopping: need, purchased, gift, not needed, plus quantity, budget, price, store, photo and notes.
  - New-home list: room by room.
  - Bridal Closet: an editorial gallery.
  - Honeymoon packing list.
  - SOS kit.
- **Honeymoon:** trip details, passport-validity warning, visa, insurance, eSIM, bookings, packing.
- **Wedding day:** a timeline the bride can edit, with a responsible person for each step, and the SOS kit.
- **Inspiration:** a private board with photo, link, note and favourite, filtered by category.
- **Documents:** contracts, receipts and passports, with who keeps the original.
  - File upload is a placeholder until secure private storage is connected; we say so in the app.
- **Also included:**
  - Search across everything (⌘K).
  - Actionable notifications.
  - Elegant milestone celebrations.
  - Settings: every detail can be changed and the plan updates itself.
  - Data export as JSON.
  - Start over.
  - Load the sample wedding.

## Design
- **Style (owner choice, 2026-10-03): colorful and joyful, like the One Click site.** Teal,
  sunshine yellow, coral and lilac; Rubik for all text; bouncy 3D buttons; Clicky the mascot in
  the hero, header, welcome screen and milestone celebrations (with confetti).
  (A first "quiet luxury" ivory/champagne version was replaced at the owner's request.)
- **Layout:**
  - Mobile first, with a bottom bar: Home, Checklist, Budget, Calendar, More.
  - Desktop sidebar.
  - Edit forms open as sheets: a bottom sheet on phones, a side panel on larger screens.
- **Motion:** subtle, and off when reduced motion is requested.
  - Page fades, progress ring and bar fills, count-ups.
  - A drawn check when a task is done.
  - Smooth accordions and a gentle milestone toast.
- **Images:** colorful line illustrations stand in for photos; brides can add their own (resized in the browser).

## Architecture
```
src/products/bridal/
  model/      types, templates (checklist), engine (dates, focus, progress, budget,
              alerts, notifications, search), reducer (operations), schema (Zod),
              seed lists, demo (Layan)
  app/        state (optimistic UI + server sync), Shell (nav, search, notifications), BridalApp
  sections/   Onboarding, Dashboard, Checklist, Budget, Vendors, Calendar, Guests, Lists,
              Personal (Bride, Honeymoon, Wedding day), Library (Inspiration, Documents), Settings
  ui/         kit (Button, Card, Sheet, Field, ProgressRing, Badge, Chips, EmptyState, Skeleton…),
              tasks, cards (Payment, Vendor, Appointment), EntitySheet, Art, icons
  server/     actions (bridalSync), today (Gulf time)
  landing/    marketing page
```
- **One document per bride:**
  - Entities with ids and references, mapped one-to-one onto future tables: User, Wedding (profile), WeddingEvent, Task / TaskTemplate, BudgetCategory, Expense, Payment, Vendor, Guest, Table, Appointment, ShoppingItem / ClosetItem / HomeItem (`items` with a list key), Honeymoon, TravelBooking, Document, MoodboardItem, and Notification (computed).
  - Only the bride's changes to system tasks are stored. The tasks themselves come from templates, so updates to the checklist reach every bride.
- **Saving:**
  1. Every change is a typed operation.
  2. The browser applies it instantly.
  3. Batches are sent to `bridalSync`.
  4. On the server, `bridalSync` re-checks session, account, license and device.
  5. It validates each operation with Zod (lengths, dates, image URLs), applies the same reducer, enforces a size limit and saves.
  6. If a save fails: "We couldn't save this change. Please try again." with a retry button.
- **Storage:**
  - Sandbox: `.data/product-data/` (git-ignored).
  - Production: the `product_data` table, whose row-level security already requires an active license.
- **Data isolation:**
  - Only the signed-in account's document is loaded.
  - Another account opening the same URL gets the "not in your account" page and none of the data (end-to-end test).

## Tests
- **Unit (15):**
  - Template integrity and dependencies.
  - Event filtering.
  - 10-months-away vs 7-days-away focus.
  - Late-start compression.
  - Dependencies.
  - Weighted progress.
  - Grouping by time.
  - Demo budget totals.
  - Payment states and alerts.
  - Search and milestones.
  - Validation rejects bad input, including `javascript:` images.
- **Browser, desktop and mobile:**
  - Landing page in both languages.
  - Demo: interaction, navigation, every section loads without horizontal overflow, Arabic right-to-left.
  - Licensed flow: buy (sandbox), My Products, Open, full onboarding, add vendor, reload (data persists), another account denied.

## Next
- Owner review of the Arabic copy and the sample content.
- Connect the database (Supabase) so the real app works online.
- Private file storage for Documents and photos.
- Optional: printable PDF summary.
- Optional: sharing read-only progress with family.
