import type { Lesson } from '../types'

export const lesson: Lesson = {
  id: '1.4.2',
  module: 4,
  officialTitle: 'The History of Lean',
  title: 'The History of Lean',
  subtitle: 'From Ford\'s moving line to Toyota, to the hospital ward and the service desk',
  readingMinutes: 13,
  status: 'supplementary',
  objectives: [
    "Describe what Henry Ford contributed to flow production and where his system fell short.",
    "Explain the roles of Sakichi Toyoda, Kiichiro Toyoda, Taiichi Ohno and Shigeo Shingo in building the Toyota Production System.",
    "Define the two pillars of TPS, Just-in-Time and jidoka, with a service example of each.",
    "Explain how post-war conditions in Japan shaped Toyota's choices.",
    "Trace how the word 'lean' was coined and spread through Krafcik, The Machine That Changed the World and Lean Thinking into services, healthcare and Lean Six Sigma.",
  ],
  overview: [
    "Lean was not invented in a single moment. It grew over most of the twentieth century, first in American car plants, then in a small Japanese company that could not afford to copy the Americans, and finally in research that gave the approach a name and carried it into every kind of organisation. Knowing that story helps you understand *why* Lean tools look the way they do: almost every one of them is an answer to a specific constraint Toyota faced.",
    "None of the supplied book pages cover this history, so this lesson is supplementary context. The exam may still ask who did what, and the timeline is useful for explaining to sceptical colleagues that Lean is a tested body of practice, not a fashion.",
  ],
  sections: [
    {
      id: 'ford',
      title: 'Ford and the idea of flow (1910s)',
      blocks: [
        { kind: 'p', text: "In 1913 Henry Ford's Highland Park plant introduced the moving assembly line for the Model T. Instead of workers walking to the car, the car moved past the workers, each doing a short, standard task. Assembly time per chassis fell dramatically and the car became affordable to ordinary families." },
        { kind: 'p', text: "Ford proved that **continuous [[Flow]]** and **standardised work** could transform productivity. But his system depended on huge volumes of one design, large buffers of parts, and very little variety. It was efficient for one product and poor at change. That limitation is the gap Toyota later filled." },
      ],
    },
    {
      id: 'toyoda-family',
      title: 'The Toyoda family: looms, cars and two key ideas',
      blocks: [
        { kind: 'p', text: "**Sakichi Toyoda** built automatic looms in the early 1900s. One of his innovations was a loom that stopped itself when a thread broke, so a defective cloth was never woven and one operator could watch many machines. This idea, building the ability to detect a problem and stop into the process, became [[Jidoka]], often translated as 'automation with a human touch' or autonomation." },
        { kind: 'p', text: "His son **Kiichiro Toyoda** moved the family business into cars and founded what became Toyota Motor Co. in 1937. He promoted the idea that each process should make only what the next process needed, when it was needed: the seed of [[Just-in-Time]] (JIT)." },
        { kind: 'callout', tone: 'memory', title: 'Two pillars', text: "The [[Toyota Production System]] is often drawn as a house resting on two pillars: **Just-in-Time** (make only what is needed, when it is needed, in the amount needed) and **jidoka** (stop and fix problems at the source rather than passing them on)." },
      ],
    },
    {
      id: 'post-war-constraints',
      title: 'Why Toyota could not copy Ford',
      blocks: [
        { kind: 'p', text: "After the Second World War Toyota faced conditions that made Ford's mass-production model impossible:" },
        { kind: 'list', items: [
          "**A small, varied home market.** Japan needed many types of vehicle in small numbers, not one model in millions.",
          "**Little capital.** Toyota could not fund large inventories or many dedicated machines, so stock was a cash problem.",
          "**Limited space** in factories and warehouses.",
          "**A financial crisis and labour dispute around 1950** that led to job cuts and a later commitment to long-term employment, which made workers a fixed asset worth developing rather than a variable cost.",
          "**Foreign competitors** far larger and more productive.",
        ] },
        { kind: 'p', text: "Every one of these pressures pointed the same way: produce small quantities, change over quickly, hold little stock, and use the brains of every worker. Lean is what scarcity taught Toyota." },
      ],
    },
    {
      id: 'ohno-shingo',
      title: 'Ohno, Shingo and the Toyota Production System (1950s-1970s)',
      blocks: [
        { kind: 'p', text: "**Taiichi Ohno**, a Toyota production engineer and later executive, built TPS on the shop floor from the late 1940s onwards. Inspired partly by how American supermarkets restocked shelves only as customers took goods, he developed pull systems controlled by [[Kanban]] cards. He is also credited with classifying the **seven wastes** that you will study in lesson 1.4.4." },
        { kind: 'p', text: "**Shigeo Shingo**, an industrial engineer who worked with Toyota as a consultant, developed SMED (single-minute exchange of die), which cut machine changeovers from hours to minutes and made small batches economical. He also systematised [[Poka-Yoke]], simple devices that make mistakes impossible or immediately obvious." },
        { kind: 'p', text: "TPS attracted wide attention after the 1973 oil crisis, when Toyota recovered faster than most Japanese manufacturers." },
      ],
    },
    {
      id: 'naming-lean',
      title: 'Naming it Lean and taking it everywhere (1988 onwards)',
      blocks: [
        { kind: 'p', text: "Researchers at the Massachusetts Institute of Technology's International Motor Vehicle Program studied car plants worldwide. In 1988 **John Krafcik**, a researcher on the program, used the word **'lean'** to describe Toyota-style production because it used less of everything: less space, less inventory, less effort and less time to develop new models." },
        { kind: 'p', text: "In 1990 James Womack, Daniel Jones and Daniel Roos published *The Machine That Changed the World*, which made 'lean production' a mainstream term. In 1996 Womack and Jones published *Lean Thinking*, which extracted the five principles (value, value stream, flow, pull, perfection) so that any organisation could apply them." },
        { kind: 'p', text: "From the late 1990s Lean spread into offices, banks, software, government and healthcare. Hospitals used it to cut waiting times for clinics and surgery; telecom operators used it for order-to-activation and fault repair. In the early 2000s Lean was combined with [[Six Sigma]] into Lean Six Sigma (Michael George's 2002 book helped popularise the term), which is why today's Green Belt studies waste and variation together. Lean principles are now part of the ordinary vocabulary of process improvement: value streams, pull, [[Visual Management]] and [[Kaizen]] appear in service management frameworks and agile software methods alike." },
        { kind: 'diagram', diagram: 'lean-history', caption: 'From Highland Park to the hospital ward: the main milestones of Lean.' },
      ],
    },
  ],
  whyItMatters: [
    "Knowing where each tool came from helps you apply it with judgement. Kanban exists because Toyota could not afford stock; if your service team has no stock problem, the principle of pull still applies but the cards may not.",
    "History questions on the exam reward precise attribution. Mixing up Ford and Ohno, or Krafcik and Womack, costs easy marks.",
  ],
  businessExample: {
    title: 'Jidoka at a service desk',
    industry: 'IT service management',
    blocks: [
      { kind: 'p', text: "Solent Data Services found that 11.3% of new-starter laptop requests were provisioned with the wrong software profile, discovered only when the employee logged in on day one." },
      { kind: 'p', text: "Borrowing Sakichi Toyoda's idea, the team added an automatic check: if the requested profile did not match the employee's department code, the request stopped and returned to the requester instead of flowing to the build team. Like the loom that stopped on a broken thread, the process now refused to pass a defect downstream. Wrong-profile builds fell to 1.8% within two months." },
    ],
  },
  visual: {
    diagram: 'lean-history',
    title: 'A century of Lean',
    caption: "Ford's flow (1913), the Toyoda family's jidoka and JIT, Ohno's TPS, Krafcik's naming (1988), the two landmark books (1990 and 1996), and the spread into services and Lean Six Sigma.",
  },
  definitions: [
    { term: 'Toyota Production System (TPS)', definition: "Toyota's management and production system, built mainly under Taiichi Ohno, resting on Just-in-Time and jidoka." },
    { term: 'Just-in-Time (JIT)', definition: "Producing or delivering only what is needed, when it is needed, in the quantity needed." },
    { term: 'Jidoka', definition: "Building the ability to detect an abnormality and stop into a process, so defects are not passed on. Often called autonomation." },
    { term: 'Kanban', definition: "A signal, originally a card, that authorises upstream work or replenishment based on actual consumption." },
    { term: 'SMED', definition: "Single-minute exchange of die: Shingo's method for cutting changeover time, which makes small batches economical." },
    { term: 'Lean production', definition: "The term coined by Krafcik (1988) and popularised by The Machine That Changed the World (1990) for Toyota-style production that uses less of every resource." },
  ],
  comparisons: [
    {
      title: 'Ford mass production versus Toyota Production System',
      head: ['Aspect', 'Ford mass production', 'Toyota Production System'],
      rows: [
        ['Product variety', 'Very low, one main model', 'High, many models in small volumes'],
        ['Batch size', 'Large', 'Small, made possible by quick changeover'],
        ['Inventory', 'Large buffers to keep the line running', 'Minimal, controlled by pull and kanban'],
        ['Quality', 'Inspect and rework at the end', 'Stop and fix at the source (jidoka)'],
        ['Role of workers', 'Repeat a narrow task', 'Do standard work and improve it (kaizen)'],
      ],
    },
    {
      title: 'Who did what',
      head: ['Person', 'Main contribution', 'Era'],
      rows: [
        ['Henry Ford', 'Moving assembly line, flow production', '1913'],
        ['Sakichi Toyoda', 'Self-stopping loom, origin of jidoka', 'Early 1900s'],
        ['Kiichiro Toyoda', 'Founded Toyota Motor; Just-in-Time idea', '1930s'],
        ['Taiichi Ohno', 'Built TPS, kanban pull, seven wastes', '1950s-1970s'],
        ['Shigeo Shingo', 'SMED and poka-yoke', '1960s-1970s'],
        ['John Krafcik', "Coined 'lean'", '1988'],
        ['Womack, Jones and Roos', 'The Machine That Changed the World', '1990'],
        ['Womack and Jones', 'Lean Thinking and the five principles', '1996'],
      ],
    },
  ],
  misconceptions: [
    { myth: 'Lean was invented by Toyota from nothing.', reality: "Toyota openly learned from Ford's flow and from American supermarkets. Its originality was adapting those ideas to low volume, high variety and scarce capital." },
    { myth: "Taiichi Ohno coined the word 'lean'.", reality: "Ohno built TPS. The word 'lean' came from MIT researcher John Krafcik in 1988." },
    { myth: 'Lean is only for car manufacturing.', reality: "Since the late 1990s Lean has been applied in hospitals, banks, telecoms, software and government. The principles concern flow of value, not cars." },
  ],
  examTraps: [
    { title: 'Krafcik versus Womack', text: "Krafcik coined the term (1988). Womack, Jones and Roos popularised it (1990). Womack and Jones wrote the five principles (1996)." },
    { title: 'Jidoka is not Just-in-Time', text: "Both are TPS pillars. JIT is about timing and quantity; jidoka is about stopping on abnormality. Stems describing a process that halts when a defect is detected point to jidoka." },
    { title: 'Ford contributed flow, not pull', text: "Ford's line was a push system built on large inventories. Pull and kanban are Toyota contributions." },
  ],
  workedExamples: [
    {
      title: 'Which pillar is this?',
      scenario: "Halden Health's pharmacy restocks ward medicines only when a ward's bin falls to a marked line, and the ward's dispensing cabinet locks if a nurse scans a drug that does not match the patient's wristband.",
      steps: [
        "Restocking triggered by consumption is pull, which is Just-in-Time.",
        "Locking when a mismatch is detected stops the process at the abnormality, which is jidoka (with a poka-yoke device).",
      ],
      answer: "The restocking rule illustrates Just-in-Time; the locking cabinet illustrates jidoka.",
    },
    {
      title: 'Explaining Lean to a sceptical director',
      scenario: "A director at Kestrel Mobile says Lean is a car-factory fad that cannot help a contact centre.",
      steps: [
        "Point to the origin: Lean was a response to scarcity and variety, which a contact centre also faces (many call types, limited staff).",
        "Point to the spread: services and healthcare have used Lean since the late 1990s, and Lean Six Sigma combined it with Six Sigma in the early 2000s.",
        "Translate a tool: pull becomes routing calls to available skills instead of queueing to a fixed team.",
      ],
      answer: "Lean is a set of principles about value and flow, refined over decades and widely used outside manufacturing.",
    },
  ],
  activity: {
    lab: 'history',
    prompt: "Place the Lean milestones on the timeline and match each person to their contribution.",
  },
  checkQuestionIds: ['q-1.4.2-01', 'q-1.4.2-04', 'q-1.4.2-07'],
  takeaways: [
    "Ford (1913) proved the power of flow but relied on huge volumes, low variety and big inventories.",
    "Sakichi Toyoda's self-stopping loom is the origin of jidoka; Kiichiro Toyoda promoted Just-in-Time.",
    "Taiichi Ohno built TPS with kanban pull and identified the seven wastes; Shingo added SMED and poka-yoke.",
    "Post-war scarcity of capital, space and demand volume forced Toyota towards small batches and low stock.",
    "Krafcik coined 'lean' (1988); The Machine That Changed the World (1990) and Lean Thinking (1996) spread it.",
    "Lean moved into services and healthcare and merged with Six Sigma in the early 2000s.",
  ],
  flashcards: [
    { front: 'Year of Ford\'s moving assembly line', back: '1913, Highland Park.' },
    { front: 'Two pillars of TPS', back: 'Just-in-Time and jidoka.' },
    { front: 'Origin of jidoka', back: "Sakichi Toyoda's loom that stopped when a thread broke." },
    { front: 'Who built TPS and named the seven wastes?', back: 'Taiichi Ohno.' },
    { front: 'Shigeo Shingo', back: 'SMED (quick changeover) and poka-yoke (mistake proofing).' },
    { front: "Who coined 'lean' and when?", back: 'John Krafcik, 1988, at MIT.' },
    { front: 'Lean Thinking (1996)', back: 'Womack and Jones; the five Lean principles.' },
  ],
  sources: [
    { source: 'syllabus', pdfPages: [7], note: 'Topic 1.4.2 The History of Lean in the detailed syllabus.' },
    { source: 'supplementary', note: 'The supplied files contain no Lean history; the whole narrative is supporting content based on widely documented history.' },
  ],
}
