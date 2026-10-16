import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.4.1',
  module: 4,
  officialTitle: 'Understanding Lean',
  title: 'Understanding Lean',
  subtitle: 'Seeing work through the customer\'s eyes: value, waste, flow and pull',
  readingMinutes: 14,
  status: 'partial-source',
  objectives: [
    'Explain Lean as a philosophy that starts from customer value and removes everything that does not create it.',
    'Classify process steps as value added, required (business) non-value added, or pure waste using the value-added test.',
    'State the five Lean principles of Womack and Jones in order and explain flow and pull in a service setting.',
    'Distinguish efficiency from effectiveness and explain why Lean pursues both through continuous improvement (kaizen).',
    'Calculate process cycle efficiency (value-added ratio) and interpret what a low result tells an improvement team.',
  ],
  overview: [
    "[[Lean]] is a way of looking at any process and asking one blunt question: which parts of this work would the customer gladly pay for, and which parts exist only because of how we happen to be organised? Everything in the second group is [[Waste]], or *muda* in Japanese. Lean does not begin with tools. It begins with the customer's definition of [[Value]] and then works backwards through the process, removing delays, handoffs, rework and clutter so that value moves to the customer quickly and smoothly.",
    "In a telecom or service business the product is often invisible: a provisioned line, a resolved fault, a correct invoice. That makes waste harder to see than a pile of scrap on a factory floor, but it is usually larger. A typical service request spends most of its life waiting in a queue rather than being worked on. This lesson gives you the vocabulary and the simple arithmetic to make that hidden time visible.",
  ],
  sections: [
    {
      id: 'lean-philosophy',
      title: 'Lean as a philosophy, not a toolkit',
      blocks: [
        { kind: 'p', text: "Lean grew out of the [[Toyota Production System]] (covered in lesson 1.4.2). Its core idea is respect for the customer's time and money, and respect for the people doing the work. Rather than asking staff to work harder, Lean asks managers to redesign the system so that effort is spent only on things that matter." },
        { kind: 'p', text: "Three ideas carry most of the weight. First, value is defined by the [[Customer]], never by the department producing the work. Second, anything that consumes time, effort or material without adding that value is waste. Third, improvement never ends: once the biggest waste is removed, the next layer becomes visible. That third idea is [[Kaizen]], the habit of small, frequent, team-owned improvements that together make up [[Continuous Improvement]]." },
        { kind: 'callout', tone: 'memory', title: 'One-line summary', text: "Lean = deliver what the customer values, as fast as they need it, with nothing wasted on the way." },
      ],
    },
    {
      id: 'value-added-test',
      title: 'Value added, required non-value added and pure waste',
      blocks: [
        { kind: 'p', text: "The training book offers a two-question test for any process step (PDF 120). A step is [[Value Added]] when it **changes the form, fit or function** of the item being worked on **and** the customer is **willing to pay** for that change. If either answer is no, the step is [[Non-Value Added]]. Many other Lean texts add a third condition: the step must be done right the first time, because doing it a second time adds cost but no extra value." },
        { kind: 'p', text: "Not every non-value-added step can be deleted. Some are demanded by law, regulators, auditors or the business itself, such as identity checks before a SIM swap or tax fields on an invoice. These are called **required non-value added** or **business value added** steps. The book makes the same point: some NVA activity, such as data collection for regulation, cannot be removed even though it does not change the product (PDF 120). The aim with these steps is to minimise their cost, not to pretend they are value." },
        { kind: 'table', caption: 'Three categories of activity in a fibre installation order', head: ['Category', 'Test result', 'Example at a fibre provider', 'What Lean does with it'], rows: [
          ['Value added', 'Changes form, fit or function and the customer would pay for it', 'Engineer splices fibre and activates the line', 'Protect it, make it flow, do it right first time'],
          ['Required (business) NVA', 'Adds no value for the customer but is mandated', 'Recording consent for credit checks; regulatory number-porting log', 'Simplify, automate, shrink'],
          ['Pure waste (NVA)', 'Adds no value and nobody requires it', 'Re-keying the order into a second system; chasing missing address data', 'Eliminate'],
        ] },
        { kind: 'callout', tone: 'tip', title: 'The "re-" clue', text: "Steps that start with *re*, such as rework, re-enter, re-check, re-send and re-approve, are very often waste. The book offers the same hint. Treat it as a prompt to investigate, not as an automatic verdict." },
      ],
    },
    {
      id: 'five-principles',
      title: 'The five Lean principles',
      blocks: [
        { kind: 'p', text: "James Womack and Daniel Jones summarised Lean thinking in five principles in their 1996 book *Lean Thinking*. They are applied in sequence and then repeated." },
        { kind: 'list', ordered: true, items: [
          "**Specify value** from the customer's point of view, for a specific product or service at a specific price.",
          "**Identify the value stream**: every step, value added or not, that takes the request from order to delivery.",
          "**Make value [[Flow]]**: remove queues, batches and handoffs so the work moves without stopping.",
          "**Let the customer [[Pull]]**: produce or process only when there is a real downstream need, instead of pushing work out to a forecast.",
          "**Pursue perfection**: repeat the cycle, because each improvement exposes the next layer of waste.",
        ] },
        { kind: 'p', text: "**Flow** means a unit of work keeps moving once it starts. A broadband order that waits three days for a credit team that works in a weekly batch does not flow. **Pull** means the downstream need triggers upstream work. A field-engineering team that only prepares an installation kit once the appointment is confirmed is pulling; one that builds 400 kits for next month's forecast is pushing, and will be left with obsolete kits when the router model changes." },
        { kind: 'diagram', diagram: 'lean-flow', caption: "Value moves from request to customer; Lean removes the stops and detours between value-added steps." },
      ],
    },
    {
      id: 'efficiency-effectiveness',
      title: 'Efficiency, effectiveness and kaizen',
      blocks: [
        { kind: 'p', text: "**Effectiveness** is doing the right things: producing an output the customer actually wants. **Efficiency** is doing things right: producing that output with the least time, cost and effort. A contact centre that answers every call in 20 seconds but cannot fix the customer's problem is efficient and ineffective. A centre that fixes everything but takes 40 minutes per call is effective and inefficient. Lean needs both, and it always checks effectiveness first, because making a useless step faster only produces waste faster." },
        { kind: 'p', text: "Kaizen is how Lean keeps both improving. It favours many small changes made by the people who do the work, tested quickly and then standardised. A kaizen event at a service desk might spend three days removing two approval steps and a duplicate form, while daily kaizen might be a five-minute huddle about yesterday's blocked tickets." },
      ],
    },
    {
      id: 'process-efficiency',
      title: 'Measuring it: process cycle efficiency',
      blocks: [
        { kind: 'callout', tone: 'supplementary', title: 'Supporting context', text: "Process cycle efficiency (also called the value-added ratio) is not in the supplied Define pages. It is included because it makes Lean thinking measurable and connects to [[Lead Time]] (lesson 1.2.5)." },
        { kind: 'formula', tex: 'PCE = \\frac{\\text{value-added time}}{\\text{total lead time}} \\times 100\\%', caption: 'Both times must be in the same unit.' },
        { kind: 'p', text: "Service processes commonly score in single digits or below 1%, because most of the lead time is waiting. A low PCE is not a judgement on staff effort; it is a map of where the time goes." },
        { kind: 'example', title: 'Worked example: SIM swap for a business customer', blocks: [
          { kind: 'p', text: "At Kestrel Mobile a business SIM swap takes 2 days and 6 hours from request to working SIM (54 elapsed hours). Value-added work, verifying the request against the account and activating the new SIM, totals 19 minutes." },
          { kind: 'list', ordered: true, items: [
            'Convert lead time to minutes: $54 \\times 60 = 3{,}240$ minutes.',
            'Divide: $19 / 3{,}240 = 0.00586$.',
            'Express as a percentage: about **0.59%**.',
          ] },
          { kind: 'p', text: "More than 99% of the elapsed time adds no value. The team should look first at queues and handoffs, not at making the 19 minutes faster." },
        ] },
      ],
    },
  ],
  whyItMatters: [
    "Lean is half of Lean Six Sigma. Many Define-phase projects are really about speed, delay or effort rather than defects, and recognising that early changes which tools you reach for.",
    "Customers judge services on elapsed time. A provider that cuts installation lead time from 11 days to 4 wins customers even if the engineer's work is unchanged, because the customer experiences the waiting, not the splicing.",
  ],
  businessExample: {
    title: 'Halving the time to activate a business fibre line',
    industry: 'Telecommunications',
    blocks: [
      { kind: 'p', text: "Northwind Fibre's business line activations averaged 9.4 working days. A Green Belt team walked one order from request to activation and labelled every step VA, required NVA or waste." },
      { kind: 'list', items: [
        'Value added: site survey, splicing, activation and test, about 3.1 hours of work in total.',
        'Required NVA: credit check and regulatory address validation, kept but automated.',
        'Waste: three re-keyings of the order between sales, provisioning and field systems, a weekly batch approval for orders over a threshold, and an average 2.6-day wait for a missing contact number.',
      ] },
      { kind: 'p', text: "Removing the batch approval and capturing the contact number at the point of sale took the average to 4.7 working days. Effectiveness was checked first: the team confirmed customers wanted faster activation more than a lower installation charge." },
    ],
  },
  visual: {
    diagram: 'lean-flow',
    title: 'Value flowing to the customer',
    caption: "A request moves through value-added and non-value-added steps. Lean shortens the path by removing waste and letting customer demand pull the work.",
  },
  definitions: [
    { term: 'Lean', definition: "An improvement philosophy that maximises customer value by systematically removing waste and making work flow at the pace of customer demand." },
    { term: 'Value', definition: "What the customer is willing to pay for, defined from the customer's point of view." },
    { term: 'Value Added (VA)', definition: "An activity that changes the form, fit or function of the product or service in a way the customer is willing to pay for (book PDF 120)." },
    { term: 'Non-Value Added (NVA)', definition: "Any activity that does not add value as defined above (book glossary PDF 590). Some NVA is required by regulation or the business." },
    { term: 'Required (business) non-value added', definition: "An activity that adds no customer value but cannot currently be removed, such as legal, audit or safety checks. Minimise it rather than eliminate it." },
    { term: 'Waste', definition: "Material, effort and time that does not add value in the eyes of key stakeholders (book glossary PDF 593)." },
    { term: 'Kaizen', definition: "Continuous, incremental improvement carried out by the people who do the work." },
    { term: 'Process cycle efficiency', definition: "Value-added time divided by total lead time, expressed as a percentage. Also called the value-added ratio (supplementary)." },
  ],
  comparisons: [
    {
      title: 'Efficiency versus effectiveness',
      head: ['Aspect', 'Efficiency', 'Effectiveness'],
      rows: [
        ['Question', 'Are we doing things right?', 'Are we doing the right things?'],
        ['Focus', 'Time, cost and effort per output', 'Whether the output meets the customer need'],
        ['Service desk example', 'Average handle time of 6.2 minutes', 'First-contact resolution of 78.4%'],
        ['Risk if pursued alone', 'Fast delivery of something the customer does not want', 'A good outcome at an unaffordable cost'],
      ],
    },
    {
      title: 'Push versus pull',
      head: ['Aspect', 'Push', 'Pull'],
      rows: [
        ['Trigger for work', 'Forecast or schedule', 'Actual downstream demand'],
        ['Typical result', 'Queues, stock and obsolescence', 'Less work in progress, shorter lead time'],
        ['Telecom example', 'Pre-configuring 400 routers for a forecast', 'Configuring a router when an installation is booked'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'Lean means cutting staff.', reality: "Lean removes waste from the process. Freed capacity is usually redeployed to growth or to better service. Using Lean mainly for headcount cuts destroys the trust that kaizen depends on." },
    { myth: 'If a step is necessary, it must be value added.', reality: "Necessary and valuable are different. Regulatory checks are necessary but the customer does not pay for them; they are required non-value added and should be made as cheap as possible." },
    { myth: 'Lean only applies to factories.', reality: "The principles apply to any process with a customer. Service processes often have more waste because work is invisible and queues hide in inboxes and ticket systems." },
    { myth: 'Making every step faster is the same as being Lean.', reality: "Speeding up a step the customer does not value is still waste. Lean asks whether the step should exist before asking how fast it runs." },
  ],
  examTraps: [
    { title: 'Who defines value?', text: "Value is always defined by the customer, never by the process owner, the department or the Black Belt. Options that say management or the team defines value are wrong." },
    { title: 'Necessary is not value added', text: "Stems describing a mandatory inspection, approval or compliance step are testing whether you know it is (required) non-value added." },
    { title: 'Order of the five principles', text: "The sequence is value, value stream, flow, pull, perfection. A common distractor puts pull before flow or starts with the value stream." },
    { title: 'Units in process cycle efficiency', text: "When lead time is in hours or days and value-added time is in minutes, convert before dividing. A result above 100% is a signal you mixed units." },
  ],
  workedExamples: [
    {
      title: 'Classifying invoice-processing steps',
      scenario: "At Brightwater Utilities a supplier invoice goes through: scan, wait in queue, key data into ERP, three-way match with purchase order and receipt, wait for manager approval, re-key into payment system, tax compliance check, payment run.",
      steps: [
        "Apply the two questions to each step from the point of view of the internal customer who needs the supplier paid correctly.",
        "Scanning and keying change the form of the information into something the payment system can use: arguably value added if done once.",
        "Three-way match and tax check are required controls: required non-value added.",
        "Both waits and the re-keying add nothing and are not required: pure waste.",
      ],
      answer: "Value added: scan, key once, payment run. Required NVA: three-way match, tax compliance check, approval itself. Waste: both queues and the re-keying. The team should eliminate the re-key, shrink the waits and automate the match.",
    },
    {
      title: 'Is the faster contact centre better?',
      scenario: "Kestrel Mobile cut average handle time from 7.8 to 5.1 minutes. Repeat calls within 7 days rose from 14.2% to 21.9%.",
      steps: [
        "Handle time is an efficiency measure; repeat contacts signal effectiveness.",
        "Repeat calls mean the problem was not solved, which creates Correction waste and extra demand.",
        "Total effort per resolved issue may have risen, not fallen.",
      ],
      answer: "The change improved efficiency but damaged effectiveness. A Lean view counts the repeat calls as failure demand, so the process is probably worse overall.",
    },
  ],
  activity: {
    lab: 'value',
    prompt: "Sort the steps of a service request into value added, required non-value added and waste, then see how the value-added ratio changes when you remove the waste.",
  },
  checkQuestionIds: ['q-1.4.1-01', 'q-1.4.1-03', 'q-1.4.1-06'],
  takeaways: [
    "Value is defined only by the customer; everything else is examined as potential waste.",
    "The value-added test: changes form, fit or function and the customer is willing to pay (many texts add: done right first time).",
    "Required non-value-added steps stay, but should be minimised and automated.",
    "The five principles in order: value, value stream, flow, pull, perfection.",
    "Check effectiveness before efficiency; speeding up the wrong work is still waste.",
    "Process cycle efficiency in service processes is often below 5%, revealing that waiting dominates lead time.",
  ],
  flashcards: [
    { front: 'Who defines value in Lean?', back: 'The customer.' },
    { front: 'Two questions of the value-added test (book PDF 120)', back: 'Does it change form, fit or function? Is the customer willing to pay for it?' },
    { front: 'Required (business) non-value added', back: 'A step the customer would not pay for but which is mandated (legal, audit, safety). Minimise it.' },
    { front: 'The five Lean principles in order', back: 'Specify value, identify the value stream, flow, pull, pursue perfection.' },
    { front: 'Pull', back: 'Downstream demand triggers upstream work, instead of producing to a forecast.' },
    { front: 'Efficiency vs effectiveness', back: 'Efficiency: doing things right. Effectiveness: doing the right things.' },
    { front: 'Process cycle efficiency formula', back: 'Value-added time / total lead time x 100%, same units.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.4.1 Understanding Lean in the detailed syllabus.' },
    { source: 'gb-101-200', pdfPages: [120], printedPages: [117], note: 'Two questions to identify value-added activity; some NVA cannot be removed; the "re" hint.' },
    { source: 'gb-501-600', pdfPages: [590, 593], printedPages: [587, 590], note: 'Glossary definitions of Non-Value Added and Waste.' },
    { source: 'supplementary', note: 'Five Lean principles, flow and pull, efficiency vs effectiveness, kaizen and process cycle efficiency written as supporting content.' },
  ],
}
