import { CheckCircle2, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, Section } from '../components/ui'
import { TONE } from '../data/curriculum'
import { LABS } from '../labs/registry'
import { useProfile } from '../lib/store'

export default function Labs() {
  const labs = useProfile(p => p.labs)
  const card = (l: (typeof LABS)[number], big: boolean) => (
    <Link key={l.key} to={`/labs/${l.key}`} className={`group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-2 ${big ? '' : ''}`}>
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${TONE[l.tone].soft} ${TONE[l.tone].text}`}><FlaskConical className="size-5" /></span>
        <span className="text-xs font-semibold text-ink-3">Lesson {l.lesson}</span>
        {labs[l.key] && <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-good"><CheckCircle2 className="size-4" /> Completed{labs[l.key]?.challenge ? ` · best ${labs[l.key]?.challenge}` : ''}</span>}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink">{l.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">{l.blurb}</p>
    </Link>
  )
  return (
    <div>
      <PageHeader icon={<FlaskConical className="size-5" />} title="Interactive Labs" lead="Working simulations with real calculations. Every lab has an Explore mode with a realistic scenario, a Challenge mode and a short knowledge check. A lab counts as completed when you finish its challenge or knowledge check." />
      <Section title="Signature labs" className="mt-0">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{LABS.filter(l => l.core).map(l => card(l, true))}</div>
      </Section>
      <Section title="More practice labs">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{LABS.filter(l => !l.core).map(l => card(l, false))}</div>
      </Section>
    </div>
  )
}
