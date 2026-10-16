import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.1.4',
  module: 1,
  officialTitle: 'The Problem Solving Strategy Y = f(x)',
  title: 'The Problem Solving Strategy Y = f(X)',
  subtitle: 'Outputs depend on inputs: find the few inputs that really drive the result, then prove it',
  readingMinutes: 14,
  status: 'partial-source',
  objectives: [
    'Explain Y as the dependent output and X as the independent inputs of a process.',
    'Classify process inputs as controllable, procedural or noise and give a service example of each.',
    'Distinguish a suspected cause (potential X) from a proven root cause (critical X).',
    'Describe what belongs in the Define Phase and what must wait for Measure and Analyze.',
    'Trace how DMAIC narrows many candidate X\'s down to the vital few.',
    'Read the expression Y = f(X1, X2, ... Xn) + error and explain what the error term represents.',
  ],
  overview: [
    "Every Lean Six Sigma project rests on one idea: the result you care about is produced by a [[Process]], and that result is a function of what goes into the process and how the work is done. Written as [[Y = f(X)]], the **Y** is the [[Output]] (the dependent variable, the effect) and the **X's** are the [[Input|inputs]] and process conditions (the independent variables, the possible causes). If you want a better Y, you cannot order the Y to improve. You must find and manage the X's that drive it.",
    "This sounds obvious, yet most failed improvement efforts break the rule. A team sets a target on the output ('cut restore time by 20%'), pushes people harder, and changes nothing about the inputs. Y = f(X) is the discipline that redirects attention from the scoreboard to the levers. In this lesson you will meet the three types of input the supplied book describes, learn why a suspected cause is not yet a [[Root Cause]], and see how each DMAIC phase narrows a long list of possible X's to the vital few.",
  ],
  sections: [
    {
      id: 'outputs-and-inputs',
      title: 'Y is the effect, X is the cause',
      blocks: [
        { kind: 'p', text: "The book glossary defines **Y** as an output characteristic of a process and **X** as an input characteristic, linked by the expression Y = f(X): the output is a function of the inputs. In statistical language Y is the **dependent variable** because its value depends on the others, and each X is an **independent variable** because we can change it, or it changes on its own, and Y responds." },
        { kind: 'p', text: "Think of a network operations centre. The Y might be **mean time to restore (MTTR)** for priority incidents, measured in hours from alarm to service restored. Candidate X's include how well alarms are correlated into a single incident, the skill of the engineer assigned, whether the right spare part is in the regional depot, the quality of the shift handover, travel distance to the site and the weather on the day." },
        { kind: 'table', caption: 'Y and X at a glance', head: ['Aspect', 'Y (output)', 'X (input)'], rows: [
          ['Role in the equation', 'Dependent variable, the effect', 'Independent variable, a possible cause'],
          ['Typical number per project', 'One primary Y', 'Many candidates, a vital few matter'],
          ['Telecom example', 'MTTR in hours', 'Spare-part availability, engineer skill'],
          ['How you improve it', 'Indirectly, by changing X\'s', 'Directly, by control, procedure or design'],
        ] },
        { kind: 'callout', tone: 'tip', title: 'One Y at a time', text: "The book advises working on the performance of only one process output at a time. A single Y keeps the search for X's manageable, and the groundwork you lay makes the second Y faster later." },
      ],
    },
    {
      id: 'types-of-input',
      title: 'Controllable, procedural and noise inputs',
      blocks: [
        { kind: 'p', text: "Not every X can be managed in the same way. The supplied book (PDF 116) sorts inputs into three types, and marks each input on its supplier input form with a letter:" },
        { kind: 'list', items: [
          "**Controllable (C)**: inputs you can adjust while the process runs. In the NOC: the alarm correlation rule set, the dispatch priority, the number of engineers on shift. See [[Controllable Input]].",
          "**Procedural (P)**: inputs delivered through a standardised set of activities that make a step ready, such as a shift handover checklist, a fixed fault-logging form or a spare-part reservation procedure.",
          "**Noise (N)**: inputs you believe you cannot control, do not know about, or find too costly to control, such as storm damage, road traffic, or the individual differences between callers. See [[Noise Input]].",
        ] },
        { kind: 'p', text: "Two subtleties matter for the exam. First, even a controllable input is never perfectly controlled: it still varies within its natural limits. Second, the label reflects a decision, not a law of nature. Weather is noise for a field team, but a planner who pre-positions spares before forecast storms has turned part of that noise into something managed. The book also notes (PDF 117) that if an input turns out to be a [[Critical X]], you must control it, which means it needs requirements and a measurement." },
        { kind: 'callout', tone: 'note', title: 'Terminology varies', text: "Many programs teach only two categories, controllable and noise (uncontrollable), and fold procedures into controllable inputs. The supplied book uses C, P and N. If an exam item offers only two categories, treat a standard procedure as controllable." },
      ],
    },
    {
      id: 'funnel',
      title: 'From many X\'s to the vital few',
      blocks: [
        { kind: 'p', text: "DMAIC can be pictured as a funnel. A team typically starts with dozens of candidate X's and ends with a handful that are proven to drive the Y. Each phase narrows the list in a different way:" },
        { kind: 'list', ordered: true, items: [
          "**Define**: name the Y, frame the problem and its impact. At most, record suspected X's as ideas.",
          "**Measure**: map the process, list every input (SIPOC, process maps), check the measurement system and collect baseline data on Y and on the likely X's.",
          "**Analyze**: test the candidates with data and prove or disprove their effect. Survivors are the critical X's, the [[Vital Few]].",
          "**Improve**: change the critical X's and confirm that Y moves as predicted.",
          "**Control**: hold the critical X's at their new settings so the gain lasts.",
        ] },
        { kind: 'diagram', diagram: 'yfx', caption: 'Many candidate inputs feed the process; only a vital few survive Analyze as critical X\'s.' },
        { kind: 'callout', tone: 'trap', title: 'Suspected is not proven', text: "A brainstormed cause is a **potential X**. It becomes a proven root cause only after data in Analyze shows a real effect on Y. An exam option that says the team 'identified the root cause' during Define is almost always wrong." },
      ],
    },
    {
      id: 'define-boundary',
      title: 'What belongs in Define',
      blocks: [
        { kind: 'p', text: "The Define Phase answers 'what is the problem and why does it matter?', not 'why is it happening?'. Appropriate Define content: the primary Y and its operational definition, the current pain expressed with available data, the customer and business impact, scope and boundaries, and the team. A list of hunches is acceptable as long as it is labelled as hunches." },
        { kind: 'p', text: "Inappropriate Define content: a declared root cause, a chosen solution, or a problem statement that blames a group ('MTTR is high because night engineers are slow'). Each of these closes the funnel before data has opened it." },
        { kind: 'example', title: 'Worked through: framing an MTTR problem', blocks: [
          { kind: 'p', text: "Northwind Fibre's NOC handled 1,284 priority-2 incidents last quarter. Mean time to restore was 4.7 hours against a 4-hour SLA, and 31.6% of incidents breached it." },
          { kind: 'list', items: [
            "Y: MTTR for P2 incidents, measured from first correlated alarm to service-restored timestamp.",
            "Suspected X's (Define, labelled as hypotheses): alarm correlation, engineer skill match, spare-part availability, shift handover quality, travel distance.",
            "Noise to record but not chase yet: storm days, third-party fibre cuts.",
            "Not in the charter: 'the cause is poor handovers' or 'buy a new ticketing tool'.",
          ] },
        ] },
      ],
    },
    {
      id: 'the-equation',
      title: 'Reading Y = f(X1, X2, ... Xn) + error',
      blocks: [
        { kind: 'formula', tex: 'Y = f(X_1, X_2, \\ldots, X_n) + \\varepsilon', caption: 'The output is some function of the inputs, plus variation the model does not explain.' },
        { kind: 'p', text: "The error term reminds us that no list of X's explains everything. It collects the effect of noise, of X's nobody has identified, and of measurement error. A good project shrinks the unexplained part by finding the inputs that matter, but it never reaches zero." },
        { kind: 'advanced', title: 'Go deeper: what f actually looks like', blocks: [
          { kind: 'callout', tone: 'supplementary', title: 'Supplementary context', text: "The supplied pages present Y = f(X) conceptually. The extended form with an error term is standard statistical notation, added here as supporting context." },
          { kind: 'p', text: "In Analyze and Improve, f may be estimated with regression or designed experiments, for example MTTR = 1.9 + 1.4(part not in depot) + 0.6(handover incomplete) hours. Such a model is only as good as the data behind it, holds only within the range tested, and shows association unless the X's were deliberately changed in an experiment." },
          { kind: 'p', text: "The Y = f(X) explorer in this academy uses an **illustrative educational model** with made-up weights. It shows how the idea works; it is not a proven causal relationship for any real network." },
        ] },
      ],
    },
  ],
  whyItMatters: [
    "Managers often set targets on outputs and hope behaviour changes. Y = f(X) shifts the conversation to causes, which is the only place where improvement can actually be engineered. It also protects teams from jumping to solutions, because it insists that suspected causes be tested before money is spent.",
    "On the exam, Y = f(X) questions usually test vocabulary (dependent vs independent, controllable vs noise) and phase boundaries (where causes are identified versus proven). Getting these right earns easy marks across Define, Measure and Analyze items.",
  ],
  businessExample: {
    title: 'Kestrel Mobile: restoring sites faster without working harder',
    industry: 'Telecommunications, network operations',
    blocks: [
      { kind: 'p', text: "Kestrel Mobile's regional NOC was told to 'restore faster'. For two quarters engineers rushed and MTTR barely moved, from 5.2 to 5.0 hours. A Green Belt reframed the work as Y = f(X): Y was MTTR for radio site outages; the team listed 23 candidate X's in a brainstorm." },
      { kind: 'p', text: "Measure and Analyze told a different story from the brainstorm. Engineer speed, the factor management had been pushing, had little effect. Two X's dominated: whether the replacement radio unit was stocked within 40 km, and whether the incident had been correctly correlated so that only one engineer was dispatched. Weather was a large noise input, so the team stratified data by storm days rather than trying to control it." },
      { kind: 'p', text: "After depot restocking rules and a correlation rule change, MTTR fell to 3.6 hours on non-storm days. The control plan monitored the two critical X's weekly, not just the Y, so any slip would be seen before the SLA was breached." },
    ],
  },
  visual: {
    diagram: 'yfx',
    title: 'Inputs flowing into an output',
    caption: "Controllable, procedural and noise inputs enter the process; the output Y is a function of them plus unexplained variation.",
  },
  definitions: [
    { term: 'Y (output)', definition: "An output characteristic of a process; the dependent variable whose performance the project wants to improve (glossary PDF 593)." },
    { term: 'X (input)', definition: "An input characteristic of a process or system; an independent variable that may influence Y (glossary PDF 593)." },
    { term: 'Critical X', definition: "An input that exerts a significant, proven influence on one or more key outputs (glossary PDF 588)." },
    { term: 'Controllable input', definition: "An input that can be adjusted or held at a setting while the process runs, such as staffing level or a routing rule." },
    { term: 'Procedural input', definition: "An input delivered through a standardised set of activities that prepares a step, such as a handover checklist or a fixed data-entry form." },
    { term: 'Noise input', definition: "An input the team cannot control, has not identified, or finds too costly to control, such as weather or individual caller behaviour." },
    { term: 'Root cause', definition: "A cause whose effect on Y has been verified with data, normally in Analyze, and which if removed prevents the problem recurring." },
  ],
  comparisons: [
    {
      title: 'Three types of input in a telecom NOC',
      head: ['Type', 'Meaning', 'NOC example', 'How it is managed'],
      rows: [
        ['Controllable (C)', 'Can be set or adjusted while running', 'Alarm correlation rules, shift staffing', 'Set points, limits, monitoring'],
        ['Procedural (P)', 'Standardised activities that ready a step', 'Shift handover checklist', 'Standard work, audits, training'],
        ['Noise (N)', 'Not controlled, unknown or too costly', 'Storms, third-party fibre cuts', 'Stratify, make robust, monitor'],
      ],
    },
    {
      title: 'Potential cause versus proven root cause',
      head: ['Feature', 'Potential X', 'Proven root cause (critical X)'],
      rows: [
        ['Where it appears', 'Brainstorm, fishbone, Define notes', 'Analyze conclusions'],
        ['Evidence', 'Experience, opinion', 'Data and statistical testing'],
        ['Allowed in charter?', 'Only as labelled hypotheses', 'No, Define comes before proof'],
        ['Action', 'Investigate', 'Improve and control'],
      ],
    },
  ],
  misconceptions: [
    { myth: "If we set a tough target on Y, the process will deliver it.", reality: "Y responds only to changes in its X's. Pressure on the output without changing inputs mostly produces gaming, burnout or temporary gains." },
    { myth: "A cause everyone agrees on in the kickoff meeting is the root cause.", reality: "Agreement is not evidence. It stays a potential X until Analyze data confirms its effect on Y." },
    { myth: "Noise inputs can be ignored because nothing can be done about them.", reality: "Noise still affects Y. You record it, stratify data by it, and design the process to be robust to it." },
    { myth: "Controllable means perfectly controlled.", reality: "A controllable input still varies within its natural limits; control means you can set and monitor it, not remove all variation." },
  ],
  examTraps: [
    { title: 'Dependent versus independent', text: "Y is the **dependent** variable and X is the **independent** one. Distractors often swap the words. Ask: which one depends on the other? The output depends on the inputs." },
    { title: 'Root cause in Define', text: "Any option stating that the root cause is identified, verified or proven in Define is a phase-boundary error. Define frames the Y; Analyze proves the X's." },
    { title: 'Improving Y directly', text: "Options such as 'monitor Y more often' or 'set a stricter Y target' are tempting but do not act on causes. The Y = f(X) answer targets the X's." },
    { title: 'C, P, N labels', text: "A standard operating procedure is a **procedural** input in the book's scheme. If only controllable and noise are offered, choose controllable for anything the organisation can set." },
  ],
  workedExamples: [
    {
      title: 'Classifying the X\'s for invoice cycle time',
      scenario: "Halden Health's accounts payable team wants to reduce invoice processing cycle time (Y). Candidate inputs: (a) number of approvers in the workflow, (b) the three-way match checklist, (c) supplier invoice format, (d) month-end volume spikes, (e) system auto-reminder interval.",
      steps: [
        "Ask for each input: can we set it while the process runs? Approver count and reminder interval can be configured, so (a) and (e) are controllable.",
        "Is it a standardised set of activities that readies a step? The three-way match checklist is, so (b) is procedural.",
        "Is it outside our control or too costly to control? Supplier invoice formats vary by supplier and month-end spikes come from the business calendar, so (c) and (d) are noise for now.",
        "Note the judgement call: if the organisation mandates e-invoicing, (c) could become controllable. Classification reflects current choices.",
      ],
      answer: "Controllable: (a), (e). Procedural: (b). Noise: (c), (d). None of these is yet a critical X; that is decided with data in Analyze.",
    },
    {
      title: 'Spotting the Define Phase error',
      scenario: "A draft charter for Kestrel Mobile reads: 'MTTR for P2 incidents averaged 4.9 hours in Q3 versus a 4-hour SLA. Root cause: weak shift handovers. The team will roll out a new handover app.'",
      steps: [
        "Check the Y: MTTR for P2 incidents is a clear, measurable output. Keep it.",
        "Check the impact: 4.9 hours against a 4-hour SLA gives size and gap. Keep it.",
        "Check for causes: 'Root cause: weak shift handovers' asserts a proven cause before Measure and Analyze. Downgrade to a suspected X or remove.",
        "Check for solutions: 'roll out a new handover app' is a solution. Remove it from the charter.",
      ],
      answer: "Keep the Y and the gap; restate handover quality as one suspected X among several; delete the solution. The charter then frames the problem without closing the funnel early.",
    },
  ],
  activity: {
    lab: 'yfx',
    prompt: "Use the Y = f(X) explorer to adjust alarm correlation, engineer skill, spare-part availability and handover quality, and watch MTTR respond. The weights are an illustrative teaching model, not proven causal data. Notice which X moves Y most and how the noise band never disappears.",
  },
  checkQuestionIds: ['q-1.1.4-01', 'q-1.1.4-04', 'q-1.1.4-07'],
  takeaways: [
    "Y = f(X): the output (Y, dependent) is a function of the inputs (X, independent).",
    "You improve Y by finding and managing its critical X's, not by pushing on Y.",
    "The book classifies inputs as Controllable, Procedural or Noise; the classification is a management decision and can change.",
    "Suspected X's may be listed in Define; root causes are proven with data in Analyze.",
    "DMAIC works like a funnel from many candidate X's to the vital few, which are then improved and controlled.",
    "The error term in Y = f(X1 ... Xn) + error captures noise, unknown X's and measurement error.",
  ],
  flashcards: [
    { front: 'In Y = f(X), which is the dependent variable?', back: "Y, the output. It depends on the inputs X." },
    { front: 'Three input types in the supplied book', back: "Controllable (C), Procedural (P) and Noise (N)." },
    { front: 'What is a critical X?', back: "An input with a significant, verified influence on a key output." },
    { front: 'In which phase are root causes proven?', back: "Analyze. Define only frames the Y and may list suspected X's." },
    { front: 'Give a noise input for a NOC restoring outages', back: "Storm damage, road traffic, or third-party fibre cuts." },
    { front: 'What does the error term represent?', back: "Variation in Y not explained by the identified X's: noise, unknown inputs and measurement error." },
    { front: 'Why not just set a stricter target on Y?', back: "Y only changes when its X's change; targets alone do not alter causes." },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Lists 1.1.4 The Problem Solving Strategy Y = f(x) as a Define topic.' },
    { source: 'gb-101-200', pdfPages: [103, 114], printedPages: [100, 111], note: 'Process mapping identifies inputs (X\'s) and outputs (Y\'s); improving Y requires finding all the X\'s.' },
    { source: 'gb-101-200', pdfPages: [116, 117], printedPages: [113, 114], note: 'Controllable, procedural and noise inputs; critical X\'s must be controlled.' },
    { source: 'gb-101-200', pdfPages: [119, 120], printedPages: [116, 117], note: 'Focus on one Y at a time; inputs and outputs of each step with C/N classification.' },
    { source: 'gb-501-600', pdfPages: [588, 593], printedPages: [585, 590], note: 'Glossary definitions of Critical X, X and Y.' },
    { source: 'supplementary', note: 'Define vs Analyze framing, the DMAIC funnel, the error term and the telecom examples are original explanatory content.' },
  ],
}
