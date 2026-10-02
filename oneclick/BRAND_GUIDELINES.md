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

## 2. Logo: Clicky

**Concept (v2, chosen by the owner on 2026-10-02):** Clicky, a friendly face whose smile is a
check mark: a job done, happily. The sunshine dot is the "click", like a dimple. Simple,
uncluttered, and it works as the logo, app icon, favicon and the brand's character.

| Asset | File |
|---|---|
| Primary lockup (Clicky + "One Click" / "DIGITAL HUB") | `public/brand/oneclick-logo-{light,dark,mono,mono-white}.svg` |
| Stacked lockup | `public/brand/oneclick-logo-stacked-*.svg` |
| Wordmark (two lines) | `public/brand/oneclick-wordmark-*.svg` |
| OCDH monogram | `public/brand/ocdh-monogram-*.svg` |
| Mark (Clicky face) | `public/brand/oneclick-mark-*.svg` |
| Favicon (auto dark), Apple icon | `src/app/icon.svg`, `src/app/apple-icon.png` |
| App icons | `oneclick-app-icon(.svg/.png/-192.png)`, `oneclick-app-icon-dark.svg` |
| Instagram avatar | `oneclick-instagram-avatar.(svg/png)`: Clicky on sunshine, circle-safe |
| Instagram highlight covers | `instagram-highlight-{products,bride,grocery,planner,tips,custom}.png` |
| Social preview | `og-default.png` (1200×630) |
| Living style guide | `/en/brand` (not indexed) |

Rules: wordmark is outlined Rubik Bold; "DIGITAL HUB" is Rubik SemiBold at 33% size with +26%
tracking. Clicky keeps its proportions; never stretch or rotate it more than ±10°, and don't
add a mouth on top of the check smile. The Latin lockup stays left-to-right in Arabic layouts.

**The character.** `src/components/brand/Clicky.tsx` has moods (happy, wink, celebrate, love,
think, surprised), an optional body with arms and legs, waving, blinking and floating animations,
and any face color. Each product has its own colored Clicky (pink Bride, green Grocery, blue
Planner, orange Fit…). Use Clicky to guide, cheer and fill empty states, but never more than one
large Clicky per screen.

## 3. Color (v2 "friendly")

Bright and joyful, balanced by a deep indigo ink and a warm off-white base.

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` (Clicky teal) | `#12B5A6` | `#2DD4BF` | Mascot, decorative |
| `primary` (button teal) | `#0B7D73` | `#2DD4BF` | Buttons, links, focus (AA contrast) |
| `accent` (Sunshine) | `#FFC23D` | `#FFCB57` | Highlights, the dimple, secondary CTAs (dark text) |
| `coral` / `lilac` / `sky` | `#FF6B6B` / `#8B7CF6` / `#3DA5FF` | lighter | Illustrations, sparkles, gradients |
| `bg` / `bg-sunken` | `#FFF9F4` / `#FBF0E6` | `#15132B` / `#100E22` | Page |
| `surface` / `surface-raised` | `#FFFEFC` / `#FFFFFF` | `#1C1937` / `#24204A` | Cards |
| `ink` / `ink-soft` / `muted` | `#1E1B3A` / `#46416C` / `#6C6790` | `#F4F1FF` / `#D2CDEC` / `#A7A1CC` | Text |

Collection hues: Bride `#F0567A`, Grocery `#1F9E57`, Planner `#3D7BFF`, Fit `#FF7A2F`,
Budget `#E09E00`, Study `#8B6CF6`, Travel `#12A3C9`.

## 4. Typography

**Rubik** (variable, SIL OFL) for everything, Arabic and Latin: rounded, friendly and highly
legible, with matching Arabic letterforms. Headings 700, UI 500-600, body 400. Arabic headings
use no negative tracking and 1.3 line height; Arabic body 1.75. Numbers: Arabic-Indic digits in
Arabic UI via `Intl` (`ar-OM`).

## 5. Shape, depth, motion

- Radius: 10 / 16 / 24 / 32 px; buttons and chips fully round.
- Buttons have a soft "3D" bottom shadow and lift on hover; press flattens them.
- Shadows are tinted indigo, never pure black.
- Motion: Clicky floats, blinks and waves; sparkles drift; cards wiggle slightly on hover; the hero
  list settles from scattered notes. Everything is static under `prefers-reduced-motion`.
- Illustrations: `src/components/art/ProductArt.tsx`, original flat SVG scenes per product.

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
