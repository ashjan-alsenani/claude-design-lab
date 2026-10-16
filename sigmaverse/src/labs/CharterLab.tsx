import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, CheckCircle2, CircleX, Download, FileText, Printer, Sparkles, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { Ring } from '../components/ui'
import { recordLab, update } from '../lib/store'

/* ------------------------------------------------------------------ */
/* Draft model                                                         */
/* ------------------------------------------------------------------ */

interface Draft {
  title: string
  businessCase: string
  problem: string
  goal: string
  inScope: string
  outScope: string
  start: string
  end: string
  stakeholders: string
  sponsor: string
  team: string
  mDefine: string
  mMeasure: string
  mAnalyze: string
  mImprove: string
  mControl: string
  risks: string
  primary: string
  secondary: string
}

const EMPTY: Draft = {
  title: '', businessCase: '', problem: '', goal: '', inScope: '', outScope: '', start: '', end: '',
  stakeholders: '', sponsor: '', team: '', mDefine: '', mMeasure: '', mAnalyze: '', mImprove: '', mControl: '',
  risks: '', primary: '', secondary: '',
}

const GOOD_EXAMPLES: Draft[] = [
  {
    title: 'Reduce repeat fault visits for North region broadband customers',
    businessCase: 'Repeat visits cost about USD 522,500 a year in engineer time, drive 31% of broadband complaints and are a top-three reason customers give for leaving. The regulator publishes fault-repair league tables in Q2 2027.',
    problem: 'Between 1 Jan and 30 Jun 2026, 2,214 of 12,033 broadband fault visits in the North region (18.4%) were followed by a repeat visit for the same fault within 30 days, against a service target of 9%, costing about USD 261,000 in extra engineer time.',
    goal: 'Reduce the 30-day repeat visit rate for North region broadband faults from 18.4% to 9.0% by 31 Mar 2027.',
    inScope: 'Residential FTTP and FTTC fault visits in the North region, from job dispatch to job closure.',
    outScope: 'New installations, business customers, network-wide outages, engineer pay and contract terms.',
    start: 'Fault ticket assigned to an engineer',
    end: 'Ticket closed as resolved after customer confirmation',
    stakeholders: 'Residential customers, dispatch team, field engineers, customer care agents, IT (ticketing system), engineers union.',
    sponsor: 'Champion: Head of Field Operations North. Process Owner: Regional Field Manager.',
    team: 'Green Belt lead (40%), two senior engineers (20%), dispatcher (10%), data analyst (20%), Finance Representative (5%).',
    mDefine: '2026-11-13', mMeasure: '2026-12-18', mAnalyze: '2027-02-05', mImprove: '2027-03-12', mControl: '2027-03-31',
    risks: 'Risk: ticket closure codes are inconsistent, so the baseline may change in Measure. Assumption: fault volumes stay within 10% of 2026 levels.',
    primary: '30-day repeat visit rate (% of fault visits)',
    secondary: 'Average visit duration (minutes), must not rise above 74',
  },
  {
    title: 'Shorten supplier invoice approval time at the Leeds shared-service centre',
    businessCase: 'Late approvals caused USD 27,400 in late-payment charges in six months and put early-payment discounts worth about USD 60,000 a year at risk. Two strategic suppliers have asked to renegotiate terms.',
    problem: 'From Mar to Aug 2026, supplier invoices at the Leeds shared-service centre took a median of 11.3 working days to approve against a 5-day policy, causing USD 27,400 in late-payment charges.',
    goal: 'Reduce the median invoice approval time at Leeds from 11.3 to 5 working days by 30 Apr 2027.',
    inScope: 'PO-backed supplier invoices received by the Leeds centre, from receipt to approval.',
    outScope: 'Payment runs, expense claims, non-PO invoices, ERP replacement decisions.',
    start: 'Invoice received in the accounts payable mailbox',
    end: 'Invoice approved and released for payment',
    stakeholders: 'Suppliers, accounts payable clerks, budget-holding approvers, procurement, treasury.',
    sponsor: 'Champion: Finance Operations Director. Process Owner: Accounts Payable Manager.',
    team: 'Green Belt lead (30%), two AP clerks (15%), procurement analyst (10%), Finance Representative (5%).',
    mDefine: '2026-11-20', mMeasure: '2027-01-08', mAnalyze: '2027-02-12', mImprove: '2027-03-26', mControl: '2027-04-30',
    risks: 'Risk: year-end close freezes process changes in December. Assumption: invoice volume stays near 7,900 a month.',
    primary: 'Median invoice approval time (working days)',
    secondary: 'Payment error rate (% of invoices), must not rise',
  },
]

const FLAWED_EXAMPLE: Draft = {
  title: 'Implement a new CRM for the contact centre',
  businessCase: 'Agents are unhappy.',
  problem: 'We need to buy a new CRM system because agents cannot see customer history, due to the lack of integration. Team B keeps forgetting to log calls.',
  goal: 'Improve customer satisfaction as much as possible by implementing the new CRM.',
  inScope: 'Everything in the contact centre.',
  outScope: '',
  start: '',
  end: 'When it is done',
  stakeholders: '',
  sponsor: '',
  team: 'Some agents',
  mDefine: '', mMeasure: '', mAnalyze: '', mImprove: '', mControl: '',
  risks: '',
  primary: 'Customer satisfaction',
  secondary: '',
}

const STORAGE_KEY = 'sigmaverse.charter.draft'

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) }
  } catch {
    return { ...EMPTY }
  }
}

/* ------------------------------------------------------------------ */
/* Rule-based checks                                                   */
/* ------------------------------------------------------------------ */

type Level = 'pass' | 'warn' | 'fail'
interface Check { label: string; level: Level; tip: string }

const SOLUTION_WORDS = ['implement', 'new system', 'install', 'buy', 'purchase', 'should', 'need to', 'needs to', 'we need', 'lack of', 'automate', 'deploy', 'hire', 'replace', 'upgrade', 'introduce']
const CAUSE_WORDS = ['because', 'due to', 'caused by', 'as a result of', 'careless', 'lazy', 'incompetent', 'keeps forgetting', 'forgets', 'ignore', 'ignores', 'fault of', 'blame']
const MONTHS = /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/i
const TIME_RE = new RegExp(`${MONTHS.source}|\\b(19|20)\\d{2}\\b|\\bq[1-4]\\b|\\bh[12]\\b|\\b(last|past|previous)\\s+\\d+\\s+(weeks?|months?|days?)|\\bsince\\b|\\bbetween\\b|\\bdate\\b|\\d{1,2}/\\d{1,2}/\\d{2,4}`, 'i')
const PLACE_RE = /\b(region|centre|center|desk|site|team|department|process|branch|store|line|plant|ward|warehouse|office|channel|queue|contact|network|depot|clinic|hospital|north|south|east|west|area|city|country|for [a-z]+ customers)\b/i
const IMPACT_RE = /\b(usd|eur|gbp|cost|costing|costs|charges?|penalt(y|ies)|credits?|revenue|complaints?|churn|customers? (left|lost)|impact|resulting|generating|causing|risk|fines?|overtime|lost|spend)\b|\$|£|€/i
const VERB_RE = /^\s*(reduce|increase|decrease|improve|raise|lower|cut|shorten|lift|grow|eliminate|achieve)\b/i
const NAME_RE = /\b(Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+|\b[Tt]eam [A-Z]\b/

function found(text: string, words: string[]) {
  const t = text.toLowerCase()
  return words.filter(w => new RegExp(`\\b${w.replace(/ /g, '\\s+')}\\b`).test(t))
}
const numbers = (s: string) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map(n => Number(n.replace(/,/g, '')))
const filled = (s: string) => s.trim().length > 0
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

function problemChecks(p: string): Check[] {
  if (!filled(p)) return [{ label: 'Written', level: 'fail', tip: 'State what is wrong, where, when, how big and with what impact.' }]
  const sol = found(p, SOLUTION_WORDS)
  const cause = found(p, CAUSE_WORDS)
  const named = NAME_RE.test(p)
  return [
    { label: 'Magnitude', level: /\d/.test(p) ? 'pass' : 'fail', tip: /\d/.test(p) ? 'Has a number that sizes the problem.' : 'Add a number with units, for example 18.4% or 2,214 visits.' },
    { label: 'Time frame', level: TIME_RE.test(p) ? 'pass' : 'fail', tip: TIME_RE.test(p) ? 'Has a dated observation period.' : 'Say when it was observed, for example "Between Jan and Jun 2026".' },
    { label: 'Where', level: PLACE_RE.test(p) ? 'pass' : 'warn', tip: PLACE_RE.test(p) ? 'Names a process, place or population.' : 'Name the process, region, site or customer group.' },
    { label: 'Impact', level: IMPACT_RE.test(p) ? 'pass' : 'warn', tip: IMPACT_RE.test(p) ? 'Shows the business or customer impact.' : 'Add the impact: cost, complaints, credits, churn or risk.' },
    { label: 'No solution', level: sol.length ? 'fail' : 'pass', tip: sol.length ? `Solution words found: "${sol.join('", "')}". A solution in the problem closes the investigation before it starts.` : 'No predefined solution.' },
    { label: 'No cause or blame', level: cause.length || named ? 'fail' : 'pass', tip: cause.length || named ? `Cause or blame found${cause.length ? `: "${cause.join('", "')}"` : ''}${named ? ' (names a person or team)' : ''}. Root causes are proven in Analyze.` : 'No assumed cause and nobody blamed.' },
  ]
}

function goalChecks(g: string, problem: string): Check[] {
  if (!filled(g)) return [{ label: 'Written', level: 'fail', tip: 'Use the pattern: Reduce [metric] from [baseline] to [target] by [date].' }]
  const n = numbers(g.replace(new RegExp(TIME_RE.source, 'gi'), ' '))
  const fromTo = /\bfrom\b[^.]*?\d[^.]*?\bto\b[^.]*?\d/i.test(g)
  const sol = found(g, ['implement', 'implementing', 'deploy', 'deploying', 'install', 'installing', 'buy', 'buying', 'automate', 'automating', 'new system', 'hire', 'hiring'])
  const vague = /as much as possible|significantly|better|world[- ]class|asap|soon/i.test(g)
  const shared = sharedKeyword(g, problem)
  return [
    { label: 'Action verb', level: VERB_RE.test(g) ? 'pass' : 'warn', tip: VERB_RE.test(g) ? 'Starts with an action verb on a metric.' : 'Start with Reduce, Increase or a similar verb applied to the metric.' },
    { label: 'Baseline and target', level: fromTo || n.length >= 2 ? 'pass' : 'fail', tip: fromTo || n.length >= 2 ? 'Has a baseline and a target number.' : 'Give both numbers: from the baseline to the target, in the same units.' },
    { label: 'Date', level: TIME_RE.test(g) ? 'pass' : 'fail', tip: TIME_RE.test(g) ? 'Has a completion date.' : 'Add a calendar date such as "by 31 Mar 2027".' },
    { label: 'No solution', level: sol.length ? 'fail' : 'pass', tip: sol.length ? 'The goal says how, not how much. Remove the solution; Improve will choose it.' : 'Does not prescribe a solution.' },
    { label: 'Precise wording', level: vague ? 'warn' : 'pass', tip: vague ? 'Vague words such as "as much as possible" or "significantly" cannot be measured.' : 'No vague qualifiers.' },
    ...(filled(problem) ? [{ label: 'Same metric as problem', level: shared ? 'pass' : 'warn', tip: shared ? `Shares the metric wording ("${shared}") with the problem statement.` : 'The goal should use the same metric and units as the problem statement.' } as Check] : []),
  ]
}

const STOP = new Set(['between', 'region', 'within', 'against', 'target', 'reduce', 'increase', 'there', 'their', 'which', 'about', 'customers', 'customer', 'service'])
function sharedKeyword(a: string, b: string): string | null {
  const wa = new Set(a.toLowerCase().match(/[a-z]{5,}/g) ?? [])
  for (const w of b.toLowerCase().match(/[a-z]{5,}/g) ?? []) if (wa.has(w) && !STOP.has(w)) return w
  return null
}

const MS_KEYS = ['mDefine', 'mMeasure', 'mAnalyze', 'mImprove', 'mControl'] as const
const MS_LABELS = ['Define', 'Measure', 'Analyze', 'Improve', 'Control']

interface Group { id: string; title: string; checks: Check[] }

function evaluate(d: Draft): Group[] {
  const ms = MS_KEYS.map(k => d[k])
  const msFilled = ms.filter(Boolean).length
  const ordered = ms.every((v, i) => i === 0 || !v || !ms[i - 1] || v > ms[i - 1])
  const titleSol = found(d.title, SOLUTION_WORDS)
  return [
    { id: 'title', title: 'Project title', checks: [
      { label: 'Written', level: filled(d.title) ? 'pass' : 'fail', tip: filled(d.title) ? 'Has a title.' : 'Give the project a short, outcome-focused title.' },
      ...(filled(d.title) ? [{ label: 'Outcome, not solution', level: titleSol.length ? 'warn' : 'pass', tip: titleSol.length ? 'The title names a solution. Name the result you want instead.' : 'Names the outcome.' } as Check] : []),
    ] },
    { id: 'business', title: 'Business case', checks: [
      { label: 'Explains why now', level: words(d.businessCase) >= 15 ? 'pass' : filled(d.businessCase) ? 'warn' : 'fail', tip: words(d.businessCase) >= 15 ? 'Has a reasoned argument.' : 'Explain why this problem matters and why now (a deadline, a contract, a churn spike).' },
      { label: 'Business value', level: /\d/.test(d.businessCase) && IMPACT_RE.test(d.businessCase) ? 'pass' : 'warn', tip: /\d/.test(d.businessCase) && IMPACT_RE.test(d.businessCase) ? 'Quantifies the business impact.' : 'Link to a number leaders track: cost, revenue, churn, compliance.' },
    ] },
    { id: 'problem', title: 'Problem statement', checks: problemChecks(d.problem) },
    { id: 'goal', title: 'Goal statement', checks: goalChecks(d.goal, d.problem) },
    { id: 'scope', title: 'Scope', checks: [
      { label: 'In scope', level: filled(d.inScope) ? 'pass' : 'fail', tip: filled(d.inScope) ? 'In-scope list present.' : 'List what the team may study and change.' },
      { label: 'Out of scope', level: filled(d.outScope) ? 'pass' : 'fail', tip: filled(d.outScope) ? 'Out-of-scope list present.' : 'An explicit out-of-scope list stops scope creep.' },
      ...(filled(d.inScope) ? [{ label: 'Not the whole world', level: /\b(everything|all processes|whole|entire company)\b/i.test(d.inScope) ? 'warn' : 'pass', tip: /\b(everything|all processes|whole|entire company)\b/i.test(d.inScope) ? 'Scope looks too wide for one team: narrow it.' : 'Scope looks bounded.' } as Check] : []),
    ] },
    { id: 'bounds', title: 'Process boundaries', checks: [
      { label: 'Start trigger', level: words(d.start) >= 3 ? 'pass' : filled(d.start) ? 'warn' : 'fail', tip: words(d.start) >= 3 ? 'Start is an observable event.' : 'Describe the start as an observable event, for example "Ticket assigned to an engineer".' },
      { label: 'End point', level: words(d.end) >= 3 && !/when it is done|finished/i.test(d.end) ? 'pass' : filled(d.end) ? 'warn' : 'fail', tip: words(d.end) >= 3 && !/when it is done|finished/i.test(d.end) ? 'End is an observable event.' : 'Describe the end as an observable event, for example "Invoice released for payment".' },
    ] },
    { id: 'people', title: 'People', checks: [
      { label: 'Stakeholders', level: filled(d.stakeholders) ? 'pass' : 'fail', tip: filled(d.stakeholders) ? 'Stakeholders listed.' : 'List who is affected by or can affect the project.' },
      { label: 'Champion named', level: /champion|sponsor/i.test(d.sponsor) ? 'pass' : filled(d.sponsor) ? 'warn' : 'fail', tip: /champion|sponsor/i.test(d.sponsor) ? 'Champion or sponsor named.' : 'Name the Champion who signs the charter and removes barriers.' },
      { label: 'Process Owner', level: /process owner/i.test(d.sponsor + ' ' + d.team) ? 'pass' : 'warn', tip: /process owner/i.test(d.sponsor + ' ' + d.team) ? 'Process Owner named.' : 'Name the Process Owner who will run the improved process.' },
      { label: 'Roles and time', level: /\d+\s*%|\(|:|belt|lead|analyst/i.test(d.team) && words(d.team) >= 4 ? 'pass' : filled(d.team) ? 'warn' : 'fail', tip: /\d+\s*%|\(|:|belt|lead|analyst/i.test(d.team) && words(d.team) >= 4 ? 'Team roles and commitment shown.' : 'List each member with a role and time commitment, for example "Green Belt lead (40%)".' },
    ] },
    { id: 'milestones', title: 'Milestones', checks: [
      { label: 'All five tollgates', level: msFilled === 5 ? 'pass' : msFilled > 0 ? 'warn' : 'fail', tip: msFilled === 5 ? 'A date for each DMAIC tollgate.' : `Dates set for ${msFilled} of 5 tollgates.` },
      { label: 'In DMAIC order', level: ordered ? (msFilled >= 2 ? 'pass' : 'warn') : 'fail', tip: ordered ? 'Dates run Define to Control.' : 'A later phase is dated before an earlier one.' },
    ] },
    { id: 'risks', title: 'Risks and assumptions', checks: [
      { label: 'Risks', level: /risk|could|may|might/i.test(d.risks) ? 'pass' : filled(d.risks) ? 'warn' : 'fail', tip: /risk|could|may|might/i.test(d.risks) ? 'Names what could stop the project.' : 'Name what could stop the project (data access, a system freeze).' },
      { label: 'Assumptions', level: /assum/i.test(d.risks) ? 'pass' : 'warn', tip: /assum/i.test(d.risks) ? 'States what you assume is true.' : 'Add what you are assuming, for example stable demand.' },
    ] },
    { id: 'metrics', title: 'Metrics', checks: [
      { label: 'Primary metric', level: filled(d.primary) ? 'pass' : 'fail', tip: filled(d.primary) ? 'Project Y named.' : 'Name the one metric the project exists to move.' },
      { label: 'Primary matches goal', level: filled(d.primary) && filled(d.goal) && sharedKeyword(d.primary, d.goal) ? 'pass' : 'warn', tip: filled(d.primary) && filled(d.goal) && sharedKeyword(d.primary, d.goal) ? 'The primary metric appears in the goal.' : 'The primary metric should be the metric in the goal statement.' },
      { label: 'Secondary metric', level: filled(d.secondary) ? (d.secondary.trim().toLowerCase() === d.primary.trim().toLowerCase() ? 'fail' : 'pass') : 'fail', tip: filled(d.secondary) ? 'A guardrail that must not worsen.' : 'Add a guardrail metric that must not get worse.' },
    ] },
  ]
}

const LEVEL_W: Record<Level, number> = { pass: 1, warn: 0.5, fail: 0 }

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

function Badge({ c }: { c: Check }) {
  const cls = c.level === 'pass' ? 'bg-good-soft text-good' : c.level === 'warn' ? 'bg-amber-soft text-amber' : 'bg-bad-soft text-bad'
  const Icon = c.level === 'pass' ? CheckCircle2 : c.level === 'warn' ? TriangleAlert : CircleX
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`} title={c.tip}>
      <Icon className="size-3.5" aria-hidden />{c.label}<span className="sr-only">: {c.level}</span>
    </span>
  )
}

function Checks({ checks, showTips }: { checks: Check[]; showTips?: boolean }) {
  const issues = checks.filter(c => c.level !== 'pass')
  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1.5">{checks.map(c => <Badge key={c.label} c={c} />)}</div>
      {showTips && issues.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-ink-2">
          {issues.map(c => <li key={c.label} className="flex gap-1.5"><span className={c.level === 'fail' ? 'text-bad' : 'text-amber'} aria-hidden>•</span>{c.tip}</li>)}
        </ul>
      )}
    </div>
  )
}

function Field({ id, label, value, onChange, rows = 2, placeholder, children }: { id: string; label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; children?: ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {rows > 1
        ? <textarea id={id} rows={rows} className="field resize-y leading-relaxed" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input id={id} className="field" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
      {children}
    </div>
  )
}

function Fieldset({ title, n, children }: { title: string; n: number; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line p-4">
      <legend className="flex items-center gap-2 px-1 font-display text-base font-semibold text-ink">
        <span className="tabular grid size-6 place-items-center rounded-lg bg-coral-soft text-xs text-coral">{n}</span>{title}
      </legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}

function charterText(d: Draft): string {
  const L = (k: string, v: string) => `${k}\n${v.trim() || '(not yet written)'}\n`
  return [
    'PROJECT CHARTER',
    '',
    L('Project title', d.title),
    L('Business case', d.businessCase),
    L('Problem statement', d.problem),
    L('Goal statement', d.goal),
    L('In scope', d.inScope),
    L('Out of scope', d.outScope),
    L('Process start', d.start),
    L('Process end', d.end),
    L('Stakeholders', d.stakeholders),
    L('Sponsor and Champion', d.sponsor),
    L('Team members and roles', d.team),
    `Milestones\n${MS_KEYS.map((k, i) => `${MS_LABELS[i]} tollgate: ${d[k] || 'not set'}`).join('\n')}\n`,
    L('Risks and assumptions', d.risks),
    L('Primary metric', d.primary),
    L('Secondary metric', d.secondary),
    'Drafted with the SigmaVerse Project Charter Builder. Estimated benefits remain estimates until Finance verifies them in Control.',
  ].join('\n')
}

/* Clean printable charter, portalled to <body> so it prints without the app shell. */
function PrintView({ d }: { d: Draft }) {
  const rows: [string, string][] = [
    ['Business case', d.businessCase], ['Problem statement', d.problem], ['Goal statement', d.goal],
    ['In scope', d.inScope], ['Out of scope', d.outScope], ['Process start', d.start], ['Process end', d.end],
    ['Stakeholders', d.stakeholders], ['Sponsor and Champion', d.sponsor], ['Team and roles', d.team],
    ['Milestones', MS_KEYS.map((k, i) => `${MS_LABELS[i]}: ${d[k] || 'not set'}`).join('  |  ')],
    ['Risks and assumptions', d.risks], ['Primary metric', d.primary], ['Secondary metric', d.secondary],
  ]
  return createPortal(
    <div className="print-only sv-charter-print" style={{ fontFamily: 'var(--font-sans)', color: '#111', padding: '12mm' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>Project charter</h1>
      <p style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>{d.title || 'Untitled project'}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th style={{ textAlign: 'left', verticalAlign: 'top', width: '28%', border: '1px solid #999', padding: '6px 8px', background: '#f2f2f2' }}>{k}</th>
              <td style={{ border: '1px solid #999', padding: '6px 8px', whiteSpace: 'pre-wrap' }}>{v.trim() || '(not yet written)'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 10, marginTop: 10 }}>Estimated benefits remain estimates until Finance verifies them in Control. Champion signature: ____________________ Date: __________</p>
    </div>,
    document.body,
  )
}

/* ------------------------------------------------------------------ */
/* Challenge: best problem statement / spot the disguised solution     */
/* ------------------------------------------------------------------ */

interface Round { kind: 'best' | 'disguise'; prompt: string; options: string[]; answer: number; why: string }

const POOL: Round[] = [
  { kind: 'best', prompt: 'Contact centre repeat calls. Which is the best problem statement?', options: [
    'We need a new CRM because agents cannot see customer history.',
    'Between Jan and Jun 2026, 23.7% of billing calls to the Kestrel Mobile contact centre needed a second contact within 7 days (requirement: 10% or less), generating about 41,900 extra calls.',
    'Agents in Team B are careless and customers call back.',
    'Repeat calls are too high and must be reduced soon.',
  ], answer: 1, why: 'It has a metric, period, place, size against a requirement and impact, with no cause, solution or blame.' },
  { kind: 'best', prompt: 'Invoice processing. Which is the best problem statement?', options: [
    'Invoice processing is too slow.',
    'Approvers ignore invoices, so suppliers are paid late.',
    'From Mar to Aug 2026, supplier invoices at the Leeds shared-service centre took a median of 11.3 working days to approve (policy: 5 days), causing USD 27,400 in late-payment charges.',
    'Automate invoice approval to stop late payments.',
  ], answer: 2, why: 'Specific metric, place, period, gap to policy and cost. The others are vague, blame people or prescribe a solution.' },
  { kind: 'best', prompt: 'Major incident notifications. Which is the best problem statement?', options: [
    'Automate the outage alerts to fix the SLA problem.',
    'The NOC team does not care about customers.',
    'Notifications are sometimes late.',
    'In Q2 2026, 14 of 61 major incidents (23%) breached the 15-minute customer-notification SLA, triggering USD 86,000 in service credits.',
  ], answer: 3, why: 'Counts, a period, the requirement and the financial impact, with no solution.' },
  { kind: 'best', prompt: 'Fibre installations. Which is the best problem statement?', options: [
    'In Q2 2026, 18.6% of 3,941 residential fibre installations in the North region missed the booked window, generating 734 complaints.',
    'Installations are late because dispatchers ignore the schedule.',
    'We should hire more engineers for installations.',
    'Customers are unhappy with installations.',
  ], answer: 0, why: 'It sizes the gap and the impact without a cause (dispatchers), a solution (hiring) or vague feelings.' },
  { kind: 'best', prompt: 'Hospital discharge. Which is the best problem statement?', options: [
    'The ward needs an electronic discharge system.',
    'Between Apr and Sep 2026, 41% of planned discharges on Ward 7 left after 2 pm against a target of 20% before noon, blocking an average 6 beds a day for admissions.',
    'Doctors are too slow to sign discharge letters.',
    'Discharges should be faster.',
  ], answer: 1, why: 'Measured gap, period, place and impact on beds. No solution, cause or blame.' },
  { kind: 'disguise', prompt: 'Which statement is a solution disguised as a problem?', options: [
    'In H1 2026, 18.4% of North region fault visits were repeated within 30 days against a 9% target.',
    'The problem is a lack of remote line testing in the field.',
    'From Mar to Aug 2026, median invoice approval time was 11.3 days against a 5-day policy.',
    'In Q2 2026, 23% of major incidents breached the notification SLA.',
  ], answer: 1, why: '"Lack of remote line testing" names the missing solution. Ask: if we had it, which number would change? That number is the real problem.' },
  { kind: 'disguise', prompt: 'Which statement is a solution disguised as a problem?', options: [
    '6.4% of invoices were returned in Q3 2026 for wrong cost-centre codes.',
    'Our ticketing tool is out of date and needs to be upgraded.',
    'In Sep 2026, 1,874 broadband orders were waiting more than 5 days for provisioning.',
    'Average hold time on the billing line was 7.8 minutes in Aug 2026 against a 2-minute target.',
  ], answer: 1, why: 'It describes a purchase (an upgrade), not a measured gap in performance.' },
  { kind: 'disguise', prompt: 'Which statement is a solution disguised as a problem?', options: [
    'Between Jan and Jun 2026, 9.2% of fibre kits were wasted because appointments were cancelled.',
    'We need to implement a chatbot because the contact centre is overloaded.',
    'In Q1 2026, 31% of SIM swaps took longer than 2 days against a 1-day promise.',
    'Over 12 weeks, 412 of 5,230 invoices (7.9%) were paid twice or late.',
  ], answer: 1, why: '"Implement a chatbot" is a solution, and "because" asserts a cause. The first option also says "because": it is weaker, but it still measures a gap.' },
  { kind: 'disguise', prompt: 'Which statement is a solution disguised as a problem?', options: [
    'Ward 4 needs two more discharge nurses.',
    'In Q3 2026, 27% of Ward 4 patients waited more than 3 hours for discharge medicines.',
    'From May to Aug 2026, 14.1% of field visits needed a second visit within 14 days.',
    'In Sep 2026, 3,140 tickets were reassigned more than twice before resolution.',
  ], answer: 0, why: 'Asking for headcount is a solution. The measured problem might be the discharge delay in option two.' },
]

function Challenge() {
  const [seed, setSeed] = useState(0)
  const rounds = useMemo(() => shuffle(POOL).slice(0, 5).map(r => {
    const order = shuffle(r.options.map((_, i) => i))
    return { ...r, options: order.map(i => r.options[i]), answer: order.indexOf(r.answer) }
  }), [seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const done = i >= rounds.length
  const r = rounds[Math.min(i, rounds.length - 1)]

  const choose = (j: number) => {
    if (picked !== null) return
    setPicked(j)
    const ok = j === r.answer
    if (ok) setScore(s => s + 1)
    else update(p => { p.mistakes.push({ at: Date.now(), tag: 'solution-in-problem', lesson: '1.3.1' }) })
  }
  const next = () => {
    const ni = i + 1
    setI(ni); setPicked(null)
    if (ni >= rounds.length) recordLab('charter', Math.round((score / rounds.length) * 100))
  }
  const restart = () => { setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }

  if (done) {
    return (
      <div className="rounded-2xl bg-coral-soft p-5">
        <p className="font-display text-2xl font-semibold text-ink">You scored {score} of {rounds.length}</p>
        <p className="mt-1 text-sm text-ink-2">{score === rounds.length ? 'Every statement judged correctly. You can spot a solution in disguise.' : 'Review the three NOs: no cause, no solution, no blame, and always a number with a time frame.'}</p>
        <button className="btn btn-primary mt-4" onClick={restart}>New challenge</button>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
        <span className="tabular">Round {i + 1} of {rounds.length}</span>
        <span className="tabular">Score {score}</span>
      </div>
      <h3 className="text-lg font-semibold text-ink">{r.prompt}</h3>
      <div className="mt-3 grid gap-2">
        {r.options.map((o, j) => {
          const show = picked !== null
          const cls = show && j === r.answer ? 'border-good bg-good-soft' : show && j === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-coral hover:bg-coral-soft/40'
          return <button key={j} disabled={show} onClick={() => choose(j)} className={`rounded-xl border px-3.5 py-3 text-left text-sm leading-relaxed text-ink transition-colors disabled:cursor-default ${cls}`}>{o}</button>
        })}
      </div>
      {picked !== null && (
        <>
          <Feedback ok={picked === r.answer}>{r.why}</Feedback>
          <button className="btn btn-primary mt-3" onClick={next}>{i + 1 < rounds.length ? 'Next round' : 'See score'}</button>
        </>
      )}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'Which element of a charter should NOT contain a proposed solution?', options: ['Problem statement', 'In-scope list', 'Team members', 'Milestones'], answer: 0, why: 'A solution in the problem statement closes the investigation before data are collected. Solutions are chosen in Improve.' },
  { q: 'Which goal statement is best?', options: ['Improve first-time fix as much as possible.', 'Reduce the 30-day repeat visit rate from 18.4% to 9.0% by 31 Mar 2027.', 'Reduce repeat visits by deploying remote line testing.', 'Make customers happier this year.'], answer: 1, why: 'It names one metric with a baseline, a target and a date, and does not say how the target will be reached.' },
  { q: 'Who signs the charter and owns the result?', options: ['The Green Belt', 'The Finance Representative', 'The Champion', 'The Yellow Belt'], answer: 2, why: 'The Belt drafts the charter; the Champion approves it, owns the result and removes barriers.' },
  { q: 'Why does a charter need an explicit out-of-scope list?', options: ['To make it longer', 'To stop scope creep and keep the project achievable for one team', 'To name the root cause', 'To record realised savings'], answer: 1, why: 'Without written boundaries, scope grows quietly and the project stalls.' },
]

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function CharterLab({ embedded }: LabProps) {
  const [d, setD] = useState<Draft>(loadDraft)
  const [exampleIdx, setExampleIdx] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const groups = useMemo(() => evaluate(d), [d])
  const all = groups.flatMap(g => g.checks)
  const readiness = all.length ? all.reduce((s, c) => s + LEVEL_W[c.level], 0) / all.length : 0
  const fails = all.filter(c => c.level === 'fail').length

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch { /* storage unavailable: the draft lives in memory only */ }
  }, [d])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 2600)
    return () => window.clearTimeout(t)
  }, [notice])

  const set = (k: keyof Draft) => (v: string) => setD(prev => ({ ...prev, [k]: v }))
  const load = (x: Draft, msg: string) => { setD({ ...x }); setNotice(msg) }
  const nextExample = () => {
    const n = (exampleIdx + 1) % GOOD_EXAMPLES.length
    setExampleIdx(n)
    load(GOOD_EXAMPLES[n], 'Loaded another strong example. Compare how each field is phrased.')
  }

  const print = () => {
    const cls = 'sv-print-charter'
    const style = document.createElement('style')
    style.textContent = `@media print { body.${cls} > *:not(.sv-charter-print) { display: none !important; } body.${cls} { background: #fff !important; } }`
    document.head.appendChild(style)
    document.body.classList.add(cls)
    const done = () => { document.body.classList.remove(cls); style.remove(); window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    window.print()
  }
  const download = () => {
    const blob = new Blob([charterText(d)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(d.title || 'project-charter').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'project-charter'}.txt`
    document.body.appendChild(a); a.click(); a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const g = (id: string) => groups.find(x => x.id === id)!.checks

  const explore = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="no-print flex flex-wrap gap-2">
          <button className="btn btn-soft btn-sm" onClick={() => load(GOOD_EXAMPLES[exampleIdx], 'Loaded a strong telecom charter. Every badge should be green.')}><Sparkles className="size-4" /> Load an example</button>
          <button className="btn btn-soft btn-sm" onClick={() => load(FLAWED_EXAMPLE, 'Loaded a flawed charter. Find the solution hiding in the problem statement.')}><AlertTriangle className="size-4" /> Load a flawed example</button>
          <button className="btn btn-ghost btn-sm" onClick={print}><Printer className="size-4" /> Print / Save as PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={download}><Download className="size-4" /> Download as text</button>
        </div>
        <AnimatePresence>
          {notice && (
            <motion.p role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">{notice}</motion.p>
          )}
        </AnimatePresence>

        <Fieldset n={1} title="Why this project">
          <Field id="ch-title" label="Project title" rows={1} value={d.title} onChange={set('title')} placeholder="Reduce repeat fault visits for North region customers"><Checks checks={g('title')} showTips /></Field>
          <Field id="ch-bc" label="Business case" rows={3} value={d.businessCase} onChange={set('businessCase')} placeholder="Why this problem, why now, and what it is worth to the business"><Checks checks={g('business')} showTips /></Field>
        </Fieldset>

        <Fieldset n={2} title="Problem and goal">
          <Field id="ch-problem" label="Problem statement" rows={4} value={d.problem} onChange={set('problem')} placeholder="What is wrong, where, when, how big, and the impact. No cause, no solution, no blame."><Checks checks={g('problem')} showTips /></Field>
          <Field id="ch-goal" label="Goal statement" rows={2} value={d.goal} onChange={set('goal')} placeholder="Reduce [metric] from [baseline] to [target] by [date]"><Checks checks={g('goal')} showTips /></Field>
        </Fieldset>

        <Fieldset n={3} title="Scope and boundaries">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ch-in" label="In scope" rows={3} value={d.inScope} onChange={set('inScope')} placeholder="Process, products, regions and customer groups included" />
            <Field id="ch-out" label="Out of scope" rows={3} value={d.outScope} onChange={set('outScope')} placeholder="What the team will not study or change" />
          </div>
          <Checks checks={g('scope')} showTips />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ch-start" label="Process start (trigger)" rows={1} value={d.start} onChange={set('start')} placeholder="Fault ticket assigned to an engineer" />
            <Field id="ch-end" label="Process end" rows={1} value={d.end} onChange={set('end')} placeholder="Ticket closed after customer confirmation" />
          </div>
          <Checks checks={g('bounds')} showTips />
        </Fieldset>

        <Fieldset n={4} title="People">
          <Field id="ch-stake" label="Stakeholders" rows={2} value={d.stakeholders} onChange={set('stakeholders')} placeholder="Customers, upstream and downstream teams, IT, unions, regulators" />
          <Field id="ch-sponsor" label="Sponsor, Champion and Process Owner" rows={2} value={d.sponsor} onChange={set('sponsor')} placeholder="Champion: Head of Field Operations. Process Owner: Regional Field Manager." />
          <Field id="ch-team" label="Team members and roles" rows={2} value={d.team} onChange={set('team')} placeholder="Green Belt lead (40%), two engineers (20%), Finance Representative (5%)" />
          <Checks checks={g('people')} showTips />
        </Fieldset>

        <Fieldset n={5} title="Milestones">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {MS_KEYS.map((k, i) => (
              <div key={k}>
                <label className="label" htmlFor={`ch-${k}`}>{MS_LABELS[i]}</label>
                <input id={`ch-${k}`} type="date" className="field tabular px-2 text-sm" value={d[k]} onChange={e => set(k)(e.target.value)} />
              </div>
            ))}
          </div>
          <Checks checks={g('milestones')} showTips />
        </Fieldset>

        <Fieldset n={6} title="Risks and metrics">
          <Field id="ch-risks" label="Risks and assumptions" rows={2} value={d.risks} onChange={set('risks')} placeholder="Risk: data access may be delayed. Assumption: demand stays stable." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ch-primary" label="Primary metric (project Y)" rows={1} value={d.primary} onChange={set('primary')} placeholder="30-day repeat visit rate (%)" />
            <Field id="ch-secondary" label="Secondary metric (guardrail)" rows={1} value={d.secondary} onChange={set('secondary')} placeholder="Average visit duration, must not rise" />
          </div>
          <Checks checks={[...g('risks'), ...g('metrics')]} showTips />
        </Fieldset>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <div className="flex items-center gap-4">
            <Ring value={readiness} size={76} stroke={7} tone={readiness >= 0.85 ? 'teal' : readiness >= 0.5 ? 'amber' : 'coral'}>
              <span className="tabular font-display text-lg font-semibold text-ink">{Math.round(readiness * 100)}%</span>
            </Ring>
            <div>
              <div className="font-display text-lg font-semibold text-ink">Charter readiness</div>
              <p className="text-sm text-ink-2">{fails === 0 ? (readiness >= 0.95 ? 'Ready for the Champion to sign.' : 'No blockers. Tidy the warnings.') : `${fails} blocking ${fails === 1 ? 'issue' : 'issues'} to fix.`}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5">
            {groups.map(gr => {
              const s = gr.checks.reduce((a, c) => a + LEVEL_W[c.level], 0) / gr.checks.length
              const tone = s === 1 ? 'bg-good' : s >= 0.5 ? 'bg-amber' : 'bg-bad'
              return (
                <li key={gr.id} className="flex items-center gap-2 text-sm">
                  <span className="w-36 shrink-0 truncate text-ink-2">{gr.title}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <motion.span className={`block h-full rounded-full ${tone}`} initial={false} animate={{ width: `${s * 100}%` }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink-3"><FileText className="size-4 shrink-0" />Rule-based checks look for patterns in your wording. They support, not replace, a tollgate review. Your draft is saved in this browser.</p>
        </div>
      </aside>
      <PrintView d={d} />
    </div>
  )

  return (
    <LabShell
      lab="charter"
      embedded={embedded}
      instructions="Fill in each charter field. Badges under each field update as you type: green passes, amber is a warning, red blocks sign-off. Load an example to see a strong charter, or a flawed one to practise spotting problems. Print or download when ready."
      scenario="You are the Green Belt drafting a charter for your Champion at a broadband provider. The tollgate review is next week, and the Champion will only sign a charter with a measured problem, a SMART goal and clear boundaries."
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="charter" items={CHECK} />}
      onReset={() => { setD({ ...EMPTY }); setNotice('Draft cleared.') }}
      onNewExample={nextExample}
    />
  )
}
