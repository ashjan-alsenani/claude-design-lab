/**
 * Verified calculation functions used by every lab, calculator and generated
 * practice problem. Keep these pure and covered by metrics.test.ts.
 */

export const MILLION = 1_000_000

function assertPositive(name: string, v: number) {
  if (!Number.isFinite(v) || v <= 0) throw new RangeError(`${name} must be a positive number`)
}
function assertNonNegative(name: string, v: number) {
  if (!Number.isFinite(v) || v < 0) throw new RangeError(`${name} must be zero or more`)
}

/** Defects per unit: total defects / total units. */
export function dpu(defects: number, units: number): number {
  assertNonNegative('Defects', defects)
  assertPositive('Units', units)
  return defects / units
}

/** Defects per opportunity: defects / (units x opportunities per unit). */
export function dpo(defects: number, units: number, opportunitiesPerUnit: number): number {
  assertNonNegative('Defects', defects)
  assertPositive('Units', units)
  assertPositive('Opportunities per unit', opportunitiesPerUnit)
  return defects / (units * opportunitiesPerUnit)
}

/** Defects per million opportunities. */
export function dpmo(defects: number, units: number, opportunitiesPerUnit: number): number {
  return dpo(defects, units, opportunitiesPerUnit) * MILLION
}

/** Proportion defective: defective units / total units. */
export function proportionDefective(defectiveUnits: number, units: number): number {
  assertNonNegative('Defective units', defectiveUnits)
  assertPositive('Units', units)
  if (defectiveUnits > units) throw new RangeError('Defective units cannot exceed total units')
  return defectiveUnits / units
}

/**
 * First time yield for one step: units that pass the first time with no rework
 * and no scrap, divided by units entering the step.
 */
export function fty(unitsIn: number, scrapped: number, reworked: number): number {
  assertPositive('Units in', unitsIn)
  assertNonNegative('Scrapped', scrapped)
  assertNonNegative('Reworked', reworked)
  if (scrapped + reworked > unitsIn) throw new RangeError('Scrap plus rework cannot exceed units in')
  return (unitsIn - scrapped - reworked) / unitsIn
}

/** Final (traditional) yield: units out / units in. Reworked units count as good, so rework is hidden. */
export function finalYield(unitsIn: number, scrapped: number): number {
  assertPositive('Units in', unitsIn)
  assertNonNegative('Scrapped', scrapped)
  if (scrapped > unitsIn) throw new RangeError('Scrap cannot exceed units in')
  return (unitsIn - scrapped) / unitsIn
}

/** Rolled throughput yield: the product of every step's first time yield. */
export function rty(stepYields: number[]): number {
  if (stepYields.length === 0) throw new RangeError('At least one step is required')
  return stepYields.reduce((acc, y) => {
    if (!Number.isFinite(y) || y < 0 || y > 1) throw new RangeError('Each yield must be between 0 and 1')
    return acc * y
  }, 1)
}

/** Poisson approximation of yield from DPU: e^(-DPU). Supplementary. */
export function yieldFromDpu(d: number): number {
  assertNonNegative('DPU', d)
  return Math.exp(-d)
}

/**
 * Normal CDF (Abramowitz-Stegun 7.1.26 via erf), accurate to about 1e-7.
 */
export function normCdf(z: number): number {
  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

/** Inverse normal CDF (Acklam's algorithm), relative error about 1e-9. */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1) throw new RangeError('p must be between 0 and 1')
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const pl = 0.02425
  let q: number, r: number
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p > 1 - pl) {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  q = p - 0.5
  r = q * q
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
}

/**
 * Short-term sigma level from long-term DPMO, using the conventional 1.5 sigma
 * shift (one-sided). 3.4 DPMO -> 6.0.
 */
export function sigmaFromDpmo(dpmoValue: number, shift = 1.5): number {
  if (dpmoValue <= 0) return Infinity
  if (dpmoValue >= MILLION) return -Infinity
  return normInv(1 - dpmoValue / MILLION) + shift
}

/** Long-term DPMO for a short-term sigma level, using the 1.5 sigma shift convention. */
export function dpmoFromSigma(sigma: number, shift = 1.5): number {
  return (1 - normCdf(sigma - shift)) * MILLION
}

export interface ParetoRow {
  label: string
  value: number
  percent: number
  cumValue: number
  cumPercent: number
}

/** Sort categories in descending order (an "Other" bucket always goes last) and compute cumulative percentages. */
export function pareto(items: { label: string; value: number }[], otherLabel = 'Other'): ParetoRow[] {
  const total = items.reduce((s, i) => s + i.value, 0)
  if (total <= 0) return []
  const other = items.filter(i => i.label === otherLabel)
  const rest = items.filter(i => i.label !== otherLabel).sort((a, b) => b.value - a.value)
  let cum = 0
  return [...rest, ...other].map(i => {
    cum += i.value
    return { label: i.label, value: i.value, percent: (i.value / total) * 100, cumValue: cum, cumPercent: (cum / total) * 100 }
  })
}

/** Categories needed to reach a cumulative threshold (default 80%). */
export function vitalFew(rows: ParetoRow[], threshold = 80): ParetoRow[] {
  const out: ParetoRow[] = []
  for (const r of rows) {
    out.push(r)
    if (r.cumPercent >= threshold - 1e-9) break
  }
  return out
}

export interface CostOfQuality {
  prevention: number
  appraisal: number
  internalFailure: number
  externalFailure: number
}

export function costOfQuality(c: CostOfQuality) {
  const conformance = c.prevention + c.appraisal
  const failure = c.internalFailure + c.externalFailure
  return { conformance, failure, total: conformance + failure, copqStrict: failure }
}

/** ROI as a percentage, using net benefit = total benefit - total cost. */
export function roiPercent(totalBenefit: number, totalCost: number): number {
  assertPositive('Total cost', totalCost)
  return ((totalBenefit - totalCost) / totalCost) * 100
}

/** Payback period in the same time unit as `netSavingsPerPeriod`. */
export function paybackPeriods(investment: number, netSavingsPerPeriod: number): number {
  assertNonNegative('Investment', investment)
  assertPositive('Net savings per period', netSavingsPerPeriod)
  return investment / netSavingsPerPeriod
}

/** Percentage improvement for a metric where lower is better. */
export function improvementPercent(baseline: number, current: number): number {
  assertPositive('Baseline', baseline)
  return ((baseline - current) / baseline) * 100
}

/** Takt time = available time / customer demand (same unit as available time per unit). Supplementary. */
export function taktTime(availableTime: number, demand: number): number {
  assertPositive('Available time', availableTime)
  assertPositive('Demand', demand)
  return availableTime / demand
}

/** Little's Law: lead time = WIP / throughput. Supplementary. */
export function littleLeadTime(wip: number, throughputPerPeriod: number): number {
  assertNonNegative('WIP', wip)
  assertPositive('Throughput', throughputPerPeriod)
  return wip / throughputPerPeriod
}

/** Relative-or-absolute tolerance check for learner answers. */
export function closeEnough(answer: number, expected: number, relTol = 0.005, absTol = 1e-9): boolean {
  if (!Number.isFinite(answer)) return false
  const diff = Math.abs(answer - expected)
  return diff <= absTol || diff <= Math.abs(expected) * relTol
}

/** Parse learner input such as "4.5%", "12,500", "0.95" or "1/4". Percent input returns a fraction when asFraction is set. */
export function parseNumber(input: string, opts: { percentAsFraction?: boolean } = {}): number | null {
  const s = input.trim().replace(/,/g, '').replace(/\s+/g, '')
  if (!s) return null
  const pct = s.endsWith('%')
  const core = pct ? s.slice(0, -1) : s
  let v: number
  if (/^-?\d+(\.\d+)?\/\d+(\.\d+)?$/.test(core)) {
    const [a, b] = core.split('/').map(Number)
    if (b === 0) return null
    v = a / b
  } else if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(core)) {
    v = Number(core)
  } else return null
  if (pct && opts.percentAsFraction) v = v / 100
  return Number.isFinite(v) ? v : null
}

export function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞'
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
}

export function pct(fraction: number, digits = 2): string {
  return `${fmt(fraction * 100, digits)}%`
}
