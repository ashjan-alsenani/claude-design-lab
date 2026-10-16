import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: "1.1.1",
  module: 1,
  officialTitle: "Meanings of Six Sigma",
  title: "What Six Sigma Really Means",
  subtitle: "One name, four meanings: a philosophy, a metric, a method and a way of running a business",
  readingMinutes: 14,
  status: "partial-source",
  objectives: [
    "Explain the four meanings of Six Sigma: philosophy, metric, methodology and management system.",
    "Describe why customers experience variation rather than averages, and connect variation to defects.",
    "Interpret a sigma level as the number of standard deviations that fit between the process mean and the nearest specification limit.",
    "Read an approximate sigma level from a DPMO value using the conventional sigma table.",
    "State the assumptions behind the 3.4 DPMO figure, including the 1.5 sigma shift and short-term versus long-term performance.",
    "Contrast Six Sigma with opinion-driven, firefighting styles of problem solving and link quality to business results.",
  ],
  overview: [
    "Ask five managers what [[Six Sigma]] means and you may hear five different answers: a quality target, a training programme with coloured belts, a five-phase project method, a statistics toolkit, or a culture. Each of them is partly right. The term carries several layers of meaning, and the exam expects you to recognise all of them and to know which one a question is pointing at.",
    "Underneath every meaning sits one idea: customers judge you on each individual experience, not on your monthly average. A process that is usually fine but occasionally terrible will still lose customers. Six Sigma is the discipline of measuring that inconsistency, finding what drives it, and holding the gains once it has been reduced.",
  ],
  sections: [
    {
      id: "four-meanings",
      title: "Four meanings of one name",
      blocks: [
        { kind: "p", text: "It helps to hold the four meanings side by side. They are not competing definitions; they are layers that build on each other, from a mindset down to a set of numbers and back up to how a company is managed." },
        {
          kind: "table",
          caption: "The layers of meaning in Six Sigma",
          head: ["Meaning", "What it says", "What you would see in a service operation"],
          rows: [
            ["**Philosophy**", "Decisions should rest on data; every outcome has causes that can be found; reducing [[Variation]] is the route to quality.", "Team meetings start with a chart of last month's ticket handling times, not with anecdotes."],
            ["**Metric**", "Performance can be expressed as a [[Sigma Level]] or as [[DPMO]], so very different processes can be compared on one scale.", "Billing accuracy is reported as 4.5 sigma, field installations as 3.1 sigma."],
            ["**Methodology**", "Problems are solved with a structured roadmap, [[DMAIC]], using proven tools in a deliberate order.", "A Green Belt project moves from charter to measurement, analysis, improvement and control."],
            ["**Management system**", "Leaders select projects that serve strategy, assign trained people, review progress and track financial results.", "A quarterly portfolio review where a [[Champion]] approves new projects and checks realised savings."],
          ],
        },
        { kind: "p", text: "The training book's glossary leans towards the last two layers: it describes the Six Sigma system as a combination of analytical tools, project management techniques, reporting methods and management techniques that together form a problem solving and business improvement method. Notice the word *combined*. Statistics alone, without project selection and leadership, is not Six Sigma." },
        { kind: "callout", tone: "memory", title: "Memory hook: P-M-M-M", text: "**P**hilosophy, **M**etric, **M**ethodology, **M**anagement system. Think of it as a building: the philosophy is the foundation, the metric is the measuring tape, the methodology is the construction plan, and the management system is the site manager deciding what gets built." },
      ],
    },
    {
      id: "variation-and-defects",
      title: "Defects, variation and why customers feel the spread",
      blocks: [
        { kind: "p", text: "A [[Defect]] is any output that fails to meet a requirement: a repair visit outside the promised window, an invoice with a wrong tariff, a support chat that breaches its response target. Defects rarely come from a process that is wrong on average. They come from the tails, the occasional outcomes that fall outside what the customer will accept." },
        { kind: "p", text: "Imagine two broadband repair teams that both average 4.1 hours from fault report to fix. Team A almost always lands between 3.5 and 4.7 hours. Team B ranges from 1 hour to 11 hours. The averages are identical, yet Team B generates angry calls, compensation credits and [[Service Level Agreement]] breaches every week. The customer does not live in the average; each customer lives in one data point." },
        { kind: "callout", tone: "tip", title: "The core insight", text: "Reducing variation is often more valuable than shifting the average. A consistent process is predictable, easier to plan staff around, and produces fewer outcomes beyond the [[Specification Limits]]." },
        { kind: "p", text: "This is why Six Sigma frames quality as conformance to customer requirements and performance as the consistency with which those requirements are met. A requirement needs a number, such as a repair within 8 hours, before any defect can be counted." },
      ],
    },
    {
      id: "sigma-level",
      title: "What sigma actually measures",
      blocks: [
        { kind: "p", text: "The Greek letter sigma is the symbol for [[Standard Deviation]], the typical distance of individual results from the mean. A sigma level, also called a sigma score or Z, answers one practical question: **how many standard deviations fit between the process mean and the nearest specification limit?** The book's glossary describes the sigma score in exactly these terms, using short-term standard deviations." },
        { kind: "formula", tex: "Z = \\frac{USL - \\bar{x}}{s}", caption: "For an upper limit. For a lower limit use $(\\bar{x} - LSL) / s$, and report the smaller of the two when both limits exist." },
        { kind: "p", text: "The more standard deviations you can fit into that gap, the further the mean sits from the edge and the rarer a defect becomes. You can raise the sigma level in two ways: move the mean away from the limit, or shrink the standard deviation. In practice the second lever is usually the more powerful one." },
        {
          kind: "example",
          title: "Example: fitting standard deviations into the gap",
          blocks: [
            { kind: "p", text: "Kestrel Mobile promises to activate business SIM orders within 30 minutes (USL = 30). Activation time has a mean of 22 minutes and a standard deviation of 2.5 minutes." },
            { kind: "formula", tex: "Z = \\frac{30 - 22}{2.5} = 3.2" },
            { kind: "p", text: "About 3.2 standard deviations fit between the mean and the limit. If the team cut the standard deviation to 1.6 minutes without moving the mean, Z would become 8 / 1.6 = 5.0, a far more consistent process with the same average." },
          ],
        },
      ],
    },
    {
      id: "the-3-4-claim",
      title: "The 3.4 DPMO claim and the 1.5 sigma shift",
      blocks: [
        { kind: "p", text: "Six Sigma is famous for the figure of 3.4 [[DPMO|defects per million opportunities]]. That number is not what a perfectly centred, perfectly stable six-sigma process would produce. It rests on a convention: processes observed over the long term tend to drift, so the mean is assumed to move by up to 1.5 standard deviations. A process that is six sigma in the short term is therefore treated as 4.5 sigma in the long term, and the tail beyond 4.5 standard deviations is about 3.4 per million." },
        {
          kind: "table",
          caption: "Sigma level and long-term DPMO (conventional 1.5 sigma shift, one-sided)",
          head: ["Sigma level (short-term)", "Long-term DPMO", "Long-term yield (approx.)"],
          rows: [
            ["1", "691,462", "30.9%"],
            ["2", "308,538", "69.1%"],
            ["3", "66,807", "93.3%"],
            ["4", "6,210", "99.38%"],
            ["5", "233", "99.977%"],
            ["6", "3.4", "99.99966%"],
          ],
        },
        { kind: "p", text: "Two consequences matter for the exam. First, without the shift, a centred six sigma process with two specification limits would produce only about 0.002 DPMO, roughly two defects per billion. Second, the table is not linear: moving from 3 to 4 sigma removes about 60,600 defects per million, while moving from 5 to 6 removes fewer than 230. Each step is harder to earn than the last." },
        { kind: "callout", tone: "trap", title: "Trap: the shift is a convention, not a law", text: "The 1.5 sigma shift is an industry assumption used to convert between short-term and long-term performance. The training book itself says the theory behind it is not important for practitioners. Some statisticians criticise it. On the exam, accept it as the standard convention, but do not describe it as a proven property of every process." },
        {
          kind: "advanced",
          title: "Go deeper: short-term versus long-term sigma",
          blocks: [
            { kind: "p", text: "Short-term data are collected over a window too narrow to experience every source of variation: a single shift, one agent group, one software release. Long-term data include the drift from staff changes, seasonal demand and system upgrades. Because long-term data contain more variation, long-term sigma (Z LT) is lower." },
            { kind: "formula", tex: "Z_{ST} = Z_{LT} + 1.5", caption: "The conventional conversion. Attribute data such as defect counts are normally treated as long-term, so 1.5 is added to report a short-term sigma level." },
            { kind: "p", text: "When someone quotes a sigma level, always ask whether it is short-term or long-term, and whether the shift has been applied. The same DPMO can be honestly reported as 4.5 or 3.0 sigma depending on that choice." },
          ],
        },
      ],
    },
    {
      id: "different-from-firefighting",
      title: "How Six Sigma differs from traditional problem solving",
      blocks: [
        { kind: "p", text: "Traditional problem solving in many service centres is firefighting: an escalation arrives, a senior person proposes a fix based on experience, the fix is applied, and the team moves to the next fire. Some fixes work, many treat symptoms, and few are checked later. Six Sigma differs in three ways." },
        {
          kind: "list",
          ordered: true,
          items: [
            "**Data before opinion.** The problem is measured first, with an agreed definition, so the team knows the size of the gap and its baseline.",
            "**Root cause before solution.** Suspected causes are tested with data, and only a proven [[Root Cause]] earns a solution.",
            "**Control after improvement.** Gains are locked in with monitoring and response plans, so the problem does not quietly return.",
          ],
        },
        { kind: "p", text: "The point of all this is business performance. Fewer defects mean less [[Rework]], fewer credits and penalties, lower handling cost and higher retention. A Six Sigma project is chosen because closing a quality gap moves a number the business cares about, such as churn, cost per contact or cash collected." },
      ],
    },
  ],
  whyItMatters: [
    "Exam questions often hide which meaning of Six Sigma they are using. A question about 3.4 DPMO is about the metric; a question about Champions and project selection is about the management system. Recognising the layer is half the answer.",
    "At work, the sigma vocabulary lets you compare unlike processes, such as order entry and network fault repair, on one scale, and it moves conversations about service quality away from anecdotes towards evidence.",
  ],
  businessExample: {
    title: "Halving the spread of repair times at Northwind Fibre",
    industry: "Telecommunications field service",
    blocks: [
      { kind: "p", text: "Northwind Fibre promised residential customers a fault repair within 8 hours. The monthly report showed an average of 5.2 hours, and leadership believed performance was healthy. Yet 9.4% of the 6,117 repairs in one quarter breached the promise, triggering credits and a spike in complaints." },
      { kind: "p", text: "A Green Belt reframed the conversation around variation: the standard deviation of repair time was 2.1 hours, so only about 1.3 standard deviations fit between the mean and the 8 hour limit. The project focused on the causes of the long tail (parts not on the van, and jobs dispatched without line test results) rather than on the average." },
      { kind: "p", text: "After the improvements, the mean barely moved, to 4.9 hours, but the standard deviation fell to 1.2 hours. Z rose to about 2.6, breaches fell to under 1%, and the credits budget dropped accordingly. The customer felt the change even though the headline average hardly changed." },
    ],
  },
  visual: {
    diagram: "sigma-curve",
    title: "How many standard deviations fit before the limit?",
    caption: "Shrink the spread of the curve and more standard deviations fit between the mean and the specification limit, so the tail beyond the limit, where defects live, becomes smaller.",
  },
  definitions: [
    { term: "Six Sigma", definition: "A data-driven philosophy, performance metric, structured improvement methodology (DMAIC) and management system aimed at reducing defects and variation in processes that matter to customers and the business." },
    { term: "Defect", definition: "An output of a process that does not meet a defined requirement, such as a deadline, an accuracy rule or a specification limit." },
    { term: "Variation", definition: "The tendency of a process to produce different results each time it runs. Customers experience variation as inconsistency." },
    { term: "Standard Deviation", definition: "A measure of spread: the typical distance of individual values from the mean. Represented by the Greek letter sigma." },
    { term: "Sigma Level", definition: "The number of standard deviations that fit between the process mean and the nearest specification limit. Higher means fewer defects." },
    { term: "DPMO", definition: "Defects per million opportunities: total defects divided by total opportunities, multiplied by 1,000,000." },
    { term: "1.5 sigma shift", definition: "The conventional assumption that a process mean drifts by up to 1.5 standard deviations over the long term, used to convert between short-term and long-term sigma levels." },
  ],
  comparisons: [
    {
      title: "Traditional problem solving versus Six Sigma",
      head: ["Aspect", "Traditional firefighting", "Six Sigma"],
      rows: [
        ["Starting point", "The loudest complaint or latest escalation", "A measured gap linked to customer and business needs"],
        ["Basis for decisions", "Experience, opinion, seniority", "Data with agreed operational definitions"],
        ["Cause", "Assumed, often the first plausible explanation", "Root cause proven with data before solving"],
        ["Focus", "Averages and individual incidents", "Variation and the whole process"],
        ["After the fix", "Move on; problem may return", "Control plan, monitoring and ownership"],
        ["Success measured by", "The fire being out", "Sustained metric improvement and verified financial benefit"],
      ],
    },
  ],
  misconceptions: [
    { myth: "Six Sigma simply means having 3.4 defects per million.", reality: "3.4 DPMO is one meaning, the metric. Six Sigma is also a philosophy, the DMAIC methodology and a management system. Most projects never reach six sigma, and they do not need to in order to deliver value." },
    { myth: "If the average meets the target, the process is fine.", reality: "Customers feel each individual result. A good average with wide spread still produces many outcomes beyond the limit, which is why Six Sigma focuses on variation." },
    { myth: "A six sigma process with no drift produces 3.4 DPMO.", reality: "A centred six sigma process would produce about 0.002 DPMO. The 3.4 figure assumes the conventional 1.5 sigma long-term shift." },
    { myth: "Six Sigma is only for manufacturing.", reality: "Any process with a measurable output and a requirement can be studied: invoices, support tickets, installation appointments, claims and call handling all qualify." },
  ],
  examTraps: [
    { title: "Short-term or long-term?", text: "If a question gives a long-term DPMO and asks for the sigma level as conventionally reported, the table already includes the 1.5 shift. Do not add or subtract 1.5 a second time." },
    { title: "Sigma (the symbol) versus sigma level", text: "Lower-case sigma is the standard deviation: smaller is better. Sigma level is a count of standard deviations to the limit: larger is better. Read which one the stem means." },
    { title: "Which meaning is being tested?", text: "Stems that mention Champions, project selection or reviews are about the management system; stems about DPMO and Z are about the metric; stems about phases are about the methodology." },
    { title: "Nearest limit", text: "With two specification limits, the sigma level is based on the closer limit, because that is where most defects will occur." },
  ],
  workedExamples: [
    {
      title: "Reading a sigma level from DPMO",
      scenario: "Kestrel Mobile audits 4,382 business invoices. Each invoice has 5 opportunities for a defect (tariff, discount, tax, address, payment terms). Auditors find 31 defects. Estimate the sigma level using the conventional table.",
      steps: [
        "Total opportunities = 4,382 x 5 = 21,910.",
        "DPO = 31 / 21,910 = 0.001415.",
        "DPMO = 0.001415 x 1,000,000 = about 1,415.",
        "Locate 1,415 in the table: it lies between 4 sigma (6,210 DPMO) and 5 sigma (233 DPMO).",
        "A more precise lookup gives a long-term Z of about 2.99; adding the conventional 1.5 gives a short-term sigma level of about 4.5.",
      ],
      answer: "About 1,415 DPMO, which corresponds to roughly **4.5 sigma** (between 4 and 5 on the table, with the 1.5 sigma shift already built in).",
    },
    {
      title: "Same average, different sigma",
      scenario: "Two Halden Health appointment lines both average 46 seconds to answer, with a requirement of no more than 60 seconds. Line A has a standard deviation of 7 seconds; Line B has 3.5 seconds. Which line has the higher sigma level, and by how much?",
      steps: [
        "Gap between mean and limit for both lines = 60 - 46 = 14 seconds.",
        "Line A: Z = 14 / 7 = 2.0.",
        "Line B: Z = 14 / 3.5 = 4.0.",
        "Halving the standard deviation doubled the number of standard deviations that fit in the gap.",
      ],
      answer: "Line B, at **4.0 sigma** versus 2.0 for Line A, despite identical averages. Its callers experience far fewer waits beyond 60 seconds.",
    },
  ],
  activity: {
    lab: "dpmo",
    prompt: "Enter defects, units and opportunities for a process you know (for example invoices or installation jobs). Watch how DPMO and the sigma level change, and find how many defects you would need to remove to climb one full sigma level.",
  },
  checkQuestionIds: ["q-1.1.1-01", "q-1.1.1-04", "q-1.1.1-06"],
  takeaways: [
    "Six Sigma is a philosophy, a metric, a methodology (DMAIC) and a management system at the same time.",
    "Customers experience individual results, so variation, not the average, drives most defects.",
    "Sigma level is the number of standard deviations that fit between the mean and the nearest specification limit.",
    "3.4 DPMO corresponds to six sigma only under the conventional 1.5 sigma long-term shift; a centred process would produce about 0.002 DPMO.",
    "The sigma table is non-linear: each additional sigma level removes fewer defects in absolute terms and is harder to achieve.",
    "Six Sigma replaces opinion and firefighting with measurement, proven root causes and control.",
    "Quality improvement matters because it moves business outcomes such as cost, credits, retention and revenue.",
  ],
  flashcards: [
    { front: "Name the four meanings of Six Sigma.", back: "Philosophy, metric, methodology (DMAIC) and management system." },
    { front: "What does a sigma level count?", back: "How many standard deviations fit between the process mean and the nearest specification limit." },
    { front: "Long-term DPMO for 3 sigma (with the 1.5 shift)?", back: "About 66,807 DPMO." },
    { front: "Long-term DPMO for 4 sigma?", back: "About 6,210 DPMO." },
    { front: "Why is 6 sigma equal to 3.4 DPMO?", back: "Because of the conventional 1.5 sigma shift: the long-term tail beyond 4.5 standard deviations is about 3.4 per million." },
    { front: "DPMO of a centred 6 sigma process with no shift?", back: "About 0.002 DPMO (two-sided), roughly 2 per billion." },
    { front: "Why do customers feel variation rather than averages?", back: "Each customer experiences a single result; a good average with wide spread still produces many results beyond the limit." },
    { front: "Two ways to raise a sigma level?", back: "Move the mean away from the nearest limit, or reduce the standard deviation (usually the more powerful lever)." },
  ],
  sources: [
    { source: "syllabus", pdfPages: [7], note: "Lists 1.1.1 Meanings of Six Sigma as a Define Phase topic." },
    { source: "gb-201-300", pdfPages: [226], printedPages: [223], note: "Sigma level versus short-term and long-term DPMO table with the 1.5 standard deviation shift." },
    { source: "gb-501-600", pdfPages: [588], printedPages: [585], note: "Glossary definitions of Defect and DPMO." },
    { source: "gb-501-600", pdfPages: [591, 592], printedPages: [588, 589], note: "Glossary definitions of Sigma Score, Six Sigma (System), Standard Deviation and Variation." },
    { source: "supplementary", note: "The four meanings, the comparison with firefighting and the worked examples are original explanations." },
  ],
}
