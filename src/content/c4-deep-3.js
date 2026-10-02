/* ==========================================================================
   ClickUp 4.0 course, deep content part 3: communication, dashboards, import
   and export, templates, everyday pro tips, running the Workspace and
   automations. Menus can move between versions and plans. Fictional data.
   ========================================================================== */
const C4_TASK = () => ({ title: ['طلب تصاريح البلدية', 'Request municipality permits'], st: 'prog', who: ['khalid'], due: C4D(18), prio: 'normal' });
const C4_DASH = () => [{ k: 'd1', ty: 'num', t: ['مهام متأخرة', 'Overdue tasks'], v: '3', c: '#e03131' }, { k: 'd2', ty: 'bar', t: ['المهام حسب الحالة', 'Tasks by status'], v: [60, 40, 25, 80] }, { k: 'd3', ty: 'pie', t: ['المكتمل', 'Completed'], v: [55, 25] }];
const C4_CH = () => [{ k: 'ch1', n: ['إطلاق-الألياف', 'fibre-launch'], u: 2 }, { k: 'ch2', n: ['الشبكات', 'networks'] }, { k: 'ch3', n: ['عام', 'general'] }];

Object.assign(C4_DEEP, {
  /* ---------------- Communication ---------------- */
  comments: {
    more: ['التعليق داخل المهمة يجعل النقاش مرتبطاً بالعمل نفسه: من يفتح المهمة بعد شهر يجد القصة كاملة. اكتب @ ثم الاسم ليصل إشعار للشخص. وإذا كان التعليق طلباً يجب تنفيذه، أسنده (Assign comment) فيظهر عند الشخص كبند يجب حله، وعندما ينتهي يضغط Resolve. هكذا لا يضيع طلب صغير داخل نقاش طويل.', 'A comment inside the task ties the discussion to the work itself: whoever opens the task a month later finds the whole story. Type @ and a name to notify that person. If the comment is a request to act on, assign it (Assign comment) so it shows for the person as an item to resolve, and when they finish they click Resolve. That way a small request never gets lost in a long thread.'],
    like: ['مثل ملاحظة لاصقة على الملف نفسه، بدلاً من رسالة في هاتف شخص ما.', 'Like a sticky note on the file itself, instead of a message on someone’s phone.'],
    demo: { scene: 'task', steps: [
      { c: ['افتح المهمة واكتب في خانة التعليق.', 'Open the task and type in the comment box.'], ...C4_TASK(), comments: [], hl: 'cBox', click: true },
      { c: ['اكتب @ فتظهر قائمة الزملاء.', 'Type @ and the list of colleagues appears.'], mention: true, hl: 'mn-khalid', click: true },
      { c: ['اكتب طلبك لخالد.', 'Write your request to Khalid.'], hl: 'cBox', type: { k: 'cBox', x: ['@خالد هل أرسلت المخططات للبلدية؟', '@Khalid did you send the drawings to the municipality?'] } },
      { c: ['أرسله وأسنده لخالد ليصبح بنداً يجب حله.', 'Send it and assign it to Khalid so it becomes an item to resolve.'], cText: null, comments: [{ k: 'cm1', w: 'me', x: ['@خالد هل أرسلت المخططات للبلدية؟', '@Khalid did you send the drawings to the municipality?'], as: 'khalid' }], hl: 'cm1' },
      { c: ['خالد رد وضغط Resolve. النقاش محفوظ في المهمة للأبد.', 'Khalid replied and clicked Resolve. The discussion stays with the task forever.'], comments: [{ k: 'cm1', w: 'me', x: ['@خالد هل أرسلت المخططات للبلدية؟', '@Khalid did you send the drawings to the municipality?'], as: 'khalid', res: true }, { k: 'cm2', w: 'khalid', x: ['نعم، أُرسلت صباح اليوم.', 'Yes, sent this morning.'] }], hl: 'cm2' }
    ] },
    ex: ['مدقق داخلي احتاج سبب تغيير موعد مشروع قبل ثلاثة أشهر. وجده في تعليقات المهمة بالتاريخ والاسم، دون البحث في البريد.', 'An internal auditor needed the reason a project date changed three months ago. He found it in the task comments with date and name, without searching email.'],
    wrong: ['مناقشة تفاصيل المهمة في البريد ورسائل الهاتف.', 'Discussing task details in email and phone messages.'],
    right: ['ناقش داخل المهمة، وأسند التعليقات التي تحتاج إجراءً.', 'Discuss inside the task, and assign the comments that need action.'],
    quiz: { q: ['متى تسند تعليقاً لشخص؟', 'When do you assign a comment to someone?'], o: [['عندما يحتوي طلباً يجب تنفيذه', 'When it contains a request to act on'], ['في كل تعليق', 'On every comment'], ['عندما تريد حذفه', 'When you want to delete it']], a: 0, why: ['التعليق المسند يظهر كبند يجب حله حتى يُغلق.', 'An assigned comment shows as an item to resolve until it is closed.'] }
  },
  chat: {
    more: ['Chat في ClickUp يجمع المحادثات السريعة بجانب العمل: رسائل مباشرة بين الزملاء وقنوات للمواضيع. الفرق الكبير عن تطبيقات المحادثة العادية: الرسالة التي تحتوي طلباً تتحول إلى مهمة بنقرة، مرتبطة بالرسالة الأصلية. وتستطيع الرد في سلسلة (Thread) حتى لا يختلط النقاش. تذكّر: المحادثة للسرعة، والمهمة للالتزام.', 'ClickUp Chat brings quick conversations next to the work: direct messages between colleagues and channels for topics. The big difference from ordinary chat apps: a message containing a request turns into a task in one click, linked to the original message. You can reply in a thread so discussions do not get mixed up. Remember: chat is for speed, tasks are for commitment.'],
    like: ['مثل الحديث في ممر المكتب، لكن أي اتفاق يُكتب فوراً في دفتر المهام.', 'Like a chat in the office corridor, but any agreement is written straight into the task book.'],
    demo: { scene: 'chat', steps: [
      { c: ['قناة المشروع فيها نقاش سريع.', 'The project channel has a quick discussion.'], nav: 'chat', channels: C4_CH(), cur: 'ch1', head: ['# إطلاق-الألياف', '# fibre-launch'], msgs: [{ k: 'm1', w: 'maryam', x: ['الصباح الخير، كيف الوضع؟', 'Good morning, how are things?'] }, { k: 'm2', w: 'salim', x: ['نحتاج حجز رافعة ليوم الثلاثاء قبل نفاد المواعيد.', 'We need to book a crane for Tuesday before slots run out.'] }] },
      { c: ['رسالة سالم طلب حقيقي. افتح قائمة الرسالة.', 'Salim’s message is a real request. Open the message menu.'], hl: 'm2', click: true, menu: true },
      { c: ['اختر «Create task».', 'Choose “Create task”.'], menu: true, hl: 'mkTask', click: true },
      { c: ['أصبحت مهمة مرتبطة بالرسالة، ويمكن إسنادها وتحديد موعدها.', 'It became a task linked to the message, ready to assign and schedule.'], msgs: [{ k: 'm1', w: 'maryam', x: ['الصباح الخير، كيف الوضع؟', 'Good morning, how are things?'] }, { k: 'm2', w: 'salim', x: ['نحتاج حجز رافعة ليوم الثلاثاء قبل نفاد المواعيد.', 'We need to book a crane for Tuesday before slots run out.'], task: ['حجز الرافعة · سالم · الإثنين', 'Book the crane · Salim · Mon'] }], hl: 'm2', toast: ['تم إنشاء المهمة', 'Task created'] }
    ] },
    ex: ['في قناة الشبكات كتب مهندس «يجب تحديث شهادات الأمان قبل نهاية الشهر». حوّلتها المشرفة لمهمة بموعد، فلم تُنسَ كما كان يحدث سابقاً.', 'In the networks channel an engineer wrote “security certificates must be renewed before month end”. The supervisor turned it into a task with a date, so it was not forgotten as used to happen.'],
    wrong: ['الاتفاق على عمل في المحادثة ثم نسيانه بعد ساعة.', 'Agreeing on work in chat and forgetting it an hour later.'],
    right: ['أي رسالة فيها عمل له موعد ومسؤول: حوّلها إلى مهمة.', 'Any message with work, a deadline and an owner: turn it into a task.'],
    quiz: { q: ['ما الذي يميز Chat في ClickUp؟', 'What makes ClickUp Chat special?'], o: [['الملصقات الملونة', 'Colourful stickers'], ['تحويل الرسائل إلى مهام مرتبطة بها', 'Turning messages into linked tasks'], ['أنه لا يحفظ الرسائل', 'It does not keep messages']], a: 1, why: ['الرسالة تصبح مهمة فلا يضيع الطلب.', 'A message becomes a task, so the request is not lost.'] }
  },
  channels: {
    more: ['القناة غرفة نقاش دائمة لموضوع: مشروع، فريق، أو مبادرة. يمكن ربطها بمساحة أو قائمة فيرى أعضاؤها التحديثات المهمة. ثبّت الرسائل المرجعية (رابط الخطة، جدول الاجتماعات) أعلى القناة. قناة لكل مشروع تمنع تشتت النقاش في مجموعات كثيرة.', 'A Channel is a lasting discussion room for a topic: a project, a team or an initiative. It can be linked to a Space or List so its members see key updates. Pin reference messages (plan link, meeting schedule) at the top of the channel. One channel per project stops discussion scattering across many groups.'],
    like: ['مثل غرفة مشروع لها باب واحد ولوحة إعلانات مثبتة على الحائط.', 'Like a project room with one door and a notice board pinned to the wall.'],
    demo: { scene: 'chat', steps: [
      { c: ['اضغط «+ Channel» لإنشاء قناة جديدة.', 'Click “+ Channel” to create a new channel.'], nav: 'chat', channels: C4_CH().slice(1), cur: 'ch3', head: ['# عام', '# general'], msgs: [], hl: 'newCh', click: true },
      { c: ['سمّها باسم المشروع وأضف الأعضاء.', 'Name it after the project and add the members.'], channels: C4_CH(), cur: 'ch1', head: ['# إطلاق-الألياف', '# fibre-launch'], members: ['me', 'salim', 'maryam', 'khalid'], hl: 'chHead' },
      { c: ['اكتب رسالة مرجعية: رابط خطة المشروع.', 'Post a reference message: the project plan link.'], msgs: [{ k: 'm1', w: 'me', x: ['خطة المشروع: قائمة «التخطيط» في ClickUp', 'Project plan: the “Planning” List in ClickUp'] }], hl: 'm1', click: true, menu: true, menuStyle: 'top:110px;inset-inline-end:30px;width:190px' },
      { c: ['ثبّتها لتبقى في أعلى القناة للجميع.', 'Pin it so it stays at the top for everyone.'], menu: false, pinned: ['خطة المشروع', 'Project plan'], hl: 'pinned' }
    ] },
    ex: ['مشروع التحول الرقمي كان له 7 مجموعات محادثة. بعد دمجها في قناة واحدة مثبت فيها الخطة، أصبح الموظف الجديد يفهم المشروع في ساعة.', 'The digital transformation project had 7 chat groups. After merging them into one channel with the plan pinned, a new employee could understand the project in an hour.'],
    wrong: ['مجموعات كثيرة متداخلة لنفس المشروع.', 'Many overlapping groups for the same project.'],
    right: ['قناة واحدة للمشروع، مع رسائل مرجعية مثبتة.', 'One channel per project, with pinned reference messages.'],
    quiz: { q: ['لماذا تثبّت رسالة في القناة؟', 'Why pin a message in a channel?'], o: [['لتبقى المعلومة المرجعية ظاهرة للجميع', 'So the reference information stays visible to everyone'], ['لحذفها لاحقاً', 'To delete it later'], ['لإخفائها', 'To hide it']], a: 0, why: ['الرسائل المثبتة تبقى في الأعلى فلا تضيع.', 'Pinned messages stay at the top, so they do not get lost.'] }
  },
  teams: {
    more: ['الفريق (Team) في ClickUp مجموعة مسماة من الأشخاص، مثل «فريق الشبكات». بدلاً من إضافة 12 شخصاً واحداً واحداً، تشارك المساحة مع الفريق كله، أو تشير إليه في تعليق (@فريق_الشبكات)، أو تسند له مهمة. وعندما ينضم موظف جديد يكفي إضافته للفريق ليحصل على كل ما شُورك معه.', 'A Team in ClickUp is a named group of people, such as “Network team”. Instead of adding 12 people one by one, you share a Space with the whole team, mention it in a comment (@NetworkTeam) or assign it a task. When a new employee joins, adding them to the Team gives them everything shared with it.'],
    like: ['مثل قائمة بريد جماعية: تكتب لها مرة واحدة فتصل للجميع.', 'Like a group mailing list: you write to it once and it reaches everyone.'],
    demo: { scene: 'settings', steps: [
      { c: ['من إعدادات مساحة العمل افتح People.', 'In Workspace settings open People.'], page: 'people', members: [{ w: 'salim', r: 'Member' }, { w: 'maryam', r: 'Member' }, { w: 'khalid', r: 'Member' }], hl: 'm-people', click: true },
      { c: ['أنشئ فريقاً باسم «فريق الشبكات» وأضف الأعضاء.', 'Create a Team called “Network team” and add the members.'], hl: 'invite', click: true, inv: { l1: ['اسم الفريق', 'Team name'], l2: ['الأعضاء', 'Members'], b: 'Create team', e: ['فريق الشبكات', 'Network team'], r: ['3 أعضاء', '3 members'] } },
      { c: ['احفظ الفريق.', 'Save the Team.'], inv: { l1: ['اسم الفريق', 'Team name'], l2: ['الأعضاء', 'Members'], b: 'Create team', e: ['فريق الشبكات', 'Network team'], r: ['سالم، مريم، خالد', 'Salim, Maryam, Khalid'] }, hl: 'invGo', click: true },
      { c: ['الآن شارك أو أشر إلى الفريق كله دفعة واحدة.', 'Now share with or mention the whole team at once.'], inv: null, toast: ['تم إنشاء «فريق الشبكات»', '“Network team” created'] }
    ] },
    ex: ['عندما انضمت مهندسة جديدة لفريق الشبكات، أضافها المشرف للفريق فقط، فحصلت فوراً على المساحات والقنوات التي يحتاجها الفريق.', 'When a new engineer joined the network team, the supervisor just added her to the Team, and she instantly got the Spaces and channels the team uses.'],
    wrong: ['إضافة الأشخاص واحداً واحداً لكل مساحة وقناة.', 'Adding people one by one to every Space and channel.'],
    right: ['أنشئ فريقاً وشارك معه؛ الأعضاء الجدد يحصلون على كل شيء تلقائياً.', 'Create a Team and share with it; new members get everything automatically.'],
    quiz: { q: ['ما فائدة إنشاء فريق (Team) في ClickUp؟', 'What is the benefit of creating a Team in ClickUp?'], o: [['المشاركة مع مجموعة كاملة دفعة واحدة', 'Sharing with a whole group at once'], ['تغيير ألوان الواجهة', 'Changing interface colours'], ['حذف الأعضاء', 'Removing members']], a: 0, why: ['الفريق يجمع الأشخاص فتشاركهم وتشير إليهم مرة واحدة.', 'A Team groups people so you share with and mention them once.'] }
  },

  /* ---------------- Dashboards ---------------- */
  'dash-intro': {
    more: ['لوحة المعلومات شاشة تجيب عن أسئلة الإدارة دون اجتماع: كم مهمة متأخرة؟ أين يتكدس العمل؟ من مشغول أكثر؟ كم أنجزنا هذا الأسبوع؟ كل بطاقة تأخذ بياناتها من مكان تختاره (مساحة، مجلد، قائمة) وتتحدث تلقائياً. صمم اللوحة لجمهورها: لوحة المدير مختلفة عن لوحة الفريق.', 'A dashboard is a screen that answers management questions without a meeting: how many tasks are late? Where is work piling up? Who is busiest? How much did we finish this week? Each card takes its data from a place you choose (Space, Folder, List) and updates automatically. Design the dashboard for its audience: the manager’s dashboard differs from the team’s.'],
    like: ['مثل لوحة عدادات السيارة: نظرة واحدة تخبرك بالسرعة والوقود والتحذيرات.', 'Like a car dashboard: one glance tells you speed, fuel and warnings.'],
    demo: { scene: 'dash', steps: [
      { c: ['من Dashboards أنشئ لوحة جديدة للمشروع.', 'From Dashboards create a new dashboard for the project.'], nav: 'dash', cards: [], hl: 'addCard', click: true },
      { c: ['أضف بطاقة رقم: «المهام المتأخرة».', 'Add a number card: “Overdue tasks”.'], menu: true, hl: 'ct-num', click: true },
      { c: ['البطاقة تعرض الرقم مباشرة من القائمة.', 'The card shows the number straight from the List.'], cards: C4_DASH().slice(0, 1), hl: 'd1' },
      { c: ['أضف رسماً للمهام حسب الحالة، ودائرة للمكتمل.', 'Add a chart of tasks by status, and a pie for completed work.'], cards: C4_DASH(), hl: 'd2' },
      { c: ['اللوحة تتحدث تلقائياً كلما تغيرت المهام.', 'The dashboard updates automatically whenever tasks change.'], cards: [{ k: 'd1', ty: 'num', t: ['مهام متأخرة', 'Overdue tasks'], v: '1', c: '#e03131' }, { k: 'd2', ty: 'bar', t: ['المهام حسب الحالة', 'Tasks by status'], v: [40, 45, 20, 95] }, { k: 'd3', ty: 'pie', t: ['المكتمل', 'Completed'], v: [70, 15] }], hl: 'd1' }
    ] },
    ex: ['مدير العمليات كان يطلب تقريراً مكتوباً كل أحد. الآن يفتح اللوحة صباح الأحد ويرى كل شيء، وتفرغ الفريق لعمله.', 'The operations manager used to ask for a written report every Sunday. Now he opens the dashboard on Sunday morning and sees everything, and the team is free to work.'],
    wrong: ['لوحة بـ 20 بطاقة لا يقرأها أحد.', 'A dashboard with 20 cards that nobody reads.'],
    right: ['3 إلى 6 بطاقات تجيب عن أهم الأسئلة لجمهور اللوحة.', 'Three to six cards that answer the audience’s top questions.'],
    quiz: { q: ['من أين تأخذ بطاقات لوحة المعلومات بياناتها؟', 'Where do dashboard cards get their data?'], o: [['من المساحات والقوائم التي تختارها', 'From the Spaces and Lists you choose'], ['تكتبها يدوياً كل أسبوع', 'You type it in by hand every week'], ['من الإنترنت', 'From the internet']], a: 0, why: ['البطاقات مرتبطة بالمهام وتتحدث تلقائياً.', 'Cards are linked to tasks and update automatically.'] }
  },
  'dash-template': {
    more: ['قوالب اللوحات تعطيك تصميماً جاهزاً لحالات شائعة: إدارة مشروع، أداء فريق، مبيعات، دعم فني. تختار القالب، وتحدد مصدر البيانات (مساحتك أو قائمتك)، فتمتلئ البطاقات ببياناتك فوراً. بعدها احذف ما لا تحتاجه وعدّل العناوين لتناسب لغة فريقك.', 'Dashboard templates give you a ready design for common cases: project management, team performance, sales, IT support. You pick a template and set the data source (your Space or List), and the cards fill with your data at once. Then delete what you do not need and rename cards to suit your team’s language.'],
    like: ['مثل شراء أثاث جاهز للتركيب بدلاً من صنعه من الخشب.', 'Like buying ready-to-assemble furniture instead of making it from raw wood.'],
    demo: { scene: 'dash', steps: [
      { c: ['أنشئ لوحة واختر «من قالب».', 'Create a dashboard and choose “From template”.'], nav: 'dash', cards: [], gallery: [{ k: 'tg1', ic: 'gantt', n: ['إدارة مشروع', 'Project management'] }, { k: 'tg2', ic: 'users', n: ['أداء الفريق', 'Team performance'] }, { k: 'tg3', ic: 'help', n: ['الدعم الفني', 'IT support'] }], hl: 'tg1', click: true },
      { c: ['اختر مصدر البيانات: مجلد «إطلاق الألياف».', 'Choose the data source: the “Fibre launch” Folder.'], gallery: null, toast: ['المصدر: إطلاق الألياف - صلالة', 'Source: Fibre launch - Salalah'] },
      { c: ['البطاقات امتلأت ببيانات مشروعك فوراً.', 'The cards filled with your project’s data immediately.'], cards: C4_DASH().concat([{ k: 'd4', ty: 'list', t: ['أقرب المواعيد', 'Next deadlines'], v: [['التصاريح · 18 أكتوبر', 'Permits · Oct 18'], ['التمديد · 23 أكتوبر', 'Installation · Oct 23']] }]), title: ['لوحة إطلاق الألياف', 'Fibre launch dashboard'], hl: 'd4' },
      { c: ['احذف ما لا تحتاجه وعدّل العناوين.', 'Delete what you do not need and rename the cards.'], cards: C4_DASH().concat([{ k: 'd4', ty: 'list', t: ['المواعيد القادمة', 'Coming up'], v: [['التصاريح · 18 أكتوبر', 'Permits · Oct 18'], ['التمديد · 23 أكتوبر', 'Installation · Oct 23']] }]), hl: 'd4' }
    ] },
    ex: ['فريق الدعم الفني بدأ بقالب «الدعم» وخلال 15 دقيقة كانت لديه لوحة تعرض الطلبات المفتوحة ومتوسط وقت الإغلاق.', 'The IT support team started from the support template and in 15 minutes had a dashboard showing open tickets and average time to close.'],
    wrong: ['بناء كل بطاقة من الصفر بينما يوجد قالب مناسب.', 'Building every card from scratch when a suitable template exists.'],
    right: ['ابدأ بقالب، ثم عدّل وحذف حتى يناسب فريقك.', 'Start from a template, then edit and trim until it fits your team.'],
    quiz: { q: ['ما الخطوة الأهم بعد اختيار قالب لوحة؟', 'What is the key step after choosing a dashboard template?'], o: [['تحديد مصدر البيانات (مساحتك أو قائمتك)', 'Setting the data source (your Space or List)'], ['طباعته', 'Printing it'], ['تغيير اللغة', 'Changing the language']], a: 0, why: ['القالب يحتاج أن يعرف من أين يقرأ بياناتك.', 'The template needs to know where to read your data from.'] }
  },
  'dash-more': {
    more: ['للوحات قدرات تجعلها أداة تحليل: فلتر على مستوى اللوحة كلها (مثل «هذا الأسبوع» أو «سالم»)، وبطاقات حسابية تجمع أو تحسب متوسط حقل رقمي (مثل التكلفة)، وبطاقات تتبع الوقت والأهداف، ومشاركة اللوحة أو إرسالها بالبريد دورياً حسب الخطة. والأهم: كل رقم قابل للنقر لترى المهام خلفه، فتتأكد قبل أن تستنتج.', 'Dashboards have abilities that make them an analysis tool: a filter for the whole dashboard (such as “this week” or “Salim”), calculation cards that sum or average a number field (such as cost), time-tracking and goal cards, and sharing the dashboard or emailing it on a schedule depending on the plan. Most importantly, every number is clickable to see the tasks behind it, so you check before you conclude.'],
    like: ['مثل كشف حساب البنك: الرقم في الأعلى، والعمليات خلفه بالتفصيل.', 'Like a bank statement: the total at the top, and the transactions behind it in detail.'],
    demo: { scene: 'dash', steps: [
      { c: ['أضف بطاقة حسابية لمجموع التكلفة.', 'Add a calculation card for the total cost.'], nav: 'dash', cards: C4_DASH(), hl: 'addCard', click: true, menu: true },
      { c: ['البطاقة تجمع حقل «التكلفة» من كل المهام.', 'The card sums the “Cost” field across all tasks.'], cards: C4_DASH().concat([{ k: 'd5', ty: 'num', t: ['مجموع التكلفة (ر.ع)', 'Total cost (OMR)'], v: '5,500', c: '#0ca678' }]), hl: 'd5' },
      { c: ['طبّق فلتراً للوحة كلها: «هذا الأسبوع».', 'Apply a whole-dashboard filter: “This week”.'], hl: 'dFilter', click: true, filter: ['هذا الأسبوع', 'This week'], cards: [{ k: 'd1', ty: 'num', t: ['مهام متأخرة', 'Overdue tasks'], v: '1', c: '#e03131' }, { k: 'd2', ty: 'bar', t: ['المهام حسب الحالة', 'Tasks by status'], v: [30, 20, 10, 40] }, { k: 'd3', ty: 'pie', t: ['المكتمل', 'Completed'], v: [40, 30] }, { k: 'd5', ty: 'num', t: ['مجموع التكلفة (ر.ع)', 'Total cost (OMR)'], v: '1,200', c: '#0ca678' }] },
      { c: ['شارك اللوحة مع مديرك.', 'Share the dashboard with your manager.'], hl: 'dShare', click: true, toast: ['تمت مشاركة اللوحة مع مريم', 'Dashboard shared with Maryam'] }
    ] },
    ex: ['المديرة لاحظت أن رقم المتأخرات قفز إلى 9. نقرت عليه فوجدت أن 6 منها مهام قديمة نسي أحدهم إغلاقها، وليست تأخيرات حقيقية.', 'The manager saw the overdue count jump to 9. She clicked it and found 6 were old tasks someone forgot to close, not real delays.'],
    wrong: ['اتخاذ قرار من رقم في اللوحة دون التحقق من المهام خلفه.', 'Making a decision from a dashboard number without checking the tasks behind it.'],
    right: ['انقر الرقم وراجع المهام، ثم قرر.', 'Click the number, review the tasks, then decide.'],
    quiz: { q: ['ماذا تفعل قبل الاستنتاج من رقم في اللوحة؟', 'What do you do before drawing a conclusion from a dashboard number?'], o: [['تنقر عليه وتراجع المهام خلفه', 'Click it and review the tasks behind it'], ['تحذف البطاقة', 'Delete the card'], ['تتجاهله', 'Ignore it']], a: 0, why: ['الرقم قد يشمل مهاماً لم تُحدّث؛ التحقق يمنع القرارات الخاطئة.', 'The number may include tasks that were not updated; checking prevents wrong decisions.'] }
  },

  /* ---------------- Import and export ---------------- */
  export: {
    more: ['التصدير يأخذ ما تراه في العرض الحالي (بأعمدته وفلاتره) ويحفظه كملف CSV أو Excel. لذلك جهّز العرض أولاً: الأعمدة التي تحتاجها، والفلتر المناسب. وانتبه: الملف بعد خروجه لا تحميه صلاحيات ClickUp، فلا ترسله لمن لا يحق له، واتبع سياسة الشركة في مشاركة البيانات.', 'Export takes what you see in the current view (with its columns and filters) and saves it as a CSV or Excel file. So prepare the view first: the columns you need and the right filter. And be careful: once the file leaves, ClickUp permissions no longer protect it, so do not send it to anyone not entitled to it, and follow company policy on sharing data.'],
    like: ['مثل طباعة صفحة: تطبع ما يظهر على الشاشة، فرتّبها قبل الطباعة.', 'Like printing a page: you print what is on screen, so tidy it before printing.'],
    demo: { scene: 'file', steps: [
      { c: ['جهّز العرض: الأعمدة المطلوبة فقط.', 'Prepare the view: only the columns you need.'], stage: 'list', rows: C4_FIB(), cols: ['assignee', 'due', 'region'] },
      { c: ['افتح قائمة الخيارات (···) واختر Export.', 'Open the options menu (···) and choose Export.'], hl: 'more', click: true, exp: true },
      { c: ['اختر Excel.', 'Choose Excel.'], exp: true, hl: 'fmt-xlsx', click: true },
      { c: ['الملف جاهز للتنزيل بنفس الأعمدة والفلاتر.', 'The file is ready to download with the same columns and filters.'], exp: true, file: 'planning-view.xlsx', hl: 'file' }
    ] },
    ex: ['المالية تطلب كل شهر قائمة بالمهام وتكاليفها. المحاسب يفتح عرضاً محفوظاً ويصدره إلى Excel في 30 ثانية.', 'Finance asks every month for a list of tasks and their costs. The accountant opens a saved view and exports it to Excel in 30 seconds.'],
    wrong: ['إرسال ملف تصدير فيه بيانات عملاء عبر بريد شخصي.', 'Sending an export file with customer data through personal email.'],
    right: ['صدّر فقط ما يحتاجه المستلم، وشاركه عبر قنوات الشركة المعتمدة.', 'Export only what the recipient needs, and share it through approved company channels.'],
    quiz: { q: ['ماذا يُصدَّر عند الضغط على Export؟', 'What gets exported when you click Export?'], o: [['كل مساحة العمل', 'The whole Workspace'], ['ما يظهر في العرض الحالي بأعمدته وفلاتره', 'What the current view shows, with its columns and filters'], ['المهام المحذوفة', 'Deleted tasks']], a: 1, why: ['التصدير يتبع العرض، فرتّبه أولاً.', 'Export follows the view, so set it up first.'] }
  },
  import: {
    more: ['الاستيراد ينقل عملك الموجود إلى ClickUp دون نسخ يدوي. من Excel/CSV: جهّز الملف (صف عناوين، عمود لكل حقل، تواريخ بصيغة واحدة)، ثم طابق كل عمود مع حقل ClickUp المناسب: الاسم، المسؤول، الموعد، الحالة، أو حقل مخصص. ومن أدوات أخرى (Trello، Asana، Jira) توجد أدوات استيراد جاهزة. جرّب دائماً على عينة صغيرة أولاً.', 'Import moves your existing work into ClickUp without retyping. From Excel/CSV: prepare the file (a header row, one column per field, dates in one format), then map each column to the right ClickUp field: name, assignee, due date, status or a Custom Field. From other tools (Trello, Asana, Jira) there are ready importers. Always test on a small sample first.'],
    like: ['مثل الانتقال لبيت جديد: ترتّب الصناديق وتكتب على كل صندوق لأي غرفة يذهب.', 'Like moving house: you sort the boxes and label each one with the room it goes to.'],
    demo: { scene: 'file', steps: [
      { c: ['هذا ملف Excel فيه طلباتك الحالية.', 'This is an Excel file with your current requests.'], stage: 'sheet', sheet: [[['المهمة', 'Task'], ['المسؤول', 'Owner'], ['الموعد', 'Due'], ['المنطقة', 'Region']], [['صيانة برج 4', 'Tower 4 maintenance'], ['سالم', 'Salim'], '20/10/2026', ['صحار', 'Sohar']], [['فحص المولد', 'Generator check'], ['خالد', 'Khalid'], '22/10/2026', ['صلالة', 'Salalah']]], hl: 'xl' },
      { c: ['في الإعدادات افتح Import واختر Excel / CSV.', 'In settings open Import and choose Excel / CSV.'], stage: 'source', hl: 'src-xlsx', click: true },
      { c: ['طابق كل عمود مع حقل ClickUp.', 'Map each column to a ClickUp field.'], stage: 'map', map: [[['المهمة', 'Task'], 'Task name', true], [['المسؤول', 'Owner'], 'Assignee', true], [['الموعد', 'Due'], 'Due date', true], [['المنطقة', 'Region'], ['المنطقة (Dropdown)', 'Region (Dropdown)'], false]], hl: 'mp1' },
      { c: ['اكتملت المطابقة. اضغط Import.', 'Mapping complete. Click Import.'], map: [[['المهمة', 'Task'], 'Task name', true], [['المسؤول', 'Owner'], 'Assignee', true], [['الموعد', 'Due'], 'Due date', true], [['المنطقة', 'Region'], ['المنطقة (Dropdown)', 'Region (Dropdown)'], true]], hl: 'impGo', click: true },
      { c: ['أصبحت الصفوف مهاماً حقيقية في القائمة.', 'The rows became real tasks in the List.'], stage: 'list', rows: [C4R('i1', ['صيانة برج 4', 'Tower 4 maintenance'], { who: 'salim', due: C4D(20), region: ['صحار', 'Sohar'] }), C4R('i2', ['فحص المولد', 'Generator check'], { who: 'khalid', due: C4D(22), region: ['صلالة', 'Salalah'] })], cols: ['assignee', 'due', 'region'], toast: ['تم استيراد صفين', '2 rows imported'] }
    ] },
    ex: ['قسم المرافق نقل سجل 300 طلب من Excel. جرّبوا 10 صفوف أولاً فاكتشفوا أن التواريخ بصيغتين، صححوها، ثم استوردوا الباقي دون أخطاء.', 'Facilities moved a 300-request log from Excel. They tried 10 rows first, found dates in two formats, fixed them, then imported the rest with no errors.'],
    wrong: ['استيراد 1000 صف مباشرة دون تجربة.', 'Importing 1,000 rows straight away without a test.'],
    right: ['نظّف الملف، جرّب على 10 صفوف، ثم استورد الباقي.', 'Clean the file, test on 10 rows, then import the rest.'],
    quiz: { q: ['ما الخطوة التي تربط أعمدة Excel بحقول ClickUp؟', 'Which step connects Excel columns to ClickUp fields?'], o: [['المطابقة (Mapping)', 'Mapping'], ['التصدير', 'Exporting'], ['الأرشفة', 'Archiving']], a: 0, why: ['المطابقة تخبر ClickUp أين يضع كل عمود.', 'Mapping tells ClickUp where each column goes.'] }
  },

  /* ---------------- Templates ---------------- */
  'tpl-intro': {
    more: ['القالب يحفظ «شكل» العمل ليُعاد استخدامه: قائمة بمراحلها وحالاتها وحقولها، أو مهمة بقائمة تحققها ومهامها الفرعية، أو مستند بتنسيقه، أو لوحة بطاقاتها. مركز القوالب فيه قوالب جاهزة من ClickUp وقوالب فريقك. القوالب توحّد طريقة العمل: كل مشروع يبدأ بنفس الجودة.', 'A template saves the “shape” of work for reuse: a List with its stages, statuses and fields, a task with its checklist and subtasks, a Doc with its layout, or a dashboard with its cards. The Template Center has ready templates from ClickUp and your team’s own. Templates standardise the way you work: every project starts at the same quality.'],
    like: ['مثل قالب الكعك: كل كعكة تخرج بنفس الشكل الجميل.', 'Like a cake mould: every cake comes out with the same nice shape.'],
    demo: { scene: 'templates', steps: [
      { c: ['اضغط «+» ثم Templates لفتح مركز القوالب.', 'Click “+” then Templates to open the Template Center.'], cards: [{ k: 'tp1', n: ['إدارة مشروع', 'Project management'], ic: 'gantt', c: '#7b68ee', d: ['قائمة ومراحل وحالات', 'List, stages, statuses'] }, { k: 'tp2', n: ['طلبات تقنية المعلومات', 'IT requests'], ic: 'help', c: '#0ea5e9', d: ['نموذج وقائمة طلبات', 'Form and request List'] }, { k: 'tp3', n: ['تهيئة موظف جديد', 'Employee onboarding'], ic: 'users', c: '#10b981', d: ['قائمة تحقق لكل أسبوع', 'Checklist per week'] }, { k: 'tp4', n: ['محضر اجتماع', 'Meeting minutes'], ic: 'doc', c: '#e8590c', d: ['Doc منسق', 'Formatted Doc'] }, { k: 'tp5', n: ['لوحة أداء الفريق', 'Team dashboard'], ic: 'chart', c: '#ec4899', d: ['بطاقات جاهزة', 'Ready cards'] }, { k: 'tp6', n: ['خطة حملة', 'Campaign plan'], ic: 'rocket', c: '#a855f7', d: ['جدول زمني', 'Timeline'] }], hl: 'tp1' },
      { c: ['صفِّ حسب الفئة: IT.', 'Filter by category: IT.'], cat: 'IT', hl: 'cat-IT', click: true, cards: [{ k: 'tp2', n: ['طلبات تقنية المعلومات', 'IT requests'], ic: 'help', c: '#0ea5e9', d: ['نموذج وقائمة طلبات', 'Form and request List'] }] },
      { c: ['انقر القالب لمعاينة ما يحتويه.', 'Click the template to preview what it contains.'], preview: 'tp2', hl: 'tp2', click: true },
      { c: ['المعاينة تريك القوائم والحالات والنموذج قبل الاستخدام.', 'The preview shows the Lists, statuses and form before you use it.'], dlg: { t: ['طلبات تقنية المعلومات', 'IT requests'], n: ['طلبات IT - صلالة', 'IT requests - Salalah'], opts: [[['قائمة الطلبات', 'Requests List'], true], [['نموذج الطلب', 'Request form'], true], [['الحالات', 'Statuses'], true]] }, hl: 'dlg' }
    ] },
    ex: ['كل فروع الشركة بدأت تستخدم قالب «تهيئة موظف جديد»، فأصبح كل موظف جديد يمر بنفس الخطوات ولا تُنسى البطاقة أو البريد أو التدريب.', 'Every branch started using the “Employee onboarding” template, so every new hire goes through the same steps and nobody forgets the badge, email or training.'],
    wrong: ['بناء نفس قائمة المشروع يدوياً في كل مرة.', 'Building the same project List by hand every time.'],
    right: ['ابحث في مركز القوالب أولاً، أو احفظ أفضل مشروع كقالب.', 'Look in the Template Center first, or save your best project as a template.'],
    quiz: { q: ['ما الفائدة الأساسية للقوالب؟', 'What is the main benefit of templates?'], o: [['توحيد طريقة العمل وتوفير الوقت', 'Standardising work and saving time'], ['تغيير الألوان', 'Changing colours'], ['حذف المهام القديمة', 'Deleting old tasks']], a: 0, why: ['القالب يجعل كل بداية جديدة بنفس الجودة والسرعة.', 'A template makes every new start the same quality and speed.'] }
  },
  'tpl-use': {
    more: ['عند استخدام قالب تختار ثلاثة أشياء: أين يوضع (مساحة، مجلد، قائمة)، والاسم الجديد، وماذا يُنسخ: المهام، المهام الفرعية، المسؤولون، التواريخ، المرفقات. خيار مهم: «إعادة جدولة التواريخ» لتبدأ المواعيد من اليوم بدلاً من تواريخ المشروع القديم. وبعد الاستخدام راجع المسؤولين، فقد يحمل القالب أسماء من مشروع سابق.', 'When using a template you choose three things: where it goes (Space, Folder, List), the new name, and what to copy: tasks, subtasks, assignees, dates, attachments. One important option: “remap dates” so due dates start from today instead of the old project’s dates. After using it, check the assignees, because the template may carry names from a previous project.'],
    like: ['مثل نسخ وصفة لعدد ضيوف مختلف: تضبط الكميات (التواريخ) قبل الطبخ.', 'Like copying a recipe for a different number of guests: you adjust the amounts (dates) before cooking.'],
    demo: { scene: 'templates', steps: [
      { c: ['اختر قالب «إدارة مشروع» واضغط Use template.', 'Pick the “Project management” template and click Use template.'], cards: [{ k: 'tp1', n: ['إدارة مشروع', 'Project management'], ic: 'gantt', c: '#7b68ee', d: ['قائمة ومراحل وحالات', 'List, stages, statuses'] }, { k: 'tp3', n: ['تهيئة موظف جديد', 'Employee onboarding'], ic: 'users', c: '#10b981', d: ['قائمة تحقق لكل أسبوع', 'Checklist per week'] }], preview: 'tp1', hl: 'tp1', click: true },
      { c: ['سمِّ المشروع الجديد.', 'Name the new project.'], dlg: { t: ['استخدام القالب', 'Use template'], n: '', opts: [[['المهام والمهام الفرعية', 'Tasks and subtasks'], true], [['المسؤولون', 'Assignees'], false], [['إعادة جدولة التواريخ من اليوم', 'Remap dates from today'], false]] }, hl: 'dName', click: true, type: { k: 'dName', x: ['إطلاق الألياف - صحار', 'Fibre launch - Sohar'] } },
      { c: ['فعّل «إعادة جدولة التواريخ من اليوم».', 'Turn on “Remap dates from today”.'], dlg: { t: ['استخدام القالب', 'Use template'], n: ['إطلاق الألياف - صحار', 'Fibre launch - Sohar'], opts: [[['المهام والمهام الفرعية', 'Tasks and subtasks'], true], [['المسؤولون', 'Assignees'], false], [['إعادة جدولة التواريخ من اليوم', 'Remap dates from today'], true]] }, hl: 'op2', click: true },
      { c: ['اضغط Use template. مشروع كامل جاهز خلال ثوانٍ.', 'Click Use template. A complete project is ready in seconds.'], hl: 'dlgGo', click: true },
      { c: ['راجع المسؤولين وأسند المهام للفريق الجديد.', 'Check the assignees and assign tasks to the new team.'], dlg: null, toast: ['تم إنشاء «إطلاق الألياف - صحار»', '“Fibre launch - Sohar” created'] }
    ] },
    ex: ['بعد نجاح مشروع صلالة، أطلق الفريق مشروع صحار من نفس القالب في دقيقتين، وكل المراحل والحالات جاهزة.', 'After the Salalah project succeeded, the team launched the Sohar project from the same template in two minutes, with every stage and status ready.'],
    wrong: ['استخدام القالب بتواريخه القديمة فتظهر كل المهام متأخرة.', 'Using the template with its old dates so every task shows as late.'],
    right: ['فعّل إعادة جدولة التواريخ، وراجع المسؤولين بعد الإنشاء.', 'Turn on date remapping, and check assignees after creating.'],
    quiz: { q: ['لماذا تفعّل «إعادة جدولة التواريخ»؟', 'Why turn on “remap dates”?'], o: [['لتبدأ المواعيد من اليوم لا من المشروع القديم', 'So dates start from today, not the old project'], ['لحذف التواريخ', 'To delete the dates'], ['لتغيير اللغة', 'To change the language']], a: 0, why: ['بدونها تبقى تواريخ المشروع القديم فتظهر المهام متأخرة.', 'Without it the old dates remain and tasks show as late.'] }
  },
  'tpl-save': {
    more: ['أفضل القوالب تأتي من عمل نجح فعلاً. عندما تنتهي من مشروع أو تكتمل قائمة بشكل ممتاز، احفظها كقالب: من قائمة النقاط اختر Templates ثم Save as template. سمّه بوضوح، واكتب وصفاً قصيراً (متى يُستخدم ولمن)، واختر ما يُحفظ. شاركه مع الفريق، وحدّثه عندما تتحسن طريقتكم.', 'The best templates come from work that actually succeeded. When you finish a project or a List turns out great, save it as a template: from the ellipsis menu choose Templates, then Save as template. Name it clearly, write a short description (when to use it and for whom), and choose what to keep. Share it with the team, and update it as your way of working improves.'],
    like: ['مثل كتابة الطبق الناجح في دفتر وصفات العائلة لتطبخه الأجيال القادمة.', 'Like writing a successful dish into the family recipe book for the next generation.'],
    demo: { scene: 'templates', steps: [
      { c: ['قائمة «طلبات الصيانة» تعمل بشكل ممتاز. احفظها كقالب.', 'The “Maintenance requests” List works great. Save it as a template.'], cards: [], dlg: { t: ['حفظ كقالب', 'Save as template'], n: '', opts: [[['الحالات والحقول', 'Statuses and fields'], true], [['المهام الحالية', 'Current tasks'], false], [['الأتمتة', 'Automations'], true]], b: 'Save template' }, hl: 'dName', click: true, type: { k: 'dName', x: ['قائمة طلبات الصيانة - قياسية', 'Maintenance requests - standard'] } },
      { c: ['احفظ الحالات والحقول والأتمتة، بدون المهام الحالية.', 'Keep statuses, fields and automations, without the current tasks.'], dlg: { t: ['حفظ كقالب', 'Save as template'], n: ['قائمة طلبات الصيانة - قياسية', 'Maintenance requests - standard'], opts: [[['الحالات والحقول', 'Statuses and fields'], true], [['المهام الحالية', 'Current tasks'], false], [['الأتمتة', 'Automations'], true]], b: 'Save template' }, hl: 'op1' },
      { c: ['احفظ. القالب ظهر في مركز القوالب لفريقك.', 'Save. The template appears in your team’s Template Center.'], hl: 'dlgGo', click: true },
      { c: ['الآن يستطيع أي فريق استخدامه.', 'Now any team can use it.'], dlg: null, cards: [{ k: 'tpN', n: ['قائمة طلبات الصيانة - قياسية', 'Maintenance requests - standard'], ic: 'template', c: '#0ca678', d: ['قالب فريقك', 'Your team’s template'] }], hl: 'tpN', toast: ['تم حفظ القالب', 'Template saved'] }
    ] },
    ex: ['مشرف في صحار بنى قائمة طلبات ممتازة وحفظها قالباً. استخدمتها خمسة فروع أخرى، وأصبحت التقارير متطابقة في كل الفروع.', 'A supervisor in Sohar built an excellent request List and saved it as a template. Five other branches used it, and reports became identical across branches.'],
    wrong: ['حفظ قالب يحتوي مهاماً قديمة وأسماء موظفين غادروا.', 'Saving a template full of old tasks and names of people who left.'],
    right: ['احفظ البنية (الحالات، الحقول، الأتمتة) واترك البيانات القديمة.', 'Save the structure (statuses, fields, automations) and leave the old data out.'],
    quiz: { q: ['ماذا تحفظ عادة في القالب؟', 'What do you usually keep in a template?'], o: [['البنية: الحالات والحقول والأتمتة', 'The structure: statuses, fields and automations'], ['كل المهام القديمة كما هي', 'All the old tasks as they are'], ['كلمات المرور', 'Passwords']], a: 0, why: ['القالب يحفظ طريقة العمل، لا بيانات مشروع سابق.', 'A template keeps the way of working, not a past project’s data.'] }
  },

  /* ---------------- Everyday pro tips ---------------- */
  mute: {
    more: ['الإشعارات أداة مفيدة حتى تصبح ضجيجاً. في إعدادات الإشعارات تختار لكل نوع (إشارة، إسناد، تغيير حالة، تعليق) أين يصلك: داخل التطبيق، البريد، أو الجوال. القاعدة الذكية: أبقِ ما يخصك مباشرة (الإشارات والإسناد)، وقلّل الباقي. ولمهمة لم تعد تعنيك، أزل نفسك من المتابعين.', 'Notifications are useful until they become noise. In notification settings you choose for each type (mention, assignment, status change, comment) where it reaches you: in-app, email or mobile. The smart rule: keep what is directly about you (mentions and assignments), and cut the rest. For a task that no longer concerns you, remove yourself as a watcher.'],
    like: ['مثل ضبط هاتفك: المكالمات المهمة ترن، والإعلانات صامتة.', 'Like setting up your phone: important calls ring, adverts stay silent.'],
    demo: { scene: 'settings', steps: [
      { c: ['من صورتك افتح Settings ثم Notifications.', 'From your avatar open Settings, then Notifications.'], page: 'notif', tg: {}, hl: 'm-notif', click: true },
      { c: ['«كل تعليق جديد» عبر البريد يملأ صندوقك. أوقفه.', '“Every new comment” by email floods your inbox. Turn it off.'], hl: 'tg-comment-mail', click: true, tg: { 'comment-mail': false } },
      { c: ['وأوقف إشعارات الجوال لتغيّر الحالة.', 'And turn off mobile alerts for status changes.'], hl: 'tg-status-mob', click: true, tg: { 'comment-mail': false, 'status-mob': false } },
      { c: ['أبقِ الإشارات والإسناد مفعلة في كل مكان.', 'Keep mentions and assignments on everywhere.'], hl: 'tg-mention-mob', toast: ['تم حفظ تفضيلات الإشعارات', 'Notification preferences saved'] }
    ] },
    ex: ['موظفة كانت تصلها 200 رسالة بريد يومياً من ClickUp. بعد ضبط الإشعارات أصبحت 15، كلها تخصها فعلاً.', 'An employee used to get 200 emails a day from ClickUp. After tuning notifications she gets 15, all actually about her.'],
    wrong: ['إيقاف كل الإشعارات ثم تفويت مهمة أُسندت إليك.', 'Turning off all notifications and then missing a task assigned to you.'],
    right: ['أوقف الضجيج، وأبقِ الإشارات والإسناد دائماً.', 'Cut the noise, and always keep mentions and assignments.'],
    quiz: { q: ['أي إشعارات يجب أن تبقى مفعلة دائماً؟', 'Which notifications should always stay on?'], o: [['الإشارات إليك والمهام المسندة لك', 'Mentions of you and tasks assigned to you'], ['كل تعليق في كل مهمة', 'Every comment on every task'], ['لا شيء', 'None']], a: 0, why: ['هذه هي الإشعارات التي تتطلب منك إجراءً.', 'These are the notifications that need action from you.'] }
  },
  '2fa': {
    more: ['التحقق بخطوتين يضيف قفلاً ثانياً: بعد كلمة المرور يطلب ClickUp رمزاً من 6 أرقام يتغير كل 30 ثانية في تطبيق المصادقة على هاتفك. حتى لو سُرقت كلمة المرور لن يدخل أحد بدون هاتفك. احفظ رموز الاسترداد في مكان آمن لتدخل إن فقدت الهاتف. وإن كانت شركتك تستخدم الدخول الموحد (SSO) فالأمان يُدار من حساب الشركة.', 'Two-factor authentication adds a second lock: after your password ClickUp asks for a 6-digit code that changes every 30 seconds in the authenticator app on your phone. Even if your password is stolen, nobody gets in without your phone. Keep the recovery codes somewhere safe so you can still sign in if you lose the phone. If your company uses single sign-on (SSO), security is managed through the company account.'],
    like: ['مثل باب بقفلين: المفتاح وحده (كلمة المرور) لا يكفي.', 'Like a door with two locks: the key alone (your password) is not enough.'],
    demo: { scene: 'settings', steps: [
      { c: ['افتح Settings ثم Security & 2FA.', 'Open Settings, then Security & 2FA.'], page: 'security', hl: 'm-security', click: true },
      { c: ['يظهر رمز QR. امسحه بتطبيق المصادقة على هاتفك.', 'A QR code appears. Scan it with the authenticator app on your phone.'], qr: true, hl: 'qr' },
      { c: ['اكتب الرمز المكوّن من 6 أرقام من التطبيق.', 'Type the 6-digit code from the app.'], hl: 'code', click: true, type: { k: 'code', x: '482 913' } },
      { c: ['اضغط Enable. حسابك محمي الآن بقفلين.', 'Click Enable. Your account now has two locks.'], code: '482 913', hl: 'enable2fa', click: true },
      { c: ['تم التفعيل. احفظ رموز الاسترداد في مكان آمن.', 'Enabled. Keep your recovery codes somewhere safe.'], on2fa: true, hl: 'on2fa', toast: ['تم تفعيل التحقق بخطوتين', 'Two-factor authentication enabled'] }
    ] },
    ex: ['حاول شخص الدخول لحساب موظف بكلمة مرور مسربة. لأن التحقق بخطوتين مفعل، فشلت المحاولة ووصل للموظف تنبيه.', 'Someone tried to sign in to an employee’s account with a leaked password. Because 2FA was on, the attempt failed and the employee got an alert.'],
    wrong: ['الاعتماد على كلمة مرور واحدة مستخدمة في مواقع كثيرة.', 'Relying on one password that is reused on many sites.'],
    right: ['فعّل التحقق بخطوتين واحفظ رموز الاسترداد.', 'Turn on 2FA and keep your recovery codes.'],
    quiz: { q: ['ماذا يحمي التحقق بخطوتين؟', 'What does two-factor authentication protect against?'], o: [['الدخول بكلمة مرور مسروقة وحدها', 'Sign-in with a stolen password alone'], ['نسيان المواعيد', 'Forgetting deadlines'], ['بطء الإنترنت', 'Slow internet']], a: 0, why: ['يلزم رمز من هاتفك إضافة لكلمة المرور.', 'A code from your phone is needed in addition to the password.'] }
  },
  shortcuts: {
    more: ['الاختصارات توفر ثوانٍ في كل عملية، وتتحول إلى ساعات في الشهر. أولاً فعّلها من الإعدادات. ثم ابدأ بأهمها: Ctrl/Cmd+K للبحث والتنقل، T لمهمة جديدة، R لتذكير، M لإسناد المهمة لنفسك، Shift+S لتغيير الحالة. تعلّم اختصاراً واحداً يومياً بدلاً من حفظ القائمة كلها. قد تختلف بعض الاختصارات حسب الإصدار.', 'Shortcuts save seconds on every action, which add up to hours a month. First turn them on in settings. Then start with the most useful: Ctrl/Cmd+K to search and jump, T for a new task, R for a reminder, M to assign a task to yourself, Shift+S to change status. Learn one shortcut a day instead of memorising the whole list. Some shortcuts may vary by version.'],
    like: ['مثل حفظ أرقام الطوارئ: لا تبحث عنها وقت الحاجة.', 'Like memorising emergency numbers: you do not search for them when you need them.'],
    demo: { scene: 'settings', steps: [
      { c: ['افتح Settings ثم Shortcuts.', 'Open Settings, then Shortcuts.'], page: 'keys', kb: false, hl: 'm-keys', click: true },
      { c: ['فعّل الاختصارات أولاً.', 'Turn shortcuts on first.'], hl: 'tg-kb', click: true, kb: true },
      { c: ['Ctrl/Cmd+K: البحث والتنقل لأي مكان.', 'Ctrl/Cmd+K: search and jump anywhere.'], press: 'Ctrl+K', hl: 'k-Ctrl+K' },
      { c: ['T: مهمة جديدة من أي مكان.', 'T: a new task from anywhere.'], press: 'T', hl: 'k-T' },
      { c: ['M: أسند المهمة المفتوحة لنفسك.', 'M: assign the open task to yourself.'], press: 'M', hl: 'k-M' }
    ] },
    ex: ['مشرف فريق تعلّم 5 اختصارات خلال أسبوع. بحسابه البسيط وفّر نحو 20 دقيقة يومياً من النقر والتنقل.', 'A team supervisor learned 5 shortcuts in a week. By his rough count he saved about 20 minutes a day of clicking around.'],
    wrong: ['محاولة حفظ 50 اختصاراً في يوم واحد.', 'Trying to memorise 50 shortcuts in one day.'],
    right: ['اختصار واحد يومياً، وابدأ بـ Ctrl/Cmd+K.', 'One shortcut a day, starting with Ctrl/Cmd+K.'],
    quiz: { q: ['ما الخطوة الأولى لاستخدام الاختصارات؟', 'What is the first step to using shortcuts?'], o: [['تفعيلها من الإعدادات', 'Turning them on in settings'], ['شراء لوحة مفاتيح جديدة', 'Buying a new keyboard'], ['تثبيت برنامج إضافي', 'Installing extra software']], a: 0, why: ['معظم الاختصارات لا تعمل حتى تُفعّل.', 'Most shortcuts do not work until they are turned on.'] }
  },
  themes: {
    more: ['المظهر يؤثر على راحة عينيك خلال يوم طويل. الوضع الفاتح مناسب للمكاتب المضيئة، والداكن أريح في الإضاءة الخافتة والعمل الليلي، والتلقائي يتبع إعداد جهازك ويتغير وحده. ولون التمييز (Accent) يغير لون الأزرار والعناصر النشطة. إعداد شخصي لا يؤثر على زملائك.', 'The theme affects how comfortable your eyes are over a long day. Light mode suits bright offices, dark is easier in dim light and at night, and automatic follows your device setting and switches by itself. The accent colour changes the colour of buttons and active items. It is a personal setting that does not affect colleagues.'],
    like: ['مثل ضبط إضاءة غرفتك: نفس الغرفة، لكن أريح لعينيك.', 'Like adjusting your room lighting: same room, easier on your eyes.'],
    demo: { scene: 'settings', steps: [
      { c: ['افتح Settings ثم Themes.', 'Open Settings, then Themes.'], page: 'themes', mode: 'light', hl: 'm-themes', click: true },
      { c: ['اختر Dark.', 'Choose Dark.'], hl: 'th-dark', click: true },
      { c: ['تحولت الواجهة للوضع الداكن.', 'The interface switched to dark mode.'], mode: 'dark', dark: true, hl: 'th-dark' },
      { c: ['اختر لون تمييز يعجبك.', 'Pick an accent colour you like.'], hl: 'ac-0ea5e9', click: true, accent: '#0ea5e9' },
      { c: ['أو اختر Auto ليتبع جهازك تلقائياً.', 'Or choose Auto to follow your device automatically.'], mode: 'auto', dark: false, hl: 'th-auto', click: true }
    ] },
    ex: ['مهندسو المناوبة الليلية فعّلوا الوضع الداكن، فقلّ إجهاد العين خلال ساعات العمل الطويلة.', 'Night-shift engineers switched to dark mode, which reduced eye strain over long shifts.'],
    wrong: ['العمل ساعات في إضاءة خافتة على شاشة بيضاء ساطعة.', 'Working for hours in dim light on a bright white screen.'],
    right: ['اختر Auto أو Dark حسب بيئة عملك.', 'Choose Auto or Dark to suit where you work.'],
    quiz: { q: ['هل يغير اختيارك للمظهر شكل ClickUp عند زملائك؟', 'Does your theme choice change how ClickUp looks for colleagues?'], o: [['لا، إعداد شخصي', 'No, it is personal'], ['نعم، لكل الشركة', 'Yes, for the whole company'], ['فقط للمسؤولين', 'Only for admins']], a: 0, why: ['المظهر إعداد شخصي لك وحدك.', 'The theme is a personal setting just for you.'] }
  },
  restore: {
    more: ['هناك فرق مهم بين الحذف والأرشفة. المحذوف يذهب إلى سلة المهملات (Trash) لمدة 30 يوماً تقريباً ثم يُحذف نهائياً، ويمكن استعادته خلالها. أما المؤرشف فيختفي من الشريط الجانبي لكنه يبقى محفوظاً دائماً ويُستعاد في أي وقت. انتبه: التعليقات وسجلات الوقت المحذوفة لا تُستعاد. لذلك: المشاريع المنتهية تُؤرشف، لا تُحذف.', 'There is an important difference between deleting and archiving. Deleted items go to Trash for about 30 days, then are gone for good; you can restore them within that time. Archived items disappear from the sidebar but stay saved forever and can be restored any time. Careful: deleted comments and time entries cannot be restored. So: finished projects get archived, not deleted.'],
    like: ['الحذف مثل سلة المهملات قبل أن يأخذها عامل النظافة. الأرشفة مثل المخزن: بعيد عن طريقك لكنه محفوظ.', 'Deleting is like the bin before the cleaner takes it. Archiving is like a storeroom: out of your way but kept.'],
    demo: { scene: 'trash', steps: [
      { c: ['حذفت قائمة بالخطأ. افتح Trash.', 'You deleted a List by mistake. Open Trash.'], items: [{ k: 'x1', ic: 'list', n: ['قائمة الطلبات', 'Requests List'], d: ['حُذفت اليوم', 'deleted today'] }, { k: 'x2', ic: 'checklist', n: ['تحديث المخطط', 'Update the drawing'], d: ['قبل 3 أيام', '3 days ago'] }], arch: [{ k: 'a1', n: ['مشروع 2025 (مؤرشف)', '2025 project (archived)'] }] },
      { c: ['اضغط Restore بجانب القائمة.', 'Click Restore next to the List.'], hl: 'x1-r', click: true },
      { c: ['عادت القائمة بكل مهامها.', 'The List is back with all its tasks.'], items: [{ k: 'x2', ic: 'checklist', n: ['تحديث المخطط', 'Update the drawing'], d: ['قبل 3 أيام', '3 days ago'] }], toast: ['تمت استعادة «قائمة الطلبات»', '“Requests List” restored'] },
      { c: ['والمشاريع القديمة؟ مؤرشفة ومحفوظة للأبد.', 'And old projects? Archived and kept forever.'], hl: 'a1' }
    ] },
    ex: ['موظف حذف قائمة كاملة بالخطأ يوم الخميس. يوم الأحد استعادها من سلة المهملات بكل مهامها، ولم يخسر شيئاً.', 'An employee deleted a whole List by mistake on Thursday. On Sunday he restored it from Trash with all its tasks and lost nothing.'],
    wrong: ['حذف المشاريع المنتهية «لتنظيف» الشريط الجانبي.', 'Deleting finished projects to “clean up” the sidebar.'],
    right: ['أرشف المشاريع المنتهية؛ تختفي من أمامك وتبقى محفوظة.', 'Archive finished projects; they leave your view but stay saved.'],
    quiz: { q: ['ما الفرق بين الحذف والأرشفة؟', 'What is the difference between delete and archive?'], o: [['المحذوف يبقى نحو 30 يوماً، والمؤرشف يبقى دائماً', 'Deleted stays about 30 days; archived stays forever'], ['لا فرق', 'There is no difference'], ['المؤرشف يُحذف فوراً', 'Archived items are deleted at once']], a: 0, why: ['الأرشفة حفظ دائم، والحذف مؤقت في السلة.', 'Archiving keeps things forever; deleting is temporary in the bin.'] }
  },
  time: {
    more: ['تتبع الوقت يجيب عن سؤال مهم: كم أخذ هذا العمل فعلاً؟ شغّل المؤقت في المهمة عند البدء وأوقفه عند الانتهاء، أو أضف الوقت يدوياً إن نسيت. قارن الوقت الفعلي بالتقدير: مع الوقت تصبح تقديراتك أدق وخططك واقعية. ويظهر مجموع الوقت في التقارير ولوحات المعلومات. يحتاج أن تكون ميزة Time Tracking مفعلة في المساحة.', 'Time tracking answers an important question: how long did this work really take? Start the timer in the task when you begin and stop it when you finish, or add time manually if you forgot. Compare actual time with the estimate: over time your estimates get sharper and your plans realistic. Totals appear in reports and dashboards. The Time Tracking ClickApp needs to be on in the Space.'],
    like: ['مثل عداد سيارة الأجرة: يحسب الوقت الحقيقي، لا التقدير.', 'Like a taxi meter: it counts the real time, not the guess.'],
    demo: { scene: 'task', steps: [
      { c: ['مهمة بتقدير 3 ساعات. اضغط Start.', 'A task estimated at 3 hours. Click Start.'], title: ['إعداد تقرير المسح', 'Prepare the survey report'], st: 'todo', who: ['me'], due: C4D(16), prio: 'normal', est: '3h', timer: '0:00:00', run: false, hl: 'tTimer', click: true },
      { c: ['المؤقت يعمل وأنت تنجز المهمة.', 'The timer runs while you work.'], st: 'prog', run: true, timer: '1:12:40', hl: 'tTimer' },
      { c: ['انتهيت. أوقف المؤقت.', 'Finished. Stop the timer.'], run: true, timer: '3:45:10', hl: 'tTimer', click: true },
      { c: ['الوقت الفعلي 3:45 مقابل تقدير 3 ساعات. في المرة القادمة قدّر 4.', 'Actual 3:45 versus a 3-hour estimate. Next time estimate 4.'], run: false, st: 'done', timer: '3:45:10', hl: 'tEst', toast: ['تم تسجيل 3:45 ساعة', '3:45 h logged'] }
    ] },
    ex: ['بعد شهرين من تتبع الوقت، اكتشف فريق التقارير أن التقرير الشهري يأخذ يومين لا يوماً واحداً، فعدّلوا الجدول وتوقف التأخير.', 'After two months of time tracking, the reporting team found the monthly report takes two days, not one, so they adjusted the schedule and the delays stopped.'],
    wrong: ['تقدير المهام دائماً بنفس الرقم دون مقارنة بالواقع.', 'Always estimating tasks with the same number without comparing to reality.'],
    right: ['تتبع الوقت الفعلي، وقارنه بالتقدير بعد كل مشروع.', 'Track actual time, and compare it with the estimate after each project.'],
    quiz: { q: ['ما فائدة مقارنة الوقت الفعلي بالتقدير؟', 'Why compare actual time with the estimate?'], o: [['لتصبح تقديراتك وخططك أدق', 'To make your estimates and plans more accurate'], ['لمعاقبة الموظفين', 'To punish employees'], ['لا فائدة', 'There is no benefit']], a: 0, why: ['المقارنة تعلمك كم يأخذ العمل فعلاً.', 'Comparing teaches you how long work really takes.'] }
  },
  notepad: {
    more: ['المفكرة (Notepad) دفترك الخاص داخل ClickUp: لا يراه أي زميل. تفتحها من زر الإجراءات السريعة أو اختصارها، وتكتب أفكاراً سريعة أو قائمة تحقق لليوم بتنسيق بسيط. عندما تصبح الملاحظة عملاً له موعد أو مسؤول، حوّلها إلى مهمة حقيقية بنقرة. هكذا لا تضيع الأفكار في أوراق صغيرة أو تطبيقات متفرقة.', 'The Notepad is your private notebook inside ClickUp: no colleague can see it. You open it from the quick action button or its shortcut and jot quick ideas or today’s checklist with simple formatting. When a note becomes work with a deadline or owner, turn it into a real task in one click. That way ideas never get lost on scraps of paper or in scattered apps.'],
    like: ['مثل الدفتر الصغير في جيبك، لكنه يتحول إلى مهام حقيقية عند الحاجة.', 'Like the little notebook in your pocket, but it turns into real tasks when needed.'],
    demo: { scene: 'mywork', steps: [
      { c: ['افتح Notepad: دفترك الخاص.', 'Open the Notepad: your private notebook.'], nav: 'home', rows: [C4R('w1', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] })], note: [{ x: ['أفكار لاجتماع الغد', 'Ideas for tomorrow’s meeting'] }], hl: 'notepad' },
      { c: ['اكتب قائمة سريعة لما يدور في ذهنك.', 'Write a quick list of what is on your mind.'], note: [{ x: ['أفكار لاجتماع الغد', 'Ideas for tomorrow’s meeting'] }, { x: ['اسأل خالد عن التصاريح', 'Ask Khalid about permits'] }, { x: ['حجز قاعة التدريب', 'Book the training room'] }], hl: 'nl2' },
      { c: ['«حجز قاعة التدريب» عمل له موعد. حوّله إلى مهمة.', '“Book the training room” is work with a deadline. Convert it to a task.'], hl: 'toTask', click: true },
      { c: ['أصبحت مهمة في My Work.', 'It is now a task in My Work.'], rows: [C4R('w1', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w2', ['حجز قاعة التدريب', 'Book the training room'], { sec: 'next', due: ['الأحد', 'Sun'] })], note: [{ x: ['أفكار لاجتماع الغد', 'Ideas for tomorrow’s meeting'] }, { x: ['اسأل خالد عن التصاريح', 'Ask Khalid about permits'] }, { x: ['حجز قاعة التدريب', 'Book the training room'], d: true }], hl: 'w2', toast: ['تم إنشاء مهمة', 'Task created'] }
    ] },
    ex: ['مديرة كانت تكتب ملاحظاتها على أوراق صغيرة تضيع. الآن تكتبها في المفكرة وتحوّل المهم منها إلى مهام قبل نهاية اليوم.', 'A manager used to write notes on sticky papers that got lost. Now she writes them in the Notepad and turns the important ones into tasks before the end of the day.'],
    wrong: ['ترك عمل له موعد في المفكرة دون تحويله لمهمة.', 'Leaving work with a deadline in the Notepad without making it a task.'],
    right: ['المفكرة للأفكار الخام؛ ما له موعد يصبح مهمة.', 'The Notepad is for raw ideas; anything with a deadline becomes a task.'],
    quiz: { q: ['من يستطيع رؤية مفكرتك في ClickUp؟', 'Who can see your Notepad in ClickUp?'], o: [['أنت فقط', 'Only you'], ['كل الفريق', 'The whole team'], ['المدير فقط', 'Only your manager']], a: 0, why: ['المفكرة خاصة بك.', 'The Notepad is private to you.'] }
  },
  mywork: {
    more: ['«عملي» (My Work) يجمع كل ما يخصك من كل المساحات في مكان واحد: المهام المسندة لك والتذكيرات. يرتبها في أقسام: اليوم، المتأخر، القادم، وبلا موعد. وتبويبات: للتنفيذ، المنجز، والمفوَّض (ما أسندته لغيرك). عادة صباحية بسيطة: ابدأ بالمتأخر، ثم اليوم، ثم جدول ما بلا موعد.', 'My Work gathers everything that is yours from every Space in one place: tasks assigned to you and reminders. It sorts them into sections: Today, Overdue, Next and Unscheduled. And tabs: To Do, Done, and Delegated (what you assigned to others). A simple morning habit: start with Overdue, then Today, then schedule the Unscheduled.'],
    like: ['مثل قائمة مهام يومية جاهزة تجدها على مكتبك كل صباح.', 'Like a ready daily to-do list waiting on your desk every morning.'],
    demo: { scene: 'mywork', steps: [
      { c: ['افتح Home: هنا My Work.', 'Open Home: here is My Work.'], nav: 'home', rows: [C4R('w1', ['تحديث سجل المخاطر', 'Update the risk log'], { sec: 'overdue', due: ['أمس', 'Yesterday'] }), C4R('w2', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w3', ['اجتماع البلدية', 'Municipality meeting'], { sec: 'today', due: ['10:00', '10:00'] }), C4R('w4', ['تجهيز العرض', 'Prepare the presentation'], { sec: 'next', due: ['الأحد', 'Sun'] }), C4R('w5', ['قراءة دليل الجودة', 'Read the quality guide'], { sec: 'uns' })], hl: 'sec-overdue' },
      { c: ['ابدأ بالمتأخر: أنجزه أو أعد جدولته.', 'Start with Overdue: finish it or reschedule it.'], hl: 'w1', click: true },
      { c: ['ثم مهام اليوم.', 'Then today’s tasks.'], rows: [C4R('w2', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w1', ['تحديث سجل المخاطر', 'Update the risk log'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w3', ['اجتماع البلدية', 'Municipality meeting'], { sec: 'today', due: ['10:00', '10:00'] }), C4R('w4', ['تجهيز العرض', 'Prepare the presentation'], { sec: 'next', due: ['الأحد', 'Sun'] }), C4R('w5', ['قراءة دليل الجودة', 'Read the quality guide'], { sec: 'uns' })], hl: 'sec-today' },
      { c: ['وأخيراً أعطِ ما بلا موعد تاريخاً مناسباً.', 'Finally give the unscheduled task a suitable date.'], rows: [C4R('w2', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w1', ['تحديث سجل المخاطر', 'Update the risk log'], { sec: 'today', due: ['اليوم', 'Today'] }), C4R('w3', ['اجتماع البلدية', 'Municipality meeting'], { sec: 'today', due: ['10:00', '10:00'] }), C4R('w4', ['تجهيز العرض', 'Prepare the presentation'], { sec: 'next', due: ['الأحد', 'Sun'] }), C4R('w5', ['قراءة دليل الجودة', 'Read the quality guide'], { sec: 'next', due: ['الإثنين', 'Mon'] })], hl: 'w5' }
    ] },
    ex: ['موظفة تعمل في 4 مساحات مختلفة كانت تفتحها كلها كل صباح. الآن تفتح My Work فقط فترى كل مهامها في دقيقة.', 'An employee working in 4 different Spaces used to open them all every morning. Now she opens only My Work and sees all her tasks in a minute.'],
    wrong: ['التنقل بين كل المساحات صباحاً لمعرفة مهامك.', 'Clicking through every Space each morning to find your tasks.'],
    right: ['ابدأ يومك من My Work: المتأخر، ثم اليوم، ثم بلا موعد.', 'Start your day in My Work: Overdue, then Today, then Unscheduled.'],
    quiz: { q: ['بماذا تبدأ مراجعتك الصباحية في My Work؟', 'What do you start with in your morning My Work review?'], o: [['المتأخر', 'Overdue'], ['المنجز', 'Done'], ['المفوَّض', 'Delegated']], a: 0, why: ['المتأخر يحتاج قراراً أولاً: إنجاز أو إعادة جدولة.', 'Overdue needs a decision first: finish or reschedule.'] }
  },
  reminder: {
    more: ['التذكير أخف من المهمة: نص ووقت فقط، بلا قائمة أو حقول أو مسؤول آخر. مثالي لأشياء صغيرة مثل «اتصل بالمورد الساعة 10» أو «راجع البريد قبل الاجتماع». يظهر في My Work ويصلك تنبيه في وقته، ويمكنك إرسال تذكير لزميل. إذا كان الشيء يحتاج متابعة وتوثيقاً ومسؤولاً، فاجعله مهمة.', 'A reminder is lighter than a task: just text and a time, with no List, fields or other owner. Perfect for small things like “call the vendor at 10” or “check email before the meeting”. It shows in My Work and alerts you on time, and you can send a reminder to a colleague. If something needs follow-up, a record and an owner, make it a task.'],
    like: ['مثل منبه الهاتف: يرن في الوقت ويذكرك بشيء صغير.', 'Like a phone alarm: it rings on time to remind you of something small.'],
    demo: { scene: 'mywork', steps: [
      { c: ['اضغط Create ثم Reminder، أو الاختصار R.', 'Click Create, then Reminder, or press R.'], nav: 'home', rows: [C4R('w2', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] })], hl: 'create', click: true },
      { c: ['اكتب ما تريد التذكير به.', 'Type what you want to be reminded of.'], rem: { x: '' }, hl: 'remText', click: true, type: { k: 'remText', x: ['اتصل بالمورد لتأكيد الرافعة', 'Call the vendor to confirm the crane'] } },
      { c: ['اختر الوقت واحفظ.', 'Choose the time and save.'], rem: { x: ['اتصل بالمورد لتأكيد الرافعة', 'Call the vendor to confirm the crane'], t: ['اليوم 10:00', 'Today 10:00'] }, hl: 'remSave', click: true },
      { c: ['ظهر التذكير في My Work، وسيصلك تنبيه الساعة 10.', 'The reminder is in My Work, and you will be alerted at 10.'], rem: null, rows: [C4R('r1', ['اتصل بالمورد لتأكيد الرافعة', 'Call the vendor to confirm the crane'], { sec: 'today', due: '10:00', rem: true }), C4R('w2', ['مراجعة التقرير الأسبوعي', 'Review the weekly report'], { sec: 'today', due: ['اليوم', 'Today'] })], hl: 'r1', toast: ['تم إنشاء التذكير', 'Reminder created'] }
    ] },
    ex: ['مشرف الموقع يضع تذكيراً كل صباح: «تأكد من وصول فريق التمديد الساعة 7». بسيط ولا يحتاج مهمة كاملة.', 'The site supervisor sets a reminder every morning: “check the installation crew arrived at 7”. Simple, with no need for a full task.'],
    wrong: ['إنشاء مهمة كاملة بقائمة وحقول لتذكير بسيط.', 'Creating a full task with a List and fields for a simple reminder.'],
    right: ['التذكير للأشياء الصغيرة، والمهمة لما يحتاج متابعة ومسؤولاً.', 'Reminders for small things; tasks for what needs follow-up and an owner.'],
    quiz: { q: ['متى تستخدم تذكيراً بدل مهمة؟', 'When do you use a reminder instead of a task?'], o: [['لشيء صغير لك في وقت محدد', 'For something small for you at a set time'], ['لمشروع كبير بفريق', 'For a big project with a team'], ['لطلب من عميل', 'For a customer request']], a: 0, why: ['التذكير خفيف: نص ووقت فقط.', 'A reminder is light: just text and a time.'] }
  },
  mysettings: {
    more: ['«إعداداتي» هي غرفة التحكم الخاصة بك: الاسم والصورة، المنطقة الزمنية، لغة الواجهة، صيغة التاريخ والوقت، الإشعارات، الأمان، والتطبيقات المرتبطة. لا تؤثر على أحد غيرك. ضبطها مرة واحدة عند البداية يمنع مشاكل لاحقة مثل مواعيد بتوقيت خاطئ أو تواريخ تُقرأ بالمقلوب (يوم/شهر).', 'My Settings is your personal control room: name and photo, time zone, interface language, date and time format, notifications, security and connected apps. It affects nobody but you. Setting it once at the start prevents later problems like due times in the wrong zone or dates read backwards (day/month).'],
    like: ['مثل ضبط ساعة يدك ولغتها قبل السفر: تفصيل صغير يمنع ارتباكاً كبيراً.', 'Like setting your watch and its language before a trip: a small detail that prevents big confusion.'],
    demo: { scene: 'settings', steps: [
      { c: ['من صورتك افتح Settings ← My Settings.', 'From your avatar open Settings → My Settings.'], page: 'profile', hl: 'm-profile', click: true },
      { c: ['تأكد من المنطقة الزمنية: مسقط GMT+4.', 'Check the time zone: Muscat GMT+4.'], hl: 'pTz' },
      { c: ['اختر صيغة التاريخ التي تقرؤها بسهولة.', 'Choose the date format you read easily.'], hl: 'pDate', click: true, type: { k: 'pDate', x: 'dd/mm/yyyy' } },
      { c: ['احفظ. كل المواعيد ستظهر لك بالشكل الصحيح.', 'Save. All dates will show correctly for you.'], df: 'dd/mm/yyyy', toast: ['تم حفظ إعداداتك', 'Your settings are saved'] }
    ] },
    ex: ['موظف قرأ «03/04» على أنها 3 أبريل بينما كانت 4 مارس. بعد ضبط صيغة التاريخ لم يتكرر الخطأ.', 'An employee read “03/04” as April 3rd when it was March 4th. After setting the date format, the mistake never happened again.'],
    wrong: ['ترك الإعدادات الافتراضية دون مراجعة.', 'Leaving the default settings unchecked.'],
    right: ['راجع المنطقة الزمنية وصيغة التاريخ والإشعارات في أول يوم.', 'Check time zone, date format and notifications on your first day.'],
    quiz: { q: ['هل تغيير إعداداتي يؤثر على زملائي؟', 'Does changing My Settings affect colleagues?'], o: [['لا، تخصك وحدك', 'No, they are only yours'], ['نعم، كل الفريق', 'Yes, the whole team'], ['فقط المدير', 'Only the manager']], a: 0, why: ['My Settings شخصية لك.', 'My Settings are personal to you.'] }
  },

  /* ---------------- Running the Workspace ---------------- */
  wssettings: {
    more: ['إعدادات مساحة العمل تخص الشركة كلها، ويديرها المالك والمسؤولون فقط: الأعضاء وأدوارهم، الفرق، الميزات المفعلة (ClickApps)، الأمان، الاستيراد، التكاملات، والفوترة. كموظف عادي يكفي أن تعرف ما الموجود هناك لتطلب التغيير الصحيح من المسؤول، مثل «فعّلوا تتبع الوقت في مساحتنا».', 'Workspace settings affect the whole company and are managed only by the owner and admins: members and their roles, Teams, enabled features (ClickApps), security, import, integrations and billing. As a regular employee it is enough to know what is there so you can ask the admin for the right change, like “please turn on time tracking in our Space”.'],
    like: ['مثل غرفة الكهرباء الرئيسية في المبنى: يديرها الفني المختص، وأنت تطلب منه ما تحتاج.', 'Like the building’s main electrical room: the technician runs it, and you ask for what you need.'],
    demo: { scene: 'settings', steps: [
      { c: ['إعدادات مساحة العمل في الجزء السفلي من قائمة الإعدادات.', 'Workspace settings are in the lower part of the settings menu.'], page: 'people', members: [{ w: 'me', r: 'Member' }, { w: 'maryam', r: 'Admin' }, { w: 'salim', r: 'Member' }], hl: 'm-people' },
      { c: ['People: الأعضاء وأدوارهم.', 'People: the members and their roles.'], hl: 'mem-maryam' },
      { c: ['ClickApps: الميزات المفعلة، مثل تتبع الوقت.', 'ClickApps: enabled features, like time tracking.'], page: 'clickapps', tg: { time: false, multi: true, prio: true, est: false, sprint: false }, hl: 'm-clickapps', click: true },
      { c: ['المسؤول يفعّل Time Tracking بعد طلبك.', 'The admin turns on Time Tracking after your request.'], tg: { time: true, multi: true, prio: true, est: false, sprint: false }, hl: 'tg-time', click: true, toast: ['تم تفعيل تتبع الوقت', 'Time Tracking enabled'] }
    ] },
    ex: ['فريق طلب من المسؤول تفعيل Sprints لمشروع تطوير. خلال دقيقة أصبحت الميزة متاحة لمساحتهم فقط.', 'A team asked the admin to turn on Sprints for a development project. Within a minute the feature was available in their Space only.'],
    wrong: ['البحث عن ميزة غير مفعلة ثم الظن أن ClickUp لا يدعمها.', 'Looking for a feature that is switched off and assuming ClickUp does not have it.'],
    right: ['اسأل المسؤول إن كانت الميزة متاحة كـ ClickApp.', 'Ask the admin whether the feature is available as a ClickApp.'],
    quiz: { q: ['من يغير إعدادات مساحة العمل عادة؟', 'Who usually changes Workspace settings?'], o: [['المالك والمسؤولون', 'The owner and admins'], ['أي ضيف', 'Any guest'], ['الذكاء الاصطناعي وحده', 'AI by itself']], a: 0, why: ['تغييراتها تؤثر على الجميع، لذا تقتصر على المسؤولين.', 'Its changes affect everyone, so they are limited to admins.'] }
  },
  schedule: {
    more: ['جدول العمل يخبر ClickUp متى تعمل الشركة: أيام الدوام (مثلاً الأحد إلى الخميس)، ساعات العمل، والعطل الرسمية. النتيجة: لا تُجدول المهام لتبدأ أو تستحق في يوم عطلة، ويُحسب عبء العمل على أيام العمل الحقيقية فقط، فتصبح الخطط واقعية. يضبطه المالك أو المسؤول من إعدادات مساحة العمل.', 'The work schedule tells ClickUp when the company works: working days (for example Sunday to Thursday), working hours, and public holidays. The result: tasks are not scheduled to start or be due on a day off, and workload is counted only on real working days, so plans become realistic. The owner or an admin sets it in Workspace settings.'],
    like: ['مثل لوحة «مغلق يوم الجمعة» على باب المتجر: الكل يعرف متى لا يتوقع العمل.', 'Like a “closed on Friday” sign on a shop door: everyone knows when not to expect work.'],
    demo: { scene: 'settings', steps: [
      { c: ['المسؤول يفتح Work schedule.', 'The admin opens Work schedule.'], page: 'schedule', days: [true, true, true, true, true, true, true], hl: 'm-schedule', click: true },
      { c: ['الجمعة والسبت عطلة: ألغِ تحديدهما.', 'Friday and Saturday are off: untick them.'], days: [true, true, true, true, true, false, false], hl: 'wd5', click: true },
      { c: ['اضبط ساعات الدوام.', 'Set the working hours.'], hl: 'hours', click: true, type: { k: 'hours', x: '07:30 – 15:30' } },
      { c: ['أضف العطل الرسمية، مثل العيد الوطني.', 'Add public holidays, such as National Day.'], hours: '07:30 – 15:30', hol: [['العيد الوطني', 'National Day']], hl: 'hol0', toast: ['لن تُجدول مهام في أيام العطل', 'No tasks will be scheduled on days off'] }
    ] },
    ex: ['قبل ضبط جدول العمل كانت بعض المهام تستحق يوم الجمعة فتظهر متأخرة صباح الأحد. بعد الضبط اختفت هذه المشكلة.', 'Before the work schedule was set, some tasks fell due on Friday and showed as late on Sunday morning. After setting it, that problem disappeared.'],
    wrong: ['ترك أيام العمل الافتراضية (الإثنين-الجمعة) في شركة تعمل الأحد-الخميس.', 'Leaving the default working days (Mon–Fri) in a company that works Sun–Thu.'],
    right: ['اضبط الأحد-الخميس وأضف العطل الرسمية.', 'Set Sunday to Thursday and add public holidays.'],
    quiz: { q: ['ما أثر ضبط جدول العمل؟', 'What is the effect of setting the work schedule?'], o: [['لا تُجدول المهام في أيام العطل', 'Tasks are not scheduled on days off'], ['يحذف المهام القديمة', 'It deletes old tasks'], ['يغير الألوان', 'It changes colours']], a: 0, why: ['ClickUp يتجنب أيام العطل في المواعيد وعبء العمل.', 'ClickUp avoids days off in dates and workload.'] }
  },
  security: {
    more: ['الأمان في ClickUp طبقات. الأدوار: المالك (كل شيء)، المسؤول (يدير الإعدادات والأعضاء)، العضو (يعمل فيما يُتاح له)، العضو المحدود والضيف (يريان فقط ما شُورك معهما بالضبط). ومستويات المشاركة: مشاهدة، تعليق، تعديل، تحكم كامل. والأماكن الخاصة (Private) لا يراها إلا من أُضيف. وللمسؤول فرض التحقق بخطوتين على الجميع. القاعدة الذهبية: أقل صلاحية تكفي لإنجاز العمل. أما ما يُسمح بمشاركته من بيانات حساسة فتحدده سياسة الشركة المعتمدة.', 'Security in ClickUp has layers. Roles: Owner (everything), Admin (manages settings and members), Member (works in what they can access), Limited Member and Guest (see only exactly what is shared with them). Sharing levels: View, Comment, Edit, Full access. Private locations are visible only to people added. An admin can require 2FA for everyone. The golden rule: the least access that gets the job done. What sensitive data may be shared is decided by the approved company policy.'],
    like: ['مثل بطاقات الدخول في مبنى: كل بطاقة تفتح أبواباً محددة فقط.', 'Like access cards in a building: each card opens only certain doors.'],
    demo: { scene: 'settings', steps: [
      { c: ['الأدوار من الأعلى صلاحية إلى الأقل.', 'Roles from most access to least.'], page: 'perms', req2fa: false, hl: 'role0' },
      { c: ['الضيف يرى فقط ما شُورك معه بالضبط: مناسب للمورّدين.', 'A Guest sees only exactly what is shared: right for vendors.'], role: 4, hl: 'role4' },
      { c: ['المسؤول يستطيع فرض التحقق بخطوتين على الجميع.', 'An admin can require 2FA for everyone.'], hl: 'tg-req', click: true, req2fa: true },
      { c: ['عند مشاركة قائمة حساسة: اجعلها خاصة، وأعطِ أقل صلاحية.', 'When sharing a sensitive List: make it private and give the lowest access.'], ptitle: ['مشاركة «عقود الموردين»', 'Share “Vendor contracts”'], share: [{ w: 'maryam', l: 'Edit' }, { w: 'salim', l: 'View' }], priv: true, hl: 'private', click: true },
      { c: ['سالم يحتاج القراءة فقط: View.', 'Salim only needs to read: View.'], levels: true, lvl: 'View', hl: 'lv-View', click: true }
    ] },
    ex: ['قسم المشتريات جعل قائمة «عقود الموردين» خاصة، وأعطى المراجعين صلاحية مشاهدة فقط. البيانات محمية، والمراجعة تتم دون تعديل بالخطأ.', 'Procurement made the “Vendor contracts” List private and gave reviewers view-only access. The data is protected, and reviews happen without accidental edits.'],
    wrong: ['إعطاء الجميع «Full access» لتجنب طلبات الصلاحيات.', 'Giving everyone “Full access” to avoid permission requests.'],
    right: ['أقل صلاحية تكفي، وأماكن خاصة للبيانات الحساسة، والرجوع لسياسة الشركة.', 'The least access needed, private locations for sensitive data, and the company policy as the reference.'],
    quiz: { q: ['أي دور مناسب لمورّد من خارج الشركة يحتاج مهمة واحدة؟', 'Which role suits an outside vendor who needs one task?'], o: [['Guest (ضيف)', 'Guest'], ['Admin (مسؤول)', 'Admin'], ['Owner (مالك)', 'Owner']], a: 0, why: ['الضيف يرى فقط ما شُورك معه بالضبط.', 'A Guest sees only exactly what is shared with them.'] }
  },
  appcenter: {
    more: ['مركز التطبيقات يربط ClickUp بالأدوات التي تستخدمها يومياً: Microsoft Teams وOutlook للإشعارات والتقويم، Google Drive وOneDrive للملفات، Slack، GitHub، Zoom وغيرها. الربط يجعل المعلومات تنتقل تلقائياً: إشعار المهمة يصل في Teams، أو ملف Drive يظهر داخل المهمة. لكن كل تكامل يفتح باباً للبيانات، لذلك يحتاج موافقة تقنية المعلومات وفق سياسة الشركة.', 'The App Center connects ClickUp to tools you use daily: Microsoft Teams and Outlook for notifications and calendar, Google Drive and OneDrive for files, Slack, GitHub, Zoom and more. Connecting makes information flow automatically: a task notification arrives in Teams, or a Drive file shows inside the task. But every integration opens a door for data, so it needs IT approval under company policy.'],
    like: ['مثل وصل الأجهزة في البيت بنفس الشبكة: تتحدث مع بعضها، لكن تختار بعناية من يدخل الشبكة.', 'Like connecting home devices to one network: they talk to each other, but you choose carefully who joins.'],
    demo: { scene: 'settings', steps: [
      { c: ['افتح App Center.', 'Open the App Center.'], page: 'apps', apps: [{ k: 'teams', n: 'Microsoft Teams', c: '#5b5fc7' }, { k: 'outlook', n: 'Outlook', c: '#0f6cbd' }, { k: 'drive', n: 'Google Drive', c: '#1fa463' }, { k: 'zoom', n: 'Zoom', c: '#2d8cff' }, { k: 'github', n: 'GitHub', c: '#24292f' }, { k: 'slack', n: 'Slack', c: '#4a154b' }], hl: 'm-apps', click: true },
      { c: ['اختر Microsoft Teams لتصلك إشعارات المهام فيه.', 'Choose Microsoft Teams to get task notifications there.'], hl: 'con-teams', click: true },
      { c: ['بعد موافقة تقنية المعلومات، يكتمل الربط.', 'After IT approval, the connection completes.'], apps: [{ k: 'teams', n: 'Microsoft Teams', c: '#5b5fc7', on: true }, { k: 'outlook', n: 'Outlook', c: '#0f6cbd' }, { k: 'drive', n: 'Google Drive', c: '#1fa463' }, { k: 'zoom', n: 'Zoom', c: '#2d8cff' }, { k: 'github', n: 'GitHub', c: '#24292f' }, { k: 'slack', n: 'Slack', c: '#4a154b' }], hl: 'app-teams', toast: ['تم ربط Microsoft Teams', 'Microsoft Teams connected'] }
    ] },
    ex: ['بعد ربط Teams، أصبح فريق الشبكات يرى إشعارات المهام العاجلة في نفس المكان الذي يتحدث فيه، فتحسنت سرعة الاستجابة.', 'After connecting Teams, the network team saw urgent task notifications where they already chat, and response times improved.'],
    wrong: ['ربط كل تطبيق متاح «للتجربة» دون موافقة.', 'Connecting every available app “to try it” without approval.'],
    right: ['اربط فقط ما يحتاجه العمل، بموافقة تقنية المعلومات.', 'Connect only what the work needs, with IT approval.'],
    quiz: { q: ['لماذا تحتاج التكاملات موافقة تقنية المعلومات؟', 'Why do integrations need IT approval?'], o: [['لأن كل تكامل يفتح باباً لتبادل البيانات', 'Because every integration opens a path for data'], ['لأنها تبطئ الجهاز', 'Because they slow the computer'], ['لا تحتاج موافقة', 'They need no approval']], a: 0, why: ['البيانات تنتقل لأداة أخرى، فيجب أن يكون ذلك مسموحاً.', 'Data flows to another tool, so it must be allowed.'] }
  },

  /* ---------------- Automations ---------------- */
  'auto-intro': {
    more: ['الأتمتة قاعدة من ثلاثة أجزاء: المُشغّل (When) هو الحدث الذي يبدأها، مثل تغير الحالة أو إنشاء مهمة. الشرط (If) اختياري ويحدد المهام المقصودة فقط، مثل «إذا كانت الأولوية عاجلة». والإجراء (Then) هو ما يحدث تلقائياً، مثل الإسناد أو الإشعار أو تغيير التاريخ. توجد أتمتة جاهزة كثيرة للبدء بها. لكل خطة عدد تشغيلات شهري.', 'An automation is a rule in three parts: the Trigger (When) is the event that starts it, such as a status change or a new task. The Condition (If) is optional and targets only the right tasks, such as “if priority is Urgent”. The Action (Then) is what happens automatically, such as assigning, notifying or changing a date. There are many ready-made automations to start with. Each plan has a monthly number of runs.'],
    like: ['مثل الإضاءة التي تعمل وحدها عندما تدخل الغرفة: حدث (دخولك) يسبب إجراء (الإضاءة).', 'Like lights that turn on when you walk in: an event (you entering) causes an action (the lights).'],
    demo: { scene: 'auto', steps: [
      { c: ['في القائمة اضغط Automate.', 'In the List click Automate.'], trig: null, acts: [], hl: 'trig' },
      { c: ['المُشغّل: عندما تتغير الحالة إلى COMPLETE.', 'Trigger: when status changes to COMPLETE.'], hl: 'trig', click: true, trig: ['عندما تتغير الحالة إلى COMPLETE', 'When status changes to COMPLETE'] },
      { c: ['الإجراء: أبلغ مريم (مديرة المشروع).', 'Action: notify Maryam (the project manager).'], hl: 'act', click: true, acts: [['أرسل إشعاراً إلى مريم', 'Send a notification to Maryam']] },
      { c: ['احفظ الأتمتة.', 'Save the automation.'], hl: 'mkAuto', click: true },
      { c: ['جرّبها: سالم أنهى مهمة، فوصل الإشعار لمريم تلقائياً.', 'Try it: Salim finished a task, and Maryam was notified automatically.'], made: true, run: { n: ['مسح المواقع', 'Survey sites'], st: 'done', who: 'salim' }, log: [['أُرسل إشعار إلى مريم', 'Notification sent to Maryam']], hl: 'runCard', toast: ['مريم: اكتملت «مسح المواقع»', 'Maryam: “Survey sites” completed'] }
    ] },
    ex: ['مديرة كانت تسأل الفريق يومياً «ماذا أنجزتم؟». بعد أتمتة إشعار الإنجاز، أصبحت تعرف فور اكتمال كل مهمة.', 'A manager used to ask the team every day “what did you finish?”. With a completion automation, she now knows as soon as each task is done.'],
    wrong: ['أتمتة معقدة من أول يوم دون فهم الأجزاء الثلاثة.', 'A complex automation on day one without understanding the three parts.'],
    right: ['ابدأ بأتمتة بسيطة: مُشغّل واحد وإجراء واحد، وجرّبها.', 'Start simple: one trigger and one action, and test it.'],
    quiz: { q: ['ما الأجزاء الثلاثة للأتمتة؟', 'What are the three parts of an automation?'], o: [['مُشغّل، شرط، إجراء', 'Trigger, condition, action'], ['مهمة، قائمة، مساحة', 'Task, List, Space'], ['اسم، لون، أيقونة', 'Name, colour, icon']], a: 0, why: ['عندما (مُشغّل) + إذا (شرط اختياري) ← افعل (إجراء).', 'When (trigger) + if (optional condition) → do (action).'] }
  },
  'auto-edit': {
    more: ['الأتمتة تحتاج صيانة مثل أي أداة. تستطيع تعديل المُشغّل أو الشرط أو الإجراء، أو إيقافها مؤقتاً بمفتاح التشغيل. والأهم: سجل النشاط لكل أتمتة يريك متى عملت وماذا فعلت ومتى فشلت. إذا توقفت أتمتة، تحقق من ثلاثة أسباب شائعة: تغيرت الحالة التي تعتمد عليها، أو غادر الشخص المسند إليه، أو انتهى حد التشغيل الشهري.', 'Automations need maintenance like any tool. You can edit the trigger, condition or action, or pause one with its switch. Most importantly, each automation’s activity log shows when it ran, what it did and when it failed. If an automation stops, check three common causes: the status it depends on changed, the assigned person left, or the monthly run limit was reached.'],
    like: ['مثل صيانة سيارة: تفحص السجل وتصلح ما تغير قبل أن تتعطل.', 'Like servicing a car: you check the log and fix what changed before it breaks down.'],
    demo: { scene: 'auto', steps: [
      { c: ['قائمة الأتمتة الحالية مع عدد التشغيلات.', 'The current automations with their run counts.'], trig: ['عندما تُنشأ مهمة', 'When a task is created'], acts: [['أسند إلى سالم', 'Assign to Salim']], made: true, list: [{ k: 'au1', n: ['إسناد المهام الجديدة لسالم', 'Assign new tasks to Salim'], on: true, runs: 42 }, { k: 'au2', n: ['إشعار المدير عند الإنجاز', 'Notify manager on completion'], on: true, runs: 18 }], hl: 'au1' },
      { c: ['سالم انتقل لفريق آخر. عدّل الإجراء.', 'Salim moved to another team. Edit the action.'], hl: 'act', click: true, made: false },
      { c: ['أسند المهام الجديدة إلى خالد بدلاً منه.', 'Assign new tasks to Khalid instead.'], acts: [['أسند إلى خالد', 'Assign to Khalid']], list: [{ k: 'au1', n: ['إسناد المهام الجديدة لخالد', 'Assign new tasks to Khalid'], on: true, runs: 42 }, { k: 'au2', n: ['إشعار المدير عند الإنجاز', 'Notify manager on completion'], on: true, runs: 18 }], hl: 'act' },
      { c: ['احفظ وراجع السجل للتأكد أنها تعمل.', 'Save and check the log to make sure it works.'], made: true, hl: 'mkAuto', click: true, log: [['مهمة جديدة: أُسندت إلى خالد ✓', 'New task: assigned to Khalid ✓']] },
      { c: ['ولإيقاف أتمتة مؤقتاً استخدم مفتاحها.', 'To pause an automation, use its switch.'], list: [{ k: 'au1', n: ['إسناد المهام الجديدة لخالد', 'Assign new tasks to Khalid'], on: true, runs: 43 }, { k: 'au2', n: ['إشعار المدير عند الإنجاز', 'Notify manager on completion'], on: false, runs: 18 }], hl: 'au2-t', click: true }
    ] },
    ex: ['أتمتة توقفت أسبوعين دون أن يلاحظ أحد، لأن الحالة «جاهز» أُعيدت تسميتها إلى «مكتمل». سجل الأتمتة كشف المشكلة في دقيقة.', 'An automation silently stopped for two weeks because the “Ready” status was renamed “Complete”. The automation log revealed the problem in a minute.'],
    wrong: ['إعادة تسمية الحالات دون مراجعة الأتمتة المعتمدة عليها.', 'Renaming statuses without checking the automations that use them.'],
    right: ['بعد أي تغيير في الحالات أو الأشخاص، راجع الأتمتة وسجلها.', 'After any change to statuses or people, review the automations and their logs.'],
    quiz: { q: ['أين تعرف هل عملت الأتمتة أم فشلت؟', 'Where do you find out whether an automation ran or failed?'], o: [['في سجل نشاط الأتمتة', 'In the automation’s activity log'], ['في الشريط الجانبي', 'In the sidebar'], ['في My Settings', 'In My Settings']], a: 0, why: ['السجل يعرض كل تشغيل ونتيجته.', 'The log shows every run and its result.'] }
  },
  'auto-deep': {
    more: ['الأتمتة المتقدمة تجمع عدة شروط وإجراءات لتبني سير عمل كاملاً: «عندما تُنشأ مهمة في الطلبات، إذا كانت الأولوية عاجلة، فأسندها لمشرف المناوبة، وأضف قائمة تحقق الاستجابة، واجعل موعدها اليوم». خطط على ورق أولاً، ثم ابنِ خطوة بخطوة، واختبر على مهمة تجريبية. احذر الحلقات: أتمتتان تغيّر كل منهما ما تراقبه الأخرى قد تعملان بلا توقف وتستهلكان التشغيلات.', 'Advanced automations combine several conditions and actions to build a whole workflow: “When a task is created in Requests, if priority is Urgent, assign it to the shift supervisor, add the response checklist and set the due date to today”. Plan it on paper first, then build it step by step, and test on a practice task. Beware of loops: two automations that each change what the other watches can run forever and burn through your runs.'],
    like: ['مثل خط إنتاج في مصنع: كل محطة تنجز جزءاً، والمنتج يخرج كاملاً دون تدخل.', 'Like a factory production line: each station does a part, and the product comes out complete without intervention.'],
    demo: { scene: 'auto', steps: [
      { c: ['المُشغّل: عندما تُنشأ مهمة في «الطلبات».', 'Trigger: when a task is created in “Requests”.'], title: ['الطلبات', 'Requests'], trig: ['عندما تُنشأ مهمة', 'When a task is created'], cond: null, acts: [], made: false, list: null, run: null, log: null, hl: 'trig', click: true },
      { c: ['الشرط: إذا كانت الأولوية عاجلة.', 'Condition: if priority is Urgent.'], cond: ['إذا كانت الأولوية = عاجل', 'If priority = Urgent'], hl: 'cond', click: true },
      { c: ['أضف ثلاثة إجراءات.', 'Add three actions.'], acts: [['أسند إلى خالد (مشرف المناوبة)', 'Assign to Khalid (shift supervisor)'], ['أضف قائمة تحقق «الاستجابة»', 'Add the “Response” checklist'], ['اجعل الموعد اليوم', 'Set due date to today']], hl: 'act', click: true },
      { c: ['احفظ، ثم اختبر بمهمة تجريبية عاجلة.', 'Save, then test with an urgent practice task.'], hl: 'mkAuto', click: true },
      { c: ['النتيجة: أُسندت، وأُضيفت قائمة التحقق، وموعدها اليوم. تلقائياً.', 'The result: assigned, checklist added, due today. Automatically.'], made: true, run: { n: ['انقطاع برج 9 (تجربة)', 'Tower 9 outage (test)'], st: 'todo', who: 'khalid', check: ['الاستجابة: اتصل بالموقع', 'Response: call the site'] }, log: [['أُسندت إلى خالد', 'Assigned to Khalid'], ['أُضيفت قائمة التحقق', 'Checklist added'], ['الموعد: اليوم', 'Due: today']], hl: 'runCard' }
    ] },
    ex: ['مركز العمليات بنى أتمتة للأعطال العاجلة. وقت الاستجابة انخفض من 40 دقيقة إلى 10، لأن الإسناد والخطوات تحدث فور تسجيل العطل.', 'The operations centre built an automation for urgent faults. Response time dropped from 40 minutes to 10, because assignment and steps happen the moment a fault is logged.'],
    wrong: ['أتمتتان: الأولى تغير الحالة، والثانية تعيدها، فتعملان بلا نهاية.', 'Two automations: one changes the status, the other changes it back, so they run forever.'],
    right: ['ارسم سير العمل أولاً، وتأكد أنه لا توجد حلقة، واختبر على مهمة تجريبية.', 'Draw the workflow first, make sure there is no loop, and test on a practice task.'],
    quiz: { q: ['ما خطر «الحلقة» في الأتمتة؟', 'What is the danger of an automation “loop”?'], o: [['تعمل بلا توقف وتستهلك التشغيلات', 'They run forever and use up runs'], ['تحذف المساحة', 'They delete the Space'], ['لا خطر', 'There is no danger']], a: 0, why: ['أتمتتان تتبادلان التغيير تعملان بلا نهاية.', 'Two automations undoing each other run without end.'] }
  },
  'auto-other': {
    more: ['الأتمتة ليست الأداة الوحيدة لتوفير الوقت. لكل مشكلة أداتها: النماذج تحول الطلبات إلى مهام، والمهام المتكررة تعيد العمل الدوري، والقوالب تجهز المشاريع، والتكاملات تنقل البيانات بين الأدوات، والوكلاء الأذكياء يتولون أعمالاً تحتاج فهماً مثل الفرز والرد. الفكرة: ارسم سير عمل فريقك من الطلب إلى الإنجاز، وحدد الخطوات المتكررة، واختر لكل منها أبسط أداة تحلها.', 'Automations are not the only time-saver. Each problem has its tool: Forms turn requests into tasks, recurring tasks repeat routine work, templates set up projects, integrations move data between tools, and AI agents take on work that needs understanding, like sorting and replying. The idea: draw your team’s workflow from request to done, spot the repeating steps, and pick the simplest tool that solves each one.'],
    like: ['مثل صندوق العدة: لا تستخدم المطرقة لكل شيء؛ لكل مسمار أداته.', 'Like a toolbox: you do not use a hammer for everything; each screw has its tool.'],
    demo: { scene: 'journey', steps: [
      { c: ['سير عمل الطلبات من البداية للنهاية.', 'The request workflow from start to finish.'], items: [['form', ['نموذج يستقبل الطلب', 'A form receives the request'], '#0ea5e9'], ['robot', ['وكيل يفرزه', 'An agent sorts it'], '#14b8a6'], ['zap', ['أتمتة تسنده', 'An automation assigns it'], '#7b68ee'], ['template', ['قالب قائمة تحقق', 'A checklist template'], '#e8590c'], ['repeat', ['تقرير متكرر أسبوعياً', 'A weekly recurring report'], '#ec4899'], ['globe', ['إشعار في Teams', 'A Teams notification'], '#10b981']], lit: 1, hl: 'stop0', hello: null },
      { c: ['الوكيل الذكي يفهم الطلب ويحدد أولويته.', 'The AI agent understands the request and sets its priority.'], lit: 2, hl: 'stop1' },
      { c: ['الأتمتة تسنده وتضيف قالب الاستجابة.', 'The automation assigns it and adds the response template.'], lit: 4, hl: 'stop3' },
      { c: ['التقرير الأسبوعي يتكرر وحده، والإشعارات تصل في Teams.', 'The weekly report repeats itself, and notifications arrive in Teams.'], lit: 6, hl: 'stop5', hello: ['أبسط أداة تحل المشكلة هي الأفضل.', 'The simplest tool that solves the problem is the best.'] }
    ] },
    ex: ['قسم الموارد البشرية رسم رحلة طلب الإجازة: نموذج للطلب، أتمتة للإسناد للمدير، قالب للموافقة، وتقرير شهري متكرر. لم يحتج أي أداة خارجية.', 'HR mapped the leave-request journey: a form for the request, an automation to assign the manager, a template for approval, and a recurring monthly report. No outside tool was needed.'],
    wrong: ['استخدام وكيل ذكي لعمل يكفيه نموذج أو تكرار بسيط.', 'Using an AI agent for work that a form or simple recurrence would handle.'],
    right: ['ارسم سير العمل واختر أبسط أداة لكل خطوة.', 'Draw the workflow and pick the simplest tool for each step.'],
    quiz: { q: ['ما أفضل أداة لتقرير يتكرر كل أسبوع؟', 'What is the best tool for a report that repeats every week?'], o: [['مهمة متكررة (Recurring)', 'A recurring task'], ['وكيل ذكي معقد', 'A complex AI agent'], ['استيراد ملف', 'Importing a file']], a: 0, why: ['التكرار البسيط يكفي؛ لا تعقّد ما يمكن أن يكون بسيطاً.', 'Simple recurrence is enough; do not complicate what can be simple.'] }
  }
});
