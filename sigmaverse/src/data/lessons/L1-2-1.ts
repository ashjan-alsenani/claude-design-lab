import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.2.1',
  module: 2,
  officialTitle: 'Defining a Process',
  title: 'Defining a Process',
  subtitle: 'Inputs, activities, outputs, boundaries and owners: seeing work as a system you can improve',
  readingMinutes: 13,
  status: 'partial-source',
  objectives: [
    'Define a process using the glossary wording and explain each part of the definition.',
    'Identify the inputs, activities, outputs, suppliers and customers of a real service process.',
    'Set clear process boundaries with a start trigger and an end trigger.',
    'Explain why every process needs a single accountable process owner, especially when work crosses departments.',
    'Sketch a Level 1 macro process map with four to eight major steps.',
    'Distinguish the outputs a process produces from the outcomes customers and the business experience.',
  ],
  overview: [
    "Every improvement project starts with a deceptively simple question: *what exactly is the work we are trying to improve?* Teams that skip this question argue for weeks because each person pictures a different start, a different finish and a different customer. Defining the [[Process]] first gives the whole team one shared object to measure, analyse and change.",
    "In this lesson you will learn to describe a process the way a Green Belt does: the things that go in, the activities that transform them, the things that come out, who supplies and who receives, where the process starts and stops, and who is accountable for it. You will practise on an incident management process at a fictional broadband provider, Northwind Fibre, and finish with a one-page, high-level view that a sponsor can understand in thirty seconds.",
  ],
  sections: [
    {
      id: 'what-is-a-process',
      title: 'What a process is',
      blocks: [
        { kind: 'p', text: "The book glossary describes a process as a set of activities, together with the flow of material and/or information, that transforms a set of inputs into outputs in order to produce a product, provide a service or perform a task. Three ideas are packed into that sentence: there is a **transformation** (something changes), there is **flow** (material or information moves from step to step), and there is a **purpose** (someone needs the result)." },
        { kind: 'p', text: "The simplest picture of this is the Input-Process-Output (IPO) diagram, also in the glossary: arrows for inputs point into a box that represents the process, and arrows for outputs leave it. It is the same logic as [[Y = f(X)]]: outputs (Y) depend on inputs (X) and on how the activities combine them." },
        { kind: 'diagram', diagram: 'process', caption: 'Inputs flow from suppliers into a sequence of activities; outputs flow to customers. Boundaries mark where the process starts and stops.' },
        { kind: 'callout', tone: 'memory', title: 'Memory hook', text: "A process is a **verb with a customer**. If you cannot name what changes and who receives the result, you have described a department or a system, not a process." },
      ],
    },
    {
      id: 'inputs-activities-outputs',
      title: 'Inputs, activities and outputs',
      blocks: [
        { kind: 'p', text: "An [[Input]] is a resource that the process consumes, uses or adds to. In service work most inputs are information: a fault report, a customer account, a diagnostic reading, an invoice. People, systems and policies are inputs too. The glossary treats input as a synonym of X." },
        { kind: 'p', text: "**Activities** are the steps that transform inputs. On a process map each activity sits in a rectangle and its label begins with a verb: *log incident*, *diagnose line*, *dispatch engineer*." },
        { kind: 'p', text: "An [[Output]] is what the process produces: a restored service, a closed ticket, a paid invoice, a report. Outputs are the Y's. List *all* outputs, including unintended ones such as complaints and rework requests." },
        {
          kind: 'table',
          caption: 'Northwind Fibre incident management, described element by element',
          head: ['Element', 'Question it answers', 'Incident management example'],
          rows: [
            ['Supplier', 'Who provides the inputs?', 'Customers, network monitoring system, field engineering contractor'],
            ['Input', 'What goes in?', 'Fault report, alarm data, customer account, line test results, engineer availability'],
            ['Activity', 'What transformation happens?', 'Log, categorise, prioritise, diagnose, fix, confirm, close'],
            ['Output', 'What comes out?', 'Restored service, closed incident record, customer notification'],
            ['Customer', 'Who receives the output?', 'Affected residential and business customers; problem management team (internal)'],
          ],
        },
      ],
    },
    {
      id: 'suppliers-and-customers',
      title: 'Suppliers and customers',
      blocks: [
        { kind: 'p', text: "A [[Supplier]] is anyone, inside or outside the organisation, who provides an input in the form of resources or information. A [[Customer]] is anyone who uses or consumes the output, again whether internal or external. That second point matters: the problem management team that receives your incident records is an [[Internal Customer]], and its needs (accurate cause codes, complete timestamps) are as real as the [[External Customer|external customer's]] need to get back online." },
        { kind: 'p', text: "The book makes a sharp observation about swim lane maps: every time work crosses from one lane to another there is a supplier and customer interaction, and that is usually where queues and bottlenecks form. In incident management the hand-off from the service desk to the field team is exactly such a point. Mark these hand-offs when you define a process." },
      ],
    },
    {
      id: 'boundaries-and-ownership',
      title: 'Boundaries and ownership',
      blocks: [
        { kind: 'p', text: "A [[Process Boundary]] is the agreed start and end of the process you are studying. Define each boundary as a **trigger**, an observable event, not as a vague phase. For Northwind Fibre the start trigger is *an incident is reported by a customer or raised automatically by an alarm*, and the end trigger is *the customer confirms service is restored and the ticket is closed*. The customer's confirmation stops tickets being closed while the fault persists." },
        { kind: 'p', text: "The book's steps for a Level 1 map begin the same way: give the process a generic name, identify its beginning and ending steps, and write a short statement of its purpose. It also advises including at least one process step before and one after the area where you believe the problem sits, so the map does not cut off the cause." },
        { kind: 'p', text: "Every defined process needs a [[Process Owner]]: the person with responsibility for its performance and resources, who supports the project and is accountable for implementing the solution. Cross-functional processes are the hard case. The service desk, network operations and field engineering each manage their own piece, so *everyone* manages part of incident management and *no one* owns the customer's end-to-end experience unless the organisation names an owner." },
        { kind: 'callout', tone: 'trap', title: 'Boundary creep', text: "If the start or end point is not written down, scope grows quietly. \"Incident management\" becomes \"incident, problem and change management\" by week three. Agree the triggers with the Champion and process owner before collecting any data." },
      ],
    },
    {
      id: 'high-level-view',
      title: 'The high-level view: a Level 1 macro map',
      blocks: [
        { kind: 'p', text: "The book describes three levels of process map. **Level 1**, the macro or management view, combines related activities into a handful of major steps, shows where the process fits into the bigger picture and needs only general knowledge of the work. **Level 2** shows the steps from the worker's viewpoint, and **Level 3**, the micro or improvement view, adds performance data such as yields, cycle times and defects." },
        { kind: 'p', text: "In Define you need the Level 1 view: four to eight boxes that everyone recognises. For Northwind Fibre: *Report* → *Log and prioritise* → *Diagnose* → *Fix* → *Confirm with customer* → *Close*. The book warns that mapping usually reveals a process larger and costlier than people believed: what we *think* it is differs from what it *actually* is." },
        { kind: 'callout', tone: 'note', title: 'Where SIPOC belongs in this syllabus', text: "A [[SIPOC]] (Suppliers, Inputs, Process, Outputs, Customers) is a natural extension of this lesson, and many programs build one in Define. In the IASSC Green Belt syllabus, however, detailed [[Process Map|process mapping]], SIPOC and value stream mapping are classified under the [[Measure Phase]] (topic 2.1.2). For Define, a high-level picture of the five elements is enough; the full SIPOC with requirements is built in Measure." },
      ],
    },
    {
      id: 'outputs-vs-outcomes',
      title: 'Outputs versus outcomes',
      blocks: [
        { kind: 'p', text: "An **output** is what the process hands over: a closed ticket, a restored line. An **outcome** is the change that results for the customer or the business: the customer can work again, trusts the provider and renews the contract. A process can hit every output target and still produce a poor outcome, for example when tickets are closed within four hours but 14% of customers call back within a week because the fault recurs." },
        { kind: 'callout', tone: 'supplementary', title: 'Supporting context', text: "The output and outcome distinction comes from performance management practice rather than from the supplied book pages. It is included because it helps you choose outputs that genuinely reflect what customers value, which leads directly into CTQs in the next lesson." },
        {
          kind: 'example',
          title: 'Example: invoice processing, output or outcome?',
          blocks: [
            { kind: 'p', text: "Kestrel Mobile's accounts payable team processes about 7,900 supplier invoices a month." },
            { kind: 'list', items: [
              '**Outputs:** approved invoice, payment file sent to the bank, remittance advice, exception report.',
              '**Outcomes:** suppliers paid accurately and on time, early-payment discounts captured, no duplicate payments, suppliers willing to keep favourable terms.',
            ] },
            { kind: 'p', text: "The team once celebrated processing 98% of invoices within five days, an output measure, while a duplicate-payment problem worth thousands a month went unnoticed: an outcome failure." },
          ],
        },
      ],
    },
  ],
  whyItMatters: [
    "Measurement, analysis and improvement all depend on a stable definition of the work. If two analysts define the start of incident management differently (customer call versus ticket creation), their cycle times will disagree and the team will argue about data instead of improving the process.",
    "A clear definition also exposes ownership gaps. Many chronic service problems survive because they live in the hand-offs between departments, where every manager can show that their own part performs well.",
  ],
  businessExample: {
    title: 'Kestrel Mobile: the invoice process nobody owned',
    industry: 'Telecommunications, finance operations',
    blocks: [
      { kind: 'p', text: "Kestrel Mobile's suppliers complained that payments were late. Procurement blamed accounts payable, accounts payable blamed budget holders for slow approvals, and IT pointed at the invoice scanning tool. Each team's own measures looked healthy." },
      { kind: 'p', text: "A Green Belt began by defining the process: start trigger *invoice received in any channel*, end trigger *payment reaches the supplier's bank*. Writing that boundary down revealed that the elapsed time between the two triggers was not measured by anyone; each team measured only its own segment. The macro map had six steps (receive, capture, match to purchase order, approve, schedule payment, pay) and three hand-offs." },
      { kind: 'list', items: [
        'Median end-to-end time turned out to be 23 days against 30-day terms, but 18.4% of invoices exceeded 30 days.',
        'Most of the delay sat in the approval hand-off, a step owned by budget holders spread across 40 departments.',
        'The CFO named the Head of Finance Operations as single process owner for the end-to-end process, and the project charter used the agreed boundaries as its scope.',
      ] },
      { kind: 'p', text: "Nothing had been improved yet, but the project now had a measurable Y, an owner and a scope everyone accepted." },
    ],
  },
  visual: {
    diagram: 'process',
    title: 'Anatomy of a process',
    caption: 'Suppliers provide inputs; activities transform them; outputs reach customers. The start and end triggers define the boundary, and one process owner is accountable for everything inside it.',
  },
  definitions: [
    { term: 'Process', definition: 'A set of activities, with the flow of material and/or information, that transforms inputs into outputs to produce a product, provide a service or perform a task (book glossary).' },
    { term: 'Input', definition: 'A resource consumed, used or added by a process; synonymous with X. Includes information, materials, people, systems and policies.' },
    { term: 'Output', definition: 'A product, item or characteristic that the process produces; the Y in Y = f(X).' },
    { term: 'Supplier', definition: 'Any individual or entity, internal or external, that provides an input to the process as resources or information.' },
    { term: 'Customer', definition: 'Anyone who uses or consumes the output, whether inside or outside the providing organisation.' },
    { term: 'Process boundary', definition: 'The agreed start and end points of the process under study, best written as observable trigger events.' },
    { term: 'Process owner', definition: 'The person responsible for the performance and resources of a process, accountable for implementing project solutions in it.' },
    { term: 'Level 1 macro map', definition: 'A high-level, management-view process map that groups related activities into a few major steps and shows how the process fits the bigger picture.' },
  ],
  comparisons: [
    {
      title: 'Output versus outcome',
      head: ['Aspect', 'Output', 'Outcome'],
      rows: [
        ['What it is', 'The thing the process delivers', 'The resulting change for the customer or business'],
        ['Incident example', 'Ticket closed, line restored', 'Customer back online and not calling again'],
        ['Invoice example', 'Payment file sent', 'Supplier paid correctly and on time'],
        ['Control', 'Directly controlled by the process', 'Influenced by the process plus other factors'],
        ['Risk if used alone', 'Can be gamed (closing tickets early)', 'Hard to link to a specific step'],
      ],
    },
    {
      title: 'Process map levels (book PDF 105-106)',
      head: ['Level', 'Viewpoint', 'Detail', 'Typical DMAIC use'],
      rows: [
        ['Level 1, macro', 'Management', 'A few major steps, minimal detail', 'Define: scope and orientation'],
        ['Level 2, process map', 'Worker', 'Steps, decisions, who does what', 'Measure: understanding how work gets done'],
        ['Level 3, micro', 'Improvement', 'Tasks plus yields, cycle times, defects', 'Measure and Analyze: finding the problem in the detail'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'A process is the same thing as a department.', reality: 'Departments are organisational units; processes flow across them. Incident management passes through the service desk, network operations and field engineering, and its worst delays sit in the hand-offs between them.' },
    { myth: 'The process starts when our system creates a record.', reality: 'The customer experiences the process from the moment they report the problem. Choosing an internal start point hides queue time that the customer feels. Boundaries should be agreed explicitly and defended.' },
    { myth: 'A detailed SIPOC must be completed in Define.', reality: 'In this syllabus, detailed process mapping and SIPOC are Measure phase topics (2.1.2). Define needs a high-level understanding: boundaries, major steps, key inputs, outputs and customers.' },
    { myth: 'If every output target is met, the customer is satisfied.', reality: 'Outputs can be met while outcomes fail, for example fast ticket closure combined with a high repeat-contact rate.' },
  ],
  examTraps: [
    { title: 'Inputs are not only materials', text: 'Exam options may list only physical items as inputs. In service processes information, people, systems, policies and even customer behaviour are inputs (X\'s).' },
    { title: 'Customers can be internal', text: 'A question may describe a downstream team receiving a report. That team is a customer of the process. The glossary definition includes internal and external customers.' },
    { title: 'SIPOC phase placement', text: 'If asked where detailed SIPOC and process mapping sit in the IASSC Green Belt syllabus, the answer is the Measure phase (2.1.2), even though a high-level process view supports the Define charter.' },
    { title: 'Owner versus Champion', text: 'The process owner is accountable for the process and for implementing the solution in it. The Champion sponsors the project and removes barriers. They can be the same person, but the roles are different.' },
  ],
  workedExamples: [
    {
      title: 'Setting boundaries for a repair process',
      scenario: "Northwind Fibre's Champion asks a Green Belt to reduce \"time to fix\" for broadband faults. The service desk measures from ticket creation to ticket closure. Customers complain about the time from their first call to working broadband.",
      steps: [
        'List candidate start events: customer first notices the fault, customer first contacts Northwind, ticket created, ticket assigned.',
        'Choose the earliest event Northwind can observe and timestamp reliably: the customer\'s first contact (call, chat or app report).',
        'List candidate end events: engineer marks job done, ticket closed, customer confirms service restored.',
        'Choose the event that reflects the customer\'s experience and can be recorded: customer confirms restoration (with an automatic test as backup when the customer cannot be reached).',
        'Write both triggers in the charter scope and confirm them with the Champion and the process owner.',
      ],
      answer: "Start trigger: customer's first contact about the fault. End trigger: restoration confirmed by the customer or by an automated line test. This boundary captures queue time before ticket creation and repeat faults closed too early, both invisible under the old definition.",
    },
    {
      title: 'Classifying elements of an invoice process',
      scenario: 'Kestrel Mobile lists these items for its invoice process: supplier invoice PDF, purchase order data, \"match invoice to PO\", payment file, budget holder, bank, ERP system, remittance advice.',
      steps: [
        'Ask of each item: does it go in, does it happen, or does it come out?',
        'Inputs: supplier invoice PDF, purchase order data, ERP system (a resource used).',
        'Activity: "match invoice to PO" (starts with a verb).',
        'Outputs: payment file, remittance advice.',
        'People and organisations: the budget holder supplies an approval (a supplier of an input); the bank receives the payment file (a customer of that output).',
      ],
      answer: 'Inputs: invoice PDF, PO data, ERP system. Activity: match invoice to PO. Outputs: payment file, remittance advice. Supplier: budget holder (approval). Customer: bank (payment file) and ultimately the supplier being paid.',
    },
  ],
  activity: {
    lab: 'process',
    prompt: 'Build a high-level process definition for incident management: drag inputs, activities and outputs into place, set the start and end triggers, and assign a process owner. Then check whether your boundary captures the customer\'s full experience.',
  },
  checkQuestionIds: ['q-1.2.1-01', 'q-1.2.1-04', 'q-1.2.1-07'],
  takeaways: [
    'A process transforms inputs into outputs through activities, for a customer, with material and/or information flowing between steps.',
    'Inputs are X\'s and outputs are Y\'s; in service work most inputs are information.',
    'Suppliers and customers can be internal or external, and every hand-off between teams is a supplier and customer interaction.',
    'Define boundaries as observable start and end triggers and agree them before collecting data.',
    'Every process needs one accountable process owner, especially when it crosses departments.',
    'In Define a Level 1 macro map of four to eight steps is enough; detailed mapping and SIPOC are Measure (2.1.2) in this syllabus.',
    'Outputs are what the process delivers; outcomes are what the customer and business experience as a result.',
  ],
  flashcards: [
    { front: 'Book glossary definition of a process', back: 'A set of activities, with material and/or information flow, that transforms inputs into outputs to produce a product, provide a service or perform a task.' },
    { front: 'Input is synonymous with...', back: 'X (an input variable or characteristic).' },
    { front: 'How should process boundaries be written?', back: 'As observable trigger events: a start trigger and an end trigger.' },
    { front: 'Process owner', back: 'Responsible for process performance and resources; accountable for implementing the solution in the process.' },
    { front: 'Level 1 process map', back: 'Macro, management view: a few major steps, minimal detail, shows where the process fits the big picture.' },
    { front: 'Where are detailed SIPOC and process mapping in the IASSC GB syllabus?', back: 'Measure phase, topic 2.1.2.' },
    { front: 'Output versus outcome', back: 'Output: what the process delivers (closed ticket). Outcome: the resulting change (customer back online and satisfied).' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.2.1 Defining a Process, and topic 2.1.2 placing process mapping and SIPOC in Measure.' },
    { source: 'gb-501-600', pdfPages: [590], printedPages: [587], note: 'Glossary definitions of Process and Output.' },
    { source: 'gb-501-600', pdfPages: [589], printedPages: [586], note: 'Glossary definitions of Input and the Input-Process-Output (IPO) diagram.' },
    { source: 'gb-501-600', pdfPages: [588, 591, 592], printedPages: [585, 588, 589], note: 'Glossary definitions of Customer, Process Owner and Supplier.' },
    { source: 'gb-101-200', pdfPages: [103, 104, 105, 106], printedPages: [100, 101, 102, 103], note: 'Three views of a process, mapping symbols, Level 1 to 3 maps, swim lane hand-offs.' },
    { source: 'gb-101-200', pdfPages: [111, 114], printedPages: [108, 111], note: 'Steps for a Level 1 map (name, beginning and ending steps, purpose) and SIPOC as a Measure-phase tool.' },
    { source: 'supplementary', note: 'Output versus outcome distinction, trigger-based boundaries and the incident management and invoice examples.' },
  ],
}
