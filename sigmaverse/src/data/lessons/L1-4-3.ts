import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.4.3',
  module: 4,
  officialTitle: 'Lean & Six Sigma',
  title: 'Lean and Six Sigma',
  subtitle: 'Speed and flow meet precision and data',
  readingMinutes: 13,
  status: 'partial-source',
  objectives: [
    'Contrast the focus of Lean (speed, flow, waste) with the focus of Six Sigma (variation, defects, data).',
    'Distinguish a waste problem from a variation problem in a business scenario.',
    'Decide whether a problem calls mainly for Lean tools, Six Sigma tools or both.',
    'Explain how Lean Six Sigma combines the two, including how Lean tools sustain Six Sigma gains.',
    'Avoid the common exam traps that treat the two methods as rivals.',
  ],
  overview: [
    "[[Lean]] and [[Six Sigma]] grew up separately, Lean at Toyota and Six Sigma at Motorola, and for years they had separate consultants, separate conferences and a little rivalry. Yet they attack the same enemy from two directions. Lean asks *why does this take so long and involve so much effort?* Six Sigma asks *why does the result vary, and why are some outputs defective?* A process can suffer from both at once, and usually does.",
    "The IASSC syllabus defines Lean Six Sigma as a team-based method that improves performance by **removing waste and reducing variation** together (syllabus p.3). This lesson shows how the two halves differ, where each is strongest, and why combining them gives better and more durable results than either alone.",
  ],
  sections: [
    {
      id: 'two-lenses',
      title: 'Two lenses on the same process',
      blocks: [
        { kind: 'p', text: "Imagine a fault-repair process at a broadband provider. Looking through the **Lean lens**, you see a ticket that waits 14 hours for triage, gets passed between three teams and is re-entered twice. The problem is [[Waste]]: time and effort the customer does not value. The remedy is to remove steps, shorten queues and make the work [[Flow]]." },
        { kind: 'p', text: "Looking through the **Six Sigma lens** at the same process, you notice that repair time is 3 hours for some customers and 70 hours for others, and that 6.8% of repairs fail within a week. The problem is [[Variation]] and [[Defect|defects]]. The remedy is to measure carefully, find the [[Root Cause|root causes]] with data, and control the inputs ([[Y = f(X)]])." },
        { kind: 'callout', tone: 'memory', title: 'Short version', text: "Lean makes the process **faster and leaner**. Six Sigma makes it **more consistent and more capable**. Waste costs time; variation costs predictability." },
      ],
    },
    {
      id: 'waste-vs-variation',
      title: 'Waste versus variation: telling them apart',
      blocks: [
        { kind: 'p', text: "A useful test: if every unit went through the process exactly the same way, would the problem still exist? If yes, it is mainly a waste problem: the process is consistently slow or wasteful. If no, because the trouble comes from some units behaving differently from others, it is mainly a variation problem." },
        { kind: 'table', caption: 'Business examples of waste and variation', head: ['Situation', 'Mainly waste or variation?', 'Why'], rows: [
          ['Every invoice is printed, signed and scanned back in', 'Waste', 'Same unnecessary steps every time; the process is consistently inefficient'],
          ['Invoice approval takes 1 day for some suppliers and 19 days for others', 'Variation', 'The spread in outcome is the problem; the average hides it'],
          ['Customers wait an average 26 minutes in a queue that adds nothing', 'Waste', 'Waiting is one of the seven wastes'],
          ['Network install success varies sharply between engineers', 'Variation', 'Different methods produce different results'],
          ['Every new contract is checked by two teams doing identical checks', 'Waste', 'Overprocessing'],
        ] },
        { kind: 'p', text: "In practice the two are linked. The book observes that outliers often exist because of differing waste among procedures, machines and people, so reducing waste can also reduce variation (PDF 505). Equally, defects create Correction waste, so reducing variation removes waste too." },
      ],
    },
    {
      id: 'when-to-use-which',
      title: 'When to lead with which',
      blocks: [
        { kind: 'list', items: [
          "**Lead with Lean** when the problem is lead time, backlog, effort, handoffs or clutter, the solution is fairly obvious once the waste is seen, and fast results are needed. Typical tools: value stream mapping, [[5S]], [[Standard Work]], [[Kanban]], kaizen events.",
          "**Lead with Six Sigma** when the problem is defects, inconsistency or failure to meet a [[Critical to Quality]] requirement, the cause is unknown, and data are needed to prove it. Typical tools: [[DMAIC]], measurement system analysis, capability, hypothesis tests, regression, control charts.",
          "**Use both** in most real projects: Lean to remove the obvious waste and make the process visible, Six Sigma to solve the hard, data-driven problems that remain, and Lean controls to hold the gains.",
        ] },
        { kind: 'callout', tone: 'tip', title: 'Do not over-tool', text: "If the root cause is visible to anyone who walks the process, a full statistical study is waste in itself. If the cause is hidden in data, a quick kaizen will only treat symptoms." },
      ],
    },
    {
      id: 'how-they-combine',
      title: 'How Lean Six Sigma combines them',
      blocks: [
        { kind: 'p', text: "Lean Six Sigma uses the DMAIC roadmap from Six Sigma as its backbone and inserts Lean tools where they fit. In Define, the team frames the problem and may already spot obvious waste. In Measure, a value stream map shows both waste and where variation occurs. In Analyze, statistics prove causes. In Improve, Lean solutions such as pull and flow sit beside optimised settings. In Control, Lean tools keep the gains." },
        { kind: 'p', text: "That last point is emphasised in the training book (PDF 505). It describes a chain: Kanban cannot be sustained without Kaizen, Kaizen (Six Sigma) cannot be sustained without Standardized Work, Standardized Work cannot be sustained without a Visual Factory, and a Visual Factory cannot be sustained without 5S. Its conclusion is that Lean tools add the discipline needed to sustain the gains of Six Sigma projects. The book also notes that waste is often at the root of a Six Sigma project and that Lean concepts can be applied before, during or after a project to reduce variation (PDF 504-505)." },
        { kind: 'diagram', diagram: 'lean-vs-sigma', caption: 'Lean shortens and simplifies the path; Six Sigma narrows the spread of results.' },
        { kind: 'advanced', title: 'Why speed and quality reinforce each other', blocks: [
          { kind: 'p', text: "A process with less work in progress has shorter lead time (Little's Law, lesson 1.2.5). Shorter lead time means defects are discovered sooner, so fewer units are affected before the cause is found. Conversely, a process with fewer defects has less rework clogging the queue, so it flows faster. This feedback loop is the practical reason the two methods combine so well." },
        ] },
      ],
    },
  ],
  whyItMatters: [
    "Choosing the wrong lens wastes months. A team that runs regression on a process whose real problem is a five-day approval queue will produce impressive statistics and no improvement.",
    "The exam expects you to see Lean and Six Sigma as complementary. Options that frame them as competitors, or that assign defect reduction only to Lean, are usually wrong.",
  ],
  businessExample: {
    title: 'Fault repair at a regional broadband provider',
    industry: 'Telecommunications',
    blocks: [
      { kind: 'p', text: "Marrow Valley Broadband's fault repairs took a median 31 hours, with 8.2% of repairs reopened within seven days." },
      { kind: 'list', items: [
        "**Lean first:** the team mapped the value stream and found an overnight batch that held tickets until morning triage, plus two duplicate diagnostic tests. Removing these cut median repair time to 18 hours within six weeks.",
        "**Six Sigma next:** reopen rates still varied from 2.1% to 14.6% across depots. Data analysis showed the reopen rate depended on whether the engineer ran a line-quality test before closing the ticket.",
        "**Lean controls last:** the test became part of standard work, a visual board showed each depot's reopen rate daily, and 5S was applied to the shared diagnostic scripts folder so everyone used the current version.",
      ] },
      { kind: 'p', text: "Neither method alone would have produced both the speed and the consistency." },
    ],
  },
  visual: {
    diagram: 'lean-vs-sigma',
    title: 'Lean versus Six Sigma',
    caption: "Lean removes waste so work flows faster; Six Sigma reduces variation so results are predictable. Lean Six Sigma does both.",
  },
  definitions: [
    { term: 'Lean', definition: "An approach that increases speed and flow by removing waste, defined against customer value." },
    { term: 'Six Sigma', definition: "A data-driven approach that reduces variation and defects so a process consistently meets customer requirements." },
    { term: 'Lean Six Sigma', definition: "A team-based method that improves performance by systematically removing waste and reducing variation (syllabus p.3)." },
    { term: 'Waste', definition: "Material, effort and time that do not add value for key stakeholders (book glossary PDF 593)." },
    { term: 'Variation', definition: "Differences between units or results of the same process; the main target of Six Sigma." },
    { term: 'Lean controls', definition: "Lean tools such as 5S, visual management, standard work and kanban used to sustain gains after improvement (book PDF 504-505)." },
  ],
  comparisons: [
    {
      title: 'Lean compared with Six Sigma',
      head: ['Dimension', 'Lean', 'Six Sigma'],
      rows: [
        ['Main question', 'Why is this slow and effortful?', 'Why does the result vary and fail?'],
        ['Primary enemy', 'Waste (muda)', 'Variation and defects'],
        ['Main goal', 'Speed, flow, lower cost', 'Consistency, capability, fewer defects'],
        ['Typical metrics', 'Lead time, cycle time, work in progress, process cycle efficiency', 'DPMO, sigma level, yield, capability indices'],
        ['Starting point', 'Customer value and the value stream', 'CTQs and the project Y'],
        ['Roadmap', 'Five principles, kaizen cycles', 'DMAIC'],
        ['Role of data', 'Simple observation and time data are often enough', 'Statistical analysis to prove causes'],
        ['Typical tools', 'Value stream map, 5S, kanban, standard work, visual management', 'MSA, capability, hypothesis tests, regression, control charts'],
        ['Speed of results', 'Often weeks', 'Often months'],
        ['Origin', 'Toyota Production System', 'Motorola (mid 1980s)'],
        ['Typical risk if used alone', 'Fast but inconsistent process', 'Precise but slow and wasteful process'],
      ],
    },
    {
      title: 'Choosing a lead approach',
      head: ['Symptom', 'Lead with', 'Reason'],
      rows: [
        ['Long queues and backlogs', 'Lean', 'Waiting and inventory waste'],
        ['High defect or error rate, cause unknown', 'Six Sigma', 'Needs data to find root cause'],
        ['Results differ widely by team or shift', 'Six Sigma', 'Variation problem'],
        ['Messy shared drive, people search for files', 'Lean (5S)', 'Motion and waiting waste'],
        ['Gains keep slipping after projects', 'Lean controls', 'Standard work, visual management and 5S sustain gains'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'Lean and Six Sigma are competing methods and you must pick one.', reality: "They are complementary. The syllabus defines Lean Six Sigma as removing waste and reducing variation together." },
    { myth: 'Lean does not use data.', reality: "Lean uses data constantly, such as lead times, queue lengths and takt time. It simply needs less statistical inference than Six Sigma to act." },
    { myth: 'Six Sigma only cares about defects, not speed.', reality: "Cycle time can be a Six Sigma Y, and reducing variation in cycle time is a classic Six Sigma project." },
    { myth: 'Lean tools only belong in the Improve phase.', reality: "The book presents Lean tools as controls that sustain Six Sigma gains, and notes they can be used before, during or after a project (PDF 504-505)." },
  ],
  examTraps: [
    { title: 'Focus words', text: "Speed, flow, waste and value point to Lean. Variation, defects, data and capability point to Six Sigma. Read the stem for these words before reading the options." },
    { title: '"Lean replaces Six Sigma"', text: "Any option saying one method replaces or makes the other unnecessary is a distractor." },
    { title: 'Sustaining gains', text: "If a question asks what the book says Lean tools add to Six Sigma projects, the answer is the discipline to sustain the gains." },
  ],
  workedExamples: [
    {
      title: 'Lean, Six Sigma or both?',
      scenario: "Calder Utilities pays 23.4% of supplier invoices late. Investigation shows every invoice waits in a scanning batch that runs twice a week, and invoices from 11 suppliers fail the three-way match far more often than others.",
      steps: [
        "The twice-weekly batch delays every invoice the same way: a waste problem (waiting, batch processing). Lean tool: move to daily or continuous scanning.",
        "The match failures concentrate in some suppliers: a variation problem with an unknown cause. Six Sigma tools: stratify the data, test hypotheses about supplier data quality.",
        "After both fixes, standard work and a visual queue board hold the gains.",
      ],
      answer: "Both. Lean removes the batch delay quickly; Six Sigma finds why certain suppliers fail matching; Lean controls sustain the result.",
    },
    {
      title: 'Reading the symptom',
      scenario: "Average call handling time at Kestrel Mobile is on target at 6.1 minutes, but 18% of calls exceed 12 minutes and generate complaints.",
      steps: [
        "The average is fine, so the process is not uniformly slow.",
        "The problem lies in the spread: some calls take far longer than others.",
        "That is a variation problem; Six Sigma tools will help locate the X's that drive long calls.",
      ],
      answer: "Lead with Six Sigma, because the issue is variation hidden behind an acceptable average.",
    },
  ],
  activity: {
    lab: 'lean-sigma',
    prompt: "Sort each business problem into mainly waste, mainly variation or both, and choose the approach you would lead with.",
  },
  checkQuestionIds: ['q-1.4.3-01', 'q-1.4.3-04', 'q-1.4.3-06'],
  takeaways: [
    "Lean targets waste to improve speed and flow; Six Sigma targets variation to reduce defects.",
    "Ask whether the problem would remain if every unit were processed identically: yes suggests waste, no suggests variation.",
    "Lead with Lean for obvious waste and fast wins, with Six Sigma for hidden causes that need data.",
    "Lean Six Sigma uses DMAIC as the backbone and inserts Lean tools where they fit.",
    "The book stresses that Lean tools (5S, visual factory, standard work, kaizen, kanban) sustain Six Sigma gains.",
    "Waste and variation feed each other, so reducing one often reduces the other.",
  ],
  flashcards: [
    { front: 'Lean focus', back: 'Speed, flow, removing waste, customer value.' },
    { front: 'Six Sigma focus', back: 'Variation, defects, data-driven root causes, capability.' },
    { front: 'Syllabus definition of Lean Six Sigma', back: 'Improving performance by systematically removing waste and reducing variation (p.3).' },
    { front: 'Quick test: waste or variation?', back: 'Would the problem remain if every unit were treated identically? Yes: waste. No: variation.' },
    { front: 'What do Lean tools add to Six Sigma projects (book PDF 505)?', back: 'The discipline needed to sustain the gains.' },
    { front: 'The book\'s sustaining chain', back: 'Kanban needs kaizen; kaizen needs standardized work; standardized work needs a visual factory; a visual factory needs 5S.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [3, 7], note: 'Lean Six Sigma removes waste and reduces variation (p.3); topic 1.4.3 (p.7).' },
    { source: 'gb-501-600', pdfPages: [504, 505], printedPages: [501, 502], note: 'Lean concepts reduce variation and can be used at any stage; Lean tools sustain Six Sigma gains; waste is often the root of a Six Sigma project.' },
    { source: 'supplementary', note: 'Detailed comparison, waste versus variation test and tool-selection guidance written as supporting content.' },
  ],
}
