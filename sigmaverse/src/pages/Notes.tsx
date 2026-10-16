import { Bookmark, Download, NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { QuestionCard } from '../components/QuestionCard'
import { Empty, PageHeader, Segmented } from '../components/ui'
import { LESSONS, lessonMeta } from '../data/curriculum'
import { getQuestion } from '../data/questions'
import type { LessonId } from '../data/types'
import { uid, update, useProfile } from '../lib/store'

export default function Notes() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'notes' | 'paragraphs' | 'questions'>((params.get('tab') as 'questions') ?? 'notes')
  const notes = useProfile(p => p.notes)
  const bookmarks = useProfile(p => p.bookmarks)
  const [draft, setDraft] = useState('')
  const [draftLesson, setDraftLesson] = useState<LessonId | ''>('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const paragraphs = bookmarks.filter(b => b.kind === 'paragraph')
  const questions = bookmarks.filter(b => b.kind === 'question')

  const exportNotes = () => {
    const text = notes.map(n => `${n.lesson ? `[Lesson ${n.lesson}] ` : ''}${new Date(n.at).toLocaleString()}\n${n.quote ? `> ${n.quote}\n` : ''}${n.text}\n`).join('\n')
    const url = URL.createObjectURL(new Blob([`SigmaVerse notes\n\n${text}`], { type: 'text/plain' }))
    const a = document.createElement('a'); a.href = url; a.download = 'sigmaverse-notes.txt'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader icon={<NotebookPen className="size-5" />} title="My Notes" lead="Your personal notes, highlighted paragraphs and bookmarked questions. They are stored in this browser only.">
        {notes.length > 0 && <button className="btn btn-soft btn-sm" onClick={exportNotes}><Download className="size-4" /> Export notes</button>}
      </PageHeader>
      <Segmented label="Notes view" value={tab} onChange={setTab} options={[{ value: 'notes', label: `Notes (${notes.length})` }, { value: 'paragraphs', label: `Highlights (${paragraphs.length})` }, { value: 'questions', label: `Questions (${questions.length})` }]} />

      <div className="mt-6">
        {tab === 'notes' && (
          <>
            <form className="mb-6 rounded-2xl border border-line bg-surface p-4" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; update(p => { p.notes.unshift({ id: uid(), lesson: draftLesson || undefined, text: draft.trim(), at: Date.now(), updatedAt: Date.now() }) }); setDraft('') }}>
              <label className="label" htmlFor="new-note">New note</label>
              <textarea id="new-note" className="field min-h-24" value={draft} onChange={e => setDraft(e.target.value)} placeholder="A rule you want to remember, a question to ask your trainer..." />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select className="field w-auto" value={draftLesson} onChange={e => setDraftLesson(e.target.value as LessonId | '')} aria-label="Link note to a lesson">
                  <option value="">Not linked to a lesson</option>
                  {LESSONS.map(l => <option key={l.id} value={l.id}>{l.id} {l.short}</option>)}
                </select>
                <button className="btn btn-primary btn-sm ml-auto" type="submit" disabled={!draft.trim()}><Plus className="size-4" /> Save note</button>
              </div>
            </form>
            {notes.length === 0 ? <Empty icon={<NotebookPen className="size-6" />} title="No notes yet">Write one above, or hover any lesson paragraph and choose Add note.</Empty> : (
              <ul className="space-y-3">
                {notes.map(n => (
                  <li key={n.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                      {n.lesson && <Link to={`/lessons/${n.lesson}${n.anchor ? `#${n.anchor}` : ''}`} className="chip hover:text-violet">Lesson {n.lesson} {lessonMeta(n.lesson).short}</Link>}
                      <span>{new Date(n.updatedAt).toLocaleString()}</span>
                      <div className="ml-auto flex gap-1">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditing(n.id); setEditText(n.text) }} aria-label="Edit note"><Pencil className="size-4" /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { if (window.confirm('Delete this note?')) update(p => { p.notes = p.notes.filter(x => x.id !== n.id) }) }} aria-label="Delete note"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                    {n.quote && <blockquote className="mt-2 border-l-2 border-line-2 pl-3 font-serif text-sm italic leading-relaxed text-ink-3">{n.quote}</blockquote>}
                    {editing === n.id ? (
                      <div className="mt-2">
                        <textarea className="field min-h-24" value={editText} onChange={e => setEditText(e.target.value)} aria-label="Edit note text" autoFocus />
                        <div className="mt-2 flex justify-end gap-2"><button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { update(p => { const x = p.notes.find(y => y.id === n.id); if (x) { x.text = editText.trim() || x.text; x.updatedAt = Date.now() } }); setEditing(null) }}>Save</button></div>
                      </div>
                    ) : <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{n.text}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {tab === 'paragraphs' && (paragraphs.length === 0 ? <Empty icon={<Bookmark className="size-6" />} title="No highlighted paragraphs">Hover a paragraph in any lesson and choose Bookmark to highlight it and keep it here.</Empty> : (
          <ul className="space-y-2">
            {paragraphs.map(b => (
              <li key={b.id} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="mt-1 h-10 w-1 shrink-0 rounded-full bg-amber" aria-hidden />
                <Link to={`/lessons/${b.lesson}#${b.ref}`} className="flex-1"><span className="text-xs font-semibold text-ink-3">Lesson {b.lesson}</span><span className="mt-0.5 block font-serif leading-relaxed text-ink">{b.label}{b.label.length >= 140 ? '...' : ''}</span></Link>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => update(p => { p.bookmarks = p.bookmarks.filter(x => x.id !== b.id) })} aria-label="Remove highlight"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        ))}
        {tab === 'questions' && (questions.length === 0 ? <Empty icon={<Bookmark className="size-6" />} title="No bookmarked questions">Use the bookmark icon on any question to save it for review.</Empty> : (
          <div className="space-y-4">{questions.map(b => { const q = getQuestion(b.ref); return q ? <QuestionCard key={b.id} q={q} /> : null })}</div>
        ))}
      </div>
    </div>
  )
}
