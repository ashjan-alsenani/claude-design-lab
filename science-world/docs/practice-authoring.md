# Practice & Master — question authoring guide (shared by all helpers)

You write practice questions for «تدرّب واختبر نفسك», a mastery-practice section of a children's learning website
(Grade 6, Oman, Semester 1) for a girl called Aleen. App: `/home/user/claude-design-lab/science-world` (React + TS).

## 1. Read first
- `src/practice/types.ts` — THE schema (PracticeQuestion union, BankFile, Concept, Passage). Read it fully.
- `src/data/types.ts` — `Visual` (emoji / art / math / highlight) and `MathVisual`.
- The unit's lessons in the site (your source of truth for what is taught, its terminology and its style) and the book transcript named in your task.
- `src/illustrations/registry.tsx` (art keys). Body diagrams and the regions they can highlight (`visual: {art, highlight, alt}`):
  body → brain, heart, kidneys, largeInt, liver, lungs, smallInt, stomach · heart → left, right · lungs → diaphragm, lungs, trachea · digestive → liver · kidneys → bladder, kidneys · brain → cerebellum, hearing, movement, speech, stem, vision.
  Math drawings (`visual: {math: {...}}`): numberLine, placeValue, grid, polygon, triangle, solid, array, ruler, thermometer, clock, cards, hundredSquare (see MathVisual).

## 2. Output
Write ONE JSON file (UTF-8, valid JSON, no comments): `src/data/practice/<subject>/<unitId>/<your-file>.json`
```json
{ "subject": "science", "unit": "u1", "concepts": [ ...only YOUR lessons' concepts... ], "passages": [ ... ], "questions": [ ... ] }
```
- Question ids: `<PREFIX>-<nnn>` with the prefix given in your task (unique across the site).
- Validate: `cd /home/user/claude-design-lab/science-world && node scripts/practice-index.mjs --report` → must print `practice banks OK`, and read your coverage report. Fix every error; remove near-duplicates it warns about.
- Big files: write the JSON in several steps if needed (e.g. build it with a small node/python script that you run), but the final file must be one valid JSON document.

## 3. Curriculum map first (in your head or a scratch file)
For each of your lessons list: key concepts, vocabulary, skills, common misconceptions, visual ideas, likely exam skills, real-life applications.
Then declare 4–8 concepts per lesson (`{id, label, lesson}`; label = short Arabic name for science/math, English label for English + `skill`).
Each concept needs at least 6 questions using at least 3 different question types/angles (mastery = several correct answers across different formats; the "similar question" button picks another question of the same concept).

## 4. Quality rules (most important)
- ONLY curriculum content: facts, terms, methods and contexts must come from the lessons/book. Never invent science facts. If unsure of an answer, don't write the question.
- Every answer must be certainly correct and unambiguous. Exactly one correct option in `choice`. Compute every number (use a quick python check for math).
- REAL variety. Questions on the same concept must differ in thinking, not just wording: direct recall, diagram, scenario, comparison, cause→effect, what-if, prediction, experiment/variables, table/graph reading, error analysis ("which student is correct?", "find the mistake"), application to daily life, classification, sequencing. Rewording the same question does NOT count.
- Difficulty mix per file ≈ 25% easy · 40% medium · 25% hard · 10% challenge. Cognitive levels spread across knowledge · understanding · application · analysis · reasoning (not mostly knowledge!).
- Use the question types the engine supports: choice (incl. picture choices with emoji options, fill-in with `sentence`), tf, multi (choose all correct), number, remainder, text, order, match, sort, writing. Use a healthy mix (choice ≤ ~50%).
- Distractors are realistic (typical child misconceptions), never silly.
- Feedback teaches:
  - `explanation`: WHY the correct answer is correct (what + why), 1–3 short sentences. Never "the answer is B".
  - `wrongWhy` (choice): for EVERY wrong option, one sentence on why it is wrong (what that option really is/does). For tf: `wrongWhy` explaining the misconception.
  - `tip`: tiny memory rule (≤ 12 words), e.g. «❤️ القلب = مضخة الجسم».
  - `hints`: 1–3 progressive hints that never give the answer.
  - `steps`: worked steps (required for math calculations/word problems; useful for science reasoning).
  - number/text `mistakes`: common wrong answers with a diagnosis of THAT mistake.
- Child-friendly, short. Feminine singular address in Arabic (اختاري، أجيبي، رتّبي، أنتِ). Short sentences.
- Do not copy book exercises or exam questions word for word: create NEW questions that test the same skills (new numbers, new contexts, new situations), staying inside the curriculum.
- Never put the answer in the prompt, hints or visual alt text.
- `keepOrder: true` when option order matters (number sizes, sequences, steps).

## 5. Subject specifics
### Science (Arabic)
Strongly visual and reasoning-based: use `visual` (art + highlight for "which organ is highlighted?", emoji scenes), `table` (experiment results), `chart` (bar/line data, e.g. pulse before/after exercise), and `style`: concept · diagram · data · experiment · scenario · cause · error. At least 35% of questions should be data/experiment/scenario/cause/error (not plain recall). Experiments: variables (what changed / what was measured / what stayed the same), fair test, predict, conclude, evidence. Use the book's inquiry skills.
Digits: write numbers in Arabic text with Arabic-Indic digits as the lessons do (e.g. ٧٢ نبضة); chart/table values may be numbers.

### Mathematics (Arabic)
Understand → think → calculate → show method → check. Every calculation/word problem has `steps` (one short line each, the method the book teaches) and, where common, `mistakes` (wrong answer + which error it reveals: place value, wrong rounding direction, forgotten remainder, decimal point, wrong operation…). Word problems (style `word`) get `understand: {know, want, op}` (Omani context: ريال عُماني، بيسة، مدرسة، رحلات، رياضة…). Use `remainder` for division with remainder, `column` for vertical written methods, `number` for typed answers (`answer` in Western digits like "54400" or "1.55"; prompt text in Arabic-Indic digits as the lessons do; decimal comma in Arabic text like the lessons: ٤,٥). Include: estimate-first, check-your-answer, known fact → related fact, "which solution is correct", "find the mistake" (style `error`), visual (number lines, place-value tables, arrays, hundred squares), sequences (find the rule, next term, missing term, wrong term). No calculator-type questions with huge numbers.

### English (English!)
Prompts, options, explanations in simple English; add `explanationAr` (short Arabic). Every question has `skill`. Distribute the file's questions ≈ vocabulary 25% · grammar 25% · reading 22% · listening 20% · writing 8% (writing = 1–2 guided `writing` tasks per file + short writing skills as text/order questions: build a sentence, correct a mistake, linking words, capital letters/punctuation).
- Listening: `audio` = a short original dialogue/description/announcement (1–4 sentences, Grade 6 level, the unit's topics and characters), read by the browser voice; the prompt asks about it; picture options with emoji where possible; `evidence` = the exact words in `audio` that give the answer (time words, numbers, places, activities, opinions). Do NOT put the answer words in the prompt.
- Vocabulary: picture→word (emoji options or emoji visual), word→meaning, missing letters (`text` + `pattern`, e.g. "c _ m e r a"), unscramble (`text` + `scrambled`), odd one out, word in context, match word↔picture.
- Grammar: only grammar taught in the unit (see the lessons). choose form, choose correct sentence, fix the mistake (`text` or choice), sentence order (`order` of words/chunks), complete the dialogue, correct question form. `tip` = mini rule card ("I / you / we / they → DO · he / she / it → DOES").
- Reading: 3–5 original passages per file in `passages` (80–160 words; emails, blog posts, interviews, stories, reviews about the unit's topics; may reuse book characters), with `glossary` for 2–4 harder words; questions with `passage` + `evidence` (exact substring) for every reading question: true/false, details, who/where/when/why, meaning from context, main idea, best title, sequence.
- Writing (`writing`): story from 3–4 emoji picture panels, or a review/interview/message as the unit teaches; `minWords` 40–60, `words`, `guide` (Who? Where? First? Next? End?), `starter`, `frame` (for reviews), `model` (a complete model answer at Grade 6 level reaching minWords).
- Spelling answers (`text`) are compared case-insensitively; add `accept` for valid variants (e.g. British/US spelling only if the book allows).

## 6. Working alongside other helpers
Several helpers write other files of the same banks at the same time. Build your file in your own scratch location and copy it into `src/data/practice/...` only when it is valid JSON (so you never leave a half-written file there). When validating, fix only errors in YOUR file; ignore errors reported for other files (they are still being written). Do not edit any other file in the repository.
Reply at the end with: file path, question count, difficulty/type/style (or skill) distribution, concepts, and anything you skipped because the answer was uncertain.
