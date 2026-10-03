# Claude implementation checklist

Use this as a completion gate. Status as of 2026-10-03 (editorial redesign).

- [x] Compare current page to the reference (the owner's mockup; `assets/reference-tiny.jpg` is damaged, so the copy shared in chat was used). The reference is a device presentation: the site is the interface shown inside the laptop, and on a phone it becomes the phone interface. No device mockups or marketing sections inside the planner.
- [ ] Hero image is large, realistic and correctly cropped: **waiting on a full-resolution `assets/bride-hero.jpg`** (the starter file is 375 x 335 and damaged). A neutral photographic placeholder (soft light and grain, no drawing) shows until a photo at least 1000px wide replaces that file; no code change needed.
- [x] Title/copy area is airy and Arabic-first (editorial hero: photo about 54%, words 46%)
- [x] Countdown card matches visual hierarchy (days counted from today to the wedding date)
- [x] Progress ring uses muted sage
- [x] Exactly five summary cards on desktop (compact, horizontal, about 88px tall)
- [x] Summary card icons use supplied SVG assets
- [x] Weekly focus panel is compact and interactive (checkboxes, tabs that filter, counts and readiness update)
- [x] Appointments use supplied photo thumbnails (replace with larger photos when available)
- [x] Budget panel shows total, percentage and categories
- [x] Mobile task screen uses icons beside tasks
- [x] Mobile budget screen contains circular progress and category bars
- [x] Mobile: logo / notifications / menu, photo with greeting, countdown + readiness, today's focus, 2-column quick actions, appointments, budget, bottom bar (Home, Tasks, Budget, Appointments, More)
- [x] RTL is correct at every breakpoint
- [x] No horizontal overflow at 320, 360, 390, 768, 1024, 1440 (checked in a browser)
- [x] No cartoon bride, no device mockups, no marketing copy inside the planner
- [x] No loud pink gradients, no excessive gold
- [x] No placeholder Lorem Ipsum
- [x] prefers-reduced-motion supported (gentle fades only)
- [x] Final polish pass (interaction details and motion) against DESIGN.md

Notes
- Type: Amiri for editorial headings (a refined book Naskh, not calligraphy), IBM Plex Sans Arabic for the interface, Cormorant Infant for numbers and English, Cormorant Garamond italic for English lines. All self-hosted in `assets/fonts` (SIL OFL).
