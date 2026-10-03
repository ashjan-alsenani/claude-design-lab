# رحلة العروس — Claude build instructions

This folder is the active project on this branch. Build and refine the bridal planner here.

## Visual authority
Treat `assets/reference-tiny.jpg` as the visual reference. Match its feeling and hierarchy closely: warm ivory/champagne background, muted rose typography, elegant Arabic RTL, one large bride image, two hero KPI cards, five compact summary cards, three lower dashboard panels, and refined mobile layouts.

Do not replace the direction with a generic SaaS dashboard, cartoon bride, loud pink gradients, excessive gold, or dense admin UI.

## Assets already supplied
Use these files directly instead of asking the user to upload them again:
- `assets/bride-hero.jpg` — hero bride crop
- `assets/appointment-flowers.jpg`
- `assets/appointment-dress.jpg`
- `assets/appointment-table.jpg`
- `assets/logo-mark.svg`
- `assets/icon-venue.svg`
- `assets/icon-flower.svg`
- `assets/icon-dress.svg`
- `assets/icon-invite.svg`
- `assets/icon-budget.svg`
- `assets/icon-vendors.svg`
- `assets/icon-calendar.svg`
- `assets/icon-guests.svg`

If a later user supplies higher-resolution photography, replace only the image files while preserving layout and sizing.

## Required behavior
- Arabic first, true RTL. English can be secondary.
- Mobile-first responsive layout, not a shrunk desktop.
- Use real buttons/interactions where practical.
- Checklist checkboxes must work.
- Tabs should change active state.
- Budget/progress visuals should be data-driven in the final product.
- Never show hundreds of tasks on the dashboard. Surface only current priorities.
- Preserve accessibility, focus states and reduced-motion support.

## Design system
Read `DESIGN.md` and `ASSET_MANIFEST.md` before changing UI.
Use the existing design skills in the repository:
1. design-taste-frontend for overall direction
2. emil-design-eng for interface detail/motion
3. impeccable for final spacing, type and polish

## Working rule
Do not stop to say images are missing. The required starter visual assets are in this folder. Implement first, then report only genuine remaining gaps.
