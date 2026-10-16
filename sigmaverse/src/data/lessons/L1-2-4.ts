import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.2.4',
  module: 2,
  officialTitle: 'Pareto Analysis (80:20 rule)',
  title: 'Pareto Analysis',
  subtitle: 'Finding the vital few categories that deserve your attention first',
  readingMinutes: 16,
  status: 'partial-source',
  objectives: [
    'Explain the Pareto principle and why the 80:20 split is a heuristic, not a law.',
    'Build a Pareto table: sort categories, place "Other" last, and calculate percentages, cumulative counts and cumulative percentages.',
    'Read a Pareto chart correctly, including its two vertical axes and the cumulative line.',
    'Explain how weighting by cost or impact can change priorities compared with counting frequency.',
    'Interpret a flat Pareto and use a second-level Pareto to drill into a dominant category.',
  ],
  overview: [
    "A support team that tries to fix every type of problem at once usually fixes none of them well. Pareto analysis gives the team permission to focus. By sorting problem categories from largest to smallest and adding up their shares, it shows which few categories account for most of the pain.",
    "This lesson explains the [[Pareto Principle]] behind the method, then builds a [[Pareto Chart]] step by step from 1,100 broadband support contacts. You will compute the [[Cumulative Percentage|cumulative percentages]] yourself, see how a cost-weighted view can overturn a frequency ranking, and learn what to do when the chart refuses to show a clear 80:20 pattern.",
  ],
  sections: [
    {
      id: 'the-principle',
      title: 'The principle and its history',
      blocks: [
        { kind: 'p', text: "The book glossary credits the general principle to Vilfredo Pareto (1848-1923): the majority of the influence on an outcome comes from a minority of the input factors. Pareto observed it in the distribution of land and wealth in Italy. Joseph Juran later applied the idea to quality problems and named the two groups the **vital few** and the *trivial many*; he subsequently preferred *useful many*, because the smaller categories still matter, just less urgently." },
        { kind: 'p', text: "The popular shorthand is the **80:20 rule**: roughly 80% of effects come from 20% of causes. Treat this as a heuristic. Real data might split 70:30, 90:10 or 60:40. The two numbers do not even have to add to 100, because one is a share of *effects* and the other a share of *categories*." },
        { kind: 'callout', tone: 'memory', title: 'Memory hook', text: "Pareto answers *where to look first*, not *why it happens*. The [[Vital Few]] are your starting point for root cause work, not the root causes themselves." },
      ],
    },
    {
      id: 'building-the-table',
      title: 'Building a Pareto table',
      blocks: [
        { kind: 'p', text: "Kestrel Mobile's broadband support team tagged one month of repeat contacts, 1,100 in total, with a reason code. Building the Pareto table takes five steps:" },
        { kind: 'list', ordered: true, items: [
          'Agree clear, non-overlapping categories with an operational definition for each, and a fixed time period.',
          'Count the occurrences in each category.',
          'Sort categories in **descending** order of count. Group small categories into **\"Other\"** and place it **last**, whatever its size.',
          'Calculate each category\'s percentage of the total.',
          'Calculate the **cumulative count** (running total) and the **cumulative percentage** (running total divided by the grand total).',
        ] },
        {
          kind: 'table',
          caption: 'Kestrel Mobile repeat contacts by reason, one month (n = 1,100)',
          head: ['Category', 'Count', 'Percent', 'Cumulative count', 'Cumulative percent'],
          rows: [
            ['Router or modem setup', '412', '37.5%', '412', '37.5%'],
            ['Line fault (copper or fibre)', '287', '26.1%', '699', '63.5%'],
            ['Billing query', '156', '14.2%', '855', '77.7%'],
            ['Wi-Fi coverage in the home', '98', '8.9%', '953', '86.6%'],
            ['Account access or password', '61', '5.5%', '1,014', '92.2%'],
            ['Missed engineer appointment', '37', '3.4%', '1,051', '95.5%'],
            ['Other (6 minor reasons)', '49', '4.5%', '1,100', '100.0%'],
          ],
        },
        { kind: 'formula', tex: '\\text{Cumulative \\%}_k = \\frac{\\sum_{i=1}^{k} n_i}{N} \\times 100', caption: 'Divide the running count by the grand total N. For row 3: 855 / 1,100 x 100 = 77.7%.' },
        { kind: 'callout', tone: 'tip', title: 'Avoid rounding drift', text: "The rounded percentages add to 100.1%, not 100%. Always compute cumulative percentage from the cumulative *count*, never by adding rounded percentages, and the last row will be exactly 100%." },
        { kind: 'p', text: "Notice that \"Other\" (49) is larger than \"Missed engineer appointment\" (37) but still sits last. \"Other\" is a mixture of unrelated reasons, so it cannot be a single target for action; placing it last keeps the actionable categories in sorted order." },
      ],
    },
    {
      id: 'reading-the-chart',
      title: 'Reading a Pareto chart',
      blocks: [
        { kind: 'diagram', diagram: 'pareto', caption: 'Bars in descending order on the left axis (counts); the cumulative line on the right axis (0% to 100%).' },
        { kind: 'list', items: [
          '**Bars:** one per category, tallest on the left, measured on the **left axis** in counts (or cost). The glossary describes the chart as a bar chart for attribute or categorical data in descending order of frequency.',
          '**Left axis:** usually scaled from 0 to the grand total (1,100) so the bars and the line share the same vertical scale.',
          '**Right axis:** 0% to 100%, for the cumulative percentage.',
          '**Line:** plotted at each bar, rising steeply where big categories sit and flattening across the useful many. It always ends at 100%.',
        ] },
        { kind: 'p', text: "To read it, draw a horizontal line from 80% on the right axis to the curve and drop down. Here three categories reach 77.7% and four reach 86.6%, so the vital few are the top three or four of seven categories. Router setup and line faults alone account for 63.5% of repeat contacts." },
      ],
    },
    {
      id: 'frequency-vs-impact',
      title: 'Frequency versus impact',
      blocks: [
        { kind: 'p', text: "Counting occurrences treats a two-minute password reset the same as a fault that sends an engineer. When categories differ greatly in cost, build a second Pareto weighted by impact: count x cost per occurrence." },
        {
          kind: 'table',
          caption: 'Same data, weighted by average cost per contact (total £44,885.90)',
          head: ['Category', 'Count', 'Cost each', 'Total cost', 'Cumulative percent'],
          rows: [
            ['Line fault', '287', '£118.00', '£33,866.00', '75.4%'],
            ['Missed engineer appointment', '37', '£135.00', '£4,995.00', '86.6%'],
            ['Wi-Fi coverage', '98', '£22.00', '£2,156.00', '91.4%'],
            ['Router or modem setup', '412', '£4.80', '£1,977.60', '95.8%'],
            ['Billing query', '156', '£6.20', '£967.20', '97.9%'],
            ['Account access', '61', '£3.10', '£189.10', '98.4%'],
            ['Other', '49', '£15.00', '£735.00', '100.0%'],
          ],
        },
        { kind: 'p', text: "The ranking changes completely. Router setup, the biggest category by count, falls to fourth by cost, while missed appointments jump from sixth to second. Neither chart is wrong: frequency tells you what customers experience most often; cost tells you where the money goes. Choose the weighting that matches the project's [[Primary Metric]], and say which one you used." },
      ],
    },
    {
      id: 'when-not-80-20',
      title: 'When the chart is not 80:20',
      blocks: [
        { kind: 'p', text: "Sometimes the bars are almost the same height and the cumulative line climbs in a nearly straight diagonal. A **flat Pareto** usually means one of three things:" },
        { kind: 'list', items: [
          '**Poor categorisation:** categories are too broad, overlap, or describe symptoms inconsistently (agents choosing \"general enquiry\" for everything).',
          '**Wrong stratification:** the real pattern is by another factor, such as region, shift, product or channel. Try slicing the same data differently.',
          '**No dominant category:** the problem genuinely has many similar contributors, which points to a systemic cause in the process rather than a few special ones.',
        ] },
        { kind: 'p', text: "A large \"Other\" bar is a related warning. If \"Other\" would rank among the top bars, the categories are not doing their job; break it out before drawing conclusions." },
        { kind: 'callout', tone: 'trap', title: 'Not the contact centre 80/20', text: "Contact centres often quote an \"80/20\" service level: 80% of calls answered within 20 seconds. That is a target, not the Pareto principle. Do not let the shared numbers mislead you." },
      ],
    },
    {
      id: 'drill-down',
      title: 'Second-level Pareto: drilling down',
      blocks: [
        { kind: 'p', text: "A category such as \"Router or modem setup\" is still too broad to act on. A **second-level Pareto** takes the records in the top bar and categorises them again by a finer reason." },
        { kind: 'example', title: 'Example: drilling into 412 router setup contacts', blocks: [
          {
            kind: 'table',
            head: ['Sub-category', 'Count', 'Percent', 'Cumulative percent'],
            rows: [
              ['Self-install pack missing setup card', '171', '41.5%', '41.5%'],
              ['Wi-Fi password label misprinted', '104', '25.2%', '66.7%'],
              ['Firmware update reboot loop', '66', '16.0%', '82.8%'],
              ['Customer-owned router', '43', '10.4%', '93.2%'],
              ['Other', '28', '6.8%', '100.0%'],
            ],
          },
          { kind: 'p', text: "Two packaging issues explain two-thirds of router setup contacts, or 275 of all 1,100 repeat contacts (25%). That is a focused, actionable problem for the charter, far better than \"reduce repeat contacts\"." },
        ] },
        { kind: 'callout', tone: 'note', title: 'Where Pareto fits in DMAIC', text: "In Define, Pareto helps select and scope the project by showing where the problem concentrates. It is used again in Measure and Analyze. It shows where defects cluster; it does not prove a [[Root Cause]], which is verified in the [[Analyze Phase]]." },
        { kind: 'callout', tone: 'supplementary', title: 'Supporting context', text: "The supplied book pages define the Pareto chart and principle. The construction steps, cost weighting, flat Pareto interpretation and drill-down method are explained here as supplementary material." },
      ],
    },
  ],
  whyItMatters: [
    "Improvement resources are always limited. Pareto analysis turns a long, emotional list of complaints into a ranked, quantified picture, so the team and the Champion can agree where to focus and can justify leaving the useful many for later.",
    "It is also a scoping tool. A project charter that says \"reduce router setup repeat contacts caused by self-install packs\" is far more likely to succeed than one that says \"reduce all repeat contacts\".",
  ],
  businessExample: {
    title: 'Northwind Fibre: the network incidents that were not the biggest problem',
    industry: 'Telecommunications, network operations centre',
    blocks: [
      { kind: 'p', text: "Northwind Fibre's network operations centre logged 288 service-affecting incidents in a quarter. Engineers were convinced software defects were the main issue because those incidents were the hardest to solve." },
      { kind: 'list', items: [
        'By count, cabinet power failures led with 96 incidents (33.3%), followed by third-party fibre cuts at 71 and line card failures at 54. Together the top three reached 76.7%; adding configuration errors reached 88.2%.',
        'Software defects were only 19 incidents (6.6%).',
        'Weighted by customer-minutes lost, fibre cuts moved to first place, because each cut affected hundreds of customers for many hours.',
      ] },
      { kind: 'p', text: "The team chartered two projects: battery backup checks for cabinets (frequency) and faster restoration after fibre cuts (impact). The Pareto charts ended a long debate in one meeting, because opinion had been replaced by data." },
    ],
  },
  visual: {
    diagram: 'pareto',
    title: 'Pareto chart anatomy',
    caption: 'Descending bars show counts on the left axis; the cumulative percentage line uses the right axis from 0% to 100%. "Other" sits last.',
  },
  definitions: [
    { term: 'Pareto principle', definition: 'The general principle, credited to Vilfredo Pareto (1848-1923), that most of the influence on an outcome comes from a minority of factors.' },
    { term: '80:20 rule', definition: 'Popular shorthand for the Pareto principle: about 80% of effects from about 20% of causes. A heuristic, not a fixed ratio.' },
    { term: 'Pareto chart', definition: 'A bar chart of categorical data in descending order, usually with a cumulative percentage line on a second axis.' },
    { term: 'Vital few', definition: 'The small number of categories that account for most of the effect (Juran\'s term).' },
    { term: 'Useful many', definition: 'The remaining categories that each contribute a small share; Juran\'s later replacement for "trivial many".' },
    { term: 'Cumulative count', definition: 'The running total of counts from the largest category down to the current one.' },
    { term: 'Cumulative percentage', definition: 'The cumulative count divided by the grand total, times 100. It ends at 100%.' },
    { term: 'Second-level Pareto', definition: 'A Pareto chart of one top category broken down by finer sub-categories.' },
  ],
  comparisons: [
    {
      title: 'Frequency Pareto versus cost-weighted Pareto',
      head: ['Aspect', 'Frequency Pareto', 'Cost-weighted Pareto'],
      rows: [
        ['Bar height', 'Number of occurrences', 'Occurrences x cost (or impact) each'],
        ['Answers', 'What happens most often?', 'Where is the most money or harm?'],
        ['Kestrel top category', 'Router setup (412)', 'Line fault (£33,866)'],
        ['Best when', 'Categories have similar impact, or customer experience is the Y', 'Impact varies widely, or the Y is cost'],
        ['Risk', 'Over-prioritises cheap, frequent problems', 'Depends on credible cost estimates'],
      ],
    },
    {
      title: 'Healthy versus flat Pareto',
      head: ['Feature', 'Healthy Pareto', 'Flat Pareto'],
      rows: [
        ['Bars', 'A few tall bars then a long tail', 'Bars of similar height'],
        ['Cumulative line', 'Steep at first, then flattens', 'Close to a straight diagonal'],
        ['Likely meaning', 'Vital few exist', 'Poor categories, wrong stratification or no dominant cause'],
        ['Next step', 'Drill into the top bars', 'Re-categorise or stratify by another factor'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'A Pareto chart must show exactly 80% from 20% of categories.', reality: '80:20 is a rule of thumb. Real splits vary, and the two numbers need not add up to 100.' },
    { myth: '"Other" should be placed by its size like any category.', reality: '"Other" goes last regardless of size because it is not a single actionable category.' },
    { myth: 'The tallest bar is the root cause.', reality: 'The tallest bar is the category where the problem concentrates. Root causes are investigated and verified in Analyze.' },
    { myth: 'Frequency is always the right basis for ranking.', reality: 'When categories differ in cost or severity, a cost-weighted Pareto may produce a very different and more useful ranking.' },
  ],
  examTraps: [
    { title: 'Cumulative versus category percentage', text: 'Questions often ask for the cumulative percentage at a category. Do not give that category\'s own percentage; give the running total divided by the grand total.' },
    { title: 'Divide by the grand total', text: 'Include "Other" in the total. Dividing by the total of named categories only inflates every cumulative percentage.' },
    { title: 'Which axis?', text: 'Counts (or cost) are on the left axis; the cumulative percentage is on the right axis from 0% to 100%.' },
    { title: 'Smallest set reaching 80%', text: 'If asked how many categories account for at least 80%, choose the first row whose cumulative percentage is 80% or more, not the row closest to 80%.' },
  ],
  workedExamples: [
    {
      title: 'Cumulative percentages for invoice exceptions',
      scenario: 'Halden Health\'s accounts payable team recorded 440 invoice exceptions: purchase order mismatch 184, missing goods receipt 131, duplicate invoice 47, wrong tax code 38, changed supplier bank details 22, other 18. What share do the top three categories represent?',
      steps: [
        'Check the order: counts are already descending, with Other last.',
        'Cumulative counts: 184, 315, 362, 400, 422, 440.',
        'Cumulative percent after row 3 = 362 / 440 x 100 = 82.3% (one decimal place).',
        'Check the trap: dividing by 422 (excluding Other) would give 85.8%, which is wrong.',
      ],
      answer: 'The top three categories account for 82.3% of exceptions: three of six categories, an 82:50 split rather than 80:20, but still a clear vital few.',
    },
    {
      title: 'Choosing between frequency and cost',
      scenario: 'Kestrel Mobile\'s retention team sees four complaint types in a month: password reset 640 at £3.50 each, SIM swap delay 210 at £9.00, roaming bill shock 120 at £38.00, number port failure 85 at £61.00. The project Y is complaint handling cost.',
      steps: [
        'Frequency ranking: password reset (640) first.',
        'Cost per category: password reset £2,240; SIM swap £1,890; roaming £4,560; number port £5,185.',
        'Cost ranking: number port failure (£5,185), roaming (£4,560), password reset (£2,240), SIM swap (£1,890).',
        'Since the project Y is cost, use the cost-weighted ranking.',
      ],
      answer: 'Number port failure should be first on the cost-weighted Pareto, even though it is the least frequent category.',
    },
  ],
  activity: {
    lab: 'pareto',
    prompt: 'Enter category counts for a support queue, sort them, and watch the cumulative line build. Then switch to cost weighting and see which categories change rank. Try merging and splitting categories to turn a flat Pareto into a useful one.',
  },
  checkQuestionIds: ['q-1.2.4-01', 'q-1.2.4-04', 'q-1.2.4-07'],
  takeaways: [
    'The Pareto principle says a minority of factors drives most of the effect; 80:20 is a heuristic, not a law.',
    'Sort categories in descending order and place "Other" last regardless of its size.',
    'Cumulative percentage = cumulative count / grand total x 100; compute it from counts, not rounded percentages.',
    'Counts or cost go on the left axis; the cumulative percentage line uses the right axis from 0% to 100%.',
    'Weighting by cost or impact can reorder priorities; choose the weighting that matches the project Y.',
    'A flat Pareto signals poor categories, the wrong stratification or no dominant category.',
    'Use a second-level Pareto to drill into a top bar until the problem is specific enough to charter.',
  ],
  flashcards: [
    { front: 'Who first described the Pareto principle?', back: 'Vilfredo Pareto (1848-1923); Juran applied it to quality as the vital few and trivial (later useful) many.' },
    { front: 'Where does "Other" go on a Pareto chart?', back: 'Last, regardless of its size.' },
    { front: 'Formula for cumulative percentage', back: 'Cumulative count / grand total x 100.' },
    { front: 'What is on the right axis of a Pareto chart?', back: 'Cumulative percentage, from 0% to 100%.' },
    { front: 'What does a flat Pareto suggest?', back: 'Poor or overlapping categories, the wrong stratification, or no dominant category.' },
    { front: 'Why build a cost-weighted Pareto?', back: 'Because frequent problems are not always the most expensive; impact weighting can change priorities.' },
    { front: 'Does Pareto prove root cause?', back: 'No. It shows where problems concentrate; root causes are verified in Analyze.' },
    { front: 'Second-level Pareto', back: 'A new Pareto of the records in one top category, using finer sub-categories.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.2.4 Pareto Analysis (80:20 rule).' },
    { source: 'gb-501-600', pdfPages: [590], printedPages: [587], note: 'Glossary definitions of Pareto Chart and Pareto Principle, including Vilfredo Pareto (1848-1923).' },
    { source: 'gb-501-600', pdfPages: [587], printedPages: [584], note: 'Glossary definition of a bar chart for categorical data.' },
    { source: 'supplementary', note: 'Juran\'s vital few and useful many, construction steps, cumulative calculations, cost weighting, flat Pareto interpretation, Other placement rationale and second-level drill-down.' },
  ],
}
