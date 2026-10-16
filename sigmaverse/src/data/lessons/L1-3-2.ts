import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.3.2',
  module: 1,
  officialTitle: 'Developing Project Metrics',
  title: 'Developing Project Metrics',
  subtitle: 'Choosing, defining and baselining the numbers that prove a project worked',
  readingMinutes: 13,
  status: 'partial-source',
  objectives: [
    'Define a baseline and explain why a project cannot set a credible goal without one.',
    'Select a primary metric (project Y) and the secondary or consequential metrics that guard against side effects.',
    'Distinguish outcome from process metrics, financial metrics, and leading from lagging indicators.',
    'Write a complete metric definition: operational definition, unit, data source and frequency.',
    'Trace a project Y back to a customer CTQ, and use entitlement and breakthrough to judge how ambitious a target is.',
    'Calculate percentage improvement and gap closure correctly, including the difference between percent and percentage points.',
  ],
  overview: [
    'The book glossary defines a metric as a measure considered a key indicator of performance, linked to goals or objectives and carefully monitored. In a project, metrics are the contract\'s scoreboard: they tell the Champion whether the investment paid off and tell the team whether a change actually helped.',
    'This lesson builds a small "metric ladder": a customer need at the top, a CTQ beneath it, the project Y beneath that, and then the guardrail and early-warning measures that keep the improvement honest.',
  ],
  sections: [
    {
      id: 'baseline',
      title: 'Start with the baseline',
      blocks: [
        { kind: 'p', text: 'A [[Baseline]] is the current, measured performance of the metric before any change. It is the "from" in "reduce from X to Y". Without it, a goal is a wish, and after implementation nobody can prove improvement.' },
        { kind: 'list', items: [
          'Use enough history to show normal variation (often 3 to 12 months for service processes, more if there is seasonality).',
          'Use the **same operational definition** for baseline and after-data. Changing how a repeat call is counted halfway through invalidates the comparison.',
          'Record the baseline period and the data source in the charter so Finance and auditors can reproduce it.',
        ] },
        { kind: 'callout', tone: 'tip', title: 'Define first, refine in Measure', text: 'In Define you often work with a rough baseline from existing reports. In the [[Measure Phase]] the team validates the measurement system and may correct it. That is normal; update the charter with the Champion\'s agreement.' },
      ],
    },
    {
      id: 'primary-secondary',
      title: 'Primary and secondary metrics',
      blocks: [
        { kind: 'p', text: 'The [[Primary Metric]] is the project Y: the single measure the project exists to improve. It appears in the problem statement and the goal statement. The book lists "What is your primary metric?" and "What are your secondary metrics?" among the questions a Belt must be able to answer, and its X-Y matrix places primary and secondary metrics side by side as the outputs to weight.' },
        { kind: 'p', text: 'A [[Secondary Metric]] (also called a consequential or counter-balancing metric) watches for harm elsewhere. If a contact centre cuts average handle time, repeat calls or complaints might rise. If an invoice team speeds up approvals, payment errors might increase. Secondary metrics are not targets to improve; they are guardrails that must not worsen.' },
        { kind: 'table', caption: 'A metric set for Kestrel Mobile incident restoration', head: ['Role', 'Metric', 'Unit', 'Direction'], rows: [
          ['Primary (project Y)', 'P2 incidents restored within the 4-hour SLA', '% of incidents per month', 'Increase'],
          ['Secondary', 'Incidents reopened within 72 hours', '% of restored incidents', 'Must not rise'],
          ['Secondary', 'Engineer overtime hours', 'hours per month', 'Must not rise'],
          ['Financial', 'Service credits paid', '$ per month', 'Decrease'],
          ['Leading (process)', 'Incidents assigned to a resolver group within 10 minutes', '% of incidents', 'Increase'],
        ] },
      ],
    },
    {
      id: 'metric-types',
      title: 'Outcome, process, financial, leading and lagging',
      blocks: [
        { kind: 'p', text: '**Outcome metrics** describe what the customer or business receives (restoration within SLA, first contact resolution, invoice accuracy). **Process metrics** describe how the work is performed inside the process (time to assign, number of hand-offs, percentage of tickets with a complete fault code). Outcome metrics are usually the project Y; process metrics often become the X\'s you monitor and control. **Financial metrics** translate the outcome into money: service credits, cost per contact, overtime spend, [[Cost of Poor Quality]].' },
        { kind: 'callout', tone: 'supplementary', title: 'Leading and lagging indicators', text: 'This distinction is not in the supplied sources; it is widely used supporting context. A [[Lagging Indicator]] reports a result after the fact (monthly SLA attainment, churn). A [[Leading Indicator]] moves earlier and predicts the result (assignment within 10 minutes, open backlog older than 2 hours). Teams manage with leading indicators and report with lagging ones.' },
        { kind: 'p', text: 'Every metric needs a written definition so that two analysts get the same number from the same data:' },
        { kind: 'list', items: [
          '**[[Operational Definition]]:** exactly what counts. Example: "restored" means the customer-facing service passes the automated line test and the ticket status is Resolved; clock starts at ticket creation, stops at Resolved, excluding customer-requested holds.',
          '**Unit and scale:** %, minutes, $ per month, defects per 1,000 orders. Choose units that match the requirement (an SLA in hours is measured in hours, not days).',
          '**Data source:** the system and the field (for example, ticketing system, fields `created_at` and `resolved_at`).',
          '**Frequency and owner:** daily, weekly or monthly, and who produces it.',
        ] },
      ],
    },
    {
      id: 'ctq-entitlement',
      title: 'From CTQ to project Y, entitlement and breakthrough',
      blocks: [
        { kind: 'p', text: 'A good project Y traces back to the customer. The [[Voice of the Customer]] gives a need ("my broadband should be fixed quickly and stay fixed"); a [[Critical to Quality]] requirement makes it measurable ("fault resolved with no repeat visit within 30 days"); the project Y measures performance against that CTQ ("30-day repeat visit rate"). If you cannot draw that line, the metric may be convenient rather than important.' },
        { kind: 'p', text: '[[Entitlement]] is, in the book glossary, the best demonstrated performance of the existing process configuration: an empirical clue to what is achievable without redesign. If the NOC has already hit 93.6% SLA attainment in its best month, a target of 95% is a stretch, but not fantasy. **Breakthrough improvement** is described in the glossary as an improvement at or near 70% over baseline.' },
        { kind: 'formula', tex: '\\text{\\% improvement (lower is better)} = \\frac{\\text{baseline} - \\text{new}}{\\text{baseline}} \\times 100', caption: 'For a metric where higher is better, use (new - baseline) / baseline x 100.' },
        { kind: 'formula', tex: '\\text{gap closure \\%} = \\frac{\\text{new} - \\text{baseline}}{\\text{target} - \\text{baseline}} \\times 100', caption: 'How much of the planned gap has been closed. Works for either direction because the signs cancel.' },
        { kind: 'callout', tone: 'trap', title: 'Percent versus percentage points', text: 'Moving from 81.3% to 90.2% is an improvement of **8.9 percentage points**, which is a **10.9% relative** improvement. Exam options often mix the two.' },
        { kind: 'advanced', title: 'Setting targets with entitlement', blocks: [
          { kind: 'p', text: 'A common rule of thumb (supplementary, not from the supplied sources) is to set a first target that closes about half of the gap between baseline and entitlement or benchmark. For a baseline of 81.3% and entitlement of 93.6%, half the gap gives 81.3 + (93.6 - 81.3) / 2 = 87.45%, about 87.5%. Projects that need more than entitlement usually need process redesign rather than tuning.' },
        ] },
      ],
    },
  ],
  whyItMatters: [
    'Projects that fail at the Control tollgate usually fail on metrics: the after-data used a different definition, nobody watched a side effect, or the target was set without a baseline.',
    'In telecom and service operations, a single dashboard can show dozens of KPIs. Naming one primary metric and a few guardrails keeps the team focused and stops "improving" one number by quietly damaging another.',
  ],
  businessExample: {
    title: 'Northwind Fibre: the handle-time trap',
    industry: 'Broadband technical support',
    blocks: [
      { kind: 'p', text: 'Northwind Fibre\'s support team set a project to cut average handle time from 11.8 to 9.0 minutes. Within six weeks handle time hit 8.7 minutes and the team celebrated.' },
      { kind: 'p', text: 'Then Finance noticed contact volume had risen 14%. Agents were ending calls before the fault was confirmed fixed, so customers rang back. The repeat call rate climbed from 14.2% to 19.6%, and total agent minutes per fault actually increased.' },
      { kind: 'p', text: 'The project was rechartered with repeat call rate as the primary metric and handle time as a secondary metric that must not exceed 12 minutes. Six months later repeat calls were at 8.5%, a 40.1% improvement, and handle time had settled at 11.1 minutes.' },
    ],
  },
  visual: {
    diagram: 'metric-ladder',
    title: 'The metric ladder',
    caption: 'Customer need, CTQ, project Y (primary), guardrails (secondary), financial translation and the leading process measures that predict the result.',
  },
  definitions: [
    { term: 'Metric', definition: 'A measure considered a key indicator of performance, linked to goals or objectives and carefully monitored (book glossary, PDF 590).' },
    { term: 'Baseline', definition: 'Measured performance of the metric before any change, with its period and data source recorded.' },
    { term: 'Primary Metric', definition: 'The project Y: the single measure the project is chartered to improve, used in the problem and goal statements.' },
    { term: 'Secondary Metric', definition: 'A consequential or guardrail measure that must not worsen while the primary metric improves.' },
    { term: 'Entitlement', definition: 'The best demonstrated performance of the existing process configuration (book glossary, PDF 588).' },
    { term: 'Breakthrough Improvement', definition: 'An improvement at or near 70% over baseline performance (book glossary, PDF 587).' },
    { term: 'Operational Definition', definition: 'A precise description of what is measured and how, so that different people get the same result from the same data.' },
  ],
  comparisons: [
    {
      title: 'Kinds of project metric',
      head: ['Type', 'Answers', 'Telecom example', 'Typical use'],
      rows: [
        ['Primary (outcome)', 'Did the project achieve its goal?', '30-day repeat visit rate', 'Problem, goal, tollgate reviews'],
        ['Secondary (consequential)', 'Did we break something else?', 'Average visit duration', 'Guardrail, must not worsen'],
        ['Process', 'How is the work performed?', '% of jobs with a line test before closure', 'Candidate X, control plan'],
        ['Financial', 'What is it worth?', 'Cost of repeat visits per month', 'Business case, benefits capture'],
        ['Leading (supplementary)', 'What will happen?', 'Open faults older than 48 hours', 'Early warning'],
        ['Lagging (supplementary)', 'What happened?', 'Monthly customer churn', 'Reporting results'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'More metrics make a better project.', reality: 'One primary metric and a small number of secondary metrics work best. A dozen targets dilute focus and invite conflicting trade-offs.' },
    { myth: 'Secondary metrics are things we also want to improve.', reality: 'Their main job is protection: they must not get worse. Improvement in them is a bonus, not the goal.' },
    { myth: 'A 10-point rise from 80% to 90% is a 10% improvement.', reality: 'It is 10 percentage points, which is a 12.5% relative improvement. Always say which you mean.' },
    { myth: 'Entitlement is the theoretical perfect performance.', reality: 'In the book glossary it is the best demonstrated performance of the current process, an empirical, already-achieved level.' },
  ],
  examTraps: [
    { title: 'PRIMARY means the Y', text: 'When a question asks for the primary metric, choose the measure in the goal statement, not the cost figure or a process step measure.' },
    { title: 'Secondary is not "less important primary"', text: 'Look for words such as "must not worsen", "side effect", "consequential" or "guardrail".' },
    { title: 'Direction of the formula', text: 'For lower-is-better metrics, % improvement = (baseline - new) / baseline. Dividing by the new value gives a larger, wrong answer.' },
    { title: 'Same definition before and after', text: 'An improvement measured with a changed operational definition is not proof of improvement.' },
  ],
  workedExamples: [
    {
      title: 'Percentage improvement and breakthrough',
      scenario: 'Northwind Fibre\'s repeat call rate fell from a baseline of 14.2% to 8.5% after the project. Is this a breakthrough improvement in the book\'s sense?',
      steps: [
        'Lower is better, so use (baseline - new) / baseline x 100.',
        '(14.2 - 8.5) / 14.2 = 5.7 / 14.2 = 0.4014.',
        'Improvement = 40.1% (relative), or 5.7 percentage points.',
        'Breakthrough (about 70%) would need the rate to fall to about 14.2 x 0.30 = 4.26%.',
      ],
      answer: 'A 40.1% improvement: a solid result, but short of the roughly 70% breakthrough level, which would require a repeat call rate near 4.3%.',
    },
    {
      title: 'Gap closure on an SLA metric',
      scenario: 'Kestrel Mobile\'s P2 restoration within SLA had a baseline of 81.3%, a goal of 95.0% and an entitlement (best month) of 93.6%. Three months after the pilot, performance is 90.2%.',
      steps: [
        'Planned gap = target - baseline = 95.0 - 81.3 = 13.7 points.',
        'Gap closed = new - baseline = 90.2 - 81.3 = 8.9 points.',
        'Gap closure = 8.9 / 13.7 x 100 = 65.0%.',
        'Relative improvement = 8.9 / 81.3 x 100 = 10.9%.',
        'Note that 90.2% is still below entitlement (93.6%), so further gains are plausible without redesign.',
      ],
      answer: 'The team has closed 65.0% of the planned gap: an 8.9 percentage point gain, equal to a 10.9% relative improvement.',
    },
  ],
  activity: {
    lab: 'metrics',
    prompt: 'For an invoice-processing project at Halden Health, choose one primary metric, two secondary metrics and one leading indicator. Write an operational definition, unit, data source and frequency for the primary metric.',
  },
  checkQuestionIds: ['q-1.3.2-01', 'q-1.3.2-04', 'q-1.3.2-07'],
  takeaways: [
    'No baseline, no goal: record the baseline value, period and data source in the charter.',
    'The primary metric is the project Y; secondary metrics are guardrails that must not worsen.',
    'Outcome metrics show results, process metrics show how work is done, financial metrics translate results into money.',
    'Every metric needs an operational definition, unit, data source and frequency, used identically before and after.',
    'Trace the project Y back to a CTQ and the Voice of the Customer.',
    'Entitlement is best demonstrated performance; breakthrough is about 70% improvement over baseline (book glossary).',
    'Keep percent and percentage points separate when reporting improvement.',
  ],
  flashcards: [
    { front: 'Primary metric', back: 'The project Y that the goal statement targets.' },
    { front: 'Secondary metric', back: 'A consequential, guardrail measure that must not worsen while the primary improves.' },
    { front: 'Baseline', back: 'Current measured performance before change, with period and source recorded.' },
    { front: 'Entitlement (book glossary)', back: 'Best demonstrated performance for the existing process configuration.' },
    { front: 'Breakthrough improvement (book glossary)', back: 'Improvement at or near 70% over baseline.' },
    { front: '% improvement, lower is better', back: '(baseline - new) / baseline x 100' },
    { front: 'Gap closure', back: '(new - baseline) / (target - baseline) x 100' },
    { front: 'Leading vs lagging', back: 'Leading predicts the result early; lagging reports it after the fact (supplementary).' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.3.2 Developing Project Metrics in the Define syllabus.' },
    { source: 'gb-101-200', pdfPages: [123], printedPages: [120], note: 'Primary and secondary metrics entered as weighted outputs in the X-Y diagram.' },
    { source: 'gb-201-300', pdfPages: [234], printedPages: [231], note: 'Checklist questions asking for the primary and secondary metrics and the defect definition.' },
    { source: 'gb-501-600', pdfPages: [590], printedPages: [587], note: 'Glossary definition of Metric.' },
    { source: 'gb-501-600', pdfPages: [587, 588], printedPages: [584, 585], note: 'Glossary definitions of Breakthrough Improvement and Entitlement.' },
    { source: 'supplementary', note: 'Leading and lagging indicators, metric definition template, gap closure and target-setting guidance are original explanatory content.' },
  ],
}
