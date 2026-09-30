/* English overlay: lessons in modules 1-4. Keys are the shared lesson IDs.
   Knowledge-check questions are keyed by their shared question IDs. */
const EN_LESSONS = {};
const EN_QUESTIONS = {};

Object.assign(EN_LESSONS, {
  /* ---------------- Module 1 ---------------- */
  'l1-1': {
    title: 'What ClickUp is and when to use it',
    objective: 'Explain in two sentences what ClickUp offers, and tell apart work that should be a task from information or discussion.',
    scenario: 'You have joined a team that follows up weekly reports and internal requests through scattered emails and spreadsheets. The team lead wants to move follow-up into ClickUp so everyone knows who is doing what, and when.',
    explain: [
      'ClickUp is a work management platform that brings tasks, documents, conversations and dashboards together in one place. The core idea is simple: every piece of actionable work becomes a Task with an assignee, a status and a date, so follow-up is visible to everyone instead of getting lost in email.',
      'Good everyday uses in a telecom workplace: following up recurring reports, taking in internal requests, tracking audit actions until they are closed, preparing meetings, knowledge transfer plans and service improvement initiatives.',
      'Not every piece of information is a task. A reference guide belongs in a Doc, and a quick discussion belongs in a comment or in Chat. Anything that needs someone to do it and a date to finish it by is a task.'
    ],
    deeper: { title: 'How is ClickUp different from a shared spreadsheet?', body: [
      'A spreadsheet records information, but it does not remind anyone or change anything on its own. In ClickUp every task has an activity log, alerts for the assignee and several views (list, board, calendar), and it can be linked to documents and other tasks and automated.',
      'That does not mean the tool organizes the team by itself. The quality of follow-up depends on clear tasks: an understandable name, one assignee and a realistic date.'
    ] },
    notes: [{ text: 'The screens on this platform are simplified educational simulations. The real interface may look different depending on your ClickUp version and Workspace settings.' }],
    demo: { steps: [
      { cap: 'This is the “Weekly reports” List shown as a Board. Each column is a status, and each card is one task.' },
      { cap: 'A card shows the essentials of a task: the name, the assignee, the priority and the date.' },
      { cap: 'When someone starts the work, they move the task to IN PROGRESS, so the team sees progress without anyone asking.' },
      { cap: 'When the work is finished it moves to COMPLETE. A clear status replaces “where are we on this?” messages.' }
    ] },
    exercise: { prompt: 'Classify each item: is it a task, reference information, or a discussion?',
      choices: ['Task', 'Reference information (Doc)', 'Discussion (comment or Chat)'],
      pairs: [
        ['Prepare the Sunday meeting agenda and send it to attendees', 'Task'],
        ['Step-by-step guide to preparing the weekly report', 'Reference information (Doc)'],
        ['Quick question: are we using last week’s figures?', 'Discussion (comment or Chat)'],
        ['Close audit finding no. 7 before the end of the month', 'Task']
      ] },
    mistake: { wrong: 'Moving the mess over as it is: dozens of tasks with generic names, no assignee and no date.', right: 'Every task has a clear outcome, one assignee and a realistic date. Anything that is not actionable work goes into a Doc or a comment.' },
    summary: ['ClickUp brings together tasks, documents, conversations and dashboards.', 'A task = actionable work with an assignee, a status and a date.', 'Reference information goes in a Doc; discussion goes in a comment or Chat.']
  },
  'l1-2': {
    title: 'Getting around: the Sidebar and Home',
    objective: 'Move between Home, Spaces and Lists, and find the tasks assigned to you within a minute.',
    scenario: 'It is your first day with ClickUp. You want to know: what do I need to do today? What is overdue? And where is the weekly reports List?',
    explain: [
      'The Sidebar is your map. At the top are Home and Inbox, and below them the Spaces with the Folders and Lists inside them.',
      'Home is your daily starting point: it gathers your tasks, notifications, conversations and favourites. Your tasks section usually orders them by timing, such as Overdue and Today, so you start with what needs attention first.',
      'To reach your team’s work, open a Space and then the List you need. To get there faster, add the things you use often to your favourites.'
    ],
    deeper: { title: 'Why might the interface look different for you?', body: [
      'ClickUp has changed the Sidebar design between versions (such as 3.0 and 4.0), and each user can customize what appears in it. So focus on the concepts: Home to start, Inbox for notifications, Spaces for work.'
    ] },
    notes: [{ text: 'The names and order of the Home sections change between ClickUp versions. The concept stays the same, but the exact layout may differ.' }],
    demo: { steps: [
      { cap: 'This is Home. On the left is the Sidebar: Home and Inbox, then the Spaces.' },
      { cap: 'The My Work section shows what is assigned to you. Start with what is overdue: this task was due yesterday and is not closed.' },
      { cap: 'Then today’s tasks. Plan your day from here before you open your email.' },
      { cap: 'To reach your team’s work, open the “Operations” Space and then the “Weekly reports” List.' }
    ] },
    exercise: { prompt: 'Match each part of the interface with what you use it for.',
      choices: ['Starting point: your tasks, notifications and favourites', 'Notifications, reminders and replies', 'Reaching the team’s Spaces and their Lists', 'Finding a task or document by name'],
      pairs: [['Home', 'Starting point: your tasks, notifications and favourites'], ['Inbox', 'Notifications, reminders and replies'], ['Spaces in the Sidebar', 'Reaching the team’s Spaces and their Lists'], ['Search', 'Finding a task or document by name']] },
    mistake: { wrong: 'Opening every List one by one each morning to look for your tasks.', right: 'Start from Home: the tasks assigned to you are gathered there and ordered by timing.' },
    summary: ['The Sidebar: Home, Inbox, then Spaces.', 'Home shows your tasks by timing: overdue first.', 'Open a Space and then a List to reach your team’s work.']
  },
  'l1-3': {
    title: 'Inbox, notifications and search',
    objective: 'Manage your notifications with the Inbox tabs, and find any task or document with search.',
    scenario: 'After a long meeting you find several notifications: a mention from a colleague that needs a reply, and an assignment to a new task. You also need to find the task “Review the weekly report” quickly.',
    explain: [
      'Inbox is where notifications, reminders and replies arrive, and you can reach it from Home. It has four tabs: Primary for what matters, Other for the remaining notifications, Later for what you want to come back to, and Cleared for what you have finished with.',
      'A healthy habit: open Primary, reply to what needs a reply, move to Later what needs time, and Clear what is done. That way your Inbox stays a real to-do list rather than a crowded archive.',
      'Search saves you from clicking around. Type part of the task or document name, then narrow the results by type or assignee.'
    ],
    deeper: { title: 'Controlling which notifications you get', body: [
      'In your personal notification settings you choose what reaches you and where (in the app, by email or on mobile). Cut down unimportant notifications so the important mentions do not get lost.'
    ] },
    notes: [{ text: 'In recent versions the shortcut for search and the command bar is Ctrl+K on Windows and Cmd+K on Mac (the AI Command Bar, previously called Command Center). The name may differ in your version.' }],
    demo: { steps: [
      { cap: 'Open Inbox from the Sidebar. The Primary tab shows the important notifications.' },
      { cap: 'Salim mentioned you with a question. There is no time to reply now, so move it to Later to come back to it.' },
      { cap: 'You will find the item later in the Later tab, so it does not get lost among new notifications.' },
      { cap: 'To find a task, click the search box and type part of its name.' },
      { cap: 'Results include tasks, documents and Lists. Choose the task you need to open it.' }
    ] },
    exercise: { prompt: 'You get a notification: “Khalid wants your opinion on the knowledge transfer plan before Sunday.” You are going into a meeting now. What is best?',
      options: [
        { t: 'Move it to Later and come back to it after the meeting', fb: 'Correct. Later keeps the item so you can return to it without it getting mixed up with new notifications.' },
        { t: 'Press Clear so the notification disappears', fb: 'Clear is for things you have finished. Here a reply is still expected from you.' },
        { t: 'Ignore it and rely on my memory', fb: 'Relying on memory is exactly what Inbox is there to avoid.' },
        { t: 'Turn off all notifications in the settings', fb: 'Turning off every notification means losing the important ones. Customize them instead of turning them off.' }
      ] },
    mistake: { wrong: 'Leaving hundreds of notifications in Primary until the Inbox is useless.', right: 'Reply, move to Later, or Clear. Keep Primary short every day.' },
    summary: ['Inbox: Primary, Other, Later and Cleared.', 'Reply, postpone to Later, or clear what is finished.', 'Search finds tasks, documents and Lists by name.']
  },

  /* ---------------- Module 2 ---------------- */
  'l2-1': {
    title: 'The Hierarchy: from Workspace to Subtask',
    objective: 'Draw the ClickUp Hierarchy in the right order, and know which levels are optional.',
    scenario: 'Your team follows up audit actions by quarter, takes in internal requests and prepares weekly reports. You want to understand where each type of work belongs.',
    explain: [
      'The Hierarchy in ClickUp is like an organization’s building: the Workspace is the whole organization. Inside it are Spaces for each department, team or large initiative.',
      'Inside a Space you can add a Folder, an optional level that groups several related Lists. A List is the required container for tasks: no task exists outside a List.',
      'The Task is the unit of work, and it can be split into Subtasks, and even nested subtasks for complex work.'
    ],
    deeper: { title: 'What about Subfolders?', body: [
      'For more complex workflows you can create a Subfolder inside a Folder. When you create a Subfolder, a List is created inside it automatically. Use them only when the extra grouping is genuinely useful.'
    ] },
    demo: { steps: [
      { cap: 'At the top: the Workspace, the whole organization with all its work and members.' },
      { cap: 'Inside it is the “Operations” Space. A Space organizes one kind of work for a team or department.' },
      { cap: 'The “Audit follow-up” Folder is optional: it groups one List for each quarter.' },
      { cap: 'The “Q3” List is the container where tasks live. Notice that “Internal requests” is a List directly in the Space, with no Folder.' },
      { cap: 'Inside the List is a task, and you can open it to see its subtasks, each with its own assignee and dates.' }
    ] },
    exercise: { prompt: 'Put the levels in order from highest to lowest.', items: ['Workspace', 'Space', 'Folder (optional)', 'List', 'Task', 'Subtask'] },
    mistake: { wrong: 'Creating a new Space for every small project, so the Sidebar grows out of control.', right: 'A Space for the team or department, with a List or Folder inside it for each project or topic.' },
    summary: ['Workspace → Space → Folder (optional) → List → Task → Subtask.', 'The List is the required container for tasks.', 'Start simple and add levels when you need them.']
  },
  'l2-2': {
    title: 'When to use a Folder and when a List is enough',
    objective: 'Choose the right structure for new work: a List on its own, a Folder of Lists, or a Subfolder.',
    scenario: 'You have been asked to launch follow-up for the “Service improvement” initiative, and you do not want to clutter the Sidebar for your colleagues.',
    explain: [
      'The practical rule: start with a List. If the work is a set of tasks on one topic, a single List inside the team’s Space is enough.',
      'Add a Folder when you have several related Lists to group together, such as one List per quarter under “Audit follow-up”.',
      'Use a Subfolder only for complex work with several phases that each need several Lists. Every extra level means an extra click for everyone on the team.'
    ],
    deeper: { title: 'Settings are inherited from above', body: [
      'Many settings for statuses, fields and permissions can be set at the Space, Folder or List level, and they pass down to what is inside unless changed. Keeping similar Lists in the same Folder makes it easier to keep settings consistent.'
    ] },
    notes: [{ text: 'Creating Spaces and changing their settings may be limited to Workspace owners and admins, depending on your organization’s settings. Employees usually work inside existing Lists.' }],
    demo: { steps: [
      { cap: 'Here the “Operations” Space is open, with a Folder and a List inside it.' },
      { cap: 'To add new work, press + next to the Space name.' },
      { cap: 'The initiative is one topic, so a List on its own is enough, with no Folder.' },
      { cap: 'Audit follow-up, on the other hand, needs a List for each quarter, so those Lists are grouped in one Folder.' }
    ] },
    exercise: { prompt: 'Choose the best structure for each case.',
      choices: ['One List inside the team’s Space', 'A Folder with one List per quarter', 'A Folder with Subfolders for phases', 'A new Space'],
      pairs: [
        ['A weekly report that repeats with the same steps', 'One List inside the team’s Space'],
        ['Audit actions followed up by quarter', 'A Folder with one List per quarter'],
        ['A large project in phases, each with several Lists', 'A Folder with Subfolders for phases'],
        ['A new department joining with its teams and work', 'A new Space']
      ] },
    mistake: { wrong: 'Nested Folders for simple work that one List would handle, so colleagues get lost in clicks.', right: 'Start with a List, and add a Folder only when you have several related Lists.' },
    summary: ['Start with a List.', 'A Folder groups related Lists.', 'Subfolders are for complex work only.']
  },

  /* ---------------- Module 3 ---------------- */
  'l3-1': {
    title: 'Creating a task with a useful name and description',
    objective: 'Create a task any colleague can understand without asking you: a name that starts with a verb, and a description that states what is needed and where the references are.',
    scenario: 'Your manager has asked you to review the customer service weekly report before Thursday. You want to record that as a clear task.',
    explain: [
      'A good name starts with a verb and names the specific thing: “Review the customer service weekly report, week 38” is far better than “The report”.',
      'The description answers three questions: What is the goal? What exactly is needed (the deliverable)? Where are the references? Keep it short, and attach files instead of describing them.',
      'You can create a task from the Add Task button in a List, or from any view. After creating it, fill in its details: assignee, date and priority, as in the next lesson.'
    ],
    deeper: { title: 'A quick description template', body: [
      '<strong>Goal:</strong> Why are we doing this?<br><strong>Required:</strong> What exactly is delivered, and in what format?<br><strong>References:</strong> The related files or documents.<br><strong>Done when:</strong> A clear standard for closing it.'
    ] },
    demo: { steps: [
      { cap: 'This is a new task page. We start with the name, because that is what everyone sees in Lists and notifications.' },
      { cap: 'We write a name that starts with a verb and names the specific thing needed.' },
      { cap: 'In the description: the goal, what is required and when it counts as done, briefly.' },
      { cap: 'We attach the figures file instead of describing it. The attachment stays with the task for everyone who works on it.' }
    ] },
    exercise: { prompt: 'Write a name and description for this task: “Prepare the minutes for Sunday’s internal requests follow-up meeting”.',
      goals: [
        { text: 'The name is 4 words or more and describes the specific thing' },
        { text: 'The description is 12 words or more' },
        { text: 'The description states what is required, the goal or when it is done (use one of these words: required, goal, done, deliverable, output)' }
      ] },
    mistake: { wrong: 'The name “Meeting” and an empty description, so everyone who sees the task asks: which meeting? What is needed?', right: '“Prepare the minutes for the internal requests follow-up meeting, Sunday” with a description that states the deliverable and the reference.' },
    summary: ['Name: verb + specific thing + period if needed.', 'Description: goal, what is required, references, done-when.', 'Attach files instead of describing them.']
  },
  'l3-2': {
    title: 'Assignee, priority, dates and status',
    objective: 'Complete a task’s core details: one assignee, a start and due date, a priority, and a status that reflects reality.',
    scenario: 'Your manager has asked for a presentation for Sunday’s meeting with high priority, and work on it starts today.',
    explain: [
      '<strong>Assignee:</strong> the person responsible for doing the work. You can assign more than one person, but one clear assignee reduces confusion.',
      '<strong>Start Date and Due Date:</strong> when work starts and when it is due. They appear in Calendar and Gantt, and an open task past its due date counts as overdue.',
      '<strong>Priority:</strong> four levels: Urgent, High, Normal and Low. Use Urgent sparingly or it loses its meaning.',
      '<strong>Status:</strong> reflects the stage of the work. Default statuses belong to groups: Active for work in progress, Done for finished work that stays open, and Closed for fully completed work (its default status is Complete). An admin may also turn on the Not Started group.'
    ],
    deeper: { title: 'Why do statuses differ from one List to another?', body: [
      'Statuses can be customized for each Space, Folder or List, for example by adding REVIEW. So one List may have statuses you do not see in another. Custom statuses of the Closed type cannot be created.'
    ] },
    notes: [{ text: 'Changing the available statuses and turning on the Not Started group is done by whoever manages the location’s settings (an owner or admin, in the case of Not Started).' }],
    demo: { steps: [
      { cap: 'We are starting work now, so we change the status from TO DO to IN PROGRESS.' },
      { cap: 'We set the assignee: Noura will prepare the presentation.' },
      { cap: 'We add the start date and due date, so the task appears in the right place on the calendar.' },
      { cap: 'The priority is High, not Urgent. We keep Urgent for things that cannot wait.' }
    ] },
    exercise: { prompt: 'Complete the details for the task “Prepare the Sunday meeting presentation” as in the scenario: work started today, the priority is high, Noura is the assignee, and it is due before next Sunday.',
      start: { title: 'Prepare the Sunday meeting presentation' },
      goals: [
        { text: 'The status shows that you have started: IN PROGRESS' },
        { text: 'Assignee: Noura' },
        { text: 'Priority: High' },
        { text: 'Start date today or earlier, and a due date after it' }
      ] },
    mistake: { wrong: 'Leaving the status at TO DO even though work has started, so the team thinks nobody has begun.', right: 'Update the status the moment work starts and the moment it goes to review.' },
    summary: ['One clear assignee where possible.', 'Start and due dates put the task on the timeline.', 'Four priority levels, with Urgent for exceptions.', 'Update the status as soon as reality changes.']
  },
  'l3-3': {
    title: 'Checklists, subtasks, tags and attachments',
    objective: 'Pick the right tool for splitting work: a Checklist for small steps, a Subtask for independent parts, and a Tag for classifying.',
    scenario: 'The weekly report task has small steps you do yourself, and one part that Salim from Finance needs to take on.',
    explain: [
      '<strong>Checklist:</strong> simple items inside a task that you tick off when done. Good for short steps done by the same person.',
      '<strong>Subtask:</strong> a full task inside a task, with its own assignee, date and status. Use it when someone else takes on part of the work or it needs separate follow-up.',
      '<strong>Tags:</strong> short keywords that classify tasks across Lists, such as “audit” or “q3”, and help with filtering.',
      '<strong>Attachments:</strong> files linked to the task, so they stay with the work instead of getting lost in email.'
    ],
    deeper: { title: 'Nested subtasks', body: ['For complex projects you can create layers of nested subtasks. But every extra layer makes things harder to see, so use them sparingly.'] },
    demo: { steps: [
      { cap: 'In the Checklist we tick off what is done: we have checked the figures against the source.' },
      { cap: 'We add a small new item that we will do ourselves.' },
      { cap: 'Checking the Finance figures is Salim’s job, so it is a Subtask with its own assignee.' },
      { cap: 'We add a tag that classifies the task, so all the weekly report tasks can be gathered with one filter.' }
    ] },
    exercise: { prompt: 'Choose the best tool for each case.',
      choices: ['Checklist', 'Subtask', 'Tag', 'Attachment'],
      pairs: [['A small step you finish yourself in a few minutes', 'Checklist'], ['An independent part a colleague takes on with a different date', 'Subtask'], ['A label that gathers tasks from different Lists', 'Tag'], ['The figures file the task depends on', 'Attachment']] },
    mistake: { wrong: 'Turning every small step into a Subtask, so Lists fill up with dozens of tiny tasks.', right: 'Small steps go in a Checklist; independent parts with another assignee go in a Subtask.' },
    summary: ['Checklist for small steps.', 'Subtask for independent parts with an assignee and date.', 'Tags classify, and attachments stay with the task.'],
    refs: [{}, { label: 'Help Center: search for Checklists' }]
  },
  'l3-4': {
    title: 'Comments, mentions and the activity log',
    objective: 'Write a comment that reaches the right person with an @mention, and read the Activity log to see what changed.',
    scenario: 'You reviewed the report and found a figure you need Salim to confirm. Instead of an email, you want to ask inside the task itself.',
    explain: [
      'Comments inside a task keep the discussion with the work. Anyone who joins later can read the whole story in one place.',
      'Type @ and the person’s name to mention them, and they get a notification. The person mentioned becomes part of the comment thread. You can also reply to a specific comment to keep the discussion in order.',
      'Activity records changes: who changed the status, when the date changed and who attached a file. Check it before asking “who changed this?”.'
    ],
    deeper: { title: 'A good comment in two sentences', body: ['Say what you noticed, then what you need and from whom: “In table 3 the complaints figure is 12 higher than the source. @Salim is the approved figure 214 or 202?”'] },
    demo: { steps: [
      { cap: 'Open the Comments tab in the task. Here the discussion stays linked to the work.' },
      { cap: 'We write the question and mention Salim with @ so he gets a direct notification.' },
      { cap: 'We send the comment, and it appears in the thread with the mention.' },
      { cap: 'In Activity we see the change log: who created the task, who attached the file and who changed the status.' }
    ] },
    exercise: { prompt: 'Which comment is clearest and quickest to get an answer?',
      options: [
        { t: '“In table 3 the complaints figure is 214 but the source says 202. @Salim which should we use before Thursday?”', fb: 'Excellent: it states the place, the problem, who should reply and the deadline.' },
        { t: '“There is a problem with the figures”', fb: 'It does not say which figures or who should reply.' },
        { t: '“@everyone check the report”', fb: 'Mentioning everyone without a specific request means nobody owns it.' },
        { t: 'Email Salim without commenting in the task', fb: 'Email separates the discussion from the work, and nobody who opens the task later will see it.' }
      ] },
    mistake: { wrong: 'Discussing the task by email, so anyone who joins later loses the context.', right: 'Discuss inside the task, and mention the person concerned by name.' },
    summary: ['Discuss inside the task so the whole story stays together.', '@ to notify the person concerned.', 'Activity answers “who changed what, and when”.']
  },
  'l3-5': {
    title: 'Recurring tasks, templates and bulk actions',
    objective: 'Save time on repeated work: make a weekly task recur, save a template, and edit several tasks at once.',
    scenario: 'The weekly report repeats every Sunday with the same steps, and in this morning’s meeting you agreed to start two tasks together.',
    explain: [
      '<strong>Recurring tasks:</strong> set a repeat (daily, weekly, monthly…) and the next task is created automatically. You can set a repeat on a new or existing task, as long as its status is in the Not Started, Active or Done group.',
      'Note two documented details: tracked time is not carried over to the new task, and if you do not set a time for the repeat, the task is created at 11 pm in the time zone of the user who set it up.',
      '<strong>Templates:</strong> save a task with a fixed Checklist and fields as a template (Save as template), then apply it to new tasks instead of writing the steps each time.',
      '<strong>Bulk actions:</strong> select several tasks in a view, then change the status or assignee for all of them at once.'
    ],
    deeper: { title: 'Recurring task or template?', body: ['Recurring is for the same work on a fixed schedule (the report every Sunday). A template is for the same structure across different work (every meeting needs an agenda, minutes and a send-out).'] },
    notes: [{ text: 'The options in the bulk actions bar differ by view and ClickUp version. The concept is the same: select several tasks, then apply one change.' }],
    demo: { steps: [
      { cap: 'In the morning meeting we agreed to start two tasks. We select them together instead of editing each one.' },
      { cap: 'The bulk actions bar appears. We choose Status.' },
      { cap: 'We choose IN PROGRESS, and both tasks move to their new group together.' },
      { cap: 'One change instead of two. With bigger Lists the difference becomes large.' }
    ] },
    exercise: { prompt: 'Set up the repeat for the “Weekly report” task that is delivered every Sunday, and answer how repeats behave as documented in the Help Center.',
      slots: {
        freq: { label: 'Repeat', options: ['Daily', 'Weekly', 'Monthly'], answer: 'Weekly' },
        day: { label: 'Day', options: ['Sunday', 'Monday', 'Thursday'], answer: 'Sunday' },
        time: { label: 'Time tracked on the previous task', options: ['Is carried over to the new task', 'Is not carried over to the new task'], answer: 'Is not carried over to the new task' },
        when: { label: 'If you do not set a time for the repeat', options: ['11 pm in the time zone of whoever set it up', 'Midnight in each member’s time zone', 'Always as soon as the task is closed'], answer: '11 pm in the time zone of whoever set it up' }
      }, success: 'Correct setup. Remember that tracked time starts from zero on each repeat.' },
    mistake: { wrong: 'Copying the task by hand every week and sometimes forgetting.', right: 'Turn on the repeat once, and check the time set for creating the task.' },
    summary: ['Recurring is for the same work on a fixed schedule.', 'A template is for the same structure across different work.', 'Bulk actions save repeated editing.']
  },

  /* ---------------- Module 4 ---------------- */
  'l4-1': {
    title: 'List and Board views',
    objective: 'Know that views show the same tasks, and choose between List and Board depending on the question you want answered.',
    scenario: 'In the morning meeting the team wants to see each task’s stage, and afterwards you need to review the details and dates.',
    explain: [
      'A View is a window onto the same data. Changing a status in Board shows up in List immediately, because both show the same tasks.',
      '<strong>List:</strong> good for detail: columns, dates, assignees and sorting. Excellent for reviewing and quick editing.',
      '<strong>Board:</strong> good for workflow: each column is a status, and moving a card changes its status. Excellent for short follow-up meetings.'
    ],
    deeper: { title: 'Are tasks deleted when I change the view?', body: ['No. Changing the view or adding a new view does not change the tasks. Filters inside a view only hide what does not match, temporarily.'] },
    demo: { steps: [
      { cap: 'This is the “Weekly reports” List in List view: each task is a row with its details.' },
      { cap: 'We switch to Board: the same tasks, arranged in columns by status.' },
      { cap: 'Board quickly answers the question: where is each piece of work? That is why it suits the morning meeting.' },
      { cap: 'We go back to List when we need details and dates. Nothing in the data has changed.' }
    ] },
    exercise: { prompt: 'Update the board to match what was said in the morning meeting. Drag the cards, or use the “Move to” menu on each card.',
      cards: {
        a: { title: 'Collect call centre figures', note: 'Maryam has started working on it' },
        b: { title: 'Send the week 37 report', note: 'The manager approved it and it was sent' },
        c: { title: 'Update the KPI dashboard', note: 'The draft is finished and waiting for review' },
        d: { title: 'Review last week’s notes', note: 'Nobody has started' }
      } },
    mistake: { wrong: 'Making a copy of the tasks for each view, so the data conflicts.', right: 'Add a new view of the same tasks. One set of data, different ways of seeing it.' },
    summary: ['Views show the same tasks.', 'List for details, Board for stages of work.', 'Moving a card in Board changes its status.']
  },
  'l4-2': {
    title: 'Calendar, Table, Gantt, Timeline and Workload',
    objective: 'Choose the view that answers your question: dates, data, dependencies or workload.',
    scenario: 'The team lead asks four questions: What is due this week? What are the request details by department? What slips if data collection slips? And who has more work than capacity?',
    explain: [
      '<strong>Calendar:</strong> tasks on a calendar by their dates. Answers “what is due, and when?”.',
      '<strong>Table:</strong> a grid with a column for each field, like a spreadsheet. For comparing and quickly editing Custom Fields.',
      '<strong>Gantt:</strong> time bars with the dependencies between tasks. For planning and seeing the effect of a delay.',
      '<strong>Timeline:</strong> tasks on a timeline, which can be grouped by assignee or other fields. For seeing how work is spread over time.',
      '<strong>Workload:</strong> compares each person’s work with their capacity over a period. Answers “who is overloaded?”.'
    ],
    deeper: { title: 'Ask first, then choose the view', body: ['There is no single “best” view. Start with the question you want answered, then choose the view that answers it with the least effort.'] },
    notes: [{ text: 'The availability of Workload, Timeline and some Gantt features (such as baselines) depends on your subscription plan, and some actions in them may count toward usage limits.' }],
    demo: { steps: [
      { cap: 'To add a view, press + View and choose the type.' },
      { cap: 'Calendar: tasks on their days. We see straight away what is due this week.' },
      { cap: 'Table: columns for fields such as the requesting department and time estimate. Ideal for comparing.' },
      { cap: 'Gantt: time bars that show the order of work and its dependencies.' },
      { cap: 'Workload: each person’s work against their capacity. Maryam is over her capacity this week.' }
    ] },
    exercise: { prompt: 'Match each question with the view that answers it fastest.',
      choices: ['Calendar', 'Table', 'Gantt', 'Workload', 'Board'],
      pairs: [['Which tasks are due this week?', 'Calendar'], ['Compare the requesting department and time estimate for every request', 'Table'], ['Which tasks are affected if data collection is delayed?', 'Gantt'], ['Does any colleague have more work than capacity?', 'Workload'], ['What stage is each task at right now?', 'Board']] },
    mistake: { wrong: 'Using List for everything, then pulling the answers together by hand.', right: 'Add the view that answers the question directly, and give it a clear name.' },
    summary: ['Calendar for dates.', 'Table for fields and comparison.', 'Gantt for dependencies, Timeline for spread over time.', 'Workload for capacity.']
  },
  'l4-3': {
    title: 'Filtering, sorting and grouping',
    objective: 'Build a view that answers a specific question by using Filter, Sort and Group together.',
    scenario: 'Before your meeting with Maryam you want to see her tasks only, sorted with the nearest due date first.',
    explain: [
      '<strong>Filter:</strong> shows what matches your conditions and temporarily hides the rest, such as “Assignee is Maryam” or “Priority is Urgent”. It deletes nothing.',
      '<strong>Sort:</strong> orders tasks, for example by due date or priority.',
      '<strong>Group:</strong> gathers tasks into groups, for example by status, assignee or priority.',
      'Combine all three to answer one question: “Maryam’s tasks (Filter), grouped by status (Group), nearest due date first (Sort)”.'
    ],
    deeper: { title: 'Watch out for active filters', body: ['If tasks seem to have “disappeared”, there is usually an active filter. Look for the filter badge at the top of the view and clear it.'] },
    demo: { steps: [
      { cap: 'We start with a filter: press Filter and choose Assignee is Maryam.' },
      { cap: 'Only Maryam’s tasks remain, and the active filter badge appears. Nothing was deleted.' },
      { cap: 'Then we sort by due date, so the nearest appears first.' },
      { cap: 'You can also change the grouping, for example by assignee or priority, depending on the question.' }
    ] },
    exercise: { prompt: 'Build a view that answers: “What are Maryam’s urgent tasks, nearest due date first?” The preview updates with every choice.',
      slots: {
        assignee: { options: ['All', 'Maryam', 'Salim', 'Noura'], answer: 'Maryam' },
        priority: { options: ['All', 'Urgent', 'High', 'Normal'] },
        sort: { options: ['No sorting', 'Due date', 'Task name'] }
      }, success: 'The view answers the question exactly: two urgent tasks for Maryam, nearest first.' },
    mistake: { wrong: 'Applying a filter and then forgetting it, so you think tasks have disappeared.', right: 'Check the active filter badge and clear it when you are done.' },
    summary: ['Filter hides what does not match, without deleting.', 'Sort orders, and Group gathers.', 'Combine them to answer a specific question.']
  }
});

/* Demo action strings (typed text and replaced labels) */
Object.assign(DEMO_EN, {
  'التقرير': 'report',
  'مراجعة التقرير الأسبوعي لخدمة العملاء، أسبوع 38': 'Review the customer service weekly report, week 38',
  'المطلوب: التحقق من أرقام الشكاوى والطلبات ومقارنتها بالأسبوع 37. يُعدّ منجزاً عند إرسال الملاحظات للمديرة.': 'Required: check the complaints and requests figures and compare them with week 37. Done when the notes are sent to the manager.',
  'الأحد ← الخميس': 'Sunday → Thursday',
  'إرسال للمديرة للمراجعة': 'Send to the manager for review',
  'تدقيق أرقام المالية': 'Check the Finance figures',
  'رقم الشكاوى في الجدول 3 أعلى من المصدر. @سالم أيهما المعتمد؟': 'The complaints figure in table 3 is higher than the source. @Salim which one is approved?',
  'رقم الشكاوى في الجدول 3 أعلى من المصدر. <span class="mx-mention">@سالم</span> أيهما المعتمد؟': 'The complaints figure in table 3 is higher than the source. <span class="mx-mention">@Salim</span> which one is approved?'
});

/* Knowledge checks, modules 1-4 (keyed by shared question ID) */
Object.assign(EN_QUESTIONS, {
  'l1-1-c1': { q: 'What makes something suitable to be a task in ClickUp?', options: ['It is actionable work with an assignee and a date', 'It is information everyone needs', 'It is a message that arrived by email', 'It is a large file'], why: 'A task is an actionable unit of work. Reference information belongs in documents, and messages become tasks only if they require work.' },
  'l1-1-c2': { q: 'Where is the best place for the “Report preparation steps” guide the team uses every week?', options: ['In a new task every week', 'In a Doc linked to the reports List', 'In a comment on an old task', 'In a Tag'], why: 'Permanent reference content belongs in a Doc, which can be linked to the tasks that need it.' },
  'l1-2-c1': { q: 'Where can you quickly find the tasks assigned to you, including the overdue ones?', options: ['In Home', 'In the Workspace settings', 'In the tag list', 'In each task’s activity log'], why: 'Home gathers your tasks and notifications in one place.' },
  'l1-2-c2': { q: 'What is the right order to reach a List in the Sidebar?', options: ['List then Space', 'Space then List', 'Task then Space', 'Inbox then List'], why: 'Lists live inside Spaces (and may sit inside an optional Folder).' },
  'l1-3-c1': { q: 'Which tab suits a notification you want to come back to later?', options: ['Cleared', 'Later', 'Other', 'Primary'], why: 'Later is for things you save to come back to.' },
  'l1-3-c2': { q: 'You searched for a task and got many results. What is the best next step?', options: ['Start the search again with a general word', 'Narrow the results by type or assignee', 'Open every result one by one', 'Create a new task with the same name'], why: 'Narrowing the results is faster and more accurate than opening them all.' },
  'l2-1-c1': { q: 'Which of these levels is optional?', options: ['List', 'Folder', 'Workspace', 'Space'], why: 'The Folder is optional. Lists can sit directly inside a Space.' },
  'l2-1-c2': { q: 'Can a task exist outside any List?', options: ['Yes, directly in a Space', 'Yes, in the Workspace', 'No, every task lives inside a List', 'Only if it is a subtask'], why: 'Lists hold all the tasks in a Workspace; no task exists outside one.' },
  'l2-1-c3': { q: 'Where are subtasks created?', options: ['Inside a task', 'Directly inside a Folder', 'Directly inside a Space', 'Inside a Dashboard'], why: 'A Subtask splits a task, so it is created inside one.' },
  'l2-2-c1': { q: 'One initiative with 15 tasks. What is the simplest suitable structure?', options: ['A new Space', 'A Folder with a Subfolder', 'A List inside the team’s Space', 'A new Workspace'], why: 'One List is enough for one topic; there is no need for extra levels.' },
  'l2-2-c2': { q: 'What happens when you create a Subfolder?', options: ['A List is created inside it automatically', 'Old Lists are deleted', 'It becomes a Space', 'Tasks can never be added to it'], why: 'According to the Help Center, creating a Subfolder automatically creates a List inside it.' },
  'l3-1-c1': { q: 'Which task name is clearest?', options: ['The report', 'Very important', 'Review the customer service weekly report, week 38', 'Follow-up'], why: 'It starts with a verb and names the thing and the period.' },
  'l3-1-c2': { q: 'What does a description usually not need?', options: ['What exactly is required', 'The done-when standard', 'A link to the reference file', 'A copy of the whole email thread'], why: 'A short description is clearer. Attach references rather than pasting whole conversations.' },
  'l3-2-c1': { q: 'An open task is past its due date. How is it classed?', options: ['Complete', 'Overdue', 'Archived', 'Private'], why: 'A task that is not closed after its due date is overdue.' },
  'l3-2-c2': { q: 'What are the default priority levels in ClickUp?', options: ['1 to 10', 'Urgent, High, Normal and Low', 'Red, yellow and green', 'Critical and Major only'], why: 'Four levels: Urgent, High, Normal and Low.' },
  'l3-2-c3': { q: 'Which status group does Complete belong to by default?', options: ['Active', 'Done', 'Closed', 'Not Started'], why: 'Complete is the default Closed status.' },
  'l3-3-c1': { q: 'Part of the work will be taken on by a colleague with a different date. What fits best?', options: ['Checklist', 'Subtask', 'Tag', 'Comment'], why: 'A Subtask has its own assignee, date and status.' },
  'l3-3-c2': { q: 'What is the main use of Tags?', options: ['Setting the assignee', 'Classifying and filtering tasks across Lists', 'Calculating time', 'Locking the task'], why: 'Tags classify tasks, and you can filter by them.' },
  'l3-4-c1': { q: 'What happens when you type @ and a colleague’s name in a comment?', options: ['They become the task’s assignee', 'They get a notification about the comment', 'The task is automatically shared with them with edit rights', 'Nothing'], why: 'A mention notifies the person and brings them into the thread. It does not change the assignee.' },
  'l3-4-c2': { q: 'Where can you find out who changed a task’s date, and when?', options: ['In Activity', 'In Tags', 'In the Checklist', 'Only in Inbox'], why: 'The activity log records changes to the task.' },
  'l3-5-c1': { q: 'What happens to tracked time when a task recurs?', options: ['It is carried over in full', 'It is not carried over to the new task', 'It is doubled', 'It is deleted from the original task'], why: 'According to the Help Center, tracked time is not carried over to new tasks when a task recurs.' },
  'l3-5-c2': { q: 'What suits different meetings that always need the same preparation steps?', options: ['A recurring task', 'A task template', 'A Tag', 'A Dashboard'], why: 'A template reuses the same structure for different work.' },
  'l4-1-c1': { q: 'You changed a task’s status in Board. What happens in List?', options: ['Nothing until I update it by hand', 'The new status appears because it is the same task', 'The task is copied', 'It is removed from List'], why: 'Views show the same tasks.' },
  'l4-1-c2': { q: 'Which view best suits a quick follow-up meeting about stages of work?', options: ['Board', 'Table', 'Gantt', 'Doc'], why: 'Board arranges tasks in columns by status.' },
  'l4-2-c1': { q: 'Which view shows dependencies between tasks as arrows on a timeline?', options: ['Calendar', 'Gantt', 'Board', 'Table'], why: 'Gantt shows time bars and dependencies.' },
  'l4-2-c2': { q: 'You want to know who has more work than capacity this week. Which view fits?', options: ['Workload', 'List', 'Doc', 'Form'], why: 'Workload compares assigned work with capacity.' },
  'l4-3-c1': { q: 'What does a Filter do to tasks that do not match?', options: ['Deletes them', 'Hides them from the view temporarily', 'Archives them', 'Moves them to another List'], why: 'A filter only hides what does not match, without changing the data.' },
  'l4-3-c2': { q: 'You want tasks in groups by assignee. What do you use?', options: ['Sort', 'Group', 'Filter', 'Tag'], why: 'Group gathers tasks by a field such as the assignee.' }
});
