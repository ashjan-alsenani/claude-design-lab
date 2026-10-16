import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.1.5',
  module: 1,
  officialTitle: 'Voice of the Customer, Business and Employee',
  title: 'Voice of the Customer, Business and Employee',
  subtitle: 'Listen to three voices, translate them into measurable requirements, and balance them honestly',
  readingMinutes: 15,
  status: 'partial-source',
  objectives: [
    'Define VOC, VOB and VOE, and contrast them with the Voice of the Process.',
    'Distinguish internal from external customers for a service process.',
    'Choose suitable methods for capturing customer and employee feedback, qualitative and quantitative.',
    'Translate a customer verbatim into a need and then a measurable CTQ requirement.',
    'Test requirements with RUMBA and explain how to balance conflicting customer and business priorities.',
  ],
  overview: [
    "A Lean Six Sigma project is only worth doing if it improves something somebody cares about. Three groups have a stake in almost every process: the customers who receive its output, the business that funds and owns it, and the employees who perform it. Their needs are called the [[Voice of the Customer]] (VOC), the [[Voice of the Business]] (VOB) and the [[Voice of the Employee]] (VOE). A fourth voice, the [[Voice of the Process]] (VOP), is not a person at all: it is what the process actually delivers, shown by its data.",
    "The art of the Define Phase is to capture these voices faithfully, translate vague language ('your support is useless') into a measurable requirement, and compare that requirement with the VOP. The gap between what is wanted and what is delivered becomes the problem statement. This lesson covers who the customers are, how to listen, how to turn words into numbers, and what to do when the voices disagree.",
  ],
  sections: [
    {
      id: 'four-voices',
      title: 'Three voices to listen to, one to compare against',
      blocks: [
        { kind: 'p', text: "The supplied glossary (PDF 593) describes **VOC** as the expressed and unexpressed needs, wants and desires of whoever receives a process output, usually stated as specifications, requirements or expectations. **VOB** represents the needs of the business and its key stakeholders, typically profitability, revenue, growth and market share; in practice it also covers cost, risk and regulatory compliance. **VOP** is the performance and capability of the process, usually expressed as an efficiency or effectiveness metric." },
        { kind: 'p', text: "**VOE** is not defined in the supplied pages, so treat it as supplementary context: it captures employees' needs and insights about the work, such as workload, tools, training, safety and morale. Employees are often the first to know why a process fails, and a solution they cannot sustain will not last." },
        { kind: 'table', caption: 'The voices compared', head: ['Voice', 'Whose needs', 'Typical measures', 'Service example'], rows: [
          ['VOC', 'Receivers of the output', 'Timeliness, accuracy, ease, CSAT', 'Broadband fault fixed within 24 hours'],
          ['VOB', 'Owners, investors, regulators', 'Cost, margin, churn, compliance', 'Cost per repair below a budget'],
          ['VOE', 'People doing the work', 'Workload, tool uptime, eNPS', 'Agents need one screen, not four'],
          ['VOP', 'The process itself (data)', 'Mean, spread, defect rate, capability', 'Median fix time is 31 hours'],
        ] },
        { kind: 'callout', tone: 'memory', title: 'Memory hook', text: "VOC, VOB and VOE say what people **want**. VOP says what the process **does**. Improvement lives in the gap between them." },
      ],
    },
    {
      id: 'customers',
      title: 'Internal and external customers',
      blocks: [
        { kind: 'p', text: "The glossary (PDF 588) defines a [[Customer]] as anyone who uses or consumes a product or service, whether inside or outside the providing organisation. An [[External Customer]] is outside the organisation: a subscriber, a corporate client, sometimes a regulator receiving mandatory reports. An [[Internal Customer]] is the next step or team that receives your output: field engineering is the internal customer of the dispatch desk; billing is the internal customer of order entry." },
        { kind: 'p', text: "Internal customers matter because a defect passed downstream becomes someone else's rework and, eventually, the external customer's problem. A practical test: whoever must use your output to do their job is your customer for that output." },
      ],
    },
    {
      id: 'capturing-feedback',
      title: 'Methods of capturing the voices',
      blocks: [
        { kind: 'p', text: "No single method hears everything. Strong projects combine **reactive** sources (data that arrives without asking) with **proactive** sources (data you go out and collect)." },
        { kind: 'table', caption: 'Common listening methods', head: ['Method', 'Type of data', 'Strength', 'Watch out for'], rows: [
          ['Complaints and tickets', 'Qualitative and counts', 'Already exists, specific', 'Only vocal customers'],
          ['Call recordings, chat logs', 'Qualitative', 'Real words in context', 'Time to review, privacy rules'],
          ['Surveys (CSAT, NPS)', 'Quantitative', 'Large samples, trendable', 'Low response, leading questions'],
          ['Interviews', 'Qualitative', 'Depth, the why behind scores', 'Small samples, interviewer bias'],
          ['Focus groups', 'Qualitative', 'Ideas build on each other', 'Dominant voices, groupthink'],
          ['Observation (go and see)', 'Qualitative and timings', 'Shows what people do, not say', 'Observer effect'],
          ['Social listening', 'Qualitative, volume trends', 'Unprompted opinions at scale', 'Unrepresentative, noisy'],
          ['Employee suggestion schemes', 'Qualitative (VOE)', 'Front-line insight', 'Needs visible follow-through'],
        ] },
        { kind: 'p', text: "**Qualitative** information (words, stories, recordings) explains *why* and reveals needs nobody thought to ask about. **Quantitative** information (scores, counts, times) shows *how much* and *how often*, and allows comparison over time. Use qualitative work to find the right questions and quantitative work to size the answers." },
        { kind: 'callout', tone: 'supplementary', title: 'NPS and CSAT', text: "Net Promoter Score asks how likely a customer is to recommend you (0 to 10) and subtracts the percentage of detractors (0-6) from the percentage of promoters (9-10). CSAT is usually the share of respondents who rate an interaction as satisfied. Neither appears in the supplied pages; both are common in telecom and service work." },
      ],
    },
    {
      id: 'verbatim-to-ctq',
      title: 'From customer words to measurable requirements',
      blocks: [
        { kind: 'p', text: "Customers speak in feelings, not specifications. The translation runs in three steps: the **verbatim** (what was said), the underlying **need** (what they actually want), and the [[Critical to Quality|CTQ]] (a measurable characteristic with a target and limits). The book (PDF 512) summarises CTQ development as identifying the customer, capturing the VOC and validating the CTQs; lesson 1.2.2 builds the full [[CTQ Tree]]." },
        { kind: 'table', head: ['Verbatim', 'Need', 'CTQ (measurable)'], rows: [
          ["'I was on hold forever.'", 'Quick access to an agent', 'Time to answer at most 120 s for 90% of calls'],
          ["'I had to explain my fault three times.'", 'Resolve without repeating myself', 'Repeat contacts within 7 days below 8%'],
          ["'The engineer never turned up.'", 'Reliable appointments', 'Appointments kept within the booked slot, at least 97%'],
        ] },
        { kind: 'p', text: "To check each requirement, the book (PDF 115) uses **[[RUMBA]]**: is it Reasonable, Understandable, Measurable, Believable and Achievable? A requirement that fails any test is not yet valid and must be negotiated with the customer. 'Instant repairs, always' fails Reasonable and Achievable; 'good service' fails Measurable." },
        { kind: 'example', title: 'Worked through: one verbatim, one CTQ', blocks: [
          { kind: 'p', text: "Verbatim from a Kestrel Mobile business client: 'When our line drops, nobody tells us anything.' Need: proactive, timely updates during an outage. CTQ: first status update sent within 30 minutes of fault registration; target 15 minutes, upper limit 30 minutes. RUMBA check: reasonable (the alarm is already logged), understandable, measurable (timestamps exist), believable (competitors do it), achievable (automation available)." },
        ] },
      ],
    },
    {
      id: 'balancing',
      title: 'When the voices disagree',
      blocks: [
        { kind: 'p', text: "Customers want a fault fixed tonight; the business wants overtime cut; engineers want fewer emergency call-outs. Conflict is normal, and the job is to make it visible, not to let the loudest voice win. Practical steps: express every voice as a measurable requirement; make one the primary metric and protect the others with secondary (guard) metrics; look for options that serve several voices at once (better diagnosis cuts repeat visits, which pleases customers, saves cost and reduces call-outs); and escalate genuine trade-offs to the Champion, who owns the business decision." },
        { kind: 'advanced', title: 'Go deeper: the Kano model', blocks: [
          { kind: 'callout', tone: 'supplementary', title: 'Supplementary context', text: "The Kano model is not in the supplied pages or the syllabus wording, but it helps explain why customers rarely state every requirement." },
          { kind: 'list', items: [
            "**Must-be (basic)**: expected and unspoken; absence causes anger, presence earns no praise. Example: dial tone, a working SIM.",
            "**Performance (one-dimensional)**: more is better, roughly linearly. Example: download speed, time to answer.",
            "**Delighters (attractive)**: unexpected extras that please; absence goes unnoticed. Example: an automatic credit after an outage. Over time delighters drift into must-be.",
          ] },
          { kind: 'p', text: "Surveys mostly capture performance attributes. Must-be needs surface in complaints and observation, which is why mixed methods matter." },
        ] },
      ],
    },
  ],
  whyItMatters: [
    "Projects that skip the customer often optimise the wrong thing: an average handle time cut that drives repeat calls up, or a cost saving that breaches an SLA. Capturing all three voices and comparing them with the VOP ensures the problem you solve is real and the solution will be accepted.",
    "Exam questions in this area test definitions (which voice is which), customer types, the verbatim-to-CTQ translation and RUMBA. They frequently disguise the VOP as a 'voice' to see if you confuse what people want with what the process delivers.",
  ],
  businessExample: {
    title: 'Northwind Fibre: when the survey and the call recordings disagreed',
    industry: 'Telecommunications, customer support',
    blocks: [
      { kind: 'p', text: "Northwind Fibre's quarterly survey showed CSAT of 78% for its support line, which leadership read as acceptable. The VOB was clear: cut cost per contact by 12%. A Green Belt sampled 214 call recordings and coded 1,906 complaint tickets before accepting that view." },
      { kind: 'p', text: "The qualitative data told another story. 37% of complaints mentioned having to repeat the fault description, and the VOE from agents echoed it: they worked across four systems and could not see notes from the previous contact. The need behind the verbatims was 'resolve it without making me repeat myself', translated into a CTQ of repeat contacts within 7 days below 8% (baseline 19.4%)." },
      { kind: 'p', text: "Because repeat contacts were also cost, VOC, VOB and VOE pointed in the same direction once expressed as numbers. The project chartered repeat-contact rate as the primary metric with CSAT and average handle time as secondary metrics so that neither customer experience nor cost could quietly worsen." },
    ],
  },
  visual: {
    diagram: 'voices',
    title: 'Three voices meeting the process',
    caption: "Customer, business and employee voices define what is wanted; the voice of the process shows what is delivered. The gap is the project.",
  },
  definitions: [
    { term: 'Voice of the Customer (VOC)', definition: "The expressed and unexpressed needs, wants and desires of the recipient of a process output, usually stated as requirements or expectations (glossary PDF 593)." },
    { term: 'Voice of the Business (VOB)', definition: "The needs of the business and its key stakeholders, such as profitability, revenue, growth, market share, cost and compliance (glossary PDF 593)." },
    { term: 'Voice of the Employee (VOE)', definition: "The needs and insights of the people who perform the process, such as workload, tools, training, safety and engagement (supplementary)." },
    { term: 'Voice of the Process (VOP)', definition: "The actual performance and capability of a process, expressed as efficiency or effectiveness metrics (glossary PDF 593)." },
    { term: 'Internal customer', definition: "A person or team inside the organisation that receives and uses a process output, such as the next step in a workflow." },
    { term: 'External customer', definition: "A person or organisation outside the provider that receives the product or service, such as a subscriber or corporate client." },
    { term: 'RUMBA', definition: "A test of requirement validity: Reasonable, Understandable, Measurable, Believable and Achievable (PDF 115, 591)." },
    { term: 'Verbatim', definition: "A customer's exact words, recorded before interpretation, used as the starting point for identifying needs and CTQs." },
  ],
  comparisons: [
    {
      title: 'Qualitative versus quantitative information',
      head: ['Feature', 'Qualitative', 'Quantitative'],
      rows: [
        ['Form', 'Words, recordings, observations', 'Scores, counts, durations'],
        ['Answers', 'Why, what matters, what is missing', 'How much, how often, how many'],
        ['Typical sources', 'Interviews, focus groups, call recordings', 'Surveys, ticket counts, system timestamps'],
        ['Main risk', 'Small or biased sample', 'Measuring the wrong thing precisely'],
        ['Best use in Define', 'Discover needs and verbatims', 'Size the gap against the VOP'],
      ],
    },
    {
      title: 'Internal versus external customers',
      head: ['Feature', 'Internal customer', 'External customer'],
      rows: [
        ['Location', 'Inside the organisation', 'Outside the organisation'],
        ['Telecom example', 'Field engineering receiving dispatched jobs', 'A household receiving broadband'],
        ['Pays directly?', 'No, but depends on your output', 'Usually yes'],
        ['Why it matters', 'Defects become downstream rework', 'Defects become complaints, churn, penalties'],
      ],
    },
  ],
  misconceptions: [
    { myth: "The Voice of the Process is what the process owner says the process needs.", reality: "VOP is the data: what the process actually delivers. The process owner's priorities are part of VOB." },
    { myth: "Only paying, external customers count.", reality: "Internal customers receive outputs too, and their requirements determine whether work flows without rework." },
    { myth: "A high survey score means customers are happy with everything.", reality: "Surveys mostly measure performance attributes; must-be failures and unasked needs surface in complaints, recordings and observation." },
    { myth: "When customer and business priorities clash, the customer always wins.", reality: "Both must be met for a sustainable process. Make the trade-off explicit with primary and secondary metrics and let the Champion decide genuine conflicts." },
  ],
  examTraps: [
    { title: 'VOP disguised as a voice', text: "If an option describes measured performance (average fix time, defect rate, capability) it is the Voice of the Process, even if the wording mentions a person reporting it." },
    { title: 'VOB versus VOC', text: "Cost, margin, growth, market share and compliance are VOB. Speed, accuracy and ease as experienced by the receiver are VOC. A regulator's reporting requirement is usually treated as VOB (compliance)." },
    { title: 'RUMBA letters', text: "The letters are Reasonable, Understandable, Measurable, Believable, Achievable. Distractors swap in 'Relevant', 'Useful' or 'Monitored'." },
    { title: 'Verbatim is not a CTQ', text: "'Fast service' is a need, not a CTQ. A CTQ must be measurable with a target or limit, for example 'answer within 120 seconds'." },
  ],
  workedExamples: [
    {
      title: 'Translating verbatims into CTQs',
      scenario: "Halden Health's patient billing helpline collects these comments: 'Your bills are impossible to read', 'I got charged twice', 'Nobody called me back'.",
      steps: [
        "Write the need behind each verbatim: understandable bills; accurate charges; reliable callbacks.",
        "Choose a measurable characteristic for each: share of bills that pass a readability check; duplicate-charge rate; callbacks completed within the promised window.",
        "Set targets and limits with the customer in mind: readability score above an agreed level; duplicate charges below 0.2% of invoices; at least 95% of callbacks within 1 business day.",
        "Apply RUMBA: is each reasonable, understandable, measurable, believable and achievable? Adjust any that fail.",
      ],
      answer: "Three CTQs: bill readability score (target agreed with patients), duplicate-charge rate below 0.2%, callback completion within 1 business day at least 95%. Each traces back to a verbatim and passes RUMBA.",
    },
    {
      title: 'Naming the voice',
      scenario: "During a Kestrel Mobile kickoff, four statements are made: (1) 'Our churn must fall below 1.1% per month.' (2) 'Field techs say the diagnostic app crashes in rural areas.' (3) 'Last quarter, 23.8% of installs needed a second visit.' (4) 'Customers want the engineer to arrive in the slot they booked.'",
      steps: [
        "Statement 1 is a business outcome tied to revenue: VOB.",
        "Statement 2 is the experience of people doing the work: VOE.",
        "Statement 3 is measured performance of the install process: VOP.",
        "Statement 4 is what the receiver of the service wants: VOC.",
      ],
      answer: "1 = VOB, 2 = VOE, 3 = VOP, 4 = VOC. The project problem is the gap between statement 4 (and 1) and statement 3.",
    },
  ],
  activity: {
    lab: 'voice',
    prompt: "Sort a set of telecom and service statements into VOC, VOB, VOE and VOP, then take one customer verbatim through need to a measurable CTQ and test it with RUMBA.",
  },
  checkQuestionIds: ['q-1.1.5-01', 'q-1.1.5-04', 'q-1.1.5-08'],
  takeaways: [
    "VOC is what customers need, VOB is what the business needs, VOE is what employees need; VOP is what the process actually delivers.",
    "Customers can be internal (the next step) or external (outside the organisation); both have requirements.",
    "Combine qualitative methods (interviews, recordings, observation) with quantitative ones (surveys, ticket counts, timestamps).",
    "Translate verbatim to need to CTQ, and make every CTQ measurable with a target or limit.",
    "Validate requirements with RUMBA: Reasonable, Understandable, Measurable, Believable, Achievable.",
    "Balance conflicting voices with a primary metric plus guard metrics, and escalate genuine trade-offs to the Champion.",
  ],
  flashcards: [
    { front: 'VOC', back: "Voice of the Customer: expressed and unexpressed needs of the recipient of the output." },
    { front: 'VOB', back: "Voice of the Business: profitability, revenue, growth, market share, cost, compliance." },
    { front: 'VOE', back: "Voice of the Employee: workload, tools, training, safety and insight of the people doing the work." },
    { front: 'VOP', back: "Voice of the Process: what the process actually delivers, shown by performance and capability data." },
    { front: 'RUMBA', back: "Reasonable, Understandable, Measurable, Believable, Achievable." },
    { front: 'Internal customer example in a telco', back: "Field engineering receiving jobs from the dispatch desk." },
    { front: 'Verbatim to CTQ chain', back: "Verbatim (exact words) to need (what they want) to CTQ (measurable characteristic with target or limits)." },
    { front: 'Kano categories', back: "Must-be, performance, delighters (supplementary)." },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Lists 1.1.5 Voice of the Customer, Business and Employee as a Define topic.' },
    { source: 'gb-501-600', pdfPages: [593], printedPages: [590], note: 'Glossary definitions of VOB, VOC and VOP.' },
    { source: 'gb-501-600', pdfPages: [588], printedPages: [585], note: 'Glossary definition of customer, internal or external.' },
    { source: 'gb-101-200', pdfPages: [115], printedPages: [112], note: 'Identifying customer requirements as VOC and validating them with RUMBA.' },
    { source: 'gb-501-600', pdfPages: [591], printedPages: [588], note: 'Glossary definition of RUMBA.' },
    { source: 'gb-501-600', pdfPages: [512], printedPages: [509], note: 'Steps to develop CTQs: identify the customer, capture the VOC, validate the CTQs.' },
    { source: 'supplementary', note: 'VOE, listening methods, NPS and CSAT, the Kano model, balancing conflicting voices and all examples are original explanatory content.' },
  ],
}
