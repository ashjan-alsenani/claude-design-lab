# Asset manifest

All paths are relative to `bridal-journey/`.

| File | Role | Usage |
|---|---|---|
| assets/reference-tiny.jpg | visual authority | compare composition, color, card density and mood |
| assets/bride-hero.jpg | hero photography | large image block in dashboard hero |
| assets/appointment-flowers.jpg | appointment thumb | florist appointment |
| assets/appointment-dress.jpg | appointment thumb | dress fitting |
| assets/appointment-table.jpg | appointment thumb | menu/table appointment |
| assets/avatar.jpg | profile photo | header avatar |
| assets/sprig.png | decoration | flower sprig in the countdown card (transparent) |
| assets/blossom-corner.png | decoration | blossom branch in the hero corner (transparent) |
| assets/logo-mark.svg | brand mark | header/logo |
| assets/icon-venue.svg | line icon | venue tasks/cards |
| assets/icon-flower.svg | line icon | flowers/decor |
| assets/icon-dress.svg | line icon | dress/bridal look |
| assets/icon-invite.svg | line icon | invitations/tasks |
| assets/icon-budget.svg | line icon | budget |
| assets/icon-vendors.svg | line icon | vendors |
| assets/icon-calendar.svg | line icon | appointments |
| assets/icon-guests.svg | line icon | guest list |

## Image rules
- Preserve the photo's warm cream/blush grading.
- Use object-fit: cover.
- Avoid heavy overlays.
- If higher-resolution source photos are later provided, overwrite the same filenames so code does not need to change.

## Source of the current photos
`bride-hero.jpg`, the three appointment photos, `avatar.jpg`, `sprig.png` and `blossom-corner.png` were cropped from the owner's reference mockup (2026-10-03) and enlarged. The hero patches a small area on its right edge, which fades into the sky in the layout. Replace any of them with full-resolution originals under the same filenames; no code change is needed.
