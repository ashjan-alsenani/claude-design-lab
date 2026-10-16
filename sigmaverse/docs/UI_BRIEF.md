# SigmaVerse UI brief (for frontend contributors)

App: React 19 + TypeScript + Vite + Tailwind CSS v4 + `motion/react` (Framer Motion) + lucide-react + KaTeX, in `/home/user/claude-design-lab/sigmaverse`. English only. **No em dash or en dash characters** in any visible text (use commas, colons, hyphens).

Read before writing code:
- `src/styles/index.css` (design tokens and component classes)
- `src/components/ui.tsx`, `src/components/Rich.tsx`, `src/components/Math.tsx`
- `src/labs/kit.tsx` (LabShell, KnowledgeCheck, ClassifierGame, NumberField, Slider, Feedback)
- `src/lib/metrics.ts` (verified formula functions: always use these, never re-implement formulas)
- `src/lib/store.ts` (recordLab, update, useProfile), `src/lib/motion.ts` (useReduced, useDur)
- `src/diagrams/Diagram.tsx` (diagram frame and the DiagramView contract)
- `src/data/types.ts`, and the relevant lesson file in `src/data/lessons/` so your diagram or lab matches what the lesson teaches.

## Visual language

- Colour tokens are CSS variables exposed as Tailwind colours: `bg-surface`, `bg-surface-2`, `bg-surface-3`, `text-ink`, `text-ink-2`, `text-ink-3`, `border-line`, `border-line-2`, and accents `violet`, `teal`, `coral`, `amber`, `sky`, `indigo`, `good`, `bad`, each with a `-soft` tint (e.g. `bg-teal-soft text-teal`). In SVG use `var(--teal)`, `var(--ink-2)`, `var(--surface-2)`, `var(--line)` etc so dark mode works automatically. Never hardcode hex colours in SVG except white text on a filled accent shape (prefer `var(--surface)` there too).
- Module tones: Module 1 violet, Module 2 teal, Module 3 coral, Module 4 amber. Use colour to carry meaning (good = pass/first-time-right, bad = defect/fail, amber = rework/warning).
- Classes: `btn btn-primary`, `btn btn-soft`, `btn btn-ghost`, `btn-sm`, `btn-icon`, `panel`, `field`, `label`, `chip`, `tabular` (tabular numbers). Fonts: `font-display` (Bricolage Grotesque) for headings and big numbers, default sans (Figtree) for UI, `font-mono` only for data or formulas.
- Corner radius scale: inner elements `rounded-xl`, cards `rounded-2xl`, framed modules `rounded-3xl`. Shadows `shadow-sm`/`shadow-md` only.
- Do NOT use: gradient text, glow effects, emoji, eyebrow labels (small uppercase tracking labels above headings), decorative status dots, nested cards, `border-left` accent stripes.
- Icons only from `lucide-react`.

## Motion rules

- Use `motion/react` (`import { motion, AnimatePresence } from 'motion/react'`). Ease `[0.23, 1, 0.32, 1]`, UI transitions 150-300 ms, explanatory animations up to ~900 ms.
- Animate transform, opacity, SVG path length (`pathLength`), `d` interpolation, and positions. Never animate from `scale: 0`; start from `scale: 0.9, opacity: 0`.
- The app sets `<MotionConfig reducedMotion>` globally, so motion components respect reduced motion automatically. For custom timers (setInterval/setTimeout driven simulations) call `useReduced()` from `src/lib/motion.ts` and jump straight to the final state when it is true; use `useDur()` to scale durations by the learner's speed setting.
- Animations must explain something (a value changing, a unit moving, a sort happening). No idle decoration loops.

## Responsiveness and accessibility

- Must work from 360 px wide to desktop. No horizontal page overflow: SVGs use `viewBox` with `className="h-auto w-full"`; wide tables go in `overflow-x-auto`.
- All controls are real `<button>`/`<input>` elements with labels or `aria-label`. Keyboard operable. Visible focus is global.
- Every SVG diagram gets `role="img"` and an `aria-label` describing the current state.
- Text inside SVG: minimum font size 12 in viewBox units at a 720 px wide viewBox (scale accordingly); use `fill="var(--ink)"` or `var(--ink-2)` and `fontFamily="var(--font-sans)"`.

## Honesty rules

- No fake buttons or decorative controls. Every control does something real.
- Numbers shown must be computed by `src/lib/metrics.ts` functions from the current inputs.
- Where a model is illustrative (e.g. Y = f(X) explorer), say so in the UI.
- Supplementary concepts (takt time, lead time, ROI, payback) must be labelled "Supplementary" in the UI.

## Type-checking your files

`cd /home/user/claude-design-lab/sigmaverse && npx tsc -p tsconfig.json --noEmit 2>&1 | grep -E "^src/(diagrams|labs)/(<your files>)"`
(Other files may still be in progress; only fix errors in your own files.) Do not edit files you were not assigned, and do not run git.
