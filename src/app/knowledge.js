/* ==========================================================================
   Knowledge source for Clicky Chatbot. Every published lesson, tour part,
   common question, saved answer and glossary term becomes one record with a
   stable ID, both languages, a link to where it lives on this site, the
   official ClickUp sources it was checked against, and its review date.
   Built once from the original content (Arabic, plus the English overlays),
   so it does not depend on the language currently shown. No DOM access:
   tools/export-knowledge.js runs this same file to write
   server/knowledge.json, the trusted copy the AI server quotes from.
   ========================================================================== */
const Knowledge = (() => {
  const ENL = typeof EN_LESSONS !== 'undefined' ? EN_LESSONS : {};
  const ENG = typeof EN_CORE !== 'undefined' && EN_CORE.GLOSSARY ? EN_CORE.GLOSSARY : {};
  const join = parts => parts.flat(3).filter(x => typeof x === 'string' && x.trim()).join('\n');
  const lessonText = l => join([l.objective, l.explain || [], l.deeper ? [l.deeper.title, l.deeper.body || []] : [], l.summary || [], l.mistake ? [l.mistake.wrong, l.mistake.right] : []]);
  const records = [];
  const add = (id, kind, title, text, url, refs) => records.push({ id, kind, title, text, url, refs: refs || [], reviewed: typeof REVIEW_DATE !== 'undefined' ? REVIEW_DATE : '', langs: ['ar', 'en'] });

  LESSONS.forEach(l => {
    const en = ENL[l.id] || {};
    const enL = Object.assign({}, l, en, { deeper: en.deeper ? Object.assign({}, l.deeper, en.deeper) : l.deeper, mistake: en.mistake ? Object.assign({}, l.mistake, en.mistake) : l.mistake });
    add('lesson:' + l.id, 'lesson', { ar: l.title, en: en.title || l.title }, { ar: lessonText(l), en: lessonText(enL) }, '#/lesson/' + l.id, (l.refs || []).map(r => ({ label: r.label, url: r.url })));
  });
  TOUR_PARTS.forEach(p => add('tour:' + p.id, 'tour', { ar: p.name[0], en: p.name[1] },
    { ar: join([p.one[0], p.where[0], (p.how || []).map(h => h[0])]), en: join([p.one[1], p.where[1], (p.how || []).map(h => h[1])]) }, '#/tour/' + p.id));
  CU_FAQ.forEach(f => add('faq:' + f.id, 'question', { ar: f.q[0], en: f.q[1] }, { ar: f.a[0], en: f.a[1] }, f.demo ? '#/lesson/' + f.demo : '#/questions'));
  CLICKY_KB.forEach(r => add('kb:' + r[1], 'answer', { ar: r[2][0], en: r[2][1] }, { ar: r[3][0], en: r[3][1] }, r[5] || '#/tour/' + r[0]));
  GLOSSARY.forEach(g => { const en = ENG[g.en] || {}; add('term:' + g.en, 'term', { ar: g.ar + ' (' + g.en + ')', en: g.en }, { ar: join([g.def, g.ex]), en: join([en.def || '', en.ex || '']) }, g.lesson ? '#/lesson/' + g.lesson : '#/help/glossary'); });

  if (typeof COURSES !== 'undefined') COURSES.forEach(c => c.topics().forEach(t => {
    const pick = k => [t.explain, t.more, t.doit || [], t.tip, t.ex].flat().filter(Boolean).map(x => Array.isArray(x) ? x[k] : x);
    add('course:' + t.id, 'course', { ar: t.t[0], en: t.t[1] }, { ar: join(pick(0)), en: join(pick(1)) }, '#/courses/' + c.id + '/' + t.id);
  }));
  const byId = Object.fromEntries(records.map(r => [r.id, r]));
  return { records, get: id => byId[id] || null };
})();
