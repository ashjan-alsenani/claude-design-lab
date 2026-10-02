# Product strategy

## Evaluation (launch candidates)

Scores 1-5 (higher is better). Effort is inverted (5 = least effort). Reuse = share of the
One Click Product Framework the product can use.

| Product | Problem strength | Audience size (GCC) | Willingness to pay | Reuse | Effort | Marketing hook | Risk | Total |
|---|---|---|---|---|---|---|---|---|
| **Bride** | 5 | 4 | 5 | 4 | 3 | 5 (emotional, seasonal, very visual) | Scope creep | **26** |
| **Grocery** | 4 | 5 | 3 | 5 | 5 | 4 (relatable daily pain) | Free alternatives exist | **26** |
| **Planner** | 4 | 5 | 3 | 5 | 4 | 4 | Crowded category | **25** |
| **Fit** | 3 | 4 | 3 | 4 | 4 | 4 | Medical-claim risk (disclaimers) | **22** |
| Budget | 4 | 5 | 3 | 4 | 3 | 3 | Financial-advice risk | 22 |
| Study | 4 | 4 | 3 | 4 | 3 | 4 (exam seasons) | Seasonal | 22 |
| Travel | 3 | 3 | 3 | 3 | 3 | 4 | Lower frequency | 19 |

**Decision:** Wave 1 = Bride, Grocery, Planner, Fit + free Weekly Reset Checklist (lead magnet).
Wave 2 = Budget, Study (before back-to-school), Travel (before summer). Ramadan Planner as a
seasonal limited edition built from Planner components.

## Product cards

### One Click Bride
- Problem: wedding details scattered across chats, notes and memory; deadlines and budget drift.
- Audience: brides, grooms, families helping them (GCC first; works for any wedding).
- Key benefit: always know the next task and where the money is going.
- MVP: countdown, phase-based editable checklist (engagement, malka, henna, wedding day), budget
  per category with deposits, guest list with RSVP, vendor contacts/quotes, printable summary.
- Premium (later): shared access for family, seating plan, gift tracker, inspiration boards,
  appointment reminders.
- Differentiator: Gulf wedding traditions built in; Arabic-first; calm design.
- Reuse: checklist, progress ring, budget tracker, contacts table, export, countdown.
- Risks: scope creep. Mitigation: MVP list above is fixed for v1.

### One Click Grocery
- Problem: lists in chat messages, forgotten items, duplicate purchases, surprise bills.
- Audience: households, busy parents. MVP: sections, regulars/favorites, quantities, expected
  price + running total, multiple lists and stores, purchased status, offline-friendly.
- Premium: shared household list (real-time), recurring schedules, price history.
- Differentiator: speed, Arabic item library (المقاضي), totals in OMR.

### One Click Planner
- Problem: overloaded weeks, planners too empty or too complex.
- MVP: three priorities per day, week view (Sun-Thu default), inbox, 5 habits, weekly review.
- Premium: calendar sync, templates (Ramadan, exam week), goals.

### One Click Fit
- Problem: no plan and no record, progress invisible.
- MVP: weekly schedule, exercise library (AR/EN), sets/reps/weight log, consistency chart.
- Guardrail: organization tool only; wellness disclaimer on page and in product; no medical,
  diet or injury advice.

### Weekly Reset Checklist (free)
- Purpose: introduce One Click with real value, no account needed; CTA to Planner.

## One Click Product Framework

Built (`src/framework`): ProductShell, ProgressRing, CheckRow, StatTile, useList.
Built (`src/lib`): entitlements + `canAccess`, money/currency, discounts, analytics, i18n.
Next: persistence adapter (`product_data` table, local-first with sync), export/print view,
calendar/timeline, chart primitives, settings panel, onboarding tour, notifications, PWA install.
Each product = its own data model + copy + hue on top of the shared shell.
