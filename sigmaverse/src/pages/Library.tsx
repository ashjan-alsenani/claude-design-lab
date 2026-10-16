import {
  AlertTriangle, ChevronLeft, ChevronRight, FileText, FileUp, Library as LibraryIcon, Loader2, Search, Trash2, X, ZoomIn, ZoomOut,
} from 'lucide-react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Disclosure, PageHeader, StatusBadge } from '../components/ui'
import { loadAllLessons } from '../data/curriculum'
import { glossary } from '../data/glossaryIndex'
import { COVERAGE, MISSING_SOURCE_NOTE, SOURCE_DOCS } from '../data/sources'
import type { Lesson, SourceId } from '../data/types'
import { addPdf, listDocs, openDoc, pageTexts, removeDoc, storageEstimate, type LibraryDoc } from '../lib/pdf'

const fmtSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`)

export default function Library() {
  const [params, setParams] = useSearchParams()
  const [docs, setDocs] = useState<LibraryDoc[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [startPage, setStartPage] = useState(1)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null)
  const pendingSource = useRef<SourceId | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => { setDocs(await listDocs()); setEst(await storageEstimate()) }, [])
  useEffect(() => { refresh(); loadAllLessons().then(setLessons) }, [refresh])

  // Deep link from a lesson: /library?source=gb-501-600&page=505
  const wantSource = params.get('source') as SourceId | null
  const wantPage = Number(params.get('page')) || 1
  useEffect(() => {
    if (!wantSource) return
    const d = docs.find(x => x.sourceId === wantSource)
    if (d) { setOpenId(d.id); setStartPage(pageInFile(wantSource, wantPage)) }
  }, [wantSource, wantPage, docs])

  const pick = (source: SourceId | null) => { pendingSource.current = source; setError(null); setWarning(null); fileInput.current?.click() }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    const source = pendingSource.current
    setBusy(source ?? 'upload')
    try {
      const entry = await addPdf(f, source ? 'supplied' : 'upload', source ?? undefined)
      const expected = SOURCE_DOCS.find(s => s.id === source)?.pageCount
      if (source && expected && expected !== entry.pageCount) setWarning(`"${f.name}" has ${entry.pageCount} pages but the supplied file had ${expected}. Page references may not line up.`)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? `Could not add this PDF: ${e.message}` : 'Could not add this PDF. It may be damaged or password protected, or browser storage may be full.')
    } finally {
      setBusy(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const openDocMeta = docs.find(d => d.id === openId)
  const supplied = SOURCE_DOCS.filter(s => s.id !== 'supplementary')
  const uploads = docs.filter(d => d.kind === 'upload')

  return (
    <div>
      <PageHeader icon={<LibraryIcon className="size-5" />} title="Reference Library" lead="The documents used to build this academy, the source coverage matrix, and a private PDF reader for your own copies and any additional PDFs you want to study alongside the lessons." />
      <input ref={fileInput} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
      {error && <div className="mb-4 flex items-start gap-2 rounded-2xl bg-bad-soft p-4 text-sm text-ink" role="alert"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-bad" />{error}</div>}
      {warning && <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-soft p-4 text-sm text-ink" role="status"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" />{warning}</div>}

      {openDocMeta && (
        <Viewer key={openDocMeta.id} doc={openDocMeta} initialPage={startPage} lessons={lessons} onClose={() => { setOpenId(null); if (params.has('source')) { params.delete('source'); params.delete('page'); setParams(params, { replace: true }) } }} />
      )}

      <section className="mt-2">
        <h2 className="font-display text-2xl font-semibold text-ink">Supplied during development</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2">
          These six files were read and mapped while the academy was built. The PDFs are copyrighted and large, so they are not redistributed with the app. If you own a copy, load it here: it stays in this browser only, and lesson "Open in Reference Library" links will jump to the cited page.
        </p>
        <div className="mt-3 rounded-2xl border border-amber/40 bg-amber-soft p-4 text-sm leading-relaxed text-ink"><span className="font-semibold">Coverage gap: </span>{MISSING_SOURCE_NOTE}</div>
        {wantSource && !docs.some(d => d.sourceId === wantSource) && (
          <div className="mt-3 rounded-2xl border border-violet/40 bg-violet-soft p-4 text-sm text-ink">A lesson linked to page {wantPage} of <strong>{SOURCE_DOCS.find(s => s.id === wantSource)?.title}</strong>. Load your copy of that file below to open the page.</div>
        )}
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {supplied.map(s => {
            const mine = docs.find(d => d.sourceId === s.id)
            return (
              <li key={s.id} className={`flex flex-col rounded-2xl border bg-surface p-5 ${wantSource === s.id ? 'border-violet ring-2 ring-violet/20' : 'border-line'}`}>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-soft text-sky"><FileText className="size-5" /></span>
                  <div className="min-w-0">
                    <div className="font-semibold leading-snug text-ink">{s.title}</div>
                    <div className="text-xs text-ink-3">{s.publisher} · {s.file}{s.id !== 'syllabus' ? ` · printed pages ${s.printedPages}` : ''}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-2"><span className="font-semibold text-ink">Role: </span>{s.role}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2"><span className="font-semibold text-ink">Define content: </span>{s.defineContent}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  {mine ? (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => { setOpenId(mine.id); setStartPage(1) }}>Open your copy</button>
                      <span className="text-xs text-ink-3">{mine.pageCount} pages · {fmtSize(mine.size)}</span>
                      <button className="btn btn-ghost btn-sm btn-icon ml-auto" onClick={async () => { await removeDoc(mine.id); if (openId === mine.id) setOpenId(null); refresh() }} aria-label="Remove your copy"><Trash2 className="size-4" /></button>
                    </>
                  ) : (
                    <button className="btn btn-soft btn-sm" onClick={() => pick(s.id)} disabled={!!busy}>{busy === s.id ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />} Load my copy</button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Your uploaded PDFs</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-2">Add any other PDF to read and search here. Uploaded files are yours: they never change lesson explanations, questions or citations, because there is no ingestion or reconciliation workflow. Related lessons are suggested by simple keyword matching against glossary terms.</p>
          </div>
          <button className="btn btn-primary" onClick={() => pick(null)} disabled={!!busy}>{busy === 'upload' ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />} Upload a PDF</button>
        </div>
        {uploads.length === 0 ? <p className="mt-4 rounded-2xl border border-dashed border-line-2 p-6 text-center text-sm text-ink-3">No uploaded PDFs yet.</p> : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {uploads.map(d => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <FileText className="size-5 text-ink-3" />
                <span className="min-w-0 flex-1 truncate font-medium text-ink">{d.name}</span>
                <span className="text-xs text-ink-3">{d.pageCount} pages · {fmtSize(d.size)} · added {new Date(d.addedAt).toLocaleDateString()}</span>
                <button className="btn btn-soft btn-sm" onClick={() => { setOpenId(d.id); setStartPage(1) }}>Open</button>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={async () => { await removeDoc(d.id); if (openId === d.id) setOpenId(null); refresh() }} aria-label={`Delete ${d.name}`}><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          Stored with IndexedDB in this browser{est ? ` (using ${fmtSize(est.usage)} of about ${fmtSize(est.quota)} available)` : ''}. Clearing site data, private browsing or another device will not have these files.
        </p>
      </section>

      <section className="mt-12">
        <Disclosure title="Source coverage matrix" defaultOpen={!!params.get('matrix')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead><tr className="bg-surface-2">{['Ref', 'Topic', 'Source document', 'Pages', 'Concepts', 'Definitions', 'Numerical skills', 'Figures', 'Status'].map(h => <th key={h} className="px-3 py-2.5 font-semibold text-ink">{h}</th>)}</tr></thead>
              <tbody>
                {COVERAGE.map(r => (
                  <tr key={r.lesson} className="border-t border-line align-top">
                    <td className="px-3 py-2.5 font-semibold"><Link to={`/lessons/${r.lesson}`} className="text-violet hover:underline">{r.lesson}</Link></td>
                    <td className="px-3 py-2.5 text-ink">{r.topic}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.sources}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.pages}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.concepts}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.definitions}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.numerical}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.figures}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={r.status} /><div className="mt-1 text-xs leading-relaxed text-ink-3">{r.statusNote}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-3">Book page numbers are PDF page numbers of the supplied parts (printed page = PDF page - 3). Syllabus pages are PDF pages. Learning module = the lesson with the same reference number.</p>
        </Disclosure>
      </section>
    </div>
  )
}

/** The supplied book parts were separate files; map a book PDF page to a page inside the part file. */
function pageInFile(source: SourceId, bookPdfPage: number) {
  const starts: Partial<Record<SourceId, number>> = { 'gb-101-200': 101, 'gb-201-300': 201, 'gb-301-400': 301, 'gb-401-500': 401, 'gb-501-600': 501 }
  const s = starts[source]
  return s ? Math.max(1, bookPdfPage - s + 1) : bookPdfPage
}
function bookPage(source: SourceId | undefined, filePage: number) {
  const starts: Partial<Record<SourceId, number>> = { 'gb-101-200': 101, 'gb-201-300': 201, 'gb-301-400': 301, 'gb-401-500': 401, 'gb-501-600': 501 }
  const s = source ? starts[source] : undefined
  return s ? s + filePage - 1 : filePage
}

function Viewer({ doc, initialPage, lessons, onClose }: { doc: LibraryDoc; initialPage: number; lessons: Lesson[]; onClose: () => void }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(Math.min(initialPage, doc.pageCount))
  const [scale, setScale] = useState(1.2)
  const [err, setErr] = useState<string | null>(null)
  const [texts, setTexts] = useState<string[] | null>(null)
  const [indexing, setIndexing] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const canvas = useRef<HTMLCanvasElement>(null)
  const task = useRef<RenderTask | null>(null)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    openDoc(doc.id).then(p => alive && setPdf(p)).catch(e => setErr(e.message))
    return () => { alive = false }
  }, [doc.id])
  useEffect(() => () => { pdf?.loadingTask.destroy() }, [pdf])
  useEffect(() => { wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [])

  useEffect(() => {
    if (!pdf || !canvas.current) return
    let cancelled = false
    ;(async () => {
      const pg = await pdf.getPage(page)
      if (cancelled) return
      const width = Math.min(wrap.current?.clientWidth ?? 800, 1000) - 32
      const base = pg.getViewport({ scale: 1 })
      const fit = (width / base.width) * scale
      const dpr = window.devicePixelRatio || 1
      const vp = pg.getViewport({ scale: fit * dpr })
      const c = canvas.current!
      c.width = vp.width; c.height = vp.height
      c.style.width = `${vp.width / dpr}px`; c.style.height = `${vp.height / dpr}px`
      task.current?.cancel()
      task.current = pg.render({ canvas: c, canvasContext: c.getContext('2d')!, viewport: vp })
      try { await task.current.promise } catch { /* cancelled */ }
    })()
    return () => { cancelled = true }
  }, [pdf, page, scale])

  const buildIndex = async () => {
    if (!pdf) return
    setIndexing('Extracting text...')
    try { setTexts(await pageTexts(doc.id, pdf, (d, t) => setIndexing(`Extracting text: page ${d} of ${t}`))) } catch { setErr('Text extraction failed for this file.') }
    setIndexing(null)
  }
  useEffect(() => { if (pdf && doc.textIndexed) pageTexts(doc.id, pdf).then(setTexts) }, [pdf, doc])

  const hits = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!texts || n.length < 2) return []
    const out: { page: number; snip: string }[] = []
    texts.forEach((t, i) => {
      const at = t.toLowerCase().indexOf(n)
      if (at >= 0) out.push({ page: i + 1, snip: `${at > 50 ? '...' : ''}${t.slice(Math.max(0, at - 50), at + n.length + 70)}...` })
    })
    return out.slice(0, 60)
  }, [texts, q])

  const bp = bookPage(doc.sourceId, page)
  const citing = doc.kind === 'supplied' ? lessons.filter(l => l.sources.some(s => s.source === doc.sourceId && (doc.sourceId === 'syllabus' ? s.pdfPages?.includes(page) : s.pdfPages?.includes(bp)))) : []
  const suggested = useMemo(() => {
    if (!texts) return []
    const t = (texts[page - 1] ?? '').toLowerCase()
    const counts = new Map<string, number>()
    for (const g of glossary) if (g.term.length > 3 && t.includes(g.term.toLowerCase())) counts.set(g.lesson, (counts.get(g.lesson) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => lessons.find(l => l.id === id)).filter(Boolean) as Lesson[]
  }, [texts, page, lessons])

  return (
    <section ref={wrap} className="mb-10 scroll-mt-20 overflow-hidden rounded-3xl border border-line bg-surface shadow-lg">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="min-w-0 flex-1 truncate font-semibold text-ink">{doc.name} <span className="font-normal text-ink-3">· {doc.kind === 'supplied' ? 'your copy of a development source' : 'uploaded by you'}</span></span>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))} aria-label="Zoom out"><ZoomOut className="size-4" /></button>
        <span className="tabular w-12 text-center text-xs font-semibold text-ink-2">{Math.round(scale * 100)}%</span>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))} aria-label="Zoom in"><ZoomIn className="size-4" /></button>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} aria-label="Close viewer"><X className="size-4" /></button>
      </div>
      <div className="grid lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 border-line lg:border-r">
          <div className="flex items-center justify-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
            <button className="btn btn-soft btn-sm btn-icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
            <label className="flex items-center gap-2 text-sm text-ink-2">Page <input className="field tabular w-20 py-1 text-center" type="number" min={1} max={doc.pageCount} value={page} onChange={e => setPage(Math.max(1, Math.min(doc.pageCount, e.target.valueAsNumber || 1)))} aria-label="Page number" /> of {doc.pageCount}</label>
            <button className="btn btn-soft btn-sm btn-icon" onClick={() => setPage(p => Math.min(doc.pageCount, p + 1))} disabled={page >= doc.pageCount} aria-label="Next page"><ChevronRight className="size-4" /></button>
            {doc.sourceId && doc.sourceId !== 'syllabus' && <span className="tabular hidden text-xs text-ink-3 sm:inline">book PDF page {bp} · printed {bp - 3}</span>}
          </div>
          <div className="max-h-[78vh] overflow-auto bg-surface-3 p-4">
            {err ? <p className="text-sm text-bad">{err}</p> : !pdf ? <div className="mx-auto aspect-[3/4] max-w-xl animate-pulse rounded bg-surface-2" /> : <canvas ref={canvas} className="mx-auto block bg-white shadow-md" />}
          </div>
        </div>
        <aside className="space-y-5 p-4">
          <div>
            <div className="text-sm font-semibold text-ink">Search this PDF</div>
            {!texts ? (
              <button className="btn btn-soft btn-sm mt-2" onClick={buildIndex} disabled={!pdf || !!indexing}>{indexing ? <><Loader2 className="size-4 animate-spin" /> {indexing}</> : <><Search className="size-4" /> Extract text to search</>}</button>
            ) : (
              <>
                <input className="field mt-2" placeholder="Search extracted text" value={q} onChange={e => setQ(e.target.value)} aria-label="Search PDF text" />
                <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto">
                  {q.trim().length >= 2 && hits.length === 0 && <li className="text-xs text-ink-3">No matches. Scanned pages without a text layer cannot be searched.</li>}
                  {hits.map(h => <li key={h.page}><button className="w-full rounded-lg px-2 py-1.5 text-left text-xs hover:bg-surface-2" onClick={() => setPage(h.page)}><span className="font-semibold text-violet">p.{h.page} </span><span className="text-ink-2">{h.snip}</span></button></li>)}
                </ul>
              </>
            )}
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">Text is extracted on your device with PDF.js. Nothing is uploaded.</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Related learning modules</div>
            {doc.kind === 'supplied' ? (
              citing.length ? <ul className="mt-2 space-y-1">{citing.map(l => <li key={l.id}><Link to={`/lessons/${l.id}#sources`} className="text-sm text-violet hover:underline">{l.id} {l.title}</Link></li>)}</ul>
                : <p className="mt-1 text-xs text-ink-3">No lesson cites this exact page.</p>
            ) : texts ? (
              suggested.length ? <ul className="mt-2 space-y-1">{suggested.map(l => <li key={l.id}><Link to={`/lessons/${l.id}`} className="text-sm text-violet hover:underline">{l.id} {l.title}</Link></li>)}</ul> : <p className="mt-1 text-xs text-ink-3">No glossary terms found on this page.</p>
            ) : <p className="mt-1 text-xs text-ink-3">Extract the text to get keyword-based suggestions.</p>}
          </div>
        </aside>
      </div>
    </section>
  )
}
