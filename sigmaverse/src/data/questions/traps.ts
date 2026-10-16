import type { Question } from '../types'

/**
 * Trap-wording practice bank. q-trap-01 to q-trap-18 match the entries in
 * data/traps.ts; q-trap-19 to q-trap-30 mix several traps. All items are
 * original practice questions, not official exam questions.
 */
export const questions: Question[] = [
  // ---------- 01 NOT ----------
  {
    id: "q-trap-01",
    lesson: "1.3.1",
    category: "wording",
    difficulty: "trap",
    stem: "Northwind Fibre is drafting a charter for slow business broadband repairs. Which of the following should NOT appear in the problem statement?",
    options: [
      "The period in which the problem was observed (April to September 2026)",
      "The size of the gap: 31.7% of business faults restored later than the 8-hour SLA",
      "The plan to replace the dispatch system with a new scheduling platform",
      "The impact: about $148,000 in SLA credits over the period",
    ],
    answer: 2,
    explanation: "A problem statement describes what is wrong, when, where, how big and the impact. It must not contain a cause, a blame or a solution. Replacing the dispatch system is a solution, which belongs in Improve once root causes are verified.",
    optionNotes: [
      "Timing is a required element of a problem statement, so it should appear. Choosing it means the NOT was missed.",
      "Magnitude is a required element, stated with data. It belongs in the statement.",
      "Correct. A proposed solution pre-judges the cause and narrows the team's thinking; it does not belong in a problem statement.",
      "Business impact is a required element; it shows why the problem matters. It belongs in the statement.",
    ],
    optionMistakes: ["wording-negation", "wording-negation", null, "wording-negation"],
    traps: ["not"],
  },

  // ---------- 02 EXCEPT ----------
  {
    id: "q-trap-02",
    lesson: "1.4.4",
    category: "wording",
    difficulty: "trap",
    stem: "All of the following are among the seven elements of waste named in the IASSC Green Belt syllabus EXCEPT:",
    options: [
      "Conveyance",
      "Non-Utilized Talent",
      "Correction",
      "Overprocessing",
    ],
    answer: 1,
    explanation: "The detailed syllabus lists seven elements: Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance and Waiting. Non-Utilized Talent is the eighth waste in the DOWNTIME model mentioned in the syllabus introduction, so it is not one of the seven.",
    optionNotes: [
      "Conveyance (transportation) is one of the seven syllabus wastes.",
      "Correct. Non-Utilized Talent belongs to the eight-waste (DOWNTIME) model, not to the seven elements in the detailed syllabus.",
      "Correction (the defects waste) is one of the seven syllabus wastes.",
      "Overprocessing (extra-processing) is one of the seven syllabus wastes.",
    ],
    optionMistakes: ["wording-negation", null, "wording-negation", "wording-negation"],
    traps: ["except"],
  },

  // ---------- 03 LEAST ----------
  {
    id: "q-trap-03",
    lesson: "1.3.2",
    category: "wording",
    difficulty: "trap",
    stem: "Northwind Fibre charters a project to reduce repeat installation visits. Which measure is LEAST suitable as the project's primary metric?",
    options: [
      "Percentage of installations needing a second visit within 30 days",
      "Repeat visits per 1,000 completed installations",
      "Average number of days between the first and second visit, for installations that needed a second visit",
      "Number of team meetings held about repeat visits each month",
    ],
    answer: 3,
    explanation: "A primary metric must measure the project Y, the outcome in the goal statement. Options A to C all measure repeat visits in a usable form. The number of meetings measures project activity, not process performance, so it is the least suitable.",
    optionNotes: [
      "A clear, normalised measure of the problem. Suitable as a primary metric.",
      "A rate per 1,000 installs is also a sound measure of the Y. Suitable.",
      "A useful diagnostic measure linked to repeat visits, though narrower than A or B. Still far more suitable than counting meetings.",
      "Correct. Counting meetings measures effort, not results; it tells you nothing about whether repeat visits fell.",
    ],
    optionMistakes: ["wording-negation", "wording-negation", "metric-type", null],
    traps: ["least", "primary"],
  },

  // ---------- 04 MOST ----------
  {
    id: "q-trap-04",
    lesson: "1.2.3",
    category: "wording",
    difficulty: "advanced",
    stem: "Which cost at Kestrel Mobile is MOST likely to be classified as an external failure cost?",
    options: [
      "SLA penalty credits paid to a business customer after a 6-hour outage",
      "Engineers re-testing a firmware build that failed internal testing",
      "Training engineers on a new network configuration standard",
      "Auditing a sample of invoices before they are released",
    ],
    answer: 0,
    explanation: "External failure costs arise once a defect has reached the customer. SLA credits are paid because the customer experienced the outage, so this is the clearest external failure cost.",
    optionNotes: [
      "Correct. The failure reached the customer and triggered contractual credits: external failure.",
      "The defect was caught inside the company before release, so re-testing is an internal failure cost.",
      "Training stops defects being created, so it is a prevention cost.",
      "Routine checking before release is an appraisal cost.",
    ],
    optionMistakes: [null, "copq-classification", "copq-classification", "copq-classification"],
    traps: ["most"],
  },

  // ---------- 05 BEST ----------
  {
    id: "q-trap-05",
    lesson: "1.2.2",
    category: "ctq",
    difficulty: "advanced",
    stem: "Customers of Kestrel Mobile say: 'Your support line takes forever.' Which is the BEST CTQ derived from this VOC?",
    options: [
      "Improve support line responsiveness",
      "Hire 12 additional agents for the evening shift",
      "Calls answered by an agent within 60 seconds of leaving the IVR, for at least 90% of calls each week",
      "Customers should feel that the support line is fast",
    ],
    answer: 2,
    explanation: "A CTQ must be specific and measurable, with an operational definition and a requirement. Option C states the measure (seconds from IVR exit to agent answer), the limit (60 seconds) and the performance target (90% weekly).",
    optionNotes: [
      "A direction, not a CTQ: there is no measure or requirement.",
      "A solution, not a requirement. It jumps to Improve before the drivers are known.",
      "Correct. Measurable, operationally defined and with a clear target.",
      "Restates the feeling behind the VOC; it is not measurable.",
    ],
    optionMistakes: ["ctq-vague", "solution-in-problem", null, "ctq-vague"],
    traps: ["best"],
  },

  // ---------- 06 FIRST ----------
  {
    id: "q-trap-06",
    lesson: "1.1.3",
    category: "wording",
    difficulty: "trap",
    stem: "A Champion hands a Green Belt a rising number of invoice disputes from SME customers. What should the Green Belt do FIRST?",
    options: [
      "Run a fishbone session to identify the root cause",
      "Draft a project charter with the problem statement and scope, and confirm it with the Champion",
      "Implement automatic tariff validation rules in the billing system",
      "Set up a control chart to monitor the dispute rate",
    ],
    answer: 1,
    explanation: "The project starts in Define. Before analysing causes, implementing solutions or monitoring, the team must agree what problem it is solving, its scope and goal, and get the Champion's agreement through the charter.",
    optionNotes: [
      "Cause analysis belongs in Analyze, after the problem is defined and measured.",
      "Correct. The charter is the first Define deliverable and frames everything that follows.",
      "This is an Improve activity based on an untested assumption about the cause.",
      "Control charts belong to Measure (stability) and Control (monitoring), not to the very first step.",
    ],
    optionMistakes: ["phase-boundary", null, "solution-in-problem", "phase-boundary"],
    traps: ["first"],
  },

  // ---------- 07 PRIMARY ----------
  {
    id: "q-trap-07",
    lesson: "1.1.6",
    category: "wording",
    difficulty: "intermediate",
    stem: "What is the PRIMARY responsibility of the Champion on a Green Belt project?",
    options: [
      "Performing the statistical analysis of the project data",
      "Running the improved process day to day after handover",
      "Validating the hard and soft savings claimed by the team",
      "Sponsoring the project, securing resources and removing organisational barriers",
    ],
    answer: 3,
    explanation: "The Champion selects and sponsors projects, approves the charter, secures resources, removes barriers and reviews progress at tollgates. The other tasks belong mainly to other roles.",
    optionNotes: [
      "Analysis is done by the Belt leading the project, coached by a Black Belt or MBB.",
      "Running the process after handover is the Process Owner's job.",
      "Validating savings is the Finance Representative's job.",
      "Correct. Sponsorship and barrier removal are the core of the Champion role.",
    ],
    optionMistakes: ["role-confusion", "role-confusion", "role-confusion", null],
    traps: ["primary"],
  },

  // ---------- 08 BEFORE ----------
  {
    id: "q-trap-08",
    lesson: "1.1.3",
    category: "wording",
    difficulty: "trap",
    stem: "Which deliverable must be in place BEFORE the team can pass the Define tollgate?",
    options: [
      "A charter approved by the Champion",
      "A validated measurement system for the primary metric",
      "Root causes verified with data",
      "A control plan agreed with the Process Owner",
    ],
    answer: 0,
    explanation: "The Define tollgate reviews Define deliverables, and the approved charter is the central one. Measurement system validation belongs to Measure, verified root causes to Analyze and the control plan to Control.",
    optionNotes: [
      "Correct. Champion sign-off on the charter is what the Define tollgate confirms.",
      "Measurement system analysis is a Measure deliverable, done after Define.",
      "Root causes are verified in Analyze, two phases later.",
      "The control plan is a Control deliverable, at the end of the project.",
    ],
    optionMistakes: [null, "phase-boundary", "phase-boundary", "phase-boundary"],
    traps: ["before"],
  },

  // ---------- 09 AFTER ----------
  {
    id: "q-trap-09",
    lesson: "1.3.3",
    category: "wording",
    difficulty: "advanced",
    stem: "AFTER the solution has been implemented and the process handed to the Process Owner, which activity confirms that the project delivered its financial benefits?",
    options: [
      "The Green Belt re-calculates the COPQ estimate from the charter",
      "The Champion re-approves the original business case",
      "The Finance Representative verifies realized savings against the baseline",
      "The team holds a brainstorming session on further savings",
    ],
    answer: 2,
    explanation: "Once the solution is in place, benefits must be measured and verified. The Finance Representative compares actual results with the baseline and confirms the realized savings, normally in Control.",
    optionNotes: [
      "Re-using the charter estimate gives an estimated benefit, not a confirmed one.",
      "The business case is approved in Define; re-approving it confirms nothing about actual results.",
      "Correct. Finance verification of measured savings is the after-implementation confirmation.",
      "Brainstorming generates ideas; it does not confirm achieved benefits.",
    ],
    optionMistakes: ["estimated-vs-realized", "phase-boundary", null, null],
    traps: ["after", "realized-benefits"],
  },

  // ---------- 10 WITHOUT REWORK ----------
  {
    id: "q-trap-10",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "trap",
    stem: "An invoice validation step receives 1,240 invoices. 1,061 pass on the first attempt, 143 fail, are corrected and then pass, and 36 are rejected and cancelled. What percentage of invoices passed the step WITHOUT REWORK? (Round to one decimal place.)",
    options: [
      "97.1%",
      "85.6%",
      "88.1%",
      "2.9%",
    ],
    answer: 1,
    explanation: "Passing without rework is First Time Yield: units right first time / units entering. $FTY = 1{,}061 / 1{,}240 = 0.8556$, so 85.6%. The 143 corrected invoices needed rework, so they are excluded.",
    optionNotes: [
      "This is final yield: (1,061 + 143) / 1,240. It counts reworked invoices as good.",
      "Correct. 1,061 / 1,240 = 85.6%.",
      "This divides by the 1,204 invoices that eventually passed instead of the 1,240 that entered the step.",
      "This is the scrap rate (36 / 1,240), not a yield.",
    ],
    optionMistakes: ["fty-includes-rework", null, "percent-conversion", "fty-vs-rty"],
    traps: ["without-rework"],
    numeric: true,
  },

  // ---------- 11 FIRST PASS ----------
  {
    id: "q-trap-11",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "trap",
    stem: "Kestrel Mobile's number port-in process has three steps with first pass yields of 0.94, 0.89 and 0.97. What percentage of port requests get through all three steps on the FIRST PASS? (Round to one decimal place.)",
    options: [
      "93.3%",
      "89.0%",
      "80.0%",
      "81.2%",
    ],
    answer: 3,
    explanation: "Getting through every step first pass is Rolled Throughput Yield, the product of the step yields: $0.94 \\times 0.89 \\times 0.97 = 0.8115$, so 81.2%.",
    optionNotes: [
      "This is the average of the three yields. RTY is never an average.",
      "This is the lowest single step. RTY must be lower than the weakest step when other steps also lose units.",
      "This subtracts the summed loss rates (6% + 11% + 3%) from 100%. Close, but not the correct multiplication.",
      "Correct. 0.94 x 0.89 x 0.97 = 0.812.",
    ],
    optionMistakes: ["rty-added-or-averaged", "fty-vs-rty", "rty-added-or-averaged", null],
    traps: ["first-pass"],
    numeric: true,
  },

  // ---------- 12 TOTAL DEFECTS ----------
  {
    id: "q-trap-12",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "intermediate",
    stem: "A QA team audits 250 broadband installation work orders. 38 work orders contain errors: 27 have one error, 8 have two errors and 3 have three errors. What is the TOTAL number of defects?",
    options: [
      "38",
      "52",
      "114",
      "212",
    ],
    answer: 1,
    explanation: "Total defects weight each group by its number of defects: $27 \\times 1 + 8 \\times 2 + 3 \\times 3 = 27 + 16 + 9 = 52$.",
    optionNotes: [
      "38 is the number of defective work orders, not the number of defects.",
      "Correct. 27 + 16 + 9 = 52 defects.",
      "This assumes every defective order had three errors (38 x 3).",
      "212 is the number of work orders with no errors (250 - 38).",
    ],
    optionMistakes: ["defects-vs-defectives", null, "defects-vs-defectives", "defects-vs-defectives"],
    traps: ["total-defects"],
    numeric: true,
  },

  // ---------- 13 DEFECTIVE UNITS ----------
  {
    id: "q-trap-13",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "trap",
    stem: "A billing audit of 480 customer invoices finds 66 defects in total: 41 invoices have exactly one defect, 8 have two and 3 have three. What percentage of invoices are DEFECTIVE UNITS? (Round to one decimal place.)",
    options: [
      "10.8%",
      "13.8%",
      "89.2%",
      "0.14 defects per invoice",
    ],
    answer: 0,
    explanation: "Defective units are invoices with at least one defect, each counted once: $41 + 8 + 3 = 52$. Proportion defective = $52 / 480 = 0.1083$, so 10.8%.",
    optionNotes: [
      "Correct. 52 defective invoices out of 480 = 10.8%.",
      "This uses total defects (66 / 480), which is DPU expressed as a percentage, not proportion defective.",
      "This is the percentage of invoices with no defects (428 / 480).",
      "This is DPU (66 / 480 = 0.1375), a different metric from proportion defective.",
    ],
    optionMistakes: [null, "defects-vs-defectives", "percent-conversion", "dpu-vs-dpmo"],
    traps: ["defective-units"],
    numeric: true,
  },

  // ---------- 14 PER OPPORTUNITY ----------
  {
    id: "q-trap-14",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "trap",
    stem: "Kestrel Mobile audits 1,500 SIM activation orders. Each order has 8 opportunities for a defect, and auditors find 87 defects. What is the DPMO, the number of defects per million opportunities?",
    options: [
      "58,000",
      "0.00725",
      "7,250",
      "464,000",
    ],
    answer: 2,
    explanation: "$DPMO = \\frac{87}{1{,}500 \\times 8} \\times 10^6 = \\frac{87}{12{,}000} \\times 10^6 = 7{,}250$.",
    optionNotes: [
      "This is DPU x 1,000,000 (87 / 1,500): the opportunities were ignored.",
      "This is DPO. The final multiplication by 1,000,000 was forgotten.",
      "Correct. 87 / 12,000 x 1,000,000 = 7,250.",
      "This multiplies by the 8 opportunities instead of dividing by them.",
    ],
    optionMistakes: ["missing-opportunities", "missing-million", null, "missing-opportunities"],
    traps: ["per-opportunity"],
    numeric: true,
  },

  // ---------- 15 CUMULATIVE PERCENTAGE ----------
  {
    id: "q-trap-15",
    lesson: "1.2.4",
    category: "chart",
    difficulty: "trap",
    stem: "A contact centre logged the complaint categories below over one quarter. A correctly built Pareto chart is drawn from the data. What is the CUMULATIVE PERCENTAGE shown at the third bar? (Round to one decimal place.)",
    table: {
      head: ["Category", "Complaints"],
      rows: [
        ["Roaming charges", "96"],
        ["Billing errors", "412"],
        ["Other", "71"],
        ["Missed appointments", "164"],
        ["Slow broadband", "287"],
        ["Contract terms", "58"],
      ],
    },
    options: [
      "15.1%",
      "53.2%",
      "64.2%",
      "79.3%",
    ],
    answer: 3,
    explanation: "Sort descending (with 'Other' last): Billing errors 412, Slow broadband 287, Missed appointments 164, Roaming 96, Contract terms 58, Other 71. Total = 1,088. Cumulative at the third bar = $(412 + 287 + 164) / 1{,}088 = 863 / 1{,}088 = 79.3\\%$.",
    optionNotes: [
      "15.1% is the third bar on its own (164 / 1,088), not the cumulative value.",
      "53.2% adds the first three rows of the unsorted table (96 + 412 + 71). The chart must be sorted first.",
      "64.2% is the cumulative value at the second bar, not the third.",
      "Correct. (412 + 287 + 164) / 1,088 = 79.3%.",
    ],
    optionMistakes: ["cumulative-percent", "pareto-reading", "pareto-reading", null],
    traps: ["cumulative-percentage"],
    numeric: true,
  },

  // ---------- 16 VERIFIED ROOT CAUSE ----------
  {
    id: "q-trap-16",
    lesson: "1.1.4",
    category: "wording",
    difficulty: "advanced",
    stem: "A team is investigating dropped calls on Kestrel Mobile's network. Which statement describes a VERIFIED ROOT CAUSE?",
    options: [
      "The cause that received the most votes in the team's fishbone session",
      "The cause the network operations manager is confident about from 15 years of experience",
      "A cause whose effect on the drop rate was confirmed with data analysis in the Analyze phase",
      "The cause written in the problem statement of the Define-phase charter",
    ],
    answer: 2,
    explanation: "A root cause is verified only when data show that it drives the Y. Votes and expert opinion generate hypotheses; the charter should not contain a cause at all.",
    optionNotes: [
      "Voting prioritises suspected causes for investigation; it does not verify them.",
      "Experience is valuable for generating hypotheses, but confidence is not evidence.",
      "Correct. Data-based confirmation in Analyze is what makes a cause verified.",
      "A Define problem statement should contain no cause; anything written there is at most a suspicion.",
    ],
    optionMistakes: ["cause-vs-root-cause", "cause-vs-root-cause", null, "solution-in-problem"],
    traps: ["verified-root-cause"],
  },

  // ---------- 17 ESTIMATED BENEFITS ----------
  {
    id: "q-trap-17",
    lesson: "1.3.3",
    category: "wording",
    difficulty: "advanced",
    stem: "During Define, the charter for a project on SLA credits must state ESTIMATED BENEFITS. Which figure fits this requirement?",
    options: [
      "A projected annual reduction of about $186,000 in SLA credits if the goal is met, based on the baseline COPQ",
      "The $91,400 reduction in credits confirmed by Finance six months after Control handover",
      "Actual credits recorded in the general ledger last quarter after the fix went live",
      "The $42,000 cost of the project team's time",
    ],
    answer: 0,
    explanation: "Estimated benefits are a forecast made before implementation, typically from baseline COPQ and the goal. They help the Champion decide whether the project is worth doing.",
    optionNotes: [
      "Correct. A projection based on baseline and goal is exactly what Define provides.",
      "This is a realized benefit, measured and verified after implementation.",
      "Ledger figures after the fix went live are realized results, not estimates.",
      "This is a project cost, not a benefit. It is needed for ROI but answers a different question.",
    ],
    optionMistakes: [null, "estimated-vs-realized", "estimated-vs-realized", null],
    traps: ["estimated-benefits"],
  },

  // ---------- 18 REALIZED BENEFITS ----------
  {
    id: "q-trap-18",
    lesson: "1.3.3",
    category: "wording",
    difficulty: "advanced",
    stem: "Which evidence BEST demonstrates the REALIZED BENEFITS of a project that cut repeat technician visits?",
    options: [
      "The projected savings in the charter approved at the Define tollgate",
      "Monthly finance reconciliation showing lower contractor visit spend against the baseline for six months after implementation, signed off by Finance",
      "A pilot simulation forecasting a 38% drop in repeat visits",
      "A team survey in which technicians say their workload feels lighter",
    ],
    answer: 1,
    explanation: "Realized benefits are measured after implementation, compared with the baseline and verified, usually by the Finance Representative. Only option B has all three features.",
    optionNotes: [
      "Charter savings are estimated benefits, made before any change.",
      "Correct. Post-implementation, baseline comparison and Finance sign-off together demonstrate realized benefits.",
      "A simulation is a forecast, not a measured result.",
      "Perceptions may indicate soft benefits but are not measured, verified savings.",
    ],
    optionMistakes: ["estimated-vs-realized", null, "estimated-vs-realized", "estimated-vs-realized"],
    traps: ["best", "realized-benefits"],
  },

  // ---------- 19 NOT + defective units ----------
  {
    id: "q-trap-19",
    lesson: "1.2.5",
    category: "incorrect-statement",
    difficulty: "trap",
    stem: "Which statement about defects and defectives is NOT correct?",
    options: [
      "A unit with three defects is counted as one defective unit",
      "The number of defective units can never exceed the total number of defects",
      "DPU can be greater than 1",
      "The proportion of defective units is always equal to DPU",
    ],
    answer: 3,
    explanation: "Proportion defective counts each faulty unit once; DPU counts every defect. They are equal only when no unit has more than one defect, so the word 'always' makes option D false.",
    optionNotes: [
      "True. A defective is a unit with at least one defect, counted once.",
      "True. Each defective unit has at least one defect, so defects are always at least as many as defectives.",
      "True. If units carry several defects each, DPU exceeds 1.",
      "Correct choice, because the statement is false: when some units have more than one defect, DPU is higher than the proportion defective.",
    ],
    optionMistakes: ["wording-negation", "defects-vs-defectives", "dpu-vs-dpmo", null],
    traps: ["not", "defective-units"],
  },

  // ---------- 20 EXCEPT + goal statement ----------
  {
    id: "q-trap-20",
    lesson: "1.3.1",
    category: "wording",
    difficulty: "advanced",
    stem: "A SMART goal statement for a Green Belt project should contain all of the following EXCEPT:",
    options: [
      "The baseline value of the primary metric",
      "The target value of the primary metric",
      "The solution the team will implement to reach the target",
      "The date by which the target should be achieved",
    ],
    answer: 2,
    explanation: "A goal statement follows the pattern 'reduce or increase [metric] from [baseline] to [target] by [date]'. It must not name a solution, because the solution is selected in Improve after the root causes are verified.",
    optionNotes: [
      "Required: the baseline shows where the metric starts.",
      "Required: the target shows how far the metric must move.",
      "Correct. A solution does not belong in a goal statement.",
      "Required: a deadline makes the goal time-bound.",
    ],
    optionMistakes: ["wording-negation", "smart-goal", null, "smart-goal"],
    traps: ["except"],
  },

  // ---------- 21 FIRST + Pareto ----------
  {
    id: "q-trap-21",
    lesson: "1.2.4",
    category: "wording",
    difficulty: "intermediate",
    stem: "A support team wants to build a Pareto chart of ticket reasons from raw data. Which step should be done FIRST?",
    options: [
      "Define the categories and count how often each occurs over a set period",
      "Draw the cumulative percentage line",
      "Sort the categories in descending order",
      "Identify the vital few categories",
    ],
    answer: 0,
    explanation: "You cannot sort, plot a cumulative line or pick the vital few until you have clear categories and counts for a defined period. Categorising and counting is the first step.",
    optionNotes: [
      "Correct. Categories and counts are the raw material of every later step.",
      "The cumulative line is drawn after sorting and plotting the bars.",
      "Sorting requires counts to exist first.",
      "Identifying the vital few is the final interpretation step.",
    ],
    optionMistakes: [null, "cumulative-percent", "pareto-reading", "pareto-reading"],
    traps: ["first"],
  },

  // ---------- 22 BEST + PRIMARY ----------
  {
    id: "q-trap-22",
    lesson: "1.3.2",
    category: "wording",
    difficulty: "advanced",
    stem: "Kestrel Mobile wants to cut average handle time (AHT) in its contact centre without hurting first contact resolution (FCR). Which metric pairing is BEST?",
    options: [
      "Primary metric: FCR; secondary metric: AHT",
      "Primary metric: AHT; secondary metric: FCR",
      "Primary metric: number of calls handled per agent; secondary metric: AHT",
      "Primary metric: AHT; secondary metric: number of agents trained",
    ],
    answer: 1,
    explanation: "The primary metric is the Y the project promises to improve (AHT). The secondary metric guards against side effects, and the stem names FCR as the thing that must not get worse.",
    optionNotes: [
      "Reversed. The goal is to cut AHT, so AHT is primary; FCR is the guardrail.",
      "Correct. AHT is the project Y; FCR protects against rushing customers.",
      "Calls per agent is a related productivity measure, not the stated goal, and AHT would then be in the wrong role.",
      "Agents trained is an activity count, not a guard against a side effect on customers.",
    ],
    optionMistakes: ["metric-type", null, "metric-type", "metric-type"],
    traps: ["best", "primary"],
  },

  // ---------- 23 LEAST + COPQ ----------
  {
    id: "q-trap-23",
    lesson: "1.2.3",
    category: "wording",
    difficulty: "trap",
    stem: "Using the strict definition, which of the following is LEAST likely to be counted as part of the Cost of Poor Quality at Northwind Fibre?",
    options: [
      "Labour to re-splice fibre joints that failed the installer's own test",
      "Service credits paid to customers for missed installation appointments",
      "Training technicians on the new splicing standard",
      "Revenue lost when customers cancel after repeated outages",
    ],
    answer: 2,
    explanation: "Strictly, COPQ is the sum of internal and external failure costs. Training is a prevention cost: a cost of good quality. Note that some programmes use COPQ loosely for all four categories, which is why the stem says 'strict definition'.",
    optionNotes: [
      "Re-splicing caught before the customer is an internal failure cost, part of COPQ.",
      "Credits after the customer is affected are external failure costs, part of COPQ.",
      "Correct. Training is prevention, a cost of good quality, so it is the least likely to count as COPQ.",
      "Lost customers are an external failure cost, often the largest part of COPQ.",
    ],
    optionMistakes: ["copq-classification", "copq-classification", null, "copq-classification"],
    traps: ["least"],
  },

  // ---------- 24 MOST + waste ----------
  {
    id: "q-trap-24",
    lesson: "1.4.4",
    category: "wording",
    difficulty: "intermediate",
    stem: "A field engineer repeatedly climbs in and out of the van and walks around it to find the right tools for each job. Which waste is MOST directly illustrated?",
    options: [
      "Conveyance",
      "Motion",
      "Waiting",
      "Overprocessing",
    ],
    answer: 1,
    explanation: "Motion is unnecessary movement of people within their work area: searching, reaching and walking. Here the engineer moves, not the materials, so Motion is the best fit. A 5S Straighten exercise would address it.",
    optionNotes: [
      "Conveyance is moving items or information between locations. The tools are not being transported; the person is moving.",
      "Correct. The person's own unnecessary movement is Motion.",
      "Waiting may follow, but the stem describes searching movement, not idle time.",
      "Overprocessing is doing more work than the customer requires on the unit; searching for tools is not extra work on the output.",
    ],
    optionMistakes: ["waste-confusion", null, "waste-confusion", "waste-confusion"],
    traps: ["most"],
  },

  // ---------- 25 NOT + 5S ----------
  {
    id: "q-trap-25",
    lesson: "1.4.5",
    category: "incorrect-statement",
    difficulty: "trap",
    stem: "Which of the following 5S pairings is NOT correct?",
    options: [
      "Sort = Seiri",
      "Straighten = Seiton",
      "Shine = Seiso",
      "Self-Discipline = Seiketsu",
    ],
    answer: 3,
    explanation: "The correct pairings are Sort (Seiri), Straighten (Seiton), Shine (Seiso), Standardize (Seiketsu) and Self-Discipline (Shitsuke). Option D swaps the fourth and fifth Japanese terms.",
    optionNotes: [
      "Correct pairing. Seiri is the first S, Sort.",
      "Correct pairing. Seiton is the second S, Straighten (Set in Order).",
      "Correct pairing. Seiso is the third S, Shine.",
      "Correct choice, because the pairing is wrong: Seiketsu is Standardize; Self-Discipline is Shitsuke.",
    ],
    optionMistakes: ["wording-negation", "wording-negation", "wording-negation", null],
    traps: ["not"],
  },

  // ---------- 26 AFTER + BEFORE ----------
  {
    id: "q-trap-26",
    lesson: "1.1.3",
    category: "dmaic-boundary",
    difficulty: "trap",
    stem: "A team has just verified its root causes. Which activity comes next, AFTER this point and BEFORE the control plan is written?",
    options: [
      "Generating, selecting and piloting solutions",
      "Writing the problem statement",
      "Validating the measurement system",
      "Estimating the project's COPQ for the business case",
    ],
    answer: 0,
    explanation: "Verifying root causes closes Analyze. Improve comes next: generate, select and pilot solutions. The control plan follows in Control.",
    optionNotes: [
      "Correct. Improve sits between verified root causes (Analyze) and the control plan (Control).",
      "The problem statement is written in Define, long before root causes are verified.",
      "Measurement system validation is a Measure activity that precedes Analyze.",
      "The COPQ estimate supports the Define business case, at the start of the project.",
    ],
    optionMistakes: [null, "phase-boundary", "phase-boundary", "phase-boundary"],
    traps: ["after", "before", "verified-root-cause"],
  },

  // ---------- 27 PER OPPORTUNITY + TOTAL DEFECTS + DEFECTIVE UNITS ----------
  {
    id: "q-trap-27",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "master",
    stem: "Auditors check 320 mobile number port-out requests, each with 5 opportunities for a defect. 24 requests have one defect, 6 have two defects and 2 have four defects. Using TOTAL DEFECTS, not defective units, what is the DPMO (defects per million opportunities)?",
    options: [
      "20,000",
      "137,500",
      "27,500",
      "0.0275",
    ],
    answer: 2,
    explanation: "Total defects = $24 \\times 1 + 6 \\times 2 + 2 \\times 4 = 44$. Opportunities = $320 \\times 5 = 1{,}600$. $DPMO = 44 / 1{,}600 \\times 10^6 = 27{,}500$.",
    optionNotes: [
      "This uses the 32 defective requests instead of the 44 defects (32 / 1,600 x 1,000,000).",
      "This ignores opportunities: 44 / 320 = 0.1375 DPU, multiplied by one million.",
      "Correct. 44 / 1,600 x 1,000,000 = 27,500.",
      "This is DPO; the multiplication by 1,000,000 was forgotten.",
    ],
    optionMistakes: ["defects-vs-defectives", "missing-opportunities", null, "missing-million"],
    traps: ["total-defects", "defective-units", "per-opportunity"],
    numeric: true,
  },

  // ---------- 28 FIRST PASS + WITHOUT REWORK ----------
  {
    id: "q-trap-28",
    lesson: "1.2.5",
    category: "calculation",
    difficulty: "master",
    stem: "A fault ticket passes through three steps. The team reports final yields (after rework) of 99%, 98% and 99%, and first time yields of 91%, 87% and 95%. What percentage of tickets go through the whole process on the FIRST PASS, WITHOUT REWORK at any step? (Round to one decimal place.)",
    options: [
      "75.2%",
      "96.0%",
      "91.0%",
      "87.0%",
    ],
    answer: 0,
    explanation: "Whole process, first pass, no rework anywhere = RTY built from first time yields: $0.91 \\times 0.87 \\times 0.95 = 0.7521$, so 75.2%. Final yields are irrelevant because they include rework.",
    optionNotes: [
      "Correct. 0.91 x 0.87 x 0.95 = 75.2%.",
      "This multiplies the final yields (0.99 x 0.98 x 0.99), which count reworked tickets as good.",
      "This is the average of the first time yields. RTY is a product, not an average.",
      "This is the lowest single-step FTY. The whole-process figure must be lower.",
    ],
    optionMistakes: [null, "fty-includes-rework", "rty-added-or-averaged", "fty-vs-rty"],
    traps: ["first-pass", "without-rework"],
    numeric: true,
  },

  // ---------- 29 NOT + VERIFIED ROOT CAUSE ----------
  {
    id: "q-trap-29",
    lesson: "1.3.1",
    category: "wording",
    difficulty: "advanced",
    stem: "Which of the following should NOT be included in the Define-phase charter of a project on high SME invoice dispute rates?",
    options: [
      "Baseline: 6.8% of SME invoices disputed, January to June 2026",
      "Scope: SME invoices from the main billing platform only",
      "Team: Green Belt, billing Process Owner and a Finance Representative",
      "Root cause: billing clerks entering tariffs manually",
    ],
    answer: 3,
    explanation: "A root cause is verified with data in Analyze. Writing an unproven cause into the charter biases the team, and naming a group of clerks also adds blame. Baseline, scope and team are standard charter elements.",
    optionNotes: [
      "A baseline belongs in the charter; it frames the problem and goal.",
      "Scope belongs in the charter; it sets the boundaries.",
      "Team and roles belong in the charter.",
      "Correct. An unverified root cause (with implied blame) does not belong in a Define charter.",
    ],
    optionMistakes: ["wording-negation", "wording-negation", "wording-negation", null],
    traps: ["not", "verified-root-cause"],
  },

  // ---------- 30 BEST + REALIZED BENEFITS (hard savings) ----------
  {
    id: "q-trap-30",
    lesson: "1.3.3",
    category: "business-case",
    difficulty: "master",
    stem: "At the Control tollgate, which item is the BEST example of a hard saving that can be reported as a REALIZED BENEFIT?",
    options: [
      "1,900 agent hours a year freed and redeployed to retention calls",
      "A $74,300 reduction in contractor invoices over six months compared with the baseline, verified by Finance",
      "Avoiding the planned hire of 6 extra agents next year",
      "The $186,000 annual saving projected in the charter",
    ],
    answer: 1,
    explanation: "A hard saving shows up on the profit and loss statement, and a realized benefit is measured after implementation and verified. Only the verified fall in contractor spend meets both conditions.",
    optionNotes: [
      "Freed hours that are redeployed, not removed from the budget, are a soft saving.",
      "Correct. Lower actual spend, compared with the baseline and verified by Finance, is a realized hard saving.",
      "Avoiding a future, unbudgeted cost is cost avoidance, normally classed as soft.",
      "The charter projection is an estimated benefit, not a realized one.",
    ],
    optionMistakes: [null, null, null, "estimated-vs-realized"],
    traps: ["best", "realized-benefits", "estimated-benefits"],
  },
]
