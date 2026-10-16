import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.4.5',
  module: 4,
  officialTitle: '5S: Sort, Straighten, Shine, Standardize, Self-Discipline',
  title: '5S',
  subtitle: 'Sort, Straighten, Shine, Standardize, Self-Discipline',
  readingMinutes: 15,
  status: 'source-supported',
  objectives: [
    'List the five S steps in order with their syllabus names, Japanese terms and the book\'s labels.',
    'Apply the useful, useless, unknown sorting method and the ABC frequency-of-use storage rule.',
    'Explain red-tagging and visual management and how they support 5S.',
    'Apply 5S to digital workplaces such as shared drives, ticket queues and knowledge bases.',
    'Distinguish Standardize from Self-Discipline and explain why 5S is the foundation of Lean controls.',
  ],
  overview: [
    "[[5S]] is a five-step method for organising a workplace so that it is clean, everything needed has a home, and anything abnormal stands out. The training book sums it up as a workplace where there is a place for everything and everything is in its place (PDF 506). It sounds like housekeeping, and partly it is, but its real purpose is to make problems visible and to give every other improvement a stable base.",
    "5S appears twice in the IASSC syllabus: as Define topic 1.4.5, and again in Control as topic 5.1.1, Control Methods for 5S (syllabus p.9). The book confirms the pattern, noting that 5S is discussed in Define and revisited in Control as a tool to sustain improvements (PDF 505).",
  ],
  sections: [
    {
      id: 'five-steps',
      title: 'The five steps and their names',
      blocks: [
        { kind: 'p', text: "The first three S's act on the workplace; the last two keep those actions alive (PDF 506)." },
        { kind: 'table', caption: '5S names across sources', head: ['Step', 'Syllabus name', 'Japanese', 'Book label (PDF 507)', 'Common alternatives', 'Core idea'], rows: [
          ['1', '[[Sort]]', 'Seiri', 'Sorting', 'Sort', 'Remove what is not needed'],
          ['2', '[[Straighten]]', 'Seiton', 'Straightening', 'Set in Order', 'A place for everything, everything in its place'],
          ['3', '[[Shine]]', 'Seiso', 'Shining', 'Sweep', 'Clean and inspect; prevent mess'],
          ['4', '[[Standardize]]', 'Seiketsu', 'Standardizing', 'Standardise', 'Rules and visual standards that keep the first three'],
          ['5', '[[Self-Discipline]]', 'Shitsuke', 'Sustaining', 'Sustain', 'Habit, audit and commitment'],
        ] },
        { kind: 'callout', tone: 'note', title: 'Labels vary, order does not', text: "The book's translation table spells the fourth term 'Seketsu'; the usual romanisation is Seiketsu. Some organisations add **Safety** as a sixth S (6S). On the exam use the syllabus names in the syllabus order." },
      ],
    },
    {
      id: 'sort',
      title: 'Sort: useful, useless or unknown',
      blocks: [
        { kind: 'p', text: "Sort separates what is needed for current work from what is not and removes the rest. The book suggests classifying every item into three groups (PDF 508): **useful** items are kept and stored; **useless** items are disposed of immediately because they clutter the space, waste time and cause mistakes; **unknown** items are left in place for a set period and removed if nobody uses them. Start with the easiest items." },
        { kind: 'p', text: "**Red-tagging** is the common way to run the unknown pile: each doubtful item gets a red tag with the date, and anything still tagged after, say, 30 days goes. The book also advises tagging items that cannot be removed immediately (PDF 508)." },
        { kind: 'p', text: "Useful items are then placed by how often they are used (PDF 509):" },
        { kind: 'table', caption: 'ABC storage by frequency of use (paraphrasing the book, PDF 509)', head: ['Class', 'Frequency of use', 'Where to keep it'], rows: [
          ['A', 'Daily or several times a day', 'Within arm\'s reach'],
          ['B', 'About weekly', 'Nearby, e.g. a shelf or cabinet in the same room'],
          ['C', 'Monthly or quarterly', 'A remote location a few minutes away'],
        ] },
      ],
    },
    {
      id: 'straighten-shine-standardize',
      title: 'Straighten, Shine and Standardize',
      blocks: [
        { kind: 'p', text: "**Straighten** gives every needed item a designated, labelled home so anyone can find and return it. Items used together are kept together, shared items are kept centrally, and labels, floor markings and shadow outlines show what belongs where (PDF 509). This attacks Motion and Waiting waste." },
        { kind: 'p', text: "**Shine** means cleaning everything and making cleaning part of daily work. Cleaning is also inspection: a clean workplace makes leaks, damage and abnormal conditions obvious. The book stresses mess prevention, stopping dirt at its source (PDF 510)." },
        { kind: 'p', text: "**Standardize** creates the rules, schedules and visual controls that keep the first three S's in place, such as signboards, painted lines and colour coding (PDF 510). This is where 5S connects to [[Visual Management]]: the workplace should show at a glance whether it is normal. The book describes a visual factory in which a newly hired supervisor could spot excess inventory, extra tools or downtime immediately (PDF 511)." },
      ],
    },
    {
      id: 'self-discipline',
      title: 'Self-Discipline, and why 5S is the foundation',
      blocks: [
        { kind: 'p', text: "**Self-Discipline** (Sustaining in the book) is the habit of following the first four S's every day until it becomes the normal way of working, supported by schedules, checklists and audits (PDF 511). Without it, a workplace drifts back to clutter within weeks." },
        { kind: 'callout', tone: 'trap', title: 'Standardize vs Self-Discipline', text: "**Standardize** creates the standard: the rules, labels, checklists and schedules. **Self-Discipline** is people keeping to the standard and auditing it over time. A new cleaning schedule is Standardize; the weekly audit and the team actually following it is Self-Discipline." },
        { kind: 'p', text: "The book draws Lean controls as a chain resting on 5S: kanban needs kaizen, kaizen needs standardized work, standardized work needs a visual factory, and a visual factory needs 5S (PDF 505). That is why 5S is often shown as the floor of the Lean 'house': nothing above it stays stable on a cluttered, unlabelled base." },
      ],
    },
    {
      id: 'digital-5s',
      title: '5S in digital workplaces',
      blocks: [
        { kind: 'callout', tone: 'supplementary', title: 'Supporting context', text: "The book's examples are physical. Applying 5S to digital work is a widely used extension written here for service teams." },
        { kind: 'table', caption: 'Digital 5S', head: ['Step', 'Shared drive', 'Ticket queue', 'Knowledge base'], rows: [
          ['Sort', 'Archive files untouched for 18 months', 'Close stale and duplicate tickets', 'Retire outdated articles'],
          ['Straighten', 'One agreed folder structure and naming rule', 'Clear categories and routing', 'Consistent titles and tags so search works'],
          ['Shine', 'Remove broken links and old versions', 'Fix wrong statuses and missing fields', 'Correct errors flagged by agents'],
          ['Standardize', 'Folder and naming standard published', 'Queue definitions and SLAs documented', 'Article template and review cycle'],
          ['Self-Discipline', 'Monthly folder audit', 'Weekly queue hygiene check', 'Owners review articles on schedule'],
        ] },
        { kind: 'example', title: 'Example: a service desk knowledge base', blocks: [
          { kind: 'p', text: "Solent Data Services had 3,412 knowledge articles, and agents spent an average 4.3 minutes searching per call. Sort retired 1,286 articles with no views in a year. Straighten added a title convention and tags. Shine fixed 214 articles with wrong steps. Standardize introduced a template and a six-month review date. Self-Discipline added a monthly report of overdue articles to the team huddle. Search time fell to 1.6 minutes." },
        ] },
      ],
    },
  ],
  whyItMatters: [
    "5S is often the first visible win of a Lean Six Sigma deployment. It costs little, involves everyone and makes the next problems obvious.",
    "In Control, 5S is a practical way to hold gains. If a new standard procedure lives in a cluttered shared drive with five old versions, people will find the wrong one.",
  ],
  businessExample: {
    title: '5S in a field-engineering van fleet',
    industry: 'Telecommunications field operations',
    blocks: [
      { kind: 'p', text: "Northwind Fibre engineers lost an average 22 minutes per job looking for parts and returning to the depot for missing items." },
      { kind: 'list', ordered: true, items: [
        "**Sort:** 41% of van contents had not been used in 90 days; unknown items were red-tagged for 30 days.",
        "**Straighten:** A items (splice kits, connectors) placed within reach of the rear door; B items in side bins; C items held at the depot.",
        "**Shine:** vans cleaned and restocked every Friday, with damaged tools reported.",
        "**Standardize:** a photo layout card inside each van door and a restock checklist.",
        "**Self-Discipline:** supervisors audited two vans a week and shared scores on a team board.",
      ] },
      { kind: 'p', text: "Search and return trips fell to 7 minutes per job, freeing roughly one extra job per engineer per day." },
    ],
  },
  visual: {
    diagram: 'fives',
    title: 'The five steps of 5S',
    caption: "Sort, Straighten, Shine, Standardize, Self-Discipline: three steps that act on the workplace and two that sustain them.",
  },
  definitions: [
    { term: '5S', definition: "A five-step workplace organisation method: Sort, Straighten, Shine, Standardize, Self-Discipline." },
    { term: 'Sort (Seiri)', definition: "Separate needed from unneeded items and remove the unneeded." },
    { term: 'Straighten (Seiton)', definition: "Arrange needed items so they are easy to see, reach and return. Also called Set in Order." },
    { term: 'Shine (Seiso)', definition: "Clean the workplace, inspect while cleaning and prevent mess at its source. Also called Sweep." },
    { term: 'Standardize (Seiketsu)', definition: "Create rules, schedules and visual standards that maintain the first three S's." },
    { term: 'Self-Discipline (Shitsuke)', definition: "Make following the standards a daily habit, checked by audit. Called Sustaining in the book." },
    { term: 'Red tag', definition: "A label placed on an item of uncertain use; if it is not used within a set period it is removed." },
    { term: 'Visual management', definition: "Making the normal state and any abnormality visible at a glance through labels, markings, colour and boards." },
  ],
  comparisons: [
    {
      title: 'Standardize versus Self-Discipline',
      head: ['Aspect', 'Standardize', 'Self-Discipline'],
      rows: [
        ['Question', 'What is the rule?', 'Do we keep the rule every day?'],
        ['Output', 'Procedures, labels, schedules, checklists', 'Habits, audits, accountability'],
        ['Example', 'A cleaning schedule posted on the wall', 'Weekly audit scores reviewed in the huddle'],
        ['Failure looks like', 'Everyone does it differently', 'The standard exists but nobody follows it'],
      ],
    },
    {
      title: 'Sort versus Straighten',
      head: ['Aspect', 'Sort', 'Straighten'],
      rows: [
        ['Question', 'Do we need it?', 'Where should it live?'],
        ['Action', 'Remove, red-tag or keep', 'Locate, label, outline'],
        ['Tool', 'Useful / useless / unknown', 'ABC frequency storage, shadow boards'],
      ],
    },
  ],
  misconceptions: [
    { myth: '5S is just a cleaning campaign.', reality: "Cleaning is only one step. 5S is about making the workplace self-explaining so abnormalities show up, and about sustaining that state." },
    { myth: 'You can start with Straighten to save time.', reality: "Organising items you do not need wastes effort and space. Sort comes first; the book notes that rigorous sorting makes the remaining S's much easier (PDF 509)." },
    { myth: '5S only applies to factories.', reality: "Offices, vans, shared drives, ticket queues and knowledge bases all benefit from 5S." },
    { myth: 'Once the 5S event is finished, the job is done.', reality: "Without Self-Discipline the workplace reverts. Sustaining is the hardest step." },
  ],
  examTraps: [
    { title: 'Syllabus names and order', text: "Sort, Straighten, Shine, Standardize, Self-Discipline. Distractors swap Shine and Straighten or put Standardize last." },
    { title: 'Same step, different label', text: "Set in Order = Straighten; Sweep = Shine; Sustain or Sustaining = Self-Discipline. A question using alternative labels is still asking about the same step." },
    { title: 'Making the rule vs keeping the rule', text: "Creating checklists, labels and schedules is Standardize. Auditing and habit are Self-Discipline." },
    { title: 'Where 5S belongs in DMAIC', text: "5S is introduced in Define (1.4.5) and used as a Lean control in Control (5.1.1). Answers placing it only in Improve are incomplete." },
  ],
  workedExamples: [
    {
      title: 'Which S is this?',
      scenario: "A contact centre team (1) deletes 140 unused macros, (2) groups the remaining macros by call type with clear names, (3) fixes broken links inside macros, (4) publishes a naming rule and a quarterly review date, (5) has the team lead check compliance every month.",
      steps: [
        "Deleting unused items: Sort.",
        "Grouping and naming so they are easy to find: Straighten.",
        "Fixing broken content, the digital equivalent of cleaning: Shine.",
        "Publishing a rule and schedule: Standardize.",
        "Monthly compliance check and habit: Self-Discipline.",
      ],
      answer: "Sort, Straighten, Shine, Standardize, Self-Discipline in that order.",
    },
    {
      title: 'Applying ABC storage',
      scenario: "A network operations centre engineer uses a console cable several times a day, a spare optical module about once a week and a calibration kit once a quarter.",
      steps: [
        "Daily use: class A, keep within arm's reach at the desk.",
        "Weekly use: class B, keep in a nearby cabinet in the same room.",
        "Quarterly use: class C, store in a remote location such as the central store.",
      ],
      answer: "Console cable at the desk (A), optical module in the room cabinet (B), calibration kit in central storage (C).",
    },
  ],
  activity: {
    lab: 'fives',
    prompt: "Work through a cluttered service desk in order: sort each item as useful, useless or unknown, place useful items by frequency of use, then set the standard and the audit that will sustain it.",
  },
  checkQuestionIds: ['q-1.4.5-01', 'q-1.4.5-04', 'q-1.4.5-07'],
  takeaways: [
    "5S in syllabus order: Sort (Seiri), Straighten (Seiton), Shine (Seiso), Standardize (Seiketsu), Self-Discipline (Shitsuke).",
    "The book labels them Sorting, Straightening, Shining, Standardizing, Sustaining; Set in Order and Sweep are other common labels; some add Safety as 6S.",
    "Sort with useful, useless, unknown; red-tag the unknown; store useful items by A, B, C frequency of use.",
    "Standardize writes the rule; Self-Discipline keeps it.",
    "5S is the base of visual management and of the book's chain of Lean controls.",
    "5S is introduced in Define and used as a Control-phase method to sustain gains.",
    "Digital 5S applies the same steps to shared drives, ticket queues and knowledge bases.",
  ],
  flashcards: [
    { front: '5S in syllabus order', back: 'Sort, Straighten, Shine, Standardize, Self-Discipline.' },
    { front: 'Japanese terms in order', back: 'Seiri, Seiton, Seiso, Seiketsu, Shitsuke.' },
    { front: "Book's English labels (PDF 507)", back: 'Sorting, Straightening, Shining, Standardizing, Sustaining.' },
    { front: 'Three sorting categories (PDF 508)', back: 'Useful (keep and store), useless (dispose), unknown (keep for a set time, then remove if unused).' },
    { front: 'ABC storage rule', back: 'A: daily, within reach. B: weekly, nearby. C: monthly or quarterly, remote.' },
    { front: 'Set in Order and Sweep', back: 'Alternative names for Straighten and Shine.' },
    { front: 'Standardize vs Self-Discipline', back: 'Standardize creates the rules; Self-Discipline makes following them a habit.' },
    { front: 'Where does 5S appear in the syllabus?', back: 'Define 1.4.5 and Control 5.1.1 (Control Methods for 5S).' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.4.5 with the five syllabus names.' },
    { source: 'syllabus', pdfPages: [9], note: 'Control topic 5.1.1 Control Methods for 5S.' },
    { source: 'gb-501-600', pdfPages: [505], printedPages: [502], note: '5S discussed in Define and revisited in Control; 5S as the base of the Lean sustaining chain.' },
    { source: 'gb-501-600', pdfPages: [506, 507], printedPages: [503, 504], note: '5S meaning, Japanese terms and English translation table.' },
    { source: 'gb-501-600', pdfPages: [508, 509], printedPages: [505, 506], note: 'Sorting method (useful, useless, unknown), tagging and ABC storage by frequency of use; Straightening.' },
    { source: 'gb-501-600', pdfPages: [510, 511], printedPages: [507, 508], note: 'Shining, Standardizing, Sustaining and the Visual Factory.' },
    { source: 'supplementary', note: 'Digital 5S, red-tag timing, 6S and alternative labels are supporting content.' },
  ],
}
