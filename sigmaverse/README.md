# SigmaVerse · Define Mastery Academy

*Understand it. Visualize it. Master it.*

An interactive, English-language study academy for the **Define Phase** of the PeopleCert IASSC Lean Six Sigma Green Belt syllabus (v1.0, June 2021). It is a React single-page app with no backend: all progress lives in the learner's browser.

## What is inside

| Area | Contents |
|---|---|
| Lessons | 19 deep-reading lessons, one per official Define topic (1.1.1 to 1.4.5), each with objectives, sections, a business example, an animated diagram, definitions, comparisons, misconceptions, exam traps, step-by-step worked examples, an embedded lab, check questions, takeaways, flashcards and source references |
| Interactive labs | 20 working labs (12 signature labs from the brief plus 8 supporting ones), each with Explore, Challenge and Knowledge-check modes |
| Formula Master | 16 formula screens (11 Define calculations plus 5 clearly labelled supplementary ones) with animated substitution and unlimited generated practice at five difficulty levels, with mistake detection |
| Question bank | 250 original questions (about 60 numeric) with an explanation for every option, plus generated numeric variants |
| Practice Arena | Learn, Test, Timed, Calculation-only, Exam Trap, Weak Areas and Randomized Mixed modes |
| Mock exam | Timed 19-question Define mock (34 minutes by default), with a full review afterwards |
| Exam Trap Detector | 18 wording traps, each comparing what a question appears to ask with what it actually asks, plus a Mistake Notebook |
| Flashcard Studio | Lesson cards and a 122-term glossary deck, with spaced repetition, quick recall, matching and browse modes |
| Glossary | 122 terms and 24 easily confused pairs |
| Reference Library | The documents used to build the app, a source coverage matrix, and a client-side PDF.js reader with text search for your own PDFs |
| Progress | XP, levels, streaks, activity heatmap, mastery by lesson, achievements and printable personal study certificates |

## Run it

```bash
cd sigmaverse
npm install
npm run dev        # http://localhost:5173
npm test           # formula engine and content integrity tests
npm run build      # type-check and production build into dist/
```

### Deploy to Vercel

Import the repository in Vercel and set **Root Directory** to `sigmaverse`. Vercel detects the Vite framework, so the defaults apply (build command `npm run build`, output `dist`). `vercel.json` rewrites every route to `index.html`, which client-side routing needs.

## Architecture

```
src/
  data/          content: lessons/, questions/, glossary, traps, formulas, sources (coverage matrix), types
  lib/           metrics.ts (verified formulas), problems.ts (generators), store.ts (local profile),
                 insights.ts (rule-based analytics), srs.ts (spaced repetition), pdf.ts (PDF.js + IndexedDB)
  components/    layout, rich-text renderer (KaTeX + glossary popovers), question card, practice session
  diagrams/      19 stepped, animated SVG explanations with play, pause, replay, step and speed controls
  labs/          20 labs built on a shared kit (LabShell, ClassifierGame, KnowledgeCheck)
  pages/         one file per route
```

- Every number shown in a calculator, lab or generated problem comes from `src/lib/metrics.ts`. The tests in `metrics.test.ts` cover these functions, and they also check about 4,700 generated problems to confirm that no listed common-mistake value is ever accepted as correct.
- `src/data/content.test.ts` checks content integrity:
  - all 19 topics are present and every structural part of each lesson is filled
  - every glossary link resolves
  - the question bank meets its size targets and every question is well formed
  - every trap has a practice question
  - no em dash or en dash appears in learner-facing text
- Motion: built on Motion (Framer Motion). The app honours the operating system's reduced-motion setting and adds a manual Reduced Motion mode and a global animation speed control.

## Honesty and scope notes

- **No AI.** Recommendations, mastery estimates and weak areas are rule-based calculations on the learner's own activity. No paid APIs or services are used.
- **Storage.** Progress uses `localStorage`; PDFs use IndexedDB. Nothing is sent to a server. Settings has export, import and reset.
- **Sources.** The official syllabus defines topic names and scope. The supplied training-book parts start at printed page 98 (the Measure Phase). The Define chapter itself was not supplied. Define lessons therefore draw on three things:
  - the syllabus
  - Define-related passages found elsewhere in the book: the Glossary, Lean Controls, the metrics pages and the DMAIC roadmap
  - original supplementary explanations

  Each lesson is labelled *Source supported*, *Partly source supported* or *Supplementary*. Its Source references list exact pages. The full matrix is in the Reference Library and in `src/data/sources.ts`.
- **Copyright.** The source PDFs are not redistributed. A learner who owns them can load their own copies into the Reference Library, and lesson citations then open the referenced page. PDFs uploaded later never change course content.
- **Not official.** All questions are original practice items. The mock exam approximates the Define share (19%) of the 100-question exam. It does not claim to reproduce the official test. Certificates mark personal study milestones only.
