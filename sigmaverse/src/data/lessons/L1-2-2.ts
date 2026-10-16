import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.2.2',
  module: 2,
  officialTitle: "Critical to Quality Characteristics (CTQ's)",
  title: 'Critical to Quality Characteristics',
  subtitle: 'Turning what customers say into requirements you can measure, test and improve',
  readingMinutes: 14,
  status: 'partial-source',
  objectives: [
    'Define a CTQ and explain how it differs from a raw customer statement.',
    'Build a CTQ tree from a customer need through quality drivers to measurable CTQs.',
    'Specify a CTQ with a metric, a target and specification limits (LSL and/or USL).',
    'Write an operational definition that makes a CTQ measurable in the same way by anyone.',
    'Distinguish CTQs from KPIs and from service level agreements.',
  ],
  overview: [
    "Customers rarely speak in specifications. They say *\"I want fast service\"*, *\"just fix it properly\"* or *\"don't make me repeat myself\"*. Those statements are the raw [[Voice of the Customer]], and they are valuable, but you cannot measure \"fast\", you cannot decide whether one call was a defect, and you cannot tell whether an improvement worked.",
    "A [[Critical to Quality|Critical to Quality characteristic (CTQ)]] closes that gap. It translates a need into something measurable with a clear target and limits, so that every unit of service can be judged as meeting or missing the requirement. This lesson shows how to make that translation with a CTQ tree, how to attach specification limits, and why an operational definition is the step most teams forget.",
  ],
  sections: [
    {
      id: 'what-is-a-ctq',
      title: 'What a CTQ is',
      blocks: [
        { kind: 'p', text: "The book glossary defines a CTQ as any characteristic that is critical to the *perceived* quality of a product, process or system, and links it to the idea of a significant Y: an output that strongly influences the success of the process or the customer. Two words deserve attention. **Characteristic** means something you can measure on each unit (time, accuracy, completeness). **Perceived** means the customer decides what is critical, not the engineer." },
        { kind: 'p', text: "The book summarises CTQ development in three steps: identify the customer, capture the voice of the customer, then validate the CTQs. Validation matters because a requirement that sounds sensible may be unmeasurable, or may not be what customers actually value." },
      ],
    },
    {
      id: 'why-vague-fails',
      title: 'Why vague statements are not enough',
      blocks: [
        { kind: 'p', text: "Take the statement *\"I want fast service\"* from a Kestrel Mobile business customer. Ask five colleagues what it means and you will hear five answers: the phone is answered quickly, the agent knows the answer, the fault is fixed the same day, the engineer arrives on time, the bill credit appears this month. Each is a different characteristic with a different metric." },
        { kind: 'list', items: [
          '**Not measurable:** there is no unit, so you cannot collect a baseline.',
          '**No defect definition:** you cannot say whether a 45-second answer was a failure.',
          '**No direction for improvement:** the team will fix whichever part of \"fast\" its loudest member cares about.',
          '**No way to verify success:** in Control you cannot prove the customer now gets \"fast\".',
        ] },
        { kind: 'callout', tone: 'trap', title: 'The vague CTQ', text: "\"Improve customer satisfaction with speed\" is still a need, not a CTQ. If a statement has no metric and no limit, keep decomposing." },
      ],
    },
    {
      id: 'ctq-tree',
      title: 'The CTQ tree: need, drivers, CTQs',
      blocks: [
        { kind: 'p', text: "A [[CTQ Tree]] breaks a broad need into **quality drivers** (the aspects of service that make up the need) and then into **CTQs** (measurable characteristics with requirements). Read it left to right: general to specific, vague to measurable." },
        { kind: 'diagram', diagram: 'ctq-tree', caption: 'One need branches into drivers; each driver branches into one or more CTQs with a metric and a limit.' },
        {
          kind: 'table',
          caption: 'CTQ tree for "I want fast service" (Kestrel Mobile business support)',
          head: ['Need', 'Driver', 'CTQ (metric)', 'Requirement'],
          rows: [
            ['Fast service', 'Speed of answer', 'Time from call entering queue to agent answering (seconds)', 'USL 30 s per call; 95% of calls within 30 s'],
            ['Fast service', 'Time to resolve', 'Time from fault report to service restored (hours)', 'USL 4 h per fault for priority 1 business lines'],
            ['Fast service', 'Resolve without repeats', 'Faults resolved on first contact (yes or no)', 'Target: no repeat contact about the same fault within 7 days'],
            ['Fast service', 'Engineer punctuality', 'Arrival time minus start of booked slot (minutes)', 'LSL 0 min, USL 120 min (arrive within the 2-hour slot)'],
          ],
        },
        { kind: 'p', text: "Notice how \"95% of calls answered within 30 seconds\" contains two layers. The **CTQ specification** applies to each call: 30 seconds is the upper limit, so a 34-second answer is a [[Defect]]. The **performance requirement** says what share of calls must meet it. Keeping these layers separate lets you count defects per call now and calculate sigma level and yield later." },
      ],
    },
    {
      id: 'specification-limits',
      title: 'Targets and specification limits',
      blocks: [
        { kind: 'p', text: "The book's customer requirements form records, for each output, the metric, the lower specification limit (LSL), the target and the upper specification limit (USL). [[Specification Limits]] are the bounds of acceptable performance; the LSL is the lowest acceptable value and the USL the highest. The target is where the customer would like results centred, and the book notes that if the customer gives no target you record the expected average and work to reduce variation around it." },
        { kind: 'p', text: "Some CTQs are **one-sided**. Speed of answer has only a USL: nobody complains that a call was answered too quickly. Others are **two-sided**. A scheduled callback at an agreed time might have a target of 0 minutes from the agreed time, an LSL of minus 5 minutes (earlier and the customer may not be ready) and a USL of plus 10 minutes." },
        { kind: 'callout', tone: 'tip', title: 'Validate with RUMBA', text: "The book tests each requirement with RUMBA: Reasonable, Understandable, Measurable, Believable and Achievable. A requirement that fails any test must be negotiated with the customer, not quietly ignored." },
      ],
    },
    {
      id: 'operational-definitions',
      title: 'Operational definitions',
      blocks: [
        { kind: 'p', text: "An [[Operational Definition]] describes precisely what is measured and how, so that two people measuring the same event get the same result. \"Time to answer\" sounds clear until you ask: does the clock start when the call reaches the IVR or when it enters the agent queue? Does a call abandoned after 4 seconds count? Is a callback offer an answer?" },
        { kind: 'example', title: 'Example: operational definition for speed of answer', blocks: [
          { kind: 'list', items: [
            '**Characteristic:** time to answer, in whole seconds, for calls to the business support line.',
            '**Start:** the call enters the agent queue (after IVR menu selection).',
            '**Stop:** an agent accepts the call in the telephony platform.',
            '**Inclusions:** all calls in the queue during opening hours, including those later transferred.',
            '**Exclusions:** calls abandoned within 5 seconds of entering the queue (counted and reported separately).',
            '**Defect:** answer time greater than 30 seconds, or abandonment after 5 seconds.',
            '**Data source:** telephony platform interval report, extracted daily.',
          ] },
        ] },
        { kind: 'callout', tone: 'note', title: 'Two uses of the same phrase', text: "In the book's process mapping pages, \"operational definition\" also labels a short statement of why a process exists and what it does. In CTQ work the term means a precise measurement definition. Exam questions about CTQs use the measurement meaning." },
      ],
    },
    {
      id: 'ctq-kpi-sla',
      title: 'CTQs, KPIs and SLAs',
      blocks: [
        { kind: 'p', text: "These three are often confused because they can share a number. A CTQ comes from the customer and is judged unit by unit. A [[KPI]] is any metric the business chooses to track performance; it may summarise a CTQ (percentage of calls answered in 30 seconds) or reflect business needs (cost per contact). A [[Service Level Agreement]] is a contractual commitment, often with credits or penalties, negotiated between provider and client." },
        { kind: 'advanced', title: 'When the SLA and the CTQ disagree', blocks: [
          { kind: 'p', text: "Northwind Fibre's wholesale SLA promises restoration within 8 hours. Interviews show business customers consider anything beyond 4 hours a serious failure. The provider can be fully SLA-compliant while delivering a poor experience on the true CTQ. Contracts are negotiated by procurement and legal teams, sometimes years earlier; CTQs should be refreshed from current customer voice. When they differ, note both, and let the project charter state which one the project improves." },
        ] },
        { kind: 'callout', tone: 'supplementary', title: 'Supporting context', text: "The CTQ tree layout and the CTQ, KPI and SLA comparison are standard Lean Six Sigma practice but are not set out in the supplied book pages; they are explained here as supplementary material." },
      ],
    },
  ],
  whyItMatters: [
    "Every later DMAIC metric depends on the CTQ. Defects, DPMO, yield and sigma level all need a specification to count against. A project that starts with a vague requirement cannot produce a credible baseline or prove its benefit.",
    "CTQs also protect teams from improving the wrong thing. A contact centre that cuts handle time may answer faster but resolve less, which hurts the customer's real need. A well-built CTQ tree makes those trade-offs visible before work begins.",
  ],
  businessExample: {
    title: 'Northwind Fibre: from "you are too slow" to four CTQs',
    industry: 'Telecommunications, business broadband support',
    blocks: [
      { kind: 'p', text: "Northwind Fibre's business churn rose to 2.3% a month and exit surveys repeatedly said \"too slow\". Management's first instinct was to hire more agents to answer calls faster." },
      { kind: 'p', text: "A Green Belt ran 26 customer interviews and analysed 1,412 complaint texts. The CTQ tree split \"too slow\" into speed of answer, time to restore, repeat contact and engineer punctuality. Baseline data told a surprising story:" },
      { kind: 'list', items: [
        'Speed of answer was already fine: 93.8% of calls answered within 30 seconds.',
        'Only 61.5% of priority faults were restored within 4 hours.',
        'Repeat contacts within 7 days affected 17.2% of faults.',
      ] },
      { kind: 'p', text: "Hiring agents would have improved the CTQ that customers were least unhappy about. The project charter instead targeted restoration time, with repeat contact as a secondary metric to guard against rushed fixes." },
    ],
  },
  visual: {
    diagram: 'ctq-tree',
    title: 'CTQ tree',
    caption: 'A broad customer need (left) splits into quality drivers and then into CTQs, each with a metric, a target and specification limits.',
  },
  definitions: [
    { term: 'Critical to Quality (CTQ)', definition: 'A characteristic of a product, service or process that is critical to the quality perceived by the customer, stated so it can be measured against a requirement.' },
    { term: 'Customer need', definition: 'A broad, often vague statement of what the customer wants, such as "fast service".' },
    { term: 'Quality driver', definition: 'An aspect of the product or service that makes up a need, such as speed of answer or time to resolve.' },
    { term: 'CTQ tree', definition: 'A diagram that decomposes a need into drivers and then into measurable CTQs with targets and limits.' },
    { term: 'Specification limits', definition: 'The bounds of acceptable performance for a characteristic: the LSL is the lowest acceptable value, the USL the highest.' },
    { term: 'Target', definition: 'The value the customer prefers results to be centred on; if none is given, the expected average is recorded.' },
    { term: 'Operational definition', definition: 'A precise statement of what is measured, how, when it starts and stops, and what counts as a defect, so anyone gets the same result.' },
    { term: 'RUMBA', definition: 'A test of requirement validity: Reasonable, Understandable, Measurable, Believable, Achievable.' },
  ],
  comparisons: [
    {
      title: 'CTQ versus KPI versus SLA',
      head: ['Aspect', 'CTQ', 'KPI', 'SLA'],
      rows: [
        ['Origin', 'Customer need (VOC)', 'Business choice (often VOB)', 'Contract between provider and client'],
        ['Level', 'Each unit (call, fault, invoice)', 'Usually an aggregate over a period', 'Aggregate or per incident, as written in the contract'],
        ['Example', 'Restoration time per fault, USL 4 h', 'Average restoration time this month', '95% of P1 faults restored within 8 h, or credits apply'],
        ['Consequence of a miss', 'A defect for that unit', 'A red dashboard cell', 'Financial credit or penalty'],
        ['Risk', 'Becomes vague if not operationally defined', 'May not reflect what customers value', 'Can be met while customers are still unhappy'],
      ],
    },
    {
      title: 'Translating customer statements',
      head: ['Customer says', 'Driver', 'CTQ with requirement'],
      rows: [
        ['"I want fast service"', 'Speed of answer', 'Queue-to-answer time, USL 30 s; 95% of calls compliant'],
        ['"Fix it quickly"', 'Time to resolve', 'Report-to-restore time for P1 faults, USL 4 h'],
        ['"Get my bill right"', 'Invoice accuracy', 'Invoices with zero line-item errors, target 100%; any error is a defect'],
        ['"Turn up when you say"', 'Punctuality', 'Arrival minus slot start, LSL 0 min, USL 120 min'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'A customer quote is a CTQ.', reality: 'A quote is VOC. It becomes a CTQ only when it is translated into a measurable characteristic with a requirement.' },
    { myth: 'Every CTQ needs both an LSL and a USL.', reality: 'Many service CTQs are one-sided. Waiting time has only a USL; first-contact resolution rate has only a lower requirement.' },
    { myth: 'If we meet the SLA, we meet the customer\'s CTQs.', reality: 'SLAs are negotiated contracts and may be looser or simply different from what customers currently value.' },
    { myth: 'The project team decides which characteristics are critical.', reality: 'Criticality is defined by the customer\'s perception. The team gathers and validates VOC; it does not substitute its own opinion.' },
  ],
  examTraps: [
    { title: 'Need, driver or CTQ?', text: 'Expect options mixing levels of the tree. "Fast service" is a need, "speed of answer" is a driver, "answer within 30 seconds" is a CTQ. Pick the option that has a metric and a limit when asked for the CTQ.' },
    { title: 'Specification limits are not control limits', text: 'Specification limits come from the customer (voice of the customer). Control limits are calculated from process data (voice of the process). Do not swap them.' },
    { title: 'Operational definition purpose', text: 'If asked why an operational definition is needed, the best answer is consistency: different people measuring the same thing get the same result.' },
    { title: 'KPI is not automatically a CTQ', text: 'A KPI such as cost per contact matters to the business but is not critical to customer-perceived quality. Watch for options that call every metric a CTQ.' },
  ],
  workedExamples: [
    {
      title: 'Building a CTQ for "fix my fault fast"',
      scenario: 'Halden Health\'s IT service desk supports clinical wards. Ward managers say: "When the system is down, we need it back fast."',
      steps: [
        'Identify the customer: ward managers and clinicians who use the patient record system.',
        'Identify the driver: time to restore a priority 1 (ward cannot use the system) incident.',
        'Choose the characteristic and unit: elapsed minutes from incident report to service restored.',
        'Agree the requirement with customers using RUMBA: USL 60 minutes per P1 incident; ward managers accept 60 minutes because downtime procedures cover the first hour.',
        'Write the operational definition: clock starts at the first call or alarm, stops when a ward user confirms access; outages that affect several wards count as one incident per ward.',
      ],
      answer: 'CTQ: time to restore P1 incidents, measured in minutes from first report to user-confirmed restoration, USL 60 minutes per incident. Each incident above 60 minutes is a defect.',
    },
    {
      title: 'Setting specification limits for a callback',
      scenario: 'Kestrel Mobile promises customers a callback "at the time you choose". Customers dislike calls that arrive more than 10 minutes late, and calls more than 5 minutes early are often missed.',
      steps: [
        'Characteristic: callback time minus agreed time, in minutes (negative means early).',
        'Target: 0 minutes.',
        'LSL: minus 5 minutes. USL: plus 10 minutes.',
        'Check: a callback at 14:07 for an agreed 14:00 gives plus 7 minutes, within limits. One at 13:52 gives minus 8 minutes, below the LSL, so it is a defect.',
      ],
      answer: 'Two-sided CTQ: target 0 min, LSL -5 min, USL +10 min. Calls outside that window are defects even when they are early.',
    },
  ],
  activity: {
    lab: 'ctq',
    prompt: 'Start with the customer statement "I want fast service". Add drivers, then write at least two CTQs with a metric, a target and specification limits. The lab flags any CTQ that still has no unit or limit.',
  },
  checkQuestionIds: ['q-1.2.2-01', 'q-1.2.2-03', 'q-1.2.2-06'],
  takeaways: [
    'A CTQ is a measurable characteristic critical to customer-perceived quality, with a requirement attached.',
    'Customer statements such as "fast service" are needs, not CTQs; they must be decomposed.',
    'A CTQ tree flows from need to drivers to CTQs, from vague to measurable.',
    'Specifications come from the customer: LSL, target and USL; many service CTQs are one-sided.',
    'Validate requirements with RUMBA and negotiate when they fail.',
    'An operational definition makes the measurement consistent and defines exactly what counts as a defect.',
    'CTQs are customer-driven and judged per unit; KPIs are business tracking metrics; SLAs are contractual commitments.',
  ],
  flashcards: [
    { front: 'Glossary meaning of CTQ', back: 'Any characteristic critical to the perceived quality of a product, process or system.' },
    { front: 'CTQ tree order', back: 'Need, then quality drivers, then CTQs with measurable requirements.' },
    { front: '"I want fast service": need, driver or CTQ?', back: 'Need. Drivers include speed of answer and time to resolve; a CTQ is, for example, answer within 30 seconds.' },
    { front: 'LSL and USL', back: 'Lower and upper specification limits: the lowest and highest acceptable values, set by the customer requirement.' },
    { front: 'RUMBA', back: 'Reasonable, Understandable, Measurable, Believable, Achievable.' },
    { front: 'Purpose of an operational definition', back: 'So that anyone measuring the characteristic gets the same result, and everyone agrees what a defect is.' },
    { front: 'CTQ versus SLA', back: 'CTQ: customer-driven requirement per unit. SLA: negotiated contractual service level, often with penalties.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: "Topic 1.2.2 Critical to Quality Characteristics (CTQ's)." },
    { source: 'gb-501-600', pdfPages: [588], printedPages: [585], note: 'Glossary definition of Critical to Quality (CTQ).' },
    { source: 'gb-501-600', pdfPages: [591], printedPages: [588], note: 'Glossary definitions of Significant Y and RUMBA.' },
    { source: 'gb-501-600', pdfPages: [589, 592, 593], printedPages: [586, 589, 590], note: 'Glossary definitions of LSL, USL, Specification Limits and VOC.' },
    { source: 'gb-101-200', pdfPages: [115], printedPages: [112], note: 'Customer requirements form with metric, LSL, target and USL; RUMBA validation.' },
    { source: 'gb-501-600', pdfPages: [512], printedPages: [509], note: 'Steps in developing CTQs: identify the customer, capture VOC, validate CTQs.' },
    { source: 'supplementary', note: 'CTQ tree method, operational definition example, and the CTQ, KPI and SLA comparison.' },
  ],
}
