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

/* The questions people ask most about ClickUp, grouped by app part. */
const CU_FAQ = [
  { part: 'start', q: ['ما هو ClickUp، ولماذا نستخدمه؟', 'What is ClickUp, and why do we use it?'],
    a: ['منصة لإدارة العمل يخطط فيها الفريق للمهام ويتابع تقدّمها ويتعاون في مكان واحد، بدلاً من توزيع العمل بين البريد والجداول والمحادثات. النتيجة: كل شخص يعرف ما المطلوب منه ومتى.', 'A work management platform where the team plans tasks, follows progress and collaborates in one place, instead of spreading work across email, spreadsheets and chats. The result: everyone knows what is expected of them and by when.'] },
  { part: 'start', q: ['من أين أبدأ كل يوم؟', 'Where should I start each day?'],
    a: ['من Home: تعرض المهام المسندة إليك مرتبة حسب التوقيت (المتأخر، ثم اليوم، ثم القادم). بعدها افتح Inbox لترى الإشارات والتعيينات الجديدة.', 'From Home: it shows the tasks assigned to you ordered by timing (overdue, today, then upcoming). Then open Inbox to see new mentions and assignments.'] },
  { part: 'start', q: ['كيف لا تفوتني الإشعارات المهمة؟', 'How do I stop missing important notifications?'],
    a: ['استخدم تبويبات Inbox: رد على ما يحتاج رداً، وانقل إلى Later ما يحتاج وقتاً، وامسح (Clear) ما انتهى. ومن إعدادات الإشعارات قلّل ما لا يهمك حتى تبرز الإشارات المهمة.', 'Use the Inbox tabs: reply to what needs an answer, move what needs time to Later, and Clear what is done. In your notification settings, turn down what does not matter so important mentions stand out.'] },
  { part: 'start', q: ['هل يمكنني استخدام ClickUp على الجوال؟', 'Can I use ClickUp on my phone?'],
    a: ['نعم. يتوفر ClickUp في المتصفح، وكتطبيق لسطح المكتب، وكتطبيق للجوال على iOS وAndroid، وكلها تعرض العمل نفسه.', 'Yes. ClickUp works in the browser, as a desktop app and as a mobile app for iOS and Android, and they all show the same work.'] },
  { part: 'structure', q: ['ما الفرق بين Space وFolder وList؟', 'What is the difference between a Space, a Folder and a List?'],
    a: ['Space قسم كبير لفريق أو إدارة. Folder اختياري يجمع قوائم مترابطة. List هي الحاوية التي تعيش فيها المهام. فكّر فيها كخزانة، ثم درج، ثم ملف.', 'A Space is a large area for a team or department. A Folder is optional and groups related Lists. A List is the container where tasks live. Think of a cabinet, a drawer and a file.'] },
  { part: 'structure', q: ['هل يجب أن أنشئ Folder دائماً؟', 'Do I always need a Folder?'],
    a: ['لا. يمكنك وضع القوائم مباشرة داخل Space. استخدم Folder فقط عندما تحتاج إلى جمع عدة قوائم مترابطة، مثل قوائم مشروع واحد.', 'No. You can put Lists directly inside a Space. Use a Folder only when you need to group several related Lists, such as the Lists of one project.'] },
  { part: 'tasks', q: ['ما الذي يجعل المهمة واضحة؟', 'What makes a task clear?'],
    a: ['عنوان يبدأ بفعل، ومسؤول واحد، وتاريخ استحقاق، وأولوية، وحالة محدّثة، ووصف قصير يوضح النتيجة المطلوبة.', 'A title that starts with a verb, one owner, a due date, a priority, an up-to-date status and a short description of the expected result.'] },
  { part: 'tasks', q: ['ما الفرق بين المهمة الفرعية وقائمة التحقق؟', 'What is the difference between a subtask and a checklist?'],
    a: ['المهمة الفرعية (Subtask) لها مسؤول وتاريخ وحالة مستقلة، فهي مناسبة لجزء يقوم به شخص آخر. قائمة التحقق (Checklist) بنود بسيطة داخل المهمة تؤشر عليها عند إنجازها.', 'A subtask has its own assignee, date and status, so it suits a part someone else does. A checklist is a set of simple items inside the task that you tick off as you go.'] },
  { part: 'tasks', q: ['هل يمكن إسناد مهمة إلى أكثر من شخص؟', 'Can a task have more than one assignee?'],
    a: ['نعم إذا كان خيار تعدد المسؤولين مفعّلاً في مساحة العمل. لكن الأفضل غالباً مسؤول واحد واضح، ومهام فرعية لمن يساعد.', 'Yes, if multiple assignees is turned on in the Workspace. Usually, though, one clear owner plus subtasks for helpers works best.'] },
  { part: 'tasks', q: ['ماذا تعني الحالات مثل TO DO وIN PROGRESS؟', 'What do statuses like TO DO and IN PROGRESS mean?'],
    a: ['الحالة تقول أين وصل العمل: TO DO لم يبدأ، وIN PROGRESS قيد العمل، وREVIEW ينتظر المراجعة، وCOMPLETE انتهى. قد تختلف أسماء الحالات من قائمة لأخرى بحسب إعداد الفريق.', 'The status says where the work stands: TO DO has not started, IN PROGRESS is being worked on, REVIEW is waiting for review and COMPLETE is done. Status names can differ between Lists depending on the team’s setup.'] },
  { part: 'views', q: ['أي طريقة عرض أستخدم؟', 'Which view should I use?'],
    a: ['List للتفاصيل والتحرير السريع، وBoard لتحريك العمل بين المراحل، وCalendar للمواعيد، وGantt للخط الزمني والاعتماديات، وTable لتحرير يشبه الجداول، وWorkload لمعرفة من عليه ضغط.', 'List for details and quick editing, Board to move work between stages, Calendar for dates, Gantt for timelines and dependencies, Table for spreadsheet-style editing, and Workload to see who is overloaded.'] },
  { part: 'views', q: ['إذا غيّرت مهمة في Board، هل تتغير في List؟', 'If I change a task in Board, does it change in List?'],
    a: ['نعم. طرق العرض عدسات مختلفة على المهام نفسها، فأي تغيير يظهر في كل العروض فوراً.', 'Yes. Views are different lenses on the same tasks, so any change shows up in every view straight away.'] },
  { part: 'views', q: ['هل تؤثر مرشّحاتي على زملائي؟', 'Do my filters affect my colleagues?'],
    a: ['المرشّح المؤقت يخصك وحدك. أما إذا حفظت التغيير على عرض مشترك فقد يراه الآخرون، لذلك أنشئ عرضاً خاصاً بك إن أردت إعداداتك الشخصية.', 'A temporary filter only affects you. If you save changes to a shared view, others may see them, so create your own view for personal settings.'] },
  { part: 'fields', q: ['متى أضيف حقلاً مخصصاً؟', 'When should I add a Custom Field?'],
    a: ['عندما يحتاج الفريق المعلومة نفسها في كل مهمة، ويريد التصفية بها أو قياسها، مثل الإدارة أو نوع الطلب أو المبلغ. لا تضف حقلاً لن يملأه أحد.', 'When the team needs the same piece of information on every task and wants to filter or measure it, such as department, request type or amount. Do not add a field nobody will fill in.'] },
  { part: 'collab', q: ['كيف أسأل زميلاً عن مهمة دون بريد إلكتروني؟', 'How do I ask a colleague about a task without email?'],
    a: ['اكتب تعليقاً داخل المهمة وأشر إليه بـ @ متبوعة باسمه، فيصله إشعار ويبقى النقاش بجانب العمل. وإذا كان يحتاج إجراءً فأسند التعليق إليه.', 'Write a comment on the task and @mention them, so they get a notification and the conversation stays next to the work. If it needs action, assign the comment to them.'] },
  { part: 'collab', q: ['ما فائدة Docs وWhiteboards؟', 'What are Docs and Whiteboards for?'],
    a: ['Docs لكتابة المستندات معاً، مثل محاضر الاجتماعات والأدلة، وربطها بالمهام. وWhiteboards لرسم الأفكار وتخطيطها بصرياً، ويمكن تحويل عناصرها إلى مهام.', 'Docs are for writing documents together, such as meeting notes and guides, and linking them to tasks. Whiteboards are for sketching and planning ideas visually, and items on them can be turned into tasks.'] },
  { part: 'time', q: ['ما هي الاعتمادية (Dependency)؟', 'What is a dependency?'],
    a: ['علاقة تقول إن مهمة تنتظر أخرى (Waiting on) أو تمنعها (Blocking). عندما تتأخر المهمة الأولى ترى فوراً ما يتأثر بها.', 'A relationship that says one task is waiting on another (Waiting on) or holding it up (Blocking). When the first task slips, you immediately see what is affected.'] },
  { part: 'time', q: ['كيف أرى ما هو متأخر؟', 'How do I see what is overdue?'],
    a: ['Home تعرض مهامك المتأخرة أولاً. وللفريق كله استخدم مرشّح تاريخ الاستحقاق في أي عرض، أو بطاقة المهام المتأخرة في Dashboard.', 'Home shows your overdue tasks first. For the whole team, use a due date filter in any view, or an overdue tasks card on a Dashboard.'] },
  { part: 'dash', q: ['ما هي Dashboard؟', 'What is a Dashboard?'],
    a: ['صفحة من البطاقات والرسوم تُحسب من المهام نفسها: عدد المهام حسب الحالة، والمتأخر، وعبء العمل، وغيرها. تتحدث تلقائياً كلما تغيّرت المهام.', 'A page of cards and charts calculated from the tasks themselves: tasks by status, overdue work, workload and more. It updates automatically as tasks change.'] },
  { part: 'dash', q: ['لماذا يبدو رقم في Dashboard غير صحيح؟', 'Why does a Dashboard number look wrong?'],
    a: ['غالباً بسبب مصدر البيانات أو المرشّحات: قد تقرأ البطاقة قائمة واحدة فقط، أو تستثني المهام المغلقة، أو مهاماً بلا تاريخ. راجع إعداد البطاقة قبل أن تستنتج.', 'Usually because of the data source or filters: the card may read only one List, exclude closed tasks, or skip tasks without a date. Check the card’s setup before drawing conclusions.'] },
  { part: 'auto', q: ['ما هي الأتمتة؟ أعطني مثالاً.', 'What is an Automation? Give me an example.'],
    a: ['قاعدة من ثلاثة أجزاء: Trigger ثم Condition اختياري ثم Action. مثال: عندما تتغير الحالة إلى REVIEW، عيّن سالم مراجعاً وأضف تعليقاً.', 'A rule in three parts: a Trigger, an optional Condition, then an Action. Example: when the status changes to REVIEW, assign Salim as reviewer and add a comment.'] },
  { part: 'auto', q: ['هل الأتمتة آمنة؟', 'Are Automations safe to use?'],
    a: ['نعم إذا جرّبتها أولاً على مهمة تجريبية وتأكدت من الشروط. انتبه إلى أن عدد مرات تشغيل الأتمتة قد يكون محدوداً بحسب خطة الاشتراك.', 'Yes, if you try them first on a sample task and check the conditions. Note that the number of automation runs can be limited depending on your plan.'] },
  { part: 'forms', q: ['كيف يرسل الناس طلبات دون رسائل متفرقة؟', 'How can people send requests without scattered messages?'],
    a: ['بنموذج Form: يملؤه صاحب الطلب، فيتحول كل إرسال إلى مهمة في List محددة وبالحقول التي تحتاجها.', 'With a Form: the requester fills it in, and each submission becomes a task in a specific List with the fields you need.'] },
  { part: 'forms', q: ['ما هي الأهداف (Goals)؟', 'What are Goals?'],
    a: ['طريقة لمتابعة مستهدفات قابلة للقياس، مثل عدد الطلبات المغلقة هذا الربع، وربطها بالمهام التي تحققها. قد يختلف اسمها وموضعها بحسب إصدار ClickUp.', 'A way to track measurable targets, such as requests closed this quarter, and link them to the tasks that achieve them. The name and location can vary by ClickUp version.'] },
  { part: 'share', q: ['من يستطيع رؤية القائمة التي أنشأتها؟', 'Who can see the List I created?'],
    a: ['بحسب إعدادات المشاركة: القوائم ترث صلاحيات Space أو Folder الذي توجد فيه، إلا إذا جعلتها خاصة (Private). افتح Share لترى من يملك الوصول بالضبط.', 'It depends on sharing: Lists inherit the permissions of the Space or Folder they are in, unless you make them Private. Open Share to see exactly who has access.'] },
  { part: 'share', q: ['هل يمكنني المشاركة مع شخص من خارج المؤسسة؟', 'Can I share with someone outside the organization?'],
    a: ['يمكن دعوة ضيوف (Guests) بصلاحيات محددة إذا سمحت إعدادات مساحة العمل وخطتها بذلك. اتبع سياسة مؤسستك واسأل مسؤول النظام أولاً.', 'Guests can be invited with limited permissions if your Workspace settings and plan allow it. Follow your organization’s policy and check with your admin first.'] },
  { part: 'power', q: ['ما أسرع طريقة للعثور على أي شيء؟', 'What is the fastest way to find anything?'],
    a: ['اضغط Ctrl+K (أو Cmd+K على Mac) واكتب جزءاً من الاسم، أو استخدم مربع البحث أعلى الشاشة وضيّق النتائج حسب النوع أو المسؤول.', 'Press Ctrl+K (Cmd+K on Mac) and type part of the name, or use the search box at the top and narrow results by type or assignee.'] },
  { part: 'power', q: ['ما هو ClickUp Brain (الذكاء الاصطناعي)؟', 'What is ClickUp Brain (AI)?'],
    a: ['مساعد ذكاء اصطناعي داخل ClickUp يلخّص المهام والنقاشات، ويساعد في الكتابة، ويجيب عن أسئلة حول العمل. يعتمد توفره على الخطة وإعدادات المسؤول، وراجع نتيجته دائماً قبل مشاركتها.', 'An AI assistant inside ClickUp that summarizes tasks and threads, helps you write and answers questions about your work. Availability depends on your plan and admin settings, and you should always review its output before sharing it.'] },
  { part: 'power', q: ['كيف أعيد استخدام عمل متكرر؟', 'How do I reuse work that repeats?'],
    a: ['احفظ المهمة أو القائمة كقالب (Template) لتنشئ نسخة جاهزة منها بنقرة، واستخدم المهام المتكررة (Recurring) لما يتكرر بموعد ثابت.', 'Save the task or List as a Template to create a ready copy in one click, and use recurring tasks for work that repeats on a fixed schedule.'] }
];
