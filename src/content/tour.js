/* ==========================================================================
   ClickUp tour content: the 12 parts of the app, why each one helps, how to
   use it step by step, and the questions people ask most. Every string is a
   pair [Arabic, English]; tp() picks the current language.
   Each part maps to one module and borrows that module's animated demo.
   ========================================================================== */

const tp = pair => Array.isArray(pair) ? tx(pair[0], pair[1]) : pair;

const TOUR_PARTS = [
  { id: 'start', mod: 'm1', icon: 'home', lesson: 'l1-2', lessons: ['l1-1', 'l1-2', 'l1-3'],
    name: ['البداية: Home وInbox', 'Getting around: Home & Inbox'],
    one: ['Home هي نقطة انطلاقك اليومية: تجمع المهام المسندة إليك حسب موعدها، وInbox يجمع الإشارات والتعيينات والردود حتى لا يفوتك شيء.', 'Home is your daily starting point: it gathers the tasks assigned to you by when they are due, and Inbox collects mentions, assignments and replies so nothing slips past you.'],
    where: ['أعلى الشريط الجانبي.', 'At the top of the sidebar.'],
    why: [
      ['target', ['تعرف من أين تبدأ يومك دون البحث في كل قائمة.', 'You know where to start your day without digging through every List.']],
      ['alert', ['المتأخر يظهر أولاً، فلا يفاجئك موعد فات.', 'Overdue work shows first, so a missed date never surprises you.']],
      ['inbox', ['كل إشارة أو تعيين في مكان واحد بدلاً من البريد.', 'Every mention and assignment lands in one place instead of your email.']]
    ],
    how: [
      ['افتح Home من الشريط الجانبي كل صباح.', 'Open Home from the sidebar each morning.'],
      ['ابدأ بالمهام المتأخرة، ثم مهام اليوم.', 'Start with overdue tasks, then today’s.'],
      ['افتح Inbox: رد على ما يحتاج رداً، وانقل إلى Later ما يحتاج وقتاً.', 'Open Inbox: reply to what needs an answer, and move what needs time to Later.'],
      ['امسح (Clear) ما انتهيت منه ليبقى Inbox مرتباً.', 'Clear what you have finished so Inbox stays tidy.']
    ] },
  { id: 'structure', mod: 'm2', icon: 'layers', lesson: 'l2-1', lessons: ['l2-1', 'l2-2'],
    name: ['تنظيم العمل: Spaces وFolders وLists', 'Organizing work: Spaces, Folders & Lists'],
    one: ['يرتّب ClickUp العمل مثل خزانة ملفات: Workspace للمؤسسة، وSpace لكل فريق أو إدارة، وFolder اختياري يجمع القوائم، وList تعيش فيها المهام.', 'ClickUp organizes work like a filing cabinet: a Workspace for the organization, a Space for each team or department, an optional Folder to group Lists, and Lists where tasks live.'],
    where: ['في الشريط الجانبي تحت عنوان Spaces.', 'In the sidebar, under Spaces.'],
    why: [
      ['compass', ['كل فريق يجد عمله في مكانه المعروف.', 'Every team finds its work in a known place.']],
      ['lock', ['الإعدادات والصلاحيات تُضبط مرة واحدة وترثها المستويات الأدنى.', 'Settings and permissions are set once and inherited by the levels below.']],
      ['layers', ['الهيكل ينمو مع العمل: ابدأ بسيطاً وأضف عند الحاجة.', 'The structure grows with your work: start simple and add levels when you need them.']]
    ],
    how: [
      ['افتح Space فريقك من الشريط الجانبي.', 'Open your team’s Space in the sidebar.'],
      ['استخدم Folder فقط لجمع قوائم مترابطة، مثل قوائم مشروع واحد.', 'Use a Folder only to group related Lists, such as the Lists of one project.'],
      ['أنشئ List لكل نوع عمل متكرر أو مرحلة.', 'Create a List for each kind of recurring work or phase.'],
      ['أضف المهام داخل List المناسبة.', 'Add tasks inside the right List.']
    ] },
  { id: 'tasks', mod: 'm3', icon: 'checklist', lesson: 'l3-2', lessons: ['l3-1', 'l3-2', 'l3-3', 'l3-4', 'l3-5'],
    name: ['المهام: قلب ClickUp', 'Tasks: the heart of ClickUp'],
    one: ['المهمة هي وحدة العمل: عنوان واضح، ومسؤول، وتاريخ استحقاق، وأولوية، وحالة تُظهر أين وصل العمل.', 'A task is the unit of work: a clear title, an assignee, a due date, a priority and a status that shows where the work stands.'],
    where: ['داخل أي List. اضغط + Task أو Add Task.', 'Inside any List. Press + Task or Add Task.'],
    why: [
      ['user', ['يعرف الجميع من المسؤول، فلا يضيع العمل بين شخصين.', 'Everyone knows who owns it, so work never falls between two people.']],
      ['calendar', ['التاريخ والأولوية يوضّحان ما يجب إنجازه أولاً.', 'The date and priority make clear what comes first.']],
      ['subtask', ['المهام الفرعية وقوائم التحقق تقسّم العمل الكبير إلى خطوات.', 'Subtasks and checklists break big work into steps.']]
    ],
    how: [
      ['اكتب عنواناً يبدأ بفعل، مثل «جهّز تقرير المبيعات».', 'Write a title that starts with a verb, such as “Prepare the sales report”.'],
      ['عيّن مسؤولاً واحداً واضحاً.', 'Assign one clear owner.'],
      ['حدد تاريخ الاستحقاق والأولوية.', 'Set the due date and priority.'],
      ['حدّث الحالة كلما تقدّم العمل: TO DO ثم IN PROGRESS ثم COMPLETE.', 'Update the status as work moves: TO DO, then IN PROGRESS, then COMPLETE.']
    ] },
  { id: 'views', mod: 'm4', icon: 'board', lesson: 'l4-1', lessons: ['l4-1', 'l4-2', 'l4-3'],
    name: ['طرق العرض: المهام نفسها بأشكال مختلفة', 'Views: the same tasks, seen your way'],
    one: ['طريقة العرض عدسة على المهام نفسها: List للتفاصيل، وBoard لمراحل العمل، وCalendar للمواعيد، وGantt للخط الزمني. غيّر مهمة في أي عرض فتتغير في الجميع.', 'A view is a lens on the same tasks: List for details, Board for workflow stages, Calendar for dates and Gantt for timelines. Change a task in any view and it changes everywhere.'],
    where: ['التبويبات أعلى أي List أو Space، وزر + View لإضافة عرض.', 'The tabs at the top of any List or Space, and the + View button to add one.'],
    why: [
      ['board', ['ترى سير العمل بلمحة، وتنقل البطاقات بالسحب.', 'See the workflow at a glance and drag cards between stages.']],
      ['calendar', ['تكتشف تزاحم المواعيد قبل أن يحدث.', 'Spot clashing deadlines before they happen.']],
      ['filter', ['المرشّحات والتجميع تُظهر ما يهمك فقط.', 'Filters and grouping show only what matters to you.']]
    ],
    how: [
      ['افتح List واختر تبويب Board.', 'Open a List and choose the Board tab.'],
      ['اسحب بطاقة إلى عمود آخر لتغيير حالتها.', 'Drag a card to another column to change its status.'],
      ['جرّب Calendar لترى المهام على أيام الأسبوع.', 'Try Calendar to see tasks across the week.'],
      ['أضف مرشّحاً مثل «المسند إليّ» واحفظ العرض.', 'Add a filter such as “Assigned to me” and save the view.']
    ] },
  { id: 'fields', mod: 'm5', icon: 'table', lesson: 'l5-1', lessons: ['l5-1', 'l5-2'],
    name: ['الحقول المخصصة: بياناتك أنت', 'Custom Fields: your own data'],
    one: ['الحقول المخصصة تضيف إلى كل مهمة معلومات يحتاجها فريقك، مثل الإدارة أو نوع الطلب أو المبلغ، فتستطيع التصفية والترتيب وبناء التقارير.', 'Custom Fields add the information your team needs to every task, such as department, request type or amount, so you can filter, sort and report on it.'],
    where: ['أعمدة إضافية في عرض List، وقسم الحقول داخل المهمة.', 'Extra columns in List view, and the fields section inside a task.'],
    why: [
      ['table', ['بيانات متسقة بدلاً من أن يكتب كل شخص بطريقته.', 'Consistent data instead of everyone typing it their own way.']],
      ['filter', ['تصفية فورية، مثل «كل طلبات إدارة المالية».', 'Instant filtering, such as “all requests from Finance”.']],
      ['chart', ['الحقول تغذّي لوحات المعلومات والتقارير.', 'Fields feed your dashboards and reports.']]
    ],
    how: [
      ['في عرض List اضغط + لإضافة عمود.', 'In List view, press + to add a column.'],
      ['اختر نوع الحقل المناسب، مثل Dropdown للخيارات الثابتة.', 'Pick the right field type, such as Dropdown for fixed choices.'],
      ['اكتب الخيارات مرة واحدة ليختار منها الجميع.', 'Write the options once so everyone chooses from them.'],
      ['املأ الحقل في كل مهمة، ثم صفِّ أو رتّب به.', 'Fill the field on each task, then filter or sort by it.']
    ] },
  { id: 'collab', mod: 'm6', icon: 'message', lesson: 'l6-1', lessons: ['l3-4', 'l6-1', 'l6-2'],
    name: ['التعاون: التعليقات وDocs وChat', 'Collaboration: comments, Docs & Chat'],
    one: ['بدلاً من رسائل البريد المتفرقة، يدور النقاش داخل المهمة نفسها: علّق، وأشر إلى زميل بـ @، وأسند التعليق ليصبح إجراءً مطلوباً. وDocs وWhiteboards للكتابة والتخطيط معاً.', 'Instead of scattered emails, the conversation happens on the task itself: comment, @mention a colleague and assign the comment so it becomes an action. Docs and Whiteboards are for writing and planning together.'],
    where: ['قسم النشاط والتعليقات داخل كل مهمة، وDocs وChat من الشريط الجانبي.', 'The activity and comments area in every task, and Docs and Chat from the sidebar.'],
    why: [
      ['message', ['القرار وسببه محفوظان بجانب العمل.', 'Every decision and the reason for it stay next to the work.']],
      ['at', ['الإشارة بـ @ تصل إلى الشخص المناسب مباشرة.', 'An @mention reaches the right person directly.']],
      ['doc', ['المستندات مرتبطة بالمهام، لا ضائعة في المرفقات.', 'Documents are linked to tasks, not lost in attachments.']]
    ],
    how: [
      ['افتح المهمة واكتب تعليقك في الأسفل.', 'Open the task and write your comment at the bottom.'],
      ['اكتب @ ثم اسم الزميل ليصله إشعار.', 'Type @ and a colleague’s name so they are notified.'],
      ['أسند التعليق إذا كان يحتاج إجراءً، وحُلّه عند الانتهاء.', 'Assign the comment if it needs action, and resolve it when done.'],
      ['أنشئ Doc لملاحظات الاجتماع واربطه بالمهمة.', 'Create a Doc for meeting notes and link it to the task.']
    ] },
  { id: 'time', mod: 'm7', icon: 'timer', lesson: 'l7-2', lessons: ['l7-1', 'l7-2'],
    name: ['الوقت والتخطيط', 'Time & planning'],
    one: ['خطّط بثقة: قدّر الوقت وتتبّعه، واربط المهام بعلاقات Waiting on وBlocking، وشاهد كل شيء على Gantt.', 'Plan with confidence: estimate and track time, link tasks with Waiting on and Blocking relationships, and see it all on a Gantt chart.'],
    where: ['حقلا Time Estimate وTrack Time داخل المهمة، وقسم Dependencies، وعرض Gantt.', 'The Time Estimate and Track Time fields in a task, the Dependencies section, and the Gantt view.'],
    why: [
      ['timer', ['تعرف كم يستغرق العمل فعلاً.', 'Learn how long work really takes.']],
      ['link', ['عندما تتأخر مهمة ترى فوراً ما يتأثر بها.', 'When a task slips, you immediately see what it affects.']],
      ['gantt', ['خط زمني واضح يشاركه الفريق كله.', 'A clear timeline the whole team shares.']]
    ],
    how: [
      ['ضع تقديراً للوقت في المهمة.', 'Add a time estimate to the task.'],
      ['شغّل مؤقت التتبع أثناء العمل، أو أضف الوقت يدوياً.', 'Start the timer while you work, or add time manually.'],
      ['أضف علاقة Waiting on للمهمة التي تنتظر غيرها.', 'Add a Waiting on relationship to a task that depends on another.'],
      ['افتح Gantt لترى التسلسل وما هو متأخر.', 'Open Gantt to see the sequence and what is late.']
    ] },
  { id: 'dash', mod: 'm8', icon: 'chart', lesson: 'l8-1', lessons: ['l8-1', 'l8-2'],
    name: ['لوحات المعلومات: الصورة الكاملة', 'Dashboards: the big picture'],
    one: ['تجمع Dashboard بطاقات ورسوماً تُحسب من المهام نفسها، فترى تقدّم الفريق والمتأخر وعبء العمل دون إعداد تقارير يدوية.', 'A Dashboard brings together cards and charts calculated from the tasks themselves, so you see team progress, overdue work and workload without building reports by hand.'],
    where: ['Dashboards من الشريط الجانبي.', 'Dashboards in the sidebar.'],
    why: [
      ['chart', ['أرقام حيّة تتحدث مع كل تغيير في المهام.', 'Live numbers that update with every task change.']],
      ['eye', ['المدير يرى الصورة دون أن يسأل كل شخص.', 'Managers see the picture without asking everyone.']],
      ['alert', ['المشكلات تظهر مبكراً: تأخر، أو ضغط على شخص واحد.', 'Problems show early: delays, or one person overloaded.']]
    ],
    how: [
      ['أنشئ Dashboard جديدة.', 'Create a new Dashboard.'],
      ['أضف بطاقة، مثل عدد المهام حسب الحالة.', 'Add a card, such as tasks by status.'],
      ['اختر مصدر البيانات: أي Space أو List.', 'Choose the data source: which Space or List.'],
      ['اقرأ كل رقم مع مرشّحاته قبل أن تستنتج.', 'Read each number together with its filters before drawing conclusions.']
    ] },
  { id: 'auto', mod: 'm9', icon: 'zap', lesson: 'l9-1', lessons: ['l9-1', 'l9-2'],
    name: ['الأتمتة: دع ClickUp يتولى الروتين', 'Automations: let ClickUp handle the routine'],
    one: ['الأتمتة تنفّذ الخطوات المتكررة تلقائياً: عندما يحدث شيء (Trigger) وتتحقق شروط (Condition)، ينفّذ ClickUp إجراءً (Action).', 'Automations handle repeated steps for you: when something happens (Trigger) and conditions are met (Condition), ClickUp takes an action (Action).'],
    where: ['زر Automate أعلى أي List أو Space.', 'The Automate button at the top of any List or Space.'],
    why: [
      ['zap', ['وقت أقل على الخطوات المكررة.', 'Less time spent on repetitive steps.']],
      ['check', ['لا تُنسى خطوة، مثل تعيين المراجع.', 'No step gets forgotten, such as assigning the reviewer.']],
      ['repeat', ['العمل يسير بالطريقة نفسها في كل مرة.', 'Work follows the same process every time.']]
    ],
    how: [
      ['افتح Automate في القائمة.', 'Open Automate on the List.'],
      ['اختر Trigger، مثل «عندما تتغير الحالة إلى REVIEW».', 'Choose a Trigger, such as “when status changes to REVIEW”.'],
      ['أضف Condition عند الحاجة، ثم Action مثل «عيّن المراجع».', 'Add a Condition if needed, then an Action such as “assign the reviewer”.'],
      ['اختبرها على مهمة تجريبية قبل الاعتماد عليها.', 'Test it on a sample task before relying on it.']
    ] },
  { id: 'forms', mod: 'm10', icon: 'form', lesson: 'l10-1', lessons: ['l10-1', 'l10-2'],
    name: ['النماذج والأهداف', 'Forms & Goals'],
    one: ['النموذج (Form) يستقبل الطلبات بشكل مرتب: كل إرسال يصبح مهمة في List. والأهداف (Goals) تتابع مستهدفات قابلة للقياس مرتبطة بالعمل.', 'A Form collects requests in a tidy way: each submission becomes a task in a List. Goals track measurable targets linked to the work.'],
    where: ['عرض Form داخل List، وGoals من الشريط الجانبي (قد يختلف موضعها بحسب الإصدار).', 'A Form view inside a List, and Goals from the sidebar (its place can vary by version).'],
    why: [
      ['form', ['تصل الطلبات كاملة البيانات من المرة الأولى.', 'Requests arrive complete the first time.']],
      ['inbox', ['لا طلبات ضائعة في المحادثات.', 'No requests lost in chats.']],
      ['target', ['يرى الفريق التقدم نحو الهدف بالأرقام.', 'The team sees progress toward the target in numbers.']]
    ],
    how: [
      ['أضف عرض Form إلى List الطلبات.', 'Add a Form view to your requests List.'],
      ['أضف الأسئلة واربط كل سؤال بحقل.', 'Add questions and map each one to a field.'],
      ['شارك رابط النموذج مع من يرسل الطلبات.', 'Share the form link with whoever sends requests.'],
      ['تابع الطلبات الواردة كمهام في List.', 'Follow incoming requests as tasks in the List.']
    ] },
  { id: 'share', mod: 'm11', icon: 'lock', lesson: 'l11-2', lessons: ['l11-1', 'l11-2'],
    name: ['المشاركة والصلاحيات', 'Sharing & permissions'],
    one: ['تتحكم في من يرى العمل ومن يعدّله: الصلاحيات تُورَث من Space إلى ما بداخلها، ويمكن جعل أي موقع خاصاً أو مشاركة مهمة واحدة فقط.', 'You control who sees work and who can edit it: permissions are inherited from a Space down to what is inside it, and any location can be made private, or a single task shared.'],
    where: ['زر Share أعلى أي Space أو List أو مهمة.', 'The Share button at the top of any Space, List or task.'],
    why: [
      ['lock', ['المعلومات الحساسة تبقى لمن يحتاجها فقط.', 'Sensitive information stays with the people who need it.']],
      ['users', ['تشارك مع زميل أو ضيف دون كشف كل شيء.', 'Share with a colleague or guest without exposing everything.']],
      ['share', ['تضبطها مرة واحدة فتسري على ما بداخلها.', 'Set it once and it applies to everything inside.']]
    ],
    how: [
      ['افتح Share في الموقع المطلوب.', 'Open Share on the location you want.'],
      ['راجع من يستطيع الوصول ومستوى صلاحيته.', 'Check who has access and at what level.'],
      ['اجعل الموقع خاصاً (Private) عند الحاجة.', 'Make the location Private when needed.'],
      ['شارك مهمة بعينها بدلاً من القائمة كلها.', 'Share a single task instead of the whole List.']
    ] },
  { id: 'power', mod: 'm12', icon: 'sparkle', lesson: 'l12-1', lessons: ['l12-1', 'l12-2'],
    name: ['أدوات السرعة: البحث والقوالب والذكاء الاصطناعي', 'Power tools: search, templates & AI'],
    one: ['اعثر على أي شيء خلال ثوانٍ بالبحث وCtrl+K، وأعد استخدام العمل بالقوالب، واستعن بالذكاء الاصطناعي (ClickUp Brain) للتلخيص والكتابة، مع مراجعة النتيجة دائماً.', 'Find anything in seconds with search and Ctrl+K, reuse work with templates, and get help from AI (ClickUp Brain) to summarize and write, always reviewing the result.'],
    where: ['مربع البحث أعلى الشاشة، وCtrl+K (أو Cmd+K على Mac).', 'The search box at the top of the screen, and Ctrl+K (Cmd+K on Mac).'],
    why: [
      ['search', ['وصول فوري دون التنقل بين القوائم.', 'Instant access without clicking through Lists.']],
      ['template', ['القوالب تجعل العمل المتكرر جاهزاً بنقرة.', 'Templates make repeated work ready in one click.']],
      ['sparkle', ['الذكاء الاصطناعي يلخّص النقاشات الطويلة ويقترح الصياغة.', 'AI summarizes long threads and suggests wording.']]
    ],
    how: [
      ['اضغط Ctrl+K واكتب جزءاً من اسم ما تبحث عنه.', 'Press Ctrl+K and type part of what you are looking for.'],
      ['احفظ مهمة أو قائمة متكررة كقالب (Template).', 'Save a recurring task or List as a Template.'],
      ['اطلب من الذكاء الاصطناعي تلخيص مهمة طويلة، إن كان متاحاً لكم.', 'Ask AI to summarize a long task, if it is available to you.'],
      ['راجع نتيجة الذكاء الاصطناعي قبل مشاركتها.', 'Review any AI output before you share it.']
    ] }
];
const TOUR_PART = Object.fromEntries(TOUR_PARTS.map(p => [p.id, p]));

/* Questions Omantel employees typically ask when they start with ClickUp.
   Each answer names a lesson whose animated walkthrough plays inside the
   answer (demo), or a workshop to open (go), so people see it, not only
   read it. Examples are representative; real questions from the team can
   be added to this list. */
const CU_FAQ = [
  { id: 'start-where', part: 'start', demo: 'l1-2', q: ['حصلت على حساب ClickUp للتو. من أين أبدأ؟', 'I just got access to ClickUp. Where do I start?'],
    a: ['ابدأ من Home: تعرض المهام المسندة إليك مرتبة حسب الموعد، المتأخر أولاً ثم مهام اليوم. ثم افتح Space إدارتك من الشريط الجانبي.', 'Start from Home: it shows the tasks assigned to you by due date, overdue first, then today’s. Then open your department’s Space from the sidebar.'] },
  { id: 'my-tasks', part: 'start', demo: 'l1-2', q: ['كيف أرى المهام المسندة إليّ فقط؟', 'How do I see only the tasks assigned to me?'],
    a: ['في Home يجمع قسم My Work كل ما أُسند إليك من كل المساحات. وفي أي قائمة يمكنك إضافة مرشّح «المسند إليّ».', 'In Home, the My Work section gathers everything assigned to you from every Space. In any List you can also add an “Assigned to me” filter.'] },
  { id: 'notifs', part: 'start', demo: 'l1-3', q: ['تصلني إشعارات كثيرة جداً. كيف أتحكم بها؟', 'I get far too many notifications. How do I control them?'],
    a: ['في Inbox رد على المهم، وانقل إلى Later ما يحتاج وقتاً، وامسح ما انتهى. ومن إعدادات الإشعارات أوقف ما لا يهمك حتى تبرز الإشارات المهمة.', 'In Inbox, reply to what matters, move what needs time to Later and clear what is done. In notification settings, turn off what you don’t need so important mentions stand out.'] },
  { id: 'mobile', part: 'start', go: '#/tour/start', q: ['هل أستطيع متابعة مهامي من الجوال أثناء الزيارات الميدانية؟', 'Can I follow my tasks from my phone during site visits?'],
    a: ['نعم. تطبيق ClickUp للجوال على iOS وAndroid يعرض مهامك نفسها، ويمكنك التعليق وتغيير الحالة وإرفاق صورة من الموقع.', 'Yes. The ClickUp mobile app for iOS and Android shows the same tasks, and you can comment, change the status and attach a photo from the site.'] },
  { id: 'arabic', part: 'start', go: '#/tour/start', q: ['هل أستطيع العمل بالعربية في ClickUp؟', 'Can I work in Arabic in ClickUp?'],
    a: ['يمكنك كتابة أسماء المهام والتعليقات والمستندات بالعربية. أما لغة الواجهة فتُختار من إعداداتك الشخصية ضمن اللغات التي يدعمها ClickUp.', 'You can write task names, comments and Docs in Arabic. The interface language is chosen in your personal settings from the languages ClickUp supports.'] },
  { id: 'find-space', part: 'structure', demo: 'l2-1', q: ['لا أجد Space إدارتي. ماذا أفعل؟', 'I can’t find my department’s Space. What should I do?'],
    a: ['قد تكون المساحة خاصة ولم تُضف إليها بعد. اطلب من مالك المساحة أو مسؤول ClickUp في إدارتك إضافتك، ثم ستظهر في الشريط الجانبي.', 'The Space may be private and you haven’t been added yet. Ask the Space owner or your department’s ClickUp admin to add you; it will then appear in the sidebar.'] },
  { id: 'list-folder', part: 'structure', demo: 'l2-2', q: ['هل أنشئ List أم Folder لمشروعي الجديد؟', 'Should I create a List or a Folder for my new project?'],
    a: ['مشروع صغير بمرحلة واحدة تكفيه List. استخدم Folder عندما يضم المشروع عدة قوائم مترابطة، مثل التخطيط والتنفيذ والإغلاق.', 'A small project with one phase only needs a List. Use a Folder when the project has several related Lists, such as planning, delivery and closure.'] },
  { id: 'log-task', part: 'tasks', demo: 'l3-1', q: ['طلب مني مديري «سجّلها في ClickUp». كيف أنشئ مهمة صحيحة؟', 'My manager said “log it in ClickUp”. How do I create a proper task?'],
    a: ['افتح القائمة الصحيحة واضغط + Task، واكتب عنواناً يبدأ بفعل، ثم عيّن مسؤولاً وموعداً وأولوية، وأضف وصفاً قصيراً للنتيجة المطلوبة.', 'Open the right List and press + Task, write a title that starts with a verb, then set an assignee, a due date and a priority, and add a short description of the expected result.'] },
  { id: 'assign', part: 'tasks', demo: 'l3-2', q: ['كيف أسند مهمة لزميل وأحدد موعدها؟', 'How do I assign a task to a colleague and set its due date?'],
    a: ['داخل المهمة اضغط على المسؤول واختر اسم الزميل، ثم اضغط على تاريخ الاستحقاق واختر اليوم. يصله إشعار تلقائياً.', 'Inside the task, click the assignee and choose your colleague, then click the due date and pick the day. They are notified automatically.'] },
  { id: 'break-down', part: 'tasks', demo: 'l3-3', q: ['كيف أقسّم مهمة كبيرة إلى خطوات أصغر؟', 'How do I break a big task into smaller steps?'],
    a: ['استخدم المهام الفرعية للأجزاء التي لها مسؤول وموعد، وقائمة التحقق للبنود البسيطة التي تؤشر عليها بنفسك.', 'Use subtasks for parts with their own owner and date, and a checklist for simple items you tick off yourself.'] },
  { id: 'weekly-repeat', part: 'tasks', demo: 'l3-5', q: ['كيف أجعل مهمة التقرير الأسبوعي تتكرر كل أحد؟', 'How do I make the weekly report task repeat every Sunday?'],
    a: ['افتح المهمة واضغط على تاريخ الاستحقاق ثم اختر التكرار (Recurring) أسبوعياً يوم الأحد. عند إغلاقها تُنشأ النسخة التالية تلقائياً.', 'Open the task, click the due date, then set it to recur weekly on Sunday. When you close it, the next one is created automatically.'] },
  { id: 'follow-up', part: 'collab', demo: 'l6-1', q: ['كيف أتابع مع زميل دون إرسال بريد إلكتروني؟', 'How do I follow up with a colleague without sending an email?'],
    a: ['اكتب تعليقاً داخل المهمة وأشر إليه بـ @ واسمه. وإذا كان يحتاج إجراءً، أسند التعليق إليه فيظهر عنده كعمل مطلوب.', 'Write a comment on the task and @mention them. If it needs action, assign the comment to them so it shows up as work to do.'] },
  { id: 'minutes', part: 'collab', demo: 'l6-2', q: ['أين أضع محاضر الاجتماعات؟', 'Where should meeting minutes go?'],
    a: ['في Doc داخل Space الفريق، واربط القرارات بمهام حتى لا تضيع المتابعة. يمكنك إنشاء المهام من داخل المستند.', 'In a Doc inside the team’s Space, and link decisions to tasks so follow-ups don’t get lost. You can create tasks from inside the Doc.'] },
  { id: 'team-week', part: 'views', demo: 'l4-2', q: ['ما أسرع طريقة لأرى ما يعمل عليه فريقي هذا الأسبوع؟', 'What’s the fastest way to see what my team is working on this week?'],
    a: ['استخدم عرض Calendar لرؤية المواعيد، أو Workload لمعرفة حمل كل شخص، أو Board مجمّعاً حسب المسؤول.', 'Use Calendar view to see dates, Workload to see each person’s load, or Board grouped by assignee.'] },
  { id: 'urgent-filter', part: 'views', demo: 'l4-3', q: ['كيف أعرض المهام العاجلة أو المتأخرة فقط؟', 'How do I show only urgent or overdue tasks?'],
    a: ['اضغط Filter واختر Priority = Urgent، أو Due date = Overdue. احفظ العرض إن أردت الرجوع إليه يومياً.', 'Press Filter and choose Priority = Urgent, or Due date = Overdue. Save the view if you want to come back to it daily.'] },
  { id: 'region-field', part: 'fields', demo: 'l5-1', q: ['كيف نتابع أي فرع أو منطقة يخصها الطلب، مثل مسقط أو صلالة؟', 'How do we track which branch or region a request belongs to, such as Muscat or Salalah?'],
    a: ['أضف حقلاً مخصصاً من نوع Dropdown باسم «المنطقة» وخياراته. بعدها يمكنك التصفية والتجميع وبناء تقارير حسبه.', 'Add a Dropdown Custom Field called “Region” with its options. You can then filter, group and report by it.'] },
  { id: 'waiting', part: 'time', demo: 'l7-2', q: ['كيف أوضح أن مهمتي تنتظر فريقاً آخر؟', 'How do I show that my task is waiting on another team?'],
    a: ['أضف علاقة Waiting on تربط مهمتك بمهمة الفريق الآخر. إذا تأخرت مهمتهم يظهر الأثر على مهمتك وعلى الخط الزمني.', 'Add a Waiting on relationship linking your task to the other team’s task. If theirs slips, the effect shows on your task and on the timeline.'] },
  { id: 'log-time', part: 'time', demo: 'l7-1', q: ['كيف أسجّل الوقت الذي قضيته في مهمة؟', 'How do I log the time I spent on a task?'],
    a: ['شغّل مؤقت Track Time داخل المهمة أثناء العمل، أو أضف المدة يدوياً بعد الانتهاء.', 'Start the Track Time timer in the task while you work, or add the duration manually afterwards.'] },
  { id: 'weekly-report-auto', part: 'dash', demo: 'l8-1', q: ['يريد مديري تقريراً أسبوعياً عن التقدم. هل يعدّه ClickUp تلقائياً؟', 'My manager wants a weekly progress report. Can ClickUp prepare it automatically?'],
    a: ['نعم، ابنِ Dashboard ببطاقات مثل المهام حسب الحالة والمتأخر. تتحدث الأرقام وحدها، ويمكن مشاركة اللوحة مع مديرك.', 'Yes. Build a Dashboard with cards such as tasks by status and overdue work. The numbers update by themselves and you can share it with your manager.'] },
  { id: 'auto-move', part: 'auto', demo: 'l9-1', go: '#/automations', q: ['هل يستطيع ClickUp تذكير الناس أو نقل المهام تلقائياً؟', 'Can ClickUp remind people or move tasks automatically?'],
    a: ['نعم بالأتمتة: عندما يحدث شيء (Trigger) ينفّذ ClickUp إجراءً (Action)، مثل تعيين المراجع عند وصول المهمة إلى REVIEW.', 'Yes, with automations: when something happens (Trigger), ClickUp takes an action (Action), such as assigning the reviewer when a task reaches REVIEW.'] },
  { id: 'auto-stopped', part: 'auto', demo: 'l9-2', q: ['لماذا توقفت الأتمتة عن العمل؟', 'Why did my automation stop working?'],
    a: ['تحقق أنها مفعّلة، وأن الحدث يطابق Trigger تماماً، وأن الشروط متحققة، وأن مساحة العمل لم تبلغ حدها الشهري من الإجراءات.', 'Check it is on, that the event matches the Trigger exactly, that the conditions are true, and that the Workspace hasn’t reached its monthly action limit.'] },
  { id: 'requests-form', part: 'forms', demo: 'l10-1', q: ['كيف ترسل لنا الإدارات الأخرى طلباتها بطريقة موحدة؟', 'How can other departments send us requests in a standard way?'],
    a: ['أنشئ Form داخل قائمة الطلبات وشارك رابطه. كل إرسال يصبح مهمة بالحقول نفسها، فلا تضيع الطلبات في البريد.', 'Create a Form in your requests List and share its link. Each submission becomes a task with the same fields, so requests don’t get lost in email.'] },
  { id: 'kpi', part: 'forms', demo: 'l10-2', q: ['كيف نتابع مؤشر أداء أو مستهدفاً؟', 'How do we track a KPI or a target?'],
    a: ['استخدم Goals: حدد المستهدف بالأرقام واربطه بالمهام التي تحققه، فيتحدث التقدم تلقائياً.', 'Use Goals: set the target in numbers and link it to the tasks that achieve it, so progress updates automatically.'] },
  { id: 'vendor', part: 'share', demo: 'l11-2', q: ['هل أستطيع مشاركة مهمة مع مورّد أو مقاول من خارج Omantel؟', 'Can I share a task with a vendor or contractor outside Omantel?'],
    a: ['يمكن دعوة ضيف (Guest) إلى مهمة بعينها بصلاحيات محددة إذا سمحت الإعدادات. اتبع سياسة المؤسسة واستشر مسؤول النظام أولاً.', 'A Guest can be invited to one specific task with limited permissions if settings allow. Follow company policy and check with your admin first.'] },
  { id: 'private', part: 'share', demo: 'l11-1', q: ['من يستطيع رؤية مهامي الخاصة؟', 'Who can see my private tasks?'],
    a: ['الموقع الخاص (Private) يراه فقط من أضفته إليه، إضافة إلى المسؤولين بحسب إعدادات مساحة العمل. افتح Share لترى القائمة بالضبط.', 'A Private location is seen only by the people you add, plus admins depending on Workspace settings. Open Share to see exactly who has access.'] },
  { id: 'find-old', part: 'power', demo: 'l12-1', q: ['ما أسرع طريقة للعثور على مهمة أو مستند قديم؟', 'What’s the fastest way to find an old task or document?'],
    a: ['اضغط Ctrl+K (أو Cmd+K على Mac) واكتب جزءاً من الاسم، ثم ضيّق النتائج حسب النوع أو المسؤول.', 'Press Ctrl+K (Cmd+K on Mac) and type part of the name, then narrow the results by type or assignee.'] },
  { id: 'ai-summary', part: 'power', go: '#/workshops/ai', q: ['هل أستطيع استخدام الذكاء الاصطناعي لتلخيص نقاش طويل في مهمة؟', 'Can I use AI to summarize a long discussion in a task?'],
    a: ['نعم، إن كان ClickUp Brain متاحاً لكم: افتح المهمة واطلب ملخصاً، ثم راجعه قبل مشاركته.', 'Yes, if ClickUp Brain is available to you: open the task and ask for a summary, then review it before sharing.'] },
  { id: 'excel-import', part: 'power', go: '#/workshops/import', q: ['عندي ملف Excel لمتابعة المهام. هل أنقله إلى ClickUp؟', 'I track tasks in an Excel file. Can I move it into ClickUp?'],
    a: ['نعم، استورد الملف (CSV أو Excel) واربط كل عمود بحقل: الاسم، والمسؤول، والتاريخ، والحالة. جرّب أولاً بخمسة صفوف.', 'Yes. Import the file (CSV or Excel) and map each column to a field: name, assignee, date and status. Try five rows first.'] },
  { id: 'same-checklist', part: 'power', go: '#/workshops/templates', q: ['كيف أستخدم قائمة التحقق نفسها لكل طلب جديد؟', 'How do I reuse the same checklist for every new request?'],
    a: ['احفظ المهمة بقائمة تحققها كقالب (Template)، ثم أنشئ كل طلب جديد من القالب بنقرة.', 'Save the task with its checklist as a Template, then create each new request from it in one click.'] }
];
