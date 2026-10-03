/**
 * Validates every practice bank (src/data/practice/<subject>/<unit>/*.json)
 * and writes src/data/practice/index.json (counts + concepts per unit).
 * Runs before every build (npm "prebuild"); exits with an error if a bank is broken.
 *   node scripts/practice-index.mjs          validate + write index
 *   node scripts/practice-index.mjs --report also print a coverage report
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/practice/', import.meta.url).pathname;
const REPORT = process.argv.includes('--report');
const DIFF = ['easy', 'medium', 'hard', 'challenge'];
const COG = ['knowledge', 'understanding', 'application', 'analysis', 'reasoning'];
const SKILLS = ['listening', 'vocabulary', 'grammar', 'reading', 'writing'];
const STYLES = ['concept', 'diagram', 'data', 'experiment', 'scenario', 'cause', 'error', 'calculation', 'visual', 'word', 'reasoning', 'estimate'];
const TYPES = ['choice', 'tf', 'multi', 'number', 'remainder', 'text', 'order', 'match', 'sort', 'writing'];
const AR = /[؀-ۿ]/;
const LAT = /[A-Za-z]/;

const errors = [];
const warns = [];
const index = {};
const seenIds = new Map();

const num = (s) => {
  const t = String(s).trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s  ]/g, '').replace(/[٫,]/g, '.').replace(/[−–]/g, '-');
  return t !== '' && !Number.isNaN(Number(t)) ? Number(t) : NaN;
};
const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
/** for duplicate options: keep symbols (< > = + − × ÷ matter in math), ignore spacing only */
const same = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

for (const subject of readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory())) {
  for (const unit of readdirSync(join(ROOT, subject)).filter((d) => statSync(join(ROOT, subject, d)).isDirectory())) {
    const files = readdirSync(join(ROOT, subject, unit)).filter((f) => f.endsWith('.json')).sort();
    const concepts = new Map();
    const passages = new Map();
    const questions = [];
    for (const f of files) {
      const where = `${subject}/${unit}/${f}`;
      let bank;
      try {
        bank = JSON.parse(readFileSync(join(ROOT, subject, unit, f), 'utf8'));
      } catch (e) {
        errors.push(`${where}: invalid JSON (${e.message})`);
        continue;
      }
      if (bank.subject !== subject || bank.unit !== unit) errors.push(`${where}: subject/unit must be "${subject}"/"${unit}"`);
      for (const c of bank.concepts ?? []) {
        if (concepts.has(c.id)) errors.push(`${where}: concept "${c.id}" declared twice`);
        if (!c.label || !c.lesson) errors.push(`${where}: concept "${c.id}" needs label and lesson`);
        concepts.set(c.id, c);
      }
      for (const p of bank.passages ?? []) passages.set(p.id, p);
      for (const q of bank.questions ?? []) questions.push({ q, where });
    }
    const prompts = new Map();
    for (const { q, where } of questions) {
      const at = `${where} ${q.id}`;
      const bad = (m) => errors.push(`${at}: ${m}`);
      if (!q.id) { bad('missing id'); continue; }
      if (seenIds.has(q.id)) bad(`duplicate id (also in ${seenIds.get(q.id)})`);
      seenIds.set(q.id, where);
      if (!TYPES.includes(q.type)) bad(`unknown type "${q.type}"`);
      if (!DIFF.includes(q.difficulty)) bad(`difficulty must be one of ${DIFF}`);
      if (!COG.includes(q.cognitive)) bad(`cognitive must be one of ${COG}`);
      if (q.style && !STYLES.includes(q.style)) bad(`unknown style "${q.style}"`);
      const c = concepts.get(q.concept);
      if (!c) bad(`concept "${q.concept}" is not declared`);
      else if (c.lesson !== q.lesson) bad(`lesson "${q.lesson}" differs from its concept's lesson "${c.lesson}"`);
      for (const k of ['prompt', 'explanation', 'tip']) if (!q[k] || typeof q[k] !== 'string') bad(`missing ${k}`);
      if (subject === 'english') {
        if (!SKILLS.includes(q.skill)) bad(`english questions need skill (${SKILLS})`);
        if (q.skill === 'listening' && !q.audio) bad('listening questions need audio');
        if (q.prompt && !LAT.test(q.prompt)) bad('english prompt should be in English');
      } else if (q.prompt && !AR.test(q.prompt)) bad('prompt should be in Arabic');
      if (q.passage) {
        const p = passages.get(q.passage);
        if (!p) bad(`passage "${q.passage}" not found`);
        else if (q.evidence && !p.text.toLowerCase().includes(q.evidence.toLowerCase())) bad(`evidence not found in passage: "${q.evidence}"`);
      } else if (q.evidence && q.audio && !q.audio.toLowerCase().includes(q.evidence.toLowerCase())) bad(`evidence not found in audio: "${q.evidence}"`);
      if (q.sentence && !q.sentence.includes('___')) bad('sentence needs ___');
      const ids = (arr) => arr.map((x) => x.id);
      const uniq = (arr, what) => { if (new Set(arr).size !== arr.length) bad(`duplicate ${what}`); };
      switch (q.type) {
        case 'choice':
          if (!Array.isArray(q.options) || q.options.length < 2) bad('choice needs ≥ 2 options');
          else {
            uniq(ids(q.options), 'option ids');
            uniq(q.options.map((o) => same(o.text) + (o.emoji ?? '')), 'option texts');
            if (!ids(q.options).includes(q.answer)) bad(`answer "${q.answer}" is not an option`);
            for (const k of Object.keys(q.wrongWhy ?? {})) if (!ids(q.options).includes(k) || k === q.answer) bad(`wrongWhy key "${k}" is not a wrong option`);
          }
          break;
        case 'tf':
          if (typeof q.answer !== 'boolean') bad('tf answer must be true/false');
          break;
        case 'multi':
          if (!Array.isArray(q.options) || q.options.length < 3) bad('multi needs ≥ 3 options');
          else {
            uniq(ids(q.options), 'option ids');
            if (!q.answers?.length || q.answers.some((a) => !ids(q.options).includes(a))) bad('multi answers must be option ids');
            if (q.answers?.length === q.options.length) bad('multi: not every option can be correct');
          }
          break;
        case 'number':
          if (Number.isNaN(num(q.answer))) bad(`number answer "${q.answer}" is not a number`);
          for (const a of q.accept ?? []) if (num(a) !== num(q.answer)) bad(`accept "${a}" differs from answer`);
          for (const m of q.mistakes ?? []) {
            if (Number.isNaN(num(m.answer))) bad(`mistake "${m.answer}" not numeric`);
            if (num(m.answer) === num(q.answer)) bad(`mistake "${m.answer}" equals the answer`);
          }
          break;
        case 'remainder':
          if (Number.isNaN(num(q.quotient)) || Number.isNaN(num(q.remainder))) bad('remainder needs numeric quotient and remainder');
          break;
        case 'text':
          if (!q.answer) bad('text needs answer');
          if (q.scrambled && [...q.scrambled.replace(/\s/g, '').toLowerCase()].sort().join('') !== [...q.answer.replace(/\s/g, '').toLowerCase()].sort().join('')) bad('scrambled letters do not match answer');
          if (q.pattern) {
            const p = q.pattern.replace(/\s/g, '');
            const a = q.answer.replace(/\s/g, '');
            if (p.length !== a.length || [...p].some((ch, i) => ch !== '_' && ch.toLowerCase() !== a[i].toLowerCase())) bad(`pattern "${q.pattern}" does not fit answer`);
          }
          break;
        case 'order':
          if (!q.items || q.items.length < 3) bad('order needs ≥ 3 items');
          else uniq(ids(q.items), 'item ids');
          break;
        case 'match':
          if (!q.pairs || q.pairs.length < 2) bad('match needs ≥ 2 pairs');
          else { uniq(ids(q.pairs), 'pair ids'); uniq(q.pairs.map((p) => same(p.right)), 'right sides'); uniq(q.pairs.map((p) => same(p.left)), 'left sides'); }
          break;
        case 'sort':
          if (!q.buckets || q.buckets.length < 2) bad('sort needs ≥ 2 buckets');
          else if (!q.items?.length || q.items.some((i) => !ids(q.buckets).includes(i.bucket))) bad('sort items need valid buckets');
          break;
        case 'writing':
          if (!q.minWords || !q.starter || !q.model) bad('writing needs minWords, starter and model');
          break;
      }
      const key = norm(q.prompt) + '|' + norm(q.sentence ?? '') + '|' + norm(q.audio ?? '') + '|' + JSON.stringify(q.answer ?? q.answers ?? q.items ?? q.pairs ?? '');
      if (prompts.has(key)) warns.push(`${at}: same prompt and answer as ${prompts.get(key)}`);
      prompts.set(key, q.id);
    }
    const byLesson = {};
    const byDifficulty = { easy: 0, medium: 0, hard: 0, challenge: 0 };
    for (const { q } of questions) {
      byLesson[q.lesson] = (byLesson[q.lesson] ?? 0) + 1;
      if (q.difficulty in byDifficulty) byDifficulty[q.difficulty]++;
    }
    index[unit] = { subject, total: questions.length, concepts: [...concepts.values()], byLesson, byDifficulty };
    if (REPORT) {
      const pct = (n) => `${Math.round((100 * n) / Math.max(1, questions.length))}%`;
      const types = {};
      const cog = {};
      const styles = {};
      const perConcept = {};
      for (const { q } of questions) {
        types[q.type] = (types[q.type] ?? 0) + 1;
        cog[q.cognitive] = (cog[q.cognitive] ?? 0) + 1;
        const st = q.skill ?? q.style ?? '-';
        styles[st] = (styles[st] ?? 0) + 1;
        perConcept[q.concept] = (perConcept[q.concept] ?? 0) + 1;
      }
      console.log(`\n== ${subject}/${unit}: ${questions.length} questions, ${concepts.size} concepts`);
      console.log('  difficulty', Object.entries(byDifficulty).map(([k, v]) => `${k} ${v} (${pct(v)})`).join(' · '));
      console.log('  lessons   ', JSON.stringify(byLesson));
      console.log('  types     ', JSON.stringify(types));
      console.log('  cognitive ', JSON.stringify(cog));
      console.log('  style/skill', JSON.stringify(styles));
      const thin = Object.entries(perConcept).filter(([, n]) => n < 4).map(([k]) => k);
      const unused = [...concepts.keys()].filter((k) => !perConcept[k]);
      if (thin.length) console.log('  concepts with < 4 questions:', thin.join(', '));
      if (unused.length) console.log('  concepts without questions:', unused.join(', '));
    }
  }
}

if (warns.length) console.warn(`practice banks: ${warns.length} warning(s)\n  ` + warns.slice(0, 40).join('\n  '));
if (errors.length) {
  console.error(`practice banks: ${errors.length} error(s)\n  ` + errors.slice(0, 80).join('\n  '));
  process.exit(1);
}
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(index, null, 1) + '\n');
console.log(`practice banks OK: ${Object.values(index).reduce((a, u) => a + u.total, 0)} questions in ${Object.keys(index).length} unit(s)`);
