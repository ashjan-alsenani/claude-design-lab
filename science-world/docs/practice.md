# Practice & Master («تدرّب واختبر نفسك»)

A practice, feedback and mastery system on top of the lessons. Routes: `/practice` → subject → unit → session; `/practice/mistakes` (أخطائي + كلماتي); `/practice/words`.

## Flow of every question
question → think → optional hints (💡, progressive) / math step-by-step / «ساعديني أفهم السؤال» / scratchpad → answer (locked)
→ feedback: your answer (red) vs correct (green), why yours is wrong (option- or mistake-specific diagnosis), why the right answer is right,
worked steps, reading evidence highlighted in the passage, listening transcript with the key words, 💡 memory tip, «اشرحيها لي بالعربي» (English)
→ «جرّبي سؤالًا مشابهًا» (same concept, different question, preferably another format) or next → results (accuracy, concepts mastered / to review, English skill stars, full answer review).

## Architecture
- `src/practice/types.ts` question schema (choice, tf, multi, number, remainder, text, order, match, sort, writing + metadata: lesson, concept, skill, style, difficulty, cognitive, hints, steps, wrongWhy, mistakes, evidence, audio, passage…).
- `src/data/practice/<subject>/<unit>/*.json` question banks (data only). Each unit is its own lazily-loaded chunk (see `vite.config.ts`).
- `scripts/practice-index.mjs` validates every bank (answers, ids, concepts, evidence, patterns, duplicates…) and writes `src/data/practice/index.json`. Runs automatically before every build (`npm run build`); `npm run practice` prints a coverage report.
- `src/practice/bank.ts` loader · `check.ts` answer checking & diagnosis · `session.ts` modes, selection and «similar question» · `store.tsx` attempts, concept mastery, sessions, «كلماتي» (localStorage behind a `PracticeStorage` interface, ready for a database).
- `src/practice/components/` QuestionView + one input per type (tap-based, touch friendly), FeedbackPanel, SessionRunner, guided Writing, Pronounce (browser speech recognition, if available), Parts (passages with tap glossary, audio player using the browser voice, SVG charts, tables, vertical calculations, scratchpad).

## Mastery
A concept is mastered after ≥ 3 correct answers to different questions (ideally different formats) with the latest answer correct; recent mistakes and heavy hint use lower it again. Unit mastery = average of its concepts.

## Modes
All subjects: quick (10), unit (20, every lesson, easy → hard), challenge, random, my mistakes (NEW questions on the same concepts), weak points, mastered review, exam (training with feedback / simulation with feedback at the end), concept practice, custom filters (lesson, difficulty, type, status).
Science: graphs & tables, experiments, concepts, real life. Math: understand, solve, thinking problems, real-life problems, visual, find the mistake. English: Listening, Vocabulary, Grammar, Reading, Writing, English Mission (4 vocab · 5 grammar · 4 listening · 5 reading · writing), exam (listening · grammar & vocabulary · reading · writing).

## Coverage (template units)
| Unit | Questions | Concepts | easy / medium / hard / challenge |
|---|---|---|---|
| Science u1 جسم الإنسان (lessons 1-1 … 1-7) | 318 | 45 | 23 / 43 / 24 / 9 % |
| Math m1 الأعداد (1-1 … 4-3) | 341 | 50 | 24 / 40 / 25 / 10 % |
| English e1 Free-time fun (1-1 … 1-10) | 316 | 46 | 26 / 40 / 25 / 9 % |

## Adding the next unit
Follow `docs/practice-authoring.md`: map the unit's concepts first, write one JSON file per group of lessons into `src/data/practice/<subject>/<unit>/`, run `npm run practice`, fix every error. The unit appears automatically.
The reference exam papers (Grade 6, Semester 1) should be used to calibrate style and difficulty once available; questions must never copy them word for word.
