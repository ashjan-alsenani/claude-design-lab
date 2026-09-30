# Design

Recorded from the built world of `index.html` (Omantel | ClickUp Learning Hub). Source lives in `src/`; `python3 build.py` assembles the single self-contained `index.html`.

## Direction

A learning product that *is* a workspace: modules sit in the sidebar like ClickUp Spaces, lessons are task rows with real status badges, and demos run inside a live mini-workspace. Light, calm, and familiar to ClickUp users, without imitating ClickUp or implying endorsement. Fully bilingual: Arabic (RTL) and English (LTR), with the other script isolated inside mixed sentences.

## Color tokens (`:root` in `src/styles.css`)

| Role | Token | Value |
|---|---|---|
| Page ground | `--bg` | `#f6f5fa` |
| Work surface | `--surface` | `#ffffff` |
| Sidebar / secondary neutral | `--surface-2` | `#f1eff8` |
| Hairline | `--line` | `#e4e1ee` |
| Ink / secondary / muted | `--ink` `--ink-2` `--ink-3` | `#1c1a27` `#454257` `#625f76` |
| Brand mark (ClickUp-inspired) | `--brand` | `#7b68ee` |
| Action + selection only | `--accent` | `#5b45d6` (white text 6:1) |
| Accent text | `--accent-ink` | `#4a36b8` |
| Omantel accent | `--omantel` | neutral placeholder until official assets are supplied |
| Status TO DO / IN PROGRESS / REVIEW / COMPLETE | `--st-*` | `#687083` `#2f6bd6` `#b25f00` `#18814f` |
| Priority Urgent / High / Normal / Low | `--pr-*` | `#cf3434` `#c77700` `#3e63d6` `#7d8193` |
| Chart categorical | `--c1..c5` | validated reference order, starting `#2a78d6` |

Strategy: Restrained. Neutrals plus one accent; status colors are reserved for state and always carry a text label.

## Type

One family: Readex Pro (Arabic + Latin), fallback `Segoe UI`, Tahoma, system. Fixed rem scale: h1 1.75rem, h2 1.3rem, h3 1.075rem, body 1rem / 1.7. Status badges are uppercase Latin, 0.7rem, 600.

## Shape, depth, motion

- Radii: 6px small controls, 8px controls, 12px panels, 16px home hero.
- Shadows are soft and purple-tinted (`--shadow-1..3`), and always offset.
- Motion: `--ease-out: cubic-bezier(0.23,1,0.32,1)`, drawer `cubic-bezier(0.32,0.72,0,1)`. UI transitions are 120–280ms; buttons scale to 0.97 on press. The signature element is the demo player, whose pointer, typing, card moves and bars all run on one pausable clock. `prefers-reduced-motion` removes movement.

## Components

Topbar with the logo pair and global search; sidebar of nav plus module "Spaces"; task-row lists; ClickUp-style status badges and priority flags; demo player (stage, caption, controls); exercise kit (order, match, choice, task simulation, board, builder with live preview); Lab (List, Board, Calendar, Table, task drawer); chart cards (SVG, tooltip, data table, computed question); callouts for plan-dependent, admin and uncertain notes.

## Layout

Sidebar 272px (off-canvas below 1080px). Content max 1180px. Lab challenges sit beside the board at 1400px and wider, and below it on narrower screens. No page-level horizontal overflow from 360px to 1440px (verified).

## Bilingual system

- **Content model.** Arabic content lives in `src/content/`; English overlays in `src/content/en/` address the same lesson, question, task and challenge IDs. `src/i18n/core.js` applies an overlay in place when the language changes, so answers, progress and IDs never change. Interface strings use `tx('عربي', 'English')`.
- **First visit.** A full-screen language screen with two equal cards, "العربية" and "English". Focus lands on the dialog, not an option, so neither looks preselected. The choice is stored under `omantel-clickup-hub:lang`; without storage the screen shows each visit and says so.
- **Switcher.** A segmented control in the header on every screen ("العربية" / "English", shortened to "ع" / "EN" below 760px). On phones below 480px the header progress meter gives way to it (progress stays in the sidebar).
- **State kept on switch.** Lesson route, demo step and speed, exercise and quiz answers (stored as indexes), graded results, open panels, unsent drafts, open task drawer, filters, and scroll position anchored to the same block.
- **Direction.** `html[dir]` drives layout: logical properties everywhere, mirrored sidebar and drawers, directional icon aliases (`fwd`, `back`, `step-prev`, `step-next`). Demo stages are authored RTL and mirrored for English. Studio charts compute geometry in reading order, so categories and time run right-to-left in Arabic and left-to-right in English with identical numbers.
- **Dates.** Arabic "30 سبتمبر 2026"; English day-month "30 Sep 2026".
- **Logos and credit.** The Omantel and ClickUp logos appear unchanged in both languages. "Designed by Ashjan Al Sinani" appears in the footer, sidebar, About page and language screen.
- **Verification.** `tests/` holds Playwright checks: content completeness and answer parity, every screen in both languages at 360, 390, 820 and 1280px (no overflow, no stray Arabic in English), and behaviour (language screen, remembered choice, state kept on switch, exercises solvable in English, storage blocked).
