import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import type { DiagramKey } from '../data/types'
import { Rich } from '../components/Rich'
import { useReduced } from '../lib/motion'
import { setSettings, useProfile } from '../lib/store'

export interface DiagramView { steps: string[]; title: string; View: ComponentType<{ step: number }> }

const LOADERS: Record<DiagramKey, () => Promise<DiagramView>> = {
  'sigma-curve': () => import('./basics').then(m => m.sigmaCurve),
  timeline: () => import('./basics').then(m => m.timeline),
  dmaic: () => import('./basics').then(m => m.dmaic),
  yfx: () => import('./basics').then(m => m.yfx),
  voices: () => import('./basics').then(m => m.voices),
  roles: () => import('./basics').then(m => m.roles),
  process: () => import('./fundamentals').then(m => m.processMap),
  'ctq-tree': () => import('./fundamentals').then(m => m.ctqTree),
  'copq-iceberg': () => import('./fundamentals').then(m => m.iceberg),
  pareto: () => import('./fundamentals').then(m => m.paretoDiagram),
  'dpmo-flow': () => import('./fundamentals').then(m => m.dpmoFlow),
  charter: () => import('./projects').then(m => m.charter),
  'metric-ladder': () => import('./projects').then(m => m.metricLadder),
  benefits: () => import('./projects').then(m => m.benefits),
  'lean-flow': () => import('./lean').then(m => m.leanFlow),
  'lean-history': () => import('./lean').then(m => m.leanHistory),
  'lean-vs-sigma': () => import('./lean').then(m => m.leanVsSigma),
  wastes: () => import('./lean').then(m => m.wastes),
  fives: () => import('./lean').then(m => m.fives),
}

const SPEEDS = [0.5, 1, 1.5, 2]

export function Diagram({ k, caption, title }: { k: DiagramKey; caption?: string; title?: string }) {
  const [view, setView] = useState<DiagramView | null>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reduced = useReduced()
  const speed = useProfile(p => p.settings.speed)
  const ref = useRef<HTMLElement>(null)
  const started = useRef(false)

  useEffect(() => { LOADERS[k]().then(setView) }, [k])

  // Start playing the first time the diagram scrolls into view (never with reduced motion).
  useEffect(() => {
    if (!view || reduced || !ref.current) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) { started.current = true; setPlaying(true) }
    }, { threshold: 0.45 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [view, reduced])

  useEffect(() => {
    if (!playing || !view) return
    if (step >= view.steps.length - 1) { setPlaying(false); return }
    const t = window.setTimeout(() => setStep(s => s + 1), 3200 / speed)
    return () => window.clearTimeout(t)
  }, [playing, step, view, speed])

  if (!view) return <div className="aspect-[2/1] w-full animate-pulse rounded-3xl bg-surface-3" aria-label="Loading diagram" />
  const last = view.steps.length - 1
  const { View } = view

  return (
    <figure ref={ref} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <figcaption className="font-display text-[1.02rem] font-semibold text-ink">{title ?? view.title}</figcaption>
        <span className="tabular text-xs font-semibold text-ink-3">Step {step + 1} of {view.steps.length}</span>
      </div>
      <div className="relative bg-[radial-gradient(ellipse_at_top,var(--surface-2),var(--surface)_70%)] px-2 py-3 sm:px-4">
        <View step={step} />
      </div>
      <div className="border-t border-line px-4 py-3 sm:px-5" aria-live="polite">
        <p className="min-h-[3rem] text-[0.95rem] leading-relaxed text-ink"><Rich text={view.steps[step]} /></p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn btn-soft btn-sm btn-icon" onClick={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }} disabled={step === 0} aria-label="Previous step"><ChevronLeft className="size-4" /></button>
          <button className="btn btn-primary btn-sm" onClick={() => { if (step >= last) setStep(0); setPlaying(p => !p) }} aria-label={playing ? 'Pause animation' : 'Play animation'}>
            {playing ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> {step >= last ? 'Play again' : 'Play'}</>}
          </button>
          <button className="btn btn-soft btn-sm btn-icon" onClick={() => { setPlaying(false); setStep(s => Math.min(last, s + 1)) }} disabled={step === last} aria-label="Next step"><ChevronRight className="size-4" /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setStep(0); setPlaying(!reduced) }}><RotateCcw className="size-4" /> Replay</button>
          <div className="ml-auto flex items-center gap-1" role="group" aria-label="Animation speed">
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setSettings({ speed: s })} className={`rounded-md px-2 py-1 text-xs font-semibold ${speed === s ? 'bg-violet-soft text-violet' : 'text-ink-3 hover:text-ink'}`} aria-pressed={speed === s}>{s}x</button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-1" aria-hidden>
          {view.steps.map((_, i) => (
            <button key={i} tabIndex={-1} onClick={() => { setPlaying(false); setStep(i) }} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-violet' : 'bg-surface-3'}`} />
          ))}
        </div>
      </div>
      {caption && <div className="border-t border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink-2 sm:px-5"><Rich text={caption} /></div>}
    </figure>
  )
}
