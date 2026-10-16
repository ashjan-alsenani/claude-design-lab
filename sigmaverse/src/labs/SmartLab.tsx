import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, CircleX, Lightbulb, TriangleAlert } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { fmt, improvementPercent, parseNumber } from '../lib/metrics'
import { recordLab, update } from '../lib/store'

type Level = 'pass' | 'warn' | 'fail'
type Letter = 'S' | 'M' | 'A' | 'R' | 'T'
interface Verdict { letter: Letter; name: string; level: Level; notes: string[] }

const MONTHS = '(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)'
const DATE_RE = new RegExp(`\\b(by|before|on|until)\\s+(the\\s+)?(end\\s+of\\s+)?(\\d{1,2}\\s+)?${MONTHS}\\b[^.,;]*|\\b(by|before)\\s+(q[1-4]|h[12]|\\d{1,2}/\\d{1,2}/\\d{2,4}|(19|20)\\d{2})\\b[^.,;]*|\\bwithin\\s+\\d+\\s+(days?|weeks?|months?)\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b`, 'i')
const VERB_RE = /^\s*(reduce|increase|decrease|improve|raise|lower|cut|shorten|lift|grow|achieve)\b/i
const LOWER_VERBS = /^\s*(reduce|decrease|lower|cut|shorten)\b/i
const METRIC_RE = /\b(rate|time|times|%|percent|percentage|number|count|days?|hours?|minutes?|cost|accuracy|yield|score|backlog|errors?|defects?|calls?|visits?|complaints?|dpmo|sla|nps|csat|duration)\b/i
const VAGUE_RE = /\b(as much as possible|significantly|better|world[- ]class|asap|soon|a lot|somewhat|greatly|substantially|best possible)\b/i
const SOLUTION_RE = /\b(by|through|using)\s+(implementing|deploying|installing|introducing|buying|hiring|automating|launching|rolling out|adding)\b|\b(implement|deploy|install|buy|hire|automate)\b/i
const SCOPE_RE = /\b(for|in|at|across|on)\s+(the\s+)?[A-Za-z]+/i

interface Parsed { baseline: number | null; target: number | null; unit: string; metric: string; date: string | null; lowerBetter: boolean | null }

function parse(goal: string): Parsed {
  const m = goal.match(/\bfrom\s+([\d.,]+)\s*(%|[a-z]+(?:\s[a-z]+)?)?\s+to\s+([\d.,]+)\s*(%|working days|[a-z]+)?/i)
  const baseline = m ? parseNumber(m[1]) : null
  const target = m ? parseNumber(m[3]) : null
  const unit = m ? ((m[2] && /%|days?|hours?|minutes?|seconds?|working days/i.test(m[2]) ? m[2] : m[4]) ?? '') : ''
  const metricMatch = goal.match(/^\s*\w+\s+(?:the\s+)?(.+?)\s+from\b/i)
  const metric = metricMatch ? metricMatch[1] : ''
  const dm = goal.match(DATE_RE)
  let lowerBetter: boolean | null = null
  if (LOWER_VERBS.test(goal)) lowerBetter = true
  else if (/^\s*(increase|raise|lift|grow)\b/i.test(goal)) lowerBetter = false
  else if (baseline !== null && target !== null && baseline !== target) lowerBetter = target < baseline
  return { baseline, target, unit: unit.trim(), metric, date: dm ? dm[0].trim() : null, lowerBetter }
}

function keyword(a: string, b: string): string | null {
  const stop = new Set(['reduce', 'increase', 'from', 'with', 'within', 'region', 'customer', 'customers', 'their'])
  const wa = new Set(a.toLowerCase().match(/[a-z]{4,}/g) ?? [])
  for (const w of b.toLowerCase().match(/[a-z]{4,}/g) ?? []) if (wa.has(w) && !stop.has(w)) return w
  return null
}

function evaluate(goal: string, p: Parsed, achievableOk: boolean, entitlement: number | null, ctq: string, relevantOk: boolean): Verdict[] {
  const g = goal.trim()
  const words = g.split(/\s+/).filter(Boolean).length
  // Specific
  const sNotes: string[] = []
  let s: Level = 'pass'
  if (!VERB_RE.test(g)) { s = 'warn'; sNotes.push('Start with an action verb on the metric: Reduce, Increase, Shorten.') }
  if (!METRIC_RE.test(g)) { s = 'fail'; sNotes.push('Name one metric, for example "30-day repeat visit rate" or "median approval time".') }
  if (VAGUE_RE.test(g)) { s = s === 'fail' ? 'fail' : 'warn'; sNotes.push(`Vague wording found: "${g.match(VAGUE_RE)![0]}". Replace it with a number.`) }
  if (SOLUTION_RE.test(g)) { s = 'fail'; sNotes.push('The goal names a solution. A goal says how much, not how; the solution is chosen in Improve.') }
  if (!SCOPE_RE.test(g) || words < 8) { s = s === 'pass' ? 'warn' : s; sNotes.push('Say which process, region or population the goal covers.') }
  if (s === 'pass') sNotes.push('One metric, one scope, an action verb and no solution.')
  // Measurable
  const mNotes: string[] = []
  let m: Level
  if (p.baseline !== null && p.target !== null) { m = 'pass'; mNotes.push(`Baseline ${fmt(p.baseline)}${p.unit === '%' ? '%' : ''} and target ${fmt(p.target)}${p.unit === '%' ? '%' : ''} found${p.unit && p.unit !== '%' ? ` (${p.unit})` : ''}.`) }
  else if ((g.match(/\d+(\.\d+)?\s*%|\b\d+(\.\d+)?\b/g) ?? []).length >= 1) { m = 'warn'; mNotes.push('A number is present, but not both a baseline and a target. Use "from [baseline] to [target]".') }
  else { m = 'fail'; mNotes.push('No numbers. Without a baseline and target nobody can prove improvement.') }
  // Achievable
  const aNotes: string[] = []
  let a: Level = 'warn'
  if (p.baseline !== null && p.target !== null && p.baseline > 0) {
    const change = Math.abs(improvementPercent(p.baseline, p.target))
    aNotes.push(`The target asks for a ${fmt(change, 1)}% ${p.lowerBetter === false ? 'increase' : 'reduction'} relative to baseline.`)
    let warn = false
    if (change >= 70) { warn = true; aNotes.push('That is breakthrough territory (around 70% or more). Check it against best demonstrated performance.') }
    if (entitlement !== null && p.lowerBetter !== null) {
      const beyond = p.lowerBetter ? p.target < entitlement : p.target > entitlement
      if (beyond) { warn = true; aNotes.push(`The target goes beyond the best demonstrated performance (${fmt(entitlement)}). That usually needs redesign, not tuning.`) }
      else aNotes.push(`The target is within the best demonstrated performance (${fmt(entitlement)}): a credible stretch.`)
    }
    a = achievableOk && !warn ? 'pass' : 'warn'
    if (!achievableOk) aNotes.push('Confirm below that you checked the target against data.')
  } else {
    a = 'fail'
    aNotes.push('Achievability cannot be judged without a baseline and a target.')
  }
  // Relevant
  const rNotes: string[] = []
  let r: Level = 'fail'
  const kw = ctq.trim() ? keyword(ctq, g) : null
  if (relevantOk && kw) { r = 'pass'; rNotes.push(`Linked to the CTQ or primary metric (shared term "${kw}").`) }
  else if (relevantOk) { r = 'warn'; rNotes.push('You confirmed the link, but the goal wording does not mention the CTQ metric. Use the same metric words.') }
  else rNotes.push('Name the CTQ or primary metric this goal serves and confirm the link.')
  // Time-bound
  const tNotes: string[] = []
  let t: Level
  if (p.date) { t = 'pass'; tNotes.push(`Deadline found: "${p.date}".`) }
  else if (/\b(this|next)\s+(year|quarter|month)\b|\bsoon\b|\beventually\b/i.test(g)) { t = 'warn'; tNotes.push('"This year" or "soon" is not a deadline. Give a calendar date.') }
  else { t = 'fail'; tNotes.push('No deadline. Add "by [date]".') }
  if (!g) return (['S', 'M', 'A', 'R', 'T'] as Letter[]).map((l, i) => ({ letter: l, name: NAMES[i], level: 'fail', notes: ['Type or load a goal statement to evaluate it.'] }))
  return [
    { letter: 'S', name: NAMES[0], level: s, notes: sNotes },
    { letter: 'M', name: NAMES[1], level: m, notes: mNotes },
    { letter: 'A', name: NAMES[2], level: a, notes: aNotes },
    { letter: 'R', name: NAMES[3], level: r, notes: rNotes },
    { letter: 'T', name: NAMES[4], level: t, notes: tNotes },
  ]
}
const NAMES = ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound']

function rewrite(goal: string, p: Parsed, ctq: string): string {
  const verb = p.lowerBetter === false ? 'Increase' : 'Reduce'
  const metric = (p.metric && !VAGUE_RE.test(p.metric) ? p.metric : ctq.trim() || '[metric]').replace(SOLUTION_RE, '').trim()
  const u = p.unit === '%' ? '%' : p.unit ? ` ${p.unit}` : ''
  const base = p.baseline !== null ? `${fmt(p.baseline)}${u}` : '[baseline]'
  const tgt = p.target !== null ? `${fmt(p.target)}${u}` : '[target]'
  const date = p.date ? p.date.replace(/^(by|before|on|until)\s+/i, '') : '[date]'
  const scope = goal.match(/\b(for|in|at|across)\s+(the\s+)?[A-Z][\w-]*(\s[\w-]+){0,3}/)?.[0]
  return `${verb} the ${metric.replace(/^the\s+/i, '')}${scope && !metric.includes(scope) ? ` ${scope}` : ''} from ${base} to ${tgt} by ${date}.`
}

interface Example { goal: string; ctq: string; good: boolean; note: string }
const EXAMPLES: Example[] = [
  { goal: 'Reduce the 30-day repeat visit rate for North region broadband faults from 18.4% to 9.0% by 31 Mar 2027.', ctq: 'Repeat visit rate', good: true, note: 'One metric, scope, baseline, target and date.' },
  { goal: 'Reduce the median invoice approval time at the Leeds centre from 11.3 to 5 working days by 30 Apr 2027.', ctq: 'Invoice approval time', good: true, note: 'Mirrors the problem statement metric and units.' },
  { goal: 'Increase the share of P2 incidents restored within the 4-hour SLA from 81.3% to 90% by 30 Jun 2027.', ctq: 'P2 incidents restored within SLA', good: true, note: 'Higher is better here, so the verb is Increase.' },
  { goal: 'Improve first-time fix as much as possible.', ctq: 'First-time fix rate', good: false, note: 'No baseline, no target, no date.' },
  { goal: 'Reduce repeat visits by deploying remote line testing by June 2027.', ctq: 'Repeat visit rate', good: false, note: 'A solution smuggled into the goal, and no numbers.' },
  { goal: 'Make customers happier this year.', ctq: 'CSAT score', good: false, note: 'Not specific, not measurable, no real deadline.' },
  { goal: 'Reduce average hold time on the billing line from 7.8 to 0.5 minutes by 31 Jan 2027.', ctq: 'Hold time on billing line', good: false, note: 'Measurable and time-bound, but a 94% cut in two months is unlikely to be achievable.' },
  { goal: 'Reduce morning discharge delays on Ward 7 from 41% to 20% of planned discharges by 31 May 2027.', ctq: 'Discharges completed before noon', good: true, note: 'Healthcare example. Check Relevant: does the wording use the CTQ metric?' },
]

/* ---------------- Challenge ---------------- */
interface Round { kind: 'fail' | 'fix'; goal: string; options: string[]; answer: number; why: string }
const POOL: Round[] = [
  { kind: 'fail', goal: 'Reduce invoice errors at the Leeds centre from 6.4% to 2% as soon as possible.', options: NAMES, answer: 4, why: '"As soon as possible" is not a deadline. Everything else is in place.' },
  { kind: 'fail', goal: 'Improve the contact centre experience by 31 Mar 2027.', options: NAMES, answer: 1, why: 'There is a date but no metric, baseline or target, so it fails Measurable (and Specific).' },
  { kind: 'fail', goal: 'Reduce the provisioning backlog from 1,874 to 0 orders by next Friday.', options: NAMES, answer: 2, why: 'A zero backlog in a week is not credible against the data. It fails Achievable.' },
  { kind: 'fail', goal: 'Reduce office printer paper use from 40 to 25 reams a month by 31 Jan 2027 (project charter: repeat fault visits).', options: NAMES, answer: 3, why: 'Fine on its own, but it does not serve the project CTQ (repeat visits). It fails Relevant.' },
  { kind: 'fail', goal: 'Reduce repeat calls by rolling out a new knowledge base by 30 Jun 2027.', options: NAMES, answer: 0, why: 'It names a solution instead of a target and has no baseline. Specific fails first (and Measurable too).' },
  { kind: 'fail', goal: 'Increase first contact resolution in billing support from 62% to 71% eventually.', options: NAMES, answer: 4, why: '"Eventually" gives no date.' },
  { kind: 'fix', goal: 'Fix this goal: "Make installs faster."', options: [
    'Make installs much faster this year.',
    'Reduce the median lead time for residential fibre installations in the North region from 14 to 9 working days by 30 Jun 2027.',
    'Reduce installation lead time by hiring 10 engineers.',
    'Reduce install time to zero by next month.',
  ], answer: 1, why: 'Specific metric and scope, baseline and target, a date, no solution, and a credible stretch.' },
  { kind: 'fix', goal: 'Fix this goal: "Improve invoice accuracy using automation."', options: [
    'Reduce the share of invoices returned for wrong cost-centre codes from 6.4% to 2.0% by 31 Mar 2027.',
    'Automate invoices to reach 100% accuracy.',
    'Improve accuracy significantly by Q2.',
    'Reduce errors as much as possible.',
  ], answer: 0, why: 'It removes the solution and adds a measurable metric, baseline, target and date.' },
  { kind: 'fix', goal: 'Fix this goal: "Patients should leave hospital earlier."', options: [
    'Install an electronic discharge system on Ward 7.',
    'Discharge everyone before 9 am from tomorrow.',
    'Increase the share of Ward 7 planned discharges completed before noon from 59% to 80% by 31 May 2027.',
    'Make discharges better this year.',
  ], answer: 2, why: 'One metric, a scope, baseline, target and date, with no solution.' },
]

function Challenge() {
  const [seed, setSeed] = useState(0)
  const rounds = useMemo(() => {
    const fails = shuffle(POOL.filter(r => r.kind === 'fail')).slice(0, 4)
    const fixes = shuffle(POOL.filter(r => r.kind === 'fix')).slice(0, 2).map(r => {
      const order = shuffle(r.options.map((_, i) => i))
      return { ...r, options: order.map(i => r.options[i]), answer: order.indexOf(r.answer) }
    })
    return [...fails, ...fixes]
  }, [seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const r = rounds[Math.min(i, rounds.length - 1)]
  if (i >= rounds.length) {
    return (
      <div className="rounded-2xl bg-coral-soft p-5">
        <p className="font-display text-2xl font-semibold text-ink">You scored {score} of {rounds.length}</p>
        <p className="mt-1 text-sm text-ink-2">A SMART goal names one metric, gives a baseline and a target, is credible against the data, serves the CTQ and has a date.</p>
        <button className="btn btn-primary mt-4" onClick={() => { setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }}>New challenge</button>
      </div>
    )
  }
  const choose = (j: number) => {
    if (picked !== null) return
    setPicked(j)
    if (j === r.answer) setScore(s => s + 1)
    else update(p => { p.mistakes.push({ at: Date.now(), tag: 'smart-goal', lesson: '1.3.1' }) })
  }
  const next = () => {
    setI(i + 1); setPicked(null)
    if (i + 1 >= rounds.length) recordLab('smart', Math.round((score / rounds.length) * 100))
  }
  return (
    <div>
      <div className="mb-3 flex justify-between text-sm text-ink-3"><span className="tabular">Round {i + 1} of {rounds.length}</span><span className="tabular">Score {score}</span></div>
      <h3 className="text-lg font-semibold text-ink">{r.kind === 'fail' ? 'Which SMART test does this goal fail most clearly?' : 'Pick the best rewrite.'}</h3>
      <blockquote className="mt-2 rounded-xl bg-surface-2 px-4 py-3 text-[0.95rem] leading-relaxed text-ink">{r.goal}</blockquote>
      <div className={`mt-3 grid gap-2 ${r.kind === 'fail' ? 'grid-cols-2 sm:grid-cols-5' : ''}`}>
        {r.options.map((o, j) => {
          const show = picked !== null
          const cls = show && j === r.answer ? 'border-good bg-good-soft' : show && j === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-coral hover:bg-coral-soft/40'
          return <button key={j} disabled={show} onClick={() => choose(j)} className={`rounded-xl border px-3 py-2.5 text-left text-sm leading-relaxed text-ink transition-colors disabled:cursor-default ${cls}`}>{o}</button>
        })}
      </div>
      {picked !== null && <><Feedback ok={picked === r.answer}>{r.why}</Feedback><button className="btn btn-primary mt-3" onClick={next}>{i + 1 < rounds.length ? 'Next round' : 'See score'}</button></>}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'Which part of SMART does "by 31 Mar 2027" satisfy?', options: ['Specific', 'Measurable', 'Time-bound', 'Relevant'], answer: 2, why: 'A calendar date makes the goal time-bound.' },
  { q: 'A goal moves a metric from 18.4% to 9.0%. What is the relative reduction?', options: ['9.4%', 'About 51%', '18.4%', 'About 104%'], answer: 1, why: '(18.4 - 9.0) / 18.4 x 100 is about 51%. The 9.4 figure is the change in percentage points, not the relative change.' },
  { q: 'Why is "Reduce repeat visits by deploying remote line testing" a weak goal?', options: ['It has a date', 'It names a solution and has no baseline or target', 'It uses the word reduce', 'It is too short'], answer: 1, why: 'A goal states how much and by when. How it is achieved is decided in Improve.' },
  { q: 'What is a good reality check for Achievable?', options: ['The Champion\'s opinion alone', 'Best demonstrated performance (entitlement) of the current process', 'The largest number in the business case', 'A competitor\'s advertising'], answer: 1, why: 'Entitlement, the best performance the process has already shown, tells you what is credible without redesign.' },
]

/* ---------------- Lab ---------------- */

export default function SmartLab({ embedded }: LabProps) {
  const [goal, setGoal] = useState(EXAMPLES[3].goal)
  const [ctq, setCtq] = useState(EXAMPLES[3].ctq)
  const [achievableOk, setAchievableOk] = useState(false)
  const [relevantOk, setRelevantOk] = useState(false)
  const [entText, setEntText] = useState('')
  const [open, setOpen] = useState<Letter | null>('S')
  const id = useId()
  const parsed = useMemo(() => parse(goal), [goal])
  const entitlement = parseNumber(entText)
  const verdicts = evaluate(goal, parsed, achievableOk, entitlement, ctq, relevantOk)
  const passed = verdicts.filter(v => v.level === 'pass').length
  const suggestion = rewrite(goal, parsed, ctq)

  const load = (e: Example) => { setGoal(e.goal); setCtq(e.ctq); setAchievableOk(false); setRelevantOk(false); setEntText('') }
  const another = () => {
    const pool = EXAMPLES.filter(e => e.goal !== goal)
    load(pool[Math.floor(Math.random() * pool.length)])
  }

  const tone = (l: Level) => l === 'pass' ? 'border-good bg-good-soft text-good' : l === 'warn' ? 'border-amber bg-amber-soft text-amber' : 'border-bad bg-bad-soft text-bad'
  const Icon = (l: Level) => l === 'pass' ? CheckCircle2 : l === 'warn' ? TriangleAlert : CircleX

  const explore = (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor={`${id}-goal`}>Goal statement</label>
        <textarea id={`${id}-goal`} rows={3} className="field resize-y text-base leading-relaxed" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Reduce [metric] for [scope] from [baseline] to [target] by [date]." />
      </div>

      <div className="grid grid-cols-5 gap-2" role="list" aria-label={`SMART evaluation: ${passed} of 5 criteria pass`}>
        {verdicts.map(v => {
          const I = Icon(v.level)
          return (
            <button key={v.letter} role="listitem" aria-expanded={open === v.letter} onClick={() => setOpen(o => (o === v.letter ? null : v.letter))}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-3 transition-transform ${tone(v.level)} ${open === v.letter ? 'ring-2 ring-coral/30' : ''}`}>
              <motion.span key={v.level} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="font-display text-2xl font-bold sm:text-3xl">{v.letter}</motion.span>
              <span className="hidden text-xs font-semibold text-ink sm:block">{v.name}</span>
              <I className="size-4" aria-label={v.level} />
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open && (() => {
          const v = verdicts.find(x => x.letter === open)!
          return (
            <motion.div key={open} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-line p-4">
              <h3 className="font-display text-lg font-semibold text-ink">{v.name}</h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-2">{v.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              {open === 'A' && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`${id}-ent`}>Best demonstrated performance (optional)</label>
                    <input id={`${id}-ent`} className="field tabular" inputMode="decimal" placeholder="e.g. 11.2" value={entText} onChange={e => setEntText(e.target.value)} />
                  </div>
                  <label className="flex items-start gap-2 self-end rounded-xl bg-surface-2 p-3 text-sm text-ink">
                    <input type="checkbox" className="mt-1 accent-[var(--coral)]" checked={achievableOk} onChange={e => setAchievableOk(e.target.checked)} />
                    I compared the target with the baseline and with what the process has already achieved.
                  </label>
                </div>
              )}
              {open === 'R' && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`${id}-ctq`}>CTQ or primary metric this goal serves</label>
                    <input id={`${id}-ctq`} className="field" value={ctq} onChange={e => setCtq(e.target.value)} placeholder="e.g. Repeat visit rate" />
                  </div>
                  <label className="flex items-start gap-2 self-end rounded-xl bg-surface-2 p-3 text-sm text-ink">
                    <input type="checkbox" className="mt-1 accent-[var(--coral)]" checked={relevantOk} onChange={e => setRelevantOk(e.target.checked)} />
                    This is the charter's primary metric and it traces back to a customer CTQ and the business case.
                  </label>
                </div>
              )}
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {passed < 5 && goal.trim() && (
        <div className="rounded-2xl bg-sky-soft p-4">
          <div className="flex items-center gap-2 font-semibold text-ink"><Lightbulb className="size-4 text-sky" /> Suggested rewrite</div>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{suggestion}</p>
          <p className="mt-1 text-xs text-ink-3">Fill any [brackets] from your data. The pattern is: verb, metric, scope, from baseline, to target, by date. No solution.</p>
          <button className="btn btn-soft btn-sm mt-3" onClick={() => setGoal(suggestion)}>Use this rewrite</button>
        </div>
      )}
      {passed === 5 && <Feedback ok>All five SMART tests pass. This goal can go in the charter.</Feedback>}

      <div>
        <h3 className="mb-2 font-display text-base font-semibold text-ink">Examples gallery</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLES.map(e => (
            <button key={e.goal} onClick={() => load(e)} className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-2 ${goal === e.goal ? 'border-coral' : 'border-line'}`}>
              <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${e.good ? 'bg-good-soft text-good' : 'bg-bad-soft text-bad'}`}>{e.good ? 'Strong' : 'Weak'}</span>
              <span className="block leading-relaxed text-ink">{e.goal}</span>
              <span className="mt-1 block text-xs text-ink-3">{e.note}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="smart"
      embedded={embedded}
      instructions="Type a goal statement or pick one from the gallery. Each letter turns green, amber or red as you edit. Tap a letter for the reasoning. Achievable and Relevant need your judgement: open them, enter the data and confirm."
      scenario="Your Champion has returned a draft charter with the note: the goal is not SMART. Rewrite it before the Define tollgate."
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="smart" items={CHECK} />}
      onReset={() => load(EXAMPLES[3])}
      onNewExample={another}
    />
  )
}
