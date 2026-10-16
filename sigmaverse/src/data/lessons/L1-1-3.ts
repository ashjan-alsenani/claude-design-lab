import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: "1.1.3",
  module: 1,
  officialTitle: "Deliverables of a Lean Six Sigma Project",
  title: "What Each DMAIC Phase Must Deliver",
  subtitle: "Phase outputs, the Define deliverables and the tollgates that guard each boundary",
  readingMinutes: 14,
  status: "partial-source",
  objectives: [
    "List the main deliverables of each DMAIC phase and place a given output in the correct phase.",
    "Describe the Define Phase deliverables, including the project charter and its elements.",
    "Explain how project selection and business alignment shape a good Lean Six Sigma project.",
    "Describe the purpose of a tollgate review and who takes part.",
    "Recognise common phase-boundary traps, such as proving root cause in Define or writing a control plan before Control.",
  ],
  overview: [
    "A Lean Six Sigma project is judged by what it produces at each step, not by how busy the team looks. Each phase of [[DMAIC]] has a set of deliverables: documents, data and decisions that must exist before the project may move on. If you know what each phase is supposed to hand over, you can tell at a glance whether a project is on track, skipping steps or jumping to solutions.",
    "This lesson walks through the deliverables of all five phases, then zooms in on the [[Define Phase]], where the project is chosen, framed and approved. It finishes with the [[Tollgate]] reviews that separate the phases and the exam traps that cluster around those boundaries.",
  ],
  sections: [
    {
      id: "roadmap",
      title: "The DMAIC roadmap in one view",
      blocks: [
        { kind: "p", text: "The training book summarises DMAIC as a roadmap of goals for each phase. Paraphrased: Define identifies the problem area, settles the project focus, estimates the [[Cost of Poor Quality]] and establishes the team. Measure assesses stability, capability and the measurement system. Analyze lists and prioritises the possible X's and then proves or disproves their effect. Improve identifies, selects and implements solutions. Control puts a control plan in place so the problem does not return and verifies the financial impact." },
        {
          kind: "table",
          caption: "What belongs to which phase",
          head: ["Phase", "Core question", "Typical deliverables"],
          rows: [
            ["**Define**", "What is the problem, why does it matter, and who will fix it?", "[[Project Charter]] (business case, problem statement, goal statement, scope, team, timeline); high-level process view; VOC and CTQs; preliminary COPQ estimate; stakeholder analysis; Champion sign-off"],
            ["**Measure**", "How big is the problem, really, and can we trust the data?", "Detailed process map and SIPOC; operational definitions and data collection plan; measurement system analysis; [[Baseline]] performance, stability and capability; refined problem statement; list of potential X's"],
            ["**Analyze**", "Which causes actually drive the problem?", "Prioritised X's; data analysis and hypothesis tests; **verified root causes** with evidence; quantified effect of each critical X"],
            ["**Improve**", "What change removes or controls the root causes?", "Generated and evaluated solutions; selected solution with risk review; pilot results; implementation plan; confirmed improvement in the Y"],
            ["**Control**", "How do we keep the gain and prove its value?", "Control plan with monitoring and response plans; updated procedures and training; handover to the [[Process Owner]]; verified financial benefits; lessons learned; project closure"],
          ],
        },
        { kind: "callout", tone: "memory", title: "Memory hook: one verb per phase", text: "**Define** frames, **Measure** quantifies, **Analyze** proves, **Improve** changes, **Control** sustains. If an output frames, quantifies, proves, changes or sustains, you know where it lives." },
      ],
    },
    {
      id: "define-deliverables",
      title: "The Define Phase deliverables",
      blocks: [
        { kind: "p", text: "Define turns a vague pain (customers are unhappy with installations) into an approved, bounded project. Its centrepiece is the [[Project Charter]], a short contract between the team and its sponsor." },
        {
          kind: "list",
          items: [
            "**[[Business Case]]**: why this project, why now, and how it supports strategy or a key metric.",
            "**[[Problem Statement]]**: what is wrong, where, since when, how big, and the impact, with no cause, no solution and no blame.",
            "**[[Goal Statement]]**: a SMART target, usually reduce or increase a metric from a baseline to a target by a date.",
            "**[[Project Scope]]**: in-scope and out-of-scope items and the process start and end points.",
            "**Team and roles**: Champion, Belt, team members, Process Owner and Finance Representative where relevant.",
            "**Timeline**: planned dates for each tollgate.",
          ],
        },
        { kind: "p", text: "Around the charter sit supporting outputs: the [[Voice of the Customer]] translated into [[Critical to Quality]] requirements, a high-level view of the process, a preliminary estimate of the cost of poor quality, and a [[Stakeholder]] analysis showing who is affected and who must be won over." },
        { kind: "callout", tone: "supplementary", title: "Source note", text: "The training book's roadmap confirms the Define goals (problem area, focus, COPQ estimate, team). The detailed list of charter elements reflects standard practice and is explained here as supplementary content, because the book's Define chapter was not among the supplied files." },
      ],
    },
    {
      id: "selection-and-alignment",
      title: "Project selection and business alignment",
      blocks: [
        { kind: "p", text: "Good DMAIC projects share a profile: a recurring problem with a measurable output, an unknown cause, and a clear link to something the business already tracks. If the cause and the fix are already known, it is a just-do-it task, not a DMAIC project. If the problem cannot be measured, the project will stall in Measure." },
        { kind: "p", text: "Alignment means the project moves a number that leaders care about: churn, cost per contact, SLA compliance, days sales outstanding. The [[Champion]] tests this at selection by asking which strategic goal the project serves and how large the prize is." },
        {
          kind: "example",
          title: "Example: is this a DMAIC project?",
          blocks: [
            { kind: "p", text: "Riverside Telecom has three candidate ideas. (1) Replace a broken printer in the billing office. (2) First-contact resolution in technical support has fallen from 71% to 62% over two quarters, and nobody agrees why. (3) Launch a new prepaid tariff." },
            { kind: "p", text: "Idea 1 has a known cause and fix: just do it. Idea 3 is a design or product launch, not the improvement of an existing process. Idea 2 is a recurring, measurable problem with an unknown cause and a clear link to cost and satisfaction, the classic DMAIC candidate." },
          ],
        },
      ],
    },
    {
      id: "tollgates",
      title: "Tollgate reviews",
      blocks: [
        { kind: "p", text: "A [[Tollgate]] is a formal review at the end of a phase. The Belt presents the deliverables; the Champion (often with the Process Owner and, near the end, Finance) checks them and decides: proceed, repeat work, redirect or stop. The training book's phase checklists list the questions a team should be able to answer at the end of a phase in clear language, which is exactly what a tollgate tests." },
        { kind: "p", text: "Stopping a project at a tollgate is not failure. If Measure shows the problem is a fraction of what was believed, closing the project frees people for a better one. The Control checklist also asks whether the Champion, the Belt and Finance all agree that the project is complete, a reminder that closure is a joint decision." },
      ],
    },
    {
      id: "boundary-traps",
      title: "Phase boundaries the exam loves",
      blocks: [
        { kind: "p", text: "Most deliverable questions test whether you can resist doing a later phase's work too early." },
        {
          kind: "list",
          items: [
            "**Root cause is proven in Analyze.** Define may record suspected causes or hypotheses; it never confirms them.",
            "**Control plans belong to Control.** Improve may sketch how a solution will be sustained, but the documented control plan with a response plan is a Control deliverable.",
            "**SIPOC detail is Measure in this syllabus.** Many programmes start a high-level SIPOC in Define, and the IASSC syllabus places Process Mapping, SIPOC and Value Stream Map under Measure (2.1.2). In Define you need only a high-level view of the process boundaries.",
            "**Benefits are estimated in Define and verified in Control.** A charter carries projected savings; the [[Finance Representative]] confirms realised savings at the end.",
            "**Solutions belong to Improve.** A charter that names a fix has skipped three phases.",
          ],
        },
        { kind: "callout", tone: "trap", title: "Trap: the confident charter", text: "A problem statement such as 'Installations are late because dispatchers ignore the schedule' contains a cause and a blame. The Define version is: 'In Q2, 18.6% of 3,941 residential fibre installations in the north region missed the booked window, generating 734 complaints.'" },
      ],
    },
  ],
  whyItMatters: [
    "Deliverable and phase-boundary questions are among the most common Define Phase items on the exam, and most of them hinge on one distinction: frame in Define, prove in Analyze, sustain in Control.",
    "In real projects, clear deliverables protect the team. A tollgate with agreed outputs stops sponsors from demanding solutions in week one and stops teams from drifting for months without results.",
  ],
  businessExample: {
    title: "A charter that survived its first tollgate",
    industry: "Telecommunications billing and collections",
    blocks: [
      { kind: "p", text: "Northwind Fibre's collections manager asked for a project to 'fix the billing system'. The Green Belt's first draft charter was rejected at the Define tollgate because it named a solution (a new billing platform) and had no baseline." },
      { kind: "p", text: "The revised charter stated: 'From January to June, 7.6% of 52,418 monthly business invoices were disputed, delaying payment by an average of 23 days and tying up an estimated 410,000 in receivables.' The goal was to reduce disputed invoices from 7.6% to 3.0% by December. Scope ran from tariff set-up to invoice dispatch; collections calls were out of scope." },
      { kind: "p", text: "The Champion approved it. Measure later confirmed the baseline, Analyze proved that two discount codes caused most disputes, and the Control tollgate included a Finance-verified reduction in days sales outstanding. Every claim appeared in the phase where it belonged." },
    ],
  },
  visual: {
    diagram: "dmaic",
    title: "The DMAIC roadmap and its tollgates",
    caption: "Each phase ends with a tollgate review where the Champion checks the deliverables before the project may move on.",
  },
  definitions: [
    { term: "DMAIC", definition: "The five-phase improvement roadmap: Define, Measure, Analyze, Improve, Control." },
    { term: "Deliverable", definition: "A tangible output (document, data set, analysis or decision) that a phase must produce before the project can move on." },
    { term: "Tollgate", definition: "A formal review at the end of a phase in which the Champion checks the deliverables and decides whether the project proceeds, repeats work or stops." },
    { term: "Project Charter", definition: "The Define document that sets out the business case, problem statement, goal statement, scope, team and timeline, and authorises the project." },
    { term: "Business Case", definition: "The explanation of why the project matters now and how it supports business goals, often including a preliminary estimate of benefits." },
    { term: "Problem Statement", definition: "A factual description of what is wrong, where, when, how big and with what impact, containing no cause, solution or blame." },
    { term: "Project Scope", definition: "The boundaries of the project: what is in and out of scope and where the process starts and ends." },
    { term: "Control plan", definition: "A Control Phase document that defines how the improved process is monitored, who responds, and what they do when performance drifts." },
  ],
  comparisons: [
    {
      title: "Define versus Analyze versus Control: who does what with causes and benefits",
      head: ["Topic", "Define", "Analyze", "Control"],
      rows: [
        ["Causes", "May list suspected causes; no proof", "Proves or disproves each X with data", "Monitors the critical X's that were proven"],
        ["Benefits", "Estimated (preliminary COPQ, projected savings)", "Refined as causes are quantified", "Verified and signed off by Finance"],
        ["Process view", "High-level boundaries", "Focus on steps linked to proven causes", "Updated procedures and standard work"],
        ["Key reviewer", "Champion approves the charter", "Champion reviews evidence", "Champion, Process Owner and Finance agree closure"],
      ],
    },
  ],
  misconceptions: [
    { myth: "The Define Phase should identify the root cause so the project can move quickly.", reality: "Define frames the problem. Root causes are proven with data in Analyze; naming one in Define biases the team and often turns out to be wrong." },
    { myth: "A tollgate is a formality once the project has started.", reality: "A tollgate is a real decision point. The Champion can redirect, pause or stop a project whose deliverables do not support continuing." },
    { myth: "The charter is written once and never changes.", reality: "The charter is a living document. The problem statement and scope are often refined in Measure as better data arrive, with the Champion's agreement." },
    { myth: "Savings in the charter are the project's results.", reality: "Charter figures are estimates. Only benefits measured after implementation and verified by Finance in Control count as realised." },
  ],
  examTraps: [
    { title: "Proving versus suspecting", text: "Words such as verify, confirm, prove or validate a root cause point to Analyze. Words such as identify the problem, frame, scope or charter point to Define." },
    { title: "SIPOC placement", text: "If asked where SIPOC is covered in the IASSC syllabus, the answer is Measure (2.1.2), even though many teams sketch a high-level SIPOC in Define." },
    { title: "Control plan and handover", text: "A documented control plan, a response plan and the handover to the Process Owner are Control deliverables, not Improve." },
    { title: "Estimated versus realised", text: "Estimated benefits appear in Define; realised, Finance-verified benefits appear in Control. Watch for the word verified." },
  ],
  workedExamples: [
    {
      title: "Sorting outputs into phases",
      scenario: "Kestrel Mobile's support project has produced six items: (a) a measurement system study of ticket categorisation; (b) a signed charter; (c) a regression showing that tickets routed through the legacy queue take 2.3 times longer; (d) a pilot of a new routing rule; (e) a response plan for when first-contact resolution falls below 68%; (f) a stakeholder map. Assign each to a phase.",
      steps: [
        "(b) charter and (f) stakeholder map frame the project: **Define**.",
        "(a) checking whether the measurement system can be trusted: **Measure**.",
        "(c) proving that a specific X drives the Y: **Analyze**.",
        "(d) testing a solution on a small scale: **Improve**.",
        "(e) deciding how to react when performance drifts: **Control**.",
      ],
      answer: "Define: b, f. Measure: a. Analyze: c. Improve: d. Control: e.",
    },
    {
      title: "Repairing a charter at the tollgate",
      scenario: "A draft goal statement reads: 'Improve customer experience in the repair process by introducing a new scheduling tool.' What is wrong, and what would a Define-ready version look like?",
      steps: [
        "It names a solution (a new scheduling tool), which belongs to Improve.",
        "It has no metric, baseline, target or date, so it is not SMART.",
        "Choose the primary metric linked to the problem, for example the percentage of repairs completed within the 8 hour promise.",
        "Use the baseline from the problem statement and set a target and deadline.",
      ],
      answer: "'Increase the share of residential repairs completed within 8 hours from 90.6% to 97% by 31 March.' No solution, measurable, time-bound.",
    },
  ],
  activity: {
    lab: "dmaic",
    prompt: "Drag each project output into the DMAIC phase where it belongs. Watch for the tempting ones: suspected causes, a SIPOC, a pilot, a response plan and Finance sign-off.",
  },
  checkQuestionIds: ["q-1.1.3-03", "q-1.1.3-06", "q-1.1.3-08"],
  takeaways: [
    "Each DMAIC phase has deliverables that must exist before the project passes its tollgate.",
    "Define frames the project: charter (business case, problem, goal, scope, team, timeline), VOC and CTQs, high-level process view, preliminary COPQ and stakeholder analysis.",
    "Good projects are recurring, measurable problems with unknown causes and a clear link to business goals.",
    "Tollgates are real decisions led by the Champion: proceed, rework, redirect or stop.",
    "Root causes are proven in Analyze; control plans and verified benefits belong to Control.",
    "In the IASSC syllabus, detailed process mapping and SIPOC sit in Measure (2.1.2).",
  ],
  flashcards: [
    { front: "Four Define goals on the book's DMAIC roadmap?", back: "Identify the problem area, determine the project focus, estimate COPQ, establish the team." },
    { front: "Elements of a project charter?", back: "Business case, problem statement, goal statement, scope, team and roles, timeline." },
    { front: "In which phase is root cause proven?", back: "Analyze." },
    { front: "In which phase is the control plan documented and handed over?", back: "Control, with handover to the Process Owner." },
    { front: "What is a tollgate?", back: "A formal end-of-phase review where the Champion checks deliverables and decides whether the project proceeds." },
    { front: "Where does SIPOC sit in the IASSC syllabus?", back: "Measure, topic 2.1.2 (often started at a high level in Define)." },
    { front: "What must a problem statement avoid?", back: "Causes, solutions and blame." },
    { front: "Estimated versus realised benefits?", back: "Estimated in Define (charter); realised and Finance-verified in Control." },
  ],
  sources: [
    { source: "syllabus", pdfPages: [7], note: "Lists 1.1.3 Deliverables of a Lean Six Sigma Project and places SIPOC under Measure 2.1.2." },
    { source: "gb-201-300", pdfPages: [233], printedPages: [230], note: "DMAIC roadmap with the goals of each phase and the Measure Phase flow." },
    { source: "gb-201-300", pdfPages: [234], printedPages: [231], note: "Measure Phase checklist and planning for action questions." },
    { source: "gb-501-600", pdfPages: [580, 581], printedPages: [577, 578], note: "DMAIC roadmap repeated; Control Phase steps and checklist, including verified financial impact and joint sign-off." },
    { source: "gb-501-600", pdfPages: [588], printedPages: [585], note: "Glossary definition of DMAIC." },
    { source: "supplementary", note: "Detailed charter elements, project selection criteria and tollgate practice are supplementary explanations." },
  ],
}
