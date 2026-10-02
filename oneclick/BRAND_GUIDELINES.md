# One Click Digital Hub Brand Guidelines

Status: **DESIGNED + BUILT LOCALLY** (v1, 2026-10-02). Source of truth for tokens:
`src/app/globals.css`. Logo source: `scripts/build-brand.mjs` → `public/brand/`.

## 1. Brand core

| | English | Arabic |
|---|---|---|
| Name | One Click Digital Hub (short: OCDH) | ون كليك ديجيتال هب (the Latin wordmark is used in both languages) |
| Product naming | One Click + product (One Click Bride, One Click Grocery…) | ون كليك + المنتج (ون كليك عروس، ون كليك مقاضي…) |
| Primary slogan | Less effort. More life. | جهد أقل. حياة أكثر. |
| Brand statement | One Click Digital Hub makes everyday life simpler with beautiful, useful digital tools. | ون كليك ديجيتال هب تجعل حياتك اليومية أبسط بأدوات رقمية جميلة ومفيدة. |
| Hero line | Everyday life, made simpler. | يومك، صار أبسط. |
| Elevator pitch | One Click Digital Hub is a digital lifestyle brand from Oman. We design interactive planners, organizers and tools that take everyday tasks from chaos to clarity, in Arabic and English. | ون كليك ديجيتال هب علامة رقمية لأسلوب الحياة من عُمان. نصمم مخططات ومنظّمات وأدوات تفاعلية تنقل مهامك اليومية من الفوضى إلى الوضوح، بالعربي والإنجليزي. |
| Secondary lines | Smart tools. Simpler life. / From chaos to clarity. / Try it before you buy it. | أدوات ذكية. حياة أبسط. / من الفوضى إلى الوضوح. / جرّبه قبل لا تشتريه. |

Instagram bio (EN): `Less effort. More life.` / `Smart planners & organizers for everyday life` / `Arabic + English · From Oman`
Instagram bio (AR): `جهد أقل. حياة أكثر.` / `مخططات ومنظّمات ذكية ليومك` / `عربي + English · من عُمان`

**Brand story.** Everyday life is full of small jobs that take more effort than they should.
One Click Digital Hub turns them into calm, beautiful tools that do one thing well, in Arabic and English,
and respect people's time and data. Started in Oman, designed for everyone.

**Voice.** Warm, clear, direct. Short sentences. Concrete verbs ("plan", "sort", "know the total"),
never hype ("revolutionize", "seamless", "unleash"). Honest about what exists today.
Arabic marketing copy is friendly Gulf-leaning ("خلّي يومك أسهل", "المقاضي"); legal and formal
support copy uses formal Modern Standard Arabic. No em dashes in copy.

## 2. Logo

**Concept: the closing loop.** One continuous stroke: a check mark (completion) that keeps moving
and becomes an open orbit (the "O" of One Click Digital Hub, flow, connection). The saffron dot sits in the
opening: the one click that closes the loop. Deliberately avoids cursors, power icons and bolts.

| Asset | File |
|---|---|
| Primary logo (horizontal) | `public/brand/oneclick-logo-{light,dark,mono,mono-white}.svg` |
| Secondary logo (stacked) | `public/brand/oneclick-logo-stacked-*.svg` |
| Wordmark (two lines: "One Click" / "DIGITAL HUB") | `public/brand/oneclick-wordmark-*.svg` |
| OCDH monogram (tight spaces, watermarks) | `public/brand/ocdh-monogram-*.svg` |
| Icon mark | `public/brand/oneclick-mark-*.svg` |
| Favicon (auto dark mode) | `src/app/icon.svg`, `src/app/apple-icon.png` |
| App icon | `oneclick-app-icon(.svg/.png/-192.png)`, `oneclick-app-icon-dark.svg` |
| Instagram avatar | `oneclick-instagram-avatar.(svg/png)` (1080², circle-safe) |
| Instagram highlight covers | `instagram-highlight-{products,bride,grocery,planner,tips,custom}.png` |
| Social preview | `og-default.png` (1200×630) |

Rules: "One Click" is outlined Geist SemiBold, tracking −2%; "DIGITAL HUB" sits beneath at 34% size, tracking +24%, muted color. Use OCDH alone only where the full name already appears nearby. Minimum mark size 16 px (favicon uses
a heavier 8-unit stroke). Clear space = half the mark height on all sides. Never recolor the
mark outside the palette, add gradients, rotate, outline, or place the Oasis mark on busy photos
(use mono-white on a scrim). The Latin wordmark stays left-to-right inside Arabic layouts.

## 3. Color

Colorful but elegant: one brand primary, one warm accent, and a family of collection hues
that only appear inside their product's context. Cool neutral base (not cream).

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` (Oasis) | `#0C6B66` | `#3FB5AC` | Brand, primary buttons, links, focus |
| `accent` (Saffron) | `#F0A030` | `#F4B04A` | The "click" dot, highlights, free/launch CTAs (dark text) |
| `bg` | `#F5F7F6` | `#0C1014` | Page |
| `surface` / `surface-raised` | `#FCFDFC` / `#FFFFFF` | `#12181D` / `#182027` | Cards, panels |
| `ink` | `#121826` | `#E9EEEC` | Text |
| `ink-soft` / `muted` | `#3A4352` / `#5B6573` | `#C5CDCA` / `#96A19D` | Body / secondary text |
| `line` / `line-strong` | `#DDE3E0` / `#C3CCC8` | `#24302F` / `#34433F` | Borders |
| `success` | `#23804F` | `#4CC285` | |
| `warning` | `#A8670A` | `#E5A33E` | |
| `error` | `#C23A3A` | `#F07070` | |
| `info` | `#2C63C7` | `#79A6F2` | |

Collection hues (same lightness family, used for product identity, charts and tints):
Bride `#C4507A`, Grocery `#3A8A4C`, Planner `#3C58CF`, Fit `#D65A34`, Budget `#A97C12`,
Study `#6A4FC4`, Travel `#1D84AB`. Tints are generated with `color-mix()` (see `lib/hues.ts`).
Primary actions always use Oasis, never a collection hue (consistency + contrast in both themes).

## 4. Typography

| Role | Latin | Arabic |
|---|---|---|
| Display / headings | Geist 600, tracking −3% | IBM Plex Sans Arabic 600, tracking 0, line-height 1.35 |
| Body | Geist 400, 16-18 px, line-height 1.6 | IBM Plex Sans Arabic 400, line-height 1.75 |
| Buttons / labels | Geist 500 | IBM Plex Sans Arabic 500 |
| Numbers | Geist, `tabular-nums` | Arabic-Indic digits via `Intl` (`ar-OM`) consistently in Arabic UI; prices via `formatMoney()` |

Both fonts are SIL OFL, self-hosted (`src/fonts`), `font-display: swap`. Arabic is loaded with a
`unicode-range` so English pages never download it. Arabic pages put Plex first in the stack.

## 5. Shape, depth, spacing

- Radius scale: 8 (inputs small), 12 (tiles, rows), 20 (cards), 28 (large panels); buttons and
  chips are full pill. Followed everywhere.
- Shadows are tinted with the Oasis hue (`--shadow-soft`, `--shadow-lift`), never pure black.
- Spacing: Tailwind 4-pt scale; sections `py-16` mobile / `py-24..28` desktop; content max width
  `max-w-7xl` with 16 px mobile gutters.
- Paper grain overlay (3.5% opacity, fixed, pointer-events none) adds warmth without cost.

## 6. Components (in code)

Buttons (`components/ui/Button.tsx`: primary, accent, secondary, ghost; sm/md/lg; press scale
0.97), Field + ChoiceGroup (label above, help, error below, never placeholder-as-label),
ProductCard (hue tint + orbit pattern + icon), FAQ (native `<details>`), PageHeader + Breadcrumbs,
Framework primitives (`src/framework`: ProgressRing, CheckRow, StatTile, ProductShell, useList),
Consent card, Header with mobile sheet, Footer with newsletter.

## 7. Iconography and imagery

Icons: Phosphor (one family), `duotone` for feature icons, `regular` for UI. No hand-drawn icons.
Imagery priority: live product demos and real UI → branded shapes (the orbit) → original
illustration → licensed lifestyle photography only when it adds meaning. No irrelevant stock.

## 8. Motion

Purposeful only: hero chaos→clarity story, logo draw-on, scroll reveals (once), state feedback
(check pops, progress springs), tab transitions. Ease `cubic-bezier(0.16,1,0.3,1)`, 200-700 ms.
Everything collapses to static under `prefers-reduced-motion`. Animate transform/opacity only.

## 9. Social templates (Instagram)

- Grid: alternate brand-tint covers (collection hue at 14-20% on `bg`) with real UI close-ups.
- Reels/Stories 9:16: hook text top third, product UI centered, captions in safe area,
  end card = mark draw-on + slogan in both languages.
- Carousels 4:5: slide 1 problem (chaos), 2-4 steps, last slide result + CTA.
- Bilingual posts: Arabic first for GCC-targeted posts, English first for international.
