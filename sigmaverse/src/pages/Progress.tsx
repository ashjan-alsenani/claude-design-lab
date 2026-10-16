import { Award, ChartNoAxesColumn, Flame, Lock, Printer, Target } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mark } from '../components/Logo'
import { Meter, PageHeader, Section } from '../components/ui'
import { LESSONS, MODULES, moduleMeta } from '../data/curriculum'
import { FORMULAS } from '../data/formulas'
import { ACHIEVEMENTS, lessonMastery, level, mathReadiness, overallAccuracy, overallMastery } from '../lib/insights'
import { today, useProfile, type Profile } from '../lib/store'

function Heatmap({ days }: { days: Record<string, number> }) {
  const cells: { d: string; m: number }[] = []
  const base = new Date()
  for (let i = 7 * 12 - 1; i >= 0; i--) {
    const d = new Date(base); d.setDate(base.getDate() - i)
    const key = today(d)
    cells.push({ d: key, m: days[key] ?? 0 })
  }
  const shade = (m: number) => (m === 0 ? 'bg-surface-3' : m < 15 ? 'bg-violet/25' : m < 35 ? 'bg-violet/50' : m < 60 ? 'bg-violet/75' : 'bg-violet')
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1" style={{ gridAutoColumns: 'minmax(10px, 1fr)' }}>
        {cells.map(c => <div key={c.d} className={`aspect-square rounded-[3px] ${shade(c.m)}`} title={`${c.d}: ${c.m} active minutes`} />)}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-ink-3">Less <span className="size-2.5 rounded-sm bg-surface-3" /><span className="size-2.5 rounded-sm bg-violet/25" /><span className="size-2.5 rounded-sm bg-violet/50" /><span className="size-2.5 rounded-sm bg-violet/75" /><span className="size-2.5 rounded-sm bg-violet" /> More</div>
    </div>
  )
}

function AttemptChart({ p }: { p: Profile }) {
  const pts = p.attempts.slice(0, 20).reverse()
  if (pts.length < 2) return <p className="text-sm text-ink-3">Complete at least two practice sets to see your accuracy trend.</p>
  const W = 600, H = 180, pad = 28
  const x = (i: number) => pad + (i * (W - pad * 2)) / (pts.length - 1)
  const y = (v: number) => H - pad - v * (H - pad * 2)
  const d = pts.map((a, i) => `${i ? 'L' : 'M'}${x(i)},${y(a.correct / a.total)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Accuracy across your recent practice attempts">
      {[0, 0.5, 0.7, 1].map(v => (
        <g key={v}>
          <line x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} stroke={v === 0.7 ? 'var(--amber)' : 'var(--line)'} strokeDasharray={v === 0.7 ? '4 4' : undefined} />
          <text x={4} y={y(v) + 4} fontSize="11" fill="var(--ink-3)">{v * 100}%</text>
        </g>
      ))}
      <path d={d} fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((a, i) => <circle key={a.id} cx={x(i)} cy={y(a.correct / a.total)} r="4" fill={a.mode === 'mock' ? 'var(--coral)' : 'var(--violet)'}><title>{`${a.mode}: ${Math.round((a.correct / a.total) * 100)}%`}</title></circle>)}
    </svg>
  )
}

const CERTS = [
  ...MODULES.map(m => ({ id: `module-${m.id}`, title: `Module ${m.ref}: ${m.title}`, line: `completed every lesson of Module ${m.ref}, ${m.title}` })),
  { id: 'define-complete', title: 'Define Phase study programme', line: 'completed all 19 Define Phase lessons' },
  { id: 'mock-pass', title: 'Define Mock Exam', line: 'scored 70% or more on a timed Define mock exam' },
]

export default function Progress() {
  const p = useProfile()
  const [cert, setCert] = useState<(typeof CERTS)[number] | null>(null)
  const [name, setName] = useState('')
  const lvl = level(p.xp)
  const mastery = overallMastery(p)
  const acc = overallAccuracy(p)
  const math = mathReadiness(p)
  const done = LESSONS.filter(l => p.completed[l.id]).length
  const minutesTotal = Object.values(p.days).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="no-print">
        <PageHeader icon={<ChartNoAxesColumn className="size-5" />} title="Progress & Analytics" lead="Everything here is calculated from your own recorded activity in this browser. Nothing is estimated from people you have never met." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-surface p-4"><div className="text-xs font-semibold text-ink-3">Level</div><div className="tabular font-display text-3xl font-semibold text-ink">{lvl.level}</div><Meter value={lvl.into / lvl.need} className="mt-2" label="Progress to next level" /><div className="mt-1 text-xs text-ink-3">{p.xp} XP · {lvl.need - lvl.into} to next level</div></div>
          <div className="rounded-2xl border border-line bg-surface p-4"><div className="text-xs font-semibold text-ink-3">Streak</div><div className="flex items-center gap-2 font-display text-3xl font-semibold text-ink"><Flame className="size-6 text-coral" />{p.streak.current}</div><div className="mt-1 text-xs text-ink-3">Best {p.streak.best} days · {minutesTotal} active minutes in total</div></div>
          <div className="rounded-2xl border border-line bg-surface p-4"><div className="text-xs font-semibold text-ink-3">Lessons completed</div><div className="tabular font-display text-3xl font-semibold text-ink">{done}/19</div><div className="mt-1 text-xs text-ink-3">Mastery estimate {mastery !== null ? `${Math.round(mastery * 100)}%` : 'not measured yet'}</div></div>
          <div className="rounded-2xl border border-line bg-surface p-4"><div className="text-xs font-semibold text-ink-3">Question accuracy</div><div className="tabular font-display text-3xl font-semibold text-ink">{acc ? `${Math.round(acc.rate * 100)}%` : '-'}</div><div className="mt-1 text-xs text-ink-3">{acc ? `${acc.seen} answers` : 'No answers yet'}{math ? ` · maths readiness ${Math.round(math.score * 100)}%` : ''}</div></div>
        </div>

        <Section title="Study activity, last 12 weeks"><div className="rounded-2xl border border-line bg-surface p-5"><Heatmap days={p.days} /></div></Section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Mastery by lesson">
            <ul className="space-y-2.5 rounded-2xl border border-line bg-surface p-5">
              {LESSONS.map(l => {
                const m = lessonMastery(p, l.id)
                return (
                  <li key={l.id} className="text-sm">
                    <div className="flex justify-between gap-2"><Link to={`/lessons/${l.id}`} className="truncate text-ink hover:text-violet">{l.id} {l.short}</Link><span className="tabular shrink-0 text-xs font-semibold text-ink-3">{m === null ? 'no evidence' : `${Math.round(m * 100)}%`}</span></div>
                    <Meter value={m ?? 0} tone={moduleMeta(l.module).tone} className="mt-1" label={`${l.short} mastery`} />
                  </li>
                )
              })}
            </ul>
          </Section>
          <div>
            <Section title="Practice accuracy trend"><div className="rounded-2xl border border-line bg-surface p-5"><AttemptChart p={p} /><p className="mt-2 text-xs text-ink-3">Coral points are mock exams. The dashed line marks the 70% pass mark of the full exam.</p></div></Section>
            <Section title="Formula performance">
              <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
                <table className="tabular w-full text-sm">
                  <thead><tr className="bg-surface-2 text-left"><th className="px-4 py-2.5 font-semibold text-ink">Formula</th><th className="px-4 py-2.5 font-semibold text-ink">Correct</th><th className="px-4 py-2.5 font-semibold text-ink">Best level</th></tr></thead>
                  <tbody>
                    {FORMULAS.map(f => { const s = p.formulas[f.id]; return (
                      <tr key={f.id} className="border-t border-line"><td className="px-4 py-2"><Link to={`/formulas/${f.id}`} className="text-ink hover:text-violet">{f.name}</Link></td><td className="px-4 py-2 text-ink-2">{s ? `${s.correct}/${s.attempts}` : '-'}</td><td className="px-4 py-2 capitalize text-ink-2">{s?.best ?? '-'}</td></tr>
                    ) })}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>

        <Section title="Achievements" className="scroll-mt-24">
          <div id="achievements" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACHIEVEMENTS.map(a => {
              const got = p.achievements[a.id]
              return (
                <div key={a.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${got ? 'border-amber/40 bg-amber-soft/50' : 'border-line bg-surface opacity-75'}`}>
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${got ? 'bg-amber text-surface' : 'bg-surface-3 text-ink-3'}`}>{got ? <Award className="size-5" /> : <Lock className="size-4" />}</span>
                  <div><div className="font-semibold text-ink">{a.title}</div><div className="text-xs leading-relaxed text-ink-2">{a.desc}</div>{got && <div className="mt-1 text-[11px] text-ink-3">{new Date(got).toLocaleDateString()}</div>}</div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Personal study certificates">
          <p className="-mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-ink-2">Certificates mark your own study milestones in this academy. They are not IASSC or PeopleCert certifications and carry no official status.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {CERTS.map(c => {
              const got = !!p.achievements[c.id]
              return (
                <div key={c.id} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
                  <div className="font-semibold text-ink">{c.title}</div>
                  <div className="mt-1 flex-1 text-xs text-ink-3">{got ? `Earned ${new Date(p.achievements[c.id]).toLocaleDateString()}` : 'Not earned yet'}</div>
                  <button className="btn btn-soft btn-sm mt-3" disabled={!got} onClick={() => setCert(c)}><Printer className="size-4" /> {got ? 'View and print' : 'Locked'}</button>
                </div>
              )
            })}
          </div>
          {cert && (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
              <label className="label" htmlFor="cert-name">Name on the certificate</label>
              <div className="flex flex-wrap gap-2"><input id="cert-name" className="field max-w-sm" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /><button className="btn btn-primary" onClick={() => window.print()}><Printer className="size-4" /> Print or save as PDF</button><button className="btn btn-ghost" onClick={() => setCert(null)}>Close</button></div>
            </div>
          )}
        </Section>

        <Section title="Daily objectives">
          <DailyObjectives />
        </Section>
      </div>

      {cert && (
        <div className="print-only">
          <div style={{ border: '6px double #2b2a7a', padding: '48px', textAlign: 'center', fontFamily: 'var(--font-display)', color: '#17163a' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Mark size={56} /></div>
            <div style={{ marginTop: 16, fontSize: 14, letterSpacing: 2 }}>SIGMAVERSE DEFINE MASTERY ACADEMY</div>
            <div style={{ marginTop: 28, fontSize: 18 }}>This personal study certificate is presented to</div>
            <div style={{ marginTop: 12, fontSize: 40, fontWeight: 700 }}>{name || 'Learner'}</div>
            <div style={{ marginTop: 16, fontSize: 18 }}>who {cert.line}</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 600 }}>{cert.title}</div>
            <div style={{ marginTop: 28, fontSize: 14 }}>{new Date(p.achievements[cert.id] ?? Date.now()).toLocaleDateString()}</div>
            <div style={{ marginTop: 28, fontSize: 11, color: '#66648a' }}>A personal learning milestone in a self-study application. Not an IASSC or PeopleCert certification.</div>
          </div>
        </div>
      )}
    </div>
  )
}

function DailyObjectives() {
  const p = useProfile()
  const t = today()
  const minutes = p.days[t] ?? 0
  const lessonsToday = LESSONS.filter(l => (p.completed[l.id] ?? 0) > new Date(t).getTime()).length
  const answeredToday = Object.values(p.qstats).filter(s => s.lastAt > new Date(t + 'T00:00:00').getTime()).length
  const formulaToday = p.session.answered
  const items = [
    { label: `Study ${p.settings.dailyGoalMinutes} active minutes`, v: minutes / p.settings.dailyGoalMinutes, text: `${minutes} min` },
    { label: 'Complete one lesson', v: Math.min(1, lessonsToday), text: `${lessonsToday}` },
    { label: 'Answer 15 questions', v: answeredToday / 15, text: `${answeredToday}` },
    { label: 'Solve 5 calculations in this session', v: Math.min(1, formulaToday / 5), text: `${formulaToday}` },
  ]
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map(i => (
        <li key={i.label} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <Target className={`size-5 shrink-0 ${i.v >= 1 ? 'text-good' : 'text-ink-3'}`} />
          <div className="flex-1"><div className="flex justify-between text-sm"><span className="font-medium text-ink">{i.label}</span><span className="tabular text-ink-3">{i.text}</span></div><Meter value={i.v} tone={i.v >= 1 ? 'teal' : 'violet'} className="mt-1.5" label={i.label} /></div>
        </li>
      ))}
    </ul>
  )
}
