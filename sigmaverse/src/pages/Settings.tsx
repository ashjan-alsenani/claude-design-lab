import { Download, Settings as SettingsIcon, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PageHeader, Segmented } from '../components/ui'
import { exportProfile, importProfile, isStorageAvailable, resetProfile, setSettings, useProfile } from '../lib/store'

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md"><div className="font-semibold text-ink">{title}</div>{desc && <div className="mt-0.5 text-sm leading-relaxed text-ink-3">{desc}</div>}</div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const s = useProfile(p => p.settings)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const speech = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!speech) return
    const load = () => setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')))
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [speech])

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportProfile()], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = `sigmaverse-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader icon={<SettingsIcon className="size-5" />} title="Settings" lead="Reading, motion and study preferences, plus your learning data." />
      <section className="rounded-3xl border border-line bg-surface px-6 shadow-sm">
        <div className="divide-y divide-line">
          <Row title="Theme"><Segmented label="Theme" value={s.theme} onChange={v => setSettings({ theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></Row>
          <Row title="Motion" desc="System follows your operating system's reduced-motion setting. Reduced shows every animation's final state instantly."><Segmented label="Motion" value={s.motion} onChange={v => setSettings({ motion: v })} options={[{ value: 'system', label: 'System' }, { value: 'full', label: 'Full' }, { value: 'reduced', label: 'Reduced' }]} /></Row>
          <Row title="Animation speed" desc="Applies to diagrams, simulations and step-by-step demonstrations."><Segmented label="Animation speed" value={s.speed} onChange={v => setSettings({ speed: v })} options={[0.5, 1, 1.5, 2].map(v => ({ value: v, label: `${v}x` }))} /></Row>
          <Row title="Reading font"><Segmented label="Reading font" value={s.readingFont} onChange={v => setSettings({ readingFont: v })} options={[{ value: 'serif', label: 'Literata (serif)' }, { value: 'sans', label: 'Figtree (sans)' }]} /></Row>
          <Row title="Reading text size" desc={`${Math.round(s.fontScale * 100)}% of the default size.`}><input type="range" min={0.85} max={1.35} step={0.05} value={s.fontScale} onChange={e => setSettings({ fontScale: Number(e.target.value) })} className="w-48 accent-[var(--violet)]" aria-label="Reading text size" /></Row>
          <Row title="Read-aloud voice" desc={speech ? 'Uses voices built into your browser and operating system. No audio is sent anywhere.' : 'Your browser does not support speech synthesis, so read-aloud is unavailable.'}>
            <select className="field w-64" disabled={!speech || voices.length === 0} value={s.voiceURI ?? ''} onChange={e => setSettings({ voiceURI: e.target.value || undefined })} aria-label="Read-aloud voice">
              <option value="">Default English voice</option>
              {voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
            </select>
          </Row>
          <Row title="Daily study goal"><select className="field w-40" value={s.dailyGoalMinutes} onChange={e => setSettings({ dailyGoalMinutes: Number(e.target.value) })} aria-label="Daily goal">{[15, 30, 45, 60, 90, 120, 180, 240].map(m => <option key={m} value={m}>{m} minutes</option>)}</select></Row>
          <Row title="Mock exam duration" desc="34 minutes is proportional to the official 180 minutes for 100 questions."><input type="number" className="field tabular w-28" min={5} max={120} value={s.mockMinutes} onChange={e => setSettings({ mockMinutes: Math.max(5, Math.min(120, e.target.valueAsNumber || 34)) })} aria-label="Mock exam minutes" /></Row>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-ink">Your learning data</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Progress, notes, bookmarks, flashcard schedules and settings are saved in this browser's local storage{isStorageAvailable() ? '' : ' (currently unavailable, so changes will not survive a reload)'}. PDFs you add to the library use IndexedDB. Nothing is sent to a server, so clearing site data, using private browsing or switching device starts you fresh. Export a backup to move your progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-soft" onClick={download}><Download className="size-4" /> Export progress</button>
          <button className="btn btn-soft" onClick={() => file.current?.click()}><Upload className="size-4" /> Import backup</button>
          <button className="btn btn-ghost text-bad" onClick={() => { if (window.confirm('Reset all progress, notes, bookmarks and flashcard history? Settings are kept. This cannot be undone.')) { resetProfile(); setMsg('Progress reset.') } }}><Trash2 className="size-4" /> Reset progress</button>
        </div>
        <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setMsg(importProfile(await f.text()) ? 'Backup imported.' : 'That file is not a SigmaVerse backup.'); e.target.value = '' }} />
        {msg && <p className="mt-3 text-sm font-semibold text-ink" role="status">{msg}</p>}
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-6 text-sm leading-relaxed text-ink-2 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-ink">About SigmaVerse</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>An independent self-study application for the Define Phase of the IASSC Lean Six Sigma Green Belt syllabus (PeopleCert). It is not affiliated with or endorsed by IASSC or PeopleCert.</li>
          <li>All practice questions are original educational items, not official or leaked exam questions.</li>
          <li>Recommendations and mastery estimates are rule-based calculations on your own activity. The app contains no AI service.</li>
          <li>Lessons marked Supplementary or Partly source supported contain original explanations beyond the supplied sources, as shown in each lesson's Source references.</li>
        </ul>
      </section>
    </div>
  )
}
