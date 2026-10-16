import { AlertCircle, Timer } from 'lucide-react'
import { useState } from 'react'
import { PracticeSession, type SessionConfig } from '../components/PracticeSession'
import { PageHeader } from '../components/ui'
import { LESSONS, MODULES } from '../data/curriculum'
import { QUESTIONS } from '../data/questions'
import type { ModuleId, Question } from '../data/types'
import { setSettings, useProfile } from '../lib/store'

/**
 * Builds a 19-question Define mock: at least one question per module weighted by
 * module size, including at least 4 calculations, drawn from non-trap questions.
 */
function buildMock(): Question[] {
  const rnd = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
  const quota: Record<ModuleId, number> = { 1: 5, 2: 6, 3: 4, 4: 4 }
  const out: Question[] = []
  for (const m of MODULES) {
    const lessonIds = new Set(LESSONS.filter(l => l.module === m.id).map(l => l.id))
    const pool = rnd(QUESTIONS.filter(q => lessonIds.has(q.lesson) && !q.id.startsWith('q-trap')))
    const picked: Question[] = []
    if (m.id === 2) picked.push(...pool.filter(q => q.numeric).slice(0, 3))
    if (m.id === 3) picked.push(...pool.filter(q => q.numeric).slice(0, 1))
    // Spread across lessons first.
    for (const l of rnd([...lessonIds])) {
      if (picked.length >= quota[m.id]) break
      const q = pool.find(x => x.lesson === l && !picked.includes(x))
      if (q) picked.push(q)
    }
    for (const q of pool) { if (picked.length >= quota[m.id]) break; if (!picked.includes(q)) picked.push(q) }
    out.push(...picked.slice(0, quota[m.id]))
  }
  return rnd(out)
}

export default function Mock() {
  const minutes = useProfile(p => p.settings.mockMinutes)
  const mocks = useProfile(p => p.attempts.filter(a => a.mode === 'mock').slice(0, 8))
  const [session, setSession] = useState<SessionConfig | null>(null)
  const start = () => setSession({ mode: 'mock', label: 'Define Mock Exam', questions: buildMock(), seconds: minutes * 60 })
  if (session) return <PracticeSession config={session} onExit={() => setSession(null)} onRetake={start} />
  return (
    <div>
      <PageHeader icon={<Timer className="size-5" />} title="Define Mock Exam" lead="A timed 19-question practice assessment approximating the Define component of the 100-question IASSC Green Belt exam, where Define carries 19% of the marks." />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-md">
          <h2 className="font-display text-xl font-semibold text-ink">Exam conditions</h2>
          <ul className="mt-4 space-y-3 text-[0.97rem] leading-relaxed text-ink-2">
            <li><span className="font-semibold text-ink">19 questions</span> drawn across all four Define modules (Basics 5, Fundamentals 6, Projects 4, Lean 4), including at least four calculations.</li>
            <li><span className="font-semibold text-ink">Time limit:</span> {minutes} minutes. The real exam allows 180 minutes for 100 questions (about 1.8 minutes each), so 34 minutes is the proportional equivalent.</li>
            <li><span className="font-semibold text-ink">Pass mark reference:</span> the full exam requires 70%. You can flag questions and change answers until you submit.</li>
            <li><span className="font-semibold text-ink">No feedback</span> until you submit. Then you get score, time, accuracy by topic, calculation performance, every incorrect answer explained and lessons to revisit.</li>
          </ul>
          <div className="mt-5">
            <label className="label" htmlFor="mock-min">Practice duration (minutes)</label>
            <div className="flex flex-wrap items-center gap-2">
              <input id="mock-min" type="number" min={10} max={90} className="field tabular w-28" value={minutes} onChange={e => setSettings({ mockMinutes: Math.max(5, Math.min(120, e.target.valueAsNumber || 34)) })} />
              <button className="btn btn-ghost btn-sm" onClick={() => setSettings({ mockMinutes: 34 })}>Standard (34)</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSettings({ mockMinutes: 43 })}>With extra time (43)</button>
            </div>
          </div>
          <button className="btn btn-primary mt-6 h-12 px-6 text-base" onClick={start}><Timer className="size-5" /> Start the mock exam</button>
        </section>
        <aside className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-amber/40 bg-amber-soft p-4 text-sm leading-relaxed text-ink">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber" />
            <p>This mock is an original practice approximation. It does not reproduce the official test, use official or leaked questions, or guarantee the real exam's topic distribution or difficulty.</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-display font-semibold text-ink">Previous attempts</h3>
            {mocks.length === 0 ? <p className="mt-2 text-sm text-ink-3">No mock attempts yet.</p> : (
              <ul className="mt-2 divide-y divide-line text-sm">
                {mocks.map(a => (
                  <li key={a.id} className="flex justify-between py-2"><span className="text-ink-2">{new Date(a.at).toLocaleString()}</span><span className={`tabular font-semibold ${a.correct / a.total >= 0.7 ? 'text-good' : 'text-amber'}`}>{Math.round((a.correct / a.total) * 100)}% · {Math.round(a.durationSec / 60)} min</span></li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
