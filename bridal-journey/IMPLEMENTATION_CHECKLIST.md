# Claude implementation checklist

Use this as a completion gate. Status as of 2026-10-03.

- [x] Compare current page to the reference (the owner's mockup; `assets/reference-tiny.jpg` is damaged and does not open, so the copy shared in chat was used)
- [ ] Hero image is large, realistic and correctly cropped: **blocked, `assets/bride-hero.jpg` is damaged** (375 x 335 and mostly green). A soft terrace placeholder shows until a full-resolution photo (1000px wide or more) replaces that file; no code change needed.
- [x] Title/copy area is airy and Arabic-first
- [x] Countdown card matches visual hierarchy (days are counted from today to the wedding date)
- [x] Progress ring uses muted sage
- [x] Exactly five summary cards on desktop
- [x] Summary card icons use supplied SVG assets
- [x] Weekly focus panel is compact and interactive (ticking a task updates the task count and readiness ring)
- [x] Appointments use supplied photo thumbnails (they are 50px crops, so they look soft; replace with larger photos when available)
- [x] Budget panel shows total, percentage and categories
- [x] Mobile task screen uses icons beside tasks
- [x] Mobile budget screen contains circular progress and category bars
- [x] RTL is correct at every breakpoint
- [x] No horizontal overflow at 360, 390, 768, 1024, 1440 (checked in a browser)
- [x] No cartoon bride
- [x] No loud pink gradients
- [x] No excessive gold
- [x] No placeholder Lorem Ipsum
- [x] prefers-reduced-motion supported
- [x] Run final design polish against DESIGN.md

Notes
- Fonts are self-hosted in `assets/fonts` (SIL OFL): Alexandria for Arabic and Latin UI, Cormorant Garamond italic for the English lines. The owner turned down the Aref Ruqaa calligraphic style earlier, so it is not used.
