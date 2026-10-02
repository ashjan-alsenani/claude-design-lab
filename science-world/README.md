# مغامرة التعلّم مع نوري 🤖 — العلوم والرياضيات

An interactive learning world for **Science and Mathematics, Grade 6, Term 1** (Ministry of Education, Oman / Cambridge), built from the two student books and made for Aleen Al Saidi.
All educational content comes from the book. The book's three units become a playable journey:

| Unit | World | Lessons |
|---|---|---|
| 1 جسم الإنسان | جزيرة الجسم العجيب | 1-1 … 1-7, «تحقّق من تقدّمك», final challenge |
| 2 الكائنات الحية في البيئة | غابة الكائنات الحية | 2-1 … 2-9, «تحقّق من تقدّمك», final challenge |
| 3 تغيّرات المادة | مختبر المادة السحري | 3-1 … 3-7, «تحقّق من تقدّمك», final challenge |

**Mathematics** (4 worlds, 35 lessons): الأعداد (1-1 … 4-3) · القياس (5-1 … 7-1) · الهندسة (8-1 … 10-3) · الأعداد والعمليات (11-1 … 16-1), each with a review quiz and a final challenge. Math adds typed answers on an on-screen keypad (Arabic-Indic digits) and parametric drawings (number lines, place-value tables, grids for area and transformations, polygons, triangles, 3D solids, rulers, clocks, thermometers).

## Run it
```bash
cd science-world
npm install
npm run dev      # development
npm run build    # production build in dist/ (static, works from any folder)
```

## What's inside
- **Learning journey map:** 3 islands. Every lesson unlocks the next one, then come the unit quiz and the final challenge.
- **Lesson player:** each lesson runs intro → short interactive steps → mini quiz → stars and reward → «ماذا تعلّمتُ؟».
  - It has 13 step types: reveal cards, diagram hotspots, step-by-step processes, flip cards, drag-and-drop sort (touch and tap-tap), matching, ordering and food chains, memory, data tables and bar charts, virtual experiments, «تحدّث عن!», and questions.
  - Question kinds: multiple choice, true/false, fill the word, and tap-all-correct.
- **Feedback:** gentle and explained. A wrong answer gets a hint and another try. After a few tries the answer is shown with the book's explanation.
- **Challenge Zone:** a 60-second challenge, pop the true bubbles, memory, «من أنا؟» riddles from the glossary, and a mixed review quiz. Challenges only use lessons the child has finished.
- **Games:** a review spin wheel, glossary flashcards (all 76 terms from the book), a replay box for past activities, and a searchable glossary.
- **Gamification:** stars, coins, challenge points, a learning streak, levels, 8 badges, 5 trophies, Nouri outfits and lesson stickers.
- **Progress:** overall ring, level, per-unit lessons, quiz scores, streak, accuracy and the next stop.
- **Sound:** optional synthesized effects, with an on/off button. No audio files.
- **Accessibility and layout:** Arabic RTL, large touch targets, keyboard focus styles and `prefers-reduced-motion`. Mobile-first, with a bottom tab bar on phones.

## Architecture
```
src/
  data/          types.ts (content schema) · subjects.ts · unit1–3.ts (science) · math/unit1–4.ts · glossary.ts · rewards.ts · learner.ts · assets.ts
  state/         model.ts · ProgressContext.tsx · storage.ts (swap for a server later) · journey.ts (unlock rules)
  activities/    QuestionCard, Discover (reveal/hotspot/process/flip/think), Play (sort/match/order/memory/data/experiment), StepView
  illustrations/ hand-drawn SVG diagrams (body, environment, matter) + math.tsx (parametric math drawings) + registry
  components/    Mascot, MascotMessage, Navigation, TopBar, LevelMap, LessonCard, QuizRunner, RewardScreen, AchievementPopup, ProgressBar…
  challenges/ games/ pages/ styles/
```
- **Adding a lesson:** add an object to a unit file. No new components are needed.
- **Adding a subject:** add an entry to `data/subjects.ts` with its units.
- **Accounts later:** implement `ProgressStorage` (in `state/storage.ts`) against an API and pass it to `<ProgressProvider storage={…}>`.

## Privacy and safety
- No ads, no external links, no chat, and no user-generated content.
- Progress is saved only in this browser (`localStorage`), and nothing is sent anywhere.
- The only network request is for Google Fonts. If it fails, the system fonts are used.

Optional AI illustrations are described in [ASSETS.md](ASSETS.md).
