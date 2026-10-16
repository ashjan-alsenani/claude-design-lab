import type { Difficulty, MistakeTag } from '../data/types'
import * as M from './metrics'

export type FormulaId =
  | 'dpu' | 'dpo' | 'dpmo' | 'defective' | 'fty' | 'rty' | 'final-yield'
  | 'cycle' | 'sigma' | 'copq' | 'pareto' | 'improvement' | 'roi' | 'payback'
  | 'takt' | 'lead'

export interface Mistake {
  value: number
  tag: MistakeTag
  message: string
}

export interface Problem {
  id: string
  formula: FormulaId
  difficulty: Difficulty
  context: string
  question: string
  table?: { head: string[]; rows: (string | number)[][] }
  /** The verified answer in display units (e.g. percent value 94.6 for 94.6%). */
  expected: number
  unit: string
  /** Decimal places shown in the solution and accepted rounding. */
  decimals: number
  /** When true, the answer is a percentage and a fraction (0.946) is also recognised. */
  percent?: boolean
  mistakes: Mistake[]
  hints: string[]
  solution: string[]
}

/** Small seeded RNG so a problem can be regenerated from its id. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  const next = () => {
    s ^= s << 13; s >>>= 0
    s ^= s >>> 17
    s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
  return {
    next,
    int: (lo: number, hi: number) => Math.floor(next() * (hi - lo + 1)) + lo,
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    round: (lo: number, hi: number, step: number) => Math.round((lo + next() * (hi - lo)) / step) * step,
  }
}
type R = ReturnType<typeof rng>

const f = (n: number, d = 2) => M.fmt(n, d)
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d

const SCENES = {
  invoice: { unit: 'invoices', thing: 'invoice', opp: 'fields checked on each invoice', place: 'the accounts payable team at Halden Health' },
  order: { unit: 'service orders', thing: 'order', opp: 'critical data elements on each order', place: 'Kestrel Mobile order provisioning' },
  ticket: { unit: 'support tickets', thing: 'ticket', opp: 'quality checks on each ticket', place: 'the Northwind Fibre service desk' },
  board: { unit: 'circuit boards', thing: 'board', opp: 'solder joints inspected on each board', place: 'the Brightwater Devices assembly line' },
} as const
type SceneKey = keyof typeof SCENES

function scale(d: Difficulty) {
  return d === 'beginner' ? 1 : d === 'intermediate' ? 2 : d === 'advanced' ? 3 : d === 'trap' ? 3 : 4
}

function genDpu(r: R, d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const sc = SCENES[r.pick(Object.keys(SCENES) as SceneKey[])]
  const units = r.pick([200, 250, 400, 500, 800, 1200, 1500, 2400])
  const defectives = Math.round(units * r.round(0.04, 0.14, 0.005))
  const defects = defectives + Math.round(defectives * r.round(0.2, 0.9, 0.05))
  const ans = round(M.dpu(defects, units), 4)
  const trap = d === 'trap' || d === 'master'
  return {
    context: `${sc.place} reviewed ${M.fmt(units)} ${sc.unit}. ${trap ? `${M.fmt(defectives)} ${sc.unit} had at least one problem, and across them the reviewers logged ${M.fmt(defects)} individual defects.` : `The reviewers logged ${M.fmt(defects)} defects in total.`}`,
    question: 'What is the defects per unit (DPU)? Give the answer to 4 decimal places.',
    expected: ans, unit: 'defects per unit', decimals: 4,
    mistakes: [
      { value: round(defectives / units, 4), tag: 'defects-vs-defectives', message: 'You divided defective units by units. That is the proportion defective. DPU counts every defect, including several in the same unit.' },
      { value: round(units / defects, 4), tag: 'dpu-vs-dpmo', message: 'The fraction is upside down. DPU is defects divided by units.' },
      { value: round(defects / units * 100, 4), tag: 'percent-conversion', message: 'You multiplied by 100. DPU is a ratio of defects to units, not a percentage.' },
    ],
    hints: ['DPU uses total defects in the numerator, not defective units.', `Total defects = ${M.fmt(defects)}. Total units = ${M.fmt(units)}.`, '$DPU = D \\div U$'],
    solution: [`Identify total defects: $D = ${defects}$.`, `Identify total units: $U = ${units}$.`, `$DPU = ${defects} \\div ${units} = ${f(ans, 4)}$ defects per unit.`, trap ? `The ${defectives} defective units are a distractor here: they answer a different question (proportion defective = ${f(defectives / units, 4)}).` : `On average each ${sc.thing} carries ${f(ans, 4)} defects.`],
  }
}

function genDpmo(r: R, d: Difficulty, onlyDpo = false): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const sc = SCENES[r.pick(Object.keys(SCENES) as SceneKey[])]
  const units = r.pick([250, 400, 500, 750, 1000, 1250, 2000, 3200])
  const opps = r.pick([4, 5, 6, 8, 10, 12, 15, 20])
  const defects = Math.max(3, Math.round(units * opps * r.round(0.002, 0.03, 0.0005)))
  const defectives = Math.min(units, Math.round(defects * r.round(0.55, 0.85, 0.05)))
  const dpoV = M.dpo(defects, units, opps)
  const ans = onlyDpo ? round(dpoV, 6) : round(dpoV * M.MILLION, 0)
  const s = scale(d)
  const showDefectives = s >= 3
  const ctx = `${sc.place} audited ${M.fmt(units)} ${sc.unit}. Each ${sc.thing} has ${opps} ${sc.opp}, and each one is an opportunity for a defect. The audit found ${M.fmt(defects)} defects${showDefectives ? ` spread across ${M.fmt(defectives)} defective ${sc.unit}` : ''}.`
  const mistakes: Mistake[] = onlyDpo ? [
    { value: round(defects / units, 6), tag: 'missing-opportunities', message: 'You left out the opportunities. Dividing by units alone gives DPU, not DPO.' },
    { value: round(dpoV * M.MILLION, 6), tag: 'missing-million', message: 'You scaled to a million. DPO is the raw fraction; DPMO is DPO x 1,000,000.' },
    { value: round(defectives / (units * opps), 6), tag: 'defects-vs-defectives', message: 'You used defective units. DPO counts every defect.' },
  ] : [
    { value: round(defects / units * M.MILLION, 0), tag: 'missing-opportunities', message: 'You forgot the opportunities per unit. That is defects per million units, not per million opportunities.' },
    { value: round(dpoV, 6), tag: 'missing-million', message: 'You stopped at DPO. Multiply by 1,000,000 to express defects per million opportunities.' },
    { value: round(defectives / (units * opps) * M.MILLION, 0), tag: 'defects-vs-defectives', message: 'You used defective units instead of total defects in the numerator.' },
    { value: round(dpoV * 100, 6), tag: 'percent-conversion', message: 'You multiplied by 100, which gives a percentage. DPMO multiplies by one million.' },
  ]
  return {
    context: ctx,
    question: onlyDpo ? 'What is the defects per opportunity (DPO)? Give 6 decimal places.' : 'What is the DPMO? Round to the nearest whole number.',
    expected: ans, unit: onlyDpo ? 'defects per opportunity' : 'DPMO', decimals: onlyDpo ? 6 : 0,
    mistakes,
    hints: ['Total opportunities = units x opportunities per unit.', `Total opportunities = ${M.fmt(units)} x ${opps} = ${M.fmt(units * opps)}.`, onlyDpo ? '$DPO = D \\div (U \\times O)$' : '$DPMO = \\dfrac{D}{U \\times O} \\times 1{,}000{,}000$'],
    solution: [
      `Total defects $D = ${defects}$${showDefectives ? ` (not the ${defectives} defective units)` : ''}.`,
      `Total opportunities $= U \\times O = ${units} \\times ${opps} = ${units * opps}$.`,
      `$DPO = ${defects} \\div ${units * opps} = ${f(dpoV, 6)}$.`,
      ...(onlyDpo ? [] : [`$DPMO = ${f(dpoV, 6)} \\times 1{,}000{,}000 = ${M.fmt(ans, 0)}$.`]),
      `For reference, that is about ${f(M.sigmaFromDpmo(dpoV * M.MILLION), 2)} sigma using the conventional 1.5 sigma shift.`,
    ],
  }
}

function genDefective(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const units = r.pick([300, 480, 600, 900, 1500])
  const defectives = Math.round(units * r.round(0.03, 0.12, 0.005))
  const defects = defectives + Math.round(defectives * r.round(0.3, 1.2, 0.1))
  const ans = round((defectives / units) * 100, 2)
  return {
    context: `Kestrel Mobile checked ${M.fmt(units)} new-customer activations. Reviewers recorded ${M.fmt(defects)} defects in total, found on ${M.fmt(defectives)} activations (some activations had more than one defect).`,
    question: 'What percentage of activations were defective? Give 2 decimal places.',
    expected: ans, unit: '%', decimals: 2, percent: true,
    mistakes: [
      { value: round(defects / units * 100, 2), tag: 'defects-vs-defectives', message: 'You used total defects. A defective unit is counted once no matter how many defects it has.' },
    ],
    hints: ['A defective is a unit with at least one defect.', 'Proportion defective = defective units / total units.'],
    solution: [`Defective units $= ${defectives}$.`, `$${defectives} \\div ${units} = ${f(defectives / units, 4)}$.`, `As a percentage: $${f(ans, 2)}\\%$.`, `The ${defects} defects would give DPU = ${f(defects / units, 4)}, a different metric.`],
  }
}

function genFty(r: R, d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const unitsIn = r.pick([400, 500, 640, 800, 1000, 1250])
  const scrap = Math.round(unitsIn * r.round(0.01, 0.05, 0.005))
  const rework = Math.round(unitsIn * r.round(0.04, 0.12, 0.005))
  const ans = round(M.fty(unitsIn, scrap, rework) * 100, 2)
  return {
    context: `The billing validation step at Northwind Fibre received ${M.fmt(unitsIn)} bills this week. ${M.fmt(rework)} bills failed validation and were corrected and resubmitted successfully. ${M.fmt(scrap)} bills could not be saved and were cancelled and recreated from scratch.${d !== 'beginner' ? ` In the end ${M.fmt(unitsIn - scrap)} bills left the step as good.` : ''}`,
    question: 'What is the first time yield (FTY) of this step? Give the answer as a percentage to 2 decimal places.',
    expected: ans, unit: '%', decimals: 2, percent: true,
    mistakes: [
      { value: round(M.finalYield(unitsIn, scrap) * 100, 2), tag: 'fty-includes-rework', message: 'You counted reworked bills as good. That is the final (traditional) yield. FTY only counts units that pass the first time.' },
      { value: round((unitsIn - rework) / unitsIn * 100, 2), tag: 'fty-includes-rework', message: 'You removed rework but forgot the scrapped bills. Scrapped units did not pass the first time either.' },
    ],
    hints: ['Which bills passed the first time with no rework and no scrap?', `Good first time = ${unitsIn} - ${rework} - ${scrap}.`],
    solution: [`Units entering: $${unitsIn}$.`, `Units passing first time: $${unitsIn} - ${rework} - ${scrap} = ${unitsIn - rework - scrap}$.`, `$FTY = ${unitsIn - rework - scrap} \\div ${unitsIn} = ${f(ans / 100, 4)} = ${f(ans, 2)}\\%$.`, `Final yield would be ${f(M.finalYield(unitsIn, scrap) * 100, 2)}%, which hides the ${rework} reworked bills.`],
  }
}

function genRty(r: R, d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const n = d === 'beginner' ? 3 : d === 'intermediate' ? 4 : 5
  const names = ['Order capture', 'Credit check', 'Line provisioning', 'Equipment dispatch', 'Activation call'].slice(0, n)
  const ys = names.map(() => r.round(0.86, 0.995, 0.005))
  const ans = round(M.rty(ys) * 100, 2)
  const avg = ys.reduce((a, b) => a + b, 0) / ys.length
  const useCounts = d === 'advanced' || d === 'master'
  let table: Problem['table']
  const solution: string[] = []
  if (useCounts) {
    const unitsIn = 1000
    table = { head: ['Step', 'Units in', 'Passed first time'], rows: names.map((nm, i) => [nm, unitsIn, Math.round(unitsIn * ys[i])]) }
    solution.push('Convert each step to an FTY: passed first time / units in.')
  } else {
    table = { head: ['Step', 'First time yield'], rows: names.map((nm, i) => [nm, `${f(ys[i] * 100, 1)}%`]) }
  }
  solution.push(`$RTY = ${ys.map(y => f(y, 3)).join(' \\times ')} = ${f(ans / 100, 4)}$`, `$RTY = ${f(ans, 2)}\\%$: only about ${Math.round(ans)} of every 100 orders flow through every step without any rework or scrap.`)
  return {
    context: `Kestrel Mobile's new-line process has ${n} steps. ${useCounts ? 'Each step was measured on 1,000 orders.' : 'The first time yield of each step is shown.'}`,
    table,
    question: 'What is the rolled throughput yield (RTY) of the whole process? Give a percentage to 2 decimal places.',
    expected: ans, unit: '%', decimals: 2, percent: true,
    mistakes: [
      { value: round(avg * 100, 2), tag: 'rty-added-or-averaged', message: 'You averaged the yields. RTY multiplies them, because a unit must pass every step.' },
      { value: round(Math.min(...ys) * 100, 2), tag: 'fty-vs-rty', message: 'You took the worst step. RTY is lower than every individual step because losses compound.' },
      { value: round(ys.reduce((a, b) => a + b, 0) * 100, 2), tag: 'rty-added-or-averaged', message: 'You added the yields. Yields are probabilities and must be multiplied.' },
    ],
    hints: ['A unit has to pass step 1 AND step 2 AND every other step first time.', 'Multiply the yields as decimals, then convert to a percentage.'],
    solution,
  }
}

function genFinalYield(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const unitsIn = r.pick([500, 750, 1200, 1600])
  const scrap = Math.round(unitsIn * r.round(0.01, 0.04, 0.005))
  const rework = Math.round(unitsIn * r.round(0.05, 0.15, 0.005))
  const ans = round(M.finalYield(unitsIn, scrap) * 100, 2)
  return {
    context: `A field-repair process started ${M.fmt(unitsIn)} jobs. ${M.fmt(rework)} jobs needed a second visit but were then completed, and ${M.fmt(scrap)} jobs were abandoned.`,
    question: 'What is the final (traditional) yield, counting reworked jobs as good? Percentage to 2 decimal places.',
    expected: ans, unit: '%', decimals: 2, percent: true,
    mistakes: [{ value: round(M.fty(unitsIn, scrap, rework) * 100, 2), tag: 'fty-vs-rty', message: 'That is the first time yield. This question asks for final yield, which counts reworked jobs as good.' }],
    hints: ['Final yield = units that eventually come out good / units in.'],
    solution: [`Good at the end $= ${unitsIn} - ${scrap} = ${unitsIn - scrap}$.`, `$${unitsIn - scrap} \\div ${unitsIn} = ${f(ans, 2)}\\%$.`, `FTY would be only ${f(M.fty(unitsIn, scrap, rework) * 100, 2)}%. The gap is the hidden factory of second visits.`],
  }
}

function genCycle(r: R, d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const steps = [
    { name: 'Log and classify', min: r.int(4, 12) },
    { name: 'Diagnose remotely', min: r.int(15, 45) },
    { name: 'Wait for engineer', min: r.int(60, 240) },
    { name: 'Repair on site', min: r.int(35, 95) },
    { name: 'Confirm with customer', min: r.int(5, 20) },
  ]
  const total = steps.reduce((s, x) => s + x.min, 0)
  const hours = d !== 'beginner'
  const ans = hours ? round(total / 60, 2) : total
  return {
    context: 'A Northwind Fibre fault ticket moves through these stages one after another (elapsed time for one ticket):',
    table: { head: ['Stage', 'Elapsed minutes'], rows: steps.map(s => [s.name, s.min]) },
    question: hours ? 'What is the cycle time for this ticket, from start to completion, in hours? Give 2 decimal places.' : 'What is the cycle time for this ticket, from start to completion, in minutes?',
    expected: ans, unit: hours ? 'hours' : 'minutes', decimals: hours ? 2 : 0,
    mistakes: [
      ...(hours ? [{ value: total, tag: 'time-units' as MistakeTag, message: 'That is the total in minutes. The question asks for hours: divide by 60.' }] : []),
      { value: hours ? round((total - steps[2].min) / 60, 2) : total - steps[2].min, tag: 'cycle-time', message: 'You left out the waiting stage. Elapsed cycle time includes waiting between start and completion.' },
      ...(hours ? [{ value: round(total / 100, 2), tag: 'time-units' as MistakeTag, message: 'An hour has 60 minutes, not 100.' }] : []),
    ],
    hints: ['Cycle time here is the total elapsed time from start to completion.', 'Waiting time counts: the customer is still waiting.', hours ? 'Convert minutes to hours by dividing by 60.' : 'Add every stage.'],
    solution: [`Total elapsed time $= ${steps.map(s => s.min).join(' + ')} = ${total}$ minutes.`, ...(hours ? [`$${total} \\div 60 = ${f(ans, 2)}$ hours.`] : []), `Notice that waiting for an engineer is ${Math.round(steps[2].min / total * 100)}% of the cycle time: the biggest target is not the repair itself.`],
  }
}

function genSigma(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const table: [number, number][] = [[1, 691462], [2, 308538], [3, 66807], [4, 6210], [5, 233], [6, 3.4]]
  const [s, v] = r.pick(table.slice(1))
  return {
    context: `A process runs at ${M.fmt(v, 1)} DPMO in the long term. Use the conventional sigma conversion table, which assumes a 1.5 sigma long-term shift.`,
    question: 'What is the (short-term) sigma level of this process?',
    expected: s, unit: 'sigma', decimals: 0,
    mistakes: [{ value: s - 1.5, tag: 'percent-conversion', message: 'You subtracted the 1.5 shift. Conventional sigma tables already account for it: they report the short-term sigma level.' }],
    hints: ['Use the table: 3 sigma = 66,807 DPMO, 4 sigma = 6,210, 5 sigma = 233, 6 sigma = 3.4.'],
    solution: [`${M.fmt(v, 1)} DPMO matches ${s} sigma in the conventional table.`, 'Remember the assumption: the table includes a 1.5 sigma shift between short-term and long-term performance.'],
  }
}

function genCopq(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const items = {
    training: r.round(8000, 20000, 500),
    audits: r.round(12000, 30000, 500),
    rework: r.round(20000, 60000, 500),
    credits: r.round(15000, 70000, 500),
    complaints: r.round(5000, 25000, 500),
  }
  const internal = items.rework
  const external = items.credits + items.complaints
  const ans = internal + external
  return {
    context: 'Last quarter at the Northwind Fibre contact centre:',
    table: { head: ['Cost item', 'Amount ($)'], rows: [
      ['Agent training on new troubleshooting script', items.training],
      ['Quality audits of recorded calls', items.audits],
      ['Re-work of incorrectly closed tickets (before customer contact)', items.rework],
      ['SLA credits paid to customers', items.credits],
      ['Handling customer complaints', items.complaints],
    ] },
    question: 'Using the strict definition (internal + external failure costs), what is the cost of poor quality in dollars?',
    expected: ans, unit: '$', decimals: 0,
    mistakes: [
      { value: ans + items.training + items.audits, tag: 'copq-classification', message: 'You included prevention (training) and appraisal (audits). Those are costs of good quality under the strict definition.' },
      { value: ans + items.audits, tag: 'copq-classification', message: 'Quality audits are appraisal costs, not failure costs.' },
      { value: external, tag: 'copq-classification', message: 'You only counted external failures. Rework found before the customer is an internal failure cost and still counts.' },
    ],
    hints: ['Sort each item into prevention, appraisal, internal failure or external failure.', 'COPQ (strict) = internal failure + external failure.'],
    solution: [`Prevention: training $${M.fmt(items.training)}$. Appraisal: audits $${M.fmt(items.audits)}$.`, `Internal failure: rework $${M.fmt(internal)}$.`, `External failure: credits + complaints $= ${M.fmt(external)}$.`, `$COPQ = ${M.fmt(internal)} + ${M.fmt(external)} = ${M.fmt(ans)}$.`],
  }
}

function genPareto(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const labels = ['No dial tone', 'Slow speed', 'Intermittent drop', 'Billing query', 'Router fault', 'Other']
  const vals = labels.map((l) => (l === 'Other' ? r.int(8, 20) : r.int(15, 160)))
  const rows = M.pareto(labels.map((l, i) => ({ label: l, value: vals[i] })))
  const k = r.int(1, 3)
  const ans = round(rows[k].cumPercent, 1)
  return {
    context: 'Repeat-contact reasons logged by the Kestrel Mobile help line last month (unsorted):',
    table: { head: ['Reason', 'Contacts'], rows: labels.map((l, i) => [l, vals[i]]) },
    question: `After sorting into a Pareto chart, what is the cumulative percentage at the ${['first', 'second', 'third', 'fourth'][k]} bar? Give 1 decimal place.`,
    expected: ans, unit: '%', decimals: 1, percent: true,
    mistakes: [
      { value: round(rows[k].percent, 1), tag: 'cumulative-percent', message: 'That is the percentage for that bar alone. The cumulative percentage adds every bar up to and including it.' },
      { value: round(rows.slice(0, k + 1).reduce((s, x) => s + x.value, 0), 1), tag: 'cumulative-percent', message: 'That is the cumulative count. Divide by the grand total and multiply by 100.' },
    ],
    hints: ['Sort the reasons from largest to smallest, keeping Other last.', `Grand total = ${vals.reduce((a, b) => a + b, 0)}.`],
    solution: [
      `Sorted: ${rows.map(x => `${x.label} (${x.value})`).join(', ')}.`,
      `Cumulative count at bar ${k + 1} $= ${rows.slice(0, k + 1).map(x => x.value).join(' + ')} = ${rows[k].cumValue}$.`,
      `$${rows[k].cumValue} \\div ${rows[rows.length - 1].cumValue} \\times 100 = ${f(ans, 1)}\\%$.`,
    ],
  }
}

function genImprovement(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const base = r.round(18, 60, 0.5)
  const now = round(base * r.round(0.45, 0.85, 0.01), 1)
  const ans = round(M.improvementPercent(base, now), 1)
  return {
    context: `The average time to restore a broadband fault was ${f(base, 1)} hours at baseline. After the project it is ${f(now, 1)} hours.`,
    question: 'What is the percentage improvement? Give 1 decimal place.',
    expected: ans, unit: '%', decimals: 1, percent: true,
    mistakes: [
      { value: round((base - now) / now * 100, 1), tag: 'percent-conversion', message: 'You divided by the new value. Percentage improvement is measured against the baseline.' },
      { value: round(base - now, 1), tag: 'percent-conversion', message: 'That is the reduction in hours, not a percentage.' },
      { value: round(now / base * 100, 1), tag: 'percent-conversion', message: 'That is the new value as a percentage of the baseline, not the improvement.' },
    ],
    hints: ['Improvement = (baseline - new) / baseline.'],
    solution: [`$(${f(base, 1)} - ${f(now, 1)}) \\div ${f(base, 1)} = ${f((base - now) / base, 4)}$.`, `$= ${f(ans, 1)}\\%$ improvement.`],
  }
}

function genRoi(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const cost = r.round(40000, 120000, 1000)
  const benefit = Math.round(cost * r.round(1.6, 4, 0.1) / 1000) * 1000
  const ans = round(M.roiPercent(benefit, cost), 1)
  return {
    context: `An invoice-automation project cost $${M.fmt(cost)} to implement. Finance verified first-year gross benefits of $${M.fmt(benefit)}.`,
    question: 'What is the first-year ROI using net benefit (gross benefit minus cost) divided by cost? Give 1 decimal place.',
    expected: ans, unit: '%', decimals: 1, percent: true,
    mistakes: [
      { value: round(benefit / cost * 100, 1), tag: 'gross-vs-net', message: 'You used the gross benefit. ROI on a net basis subtracts the cost first.' },
      { value: round((benefit - cost) / benefit * 100, 1), tag: 'gross-vs-net', message: 'You divided by the benefit. ROI divides by the cost (the investment).' },
    ],
    hints: ['Net benefit = gross benefit - cost.', 'ROI = net benefit / cost x 100.'],
    solution: [`Net benefit $= ${M.fmt(benefit)} - ${M.fmt(cost)} = ${M.fmt(benefit - cost)}$.`, `$ROI = ${M.fmt(benefit - cost)} \\div ${M.fmt(cost)} \\times 100 = ${f(ans, 1)}\\%$.`, 'This formula is supplementary: always check which ROI definition your organisation uses.'],
  }
}

function genPayback(r: R, d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const invest = r.round(30000, 150000, 1000)
  const monthly = r.round(4000, 15000, 250)
  const yearly = monthly * 12
  const askMonths = d === 'beginner' || r.next() > 0.5
  const ans = askMonths ? round(invest / monthly, 1) : round(invest / yearly, 2)
  return {
    context: `A Northwind Fibre self-service portal costs $${M.fmt(invest)} up front and saves $${M.fmt(monthly)} per month in net operating cost.`,
    question: askMonths ? 'What is the payback period in months? Give 1 decimal place.' : 'What is the payback period in years? Give 2 decimal places.',
    expected: ans, unit: askMonths ? 'months' : 'years', decimals: askMonths ? 1 : 2,
    mistakes: askMonths ? [
      { value: round(invest / yearly, 2), tag: 'time-units', message: 'That is in years. The question asks for months.' },
    ] : [
      { value: round(invest / monthly, 1), tag: 'time-units', message: 'That is in months. Convert to years (divide by 12) or use annual savings.' },
      { value: round(invest / monthly / 10, 2), tag: 'time-units', message: 'Check your conversion: there are 12 months in a year.' },
    ],
    hints: ['Payback = investment / net savings per period.', askMonths ? 'Use monthly savings.' : `Annual savings = ${M.fmt(monthly)} x 12 = ${M.fmt(yearly)}.`],
    solution: askMonths
      ? [`$${M.fmt(invest)} \\div ${M.fmt(monthly)} = ${f(ans, 1)}$ months.`]
      : [`Annual net savings $= ${M.fmt(monthly)} \\times 12 = ${M.fmt(yearly)}$.`, `$${M.fmt(invest)} \\div ${M.fmt(yearly)} = ${f(ans, 2)}$ years.`],
  }
}

function genTakt(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const hours = r.pick([7.5, 8, 7, 9])
  const breaks = r.pick([30, 45, 60])
  const demand = r.pick([90, 120, 150, 180, 210, 240])
  const avail = hours * 60 - breaks
  const ans = round(M.taktTime(avail * 60, demand), 1)
  return {
    context: `A service desk shift lasts ${hours} hours with ${breaks} minutes of breaks. Customers raise ${demand} requests per shift.`,
    question: 'What is the takt time in seconds per request? Give 1 decimal place.',
    expected: ans, unit: 'seconds', decimals: 1,
    mistakes: [
      { value: round(hours * 3600 / demand, 1), tag: 'time-units', message: 'You forgot to remove break time. Takt uses available working time.' },
      { value: round(avail / demand, 1), tag: 'time-units', message: 'That is minutes per request. Convert to seconds.' },
    ],
    hints: ['Available time = shift time - breaks.', 'Takt = available time / customer demand.'],
    solution: [`Available $= ${hours} \\times 60 - ${breaks} = ${avail}$ min $= ${avail * 60}$ s.`, `$Takt = ${avail * 60} \\div ${demand} = ${f(ans, 1)}$ s per request.`, 'Takt time is supplementary to the Define syllabus but often compared with cycle time.'],
  }
}

function genLead(r: R, _d: Difficulty): Omit<Problem, 'id' | 'formula' | 'difficulty'> {
  const wip = r.pick([120, 180, 240, 360, 420])
  const thr = r.pick([30, 40, 60, 80])
  const ans = round(M.littleLeadTime(wip, thr), 2)
  return {
    context: `An invoice approval queue holds ${wip} invoices on average and the team completes ${thr} invoices per day.`,
    question: "Using Little's Law, what is the average lead time in days? Give 2 decimal places.",
    expected: ans, unit: 'days', decimals: 2,
    mistakes: [{ value: round(thr / wip, 2), tag: 'cycle-time', message: 'The ratio is upside down: lead time = WIP / throughput.' }],
    hints: ["Little's Law: lead time = work in process / throughput."],
    solution: [`$${wip} \\div ${thr} = ${f(ans, 2)}$ days.`, 'Supplementary: Lead time is not part of Define 1.2.5 but explains why queues inflate customer waiting time.'],
  }
}

const GENERATORS: Record<FormulaId, (r: R, d: Difficulty) => Omit<Problem, 'id' | 'formula' | 'difficulty'>> = {
  dpu: genDpu,
  dpo: (r, d) => genDpmo(r, d, true),
  dpmo: (r, d) => genDpmo(r, d, false),
  defective: genDefective,
  fty: genFty,
  rty: genRty,
  'final-yield': genFinalYield,
  cycle: genCycle,
  sigma: genSigma,
  copq: genCopq,
  pareto: genPareto,
  improvement: genImprovement,
  roi: genRoi,
  payback: genPayback,
  takt: genTakt,
  lead: genLead,
}

export function generateProblem(formula: FormulaId, difficulty: Difficulty, seed = Date.now() % 1_000_000_007): Problem {
  const r = rng(seed + formula.length * 7919 + difficulty.length * 104729)
  const p = GENERATORS[formula](r, difficulty)
  return { ...p, id: `${formula}:${difficulty}:${seed}`, formula, difficulty }
}

export type CheckResult =
  | { kind: 'correct'; note?: string }
  | { kind: 'mistake'; mistake: Mistake }
  | { kind: 'wrong' }
  | { kind: 'invalid' }

export function checkAnswer(p: Problem, raw: string): CheckResult {
  const v = M.parseNumber(raw)
  if (v === null) return { kind: 'invalid' }
  const tol = Math.max(0.5 * 10 ** -p.decimals, Math.abs(p.expected) * 0.001)
  const near = (a: number, b: number) => Math.abs(a - b) <= tol + 1e-12
  if (near(v, p.expected)) return { kind: 'correct' }
  if (p.percent && near(v * 100, p.expected)) {
    return { kind: 'correct', note: `Your value ${raw} is the fraction; the percentage is ${M.fmt(p.expected, p.decimals)}%. Both describe the same result.` }
  }
  for (const m of p.mistakes) {
    const mt = Math.max(0.5 * 10 ** -p.decimals, Math.abs(m.value) * 0.001)
    if (Math.abs(v - m.value) <= mt + 1e-12) return { kind: 'mistake', mistake: m }
  }
  return { kind: 'wrong' }
}
