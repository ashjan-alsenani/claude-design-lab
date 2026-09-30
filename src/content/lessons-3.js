/* Lessons: modules 9-12 */
LESSONS.push(
  /* ---------------- Module 9 ---------------- */
  {
    id: 'l9-1', module: 'm9', title: 'Trigger ثم Condition ثم Action', level: 'advanced', minutes: 9,
    objective: 'تصمم أتمتة من ثلاثة أجزاء: مُحفّز يبدأها، وشرط اختياري يضبطها، وإجراء ينفّذها.',
    scenario: 'كل مهمة عاجلة تصل إلى مرحلة REVIEW في قائمة التقارير يجب أن يراجعها سالم. الفريق ينسى تعيينه أحياناً.',
    explain: [
      '<strong>Trigger (المُحفّز):</strong> الحدث الذي يبدأ الأتمتة، مثل تغيّر الحالة أو إنشاء مهمة. ينطبق على المهام أو المهام الفرعية أو كليهما في Space أو Folder أو Subfolder أو List محددة.',
      '<strong>Condition (الشرط):</strong> جزء اختياري يجب أن يتحقق حتى يُنفَّذ الإجراء، مثل «الأولوية Urgent». الشروط تضيف دقة وتحكماً.',
      '<strong>Action (الإجراء):</strong> التغيير الذي تريده، مثل تعيين شخص أو إضافة تعليق أو تغيير الحالة. إذا أضفت أكثر من إجراء فإنها تُنفَّذ بالترتيب من الأعلى إلى الأسفل.',
      'اقرأ الأتمتة كجملة: «عندما تتغير الحالة إلى REVIEW، إذا كانت الأولوية Urgent، فعيّن سالم».'
    ],
    deeper: { title: 'شرط AI', body: ['في الخطط التي تتضمن ميزات الذكاء الاصطناعي يمكن إضافة شرط AI، لكن بحد أقصى شرط AI واحد لكل أتمتة.'] },
    notes: [{ kind: 'admin', text: 'إنشاء الأتمتة على موقع مشترك قد يتطلب صلاحيات معينة. نسّق مع مسؤول القائمة قبل تفعيل أتمتة تؤثر على عمل الآخرين.' }],
    demo: { scene: 'auto', steps: [
      { cap: 'نبدأ بالمُحفّز: متى تعمل الأتمتة؟ عندما تتغير الحالة.', act: [['move', 'au-trigger'], ['click'], ['show', 'trig-menu'], ['move', 'tm-status'], ['click'], ['hide', 'trig-menu'], ['text', 'au-trigger-text', 'Status changes to <b>REVIEW</b>']] },
      { cap: 'نضيف شرطاً: فقط إذا كانت الأولوية Urgent.', act: [['move', 'au-cond'], ['click'], ['show', 'cond-menu'], ['move', 'cm-prio'], ['click'], ['hide', 'cond-menu'], ['text', 'au-cond-text', 'Priority is <b>Urgent</b>']] },
      { cap: 'ثم الإجراء: عيّن سالم مراجِعاً. ونفعّل الأتمتة.', act: [['move', 'au-action'], ['click'], ['show', 'act-menu'], ['move', 'ac-assign'], ['click'], ['hide', 'act-menu'], ['text', 'au-action-text', 'Assign to <b>سالم</b>'], ['move', 'au-save'], ['click'], ['toggle', 'au-on']] },
      { cap: 'مهمة عاجلة انتقلت إلى REVIEW: تحقق الشرط، فعُيّن سالم تلقائياً.', act: [['move', 'a1-stw'], ['click'], ['text', 'a1-stw', '@st:review'], ['wait', 300], ['text', 'a1-as', '@av:salim'], ['show', 'au-log']] },
      { cap: 'مهمة منخفضة الأولوية انتقلت أيضاً، لكن الشرط لم يتحقق، فلم يُنفَّذ الإجراء.', act: [['move', 'a2-stw'], ['click'], ['text', 'a2-stw', '@st:review'], ['show', 'au-skip']] }
    ] },
    exercise: { type: 'builder', preview: 'automation', prompt: 'ابنِ أتمتة لهذه القاعدة: «كل طلب جديد يُنشأ في قائمة الطلبات الداخلية بأولوية Urgent يُعيَّن لمريم».',
      slots: [
        { key: 'trigger', label: 'Trigger', options: ['Task created', 'Status changes', 'Due date arrives'], answer: 'Task created' },
        { key: 'cond', label: 'Condition', options: ['بدون شرط', 'Priority is Urgent', 'Assignee is سالم'], answer: 'Priority is Urgent' },
        { key: 'action', label: 'Action', options: ['Assign to مريم', 'Change status to COMPLETE', 'Add a comment'], answer: 'Assign to مريم' }
      ], success: 'الأتمتة صحيحة: تبدأ بإنشاء المهمة، وتنفَّذ فقط للعاجل، وتعيّن مريم.' },
    mistake: { wrong: 'أتمتة بلا شرط تعيّن شخصاً على كل مهمة تتغير حالتها، فيغرق بالإشعارات.', right: 'أضف شرطاً يحصر الإجراء في الحالات المقصودة فقط.' },
    check: [
      { q: 'أي أجزاء الأتمتة اختياري؟', options: ['Trigger', 'Condition', 'Action', 'لا شيء'], answer: 1, why: 'الشرط اختياري، أما المُحفّز والإجراء فهما الجزءان الأساسيان.' },
      { q: 'أتمتة فيها ثلاثة إجراءات. بأي ترتيب تُنفَّذ؟', options: ['عشوائياً', 'من الأعلى إلى الأسفل', 'من الأسفل إلى الأعلى', 'كلها في لحظة واحدة دون ترتيب'], answer: 1, why: 'الإجراءات تُنفَّذ بالترتيب الذي أُضيفت به من الأعلى إلى الأسفل.' }
    ],
    summary: ['Trigger يبدأ، وCondition يضبط، وAction ينفّذ.', 'اقرأها كجملة: عندما... إذا... فـ...', 'الإجراءات بالترتيب من الأعلى.'],
    refs: [{ label: 'Intro to Automations', url: H + '6312102752791-Intro-to-Automations' }, { label: 'Use Automation Triggers', url: H + '6312128853015-Use-Automation-Triggers' }, { label: 'Use Automation Conditions', url: H + '6312136485527-Use-Automation-Conditions' }, { label: 'Use Automation Actions', url: H + '6312097314199-Use-Automation-Actions' }]
  },
  {
    id: 'l9-2', module: 'm9', title: 'اختبار الأتمتة وحدودها وتجنّب النتائج غير المقصودة', level: 'advanced', minutes: 8,
    objective: 'تختبر الأتمتة على نطاق صغير قبل تعميمها، وتحسب استهلاك الإجراءات، وتتجنب الآثار الجانبية.',
    scenario: 'أنشأ زميل أتمتة على Space كاملة لتغيير المسؤول عند تغيّر الحالة، وفجأة تغيّر مسؤولو عشرات المهام.',
    explain: [
      '<strong>اختبر صغيراً:</strong> جرّب الأتمتة على List تجريبية أو على مهمة واحدة، وتحقق من النتيجة، ثم وسّع نطاقها.',
      '<strong>الاستهلاك يُحسب بالإجراءات:</strong> كل إجراء يُرسَل للتنفيذ يستهلك إجراءً شهرياً واحداً سواء نجح أو فشل. أما الإجراء الذي تخطّاه النظام لأن الشرط لم يتحقق فلا يستهلك شيئاً.',
      '<strong>الحدود:</strong> جميع الخطط يمكنها استخدام الأتمتة، وحدود الإجراءات تتجدد في أول كل شهر (بتوقيت PST)، ويصل تنبيه بالبريد للمالكين والمسؤولين عند بلوغ 90% و100%.',
      '<strong>تجنّب المفاجآت:</strong> أضف شروطاً دقيقة، وسمِّ الأتمتة باسم يشرح ما تفعله، وراجع قائمة الأتمتة المفعّلة في الموقع قبل إضافة جديدة حتى لا تتعارض اثنتان.'
    ],
    deeper: { title: 'الأتمتة المتسلسلة', body: ['إجراء أتمتة قد يكون مُحفّزاً لأتمتة أخرى. قبل التفعيل اسأل: هل سيؤدي هذا التغيير إلى تشغيل شيء آخر؟'] },
    notes: [{ kind: 'plan', text: 'عدد إجراءات الأتمتة الشهرية يختلف بحسب الخطة، ويمكن شراء إضافات للإجراءات في خطة Business Plus وما فوقها.' }],
    demo: { scene: 'auto', steps: [
      { cap: 'أتمتة بلا شرط: «عندما تتغير الحالة، عيّن سالم». تبدو بسيطة.', act: [['text', 'au-trigger-text', 'Status changes'], ['text', 'au-cond-text', '<span class="mx-note">No condition</span>'], ['text', 'au-action-text', 'Assign to <b>سالم</b>'], ['toggle', 'au-on'], ['move', 'au-panel']] },
      { cap: 'نغيّر حالة مهمتين. الأتمتة تعيّن سالم على الاثنتين، ومنهما مهمة لا تخصه. هذه نتيجة غير مقصودة.', act: [['move', 'a1-stw'], ['click'], ['text', 'a1-stw', '@st:review'], ['text', 'a1-as', '@av:salim'], ['move', 'a2-stw'], ['click'], ['text', 'a2-stw', '@st:review'], ['text', 'a2-as', '@av:salim'], ['show', 'au-log'], ['text', 'au-log-text', 'شُغّلت الأتمتة مرتين: إجراءان مستهلكان.']] },
      { cap: 'نصحح بإضافة شرط يحصرها في المهام العاجلة.', act: [['move', 'au-cond'], ['click'], ['show', 'cond-menu'], ['move', 'cm-prio'], ['click'], ['hide', 'cond-menu'], ['text', 'au-cond-text', 'Priority is <b>Urgent</b>']] },
      { cap: 'الآن المهمة غير العاجلة تُتخطى، والإجراء المتخطى لا يستهلك من رصيد الإجراءات.', act: [['text', 'a2-as', '@av:noura'], ['show', 'au-skip'], ['text', 'au-log-text', 'مهمة عاجلة: إجراء واحد. المهمة الأخرى: تُخطيت (0).']] }
    ] },
    exercise: { type: 'choice', prompt: 'أتمتة فيها إجراءان (تعيين مسؤول ثم إضافة تعليق). شُغّل المُحفّز 10 مرات هذا الشهر، وفي 4 منها لم يتحقق الشرط. كم إجراءً استُهلك من الرصيد الشهري؟',
      options: [
        { t: '12 إجراءً', ok: true, fb: 'صحيح: 6 مرات تحقق فيها الشرط × إجراءان = 12. المرات الأربع المتخطاة لا تستهلك شيئاً.' },
        { t: '20 إجراءً', ok: false, fb: 'هذا يحسب كل مرات التشغيل، لكن الإجراءات المتخطاة لعدم تحقق الشرط لا تُستهلك.' },
        { t: '10 إجراءات', ok: false, fb: 'الاستهلاك يُحسب لكل إجراء مُرسَل، لا لكل تشغيل.' },
        { t: '6 إجراءات', ok: false, fb: 'في كل مرة تحقق فيها الشرط أُرسل إجراءان، لا إجراء واحد.' }
      ] },
    mistake: { wrong: 'تفعيل أتمتة جديدة على Space كاملة مباشرة، ثم اكتشاف أثرها على عشرات المهام.', right: 'اختبرها على List تجريبية، وأضف شرطاً دقيقاً، ثم وسّع النطاق.' },
    check: [
      { q: 'إجراء أُرسل للتنفيذ لكنه فشل. هل يُستهلك من الرصيد؟', options: ['لا', 'نعم، يستهلك إجراءً واحداً', 'يستهلك نصف إجراء', 'يستهلك إجراءين'], answer: 1, why: 'الإجراء المُرسَل يستهلك إجراءً شهرياً واحداً سواء نجح أو فشل.' },
      { q: 'متى تتجدد حدود إجراءات الأتمتة؟', options: ['كل أسبوع', 'في أول كل شهر', 'كل سنة', 'لا تتجدد'], answer: 1, why: 'حدود الإجراءات تتجدد في أول كل شهر (بتوقيت PST).' }
    ],
    summary: ['اختبر على نطاق صغير أولاً.', 'الإجراء المُرسَل يُستهلك ولو فشل، والمتخطى لا يُستهلك.', 'الحدود تتجدد شهرياً.', 'شروط دقيقة وأسماء واضحة.'],
    refs: [{ label: 'Automations feature availability and limits', url: H + '23477062949911-Automations-feature-availability-and-limits' }, { label: 'Track Automations usage', url: H + '10936258508311-Track-Automations-usage' }, { label: 'Manage Automations', url: H + '6312119071383-Manage-Automations' }]
  },

  /* ---------------- Module 10 ---------------- */
  {
    id: 'l10-1', module: 'm10', title: 'النماذج: استقبال الطلبات وتحويلها إلى مهام', level: 'intermediate', minutes: 8,
    objective: 'تبني نموذج طلب داخلي يُنشئ مهمة مكتملة البيانات في القائمة الصحيحة عند كل إرسال.',
    scenario: 'تصل الطلبات الداخلية عبر البريد بصيغ مختلفة وتنقصها معلومات. تريد نموذجاً موحداً يحوّل كل طلب إلى مهمة.',
    explain: [
      'عند إرسال نموذج (Form) تُنشأ <strong>مهمة إرسال</strong> في الموقع المحدد. كل سؤال في النموذج يُربط بحقل في المهمة: عنوانها، أو وصفها، أو تاريخها، أو حقل مخصص.',
      'من تبويب Settings في النموذج، في قسم «After submitting form»، تختار القائمة التي تُنشأ فيها المهام (Create task in). ويمكن تطبيق قالب مهمة تلقائياً عند الإرسال، وإسناد الإرسالات تلقائياً إلى شخص واحد.',
      'زر responses ينقلك إلى القائمة التي تُنشأ فيها الإرسالات، ويمكن تنزيل كل الإرسالات كملف CSV.'
    ],
    deeper: { title: 'المنطق الديناميكي', body: ['في خطتي Business Plus وEnterprise يمكن إضافة قواعد وشروط للأسئلة، مثل إظهار حقل تاريخ الاستحقاق إذا اختير Urgent في سؤال الأولوية.'] },
    notes: [{ kind: 'plan', text: 'المنطق الديناميكي (Dynamic logic) متاح في Business Plus وEnterprise. ويختلف توفر Form view وحدوده بحسب الخطة.' }],
    demo: { scene: 'form', steps: [
      { cap: 'في Form view نربط كل سؤال بحقل: العنوان، والإدارة (حقل مخصص)، والتاريخ.', act: [['move', 'q1'], ['on', 'q1', 'mx-highlight'], ['move', 'q2'], ['off', 'q1', 'mx-highlight'], ['on', 'q2', 'mx-highlight'], ['move', 'q3'], ['off', 'q2', 'mx-highlight']] },
      { cap: 'نضيف سؤالاً للأولوية حتى تصل الطلبات العاجلة مصنّفة من البداية.', act: [['move', 'q-add'], ['click'], ['show', 'q4']] },
      { cap: 'في الإعدادات: تُنشأ المهام في «طلبات داخلية»، وتُسند تلقائياً إلى مريم للفرز.', act: [['move', 'fs-assign'], ['click'], ['show', 'assign-menu'], ['move', 'fa-maryam'], ['click'], ['hide', 'assign-menu'], ['text', 'fs-assign', 'Assign to: مريم']] },
      { cap: 'موظف من إدارة المبيعات يعبّئ النموذج ويرسله.', act: [['move', 'fp-name'], ['click'], ['type', 'fp-name', 'تقرير مبيعات الباقات الشهري'], ['move', 'fp-dept'], ['click'], ['type', 'fp-dept', 'المبيعات'], ['move', 'fp-date'], ['click'], ['type', 'fp-date', '30 سبتمبر'], ['move', 'fp-submit'], ['click']] },
      { cap: 'النتيجة: مهمة جديدة في القائمة الصحيحة، ببياناتها، ومسندة إلى مريم.', act: [['show', 'form-task'], ['show', 'form-note'], ['move', 'form-task']] }
    ] },
    exercise: { type: 'match', prompt: 'اربط كل سؤال في نموذج الطلب الداخلي بالحقل المناسب في المهمة.',
      choices: ['Task name', 'Task description', 'Due date', 'Custom Field (Dropdown)', 'Attachment'],
      pairs: [['عنوان الطلب', 'Task name'], ['تفاصيل الطلب', 'Task description'], ['التاريخ المطلوب', 'Due date'], ['الإدارة الطالبة', 'Custom Field (Dropdown)'], ['المستند الداعم', 'Attachment']] },
    mistake: { wrong: 'نموذج بسؤال نصي واحد «اكتب طلبك»، فتصل المهام بلا تاريخ ولا إدارة.', right: 'سؤال لكل حقل تحتاجه للفرز والمتابعة، مع إسناد تلقائي لمن يفرز.' },
    check: [
      { q: 'ماذا يحدث عند إرسال نموذج في ClickUp؟', options: ['يصل بريد فقط', 'تُنشأ مهمة في الموقع المحدد', 'يُحدَّث Dashboard فقط', 'يُحفظ ملف PDF'], answer: 1, why: 'كل إرسال يُنشئ مهمة في الموقع المحدد.' },
      { q: 'أين تحدد القائمة التي تُنشأ فيها مهام الإرسال؟', options: ['في Settings، قسم After submitting form', 'في Dashboard', 'في الإعدادات الشخصية', 'في Inbox'], answer: 0, why: 'من Settings ثم Create task in.' }
    ],
    summary: ['كل إرسال = مهمة.', 'اربط كل سؤال بحقل.', 'حدد القائمة والإسناد والقالب من الإعدادات.'],
    refs: [{ label: 'Intro to Forms and Form view', url: H + '6310233090711-Intro-to-Forms-and-Form-view' }, { label: 'Form settings', url: H + '30750021046167-Form-settings' }, { label: 'Form view availability and limits', url: H + '25810829634711-Form-view-feature-availability-and-limits' }]
  },
  {
    id: 'l10-2', module: 'm10', title: 'الأهداف والمستهدفات', level: 'advanced', minutes: 7,
    objective: 'تحوّل هدفاً عاماً إلى مستهدفات قابلة للقياس، وتختار نوع المستهدف المناسب.',
    scenario: 'هدف الربع: «إغلاق إجراءات التدقيق المفتوحة». تريد أن يرى الجميع التقدم نحوه بأرقام واضحة.',
    explain: [
      '<strong>Goal</strong> هدف عالي المستوى يتكون من <strong>Targets</strong> صغيرة قابلة للقياس. يُستخدم لمتابعة OKRs أو أهداف الفترات أو بطاقات الأداء الأسبوعية.',
      'أنواع المستهدفات: <strong>Number</strong> لنطاق رقمي (مثل إغلاق 10 ملاحظات)، و<strong>True/False</strong> لإنجاز يتم أو لا يتم، و<strong>Currency</strong> لهدف مالي، و<strong>Task</strong> لربط التقدم بإنجاز مهام محددة.',
      'تقدّم الهدف يُحسب من تقدّم مستهدفاته، فكلما حدّثت مستهدفاً تحرك الهدف.'
    ],
    deeper: { title: 'هدف جيد', body: ['اجعل كل مستهدف قابلاً للقياس ومحدداً بفترة. «تحسين التدقيق» ليس مستهدفاً؛ «إغلاق 10 ملاحظات قبل 30 سبتمبر» مستهدف.'] },
    notes: [
      { kind: 'plan', text: 'Goals متاحة في جميع الخطط مع حدود استخدام في الخطة المجانية (100 استخدام)، وGoal Folders في Business وما فوقها. يمكن للضيوف استخدام Goals.' },
      { kind: 'uncertain', text: 'قد يختلف مكان Goals في الواجهة وتوفرها بين إصدارات ClickUp، وبعض المؤسسات تتابع الأهداف بطرق عرض وحقول بدلاً منها. راجع صفحة Goals في مركز المساعدة.' }
    ],
    demo: { scene: 'goals', steps: [
      { cap: 'الهدف: إغلاق إجراءات التدقيق للربع الثالث. تقدّمه الآن 30%.', act: [['move', 'goal-pct'], ['wait', 300]] },
      { cap: 'المستهدف الأول رقمي: أُغلقت 3 ملاحظات من 10. نحدّثه إلى 6.', act: [['move', 't1'], ['click'], ['width', 't1-bar', 60], ['text', 't1-val', '6 / 10'], ['width', 'goal-bar', 45], ['text', 'goal-pct', '45%']] },
      { cap: 'نضيف مستهدفاً من نوع Task: يتقدم تلقائياً كلما أُنجزت مهام قائمة الربع الثالث.', act: [['move', 'add-target'], ['click'], ['show', 'target-menu'], ['move', 'tt-task'], ['click'], ['hide', 'target-menu'], ['show', 't3wrap']] },
      { cap: 'تقدّم الهدف يجمع مستهدفاته. الكل يرى أين نحن دون تقرير منفصل.', act: [['width', 'goal-bar', 47], ['text', 'goal-pct', '47%'], ['move', 'goal-bar']] }
    ] },
    exercise: { type: 'match', prompt: 'اختر نوع المستهدف لكل عنصر.',
      choices: ['Number', 'True/False', 'Currency', 'Task'],
      pairs: [['إغلاق 12 ملاحظة تدقيق', 'Number'], ['اعتماد تقرير الإغلاق من الإدارة', 'True/False'], ['خفض تكاليف الطباعة بمقدار 3,000 ريال', 'Currency'], ['إنجاز مهام قائمة «الربع الثالث»', 'Task']] },
    mistake: { wrong: 'هدف بلا مستهدفات قابلة للقياس، فيبقى تقدّمه 0% أو يُحدَّث بالتقدير.', right: 'قسّم الهدف إلى مستهدفات رقمية أو مرتبطة بمهام تتحدث مع العمل.' },
    check: [
      { q: 'مم يتكون Goal؟', options: ['من Tags', 'من Targets قابلة للقياس', 'من Dashboards', 'من Automations'], answer: 1, why: 'الهدف يتكون من مستهدفات قابلة للقياس.' },
      { q: 'مستهدف «اعتماد التقرير» إما يتم أو لا. ما نوعه؟', options: ['Number', 'Currency', 'True/False', 'Task'], answer: 2, why: 'True/False لإنجاز يتم أو لا يتم.' }
    ],
    summary: ['Goal = مستهدفات قابلة للقياس.', 'Number وTrue/False وCurrency وTask.', 'التقدم يُحسب من المستهدفات.'],
    refs: [{ label: 'Create a Goal', url: H + '6325733579671-Create-a-Goal' }, { label: 'Use ClickUp to track goals and OKRs', url: H + '6327987972119-Use-ClickUp-to-track-goals-and-OKRs' }, { label: 'Goals cards', url: H + '6325664888727-Goals-cards' }]
  },

  /* ---------------- Module 11 ---------------- */
  {
    id: 'l11-1', module: 'm11', title: 'الأدوار والضيوف ومستويات الصلاحية', level: 'advanced', minutes: 9,
    objective: 'تميّز بين الأدوار (Owner وAdmin وMember وLimited Member وGuest) ومستويات الصلاحية الأربعة.',
    scenario: 'مستشار خارجي سيراجع عقداً واحداً، وزميل من إدارة أخرى سيشارك في قائمة واحدة فقط. تريد إعطاء كل منهما ما يحتاجه لا أكثر.',
    explain: [
      '<strong>أدوار الأعضاء:</strong> Owner يملك مساحة العمل، وAdmin عضو بصلاحيات إضافية لإدارتها، وMember يعمل في المساحات المتاحة له.',
      '<strong>Limited Member:</strong> من داخل المؤسسة، لكنه يصل فقط إلى المواقع والعناصر المشتركة معه. الأشخاص الذين يستخدمون نطاق بريد مؤسستك لا يُضافون كضيوف، بل كأعضاء محدودين.',
      '<strong>Guest:</strong> من خارج المؤسسة، ويصل فقط إلى ما يُشارك معه. أنواع الضيوف تعتمد على الخطة: View only، وPermission-controlled، وفي الخطة المجانية نوع واحد. والضيوف لا يستطيعون مشاركة أي شيء حتى مع صلاحية التعديل.',
      '<strong>مستويات الصلاحية:</strong> View only للمشاهدة، وComment للتعليق، وEdit للتعديل، وFull edit للتعديل الكامل. وتُطبَّق بشكل مختلف بحسب العنصر والموقع والدور.'
    ],
    deeper: { title: 'مبدأ أقل صلاحية لازمة', body: ['امنح كل شخص أقل صلاحية تكفي لعمله. من يحتاج إبداء ملاحظات يكفيه Comment، ولا حاجة لـ Edit.'] },
    notes: [
      { kind: 'admin', text: 'دعوة الأعضاء وتغيير أدوارهم من مهام مالكي مساحة العمل ومسؤوليها. الموظف يشارك العناصر في حدود صلاحياته فقط.' },
      { kind: 'plan', text: 'أنواع الضيوف وبعض الأدوار ورسومها تعتمد على خطة الاشتراك.' }
    ],
    demo: { scene: 'share', steps: [
      { cap: 'نفتح مشاركة قائمة «إجراءات التدقيق» لنرى من يصل إليها وبأي صلاحية.', act: [['move', 'share-btn'], ['click'], ['show', 'share-modal']] },
      { cap: 'مريم عضو في الفريق بصلاحية Full edit. نورة عضو بصلاحية Edit لكنها غير مفعّلة هنا.', act: [['move', 'p-maryam-perm'], ['on', 'p-maryam', 'mx-highlight'], ['wait', 300], ['off', 'p-maryam', 'mx-highlight']] },
      { cap: 'ندعو المستشار الخارجي ببريده، فيُضاف ضيفاً (Guest).', act: [['move', 'invite'], ['click'], ['hide', 'invite-ph'], ['type', 'invite', 'consultant@example.com', true], ['show', 'p-guest-wrap']] },
      { cap: 'يكفيه إبداء الملاحظات، فنمنحه Comment لا Edit: أقل صلاحية لازمة.', act: [['move', 'p-guest-perm'], ['click'], ['show', 'perm-menu'], ['move', 'pm-comment'], ['click'], ['hide', 'perm-menu'], ['text', 'p-guest-perm', 'Comment']] }
    ] },
    exercise: { type: 'match', prompt: 'اختر الدور الأنسب لكل شخص.',
      choices: ['Member', 'Limited Member', 'Guest', 'Admin'],
      pairs: [['موظف في الفريق يعمل في معظم مساحات الإدارة', 'Member'], ['زميل من إدارة أخرى في المؤسسة يشارك في قائمة واحدة فقط', 'Limited Member'], ['مستشار خارجي يراجع عقداً واحداً', 'Guest'], ['من يدير إعدادات مساحة العمل وأعضاءها', 'Admin']] },
    mistake: { wrong: 'منح الجميع Full edit «لتسهيل الأمور».', right: 'امنح أقل صلاحية لازمة: View only أو Comment عندما يكفي ذلك.' },
    check: [
      { q: 'زميل يستخدم بريد المؤسسة ويحتاج الوصول إلى قائمة واحدة. كيف يُضاف؟', options: ['Guest', 'Limited Member', 'Owner', 'لا يمكن إضافته'], answer: 1, why: 'من يستخدم نطاق بريد المؤسسة لا يُضاف ضيفاً، بل عضواً محدوداً.' },
      { q: 'هل يستطيع الضيف مشاركة عنصر مع آخرين إذا مُنح صلاحية Edit؟', options: ['نعم', 'لا، الضيوف لا يشاركون أي شيء', 'نعم مع الضيوف فقط', 'فقط في Docs'], answer: 1, why: 'بحسب مركز المساعدة، الضيوف لا يستطيعون مشاركة أي شيء حتى مع صلاحية التعديل.' },
      { q: 'ما مستويات الصلاحية الأربعة؟', options: ['Read وWrite وDelete وAdmin', 'View only وComment وEdit وFull edit', 'Low وMedium وHigh وUrgent', 'Owner وAdmin وMember وGuest'], answer: 1, why: 'View only وComment وEdit وFull edit.' }
    ],
    summary: ['Owner وAdmin وMember للأعضاء.', 'Limited Member من الداخل بوصول محدد.', 'Guest من الخارج بوصول محدد ولا يشارك.', 'View only وComment وEdit وFull edit.'],
    refs: [{ label: 'Intro to user roles', url: H + '6310033667223-Intro-to-user-roles' }, { label: 'Guest-type user roles', url: H + '6310022323991-Guest-type-user-roles' }, { label: 'Owner, admin, and member-type user roles', url: H + '25710132309655-Owner-admin-and-member-type-user-roles' }, { label: 'Permissions in detail', url: H + '6309221065495-Permissions-in-detail' }]
  },
  {
    id: 'l11-2', module: 'm11', title: 'المواقع الخاصة والوراثة ومشاركة مهمة بعينها', level: 'advanced', minutes: 9,
    objective: 'تشارك مهمة واحدة دون كشف القائمة كلها، وتفرّق بين تعيين المسؤول ومنح الوصول، وتفهم أثر الوراثة.',
    scenario: 'قائمة «إجراءات التدقيق» خاصة. المستشار الخارجي يحتاج إبداء ملاحظات على مهمة «مراجعة عقد المورد» فقط، ولا يجوز أن يرى بقية الإجراءات.',
    explain: [
      '<strong>الخاص (Private):</strong> العنصر أو الموقع الخاص لا يراه إلا من شُورك معه. يمكن جعل Space أو Folder أو List أو مهمة خاصة.',
      '<strong>الوراثة:</strong> الصلاحيات المضبوطة على موقع تنتقل عادة إلى ما بداخله. مشاركة القائمة كاملة تعني الوصول إلى كل مهامها.',
      '<strong>مشاركة مهمة بعينها:</strong> لا يلزم مشاركة القائمة كلها. يمكنك مشاركة المهمة نفسها مع شخص من داخل مساحة العمل أو خارجها، وتحديد صلاحيته. ومن لديه وصول إلى عنصر خاص يستطيع مشاركته مع غيره بصلاحية مساوية لصلاحيته أو أقل.',
      '<strong>التعيين ليس وصولاً:</strong> Assignee يحدد من ينفّذ. أما الوصول فتحدده المشاركة والصلاحيات. عيّن الشخص وشارك معه العنصر.'
    ],
    deeper: { title: 'طلب الوصول', body: ['عندما يفتح شخص رابطاً لعنصر خاص لا يملك وصولاً إليه، قد يُطلب منه إرسال طلب وصول يوافق عليه من يملك الصلاحية. راجع مقال Request and approve access.'] },
    notes: [
      { kind: 'uncertain', text: 'قواعد الصلاحيات تختلف بحسب الدور والعنصر والخطة وإعدادات الأمان المتقدمة لمؤسستك. تحقق من صفحة Permissions in detail، واسأل مسؤول مساحة العمل قبل مشاركة بيانات حساسة.' },
      { kind: 'admin', text: 'قد تقيّد المؤسسة دعوة الضيوف أو مشاركة العناصر خارجياً من إعدادات الأمان. التزم بسياسة مؤسستك في حماية البيانات.' }
    ],
    demo: { scene: 'share', opts: { lock: true }, steps: [
      { cap: 'القائمة خاصة (لاحظ القفل). المستشار يحتاج مهمة واحدة فقط، فلن نشارك القائمة.', act: [['move', 'side-list-audit'], ['on', 'side-list-audit', 'mx-highlight'], ['wait', 300], ['off', 'side-list-audit', 'mx-highlight']] },
      { cap: 'نفتح قائمة خيارات المهمة نفسها ونختار Share task.', act: [['move', 'task-x'], ['click'], ['show', 'row-menu'], ['move', 'rm-share'], ['click'], ['hide', 'row-menu'], ['text', 'share-title', 'مشاركة المهمة: مراجعة عقد المورد مع المستشار'], ['show', 'share-modal']] },
      { cap: 'ندعو المستشار إلى هذه المهمة فقط، بصلاحية Comment.', act: [['move', 'invite'], ['click'], ['hide', 'invite-ph'], ['type', 'invite', 'consultant@example.com', true], ['show', 'p-guest-wrap']] },
      { cap: 'النتيجة: يرى المهمة ويعلّق عليها، ولا يرى بقية إجراءات التدقيق.', act: [['text', 'inherit-note', 'تُشارك هذه المهمة وحدها. بقية القائمة تبقى خاصة.'], ['move', 'inherit-note'], ['on', 'inherit-note', 'mx-highlight']] }
    ] },
    exercise: { type: 'builder', preview: 'share', prompt: 'اضبط المشاركة لحالة المستشار: قائمة خاصة، ويحتاج إبداء ملاحظات على مهمة «مراجعة عقد المورد» فقط.',
      slots: [
        { key: 'what', label: 'ماذا تشارك؟', options: ['القائمة كاملة', 'المهمة فقط', 'Space العمليات'], answer: 'المهمة فقط' },
        { key: 'role', label: 'بأي دور يُضاف؟', options: ['Guest', 'Member', 'Admin'], answer: 'Guest' },
        { key: 'perm', label: 'الصلاحية', options: ['View only', 'Comment', 'Edit', 'Full edit'], answer: 'Comment' },
        { key: 'assign', label: 'هل يكفي تعيينه Assignee دون مشاركة؟', options: ['نعم، التعيين يمنح الوصول', 'لا، يلزم مشاركة المهمة معه'], answer: 'لا، يلزم مشاركة المهمة معه' }
      ], success: 'مشاركة دقيقة: مهمة واحدة، لضيف، بصلاحية تعليق، مع فهم أن التعيين لا يمنح الوصول.' },
    mistake: { wrong: 'مشاركة القائمة كاملة مع مستشار يحتاج مهمة واحدة، فيرى بيانات لا تخصه.', right: 'شارك المهمة نفسها فقط، بأقل صلاحية لازمة.' },
    check: [
      { q: 'عيّنت زميلاً على مهمة في قائمة خاصة لم تُشارك معه. هل يراها؟', options: ['نعم، التعيين يكفي', 'ليس بالضرورة؛ الوصول يحتاج مشاركة', 'نعم لكن بعد يوم', 'لا يمكن تعيينه أصلاً'], answer: 1, why: 'التعيين يحدد المنفّذ، والوصول تحدده المشاركة والصلاحيات.' },
      { q: 'عضو لديه صلاحية Edit على عنصر خاص. ما أعلى صلاحية يستطيع منحها لغيره؟', options: ['Full edit', 'Edit أو أقل', 'Admin', 'لا يستطيع المشاركة'], answer: 1, why: 'يمكن منح صلاحية مساوية أو أقل فقط.' },
      { q: 'هل يلزم مشاركة القائمة كاملة لمشاركة مهمة واحدة منها؟', options: ['نعم دائماً', 'لا، يمكن مشاركة المهمة وحدها', 'فقط للضيوف', 'فقط في الخطة المجانية'], answer: 1, why: 'يمكن مشاركة المهام العامة والخاصة مباشرة مع أشخاص من داخل مساحة العمل أو خارجها.' }
    ],
    summary: ['الخاص يراه من شُورك معه فقط.', 'مشاركة الموقع تورّث الوصول إلى ما بداخله.', 'شارك المهمة وحدها عندما يكفي ذلك.', 'التعيين ليس وصولاً.'],
    refs: [{ label: 'Share Spaces, Folders, Lists, and tasks', url: H + '6309266954263-Share-Spaces-Folders-Lists-and-tasks' }, { label: 'Make items private', url: H + '7255448709655-Make-Spaces-Folders-Subfolders-Lists-and-tasks-private' }, { label: 'Request and approve access', url: H + '20421677556119-Request-and-approve-access-to-tasks' }, { label: 'Permissions in detail', url: H + '6309221065495-Permissions-in-detail' }]
  },

  /* ---------------- Module 12 ---------------- */
  {
    id: 'l12-1', module: 'm12', title: 'الاختصارات والبحث المتقدم', level: 'advanced', minutes: 7,
    objective: 'تفعّل اختصارات لوحة المفاتيح، وتستخدم شريط الأوامر والبحث المضيَّق، وأوامر الشرطة المائلة.',
    scenario: 'تقضي وقتاً طويلاً في النقر للوصول إلى المهام. تريد الوصول إلى أي شيء في ثوانٍ.',
    explain: [
      '<strong>اختصارات لوحة المفاتيح معطّلة افتراضياً.</strong> فعّلها من صورتك الشخصية ثم Settings ثم قسم Preferences ثم Keyboard Shortcuts. وهي متاحة في كل الخطط ولكل الأدوار.',
      'لعرض قائمة الاختصارات اضغط <kbd>Shift</kbd> + <kbd>?</kbd> من أي مكان خارج حقول النص.',
      '<strong>شريط الأوامر والبحث:</strong> <kbd>Ctrl</kbd> + <kbd>K</kbd> على Windows أو <kbd>Cmd</kbd> + <kbd>K</kbd> على Mac. اكتب جزءاً من الاسم، ثم ضيّق بالنوع أو المسؤول.',
      '<strong>أوامر الشرطة المائلة:</strong> اكتب / في الوصف أو التعليق للإدراج السريع، مثل <code>/waiting</code> و<code>/blocking</code> للاعتماديات. وفي تطبيق سطح المكتب: <kbd>Ctrl</kbd> + <kbd>E</kbd> (أو <kbd>Cmd</kbd> + <kbd>E</kbd>) لإنشاء مهمة من أي تطبيق.'
    ],
    deeper: { title: 'ابدأ باختصارين فقط', body: ['لا تحاول حفظ القائمة كلها. ابدأ بشريط الأوامر وعرض قائمة الاختصارات، وأضف اختصاراً جديداً كل أسبوع.'] },
    notes: [{ kind: 'uncertain', text: 'قد تختلف بعض الاختصارات بحسب نظام التشغيل وإصدار ClickUp واللغة. ارجع دائماً إلى القائمة التي تظهر بـ Shift + ?.' }],
    demo: { scene: 'cmd', steps: [
      { cap: 'نضغط Ctrl + K لفتح شريط الأوامر والبحث من أي مكان.', act: [['move', 'kbd'], ['on', 'kbd', 'mx-highlight'], ['wait', 300], ['off', 'kbd', 'mx-highlight'], ['show', 'cmdk']] },
      { cap: 'نكتب جزءاً من الاسم، فتظهر مهام ومستندات مطابقة.', act: [['move', 'cmd-input'], ['type', 'cmd-text', 'التقرير الأسبوعي'], ['show', 'cmd-results']] },
      { cap: 'نضيّق النتائج إلى ما أُسند إلينا فقط، فتختفي المهمة المكتملة لزميل.', act: [['move', 'cf-assignee'], ['click'], ['hide', 'cr3'], ['move', 'cr1'], ['click'], ['hide', 'cmdk']] },
      { cap: 'Shift + ? يعرض قائمة الاختصارات. تذكّر: يجب تفعيلها أولاً من الإعدادات.', act: [['text', 'kbd', '@kbd:Shift+?'], ['move', 'kbd'], ['show', 'sheet']] }
    ] },
    exercise: { type: 'match', prompt: 'طابق كل إجراء مع طريقته المختصرة.',
      choices: ['Shift + ?', 'Ctrl/Cmd + K', 'Ctrl/Cmd + E (تطبيق سطح المكتب)', '/waiting'],
      pairs: [['عرض قائمة اختصارات لوحة المفاتيح', 'Shift + ?'], ['فتح شريط الأوامر والبحث', 'Ctrl/Cmd + K'], ['إنشاء مهمة من أي تطبيق على جهازك', 'Ctrl/Cmd + E (تطبيق سطح المكتب)'], ['إنشاء اعتمادية من داخل الوصف أو التعليق', '/waiting']] },
    mistake: { wrong: 'محاولة استخدام الاختصارات دون تفعيلها، ثم الظن أنها لا تعمل.', right: 'فعّلها من Settings ثم Preferences ثم Keyboard Shortcuts.' },
    check: [
      { q: 'ما الحالة الافتراضية لاختصارات لوحة المفاتيح؟', options: ['مفعّلة للجميع', 'معطّلة وتُفعّل من الإعدادات الشخصية', 'متاحة للمسؤولين فقط', 'غير موجودة'], answer: 1, why: 'الاختصارات معطّلة افتراضياً وتُفعّل من الإعدادات الشخصية.' },
      { q: 'كيف تعرض قائمة الاختصارات؟', options: ['Ctrl + P', 'Shift + ?', 'Alt + F4', 'Esc'], answer: 1, why: 'Shift + ? من أي مكان خارج حقول النص.' }
    ],
    summary: ['فعّل الاختصارات أولاً.', 'Shift + ? لعرضها.', 'Ctrl/Cmd + K للبحث والأوامر.', '/ للإدراج السريع.'],
    refs: [{ label: 'Use keyboard shortcuts', url: H + '6309030550167-Use-keyboard-shortcuts' }, { label: 'AI Command Bar (Command Center)', url: H + '6533695640343-Intro-to-Command-Center' }, { label: 'Use /Slash Commands', url: H + '6308960837911-Use-Slash-Commands' }]
  },
  {
    id: 'l12-2', module: 'm12', title: 'التكاملات والذكاء الاصطناعي وسير العمل القابل لإعادة الاستخدام', level: 'advanced', minutes: 9,
    objective: 'تبني سير عمل متكاملاً قابلاً لإعادة الاستخدام، وتستخدم ميزات الذكاء الاصطناعي والتكاملات بحذر ووفق سياسة مؤسستك.',
    scenario: 'نجح فريقك في تنظيم الطلبات الداخلية، وتريد إدارة أخرى نسخ الطريقة نفسها دون إعادة البناء من الصفر.',
    explain: [
      '<strong>سير العمل القابل لإعادة الاستخدام</strong> يجمع ما تعلمته: نموذج يستقبل الطلب، وقائمة بحالات واضحة، وقالب مهمة بقائمة تحقق، وأتمتة تفرز حسب الأولوية، وDashboard يتابع المتأخر. احفظ القائمة أو المهمة كقالب لتكرارها.',
      '<strong>الذكاء الاصطناعي (ClickUp Brain):</strong> بحسب الخطة والإضافات، يمكن تلخيص المحادثات، وإنشاء بطاقات AI في Dashboards، وإضافة شرط AI واحد في الأتمتة. راجع الناتج دائماً قبل الاعتماد عليه، ولا تُدخل بيانات حساسة خلافاً لسياسة مؤسستك.',
      '<strong>التكاملات:</strong> تربط ClickUp بأدوات أخرى مثل البريد والتقويم والتخزين. تفعيلها يخضع لقرار مسؤول مساحة العمل وسياسة أمن المعلومات.'
    ],
    deeper: { title: 'أخطاء شائعة في المستوى المتقدم', body: ['أتمتة بلا اختبار. لوحات بمصادر بيانات غير محددة. مشاركة مواقع كاملة بدل عناصر محددة. حقول نصية حيث يلزم Dropdown. قوالب لا تُحدَّث عندما تتغير الطريقة.'] },
    notes: [
      { kind: 'plan', text: 'ميزات ClickUp Brain تعتمد على الخطة أو إضافة مدفوعة، وقد لا تكون مفعّلة في مؤسستك.' },
      { kind: 'admin', text: 'التكاملات وميزات الذكاء الاصطناعي يفعّلها مسؤول مساحة العمل وفق سياسة المؤسسة. الموظف لا يربط أدوات خارجية ببيانات العمل دون موافقة.' }
    ],
    demo: { scene: 'cmd', steps: [
      { cap: 'في الخطط التي تتضمن ClickUp Brain يمكن طلب ملخص سريع للعمل المفتوح.', act: [['move', 'ai-btn'], ['click'], ['show', 'ai-out'], ['type', 'ai-text', 'مهمتان مفتوحتان: تحديث لوحة المؤشرات (مرتفعة، مريم، الثلاثاء) ومراجعة التقرير الأسبوعي (عادية، أنت، الخميس).']] },
      { cap: 'الناتج مسودة تساعدك، لا حقيقة نهائية. راجعه مقابل المهام نفسها.', act: [['move', 'ai-out'], ['on', 'ai-out', 'mx-highlight'], ['wait', 400], ['off', 'ai-out', 'mx-highlight']] },
      { cap: 'التكاملات تربط ClickUp بأدوات أخرى، ويقرر تفعيلها مسؤول مساحة العمل وفق سياسة المؤسسة.', act: [['hide', 'ai-out'], ['move', 'int-btn'], ['click'], ['show', 'int-out']] }
    ] },
    exercise: { type: 'order', prompt: 'رتّب مكونات سير عمل الطلبات الداخلية القابل لإعادة الاستخدام حسب تدفق الطلب.',
      items: ['نموذج Form يستقبل الطلب ببيانات موحدة', 'مهمة تُنشأ في قائمة الطلبات بقالب وقائمة تحقق', 'أتمتة تفرز حسب الأولوية وتعيّن المسؤول', 'Dashboard يتابع المفتوح والمتأخر', 'مراجعة شهرية لتحسين النموذج والقالب'] },
    mistake: { wrong: 'نسخ مخرجات الذكاء الاصطناعي في تقرير رسمي دون مراجعة.', right: 'عامل الناتج كمسودة، وتحقق منه مقابل المهام والبيانات الأصلية.' },
    check: [
      { q: 'كم شرط AI يمكن إضافته في الأتمتة الواحدة؟', options: ['بلا حد', 'واحد فقط', 'ثلاثة', 'لا يمكن إضافة أي شرط AI'], answer: 1, why: 'بحسب مركز المساعدة، شرط AI واحد فقط لكل أتمتة.' },
      { q: 'من يقرر عادة تفعيل تكامل مع أداة خارجية؟', options: ['أي ضيف', 'مسؤول مساحة العمل وفق سياسة المؤسسة', 'الذكاء الاصطناعي تلقائياً', 'لا أحد'], answer: 1, why: 'التكاملات تخضع لإدارة مساحة العمل وسياسة أمن المعلومات.' }
    ],
    summary: ['اجمع النموذج والقائمة والقالب والأتمتة واللوحة في سير عمل واحد.', 'احفظه كقالب لإعادة الاستخدام.', 'الذكاء الاصطناعي مسودة تُراجَع.', 'التكاملات بموافقة المسؤول.'],
    refs: [{ label: 'Intro to ClickUp 4.0', url: H + '31142608907543-Intro-to-ClickUp-4-0' }, { label: 'Intro to cards (AI cards)', url: H + '25757497269143-Intro-to-cards' }, { label: 'Create an Automation', url: H + '30241682127127-Create-an-Automation' }]
  }
);

const LESSON = Object.fromEntries(LESSONS.map(l => [l.id, l]));
MODULES.forEach(m => { m.lessons = LESSONS.filter(l => l.module === m.id).map(l => l.id); });
/* Stable question IDs shared by both languages */
LESSONS.forEach(l => (l.check || []).forEach((q, i) => { q.id = l.id + '-c' + (i + 1); }));
