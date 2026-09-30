/* English overlay: lessons in modules 9-12 */
Object.assign(EN_LESSONS, {
  /* ---------------- Module 9 ---------------- */
  'l9-1': {
    title: 'Trigger, then Condition, then Action',
    objective: 'Design an automation in three parts: a trigger that starts it, an optional condition that controls it, and an action that carries it out.',
    scenario: 'Every urgent task that reaches REVIEW in the reports List must be reviewed by Salim. The team sometimes forgets to assign him.',
    explain: [
      '<strong>Trigger:</strong> the event that starts the automation, such as a status change or a task being created. It applies to tasks, subtasks or both, in a specific Space, Folder, Subfolder or List.',
      '<strong>Condition:</strong> an optional part that must be met for the action to run, such as “Priority is Urgent”. Conditions add precision and control.',
      '<strong>Action:</strong> the change you want, such as assigning a person, adding a comment or changing the status. If you add more than one action, they run in order from top to bottom.',
      'Read an automation as a sentence: “When the status changes to REVIEW, if the priority is Urgent, then assign Salim.”'
    ],
    deeper: { title: 'AI condition', body: ['On plans that include AI features you can add an AI condition, but there is a limit of one AI condition per automation.'] },
    notes: [{ text: 'Creating automations on a shared location may require certain permissions. Coordinate with the List owner before turning on an automation that affects other people’s work.' }],
    demo: { steps: [
      { cap: 'We start with the trigger: when does the automation run? When the status changes.' },
      { cap: 'We add a condition: only if the priority is Urgent.' },
      { cap: 'Then the action: assign Salim as reviewer. And we turn the automation on.' },
      { cap: 'An urgent task moved to REVIEW: the condition was met, so Salim was assigned automatically.' },
      { cap: 'A low-priority task moved too, but the condition was not met, so the action did not run.' }
    ] },
    exercise: { prompt: 'Build an automation for this rule: “Every new request created in the internal requests List with Urgent priority is assigned to Maryam.”',
      slots: {
        cond: { options: ['No condition', 'Priority is Urgent', 'Assignee is Salim'] },
        action: { options: ['Assign to Maryam', 'Change status to COMPLETE', 'Add a comment'], answer: 'Assign to Maryam' }
      }, success: 'The automation is correct: it starts when the task is created, runs only for urgent requests, and assigns Maryam.' },
    mistake: { wrong: 'An automation with no condition that assigns someone to every task whose status changes, so they drown in notifications.', right: 'Add a condition that limits the action to the intended cases only.' },
    summary: ['Trigger starts, Condition controls, Action carries out.', 'Read it as a sentence: When… if… then…', 'Actions run in order from the top.']
  },
  'l9-2': {
    title: 'Testing automations, limits and avoiding unintended results',
    objective: 'Test an automation on a small scale before rolling it out, work out how many actions it uses, and avoid side effects.',
    scenario: 'A colleague created an automation on a whole Space to change the assignee when the status changes, and suddenly the assignees of dozens of tasks changed.',
    explain: [
      '<strong>Test small:</strong> try the automation on a test List or a single task, check the result, then widen its scope.',
      '<strong>Usage is counted in actions:</strong> every action sent to run uses one monthly action, whether it succeeds or fails. An action the system skipped because the condition was not met uses nothing.',
      '<strong>Limits:</strong> every plan can use automations, action limits reset at the start of each month (PST), and owners and admins get an email at 90% and 100%.',
      '<strong>Avoid surprises:</strong> add precise conditions, give the automation a name that explains what it does, and check the location’s active automations before adding a new one so two do not conflict.'
    ],
    deeper: { title: 'Chained automations', body: ['An automation’s action can be the trigger for another automation. Before turning one on, ask: will this change set off something else?'] },
    notes: [{ text: 'The number of monthly automation actions depends on your plan, and extra actions can be bought on Business Plus and above.' }],
    demo: { steps: [
      { cap: 'An automation with no condition: “When the status changes, assign Salim.” It looks simple.' },
      { cap: 'We change the status of two tasks. The automation assigns Salim to both, including a task that is not his. That is an unintended result.' },
      { cap: 'We fix it by adding a condition that limits it to urgent tasks.' },
      { cap: 'Now the non-urgent task is skipped, and a skipped action does not use up any of the action allowance.' }
    ] },
    exercise: { prompt: 'An automation has two actions (assign an assignee, then add a comment). The trigger fired 10 times this month, and in 4 of them the condition was not met. How many actions were used from the monthly allowance?',
      options: [
        { t: '12 actions', fb: 'Correct: 6 times the condition was met × two actions = 12. The four skipped times use nothing.' },
        { t: '20 actions', fb: 'That counts every run, but actions skipped because the condition was not met are not used.' },
        { t: '10 actions', fb: 'Usage is counted per action sent, not per run.' },
        { t: '6 actions', fb: 'Each time the condition was met, two actions were sent, not one.' }
      ] },
    mistake: { wrong: 'Turning a new automation on for a whole Space straight away, then discovering its effect on dozens of tasks.', right: 'Test it on a test List, add a precise condition, then widen the scope.' },
    summary: ['Test on a small scale first.', 'A sent action is used even if it fails; a skipped one is not.', 'Limits reset every month.', 'Precise conditions and clear names.']
  },

  /* ---------------- Module 10 ---------------- */
  'l10-1': {
    title: 'Forms: taking in requests and turning them into tasks',
    objective: 'Build an internal request form that creates a complete task in the right List with every submission.',
    scenario: 'Internal requests arrive by email in different formats and with missing information. You want one standard form that turns each request into a task.',
    explain: [
      'When a Form is submitted, a <strong>submission task</strong> is created in the chosen location. Each question on the form is mapped to a task field: its name, description, date or a Custom Field.',
      'On the form’s Settings tab, under “After submitting form”, you choose the List where tasks are created (Create task in). You can also apply a task template automatically on submission, and assign submissions automatically to one person.',
      'The responses button takes you to the List where submissions are created, and you can download all submissions as a CSV file.'
    ],
    deeper: { title: 'Dynamic logic', body: ['On the Business Plus and Enterprise plans you can add rules and conditions to questions, such as showing a due date field if Urgent is chosen in the priority question.'] },
    notes: [{ text: 'Dynamic logic is available on Business Plus and Enterprise. The availability and limits of Form view depend on your plan.' }],
    demo: { steps: [
      { cap: 'In Form view we map each question to a field: the name, the department (a Custom Field) and the date.' },
      { cap: 'We add a priority question so urgent requests arrive already classified.' },
      { cap: 'In the settings: tasks are created in “Internal requests” and assigned automatically to Maryam for triage.' },
      { cap: 'An employee from the Sales department fills in the form and submits it.' },
      { cap: 'The result: a new task in the right List, with its details, assigned to Maryam.' }
    ] },
    exercise: { prompt: 'Map each question on the internal request form to the right task field.',
      pairs: [['Request title', 'Task name'], ['Request details', 'Task description'], ['Date needed', 'Due date'], ['Requesting department', 'Custom Field (Dropdown)'], ['Supporting document', 'Attachment']] },
    mistake: { wrong: 'A form with a single text question, “Write your request”, so tasks arrive with no date and no department.', right: 'One question for each field you need for triage and follow-up, with automatic assignment to whoever triages.' },
    summary: ['Every submission = a task.', 'Map each question to a field.', 'Set the List, assignment and template in the settings.']
  },
  'l10-2': {
    title: 'Goals and Targets',
    objective: 'Turn a general goal into measurable targets, and choose the right target type.',
    scenario: 'The quarter’s goal: “Close the open audit actions.” You want everyone to see progress toward it in clear numbers.',
    explain: [
      'A <strong>Goal</strong> is a high-level goal made up of smaller, measurable <strong>Targets</strong>. It is used to track OKRs, period goals or weekly scorecards.',
      'Target types: <strong>Number</strong> for a numeric range (such as closing 10 findings), <strong>True/False</strong> for something that is either done or not, <strong>Currency</strong> for a financial goal, and <strong>Task</strong> to link progress to completing specific tasks.',
      'A goal’s progress is calculated from its targets, so every time you update a target, the goal moves.'
    ],
    deeper: { title: 'A good goal', body: ['Make every target measurable and bound to a period. “Improve auditing” is not a target; “Close 10 findings before 30 September” is.'] },
    notes: [
      { text: 'Goals are available on all plans, with usage limits on the Free plan (100 uses), and Goal Folders on Business and above. Guests can use Goals.' },
      { text: 'Where Goals sit in the interface, and whether they are available, can vary between ClickUp versions, and some organizations track goals with views and fields instead. See the Goals page in the Help Center.' }
    ],
    demo: { steps: [
      { cap: 'The goal: close the Q3 audit actions. Its progress is now 30%.' },
      { cap: 'The first target is a number: 3 of 10 findings closed. We update it to 6.' },
      { cap: 'We add a Task target: it progresses automatically as tasks in the Q3 List are completed.' },
      { cap: 'The goal’s progress combines its targets. Everyone can see where we are without a separate report.' }
    ] },
    exercise: { prompt: 'Choose the target type for each item.',
      pairs: [['Close 12 audit findings', 'Number'], ['Management approves the closure report', 'True/False'], ['Cut printing costs by 3,000 rials', 'Currency'], ['Complete the tasks in the “Q3” List', 'Task']] },
    mistake: { wrong: 'A goal with no measurable targets, so its progress stays at 0% or is updated by guesswork.', right: 'Split the goal into numeric targets or targets linked to tasks that update with the work.' },
    summary: ['Goal = measurable targets.', 'Number, True/False, Currency and Task.', 'Progress is calculated from the targets.']
  },

  /* ---------------- Module 11 ---------------- */
  'l11-1': {
    title: 'Roles, guests and permission levels',
    objective: 'Tell apart the roles (Owner, Admin, Member, Limited Member and Guest) and the four permission levels.',
    scenario: 'An external consultant will review one contract, and a colleague from another department will take part in one List only. You want to give each of them what they need and no more.',
    explain: [
      '<strong>Member roles:</strong> the Owner owns the Workspace, an Admin is a member with extra rights to manage it, and a Member works in the Spaces available to them.',
      '<strong>Limited Member:</strong> someone inside the organization who can only reach the locations and items shared with them. People who use your organization’s email domain are not added as guests but as limited members.',
      '<strong>Guest:</strong> someone from outside the organization who can only reach what is shared with them. Guest types depend on the plan: View only, Permission-controlled, and a single type on the Free plan. Guests cannot share anything, even with edit rights.',
      '<strong>Permission levels:</strong> View only to look, Comment to comment, Edit to edit, and Full edit for full editing. They apply differently depending on the item, the location and the role.'
    ],
    deeper: { title: 'The least permission needed', body: ['Give each person the least permission that covers their work. Someone who only needs to give feedback needs Comment, not Edit.'] },
    notes: [
      { text: 'Inviting members and changing their roles is done by Workspace owners and admins. Employees share items only within the limits of their own permissions.' },
      { text: 'Guest types, some roles and their costs depend on your subscription plan.' }
    ],
    demo: { steps: [
      { cap: 'We open sharing for the “Audit actions” List to see who can reach it, and with which permission.' },
      { cap: 'Maryam is a team member with Full edit. Noura is a member with Edit, but it is not switched on here.' },
      { cap: 'We invite the external consultant by email, so they are added as a Guest.' },
      { cap: 'They only need to give feedback, so we give Comment, not Edit: the least permission needed.' }
    ] },
    exercise: { prompt: 'Choose the most suitable role for each person.',
      pairs: [['An employee on the team who works in most of the department’s Spaces', 'Member'], ['A colleague from another department in the organization who takes part in one List only', 'Limited Member'], ['An external consultant reviewing one contract', 'Guest'], ['The person who manages the Workspace settings and members', 'Admin']] },
    mistake: { wrong: 'Giving everyone Full edit “to keep things simple”.', right: 'Give the least permission needed: View only or Comment when that is enough.' },
    summary: ['Owner, Admin and Member for members.', 'Limited Member: inside the organization with limited access.', 'Guest: outside the organization, limited access, cannot share.', 'View only, Comment, Edit and Full edit.']
  },
  'l11-2': {
    title: 'Private locations, inheritance and sharing a single task',
    objective: 'Share one task without exposing the whole List, tell assigning apart from granting access, and understand the effect of inheritance.',
    scenario: 'The “Audit actions” List is private. The external consultant needs to comment on the task “Review the supplier contract” only, and must not see the other actions.',
    explain: [
      '<strong>Private:</strong> a private item or location can only be seen by the people it is shared with. A Space, Folder, List or task can be made private.',
      '<strong>Inheritance:</strong> permissions set on a location usually pass down to what is inside it. Sharing the whole List means access to all of its tasks.',
      '<strong>Sharing a single task:</strong> you do not have to share the whole List. You can share the task itself with someone inside or outside the Workspace and set their permission. Anyone with access to a private item can share it with others at a permission equal to or lower than their own.',
      '<strong>Assigning is not access:</strong> the Assignee decides who does the work. Access is decided by sharing and permissions. Assign the person and share the item with them.'
    ],
    deeper: { title: 'Requesting access', body: ['When someone opens a link to a private item they cannot access, they may be asked to send an access request for someone with permission to approve. See the article Request and approve access.'] },
    notes: [
      { text: 'Permission rules vary with the role, the item, the plan and your organization’s advanced security settings. Check the Permissions in detail page, and ask your Workspace admin before sharing sensitive data.' },
      { text: 'Your organization may restrict inviting guests or sharing items externally in its security settings. Follow your organization’s data protection policy.' }
    ],
    demo: { steps: [
      { cap: 'The List is private (notice the lock). The consultant needs one task only, so we will not share the List.' },
      { cap: 'We open the options menu for the task itself and choose Share task.' },
      { cap: 'We invite the consultant to this task only, with Comment permission.' },
      { cap: 'The result: they see the task and can comment on it, but cannot see the other audit actions.' }
    ] },
    exercise: { prompt: 'Set up sharing for the consultant: the List is private, and they need to comment on the task “Review the supplier contract” only.',
      slots: {
        what: { label: 'What do you share?', options: ['The whole List', 'The task only', 'The Operations Space'], answer: 'The task only' },
        role: { label: 'Which role are they added as?' },
        perm: { label: 'Permission' },
        assign: { label: 'Is assigning them as Assignee enough without sharing?', options: ['Yes, assigning gives access', 'No, the task must be shared with them'], answer: 'No, the task must be shared with them' }
      }, success: 'Precise sharing: one task, for a guest, with comment permission, and understanding that assigning does not give access.' },
    mistake: { wrong: 'Sharing the whole List with a consultant who needs one task, so they see data that is not theirs.', right: 'Share only the task itself, with the least permission needed.' },
    summary: ['Private items are seen only by those they are shared with.', 'Sharing a location passes access down to what is inside.', 'Share only the task when that is enough.', 'Assigning is not access.']
  },

  /* ---------------- Module 12 ---------------- */
  'l12-1': {
    title: 'Shortcuts and advanced search',
    objective: 'Turn on keyboard shortcuts, and use the command bar, narrowed search and slash commands.',
    scenario: 'You spend a long time clicking to reach tasks. You want to reach anything in seconds.',
    explain: [
      '<strong>Keyboard shortcuts are off by default.</strong> Turn them on from your avatar, then Settings, then the Preferences section, then Keyboard Shortcuts. They are available on every plan and for every role.',
      'To show the shortcut list, press <kbd>Shift</kbd> + <kbd>?</kbd> from anywhere outside a text field.',
      '<strong>Command bar and search:</strong> <kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows or <kbd>Cmd</kbd> + <kbd>K</kbd> on Mac. Type part of the name, then narrow by type or assignee.',
      '<strong>Slash commands:</strong> type / in a description or comment to insert quickly, such as <code>/waiting</code> and <code>/blocking</code> for dependencies. In the desktop app: <kbd>Ctrl</kbd> + <kbd>E</kbd> (or <kbd>Cmd</kbd> + <kbd>E</kbd>) creates a task from any app.'
    ],
    deeper: { title: 'Start with just two shortcuts', body: ['Do not try to memorize the whole list. Start with the command bar and the shortcut list, and add one new shortcut each week.'] },
    notes: [{ text: 'Some shortcuts can differ by operating system, ClickUp version and language. Always refer to the list shown with Shift + ?.' }],
    demo: { steps: [
      { cap: 'We press Ctrl + K to open the command bar and search from anywhere.' },
      { cap: 'We type part of the name, and matching tasks and documents appear.' },
      { cap: 'We narrow the results to what is assigned to us only, so a colleague’s completed task disappears.' },
      { cap: 'Shift + ? shows the shortcut list. Remember: they must be turned on in settings first.' }
    ] },
    exercise: { prompt: 'Match each action with its shortcut.',
      choices: ['Shift + ?', 'Ctrl/Cmd + K', 'Ctrl/Cmd + E (desktop app)', '/waiting'],
      pairs: [['Show the keyboard shortcut list', 'Shift + ?'], ['Open the command bar and search', 'Ctrl/Cmd + K'], ['Create a task from any app on your computer', 'Ctrl/Cmd + E (desktop app)'], ['Create a dependency from inside a description or comment', '/waiting']] },
    mistake: { wrong: 'Trying to use shortcuts without turning them on, then assuming they do not work.', right: 'Turn them on from Settings, then Preferences, then Keyboard Shortcuts.' },
    summary: ['Turn shortcuts on first.', 'Shift + ? to show them.', 'Ctrl/Cmd + K for search and commands.', '/ for quick inserts.']
  },
  'l12-2': {
    title: 'Integrations, AI and reusable workflows',
    objective: 'Build a complete, reusable workflow, and use AI features and integrations carefully and in line with your organization’s policy.',
    scenario: 'Your team has successfully organized internal requests, and another department wants to copy the same approach without rebuilding it from scratch.',
    explain: [
      'A <strong>reusable workflow</strong> brings together what you have learned: a form that takes in the request, a List with clear statuses, a task template with a checklist, an automation that triages by priority, and a Dashboard that follows what is overdue. Save the List or task as a template to repeat it.',
      '<strong>AI (ClickUp Brain):</strong> depending on your plan and add-ons, you can summarize conversations, create AI cards in Dashboards, and add one AI condition to an automation. Always review the output before relying on it, and do not enter sensitive data against your organization’s policy.',
      '<strong>Integrations:</strong> connect ClickUp to other tools such as email, calendar and storage. Turning them on is decided by the Workspace admin and the information security policy.'
    ],
    deeper: { title: 'Common mistakes at the advanced level', body: ['Automations without testing. Dashboards with unclear data sources. Sharing whole locations instead of specific items. Text fields where a Dropdown is needed. Templates that are not updated when the process changes.'] },
    notes: [
      { text: 'ClickUp Brain features depend on your plan or a paid add-on, and may not be turned on in your organization.' },
      { text: 'Integrations and AI features are turned on by the Workspace admin in line with organization policy. Employees do not connect external tools to work data without approval.' }
    ],
    demo: { steps: [
      { cap: 'On plans that include ClickUp Brain, you can ask for a quick summary of open work.' },
      { cap: 'The output is a draft to help you, not the final truth. Check it against the tasks themselves.' },
      { cap: 'Integrations connect ClickUp to other tools, and turning them on is decided by the Workspace admin in line with organization policy.' }
    ] },
    exercise: { prompt: 'Put the parts of the reusable internal requests workflow in the order a request flows through them.',
      items: ['A Form takes in the request with consistent data', 'A task is created in the requests List with a template and checklist', 'An automation triages by priority and assigns the owner', 'A Dashboard follows what is open and overdue', 'A monthly review improves the form and template'] },
    mistake: { wrong: 'Copying AI output into an official report without review.', right: 'Treat the output as a draft, and check it against the original tasks and data.' },
    summary: ['Combine the form, List, template, automation and Dashboard into one workflow.', 'Save it as a template to reuse it.', 'AI is a draft that needs review.', 'Integrations need admin approval.']
  }
});

Object.assign(DEMO_EN, {
  'Assign to <b>سالم</b>': 'Assign to <b>Salim</b>',
  'شُغّلت الأتمتة مرتين: إجراءان مستهلكان.': 'The automation ran twice: two actions used.',
  'مهمة عاجلة: إجراء واحد. المهمة الأخرى: تُخطيت (0).': 'Urgent task: one action. The other task: skipped (0).',
  'Assign to: مريم': 'Assign to: Maryam',
  'تقرير مبيعات الباقات الشهري': 'Monthly plan sales report',
  'المبيعات': 'Sales',
  '30 سبتمبر': '30 September',
  'مشاركة المهمة: مراجعة عقد المورد مع المستشار': 'Share task: Review the supplier contract with the consultant',
  'تُشارك هذه المهمة وحدها. بقية القائمة تبقى خاصة.': 'Only this task is shared. The rest of the List stays private.',
  'التقرير الأسبوعي': 'weekly report',
  'مهمتان مفتوحتان: تحديث لوحة المؤشرات (مرتفعة، مريم، الثلاثاء) ومراجعة التقرير الأسبوعي (عادية، أنت، الخميس).': 'Two open tasks: Update the KPI dashboard (High, Maryam, Tuesday) and Review the weekly report (Normal, you, Thursday).'
});

Object.assign(EN_QUESTIONS, {
  'l9-1-c1': { q: 'Which part of an automation is optional?', options: ['Trigger', 'Condition', 'Action', 'None'], why: 'The condition is optional; the trigger and action are the core parts.' },
  'l9-1-c2': { q: 'An automation has three actions. In what order do they run?', options: ['Randomly', 'From top to bottom', 'From bottom to top', 'All at once in no order'], why: 'Actions run in the order they were added, from top to bottom.' },
  'l9-2-c1': { q: 'An action was sent to run but failed. Does it use up the allowance?', options: ['No', 'Yes, it uses one action', 'It uses half an action', 'It uses two actions'], why: 'A sent action uses one monthly action whether it succeeds or fails.' },
  'l9-2-c2': { q: 'When do automation action limits reset?', options: ['Every week', 'At the start of each month', 'Every year', 'They never reset'], why: 'Action limits reset at the start of each month (PST).' },
  'l10-1-c1': { q: 'What happens when a form is submitted in ClickUp?', options: ['Only an email is sent', 'A task is created in the chosen location', 'Only a Dashboard is updated', 'A PDF file is saved'], why: 'Every submission creates a task in the chosen location.' },
  'l10-1-c2': { q: 'Where do you choose the List where submission tasks are created?', options: ['In Settings, the After submitting form section', 'In a Dashboard', 'In your personal settings', 'In Inbox'], why: 'From Settings, then Create task in.' },
  'l10-2-c1': { q: 'What is a Goal made of?', options: ['Tags', 'Measurable Targets', 'Dashboards', 'Automations'], why: 'A goal is made up of measurable targets.' },
  'l10-2-c2': { q: 'The target “Approve the report” is either done or not. What type is it?', options: ['Number', 'Currency', 'True/False', 'Task'], why: 'True/False is for something that is either done or not.' },
  'l11-1-c1': { q: 'A colleague uses the organization’s email and needs access to one List. How are they added?', options: ['Guest', 'Limited Member', 'Owner', 'They cannot be added'], why: 'People who use the organization’s email domain are added as limited members, not guests.' },
  'l11-1-c2': { q: 'Can a guest share an item with others if given Edit permission?', options: ['Yes', 'No, guests cannot share anything', 'Yes, with other guests only', 'Only in Docs'], why: 'According to the Help Center, guests cannot share anything, even with edit permission.' },
  'l11-1-c3': { q: 'What are the four permission levels?', options: ['Read, Write, Delete and Admin', 'View only, Comment, Edit and Full edit', 'Low, Medium, High and Urgent', 'Owner, Admin, Member and Guest'], why: 'View only, Comment, Edit and Full edit.' },
  'l11-2-c1': { q: 'You assigned a colleague to a task in a private List that is not shared with them. Can they see it?', options: ['Yes, assigning is enough', 'Not necessarily; access needs sharing', 'Yes, but after a day', 'They cannot be assigned at all'], why: 'Assigning decides who does the work; access is decided by sharing and permissions.' },
  'l11-2-c2': { q: 'A member has Edit permission on a private item. What is the highest permission they can give someone else?', options: ['Full edit', 'Edit or lower', 'Admin', 'They cannot share'], why: 'They can only give an equal or lower permission.' },
  'l11-2-c3': { q: 'Do you have to share a whole List to share one task from it?', options: ['Yes, always', 'No, you can share the task on its own', 'Only for guests', 'Only on the Free plan'], why: 'Public and private tasks can be shared directly with people inside or outside the Workspace.' },
  'l12-1-c1': { q: 'What is the default state of keyboard shortcuts?', options: ['On for everyone', 'Off, and turned on in personal settings', 'Available to admins only', 'They do not exist'], why: 'Shortcuts are off by default and are turned on in your personal settings.' },
  'l12-1-c2': { q: 'How do you show the shortcut list?', options: ['Ctrl + P', 'Shift + ?', 'Alt + F4', 'Esc'], why: 'Shift + ? from anywhere outside a text field.' },
  'l12-2-c1': { q: 'How many AI conditions can one automation have?', options: ['Unlimited', 'Only one', 'Three', 'No AI condition can be added'], why: 'According to the Help Center, only one AI condition per automation.' },
  'l12-2-c2': { q: 'Who usually decides whether to turn on an integration with an external tool?', options: ['Any guest', 'The Workspace admin, in line with organization policy', 'AI, automatically', 'Nobody'], why: 'Integrations are governed by Workspace management and the information security policy.' }
});
