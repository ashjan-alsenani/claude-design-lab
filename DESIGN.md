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

## Vivid theme (ClickUp brand layer)

A second layer at the end of `src/styles.css` ("VIVID THEME") gives the platform ClickUp's energy without changing any behaviour.

- **Brand colours**: pink `#ff02f0`, orange `#ff7a45`, yellow `#ffc800`, violet `#8930fd`, sky `#49ccf9`. Gradients `--grad-warm` (headline accent), `--grad-cool`, `--grad-brand` (hairlines, meters) and `--grad-btn` (primary buttons).
- **Module colours**: each of the 12 modules has a vivid and a dark tone (`MODULE_COLORS` in `src/app/fx.js`), applied through `--mc`/`--md` with `modStyle(id)`, like ClickUp Spaces. They colour the sidebar avatars, curriculum tiles, library headers, lesson hero, progress bars and quiz cards.
- **Stage colours**: Watch pink, Understand amber, Practice sky, Check green (`STAGE_COLORS`), used on the home journey, the stage rail and stage headings.
- **Icon tiles**: `.ic-tile` with `--tc` puts every navigation item, stat, chart card and assessment in a tinted tile.
- **Charts from real data**: progress rings (`ring()`), per-module bar chart, and 8 achievements computed only from the learner's actual progress.
- **Logos**: the supplied Omantel and ClickUp logos appear in the header, language screen and footer, unchanged.

### Motion

All motion uses `cubic-bezier(0.23, 1, 0.32, 1)` and explains something:

- Blocks rise in once as they scroll into view (staggered 55 ms); numbers count up and rings/bars fill when shown.
- Dashboard Studio charts grow on first paint only, not on every data change.
- Confetti marks rare wins: solving an exercise the first time, a perfect lesson check, passing a quiz or the final assessment, completing a lesson.
- Hover lifts are limited to devices with a fine pointer; presses scale to 0.97–0.98.
- A language switch or in-place refresh shows everything immediately, so the learner's place never moves.
- `prefers-reduced-motion: reduce` disables drifting hero blobs, reveals, count-ups, chart growth and confetti.

## ClickUp tour and common questions

The platform now leads with explaining ClickUp itself, before practice:

- **`#/tour`**: a dark hero with a floating cloud of the 12 part icons; a "Why teams love ClickUp" before/after scene (scattered emails, spreadsheets and chats fly together into one clear task card, played once on view, replayable with the Without/With toggle); six benefit cards; an **interactive map of a simplified ClickUp screen** with 12 pulsing numbered pins (press a pin or any region to spotlight it and read what it is, or press "Play the tour" to step through all 12); and a grid of the 12 parts.
- **`#/tour/<part>`**: each part is taught in four steps (Meet it, Why you'll love it, How to use it, Check & questions). Step 1 spotlights the part on the screen map, step 2 shows three benefits, step 3 pairs numbered instructions with the module's animated walkthrough, step 4 has a quick check, the part's common questions and links to the full lessons. Reaching step 4 marks the part explored (saved locally; a 12/12 "ClickUp explorer" badge and confetti).
- **`#/questions`**: about 30 of the most asked ClickUp questions, searchable and filterable by part, each with a "Show me how" link into the tour.
- Content lives in `src/content/tour.js` as [Arabic, English] pairs; views in `src/app/tour.js`; styles in `src/tour.css`. Home, the sidebar and global search all link into the tour. All motion is skipped under reduced motion.

## Calmer structure, new home, focus mode

- **Home** is now one message and one piece of living art: a ClickUp-style board where a task card moves TO DO → IN PROGRESS → COMPLETE, a task card with a filling progress bar, a spinning progress donut, a comment bubble, a ringing bell and a check that pops, all drifting gently with the pointer (fine pointers only). Below it, only four airy, centred sections: three ways to learn (tour, lessons, lab), the before/after "why ClickUp" scene, the 12 tour parts as colourful bubbles, and three common questions.
- **Sidebar** shows five main items (Home, ClickUp tour, Lessons, Practice Lab, Common questions); everything else sits under "More", and the 12 modules fold away until you are in the lessons.
- **Focus mode**: the button at the start of the header hides the sidebar on wide screens (remembered on this device); on phones it opens the menu as before. With the sidebar visible on medium screens, a lesson's module list folds into a single row at the top.
- **Tour parts** lost the crowded chip row: the 12 parts are small numbered dots inside the coloured header, and the four steps are a simple numbered stepper.
- Styles: `src/home.css` (loaded last); home view: `src/app/home.js`.

## Automations workshop, guide, ideas and support

- **Header search removed.** Pages keep their own filters (library, glossary, questions).
- **`#/automations`** (five steps, same stepper as the tour): how it works (animated When → If → Then with a live task example), the types of automations with ready recipes, a **simplified ClickUp-style Automations window** (Templates / Manage tabs, Add Automation, When · If · Then builder with the Business-plan note on Conditions, the Send-email-only-with-Send-email rule) plus a **sample task and Activity log** where the learner triggers events and watches automations run, skip on unmet conditions, and count monthly actions; then the steps inside ClickUp (robot icon → Create Automation → suggested, template or custom → Trigger → optional Conditions → Actions) and good-to-know limits and tips. Based on ClickUp Help's Automations articles; it is an educational simulation and does not connect to ClickUp.
- **`#/guide`**: how to use this website in eight steps, with tips.
- **`#/ideas`** and **`#/support`**: forms for feature ideas and team questions with validation, importance/urgency, suggested answers from the common questions, and a saved list with Copy and Email. There is no server, so items are saved on this device and sent by the learner; the page says so. The example request uses Ashjan Al Sinani, ID 71067, and the last name and ID entered are remembered for the next form.
- Code: `src/app/automations.js`, `src/app/feedback.js`, styles in `src/pages.css`.

## Sounds, sticker icons, workshops, watchable answers, forum

- **Header**: the lesson counter is gone; a speaker button turns sounds on or off (remembered on this device), and **Open ClickUp** (with the ClickUp icon) opens app.clickup.com in a new tab.
- **Sounds** (`src/app/sound.js`): tiny Web Audio sounds, no audio files: tap, pop, chime for correct answers, fanfare with confetti, whoosh between steps, soft buzz for errors. Silent during language switches.
- **Sticker icons and Clicky** (`src/fun.css`, `mascot()` in `fx.js`): icon tiles are glossy gradient stickers that pop in and wiggle on hover; Clicky, a friendly robot in ClickUp colours, blinks and waves, and on the home page gives a new tip each time you tap him.
- **Workshops hub** (`#/workshops`, `src/app/workshops.js`): Automations plus three new hands-on workshops, each in five steps:
  - **AI (ClickUp Brain)**: what it does, a simulated Brain panel on a sample task (summary, status update, suggested subtasks you can add, reply, translation, free typing), a prompt builder, steps in ClickUp and responsible-use notes.
  - **Import & Export**: animated flow, a sample sheet or your own CSV (read only in the browser) with column mapping and a warning for non-members, then a real CSV download (Excel-friendly option keeps Arabic).
  - **Templates**: a Template Center to preview and use templates, and a "Save as template" builder showing what is included when reused.
- **Questions** (`#/questions`): rewritten around what Omantel employees typically ask (29 questions). Opening one plays the matching lesson's animated walkthrough inside the answer (one open at a time), or offers the workshop.
- **Forum** (`#/forum`, `src/app/forum.js`): post a question, tip or idea with name and employee ID; Agree, Like and comment, with sorting and filters. Everything goes through `ForumStore`, which is local to this device for now; connecting it to a shared database makes it visible to everyone. The page states this.

## Clicky chatbot, forum in the header, security

- **Header**: Forum button (with its sticker icon) next to Open ClickUp; the sound switch moved to the bottom of the side menu.
- **Clicky chatbot** (`src/app/clicky.js`, `src/clicky.css`): a floating "Ask Clicky" button on every page opens a chat. Clicky answers in Arabic or English from the platform's own knowledge (common questions, tour parts, glossary, lessons, workshops) with Arabic-aware matching and synonyms, links to watch or try the answer, related suggestions and a "Did this help?" rating; unknown questions point to the forum and support. With a server API configured, `/api/clicky` is asked first.
- **"Suggest a new feature you hope to see"** is the ideas page title.
- **Server-ready and secure**: `src/app/api.js` connects the forum, ideas, support and Clicky to same-origin endpoints set by `<meta name="hub-api">`; a hash-pinned Content Security Policy is generated by `build.py`; CSV exports are formula-safe; the test hook is only present on `file://`. See `SERVER.md` for headers and the API contract.

## Clicky understands more

- **Knowledge base** (`src/content/kb.js`): 108 more questions employees commonly ask, in Arabic and English, grouped by the tour parts: getting started and navigation, structure, tasks, statuses, views, fields, collaboration, notifications, time, dashboards, automations, forms, goals, roles and security, AI, import/export, templates, integrations, mobile and troubleshooting. Topics follow the public ClickUp Help Center and University catalogue; the wording is our own and says where menus may differ by plan or version.
- **Smarter matching** (`src/app/clicky.js`): each word counts both as itself and as its synonym group; misspelled words snap to the nearest known word (edit distance, at reduced weight); short follow-ups ("what about on mobile?", "وعلى الجوال؟") reuse the previous topic; vague questions get "Did you mean" choices instead of a wrong guess; Arabic diacritics are ignored.
- **AI add-on** (`server/clicky_api.py`, optional): a small service for `/api/clicky` that asks Claude, grounded in `server/clicky_kb.json` (written by `build.py`). It keeps the API key on the server, limits size and rate, retries declined requests on a fallback model, and returns an empty answer on any failure so the page uses its built-in knowledge. Setup is in `SERVER.md`.
