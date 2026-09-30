/* English overlay: lessons in modules 5-8 */
Object.assign(EN_LESSONS, {
  /* ---------------- Module 5 ---------------- */
  'l5-1': {
    title: 'Custom Fields and consistent data',
    objective: 'Choose the right Custom Field type for each piece of information, and keep data consistent so it can be filtered and summarized.',
    scenario: 'The “Internal requests” List receives requests from different departments, and each employee writes the department name their own way, so filters and reports fail.',
    explain: [
      '<strong>Standard fields</strong> exist on every task: status, assignee, dates and priority. <strong>Custom Fields</strong> are ones you add to record information specific to your work, such as “Requesting department” or “Request number”.',
      'Common types include Dropdown and Labels for choosing from a fixed list, Number and Money for figures and amounts, Date for dates, Checkbox for yes or no, Rating for scores, and Text and Text area for text, as well as Email, Phone, Website, Location, Progress (Manual) and Formula.',
      'The consistency rule: if the answers come from a fixed set, use a Dropdown, not Text. “Customer Service”, “Customer Servise” and “CS” are three different values in a report.'
    ],
    deeper: { title: 'Where is a field created?', body: ['A field is added at a location level (Space, Folder or List) and appears on its tasks. Put shared fields at a higher level so they are not duplicated under different names.'] },
    notes: [{ text: 'Creating and editing fields depends on your permissions in the location. Some organizations limit this to admins to keep data consistent.' }],
    demo: { steps: [
      { cap: 'In Table view we can see the standard columns. We add a field for the requesting department.' },
      { cap: 'Departments are a fixed set, so we choose Dropdown, not Text.' },
      { cap: 'We name the field and define the options once, so everyone chooses from the same list.' },
      { cap: 'Now every request carries a consistent value, and requests can be filtered or counted by department accurately.' }
    ] },
    exercise: { prompt: 'Choose the best field type for each piece of information.',
      pairs: [['Requesting department (a fixed list of departments)', 'Dropdown'], ['Cost of the request in Omani rials', 'Money'], ['Has the line manager approved?', 'Checkbox'], ['Number of pages to review', 'Number'], ['Requester satisfaction score from 1 to 5', 'Rating']] },
    mistake: { wrong: 'A Text field for the department, so the same department gets spelled many ways and reports fail.', right: 'A Dropdown with options defined in advance and reviewed regularly.' },
    summary: ['Custom Fields hold information specific to your work.', 'Choose the type to suit the data.', 'A Dropdown for fixed values protects report consistency.']
  },
  'l5-2': {
    title: 'Formula fields with documented examples',
    objective: 'Create a Formula field that counts the days between two dates, and know the limits of what formulas support.',
    scenario: 'The team lead wants to know how many days each internal request runs from its start date to its due date, without working it out by hand.',
    explain: [
      'A <strong>Formula</strong> field is a Custom Field that calculates its value from other fields. Documented uses include counting the days between the start and due dates, and the difference between two number fields.',
      'You refer to any field with <code>field("Field name")</code>. The function <code>DAYS(end date, start date)</code> returns the number of days between them, so: <code>DAYS(field("Due date"), field("Start date"))</code>.',
      'The function <code>TODAY()</code> takes no inputs and returns today’s date. A documented example for a task’s age: <code>DAYS(TODAY(), field("Date created"))</code>.',
      'There are math functions, date and time functions, logical functions and text functions. Note: Formula fields cannot use text Custom Fields, and every bracket must be closed or an error message appears.'
    ],
    deeper: { title: 'The order of inputs in DAYS matters', body: ['<code>DAYS(field("Due date"), field("Start date"))</code> gives a positive number when the due date is after the start date. Reversing the order gives a negative number. Read it as: “from start to end = end first”.'] },
    notes: [
      { text: 'The name inside field("...") must exactly match the field name as it appears in your Workspace. The examples here come from the Help Center, and your field name may differ.' },
      { text: 'Formula fields may be subject to usage limits depending on your plan. See the Intro to Formula Fields page.' }
    ],
    demo: { steps: [
      { cap: 'We add a new Formula field to the internal requests List.' },
      { cap: 'We write the formula: DAYS counts the days between the due date and the start date. End first.' },
      { cap: 'We create the field, and a new column appears that calculates the duration of every request automatically.' },
      { cap: 'If the due date changes, the result updates on its own. No manual calculation and no copying mistakes.' }
    ] },
    exercise: { prompt: 'Build a formula that calculates how many days each request runs from its start date to its due date. The table calculates the result as you go.',
      slots: {
        fn: { label: 'Function' },
        a: { label: 'First input' },
        b: { label: 'Second input' }
      }, success: 'Correct formula: every result is positive and matches the real duration.' },
    mistake: { wrong: 'Reversing the inputs: DAYS(field("Start date"), field("Due date")), which gives negative numbers.', right: 'End first, then start: DAYS(field("Due date"), field("Start date")).' },
    summary: ['field("...") refers to a field.', 'DAYS(end, start) for the number of days.', 'TODAY() for today’s date.', 'Text fields cannot be used in formulas.']
  },

  /* ---------------- Module 6 ---------------- */
  'l6-1': {
    title: 'Assigned comments and linking discussion to work',
    objective: 'Turn a small request inside a comment into an assigned action that is followed up until resolved, and tell it apart from a mention and from a new task.',
    scenario: 'While reviewing the report you need Salim to correct one table. It does not justify a new task, but you want to make sure it is not forgotten.',
    explain: [
      'When you <strong>assign a comment</strong>, it becomes an action required from that person and appears in their list of assigned items. Once done, they press <strong>Resolve</strong>, their name appears next to the resolved mark, and the person who assigned it is notified.',
      'The difference between the tools: an @mention asks for attention or an opinion. An assigned comment asks for a small action within the task. A task (or subtask) is for independent work with a date and follow-up.',
      'Always link discussion to work: discuss inside the task, create a task from a Chat message when needed, and link a document to the task that uses it.'
    ],
    deeper: { title: 'Where do I see what is assigned to me?', body: ['Comments and messages assigned to you appear in a dedicated place, and you can resolve them from there directly. See the article View assigned messages and comments.'] },
    demo: { steps: [
      { cap: 'In the Comments tab we write the specific request.' },
      { cap: 'Instead of sending it straight away, we assign the comment to Salim.' },
      { cap: 'We send it, and it appears as a comment assigned to Salim, waiting to be resolved.' },
      { cap: 'After making the correction, Salim presses Resolve: who resolved it is recorded, and you get a notification.' }
    ] },
    exercise: { prompt: 'Choose the best tool for each situation.',
      choices: ['An @mention in a comment', 'An assigned comment', 'A new task or subtask'],
      pairs: [['You want a colleague’s opinion on the wording of a paragraph', 'An @mention in a comment'], ['You need a colleague to correct one figure inside this task', 'An assigned comment'], ['Independent work that takes days and has a deadline', 'A new task or subtask']] },
    mistake: { wrong: 'Writing “Salim, fix the table” in a normal comment with no mention or assignment, so nothing reaches him.', right: 'Assign the comment to him, so it becomes a required action followed up until Resolve.' },
    summary: ['@ for attention, an assigned comment for an action, a task for independent work.', 'Resolve records the resolution and notifies whoever assigned it.', 'Link discussion and documents to the work itself.']
  },
  'l6-2': {
    title: 'Docs, Whiteboards, Chat and Clips',
    objective: 'Choose the right collaboration space, and link what comes out of it to tasks so discussion does not stay without action.',
    scenario: 'Your team is writing the weekly report guide, discussing in the chat channel and running an ideas session on improving internal requests.',
    explain: [
      '<strong>Docs:</strong> documents for reference content, such as guides and minutes. You can link tasks to them or insert tasks inside them with Slash Commands.',
      '<strong>Chat:</strong> channels and direct messages for quick communication. You can create a task from a message or link it to an existing task, so a request made in chat is not lost.',
      '<strong>Whiteboards:</strong> visual boards for brainstorming and organizing ideas. You can add tasks to them and turn ideas into work.',
      '<strong>Clips:</strong> short recordings (including voice clips in comments) to explain something instead of writing a long message.'
    ],
    deeper: { title: 'The linking rule', body: ['Every discussion that ends in a work decision should become a task with an assignee and a date, linked to where the discussion happened. That way the reason and the action stay together.'] },
    notes: [
      { text: 'The availability of Chat, Clips and some Docs and Whiteboards features depends on your plan and Workspace settings.' },
      { text: 'AI features that summarize conversations (ClickUp Brain) depend on your plan or enabled add-ons, and may not be available in your organization.' }
    ],
    demo: { steps: [
      { cap: 'In the Doc “Weekly report preparation guide”, we type / on a new line to open the insert commands.' },
      { cap: 'We choose Task to insert the review task into the guide, so readers can see its status and assignee.' },
      { cap: 'In Chat, Khalid asked for a table to be corrected. We turn the message into a task so it is not lost.' },
      { cap: 'On the Whiteboard, the agreed idea becomes a task that can be followed up.' }
    ] },
    exercise: { prompt: 'Match each need with the best collaboration space.',
      choices: ['Doc', 'Chat', 'Whiteboard', 'Clip', 'Comment on the task'],
      pairs: [['A guide or minutes the team refers back to', 'Doc'], ['A quick discussion in the team channel', 'Chat'], ['Brainstorming and organizing ideas visually', 'Whiteboard'], ['A short spoken explanation instead of a long message', 'Clip'], ['A question about a specific task', 'Comment on the task']] },
    mistake: { wrong: 'A decision is made in Chat and never becomes a task, so everyone forgets it.', right: 'Turn the decision into a task from the message itself, with an assignee and a date.' },
    summary: ['Doc for reference, Chat for quick communication, Whiteboard for ideas, Clip for short explanations.', 'Turn decisions into tasks linked to where they came from.']
  },

  /* ---------------- Module 7 ---------------- */
  'l7-1': {
    title: 'Estimating and tracking time',
    objective: 'Set a realistic time estimate for a task, record the actual time, and compare the two to improve your planning.',
    scenario: 'The team lead is planning a busy week and wants to know how many hours each piece of work needs, and where the team’s hours actually go.',
    explain: [
      '<strong>Time Estimate:</strong> the time a task is expected to take. It is turned on through the Time Estimates ClickApp, which is available on all plans. For tasks with several assignees, each person can have a different estimate.',
      '<strong>Time Tracking:</strong> recording the actual time, either by running a timer while you work or by entering it manually.',
      'When a task has an estimate, views show a bar comparing tracked time with the estimate. A repeated gap between them is valuable information: either the estimates are optimistic, or the work keeps growing.'
    ],
    deeper: { title: 'Better estimates', body: ['Split large work into smaller tasks and estimate each one. Look at the tracked time on similar past tasks. And add a margin for reviews.'] },
    notes: [{ text: 'Turning on the time estimate or time tracking ClickApp may require a Workspace admin.' }],
    demo: { steps: [
      { cap: 'We set a time estimate for the task: 5 hours.' },
      { cap: 'When we start work we run the timer, and the actual time is recorded.' },
      { cap: 'When the session ends we stop the timer. One hour and 20 minutes has been recorded on the task.' },
      { cap: 'Comparing the estimate with the tracked time helps plan next week realistically.' }
    ] },
    exercise: { prompt: 'For the last four weekly reports the estimate was 5 hours, and the tracked time was 7, then 7.5, then 6.5, then 7 hours. What is the most sensible conclusion?',
      options: [
        { t: 'The estimate is consistently optimistic; it is best to raise it to around 7 hours or split the work', fb: 'Correct. The actual average is 7 hours and the gap is steady, so the estimate needs adjusting.' },
        { t: 'The employee is slow and should be pushed', fb: 'The numbers alone do not show that. A steady gap points first to an unrealistic estimate.' },
        { t: 'We stop tracking time', fb: 'Tracking is what revealed the gap; stopping it hides the problem.' },
        { t: 'We cut the estimate to 4 hours as motivation', fb: 'That widens the gap and makes planning less realistic.' }
      ] },
    mistake: { wrong: 'Setting estimates and never comparing them with actual time.', right: 'Review the gap between estimated and tracked time regularly, and adjust your estimates.' },
    summary: ['Estimates are for planning; tracking is for reality.', 'A timer or manual entry.', 'A repeated gap means adjust the estimate.']
  },
  'l7-2': {
    title: 'Dependencies, relationships and overdue work',
    objective: 'Link tasks with Blocking and Waiting on relationships, predict the effect of a delay on what follows, and tell a normal relationship from a dependency.',
    scenario: 'The monthly report goes through stages: collecting data, then analysis, then approval, then publishing. Data collection is two days late.',
    explain: [
      '<strong>Dependency Relationships</strong> come in two kinds: a task that is <strong>Blocking</strong> another, so the other cannot be completed first, and a task that is <strong>Waiting on</strong> another task that must be completed first. They are available on all plans.',
      'You can create them from the task, from views, or with Slash Commands in the description or a comment: <code>/blocking</code> and <code>/waiting</code>, and <code>/link to</code> for a normal relationship.',
      'In Gantt, dependencies appear as arrows. With dependency rescheduling turned on, when the blocking task’s dates change, the waiting tasks’ dates adjust automatically. With the Dependency Warning ClickApp, a warning appears if you try to close a task that is still waiting on another.',
      'Normal <strong>Relationships</strong> link items for reference without forcing an order of work. <strong>Overdue work</strong> is any task that is not closed and is past its due date.'
    ],
    deeper: { title: 'Do not overuse dependencies', body: ['Only link what genuinely cannot start or finish before something else. Too many dependencies make every small change shake the whole schedule.'] },
    notes: [{ text: 'Dependency Warning and dependency rescheduling are settings that a Workspace admin may turn on or off.' }],
    demo: { steps: [
      { cap: 'The monthly report plan in Gantt: four stages in a row. The red line is today.' },
      { cap: 'We add the dependencies: each stage is Waiting on the one before, and the arrows appear.' },
      { cap: '“Collect data” is two days late. With dependency rescheduling, the following stages shift with it.' },
      { cap: '“Approve figures” is past its due date and not closed, so it is overdue. The warning stops a task being closed before what it is waiting on.' }
    ] },
    exercise: { prompt: 'In the plan: analysis is Waiting on data collection, approval is Waiting on analysis, and publishing is Waiting on approval. “Update the guide” is linked to the report by a normal relationship only. If data collection is two days late, which tasks have their dates affected?',
      options: [
        { t: 'Analysis, approval and publishing', fb: 'Correct. A chain of Waiting on passes the delay to everything after it. A normal relationship does not force any order.' },
        { t: 'Analysis only', fb: 'Approval waits on analysis and publishing waits on approval, so the delay runs down the whole chain.' },
        { t: 'Every task, including updating the guide', fb: 'Updating the guide is linked by a normal Relationship, not a dependency, so no order is forced on it.' },
        { t: 'None, dependencies are only for display', fb: 'Dependencies express a real order of work, and with rescheduling the dates move.' }
      ] },
    mistake: { wrong: 'Using a normal Relationship between stages that must follow each other, so the effect of a delay does not show.', right: 'Use Waiting on or Blocking when something cannot start or close before another task.' },
    summary: ['Blocking and Waiting on are the two kinds of dependency.', 'A delay passes down the chain of dependencies.', 'A Relationship links without forcing an order.', 'Overdue = not closed after the due date.']
  },

  /* ---------------- Module 8 ---------------- */
  'l8-1': {
    title: 'Dashboard cards, data sources and filters',
    objective: 'Add a card to a Dashboard and set its data source and filters, so each chart answers a specific question.',
    scenario: 'The team lead wants one page to follow the weekly reports: the spread of statuses, what is overdue, open tasks per person and weekly completion.',
    explain: [
      'A <strong>Dashboard</strong> is a page that turns Workspace data, such as task information, into a visual display made of Cards.',
      'Each card has a <strong>data source (Location)</strong>: one or more locations it takes tasks from. Card types include Bar Chart, Pie Chart, Battery Chart, Custom cards, Sprint cards and, depending on the plan, AI cards.',
      'There are two levels of filtering: <strong>Dashboard Filters</strong> apply to every supported card on the Dashboard, and <strong>Card filters</strong> apply to one card. You can combine several conditions with mixed filters.'
    ],
    deeper: { title: 'One card, one question', body: ['Before adding a card, write the question it answers, such as “How many open tasks does each person have in the requests List?”. The question decides the type, source, grouping and filter.'] },
    notes: [{ text: 'Dashboards are subject to limits depending on your plan, and Dashboard views count toward Dashboard usage. AI cards require ClickUp Brain.' }],
    demo: { steps: [
      { cap: 'This is the “Report follow-up” Dashboard. We add a card for the weekly completion rate.' },
      { cap: 'We choose the card type that suits a trend over time.' },
      { cap: 'The most important setting: the data source. We choose the “Weekly reports” List only.' },
      { cap: 'Then a Dashboard-level filter: every supported card updates to show the same location.' }
    ] },
    exercise: { prompt: 'Set up a card that answers: “How many open tasks does each person have in the internal requests List?”',
      slots: {
        type: { label: 'Card type' },
        loc: { label: 'Data source (Location)', options: ['Internal requests', 'Whole Workspace', 'Weekly reports'], answer: 'Internal requests' },
        group: { label: 'Group by' },
        filter: { label: 'Card filter', options: ['Open tasks only', 'All tasks', 'Closed only'], answer: 'Open tasks only' }
      }, success: 'Correct setup: one bar per person, from the requests List only, for open tasks.' },
    mistake: { wrong: 'A card whose source is “Whole Workspace” for a question about one List, so the numbers get mixed.', right: 'Set the data source precisely, and check both the Dashboard and card filters.' },
    summary: ['Dashboard = visual cards built from work data.', 'Each card has a data source and filters.', 'The Dashboard filter applies to all; a card filter to that card only.']
  },
  'l8-2': {
    title: 'Reading the numbers: interpret before you conclude',
    objective: 'Interpret Dashboard cards correctly: check the scope, compare rates rather than counts alone, and read the trend over time.',
    scenario: 'In the follow-up meeting someone said: “The requests team only has 4 overdue tasks, so they are doing better.” You want to check before agreeing.',
    explain: [
      '<strong>Check the scope first:</strong> What is the data source? Which filters are active? Two numbers from different scopes cannot be compared.',
      '<strong>Compare rates, not counts:</strong> 4 overdue out of 40 open (10%) is better than 3 overdue out of 6 (50%), even though the second number is smaller.',
      '<strong>Read the trend:</strong> one week’s number is a snapshot. Weekly completion across several weeks shows whether the team is improving or slipping.',
      '<strong>Look for the reason before judging:</strong> a heavy workload for one person may mean an unbalanced distribution, not weak performance. Open the tasks behind the number.'
    ],
    deeper: { title: 'Practise on live data', body: ['In this platform’s Dashboard Studio, the charts read the Practice Lab tasks themselves. Change a task in the lab and come back to see the effect.'] },
    notes: [{ text: 'This lesson is general guidance on reading data and does not depend on a specific ClickUp feature.' }],
    demo: { steps: [
      { cap: 'Before any conclusion: what is this Dashboard’s scope? There is no filter, so it covers every location.' },
      { cap: 'The number 5 overdue is not enough on its own. How many tasks are open in total? From the first card: 12 open, so about 42%.' },
      { cap: 'The assignee card shows Maryam has 5 open tasks against 2 for the others. Ask about distribution before asking about performance.' },
      { cap: 'Narrowing the scope to one List changes every number. So always state the scope with the number.' }
    ] },
    exercise: { prompt: 'Reports team: 4 overdue tasks out of 40 open tasks. Requests team: 3 overdue tasks out of 6 open tasks. Which team is worse off for delays?',
      options: [
        { t: 'The requests team: an overdue rate of 50% against 10%', fb: 'Correct. The rate takes the amount of work into account; the count alone is misleading.' },
        { t: 'The reports team: it has more overdue tasks', fb: 'The count is higher because the workload is bigger. 4 out of 40 is only 10%.' },
        { t: 'About the same', fb: '10% and 50% are very different.' },
        { t: 'They can never be compared', fb: 'You can compare them with rates, as long as the scope and definition are the same.' }
      ] },
    mistake: { wrong: 'Comparing overdue counts between teams of different sizes, or between Dashboards with different filters.', right: 'Compare rates within the same scope, and open the tasks behind the number before judging.' },
    summary: ['Check the scope and filters first.', 'Compare rates, not counts alone.', 'Read the trend over time.', 'Open the tasks behind the number before judging.']
  }
});

Object.assign(DEMO_EN, {
  'الإدارة الطالبة': 'Requesting department',
  '<span class="mx-tag" style="background:#e6f4ec;color:#135f3b">خدمة العملاء</span>': '<span class="mx-tag" style="background:#e6f4ec;color:#135f3b">Customer Service</span>',
  '<span class="mx-tag" style="background:#fdf2e1;color:#9a5a00">الموارد البشرية</span>': '<span class="mx-tag" style="background:#fdf2e1;color:#9a5a00">Human Resources</span>',
  '<span class="mx-tag">المالية</span>': '<span class="mx-tag">Finance</span>',
  'صحّح إجمالي الجدول 3 ليطابق المصدر.': 'Correct the total in table 3 to match the source.',
  'التقارير الأسبوعية': 'Weekly reports',
  '5 من 12 مهمة مفتوحة (42%)': '5 of 12 open tasks (42%)',
  '2 من 6 مهام مفتوحة (33%)': '2 of 6 open tasks (33%)'
});

Object.assign(EN_QUESTIONS, {
  'l5-1-c1': { q: 'What is the main difference between standard and custom fields?', options: ['Custom fields are faster', 'Standard fields exist on every task; custom fields are added to a location as needed', 'Standard fields are for admins only', 'There is no difference'], why: 'Standard fields such as status and assignee are always there; you add custom fields for data specific to your work.' },
  'l5-1-c2': { q: 'Why is a Dropdown better than Text for the “Requesting department” field?', options: ['It looks nicer', 'It keeps values consistent so filters and reports work', 'It accepts longer text', 'It hides the field from others'], why: 'Consistent values are a condition for accurate filtering and summaries.' },
  'l5-2-c1': { q: 'What does the TODAY() function return?', options: ['A number of days', 'Today’s date', 'The name of the day as text', 'Tracked time'], why: 'TODAY() takes no inputs and returns today’s date.' },
  'l5-2-c2': { q: 'Which formula calculates a task’s age in days since it was created?', options: ['DAYS(field("Date created"), TODAY())', 'DAYS(TODAY(), field("Date created"))', 'TODAY(field("Date created"))', 'DAYS(TODAY())'], why: 'End (today) first, then start (the creation date).' },
  'l5-2-c3': { q: 'According to the Help Center, which fields can Formula fields not use?', options: ['Date fields', 'Number fields', 'Text Custom Fields', 'The due date'], why: 'Formula fields cannot use Custom Fields that contain text.' },
  'l6-1-c1': { q: 'What happens when an assigned comment is resolved?', options: ['The comment is deleted', 'The name of whoever resolved it appears, and whoever assigned it is notified', 'The task closes automatically', 'The comment moves to a Doc'], why: 'The name of the person who resolved it appears next to the resolved mark, and whoever assigned it is notified.' },
  'l6-1-c2': { q: 'When is an assigned comment better than a new task?', options: ['For a small action within the current task', 'For a month-long project', 'For classifying tasks', 'For sharing a file with a guest'], why: 'Assigned comments are for small actions within the task’s context.' },
  'l6-2-c1': { q: 'A Chat message asks for work with a deadline. What is best?', options: ['Reply “done”', 'Create a task from the message', 'Copy it into an email', 'Only pin it in the channel'], why: 'Creating a task from the message links the request to action and follow-up.' },
  'l6-2-c2': { q: 'Where is the best place to keep meeting minutes the team refers back to?', options: ['Doc', 'Chat', 'Tag', 'Checklist'], why: 'Reference content belongs in a Doc.' },
  'l7-1-c1': { q: 'What are the two ways to record time on a task?', options: ['A timer or manual entry', 'Email or Chat', 'Tag or Checklist', 'Dashboard only'], why: 'You can track time with a timer or enter it manually.' },
  'l7-1-c2': { q: 'A task has three assignees. Can each of them have a different estimate?', options: ['No, only one estimate', 'Yes', 'Only for admin assignees', 'Only in Gantt'], why: 'According to the Help Center, each person can have a different estimate on larger tasks.' },
  'l7-2-c1': { q: 'Task A cannot be completed before B. What is the relationship from A’s side?', options: ['A Blocking B', 'A Waiting on B', 'A normal Relationship', 'Subtask'], why: 'A is waiting for B, so it is Waiting on.' },
  'l7-2-c2': { q: 'Which slash command creates a normal relationship?', options: ['/blocking', '/waiting', '/link to', '/done'], why: '/link to is for a normal relationship; /blocking and /waiting are for dependencies.' },
  'l8-1-c1': { q: 'What is the difference between a Dashboard Filter and a Card filter?', options: ['No difference', 'The first applies to every supported card, the second to one card', 'The first is for admins only', 'The second deletes tasks'], why: 'The Dashboard filter covers supported cards; a card filter applies to that card alone.' },
  'l8-1-c2': { q: 'What decides which tasks a card reads?', options: ['Its colour', 'Its data source (Location) and filters', 'The Dashboard name', 'Its position on the page'], why: 'The Location and filters decide the data.' },
  'l8-2-c1': { q: 'Before comparing two numbers from two cards, what do you check first?', options: ['The card colours', 'The data source and filters', 'The font size', 'The name of whoever built the Dashboard'], why: 'A different scope makes the comparison meaningless.' },
  'l8-2-c2': { q: 'A weekly completion card shows a rise in one week only. What is the most accurate reading?', options: ['The team has improved for good', 'It may be a one-off snapshot; look at the trend across several weeks', 'The data must be wrong', 'The card should be deleted'], why: 'A trend needs several points in time.' }
});
