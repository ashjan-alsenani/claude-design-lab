# SigmaVerse content brief (for content authors)

SigmaVerse is an interactive academy for the **Define Phase** of the PeopleCert IASSC Lean Six Sigma Green Belt exam. The learner is an English-speaking professional in telecommunications and service operations who wants deep understanding, maths fluency and exam-trap awareness. All content must be **English only**.

The content contract is `src/data/types.ts`. Read it fully before writing. Every file you write must type-check against it.

## Non-negotiable writing rules

1. **English only.** No Arabic or other languages (Japanese 5S terms such as *Seiri* may appear as terminology).
2. **No em dash (U+2014) or en dash (U+2013) characters anywhere.** Use commas, colons, parentheses, or two sentences. Ranges use a plain hyphen: `2018-2026`. Check with `grep -n $'—\|–' yourfile.ts` before finishing.
3. **Original wording.** Paraphrase and explain. Never copy more than a short phrase from the supplied book. Do not invent citations: only cite pages listed in the source map below (or pages you have actually verified in the extracted text).
4. **Technically accurate and exam-focused.** When sources disagree or terms vary between programs, say so explicitly and say what the IASSC syllabus uses.
5. **Teaching voice:** an excellent, warm, precise tutor. Analogies, short stories, realistic scenarios. Avoid filler, hype words ("unleash", "seamless", "revolutionize") and repetition. Prefer concrete numbers with organic values (e.g. 4,382 tickets, 7.6% abandonment), not round fake-perfect ones, except where round numbers make arithmetic teachable.
6. **Examples:** use telecommunications, incident management, SLA performance, technical support, customer service, service operations and invoice processing frequently; manufacturing and healthcare where useful. Invent realistic organisation names (e.g. "Northwind Fibre", "Kestrel Mobile", "Halden Health"); avoid "Acme", "John Doe", "Jane Doe".
7. **Supplementary labelling:** when a lesson section explains material that is not in the supplied sources, keep it, but the lesson `status` and `sources` must be honest (see the coverage matrix in `src/data/sources.ts`). Use a `callout` with `tone: 'supplementary'` when you add content outside the Define syllabus (e.g. Takt Time, Lead Time, ROI formulas) so the learner knows it is supporting context.
8. Escape backslashes in TeX inside TypeScript strings: `'$DPMO = \\frac{D}{U \\times O} \\times 10^6$'`. Prefer single-quoted strings; escape apostrophes or use template literals / double quotes when the text contains `'`.

## Inline markup in `Rich` strings

`**bold**`, `*italic*`, `` `code` ``, `$inline TeX$`, and glossary links `[[Term]]` or `[[Term|display text]]`. Glossary links must use a term (or alias) from the canonical list below. Link a term the first time it appears in a lesson, not every time.

## Canonical glossary terms (use these exact spellings in [[links]])

Six Sigma, Sigma Level, Standard Deviation, Variation, Defect, Defective, Unit, Opportunity, DPU, DPO, DPMO, Yield, First Time Yield, Rolled Throughput Yield, Final Yield, Rework, Scrap, Cycle Time, Lead Time, Takt Time, Throughput, DMAIC, Define Phase, Measure Phase, Analyze Phase, Improve Phase, Control Phase, Tollgate, Y = f(X), Output, Input, Critical X, Noise Input, Controllable Input, Root Cause, Voice of the Customer, Voice of the Business, Voice of the Employee, Voice of the Process, Internal Customer, External Customer, Stakeholder, Executive Sponsor, Champion, Master Black Belt, Black Belt, Green Belt, Yellow Belt, Process Owner, Finance Representative, Process, Supplier, Customer, SIPOC, Process Map, Process Boundary, Critical to Quality, CTQ Tree, Operational Definition, Specification Limits, KPI, Service Level Agreement, Cost of Quality, Cost of Poor Quality, Prevention Cost, Appraisal Cost, Internal Failure Cost, External Failure Cost, Hidden Factory, Pareto Chart, Pareto Principle, Cumulative Percentage, Vital Few, Business Case, Project Charter, Problem Statement, Goal Statement, SMART Goal, Project Scope, Baseline, Primary Metric, Secondary Metric, Entitlement, Leading Indicator, Lagging Indicator, Hard Savings, Soft Savings, Cost Avoidance, Return on Investment, Payback Period, Lean, Value, Value Added, Non-Value Added, Waste, Muda, Flow, Pull, Kaizen, Continuous Improvement, Toyota Production System, Just-in-Time, Jidoka, Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance, Waiting, Non-Utilized Talent, 5S, Sort, Straighten, Shine, Standardize, Self-Discipline, Visual Management, Standard Work, Kanban, Poka-Yoke, RUMBA

## Lesson -> diagram -> lab mapping (use exactly these for `visual.diagram` and `activity.lab`)

| Lesson | visual.diagram | activity.lab |
|---|---|---|
| 1.1.1 | sigma-curve | dpmo |
| 1.1.2 | timeline | history |
| 1.1.3 | dmaic | dmaic |
| 1.1.4 | yfx | yfx |
| 1.1.5 | voices | voice |
| 1.1.6 | roles | roles |
| 1.2.1 | process | process |
| 1.2.2 | ctq-tree | ctq |
| 1.2.3 | copq-iceberg | copq |
| 1.2.4 | pareto | pareto |
| 1.2.5 | dpmo-flow | dpmo (also embed `{kind:'lab', lab:'rty'}` and `{kind:'lab', lab:'cycle'}` blocks inside the relevant sections) |
| 1.3.1 | charter | charter (also embed `{kind:'lab', lab:'smart'}` in the goal statement section) |
| 1.3.2 | metric-ladder | metrics |
| 1.3.3 | benefits | finance |
| 1.4.1 | lean-flow | value |
| 1.4.2 | lean-history | history |
| 1.4.3 | lean-vs-sigma | lean-sigma |
| 1.4.4 | wastes | waste |
| 1.4.5 | fives | fives |

You may also place `{kind:'diagram'}` blocks from the DiagramKey list inside sections where they help.

## Canonical facts (keep consistent across the academy)

- Six Sigma performance: 3.4 defects per million opportunities (DPMO) corresponds to a 6 sigma process **assuming the conventional 1.5 sigma long-term shift**; without the shift, 6 sigma would be about 0.002 DPMO (two-sided). Sigma table from the book (PDF 226): sigma 1 = 691,462 long-term DPMO, 2 = 308,538, 3 = 66,807, 4 = 6,210, 5 = 233, 6 = 3.4.
- History: Walter Shewhart (control charts, 1920s), W. Edwards Deming (PDSA, post-war Japan), Joseph Juran (quality trilogy; applied Pareto's idea to quality as "vital few, trivial many"; also "useful many"), Armand Feigenbaum (Total Quality Control, cost of quality categories, 1950s), Philip Crosby (zero defects, "Quality is Free", 1979), Kaoru Ishikawa (fishbone). Motorola: Bill Smith and Mikel Harry developed Six Sigma in the mid 1980s (1986), CEO Bob Galvin championed it; Motorola won the first Malcolm Baldrige National Quality Award in 1988. AlliedSignal under Larry Bossidy adopted it in the early 1990s; General Electric under Jack Welch from 1995-1996 made it famous. Lean: Henry Ford's moving assembly line (1913); Sakichi Toyoda's automatic loom that stopped on thread break (jidoka); Kiichiro Toyoda and Just-in-Time; Taiichi Ohno built the Toyota Production System (1950s onward) and identified the seven wastes; Shigeo Shingo (SMED, poka-yoke). John Krafcik coined "lean" (1988); Womack, Jones and Roos, *The Machine That Changed the World* (1990); Womack and Jones, *Lean Thinking* (1996) with five principles: value, value stream, flow, pull, perfection. "Lean Six Sigma" as a combined approach became common in the early 2000s (Michael George, 2002).
- DMAIC roadmap in the book (PDF 233 / 580): Define = identify problem area, determine project focus, estimate COPQ, establish team; Measure = assess stability, capability and measurement systems; Analyze = identify and prioritise all X's, prove or disprove their impact; Improve = identify, prioritise, select and implement solutions; Control = implement control plan, verify financial impact. Define deliverables: project charter (business case, problem statement, goal statement, scope, team, timeline), high-level process map / SIPOC (SIPOC detail is Measure 2.1.2 in this syllabus), VOC/CTQs, preliminary COPQ / financial estimate, stakeholder analysis, champion sign-off at the Define tollgate.
- Y = f(X): Y is the output (dependent), X's are inputs (independent). Book distinguishes Controllable (C), Procedural (P) and Noise (N) inputs (PDF 116). Root causes are **proven** in Analyze; in Define we only state the Y, frame the problem and list suspected X's at most.
- Voices: VOC = needs and expectations of the customer of the output (book glossary PDF 593); VOB = needs of the business (profit, revenue, growth, market share, compliance, cost); VOE = needs of employees (workload, tools, safety, training, morale) (supplementary in the supplied sources); VOP = what the process actually delivers (performance and capability). RUMBA: Reasonable, Understandable, Measurable, Believable, Achievable (PDF 115, 591).
- Roles: Executive Sponsor / leadership sets strategy and deploys Six Sigma; Champion selects and sponsors projects, removes barriers, owns results (glossary PDF 587); Master Black Belt is the technical expert who trains and coaches (PDF 589); Black Belt is a full-time leader of complex projects (PDF 587); Green Belt is part-time, leads smaller projects in their own area and supports Black Belt projects (PDF 589); Yellow Belt participates as a team member (PDF 593); Process Owner is accountable for the process and takes ownership of the solution in Control (PDF 591); Finance Representative validates hard and soft savings (PDF 588).
- Process (glossary PDF 590): a set of activities that transforms inputs into outputs to produce a product, provide a service or perform a task.
- CTQ (glossary PDF 588): a characteristic critical to perceived quality. CTQ tree: Need -> Drivers -> CTQs with measurable requirements (target and specification limits). Operational definition = precise description of what and how to measure so anyone gets the same result.
- COPQ (glossary PDF 587): cost of not doing the right thing right the first time. Cost of Quality has four categories: Prevention and Appraisal (costs of good quality / conformance) and Internal Failure and External Failure (costs of poor quality / nonconformance). Strictly, COPQ = internal + external failure costs; note that some programs present COPQ loosely as including all four. Internal failure = found before the customer (scrap, rework, re-inspection, downtime). External failure = found by or after reaching the customer (warranty, returns, complaints, SLA penalties, credits, lost customers). Hidden factory (PDF 589).
- Pareto (glossary PDF 590): Vilfredo Pareto (1848-1923); categories sorted in descending order, cumulative percentage line on a second axis from 0-100%; "Other" bar placed last; the 80:20 split is a heuristic, not a law.
- Metrics (glossary PDF 588, 590, 591; RTY multiplication PDF 108):
  - Defect: any non-conformance to a requirement. Defective: a unit with **at least one** defect. A unit can contain several defects but is counted as only one defective.
  - DPU = total defects / total units. DPO = total defects / (units x opportunities per unit). DPMO = DPO x 1,000,000.
  - FTY (first time yield, first pass yield) = units that pass a step the first time with no rework or scrap / units entering that step. Final (traditional) yield counts reworked units as good and therefore hides rework.
  - RTY = product of the FTYs of every step (never the sum or average). Supplementary: RTY can be approximated as $e^{-DPU}$ when defects follow a Poisson distribution.
  - Cycle time (glossary PDF 588): total elapsed time from when a task, product or service starts until it is completed. Note the alternative Lean usage (average time between completions of successive units, i.e. available time / units produced) and compare with Takt time = available production time / customer demand (supplementary) and Lead time = total time from customer request to delivery, including waiting (supplementary; Little's Law: lead time = WIP / throughput).
- Charter: problem statement describes what, where, when, how big, and the impact, with **no cause, no solution, no blame**. Goal statement is SMART and usually "reduce/increase [metric] from [baseline] to [target] by [date]". Scope: in scope / out of scope, process start and end boundaries.
- Metrics: primary metric (the Y the project improves, also called project Y), secondary / consequential metrics (guard against side effects, e.g. cost or quality must not worsen), baseline (current performance), entitlement (best demonstrated performance, glossary PDF 588), breakthrough (about 70% improvement over baseline in the book glossary PDF 587). Leading vs lagging indicators: supplementary.
- Finance: hard savings = verifiable reductions that hit the profit and loss statement (lower spend, lower headcount cost, reduced scrap purchased); soft savings = productivity, capacity freed, cost avoidance, intangible benefits. Cost avoidance = preventing a future cost that is not in the current budget. Estimated benefits are projected in Define; realized benefits are measured after implementation and verified by Finance in Control (book PDF 567, 580-581). Supplementary formulas: ROI % = (total benefit - total cost) / total cost x 100 (always state gross vs net); Payback period = investment / net savings per period (keep time units consistent); percentage improvement = (baseline - new) / baseline x 100 for a metric where lower is better.
- Lean: value is defined by the customer; value-added test (PDF 120): changes form, fit or function **and** the customer is willing to pay **and** it is done right the first time (the third criterion is common in other texts; the book uses the first two). Some NVA is required (regulatory, "business value-added").
- Seven elements of waste in the syllabus (exact names): Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance, Waiting. Common equivalents: Correction = Defects, Conveyance = Transportation, Overprocessing = Extra-processing. The syllabus introduction (p.3) also lists the eight-waste framework: Defects, Over-Production, Waiting, Non-Utilized Talent, Transportation, Inventory, Motion, Extra-Processing (DOWNTIME). Keep the two frameworks clearly distinct. Motion = movement of people (or equipment) within a workstation; Conveyance = moving materials, products or information between locations. Overproduction = producing more or earlier than needed; Overprocessing = doing more work than the customer requires.
- 5S (syllabus wording): Sort (Seiri), Straighten (Seiton), Shine (Seiso), Standardize (Seiketsu), Self-Discipline (Shitsuke). The book (PDF 507) uses Sorting, Straightening, Shining, Standardizing, Sustaining. Common alternative labels: Set in Order (Straighten), Sweep (Shine), Sustain (Self-Discipline). Some programs add Safety as a sixth S. 5S is introduced in Define and used as a Lean control in Control (5.1.1).

## Source map (only cite these)

Source ids: `syllabus`, `gb-101-200`, `gb-201-300`, `gb-501-600`, `supplementary`. See `src/data/sources.ts` `COVERAGE` for each lesson's pages. In `SourceRef.pdfPages` use page numbers **as the book's PDF numbering** (e.g. 505), and `printedPages` = pdfPages - 3. For the syllabus use `pdfPages` only (e.g. [7]). The Define chapter of the book itself (book pages 1-97) was NOT supplied: never claim it as a source.

Extracted text of the supplied PDFs is available for checking at:
`/tmp/claude-0/-home-user-claude-design-lab/8d1b1022-87fb-54c4-98a3-bce145f3ee61/scratchpad/txt/`
Print specific book PDF pages with:
`cd /tmp/claude-0/-home-user-claude-design-lab/8d1b1022-87fb-54c4-98a3-bce145f3ee61/scratchpad && python3 -I pg.py 505-507`

## Question rules

- Four plausible options; exactly one defensible best answer. No "All of the above" / "None of the above".
- Distribute correct answer positions roughly evenly across 0-3.
- `explanation` teaches; `optionNotes` explains every option (why right / why wrong).
- Use `optionMistakes` on wrong options that reveal a known misconception (see `MistakeTag`).
- Tag `traps` when the stem uses trap wording (NOT, EXCEPT, BEST, FIRST, PRIMARY, per opportunity, first pass, etc.).
- Mix difficulties: roughly 25% beginner, 35% intermediate, 25% advanced, 15% trap/master.
- Mix categories (definition, concept, scenario, best-tool, incorrect-statement, compare, dmaic-boundary, wording...).
- Numeric questions: set `numeric: true`, verify every number with `node -e` before writing it, make each distractor a specific, realistic mistake (forgot opportunities, used defectives, added yields, forgot x 1,000,000, mixed time units...). State rounding expectations in the stem.
- All questions are original practice items. Never claim they are official or real exam questions.

## File conventions

- Lessons: `src/data/lessons/L1-1-1.ts` ... `export const lesson: Lesson = {...}` with `import type { Lesson } from '../types'`.
- Questions: the file named in your task, `export const questions: Question[] = [...]` with `import type { Question } from '../types'`.
- Question ids: `q-<lessonId>-NN` (e.g. `q-1.2.5-07`), numeric bank `q-num-NN`, trap bank `q-trap-NN`.
- Type-check only your files, e.g.:
  `cd /home/user/claude-design-lab/sigmaverse && npx tsc --noEmit --strict --skipLibCheck --target es2022 --module esnext --moduleResolution bundler --allowImportingTsExtensions src/data/lessons/L1-1-1.ts`
- Do not edit any other files. Do not run git commands.
