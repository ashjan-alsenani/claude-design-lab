# «الشرح المتحرك» — authoring animated explainers

Goal: a child who did not understand the lesson by READING understands it by WATCHING. Each explainer is a short animated story (5–8 scenes, ~1 minute) that SHOWS the idea: things move, flow, grow, combine, compare. Text on the stage is minimal; the narration under the stage explains in one or two short sentences per scene.

## Files
- Schema: `src/explain/types.ts` (read it fully). Renderer: `src/explain/Stage.tsx`.
- Write `src/data/explain/<subject>/<unitId>/<name>.ts` exporting `default` an `Explainer[]` (see the benchmark `src/data/explain/science/u1/heart.ts`, lesson 1-2 — copy its quality and style).
- One explainer per lesson: `lesson` = the site's lesson id (`1-3`, `m1-2`, `e1-3`).

## Check your work visually (required)
1. `cd /home/user/claude-design-lab/science-world && npx tsc -p tsconfig.json --noEmit` (no errors in your file).
2. Screenshot your scenes: `node scripts/explain-shot.mjs <lessonId> <outDir> 4177` — a development server is already running on port 4177 and picks up your file changes instantly (do NOT run `npm run build` or start servers). Use your own `<outDir>` in the scratchpad. Read the PNGs (`<lesson>-s<n>-mid.png`, `-end.png`) and fix overlaps, clipped labels, empty areas, wrong positions. Iterate until every scene looks clean and clear.
   Several helpers work at the same time: if the page shows an error caused by ANOTHER helper's file, wait a little and retry; only fix your own files.

## Content rules
- Source of truth = the site lesson + book transcript given in your task. Never invent facts. The explainer explains what the lesson teaches, in the same terminology, nothing more.
- Teach by SHOWING the mechanism / method: e.g. food moving through the digestive organs, air entering lungs while the diaphragm moves, pulse counter rising during exercise, digits sliding one place left when ×10, a number line jump for rounding, factor pairs as rectangles/arrays, remainders as leftover counters, a timeline showing "every day" vs "now" for tenses.
- Structure: 1) hook / question from daily life → 2–5) build the idea step by step (one idea per scene) → last) summary scene that ties it together (often a simple equation/diagram) — optionally one "common mistake" scene (show the wrong way crossed out, then the right way).
- Narration `say`: Arabic, short, warm, feminine singular (لاحظي، انظري، تخيّلي). 12–30 words. One idea per scene. Science & math: Arabic-Indic digits as in the lessons. English lessons: `say` in simple English + `sayAr` (Arabic help); English words on stage in English with `ltr: true`.
- Stage text: only short labels (≤ 4 words), numbers, equations. Never paragraphs.

## Layout rules (16:10 stage, x 0–100 left→right, y 0–100 top→bottom)
- Keep everything inside x 8–92, y 12–92 (the scene title sits at the top centre, y ≈ 3–10: keep that area free).
- Labels with `box: true` are wide: a 3–4 word label at size 3.4 is ≈ 25–30% of the width, so keep its centre ≥ 16 from the edges. Prefer size 3–4 for labels, 5–7 for key numbers/results.
- Emoji `size` is % of stage width (8–14 typical, 20–30 for a hero object).
- Don't stack actors on top of each other unless intended; leave breathing space. Flows (`flow`) need open space along their path.
- Timing: things appear progressively (`in`) in the order the narration mentions them (first 0.5–6 s); give the child time to watch: scene `duration` 7–13 s (default is computed from the narration length).
- Use effects with purpose: `beat` for the heart, `pulse` to draw attention, `glow` for the final result, `shake` for a mistake, `float` for gentle life. Don't put loops on everything.
- Reuse the hand-drawn diagrams (`art`): body (highlight: brain, heart, kidneys, largeInt, liver, lungs, smallInt, stomach), heart (left/right sides), lungs (frame 0/1, highlight diaphragm/lungs/trachea), digestive, kidneys, brain (highlight cerebellum, hearing, movement, speech, stem, vision). Math drawings (`math`): numberLine, placeValue, grid, polygon, triangle, solid, array, ruler, thermometer, clock, cards, hundredSquare — see `MathVisual` in `src/data/types.ts`.
- Backgrounds: body (science body), lab, sky, garden, sea, board (green chalkboard for math), paper (lined paper for English/math), night, desert, city.
- Colours: 'accent' | 'good' | 'bad' | 'ink' | 'sun' | 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'white' | 'grey'.
- On the `board` background use white/sun/green text colours.

Reply with: file(s), lessons covered, scene count per lesson, and anything you were unsure about.
