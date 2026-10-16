import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.3.3',
  module: 1,
  officialTitle: 'Financial Evaluation & Benefits Capture',
  title: 'Financial Evaluation and Benefits Capture',
  subtitle: 'Classifying, estimating and verifying the money a project is worth',
  readingMinutes: 14,
  status: 'partial-source',
  objectives: [
    'Classify project benefits as hard savings, soft savings, cost avoidance or revenue enhancement.',
    'Explain the difference between estimated benefits (Define) and realized, Finance-verified benefits (Control).',
    'List the one-off and ongoing costs to implement an improvement and net them against benefits.',
    'Separate one-off from recurring benefits and annualise recurring benefits correctly.',
    'Calculate ROI and payback period with consistent time units and a clear gross or net basis (supplementary formulas).',
  ],
  overview: [
    'A Lean Six Sigma project is a business investment, so it needs a financial story that holds up to scrutiny. In Define the team estimates the value to justify the project. In Control the [[Finance Representative]] checks what was actually achieved. The book\'s DMAIC roadmap ends Control with "verify financial impact", and its Control checklist asks whether the Champion, the Belt and Finance all agree the project is complete.',
    'The hardest part is not arithmetic. It is honest classification: deciding which benefits reduce real spending, which free capacity, which prevent future costs, and which are one-off windfalls that must not be multiplied by twelve.',
  ],
  sections: [
    {
      id: 'benefit-types',
      title: 'Types of financial benefit',
      blocks: [
        { kind: 'p', text: '[[Hard Savings]] are verifiable reductions in spending that show up on the profit and loss statement: fewer contractor visits invoiced, lower overtime paid, fewer service credits, less material bought. If the budget line goes down and stays down, it is hard.' },
        { kind: 'p', text: '[[Soft Savings]] are real but indirect: capacity freed (engineers spend 1,900 fewer hours on repeat visits), productivity gains, better customer satisfaction, lower risk. They become hard only if management converts them, for example by not backfilling a vacancy or by cancelling a contractor.' },
        { kind: 'p', text: '[[Cost Avoidance]] prevents a future cost that is not in the current budget, such as a planned hire of four extra dispatchers that is no longer needed. Many organisations report it separately because it does not reduce today\'s spend. **Revenue enhancement** is extra income: fewer customers churning, faster billing of new connections, recovered under-billing.' },
        { kind: 'table', caption: 'Classifying benefits at Northwind Fibre', head: ['Benefit', 'Classification', 'Why'], rows: [
          ['Contractor repeat visits fall by 2,180 a year at $118 each', 'Hard savings', 'Contractor invoices decrease; budget line falls'],
          ['In-house engineers gain 1,900 hours of capacity', 'Soft savings', 'No spend falls unless hours or headcount are reduced'],
          ['Planned extra dispatch team for 2027 no longer needed', 'Cost avoidance', 'Prevents a future cost not in the current budget'],
          ['Churn falls by 0.3 points among repaired customers', 'Revenue enhancement (retention)', 'Income kept; needs a Finance-agreed method'],
        ] },
        { kind: 'callout', tone: 'note', title: 'Terminology varies', text: 'Some organisations treat cost avoidance as a category of soft savings; others report it on its own line. The IASSC-style exam usually expects you to recognise that cost avoidance does **not** reduce current spending. Always follow your Finance team\'s rules.' },
      ],
    },
    {
      id: 'costs-and-net',
      title: 'Costs to implement, gross and net',
      blocks: [
        { kind: 'p', text: 'The book\'s Control chapter lists the cost considerations of an improvement in two groups: the **initial cost to implement** (training the existing workforce, new materials, the resources used to build the improvement, any capital investment) and the **ongoing cost to sustain** it (future training, inspection, monitoring and materials). Both belong in the financial evaluation.' },
        { kind: 'list', items: [
          '**Gross benefit:** total benefit before any costs are deducted.',
          '**Net benefit:** gross benefit minus implementation and ongoing costs for the same period.',
          '**One-off benefit:** happens once (recovered back-billing, a one-time stock write-back). Never annualise it.',
          '**Recurring benefit:** repeats every period (monthly penalty reduction). Annualise it, usually as monthly run rate x 12, after checking for seasonality.',
        ] },
        { kind: 'callout', tone: 'trap', title: 'Gross versus net', text: 'If a report says "the project saved $257,240" ask whether that is before or after the $72,100 of first-year costs. An ROI or payback figure is meaningless unless the basis is stated.' },
      ],
    },
    {
      id: 'roi-payback',
      title: 'ROI, payback and percentage improvement',
      blocks: [
        { kind: 'callout', tone: 'supplementary', title: 'Supplementary formulas', text: 'The ROI and payback formulas below are standard business finance, not present in the supplied source pages. Your organisation may use variants (discounted cash flow, NPV). Learn these simple forms for the exam and always state units and basis.' },
        { kind: 'formula', tex: 'ROI\\,\\% = \\frac{\\text{total benefit} - \\text{total cost}}{\\text{total cost}} \\times 100', caption: '[[Return on Investment]] on a net basis over a stated period.' },
        { kind: 'formula', tex: '\\text{Payback period} = \\frac{\\text{initial investment}}{\\text{net savings per period}}', caption: 'The [[Payback Period]] is in the same time unit as the savings: monthly savings give months; annual savings give years.' },
        { kind: 'formula', tex: '\\text{\\% improvement} = \\frac{\\text{baseline} - \\text{new}}{\\text{baseline}} \\times 100', caption: 'For a metric where lower is better.' },
        { kind: 'example', title: 'Quick check: payback units', blocks: [
          { kind: 'p', text: 'An invoice automation costs $48,000 and saves a net $6,000 per month. Payback = 48,000 / 6,000 = 8 **months**. Dividing by an annual figure ($72,000) gives 0.67 **years**, the same answer in different units. Mixing the two (48,000 / 6,000 reported as 8 years) is a classic error.' },
        ] },
      ],
    },
    {
      id: 'verification',
      title: 'Estimated versus realized benefits',
      blocks: [
        { kind: 'p', text: '**Estimated benefits** are projections made in Define, based on the baseline, the goal and assumptions. They justify the project and are revised as Measure and Analyze sharpen the picture. **Realized benefits** are measured after implementation, using actual data over an agreed period, and **verified by Finance** before the project closes. The book places "verified financial impact" among the elements of the Control Plan and lists untracked financial benefits as a Control roadblock.' },
        { kind: 'list', ordered: true, items: [
          'Agree the calculation method and data source with Finance in Define.',
          'Record the baseline and the assumptions (unit cost, volume, period).',
          'After implementation, collect actual data for an agreed period (often three to six months).',
          'Finance validates the numbers and their classification (hard, soft, avoidance, revenue).',
          'The Champion, the Belt and Finance sign off; the Process Owner keeps tracking.',
        ] },
        { kind: 'advanced', title: 'Why realized benefits often differ from estimates', blocks: [
          { kind: 'p', text: 'Volumes change, unit costs are renegotiated, implementation starts late so fewer months fall in the year, or part of the gain is absorbed as capacity rather than cash. A realized figure of 70-90% of the estimate is common and not a failure, provided it is honestly reported.' },
        ] },
      ],
    },
  ],
  whyItMatters: [
    'Leaders fund what they can see in the numbers. A credible, Finance-verified benefit builds trust in the whole improvement program; one inflated claim can undermine it for years.',
    'In service operations most gains first appear as freed capacity. Knowing whether that is hard or soft, and what it would take to convert it, is the difference between a project the CFO counts and one the CFO ignores.',
  ],
  businessExample: {
    title: 'Kestrel Mobile: one-off versus recurring',
    industry: 'Telecom billing and SLA management',
    blocks: [
      { kind: 'p', text: 'A Kestrel Mobile project fixed a provisioning defect that caused enterprise circuits to be billed late and triggered SLA penalties. The Define estimate was $190,000 a year in reduced penalties.' },
      { kind: 'p', text: 'After implementation, monthly penalties fell from $18,750 to $6,200 over three stable months, a recurring saving of $12,550 per month, or $150,600 annualised. The team also recovered $41,300 of previously unbilled charges.' },
      { kind: 'p', text: 'The first draft report claimed "$191,900 per year". Finance corrected it: the $41,300 is a one-off revenue recovery and is reported once; the verified recurring benefit is $150,600 a year, about 79% of the original estimate.' },
    ],
  },
  visual: {
    diagram: 'benefits',
    title: 'The benefits pipeline',
    caption: 'Estimate in Define, refine in Measure and Analyze, implement in Improve, then measure realized benefits and have Finance verify them in Control.',
  },
  definitions: [
    { term: 'Hard Savings', definition: 'Verifiable reductions in spending that appear on the profit and loss statement.' },
    { term: 'Soft Savings', definition: 'Indirect benefits such as freed capacity, productivity or reduced risk that do not by themselves reduce current spend.' },
    { term: 'Cost Avoidance', definition: 'Preventing a future cost that is not in the current budget.' },
    { term: 'Revenue Enhancement', definition: 'Additional or retained income resulting from the improvement, such as reduced churn or recovered billing.' },
    { term: 'Return on Investment', definition: '(Total benefit - total cost) / total cost x 100 over a stated period (supplementary formula).' },
    { term: 'Payback Period', definition: 'Initial investment / net savings per period; the time taken to recover the investment (supplementary formula).' },
    { term: 'Realized Benefit', definition: 'A benefit measured from actual post-implementation data and verified by Finance.' },
  ],
  comparisons: [
    {
      title: 'Estimated versus realized benefits',
      head: ['Feature', 'Estimated', 'Realized'],
      rows: [
        ['When', 'Define (refined through Analyze)', 'After implementation, confirmed in Control'],
        ['Based on', 'Baseline, goal and assumptions', 'Actual measured data'],
        ['Purpose', 'Justify and prioritise the project', 'Prove value and close the project'],
        ['Who confirms', 'Belt drafts, Champion accepts', 'Finance verifies, Champion signs off'],
        ['Exam cue', '"projected", "expected", "in the charter"', '"verified", "actual", "after implementation"'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'Freed-up staff hours are hard savings.', reality: 'They are soft savings unless spending actually falls, for example through reduced overtime, a contract cancelled or a vacancy not refilled.' },
    { myth: 'Cost avoidance is the same as cost reduction.', reality: 'Cost avoidance prevents a future cost that is not in the current budget; current spending does not fall.' },
    { myth: 'The benefit in the charter is the project\'s result.', reality: 'It is an estimate. Only benefits measured after implementation and verified by Finance count as realized.' },
    { myth: 'Every saving can be multiplied by 12.', reality: 'Only recurring benefits are annualised. One-off gains are reported once.' },
  ],
  examTraps: [
    { title: 'Estimated or realized?', text: 'Stems that mention Define or the charter refer to estimated benefits; stems that mention Control, verification or Finance sign-off refer to realized benefits.' },
    { title: 'Gross versus net ROI', text: 'If an option divides total benefit by total cost without subtracting cost first, it gives benefit-to-cost ratio, not ROI.' },
    { title: 'Mixed time units', text: 'Monthly savings into an annual investment gives months, not years. Check units before choosing.' },
    { title: 'Who validates?', text: 'The Finance Representative provides independent evaluation of hard and soft savings, not the Belt who led the project.' },
  ],
  workedExamples: [
    {
      title: 'ROI and payback for the repeat-visit project',
      scenario: 'Northwind Fibre avoided 2,180 contractor repeat visits a year at $118 each. One-off costs: engineer training $38,500 and diagnostic tool licences $24,000. Ongoing cost: $9,600 a year for tool support. Calculate first-year net ROI and payback in months.',
      steps: [
        'Gross annual benefit = 2,180 x $118 = $257,240.',
        'One-off investment = $38,500 + $24,000 = $62,500.',
        'First-year total cost = $62,500 + $9,600 = $72,100.',
        'First-year net ROI = (257,240 - 72,100) / 72,100 x 100 = 185,140 / 72,100 x 100 = 256.8%.',
        'Net annual savings = 257,240 - 9,600 = $247,640; payback = 62,500 / 247,640 = 0.252 years.',
        'Convert: 0.252 x 12 = 3.0 months.',
      ],
      answer: 'First-year net ROI is about 256.8%, and the one-off investment is paid back in about 3.0 months.',
    },
    {
      title: 'Annualising and verifying',
      scenario: 'Kestrel Mobile penalties fell from $18,750 to $6,200 per month over three stable months; $41,300 of unbilled charges were recovered once. The Define estimate was $190,000 a year.',
      steps: [
        'Recurring monthly saving = 18,750 - 6,200 = $12,550.',
        'Annualised recurring benefit = 12,550 x 12 = $150,600.',
        'The $41,300 recovery is one-off: report it separately, do not add it to the annual run rate.',
        'Realized vs estimate = 150,600 / 190,000 = 79.3%.',
      ],
      answer: 'Verified recurring benefit $150,600 a year (79.3% of the estimate), plus a separate one-off revenue recovery of $41,300.',
    },
  ],
  activity: {
    lab: 'finance',
    prompt: 'Enter the costs and benefits for a Halden Health invoice-processing project. Classify each benefit, separate one-off from recurring, then compare gross and net ROI and payback.',
  },
  checkQuestionIds: ['q-1.3.3-01', 'q-1.3.3-04', 'q-1.3.3-08'],
  takeaways: [
    'Hard savings reduce actual spend on the P&L; soft savings free capacity or reduce risk without cutting spend.',
    'Cost avoidance prevents a future cost that is not yet in the budget.',
    'Costs include initial implementation and ongoing sustainment; always state gross or net.',
    'Annualise recurring benefits only; report one-off benefits once.',
    'Estimated benefits justify the project in Define; realized benefits are verified by Finance in Control.',
    'ROI and payback formulas are supplementary: keep time units consistent and state the basis.',
  ],
  flashcards: [
    { front: 'Hard savings', back: 'Verifiable spending reductions that hit the P&L.' },
    { front: 'Soft savings', back: 'Freed capacity, productivity or risk reduction without a fall in current spend.' },
    { front: 'Cost avoidance', back: 'Preventing a future cost not in the current budget.' },
    { front: 'ROI (net)', back: '(Total benefit - total cost) / total cost x 100, over a stated period.' },
    { front: 'Payback period', back: 'Initial investment / net savings per period, in the same time unit.' },
    { front: 'Who verifies benefits?', back: 'The Finance Representative, before Champion sign-off in Control.' },
    { front: 'One-off vs recurring', back: 'Only recurring benefits are annualised; one-off benefits are reported once.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.3.3 Financial Evaluation & Benefits Capture in the Define syllabus.' },
    { source: 'gb-501-600', pdfPages: [561], printedPages: [558], note: 'Initial and ongoing costs to implement and sustain an improvement.' },
    { source: 'gb-501-600', pdfPages: [567], printedPages: [564], note: 'Verified financial impact as an outcome of the Control Plan.' },
    { source: 'gb-501-600', pdfPages: [580, 581], printedPages: [577, 578], note: 'DMAIC roadmap ending with verify financial impact; Champion, Belt and Finance agreement to close.' },
    { source: 'gb-501-600', pdfPages: [588], printedPages: [585], note: 'Finance Representative provides independent evaluation of hard and soft savings.' },
    { source: 'supplementary', note: 'Benefit categories, ROI, payback, annualisation and gross versus net explanations are original supplementary content.' },
  ],
}
