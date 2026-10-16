import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: "1.1.2",
  module: 1,
  officialTitle: "General History of Six Sigma & Continuous Improvement",
  title: "Where Six Sigma Came From",
  subtitle: "A century of quality thinking, from control charts to Lean Six Sigma",
  readingMinutes: 11,
  status: "supplementary",
  objectives: [
    "Describe how Six Sigma emerged at Motorola in the mid 1980s and who championed it.",
    "Explain the roles of AlliedSignal and General Electric in spreading Six Sigma.",
    "Match the main quality pioneers (Shewhart, Deming, Juran, Feigenbaum, Crosby, Ishikawa) to their key ideas.",
    "Outline how Toyota and Lean thinking developed alongside the quality movement.",
    "Explain why Lean and Six Sigma were combined into Lean Six Sigma.",
  ],
  overview: [
    "Six Sigma did not appear from nowhere. It packaged ideas that quality thinkers had been refining for sixty years: measure the process, understand its variation, fix causes rather than symptoms, and make improvement everybody's job. What Motorola added in the 1980s was a demanding numerical target, a structured project method and a way of training people to run it.",
    "Knowing the history is useful beyond the exam. When you recognise that a fishbone diagram comes from Ishikawa or that the Pareto idea in quality comes from Juran, the tools stop feeling like a random toolbox and start looking like a coherent body of thinking about [[Continuous Improvement]].",
  ],
  sections: [
    {
      id: "pioneers",
      title: "The quality pioneers",
      blocks: [
        { kind: "p", text: "Six Sigma inherited most of its thinking from a small group of twentieth century quality leaders. Each contributed one idea you will meet repeatedly in DMAIC." },
        {
          kind: "table",
          caption: "Six pioneers and the idea each one gave us",
          head: ["Pioneer", "Key idea", "Where you meet it in Lean Six Sigma"],
          rows: [
            ["**Walter Shewhart** (1920s, Western Electric and Bell Telephone Laboratories)", "Control charts; separating routine variation from unusual signals", "Measure (stability) and Control (SPC charts)"],
            ["**W. Edwards Deming** (post-war Japan onward)", "Plan-Do-Study-Act cycle; quality is mainly a management system responsibility", "The iterative logic of DMAIC; leadership's role"],
            ["**Joseph Juran**", "Quality trilogy (planning, control, improvement); applied Pareto's idea to quality as the vital few and the trivial (or useful) many", "[[Pareto Chart|Pareto analysis]] in Define; project-by-project improvement"],
            ["**Armand Feigenbaum** (1950s)", "Total Quality Control across every function; categories of quality cost", "[[Cost of Quality]] and COPQ in Define"],
            ["**Philip Crosby** (*Quality is Free*, 1979)", "Zero defects as a performance standard; the cost of poor quality pays for prevention", "Business case for prevention; defect focus"],
            ["**Kaoru Ishikawa**", "Cause and effect (fishbone) diagram; quality circles", "Measure and Analyze, listing potential causes"],
          ],
        },
        { kind: "callout", tone: "memory", title: "Memory hook", text: "**S**hewhart **charts**, **D**eming **cycles**, **J**uran **sorts** (Pareto), **F**eigenbaum **costs**, **C**rosby **zeroes**, **I**shikawa **fishes**." },
      ],
    },
    {
      id: "toyota-and-lean",
      title: "Toyota and the Lean thread",
      blocks: [
        { kind: "p", text: "In parallel, a different tradition grew from the shop floor. Henry Ford's moving assembly line (1913) showed the power of flow. In Japan, Sakichi Toyoda built an automatic loom that stopped itself when a thread broke, the origin of [[Jidoka]]. Kiichiro Toyoda pushed [[Just-in-Time]] production, and from the 1950s Taiichi Ohno built the [[Toyota Production System]], identifying the seven wastes. Shigeo Shingo contributed quick changeovers and mistake-proofing." },
        { kind: "p", text: "The word [[Lean]] itself was coined later, by John Krafcik in 1988, and popularised by Womack, Jones and Roos in *The Machine That Changed the World* (1990). This thread is covered in more depth in lesson 1.4.2." },
      ],
    },
    {
      id: "motorola-ge",
      title: "Motorola, AlliedSignal and GE",
      blocks: [
        { kind: "p", text: "By the early 1980s Motorola was losing ground to Japanese competitors on quality. Engineer Bill Smith argued that field failures were linked to variation that went unnoticed inside the factory, and with Mikel Harry he developed the Six Sigma approach around 1986. CEO Bob Galvin championed it across the company, and in 1988 Motorola won the first Malcolm Baldrige National Quality Award. The syllabus itself credits Motorola with originally establishing the DMAIC-based method." },
        { kind: "p", text: "AlliedSignal, under Larry Bossidy, adopted Six Sigma in the early 1990s and reported large savings. General Electric under Jack Welch launched it in 1995-1996 and made it famous: Six Sigma became part of executive targets and promotion decisions, and trained Black Belts led projects across finance, services and manufacturing. GE showed that the method worked in transactional processes, not only in factories." },
        {
          kind: "table",
          caption: "Key milestones",
          head: ["Year", "Milestone"],
          rows: [
            ["1913", "Ford's moving assembly line demonstrates flow at scale"],
            ["1920s", "Shewhart develops control charts in the Bell telephone system (Western Electric, then Bell Laboratories)"],
            ["1950s", "Deming and Juran teach quality in Japan; Feigenbaum describes Total Quality Control; Toyota Production System takes shape under Ohno"],
            ["1979", "Crosby publishes *Quality is Free*"],
            ["1986", "Six Sigma developed at Motorola (Bill Smith, Mikel Harry; championed by Bob Galvin)"],
            ["1988", "Motorola wins the first Malcolm Baldrige National Quality Award; Krafcik coins the term Lean"],
            ["Early 1990s", "AlliedSignal adopts Six Sigma under Larry Bossidy"],
            ["1995-1996", "General Electric deploys Six Sigma company-wide under Jack Welch"],
            ["Early 2000s", "Lean Six Sigma becomes a common combined approach (Michael George, 2002)"],
          ],
        },
        { kind: "callout", tone: "trap", title: "Trap: origin versus fame", text: "Motorola **originated** Six Sigma. GE **popularised** it. Toyota originated the production system that became Lean, not Six Sigma. Stems that ask who developed or established Six Sigma want Motorola." },
      ],
    },
    {
      id: "lean-six-sigma",
      title: "Evolution toward Lean Six Sigma",
      blocks: [
        { kind: "p", text: "For years the two traditions ran separately. Lean teams attacked [[Waste]] and slow flow; Six Sigma teams attacked defects and variation. Practitioners noticed that each had a blind spot. A Six Sigma project could make a slow process very consistent but still slow; a Lean project could speed a process up while defects still passed straight through it." },
        { kind: "p", text: "Combining them gave organisations one roadmap (DMAIC) with two toolkits: Lean tools for speed and waste, Six Sigma tools for variation and defects. By the early 2000s, Lean Six Sigma had become the usual name, and the IASSC Green Belt syllabus reflects that blend: its Define Phase includes both sigma metrics and the seven wastes." },
        {
          kind: "example",
          title: "Reasoning example: whose idea is this?",
          blocks: [
            { kind: "p", text: "A contact centre manager at Kestrel Mobile tests a new call script with one team for two weeks, reviews the results, then adjusts and rolls it out. Which pioneer's idea is she applying?" },
            { kind: "p", text: "Plan (design the script), Do (pilot it), Study (review results), Act (adjust and roll out): this is Deming's PDSA cycle. The small-scale pilot before full rollout is the giveaway." },
          ],
        },
        { kind: "callout", tone: "supplementary", title: "Supporting context", text: "Apart from the syllabus statement that the method was originally established by Motorola, the historical detail in this lesson is supplementary. It reflects widely documented history, but it is not drawn from the supplied training book pages." },
      ],
    },
  ],
  whyItMatters: [
    "History questions on the exam are usually short recall items, but they are easy marks only if you keep origin and popularisation separate and can match each pioneer to the right idea.",
    "Understanding the lineage helps you explain to sceptical colleagues that Lean Six Sigma is not a fad: its core ideas have been tested for a century across very different industries.",
  ],
  businessExample: {
    title: "Two traditions in one service desk",
    industry: "IT service management",
    blocks: [
      { kind: "p", text: "Brightwater Networks ran a Lean initiative on its IT service desk that cut average ticket lead time from 31 hours to 19. Six months later, reopened tickets had climbed to 12.8%, because faster handling had not addressed why fixes failed." },
      { kind: "p", text: "A follow-up project combined both traditions. Lean tools kept the flow gains. Six Sigma tools, including a Pareto chart in Juran's spirit and a fishbone in Ishikawa's, found that most reopenings came from three ticket categories closed without a confirmation check. After a mistake-proofed closure step and a control chart in Shewhart's tradition, reopenings fell to 4.1% and the lead time gain held." },
    ],
  },
  visual: {
    diagram: "timeline",
    title: "A century of continuous improvement",
    caption: "From Ford's assembly line and Shewhart's control charts to Motorola, GE and the combined Lean Six Sigma approach.",
  },
  definitions: [
    { term: "Continuous Improvement", definition: "An ongoing, systematic effort to improve processes, products and services through many incremental and breakthrough changes." },
    { term: "Control chart", definition: "Shewhart's time-ordered chart with statistically calculated limits that separates routine variation from unusual signals." },
    { term: "PDSA cycle", definition: "Plan-Do-Study-Act, the learning cycle promoted by Deming (often taught as PDCA) for testing changes on a small scale before adopting them." },
    { term: "Quality trilogy", definition: "Juran's view of quality management as three linked processes: quality planning, quality control and quality improvement." },
    { term: "Total Quality Control", definition: "Feigenbaum's idea that quality is the responsibility of every function in the organisation, not only inspection." },
    { term: "Zero defects", definition: "Crosby's performance standard that work should be done right the first time, with prevention rather than inspection as the route to quality." },
    { term: "Lean Six Sigma", definition: "The combined approach that uses the DMAIC roadmap with Lean tools for waste and flow and Six Sigma tools for variation and defects." },
  ],
  comparisons: [
    {
      title: "Origin versus popularisation",
      head: ["Organisation", "Role in the story", "Remember it as"],
      rows: [
        ["Toyota", "Built the Toyota Production System (1950s onward), the root of Lean", "Origin of Lean"],
        ["Motorola", "Developed Six Sigma (1986); first Baldrige Award winner (1988)", "Origin of Six Sigma"],
        ["AlliedSignal", "Early adopter in the early 1990s under Larry Bossidy", "Early proof outside Motorola"],
        ["General Electric", "Company-wide deployment from 1995-1996 under Jack Welch", "Made Six Sigma famous"],
      ],
    },
  ],
  misconceptions: [
    { myth: "General Electric invented Six Sigma.", reality: "Motorola developed it in the mid 1980s. GE adopted it in 1995-1996 and made it famous through a highly visible deployment." },
    { myth: "Six Sigma came out of the Toyota Production System.", reality: "Toyota is the root of Lean. Six Sigma grew from Motorola's work on variation and defects, building on Western statistical quality thinking from Shewhart, Deming and Juran." },
    { myth: "Lean and Six Sigma are rival methods you must choose between.", reality: "They address different problems (waste and flow versus variation and defects) and are now usually combined under one DMAIC roadmap." },
  ],
  examTraps: [
    { title: "Fishbone belongs to Ishikawa", text: "The cause and effect diagram is also called the Ishikawa diagram. Do not assign it to Deming or Juran." },
    { title: "Juran and Pareto", text: "Vilfredo Pareto observed the unequal distribution of wealth; Juran applied the idea to quality problems as the vital few and trivial many. A stem about applying the principle to quality points to Juran." },
    { title: "Feigenbaum versus Crosby on cost", text: "Both talked about the cost of quality. Feigenbaum is linked to Total Quality Control and cost categories; Crosby is linked to zero defects and *Quality is Free*." },
  ],
  workedExamples: [
    {
      title: "Matching an idea to a pioneer",
      scenario: "A Halden Health billing team plots daily claim rejection rates on a chart with calculated upper and lower limits. They react only to points outside the limits and leave ordinary day-to-day movement alone. Whose idea are they applying?",
      steps: [
        "Key clue: a time-ordered chart with calculated limits.",
        "Second clue: separating ordinary variation (leave alone) from unusual signals (investigate).",
        "That distinction and the chart itself trace back to Walter Shewhart in the 1920s.",
      ],
      answer: "**Walter Shewhart**, the originator of the control chart and of the distinction between routine and unusual variation.",
    },
    {
      title: "Ordering the story",
      scenario: "Place these in chronological order: GE company-wide Six Sigma deployment; Shewhart's control charts; Motorola's development of Six Sigma; Michael George's popularisation of Lean Six Sigma.",
      steps: [
        "Shewhart's control charts: 1920s.",
        "Motorola develops Six Sigma: around 1986.",
        "GE deploys company-wide: 1995-1996.",
        "Lean Six Sigma popularised as a combined approach: early 2000s (2002).",
      ],
      answer: "Shewhart, then Motorola, then GE, then Lean Six Sigma.",
    },
  ],
  activity: {
    lab: "history",
    prompt: "Drag each pioneer and organisation onto the timeline, then match each one to the idea or tool it contributed. Notice which tools you will use later in Define, Measure and Control.",
  },
  checkQuestionIds: ["q-1.1.2-01", "q-1.1.2-04", "q-1.1.2-08"],
  takeaways: [
    "Six Sigma was developed at Motorola around 1986 by Bill Smith and Mikel Harry, with CEO Bob Galvin as champion.",
    "AlliedSignal (Larry Bossidy) adopted it early; GE (Jack Welch, 1995-1996) made it famous.",
    "Shewhart gave us control charts, Deming the PDSA cycle, Juran the quality trilogy and Pareto thinking in quality, Feigenbaum Total Quality Control, Crosby zero defects, Ishikawa the fishbone.",
    "Lean grew from Ford's flow and the Toyota Production System; the term Lean dates from 1988.",
    "Lean Six Sigma combines one roadmap with two toolkits and became the common approach in the early 2000s.",
  ],
  flashcards: [
    { front: "Which company originated Six Sigma, and when?", back: "Motorola, around 1986." },
    { front: "Which CEO made Six Sigma famous at GE?", back: "Jack Welch, from 1995-1996." },
    { front: "Shewhart's main contribution?", back: "The control chart (1920s) and the distinction between routine and unusual variation." },
    { front: "Deming is associated with which cycle?", back: "Plan-Do-Study-Act (PDSA)." },
    { front: "Who applied the Pareto principle to quality?", back: "Joseph Juran (vital few, trivial or useful many)." },
    { front: "Feigenbaum's key idea?", back: "Total Quality Control, with quality as every function's responsibility, and categories of quality cost." },
    { front: "Crosby is linked to which ideas?", back: "Zero defects and the book *Quality is Free* (1979)." },
    { front: "Who created the fishbone diagram?", back: "Kaoru Ishikawa." },
  ],
  sources: [
    { source: "syllabus", pdfPages: [3], note: "States that the DMAIC-based Lean Six Sigma method was originally established by Motorola." },
    { source: "syllabus", pdfPages: [7], note: "Lists 1.1.2 General History of Six Sigma & Continuous Improvement as a Define Phase topic." },
    { source: "supplementary", note: "Pioneers, milestones and the evolution toward Lean Six Sigma are written as supplementary content." },
  ],
}
