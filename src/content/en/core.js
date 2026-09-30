/* ==========================================================================
   English overlay for the core content. Addresses the same IDs as the Arabic
   model in ../core.js; only text changes. All people and data are fictional.
   ========================================================================== */

const EN_CORE = {
  REVIEW: { note: 'This information was checked against the official ClickUp Help Center on 30 September 2026. Screens, names and availability can change by plan, so always refer to the official link provided.' },

  LEVELS: { beginner: { name: 'Beginner' }, intermediate: { name: 'Intermediate' }, advanced: { name: 'Advanced' } },

  PEOPLE: {
    me: { name: 'You (trainee)', short: 'You', initials: 'Y' },
    maryam: { name: 'Maryam Al Hinai', short: 'Maryam', initials: 'M' },
    salim: { name: 'Salim Al Amri', short: 'Salim', initials: 'S' },
    noura: { name: 'Noura Al Shukaili', short: 'Noura', initials: 'N' },
    khalid: { name: 'Khalid Al Maamari', short: 'Khalid', initials: 'K' }
  },

  MODULES: {
    m1: { title: 'Getting Started with ClickUp', desc: 'What ClickUp is, when to use it, and how to move between Home, Inbox, notifications and search.' },
    m2: { title: 'Understanding the Hierarchy', desc: 'Workspace, then Space, Folder, List and Task, and which levels are optional.' },
    m3: { title: 'Managing Tasks', desc: 'Creating a clear task and setting the assignee, priority, dates, status, comments and templates.' },
    m4: { title: 'Views', desc: 'List, Board, Calendar, Table, Gantt, Timeline and Workload, and when to choose each one.' },
    m5: { title: 'Custom Fields', desc: 'Field types, consistent data, and Formula fields with documented examples.' },
    m6: { title: 'Collaboration', desc: 'Assigned comments, Docs, Whiteboards, Chat and Clips, and linking discussion to work.' },
    m7: { title: 'Planning and Time', desc: 'Estimating and tracking time, dependencies, relationships, overdue work and scheduling.' },
    m8: { title: 'Dashboards and Reporting', desc: 'Dashboard cards, data sources and filters, and how to read and interpret the numbers.' },
    m9: { title: 'Automations', desc: 'Trigger, then Condition, then Action; testing, limits and avoiding unintended results.' },
    m10: { title: 'Forms and Goals', desc: 'Taking in requests with Forms, turning them into tasks, and tracking progress with Goals.' },
    m11: { title: 'Sharing, Privacy and Permissions', desc: 'Roles and guests, private locations, inherited permissions and sharing a single task.' },
    m12: { title: 'Advanced Productivity', desc: 'Shortcuts, advanced search, integrations, AI features and reusable workflows.' }
  },

  PATHWAYS: {
    p1: { title: 'Getting started path', who: 'For people opening ClickUp for the first time', goal: 'Move around with confidence, understand where tasks live and create a complete task.' },
    p2: { title: 'Daily work path', who: 'For people who follow up their own and their team’s tasks every week', goal: 'Choose the right view, organize data, collaborate and plan your time.' },
    p3: { title: 'Follow-up and improvement path', who: 'For people who lead follow-up or build repeatable workflows', goal: 'Read dashboards, automate safely and set sharing and permissions correctly.' }
  },

  GLOSSARY: {
    'Workspace': { def: 'The top level in ClickUp. It holds all of an organization’s work, members and settings.', ex: 'One Workspace for the organization that contains every department.' },
    'Space': { def: 'A main area inside a Workspace for organizing one kind of work, such as a department, team or large initiative.', ex: 'One Space for the reporting team and another for service improvement.' },
    'Folder': { def: 'An optional level inside a Space that groups several Lists about one project or topic.', ex: 'A Folder called “Audit follow-up” with one List for each quarter.' },
    'Subfolder': { def: 'A Folder inside a Folder, for more complex workflows. A List is created inside it automatically.', ex: 'A Subfolder for each phase of a large project.' },
    'List': { def: 'The container where tasks live. A task cannot exist outside a List.', ex: 'A List called “Weekly reports”.' },
    'Task': { def: 'An actionable unit of work, with a name, description, assignee, status, dates and other fields.', ex: 'The task “Review the weekly report before Thursday”.' },
    'Subtask': { def: 'A task inside another task that splits the work into smaller steps. It can have its own assignee and date.', ex: 'A subtask “Collect this week’s figures” inside the report task.' },
    'Checklist': { def: 'Simple items inside a task that you tick off when done. Good for small steps that do not need their own assignee.', ex: 'Items: check the figures, add the chart, send to the manager.' },
    'Assignee': { def: 'The person responsible for doing the task. Assigning someone does not, on its own, give them access to a private location.', ex: 'Assigning Noura to prepare the meeting.' },
    'Status': { def: 'The stage a task has reached in the workflow, such as TO DO, IN PROGRESS or COMPLETE.', ex: 'Moving a task from IN PROGRESS to REVIEW.' },
    'Priority': { def: 'How important a task is: Urgent, High, Normal or Low. It helps you order your work.', ex: 'Urgent priority for an audit action due tomorrow.' },
    'Start Date': { def: 'The day work on the task is expected to start. It shows in Calendar, Gantt and Timeline.', ex: 'Data collection starts on Sunday.' },
    'Due Date': { def: 'The expected deadline for finishing the task. Open tasks past this date count as overdue.', ex: 'The report is due on Thursday.' },
    'Tag': { def: 'A short keyword that classifies tasks across different Lists and can be used to filter.', ex: 'An “audit” tag on every audit follow-up task.' },
    'Custom Field': { def: 'A field you add to record information the standard fields do not cover, such as a request number or requesting department.', ex: 'A Dropdown field called “Requesting department”.' },
    'Formula Field': { def: 'A Custom Field that calculates a value from other fields, such as the number of days between the start and due dates.', ex: 'DAYS(field("Due date"), field("Start date"))' },
    'Dependency': { def: 'A link between two tasks: one task is Blocking another, or one task is Waiting on another.', ex: 'Publishing the report is waiting on the figures being approved.' },
    'Relationship': { def: 'A link between tasks or items for reference, without forcing any order of work.', ex: 'Linking an improvement task to an earlier internal request.' },
    'Time Estimate': { def: 'The time a task is expected to take. Used for capacity planning and for reading Workload.', ex: 'A 3-hour estimate for preparing the presentation.' },
    'Time Tracking': { def: 'Recording the actual time spent on a task, with a timer or by entering it manually.', ex: 'Recording two actual hours on the review.' },
    'View': { def: 'A way of looking at the same tasks differently: List, Board, Calendar, Table and others.', ex: 'Board to follow stages, Calendar to see dates.' },
    'Filter': { def: 'A condition that shows only the tasks that match it, without deleting the others.', ex: 'Showing Maryam’s urgent tasks only.' },
    'Dashboard': { def: 'A page of visual cards that summarize work data, such as the spread of statuses or overdue tasks.', ex: 'A weekly Dashboard for following up audit actions.' },
    'Card': { def: 'An item on a Dashboard that shows a metric or chart from a chosen data location.', ex: 'A Bar Chart card of tasks by assignee.' },
    'Automation': { def: 'A rule that performs an action automatically when a trigger happens, with optional conditions.', ex: 'When the status changes to REVIEW, assign the reviewer.' },
    'Trigger': { def: 'The event that starts an automation, such as a task being created or its status changing.', ex: 'When status changes' },
    'Condition': { def: 'An optional rule that must be met before the action runs.', ex: 'If the priority is Urgent.' },
    'Action': { def: 'The change the automation makes, such as assigning a person, changing a status or adding a comment.', ex: 'Assign to Maryam' },
    'Form': { def: 'A form that other people fill in. Each submission creates a task in a chosen List.', ex: 'An “Internal request” form that creates a task in the requests List.' },
    'Goal': { def: 'A high-level goal made up of measurable Targets.', ex: 'The goal “Close the quarter’s audit actions”.' },
    'Guest': { def: 'Someone from outside the organization who can only reach the items and locations shared with them.', ex: 'An external consultant who sees a single task.' },
    'Limited Member': { def: 'Someone inside the organization who can only reach what is shared with them, unlike a full member.', ex: 'An employee from another department who takes part in one List.' },
    'Private': { def: 'An item or location that only the people it is explicitly shared with can see.', ex: 'A private List of sensitive audit actions.' },
    'Inbox': { def: 'Where notifications, reminders and replies to comments arrive. You reach it from Home.', ex: 'The Later tab for things you want to come back to.' },
    'Template': { def: 'A ready-made copy of a task, List or other item so you can reuse the same structure.', ex: 'A “Meeting preparation” task template with a fixed checklist.' },
    'Recurring Task': { def: 'A task that is created or rescheduled automatically on a set repeat, such as every week.', ex: 'A weekly report that repeats every Sunday.' },
    'Mention': { def: 'Typing @ followed by a person’s name in a comment to notify them directly.', ex: '@Maryam are the figures final?' },
    'Assigned Comment': { def: 'A comment that becomes an action required from a specific person, and is resolved once done.', ex: 'Assigning the comment “Check table 3” to Salim.' },
    'Workload': { def: 'A view that compares the work assigned to each person with their capacity over a period.', ex: 'Seeing that Khalid is above his capacity this week.' }
  },

  FAQ: [
    { q: 'Is this platform part of ClickUp or approved by ClickUp?', a: 'No. This is an independent learning platform. The screens inside it are simplified educational simulations made to explain concepts. They are not recordings from ClickUp and do not represent an official product.' },
    { q: 'Where is my progress saved?', a: 'On this browser and this device only, using local storage. There are no accounts, no sync between devices and no central reporting. If you clear your browser data or open the platform on another device, your progress starts again.' },
    { q: 'Does what I do in the Practice Lab affect the real ClickUp?', a: 'No. The lab is a completely separate training space with fictional data, and you can reset it at any time.' },
    { q: 'Why can’t I see a certain feature in my ClickUp account?', a: 'Some features depend on your subscription plan, your role in the Workspace, or a setting called a ClickApp that an admin turns on. Lessons point this out with a “Depends on plan or settings” label. Check with your Workspace admin.' },
    { q: 'What is the difference between the person assigned to a task and the people who can see it?', a: 'The Assignee decides who does the work. Access is decided by permissions and by sharing the location or item. Someone can be assigned a task in a private location and still need it shared with them before they can reach it. See Module 11.' },
    { q: 'Can I retake a quiz?', a: 'Yes. You can retake any short quiz or the final assessment. Your best and your latest scores are saved.' },
    { q: 'Does the platform work offline?', a: 'Yes. All core features are inside a single file. Only the font and the links to official references need the internet, and the platform uses a system font if the web font is not available.' },
    { q: 'Can I switch between Arabic and English?', a: 'Yes. Use the language switch at the top of every page. Your current lesson, activity answers, quiz answers and progress stay exactly as they are. Your choice is remembered on this browser when storage is available.' }
  ],

  COMMON_MISTAKES: [
    { title: 'A task with a vague name', wrong: '“The report”', right: '“Prepare the weekly customer service report, week 38”' },
    { title: 'A task with no assignee or date', wrong: 'A task everyone assumes someone else will pick up.', right: 'One clear assignee and a realistic due date.' },
    { title: 'A Folder for everything', wrong: 'Nested Folders for simple work that a List would handle.', right: 'Start with a Space and a List, and add a Folder only when you need to group Lists.' },
    { title: 'Confusing assignment with permission', wrong: 'Assigning someone to a private task and assuming they can see it.', right: 'Share the task itself with them at the right permission level.' },
    { title: 'Automation without testing', wrong: 'Turning an automation on for a whole Space straight away.', right: 'Try it on a small test List and watch the result.' },
    { title: 'Reading a Dashboard without its filters', wrong: 'Comparing numbers from different locations as if they came from one.', right: 'Check the data source and filters before you draw conclusions.' }
  ],

  RESOURCES: [
    { title: 'ClickUp Help Center', note: 'The official reference for every feature and step.' },
    { title: 'Official ClickUp website', note: 'Product information and plans.' },
    { title: 'Intro to the Hierarchy', note: 'Workspace, Space, Folder, List and Task.' },
    { title: 'Keyboard shortcuts', note: 'How to turn them on and show the list.' },
    { title: 'Permissions in detail', note: 'View only, Comment, Edit and Full edit.' }
  ],

  LAB_LISTS: {
    weekly: { name: 'Weekly reports' },
    requests: { name: 'Internal requests' },
    audit: { name: 'Audit actions' },
    service: { name: 'Service improvement initiative' }
  },

  CHALLENGES: {
    c1: { title: 'Weekly report task', text: 'Create a task to review the weekly report, give it an assignee, set a due date, then move it to IN PROGRESS.',
      steps: ['Create a new task whose name includes “weekly report”', 'Give it an assignee', 'Set a due date', 'Move it to IN PROGRESS'] },
    c2: { title: 'Checklist for the audit log', text: 'In the task “Update the audit actions log”, make the checklist at least 3 items long and tick one item as done.',
      steps: ['Open the task “Update the audit actions log”', 'Have 3 or more items', 'Tick at least one item as done'] },
    c3: { title: 'Escalate an overdue task', text: 'The task “Request: prepare a presentation for the management visit” is overdue. Raise its priority to Urgent and add a comment that mentions a colleague with @.',
      steps: ['Change the priority to Urgent', 'Add a comment that contains an @ mention'] },
    c4: { title: 'Maryam’s board', text: 'Show the Board view and make it show Maryam’s tasks only.',
      steps: ['Go to Board', 'Filter by assignee: Maryam'] },
    c5: { title: 'From review to complete', text: 'In Board, move “Request: review the leave form” from REVIEW to COMPLETE.',
      steps: ['Use the Board view', 'Move the task to COMPLETE'] },
    c6: { title: 'Nearest due date first', text: 'In List, sort the tasks by due date, then open an overdue task to review it.',
      steps: ['Use List', 'Sort by Due date', 'Open an overdue task'] }
  },

  PRACTICAL: {
    title: 'End-to-end practical challenge: an internal request from start to follow-up',
    scenario: 'The Customer Service department has asked you to prepare a “Q3 complaints summary” within a week. Log it and follow it up the way a professional team would, and on the way close an audit action that was approved today.',
    steps: [
      'Create the task in the “Internal requests” List with a name of 4 words or more',
      'Give it an assignee, and set the priority to High or Urgent',
      'Set a due date within the next seven days',
      'Add at least two items to the checklist',
      'Add a comment to the task',
      'Move the task to IN PROGRESS',
      'Close the task “Approve the remediation plan for audit finding 11” by moving it to COMPLETE'
    ]
  },

  HOME_DEMO: { steps: [
    { cap: 'This is the Board for the service improvement initiative. Each column is a status and each card is a task. The chart on the right reads the statuses from the tasks themselves.' },
    { cap: 'We start work on “Review the weekly report”: moving it to IN PROGRESS updates the chart immediately.' },
    { cap: 'The draft is finished, so it moves to REVIEW for someone else to check before it is closed.' },
    { cap: 'Once approved, it moves to COMPLETE. The count in each column and the chart always match the actual tasks.' },
    { cap: 'This is what you will practise: moving work and reading its effect, inside a safe training space with fictional data.' }
  ] }
};

/* Seeded Practice Lab text in English, by task ID (same IDs as the Arabic seed) */
const LAB_SEED_EN = {
  w1: { title: 'Collect this week’s call centre figures' },
  w2: { title: 'Update the complaints KPI dashboard', desc: 'Required: update the complaints indicators with this week’s figures and compare them with last week.' },
  w3: { title: 'Review notes from last week’s meeting' },
  w4: { title: 'Send last week’s report to management' },
  w5: { title: 'Check revenue figures with Finance' },
  w6: { title: 'Read the weekly report preparation guide' },
  w7: { title: 'Archive the Q2 reports' },
  w8: { title: 'Build the new weekly report template' },
  r1: { title: 'Request: monthly plan sales report', comments: ['The first figures are ready in the attachment.'] },
  r2: { title: 'Request: update support team details in the directory' },
  r3: { title: 'Request: print ID cards for trainees' },
  r4: { title: 'Request: prepare a presentation for the management visit' },
  r5: { title: 'Request: review the leave form' },
  r6: { title: 'Request: attendance list for the knowledge transfer workshop' },
  r7: { title: 'Request: update the contact list' },
  a1: { title: 'Close audit finding 7: system permissions' },
  a2: { title: 'Update the audit actions log', checklist: { k1: 'Review the open actions' } },
  a3: { title: 'Collect documents for audit finding 9' },
  a4: { title: 'Approve the remediation plan for audit finding 11' },
  a5: { title: 'Close audit finding 4' },
  a6: { title: 'Review the document archiving policy' },
  s1: { title: 'Analyse why internal requests are delayed' },
  s2: { title: 'Design a single request form' },
  s3: { title: 'Pilot the form with one department' },
  s4: { title: 'Train teams on the single form' },
  s5: { title: 'Measure response time after rollout' },
  s6: { title: 'Publish the form user guide' },
  s7: { title: 'Prepare the training workshop schedule' }
};
