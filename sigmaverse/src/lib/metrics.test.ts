import { describe, expect, it } from 'vitest'
import * as M from './metrics'
import { checkAnswer, generateProblem, type FormulaId } from './problems'
import type { Difficulty } from '../data/types'

describe('defect metrics', () => {
  it('computes DPU from total defects, not defectives', () => {
    expect(M.dpu(150, 500)).toBeCloseTo(0.3)
  })
  it('computes DPO and DPMO with opportunities', () => {
    expect(M.dpo(30, 1000, 6)).toBeCloseTo(0.005)
    expect(M.dpmo(30, 1000, 6)).toBeCloseTo(5000)
  })
  it('computes proportion defective', () => {
    expect(M.proportionDefective(45, 900)).toBeCloseTo(0.05)
    expect(() => M.proportionDefective(10, 5)).toThrow()
  })
  it('rejects impossible inputs', () => {
    expect(() => M.dpu(5, 0)).toThrow()
    expect(() => M.dpo(5, 10, 0)).toThrow()
  })
})

describe('yields', () => {
  it('FTY excludes rework and scrap; final yield hides rework', () => {
    expect(M.fty(1000, 20, 80)).toBeCloseTo(0.9)
    expect(M.finalYield(1000, 20)).toBeCloseTo(0.98)
  })
  it('RTY multiplies step yields', () => {
    expect(M.rty([0.9, 0.95, 0.98])).toBeCloseTo(0.8379, 4)
    expect(() => M.rty([])).toThrow()
    expect(() => M.rty([1.2])).toThrow()
  })
  it('matches the book value stream example (PDF p.108)', () => {
    expect(M.rty([0.92, 0.94, 0.59, 0.96, 0.96])).toBeCloseTo(0.47, 2)
  })
  it('approximates yield from DPU', () => {
    expect(M.yieldFromDpu(0.1)).toBeCloseTo(0.9048, 4)
  })
})

describe('sigma conversion with the 1.5 shift', () => {
  it('reproduces the conventional table', () => {
    expect(M.dpmoFromSigma(6)).toBeCloseTo(3.4, 1)
    expect(M.dpmoFromSigma(5)).toBeCloseTo(233, 0)
    expect(M.dpmoFromSigma(4)).toBeCloseTo(6210, -1)
    expect(M.dpmoFromSigma(3)).toBeCloseTo(66807, -1)
    expect(M.sigmaFromDpmo(3.4)).toBeCloseTo(6, 2)
    expect(M.sigmaFromDpmo(66807)).toBeCloseTo(3, 2)
  })
})

describe('pareto', () => {
  it('sorts descending, keeps Other last and accumulates to 100%', () => {
    const rows = M.pareto([
      { label: 'B', value: 20 }, { label: 'Other', value: 30 }, { label: 'A', value: 50 },
    ])
    expect(rows.map(r => r.label)).toEqual(['A', 'B', 'Other'])
    expect(rows[1].cumPercent).toBeCloseTo(70)
    expect(rows[2].cumPercent).toBeCloseTo(100)
    expect(M.vitalFew(rows, 70).map(r => r.label)).toEqual(['A', 'B'])
  })
})

describe('finance', () => {
  it('computes ROI on net benefit, payback and improvement', () => {
    expect(M.roiPercent(150000, 50000)).toBeCloseTo(200)
    expect(M.paybackPeriods(60000, 5000)).toBeCloseTo(12)
    expect(M.improvementPercent(40, 30)).toBeCloseTo(25)
  })
  it('splits cost of quality', () => {
    const c = M.costOfQuality({ prevention: 10, appraisal: 20, internalFailure: 30, externalFailure: 40 })
    expect(c.copqStrict).toBe(70)
    expect(c.total).toBe(100)
  })
})

describe('input parsing', () => {
  it('parses commas, percents and fractions', () => {
    expect(M.parseNumber('12,500')).toBe(12500)
    expect(M.parseNumber('4.5%')).toBe(4.5)
    expect(M.parseNumber('4.5%', { percentAsFraction: true })).toBeCloseTo(0.045)
    expect(M.parseNumber('3/4')).toBe(0.75)
    expect(M.parseNumber('abc')).toBeNull()
  })
})

describe('generated problems', () => {
  const formulas: FormulaId[] = ['dpu', 'dpo', 'dpmo', 'defective', 'fty', 'rty', 'final-yield', 'cycle', 'sigma', 'copq', 'pareto', 'improvement', 'roi', 'payback', 'takt', 'lead']
  const levels: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'trap', 'master']
  it('always accept their own answer and never confuse it with a listed mistake', () => {
    for (const f of formulas) for (const d of levels) for (let seed = 1; seed < 60; seed++) {
      const p = generateProblem(f, d, seed * 7919)
      expect(Number.isFinite(p.expected)).toBe(true)
      expect(checkAnswer(p, String(p.expected)).kind).toBe('correct')
      for (const m of p.mistakes) {
        if (Math.abs(m.value - p.expected) < 1e-9) continue
        const res = checkAnswer(p, String(m.value))
        // A mistake value must never be marked correct.
        expect(res.kind, `${f}/${d}/${seed}: mistake ${m.value} vs ${p.expected}`).not.toBe('correct')
      }
    }
  })
})
