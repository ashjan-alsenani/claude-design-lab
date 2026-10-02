/* ==========================================================================
   Courses for Beginners: the course registry. Each course has an id, its
   look, its sections and its topics. To add a course, add one entry here and
   its content file(s) in src/content/ (see DESIGN.md, "Adding a course").
   ========================================================================== */
const COURSES = [
  {
    id: 'clickup4',
    ic: 'sparkle', c: '#7b68ee', g: 'linear-gradient(135deg, #2b1a6b 0%, #5b2bd6 45%, #c026d3 100%)',
    level: ['مبتدئ', 'Beginner'],
    short: ['ClickUp 4.0', 'ClickUp 4.0'],
    title: ['ClickUp 4.0 للمبتدئين: أتقن مساحة العمل المدعومة بالذكاء الاصطناعي', 'ClickUp 4.0 for Beginners: Master the AI-Powered Workspace'],
    sub: ['دليل ClickUp 4.0 الشامل لعام 2026: من أول مهمة إلى بناء فرق تعمل باستقلالية وإدارة الوكلاء الأذكياء (Super Agents).', 'The complete 2026 ClickUp 4.0 blueprint: from your first task to building autonomous teams and managing Super Agents.'],
    learn: [
      ['كيف تستخدم ClickUp لإدارة أي مشروع أو فريق', 'How to use ClickUp to manage any project or team'],
      ['أفضل الممارسات عند العمل في ClickUp', 'Best practices when using ClickUp'],
      ['حيل ونصائح لتستخدم ClickUp كالمحترفين', 'Tips and tricks to use ClickUp like a pro'],
      ['كل الميزات الرئيسية وكيف تستخدمها، ومنها الذكاء الاصطناعي والوكلاء', 'All the main features and how to use them, including AI and Super Agents']
    ],
    sections: () => COURSE_SECTIONS,
    topics: () => COURSE.map(r => Object.assign({ sec: r[0], id: r[1], t: r[2], explain: r[3], doit: r[4], tip: r[5], link: r[6] }, (typeof C4_DEEP !== 'undefined' && C4_DEEP[r[1]]) || {})),
    interview: () => COURSE_INTERVIEW,
    rpTitle: ['مقابلة لوظيفة تعاون في المشاريع: أثبت خبرتك في ClickUp', 'Interviewing for a project collaboration role: show your ClickUp expertise']
  },
  {
    id: 'clickup-pro',
    ic: 'rocket', c: '#0e7490', g: 'linear-gradient(135deg, #0b2545 0%, #0e7490 48%, #f97316 100%)',
    level: ['متوسط إلى متقدم', 'Intermediate to advanced'],
    short: ['ClickUp للمحترفين', 'ClickUp Pro'],
    title: ['ClickUp: الدورة التدريبية من المستوى المتوسط إلى المتقدم', 'ClickUp: The Intermediate to Advanced Training Course'],
    sub: ['انقل مهاراتك في ClickUp إلى المستوى التالي. تعلّم نصائح وحيل الإنتاجية الخفية التي لا يستخدمها كثيرون.', 'Take your ClickUp skills to the next level. Learn the hidden productivity tips and tricks that not many people use.'],
    learn: [
      ['ميزات ClickUp التي يستخدمها المحترفون', 'ClickUp features used by professionals'],
      ['نصائح وحيل لزيادة الإنتاجية باستخدام ClickUp', 'Tips and tricks to increase productivity with ClickUp'],
      ['الميزات المتقدمة في ClickUp', 'Advanced features in ClickUp'],
      ['التكاملات في ClickUp', 'Integrations in ClickUp'],
      ['وظائف خفية لا يعرفها ويستخدمها كثيرون', 'Hidden functionality that not many people know and use']
    ],
    sections: () => ADV_SECTIONS,
    topics: () => ADV_TOPICS(),
    interview: null
  }
];
const COURSE_BY_ID = id => COURSES.find(c => c.id === id) || null;
