import { AlertTriangle, Brain, Info, Lightbulb, NotebookPen, Bookmark, BookmarkCheck, Sparkles, FlaskConical } from 'lucide-react'
import { Suspense, useState, type ReactNode } from 'react'
import type { Block, LessonId } from '../data/types'
import { Rich } from './Rich'
import { Tex } from './Math'
import { Disclosure } from './ui'
import { Diagram } from '../diagrams/Diagram'
import { labMeta } from '../labs/registry'
import { update, uid, useProfile } from '../lib/store'
import { Link } from 'react-router-dom'

const CALLOUT: Record<string, { icon: ReactNode; cls: string; label: string }> = {
  tip: { icon: <Lightbulb className="size-4" />, cls: 'bg-teal-soft text-teal', label: 'Tip' },
  trap: { icon: <AlertTriangle className="size-4" />, cls: 'bg-coral-soft text-coral', label: 'Exam trap' },
  note: { icon: <Info className="size-4" />, cls: 'bg-sky-soft text-sky', label: 'Note' },
  supplementary: { icon: <Sparkles className="size-4" />, cls: 'bg-amber-soft text-amber', label: 'Supplementary content' },
  memory: { icon: <Brain className="size-4" />, cls: 'bg-violet-soft text-violet', label: 'Memory hook' },
}

export function Callout({ tone, title, children }: { tone: string; title: string; children: ReactNode }) {
  const c = CALLOUT[tone] ?? CALLOUT.note
  return (
    <aside className={`my-6 rounded-2xl border border-line bg-surface p-4 font-sans shadow-sm sm:p-5`}>
      <div className="flex items-center gap-2">
        <span className={`grid size-7 place-items-center rounded-lg ${c.cls}`}>{c.icon}</span>
        <span className="text-xs font-semibold text-ink-3">{c.label}</span>
      </div>
      <div className="mt-2 font-display text-[1.02rem] font-semibold text-ink">{title}</div>
      <div className="mt-1.5 text-[0.97rem] leading-relaxed text-ink-2">{children}</div>
    </aside>
  )
}

export function RichTable({ head, rows, caption }: { head: string[]; rows: string[][]; caption?: string }) {
  return (
    <figure className="my-6 font-sans">
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[520px] border-collapse text-left text-[0.92rem]">
          <thead>
            <tr className="bg-surface-2">
              {head.map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-semibold text-ink">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line align-top">
                {r.map((c, j) => <td key={j} className={`px-4 py-3 leading-relaxed ${j === 0 ? 'font-medium text-ink' : 'text-ink-2'}`}><Rich text={String(c)} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-sm text-ink-3">{caption}</figcaption>}
    </figure>
  )
}

export function InlineLab({ lab, prompt }: { lab: Parameters<typeof labMeta>[0]; prompt: string }) {
  const meta = labMeta(lab)
  if (!meta) return null
  const C = meta.component
  return (
    <div className="my-8 font-sans">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-violet-soft text-violet"><FlaskConical className="size-4" /></span>
        <span className="font-display text-lg font-semibold text-ink">{meta.title}</span>
        <Link to={`/labs/${meta.key}`} className="ml-auto text-sm font-semibold text-violet hover:underline">Open full screen</Link>
      </div>
      <p className="mb-4 text-[0.97rem] leading-relaxed text-ink-2"><Rich text={prompt} /></p>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-3" />}>
        <C embedded />
      </Suspense>
    </div>
  )
}

function Paragraph({ text, anchor, lesson }: { text: string; anchor?: string; lesson?: LessonId }) {
  const marked = useProfile(p => (anchor ? p.bookmarks.some(b => b.ref === anchor) : false))
  const [noting, setNoting] = useState(false)
  const [draft, setDraft] = useState('')
  if (!anchor || !lesson) return <p><Rich text={text} /></p>
  const toggle = () => update(p => {
    const i = p.bookmarks.findIndex(b => b.ref === anchor)
    if (i >= 0) p.bookmarks.splice(i, 1)
    else p.bookmarks.push({ id: uid(), kind: 'paragraph', lesson, ref: anchor, label: text.replace(/[*[\]`$]/g, '').slice(0, 140), at: Date.now() })
  })
  const save = () => {
    if (!draft.trim()) { setNoting(false); return }
    update(p => { p.notes.unshift({ id: uid(), lesson, anchor, quote: text.replace(/[*[\]`$]/g, '').slice(0, 220), text: draft.trim(), at: Date.now(), updatedAt: Date.now() }) })
    setDraft(''); setNoting(false)
  }
  return (
    <div id={anchor} className="group relative scroll-mt-28">
      <p className={marked ? 'rounded-md bg-amber-soft/70 -mx-2 px-2' : ''}><Rich text={text} /></p>
      <div className="no-print absolute -right-12 top-0 hidden flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 xl:flex">
        <button onClick={toggle} className="btn btn-ghost btn-icon btn-sm" aria-label={marked ? 'Remove bookmark' : 'Bookmark and highlight paragraph'} title={marked ? 'Remove bookmark' : 'Bookmark and highlight'}>
          {marked ? <BookmarkCheck className="size-4 text-amber" /> : <Bookmark className="size-4" />}
        </button>
        <button onClick={() => setNoting(n => !n)} className="btn btn-ghost btn-icon btn-sm" aria-label="Add a note to this paragraph" title="Add note"><NotebookPen className="size-4" /></button>
      </div>
      <div className="no-print -mt-2 mb-3 flex gap-3 xl:hidden">
        <button onClick={toggle} className="text-xs font-semibold text-ink-3 hover:text-violet">{marked ? 'Bookmarked' : 'Bookmark'}</button>
        <button onClick={() => setNoting(n => !n)} className="text-xs font-semibold text-ink-3 hover:text-violet">Add note</button>
      </div>
      {noting && (
        <div className="mb-5 rounded-xl border border-line bg-surface p-3 font-sans">
          <label className="label" htmlFor={`${anchor}-note`}>Your note on this paragraph</label>
          <textarea id={`${anchor}-note`} className="field min-h-24" value={draft} onChange={e => setDraft(e.target.value)} autoFocus placeholder="What do you want to remember?" />
          <div className="mt-2 flex justify-end gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setNoting(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save note</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Blocks({ blocks, anchorBase, lesson }: { blocks: Block[]; anchorBase?: string; lesson?: LessonId }) {
  return (
    <>
      {blocks.map((b, i) => {
        const key = `${anchorBase ?? 'b'}-${i}`
        switch (b.kind) {
          case 'p': return <Paragraph key={key} text={b.text} anchor={anchorBase ? key : undefined} lesson={lesson} />
          case 'h': return <h3 key={key}>{b.text}</h3>
          case 'list': {
            const L = b.ordered ? 'ol' : 'ul'
            return <L key={key}>{b.items.map((it, j) => <li key={j}><Rich text={it} /></li>)}</L>
          }
          case 'callout': return <Callout key={key} tone={b.tone} title={b.title}><Rich text={b.text} /></Callout>
          case 'formula': return (
            <figure key={key} className="my-6 rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-2 px-4 py-5 text-center shadow-sm">
              <Tex tex={b.tex} block className="text-lg text-ink" />
              {b.caption && <figcaption className="mt-2 font-sans text-sm text-ink-3"><Rich text={b.caption} /></figcaption>}
            </figure>
          )
          case 'table': return <RichTable key={key} head={b.head} rows={b.rows} caption={b.caption} />
          case 'advanced': return <div key={key} className="my-6 font-sans"><Disclosure title={b.title} icon={<Sparkles className="size-4" />}><div className="prose-reading text-[0.98rem]"><Blocks blocks={b.blocks} /></div></Disclosure></div>
          case 'example': return <div key={key} className="my-6 font-sans"><Disclosure title={b.title} icon={<Lightbulb className="size-4" />} tone="teal"><div className="prose-reading text-[0.98rem]"><Blocks blocks={b.blocks} /></div></Disclosure></div>
          case 'diagram': return <div key={key} className="my-8 font-sans"><Diagram k={b.diagram} caption={b.caption} /></div>
          case 'lab': return <InlineLab key={key} lab={b.lab} prompt={b.prompt} />
          default: return null
        }
      })}
    </>
  )
}
