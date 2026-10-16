import { Calculator, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tex } from '../components/Math'
import { PageHeader, Section } from '../components/ui'
import { FORMULAS } from '../data/formulas'
import { useProfile } from '../lib/store'

export default function Formulas() {
  const stats = useProfile(p => p.formulas)
  const core = FORMULAS.filter(f => !f.supplementary)
  const supp = FORMULAS.filter(f => f.supplementary)
  const card = (f: (typeof FORMULAS)[number]) => {
    const s = stats[f.id]
    return (
      <Link key={f.id} to={`/formulas/${f.id}`} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-semibold text-ink">{f.name}</span>
          <span className="chip">{f.short}</span>
        </div>
        <div className="my-4 overflow-x-auto rounded-xl bg-surface-2 px-3 py-3 text-center text-ink"><Tex tex={f.tex} /></div>
        <div className="mt-auto flex items-center justify-between text-xs text-ink-3">
          <span>Lesson {f.lesson}</span>
          {s ? <span className="flex items-center gap-1 font-semibold text-ink-2"><CheckCircle2 className="size-3.5 text-good" /> {s.correct}/{s.attempts} correct{s.best ? ` · best: ${s.best}` : ''}</span> : <span>Not practised yet</span>}
        </div>
      </Link>
    )
  }
  return (
    <div>
      <PageHeader icon={<Calculator className="size-5" />} title="Formula Master" lead="Every calculation in the Define syllabus, each with its own screen: the formula, what every variable means, when to use it, an animated substitution, the classic exam trap, and unlimited generated practice from Beginner to Master Challenge with mistake detection." />
      <div className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-2 md:grid-cols-3">
        <p><span className="font-semibold text-ink">Total units</span> are items inspected. <span className="font-semibold text-ink">Defective units</span> are units with at least one defect.</p>
        <p><span className="font-semibold text-ink">Total defects</span> counts every defect, so it can exceed the number of defective units.</p>
        <p><span className="font-semibold text-ink">Total opportunities</span> = units x opportunities per unit. It is the denominator of DPO and DPMO.</p>
      </div>
      <Section title="Define syllabus calculations" className="mt-0">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{core.map(card)}</div>
      </Section>
      <Section title="Supplementary comparisons">
        <p className="-mt-2 mb-4 flex items-center gap-2 text-sm text-ink-2"><Sparkles className="size-4 text-amber" /> Not explicitly part of the Define syllabus section, included because exam questions and real projects often compare them.</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{supp.map(card)}</div>
      </Section>
    </div>
  )
}
